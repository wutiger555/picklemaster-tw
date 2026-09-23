import { describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { REVIEW_WINDOW } from '../src/reviews';
import { api, newPlayer } from './helpers';

// 每個測試用不同的球場，避免測試之間共用資料互相影響
describe('球場評論（標籤）', () => {
  it('一人一份，可以修改；統計依次數排序，並回傳我自己選的', async () => {
    const court = 7;
    const [a, b] = await Promise.all([newPlayer(), newPlayer()]);
    await api(`/api/courts/${court}/reviews`, { method: 'PUT', token: a, body: { tags: ['floor_grip', 'lights_good'] } });
    const rb = await api(`/api/courts/${court}/reviews`, { method: 'PUT', token: b, body: { tags: ['lights_good', 'parking_hard'] } });
    expect(rb.json).toMatchObject({ total: 2, mine: ['lights_good', 'parking_hard'] });
    expect(rb.json.tags[0]).toEqual({ tag: 'lights_good', count: 2 });

    // a 改成別的標籤：還是只算一份
    const ra = await api(`/api/courts/${court}/reviews`, { method: 'PUT', token: a, body: { tags: ['toilet'] } });
    expect(ra.json.total).toBe(2);
    expect(ra.json.tags).toEqual(expect.arrayContaining([{ tag: 'lights_good', count: 1 }, { tag: 'toilet', count: 1 }]));

    const anon = await api(`/api/courts/${court}/reviews`);
    expect(anon.json.mine).toBeNull();

    const del = await api(`/api/courts/${court}/reviews`, { method: 'DELETE', token: a });
    expect(del.json).toMatchObject({ total: 1, mine: null });
  });

  it('擋掉不認得的標籤、互相矛盾的標籤、太多標籤、沒有身分', async () => {
    const court = 9;
    const t = await newPlayer();
    const put = (tags: unknown, token = t) => api(`/api/courts/${court}/reviews`, { method: 'PUT', token, body: { tags } });
    expect((await put(['made_up'])).json.error.code).toBe('invalid_tags');
    expect((await put(['floor_grip', 'floor_slippery'])).json.error.message).toContain('不能同時選');
    expect((await put([])).json.error.code).toBe('invalid_tags');
    expect((await put(['floor_grip', 'lines_clear', 'net_good', 'lights_good', 'cool', 'shade', 'parking_easy', 'transit', 'toilet'])).json.error.message).toContain('最多');
    expect((await put(['toilet'], '')).status).toBe(401); // 空字串＝不帶身分
    expect((await api('/api/courts/999999/reviews')).status).toBe(404);
  });

  it('只統計近一年的評論；刪除資料時一併刪除', async () => {
    const court = 13;
    const [old, fresh] = await Promise.all([newPlayer(), newPlayer()]);
    await api(`/api/courts/${court}/reviews`, { method: 'PUT', token: old, body: { tags: ['windy'] } });
    await api(`/api/courts/${court}/reviews`, { method: 'PUT', token: fresh, body: { tags: ['shade'] } });
    // 把其中一份改成一年多前
    await env.DB.prepare(`UPDATE court_reviews SET updated_at = ?1 WHERE court_id = ?2 AND tags = '["windy"]'`).bind(Date.now() - REVIEW_WINDOW - 86400_000, court).run();
    let r = await api(`/api/courts/${court}/reviews`);
    expect(r.json).toMatchObject({ total: 1, tags: [{ tag: 'shade', count: 1 }] });

    await api('/api/me', { method: 'DELETE', token: fresh });
    r = await api(`/api/courts/${court}/reviews`);
    expect(r.json.total).toBe(0);
  });
});
