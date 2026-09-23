import { describe, expect, it } from 'vitest';
import { api, newGame, newPlayer, inDays, HOUR } from './helpers';

describe('開團', () => {
  it('團主自動佔第一個位子，並拿到管理密鑰', async () => {
    const host = await newPlayer('阿哲');
    const { game, manageKey } = await newGame(host);
    expect(game.confirmed).toHaveLength(1);
    expect(game.confirmed[0]).toMatchObject({ nickname: '阿哲', isHost: true, isMe: true });
    expect(game.court.name).toBe('台北市北投運動中心');
    expect(manageKey).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });

  it('擋掉不在站上的球場、太近的時間、超過面數的設定', async () => {
    const host = await newPlayer();
    const base = { title: '測試團', startsAt: inDays(2), capacity: 6 };
    const bad1 = await api('/api/games', { token: host, body: { ...base, courtId: 999999 } });
    expect(bad1.json.error.code).toBe('unknown_court');
    const bad2 = await api('/api/games', { token: host, body: { ...base, courtId: 8, startsAt: Date.now() + 60_000 } });
    expect(bad2.json.error.code).toBe('starts_too_soon');
    const bad3 = await api('/api/games', { token: host, body: { ...base, courtId: 9, courtsBooked: 2 } }); // 至善公園只有 1 面
    expect(bad3.json.error.code).toBe('invalid_courts_booked');
  });

  it('沒有球友身分不能開團', async () => {
    const r = await api('/api/games', { body: { courtId: 8, title: '測試團', startsAt: inDays(2), capacity: 6 } });
    expect(r.status).toBe(401);
    const forged = await api('/api/games', { token: 'v1.someone.fakesig', body: { courtId: 8, title: '測試團', startsAt: inDays(2), capacity: 6 } });
    expect(forged.status).toBe(401);
  });

  it('新球友第一週只能同時開 1 團', async () => {
    const host = await newPlayer();
    await newGame(host);
    const r = await api('/api/games', { token: host, body: { courtId: 7, title: '第二團', startsAt: inDays(4), capacity: 6 } });
    expect(r.status).toBe(409);
    expect(r.json.error.code).toBe('too_many_hosted');
  });
});

