import { describe, expect, it } from 'vitest';
import { weekOf } from '../src/arcade';
import { api, newPlayer } from './helpers';

const win = (difficulty: string, me = 11, opp = 5, extra: Record<string, unknown> = {}) => ({
  mode: 'match',
  difficulty,
  venue: 'xinyi',
  scoreMe: me,
  scoreOpp: opp,
  durationMs: 5 * 60_000,
  ...extra,
});

describe('小遊戲：雲端存檔', () => {
  it('沒存過是空的；存了讀得回來；沒有身分擋掉；太大的存檔擋掉', async () => {
    const t = await newPlayer('存檔王');
    expect((await api('/api/arcade/profile', { token: t })).json).toEqual({ data: null, updatedAt: null });
    const data = { records: { wins: { rookie: 3 } }, tour: { stars: { cups: 2 } } };
    const put = await api('/api/arcade/profile', { method: 'PUT', token: t, body: { data } });
    expect(put.status).toBe(200);
    const got = await api('/api/arcade/profile', { token: t });
    expect(got.json.data).toEqual(data);
    expect(got.json.updatedAt).toBe(put.json.updatedAt);

    expect((await api('/api/arcade/profile')).status).toBe(401);
    expect((await api('/api/arcade/profile', { method: 'PUT', token: t, body: { data: [1, 2] } })).json.error.code).toBe('invalid_profile');
    expect((await api('/api/arcade/profile', { method: 'PUT', token: t, body: { data: { x: 'a'.repeat(20_000) } } })).json.error.code).toBe('profile_too_large');
  });
});

describe('小遊戲：比賽結果', () => {
  it('合理的比分記錄下來，贏球依難度給分', async () => {
    const t = await newPlayer();
    expect((await api('/api/arcade/results', { token: t, body: win('pro') })).json.points).toBe(4);
    expect((await api('/api/arcade/results', { token: t, body: win('rookie', 13, 11) })).json.points).toBe(1);
    expect((await api('/api/arcade/results', { token: t, body: win('club', 7, 11) })).json.points).toBe(0);
    expect((await api('/api/arcade/results', { token: t, body: { mode: 'dink', difficulty: 'club', venue: 'arena', rallies: 40, durationMs: 60_000 } })).status).toBe(201);
  });

  it('擋掉不合規則的比分、太短的時間、亂填的欄位、沒有身分', async () => {
    const t = await newPlayer();
    const post = (body: unknown, token = t) => api('/api/arcade/results', { token, body });
    expect((await post(win('pro', 11, 10))).json.error.code).toBe('implausible_result'); // 11 分要贏 2 分
    expect((await post(win('pro', 15, 3))).json.error.code).toBe('implausible_result'); // 超過 11 只能剛好贏 2
    expect((await post(win('pro', 11, 0, { durationMs: 10_000 }))).json.error.code).toBe('implausible_result');
    expect((await post({ mode: 'dink', difficulty: 'club', venue: 'arena', rallies: 500, durationMs: 60_000 })).json.error.code).toBe('implausible_result');
    expect((await post(win('legend'))).json.error.code).toBe('invalid_difficulty');
    expect((await post(win('pro', 11, 5, { venue: 'moon' }))).json.error.code).toBe('invalid_venue');
    expect((await post(win('pro'), '')).status).toBe(401);
  });

  it('同一個 IP 一小時最多 60 場', async () => {
    const t = await newPlayer();
    const ip = '10.99.0.1';
    for (let i = 0; i < 60; i++) expect((await api('/api/arcade/results', { token: t, ip, body: win('rookie') })).status).toBe(201);
    expect((await api('/api/arcade/results', { token: t, ip, body: win('rookie') })).status).toBe(429);
  });
});

describe('小遊戲：每週排行榜', () => {
  it('依本週積分排名，顯示暱稱與自己的名次；高手榜與 Dink 榜各自計算', async () => {
    const [a, b, c] = await Promise.all([newPlayer('排行A'), newPlayer('排行B'), newPlayer('排行C')]);
    // A：贏高手 2 場＝8 分；B：贏球友 1 場＝2 分、Dink 120 拍；C：只輸球
    await api('/api/arcade/results', { token: a, body: win('pro') });
    await api('/api/arcade/results', { token: a, body: win('pro', 12, 10) });
    await api('/api/arcade/results', { token: b, body: win('club') });
    await api('/api/arcade/results', { token: b, body: { mode: 'dink', difficulty: 'club', venue: 'arena', rallies: 120, durationMs: 200_000 } });
    await api('/api/arcade/results', { token: c, body: win('pro', 3, 11) });

    const pts = await api('/api/arcade/leaderboard/points', { token: b });
    const names = pts.json.rows.map((r: { nickname: string }) => r.nickname);
    expect(names.indexOf('排行A')).toBeLessThan(names.indexOf('排行B'));
    expect(names).not.toContain('排行C'); // 沒得分不上榜
    expect(pts.json.me.value).toBe(2);
    expect(pts.json.rows.find((r: { isMe: boolean }) => r.isMe).nickname).toBe('排行B');
    expect(pts.json.resetsAt - pts.json.week).toBe(7 * 24 * 3600_000);

    const pro = await api('/api/arcade/leaderboard/pro', { token: a });
    expect(pro.json.me).toMatchObject({ value: 2 });
    const dink = await api('/api/arcade/leaderboard/dink', { token: b });
    expect(dink.json.me.value).toBe(120);

    // 沒帶身分：看得到榜，沒有自己的名次，而且可以快取
    const anon = await api('/api/arcade/leaderboard/points');
    expect(anon.json.me).toBeNull();
    expect(anon.headers.get('Cache-Control')).toContain('max-age=60');
    expect((await api('/api/arcade/leaderboard/nope')).status).toBe(404);
  });

  it('刪除球友資料時，存檔與成績一併刪除、從排行榜消失', async () => {
    const t = await newPlayer('要刪掉的');
    await api('/api/arcade/results', { token: t, body: win('pro') });
    await api('/api/arcade/profile', { method: 'PUT', token: t, body: { data: { a: 1 } } });
    await api('/api/me', { method: 'DELETE', token: t });
    const board = await api('/api/arcade/leaderboard/points');
    expect(board.json.rows.map((r: { nickname: string }) => r.nickname)).not.toContain('要刪掉的');
  });

  it('週次從台北時間週一 00:00 開始', () => {
    // 2026-10-26 是週一；台北 00:00 ＝ UTC 前一天 16:00
    const monday = Date.UTC(2026, 9, 25, 16);
    expect(weekOf(monday)).toBe(monday);
    expect(weekOf(monday - 1)).toBe(monday - 7 * 24 * 3600_000);
    expect(weekOf(monday + 6 * 24 * 3600_000)).toBe(monday);
  });
});

describe('小遊戲：緊急開關', () => {
  it('ARCADE_MODE=off 時遊戲 API 一律回 503，揪團不受影響', async () => {
    const { env } = await import('cloudflare:workers');
    const t = await newPlayer();
    (env as unknown as { ARCADE_MODE: string }).ARCADE_MODE = 'off';
    try {
      const r = await api('/api/arcade/leaderboard/points');
      expect(r.status).toBe(503);
      expect(r.json.error.code).toBe('arcade_off');
      expect((await api('/api/arcade/results', { token: t, body: win('pro') })).status).toBe(503);
      expect((await api('/api/me', { token: t })).status).toBe(200);
    } finally {
      (env as unknown as { ARCADE_MODE: string }).ARCADE_MODE = 'on';
    }
  });
});
