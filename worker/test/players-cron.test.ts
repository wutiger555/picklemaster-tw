import { describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { runDaily, runMaintenance } from '../src/cron';
import { api, newGame, newPlayer, inDays, HOUR, DAY } from './helpers';

const E = env;

describe('球友身分', () => {
  it('暱稱就能建立身分，可以改暱稱和自填 DUPR', async () => {
    const t = await newPlayer('小林');
    const me = await api('/api/me', { token: t });
    expect(me.json.player).toMatchObject({ nickname: '小林', level: '3.0' });
    const upd = await api('/api/me', { method: 'PATCH', token: t, body: { nickname: '林小林', dupr: '3.62' } });
    expect(upd.json.player).toMatchObject({ nickname: '林小林', dupr: '3.62' });
    const bad = await api('/api/me', { method: 'PATCH', token: t, body: { dupr: '9.5' } });
    expect(bad.json.error.code).toBe('invalid_dupr');
  });

  it('暱稱不能空白、不能太長', async () => {
    expect((await api('/api/players', { body: { nickname: '   ' } })).json.error.code).toBe('invalid_nickname');
    expect((await api('/api/players', { body: { nickname: '一二三四五六七八九十一二三' } })).json.error.code).toBe('invalid_nickname');
  });

  it('同一個 IP 一小時最多建立 5 個身分', async () => {
    const ip = '192.0.2.77';
    for (let i = 0; i < 5; i++) expect((await api('/api/players', { ip, body: { nickname: `x${i}` } })).status).toBe(201);
    const sixth = await api('/api/players', { ip, body: { nickname: 'x6' } });
    expect(sixth.status).toBe(429);
  });

  it('球友碼可以把身分轉到新手機，而且只能用一次', async () => {
    const old = await newPlayer('阿哲');
    const { code } = (await api('/api/me/code', { token: old, method: 'POST' })).json;
    expect(code).toMatch(/^PK-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
    const claimed = await api('/api/claim', { body: { code: code.toLowerCase().replace(/-/g, ' ') } }); // 大小寫、分隔符號都容錯
    expect(claimed.status).toBe(200);
    expect(claimed.json.player.nickname).toBe('阿哲');
    const again = await api('/api/claim', { body: { code } });
    expect(again.status).toBe(404);
    // 新手機拿到的 token 是同一個身分
    const me = await api('/api/me', { token: claimed.json.token });
    expect(me.json.player.nickname).toBe('阿哲');
  });

  it('刪除資料：取消未來的報名、候補遞補、自己開的團取消', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host, { capacity: 2 });
    const [leaver, waiter] = await Promise.all([newPlayer('要刪的人'), newPlayer('候補')]);
    await api(`/api/games/${game.id}/join`, { token: leaver, method: 'POST' });
    await api(`/api/games/${game.id}/join`, { token: waiter, method: 'POST' });
    const ownGame = await newGame(leaver, { courtId: 7 });

    expect((await api('/api/me', { method: 'DELETE', token: leaver })).status).toBe(200);
    const d = await api(`/api/games/${game.id}`, { token: waiter });
    expect(d.json.game.me.status).toBe('confirmed');
    expect(d.json.game.confirmed.map((p: any) => p.nickname)).not.toContain('要刪的人');
    const own = await api(`/api/games/${ownGame.game.id}`);
    expect(own.json.game).toMatchObject({ status: 'cancelled', cancelReason: 'host_deleted' });
    expect((await api('/api/me', { token: leaver })).status).toBe(404);
  });
});

describe('排程', () => {
  it('開打前 3 小時人數不足就自動取消；人數夠的照常', async () => {
    const [h1, h2] = await Promise.all([newPlayer(), newPlayer()]);
    const start = inDays(2);
    const lonely = await newGame(h1, { startsAt: start, minPlayers: 4 });
    const full = await newGame(h2, { startsAt: start, minPlayers: 2, courtId: 7 });
    await api(`/api/games/${full.game.id}/join`, { token: await newPlayer(), method: 'POST' });

    await runMaintenance(E, start - 4 * HOUR); // 還沒到 3 小時
    expect((await api(`/api/games/${lonely.game.id}`)).json.game.status).toBe('open');
    await runMaintenance(E, start - 3 * HOUR + 60_000);
    expect((await api(`/api/games/${lonely.game.id}`)).json.game).toMatchObject({ status: 'auto_cancelled', cancelReason: 'not_enough' });
    expect((await api(`/api/games/${full.game.id}`)).json.game.status).toBe('open');

    await runMaintenance(E, start + 3 * HOUR);
    expect((await api(`/api/games/${full.game.id}`)).json.game.status).toBe('finished');
  });

  it('每週固定團開打後，自動開好下一週，團主自動報名、原管理連結繼續有效', async () => {
    const host = await newPlayer('固定團主');
    const start = inDays(1);
    const { game, manageKey } = await newGame(host, { startsAt: start, recurWeekly: true, minPlayers: 2, courtId: 15 });
    await api(`/api/games/${game.id}/join`, { token: await newPlayer(), method: 'POST' });

    await runMaintenance(E, start - HOUR);
    let r = await E.DB.prepare(`SELECT id, starts_at FROM games WHERE series_id = ?1 ORDER BY starts_at`).bind(game.id).all<{ id: string; starts_at: number }>();
    expect(r.results).toHaveLength(1); // 還沒開打，不會先開下一場

    await runMaintenance(E, start + 10 * 60_000);
    r = await E.DB.prepare(`SELECT id, starts_at FROM games WHERE series_id = ?1 ORDER BY starts_at`).bind(game.id).all();
    expect(r.results).toHaveLength(2);
    expect(r.results[1].starts_at).toBe(start + 7 * DAY);
    const next = r.results[1].id;
    const nd = await api(`/api/games/${next}`);
    expect(nd.json.game.confirmed.map((p: any) => p.nickname)).toEqual(['固定團主']);
    const patched = await api(`/api/games/${next}`, { method: 'PATCH', headers: { 'X-Manage-Key': manageKey }, body: { note: '記得帶水' } });
    expect(patched.status).toBe(200);

    await runMaintenance(E, start + 20 * 60_000); // 再跑一次不會重複開
    r = await E.DB.prepare(`SELECT id FROM games WHERE series_id = ?1`).bind(game.id).all();
    expect(r.results).toHaveLength(2);
  });

  it('團主選擇結束固定團後就不再開下一場', async () => {
    const host = await newPlayer();
    const start = inDays(1);
    const { game } = await newGame(host, { startsAt: start, recurWeekly: true, courtId: 13 });
    await api(`/api/games/${game.id}`, { method: 'PATCH', token: host, body: { status: 'cancelled', endSeries: true } });
    await runMaintenance(E, start + HOUR);
    const r = await E.DB.prepare(`SELECT id FROM games WHERE series_id = ?1`).bind(game.id).all();
    expect(r.results).toHaveLength(1);
  });

  it('每日清理：刪除一年前的團和舊的頻率限制紀錄', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host, { courtId: 23 });
    await runDaily(E, Date.now() + 400 * DAY);
    expect((await api(`/api/games/${game.id}`)).status).toBe(404);
    const rl = await E.DB.prepare(`SELECT COUNT(*) AS n FROM rate_limits`).first<{ n: number }>();
    expect(rl?.n).toBe(0);
  });
});