describe('報名與候補', () => {
  it('10 個人同時搶剩下的 3 個位子，剛好 3 人報名成功、7 人候補，而且順位不重複', async () => {
    const host = await newPlayer('團主');
    const { game } = await newGame(host, { capacity: 4 });
    const tokens = await Promise.all(Array.from({ length: 10 }, (_, i) => newPlayer(`球友${i}`)));
    const results = await Promise.all(tokens.map((t) => api(`/api/games/${game.id}/join`, { token: t, method: 'POST' })));
    const statuses = results.map((r) => r.json.me.status);
    expect(statuses.filter((s) => s === 'confirmed')).toHaveLength(3);
    expect(statuses.filter((s) => s === 'waitlist')).toHaveLength(7);
    const positions = results.filter((r) => r.json.me.status === 'waitlist').map((r) => r.json.me.position).sort((a, b) => a - b);
    expect(positions).toEqual([1, 2, 3, 4, 5, 6, 7]);

    const detail = await api(`/api/games/${game.id}`);
    expect(detail.json.game.confirmed).toHaveLength(4);
    expect(detail.json.game.waitlist).toHaveLength(7);
  });

  it('重複報名不會佔兩個位子', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host);
    const p = await newPlayer();
    await api(`/api/games/${game.id}/join`, { token: p, method: 'POST' });
    const again = await api(`/api/games/${game.id}/join`, { token: p, method: 'POST' });
    expect(again.json.me.status).toBe('confirmed');
    const d = await api(`/api/games/${game.id}`);
    expect(d.json.game.confirmed).toHaveLength(2);
  });

  it('有人取消時，候補第一位自動遞補；取消的人重新報名會排到最後', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host, { capacity: 2 });
    const [a, b, c] = await Promise.all([newPlayer('A'), newPlayer('B'), newPlayer('C')]);
    await api(`/api/games/${game.id}/join`, { token: a, method: 'POST' }); // 額滿
    await api(`/api/games/${game.id}/join`, { token: b, method: 'POST' }); // 候補 1
    await api(`/api/games/${game.id}/join`, { token: c, method: 'POST' }); // 候補 2

    const left = await api(`/api/games/${game.id}/leave`, { token: a, method: 'POST' });
    expect(left.json).toMatchObject({ status: 'cancelled', promoted: true }); // 3 天後才開打，還沒過截止
    const bView = await api(`/api/games/${game.id}`, { token: b });
    expect(bView.json.game.me.status).toBe('confirmed');

    const rejoin = await api(`/api/games/${game.id}/join`, { token: a, method: 'POST' });
    expect(rejoin.json.me).toEqual({ status: 'waitlist', position: 2 });
  });

  it('過了取消截止才取消，記一次遲取消', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host, { startsAt: Date.now() + 2 * HOUR, cancelHours: 6 });
    const p = await newPlayer();
    await api(`/api/games/${game.id}/join`, { token: p, method: 'POST' });
    const left = await api(`/api/games/${game.id}/leave`, { token: p, method: 'POST' });
    expect(left.json.status).toBe('late_cancel');
  });

  it('候補的人取消不算遲取消', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host, { startsAt: Date.now() + 2 * HOUR, cancelHours: 6, capacity: 2 });
    const [a, b] = await Promise.all([newPlayer(), newPlayer()]);
    await api(`/api/games/${game.id}/join`, { token: a, method: 'POST' });
    await api(`/api/games/${game.id}/join`, { token: b, method: 'POST' });
    const left = await api(`/api/games/${game.id}/leave`, { token: b, method: 'POST' });
    expect(left.json.status).toBe('cancelled');
  });

  it('團主不能退出自己的團', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host);
    const r = await api(`/api/games/${game.id}/leave`, { token: host, method: 'POST' });
    expect(r.json.error.code).toBe('host_cannot_leave');
  });

  it('新球友第一週最多同時報名 2 團', async () => {
    const hosts = await Promise.all([newPlayer(), newPlayer(), newPlayer()]);
    const gs = await Promise.all(hosts.map((h, i) => newGame(h, { startsAt: inDays(2 + i) })));
    const p = await newPlayer();
    expect((await api(`/api/games/${gs[0].game.id}/join`, { token: p, method: 'POST' })).status).toBe(200);
    expect((await api(`/api/games/${gs[1].game.id}/join`, { token: p, method: 'POST' })).status).toBe(200);
    const third = await api(`/api/games/${gs[2].game.id}/join`, { token: p, method: 'POST' });
    expect(third.json.error.code).toBe('too_many_active');
  });

  it('名單只露出暱稱和頭像，不露出球友 ID', async () => {
    const host = await newPlayer('阿哲');
    const { game } = await newGame(host);
    const d = await api(`/api/games/${game.id}`);
    expect(Object.keys(d.json.game.confirmed[0]).sort()).toEqual(['avatarSeed', 'isHost', 'isMe', 'level', 'nickname']);
    expect(d.text).not.toContain('manage_key');
    expect(d.text).not.toContain('host_id');
  });
});

describe('團主管理', () => {
  it('只有團主或持有管理密鑰的人可以修改', async () => {
    const host = await newPlayer();
    const { game, manageKey } = await newGame(host);
    const stranger = await newPlayer();
    const denied = await api(`/api/games/${game.id}`, { method: 'PATCH', token: stranger, body: { title: '被改掉了' } });
    expect(denied.status).toBe(403);
    const withKey = await api(`/api/games/${game.id}`, { method: 'PATCH', headers: { 'X-Manage-Key': manageKey }, body: { title: '副團主改的' } });
    expect(withKey.json.game.title).toBe('副團主改的');
    const wrongKey = await api(`/api/games/${game.id}`, { method: 'PATCH', headers: { 'X-Manage-Key': 'x'.repeat(32) }, body: { title: 'x' } });
    expect(wrongKey.status).toBe(403);
  });

  it('調高人數上限時，候補的人自動補上；不能調到比已報名人數還低', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host, { capacity: 2 });
    const [a, b, c] = await Promise.all([newPlayer(), newPlayer(), newPlayer()]);
    for (const t of [a, b, c]) await api(`/api/games/${game.id}/join`, { token: t, method: 'POST' });
    const up = await api(`/api/games/${game.id}`, { method: 'PATCH', token: host, body: { capacity: 4 } });
    expect(up.json.game.confirmed).toHaveLength(4);
    expect(up.json.game.waitlist).toHaveLength(0);
    const down = await api(`/api/games/${game.id}`, { method: 'PATCH', token: host, body: { capacity: 3 } });
    expect(down.json.error.code).toBe('capacity_below_confirmed');
  });

  it('人數上限調到低於最低成團人數時，最低成團人數跟著降', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host, { capacity: 6, minPlayers: 4 });
    const r = await api(`/api/games/${game.id}`, { method: 'PATCH', token: host, body: { capacity: 2 } });
    expect(r.json.game).toMatchObject({ capacity: 2, minPlayers: 2 });
  });

  it('取消這一團後就不能再報名', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host);
    await api(`/api/games/${game.id}`, { method: 'PATCH', token: host, body: { status: 'cancelled', cancelReason: 'weather' } });
    const p = await newPlayer();
    const r = await api(`/api/games/${game.id}/join`, { token: p, method: 'POST' });
    expect(r.json.error.code).toBe('game_closed');
    const d = await api(`/api/games/${game.id}`);
    expect(d.json.game).toMatchObject({ status: 'cancelled', cancelReason: 'weather' });
  });

  it('LINE 社群連結只收 LINE 的網址', async () => {
    const host = await newPlayer();
    const bad = await api('/api/games', { token: host, body: { courtId: 8, title: '測試團', startsAt: inDays(2), capacity: 6, communityUrl: 'https://evil.example.com/line.me' } });
    expect(bad.json.error.code).toBe('invalid_community_url');
    const ok = await newGame(await newPlayer(), { communityUrl: 'https://line.me/ti/g2/abcdEFGH' });
    expect(ok.game.communityUrl).toBe('https://line.me/ti/g2/abcdEFGH');
  });
});

describe('大廳清單', () => {
  it('只列出開放中、沒被隱藏的團，並附上人數', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host, { startsAt: inDays(5) });
    const r = await api(`/api/games?court=8&days=30`);
    const found = r.json.games.find((g: any) => g.id === game.id);
    expect(found).toMatchObject({ confirmedCount: 1, waitlistCount: 0, host: { nickname: '球友' } });
  });

  it('3 個不同球友檢舉就自動隱藏', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host, { startsAt: inDays(6) });
    const reporters = await Promise.all([newPlayer(), newPlayer(), newPlayer()]);
    await api(`/api/games/${game.id}/report`, { token: reporters[0], body: { reason: 'spam' } });
    await api(`/api/games/${game.id}/report`, { token: reporters[0], body: { reason: 'spam' } }); // 同一人不重複計算
    await api(`/api/games/${game.id}/report`, { token: reporters[1], body: { reason: 'spam' } });
    expect((await api(`/api/games/${game.id}`)).status).toBe(200);
    await api(`/api/games/${game.id}/report`, { token: reporters[2], body: { reason: 'spam' } });
    expect((await api(`/api/games/${game.id}`)).status).toBe(404);
    const list = await api(`/api/games?court=8&days=30`);
    expect(list.json.games.some((g: any) => g.id === game.id)).toBe(false);
    // 團主自己還看得到，知道發生什麼事
    expect((await api(`/api/games/${game.id}`, { token: host })).status).toBe(200);
  });
});

describe('分享頁', () => {
  it('給 LINE 爬蟲 OG 卡片，並轉址到主站；內容有跳脫', async () => {
    const host = await newPlayer();
    const { game } = await newGame(host, { title: '<script>alert(1)</script>團' });
    const r = await api(`/g/${game.id}`);
    expect(r.status).toBe(200);
    expect(r.text).toContain('og:title');
    expect(r.text).toContain('&lt;script&gt;');
    expect(r.text).not.toContain('<script>alert(1)');
    expect(r.text).toContain(`https://picklemastertw.com/play/?g=${game.id}`);
    expect(r.text).toContain('https://picklemastertw.com/og/court-8.png');
    expect(r.text).toContain('還有 5 位');
    expect(r.text).toContain('noindex');
  });

  it('找不到的團轉到大廳', async () => {
    const r = await api('/g/nope');
    expect(r.text).toContain('https://picklemastertw.com/play/');
  });
});

describe('CORS', () => {
  it('只允許主站來源', async () => {
    const ok = await api('/api/health', { headers: { Origin: 'https://picklemastertw.com' } });
    expect(ok.headers.get('Access-Control-Allow-Origin')).toBe('https://picklemastertw.com');
    const no = await api('/api/health', { headers: { Origin: 'https://evil.example.com' } });
    expect(no.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

