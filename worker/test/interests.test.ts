import { describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { runDaily } from '../src/cron';
import { api, newPlayer, DAY } from './helpers';

// 北投運動中心（courtId 8）的固定球敘在週二、四、六
const BEITOU = 8;
const taipeiDate = (ms: number) => new Date(ms + 8 * 3600_000).toISOString().slice(0, 10);
const taipeiWeekday = (ms: number) => new Date(ms + 8 * 3600_000).getUTCDay();
function nextDate(weekdays: number[]) {
  for (let i = 0; i < 7; i++) {
    const t = Date.now() + i * DAY;
    if (weekdays.includes(taipeiWeekday(t))) return taipeiDate(t);
  }
  throw new Error('no date');
}

describe('固定球敘：我會去', () => {
  it('按「我會去」會計數，再按一次取消；同一人不重複計算', async () => {
    const date = nextDate([2, 4, 6]);
    const [a, b] = await Promise.all([newPlayer('阿哲'), newPlayer('小芸')]);
    const r1 = await api('/api/interests', { token: a, body: { courtId: BEITOU, date } });
    expect(r1.json).toMatchObject({ count: 1, mine: true });
    await api('/api/interests', { token: a, body: { courtId: BEITOU, date } }); // 重複按
    const r2 = await api('/api/interests', { token: b, body: { courtId: BEITOU, date } });
    expect(r2.json.count).toBe(2);

    const list = await api(`/api/interests?from=${date}&to=${date}`, { token: a });
    expect(list.json.interests).toEqual([{ courtId: BEITOU, date, count: 2, mine: true }]);
    const anon = await api(`/api/interests?from=${date}&to=${date}`);
    expect(anon.json.interests[0].mine).toBe(false);

    const off = await api('/api/interests', { token: a, body: { courtId: BEITOU, date, going: false } });
    expect(off.json).toMatchObject({ count: 1, mine: false });
  });

  it('那天沒有球敘、沒有固定球敘的球場、太遠的日期都擋掉', async () => {
    const t = await newPlayer();
    const monday = nextDate([1]);
    expect((await api('/api/interests', { token: t, body: { courtId: BEITOU, date: monday } })).json.error.code).toBe('no_session');
    expect((await api('/api/interests', { token: t, body: { courtId: 1, date: monday } })).json.error.code).toBe('not_found'); // 大都會公園沒有球敘資料
    const far = taipeiDate(Date.now() + 30 * DAY);
    expect((await api('/api/interests', { token: t, body: { courtId: BEITOU, date: far } })).json.error.code).toBe('date_out_of_range');
    expect((await api('/api/interests', { body: { courtId: BEITOU, date: nextDate([2, 4, 6]) } })).status).toBe(401);
  });

  it('刪除資料時一併刪掉「我會去」；過期兩天後每日清理會刪', async () => {
    // 萬華運動中心（courtId 15）的球敘在週三；跟其他測試用不同球場，避免共用資料互相影響
    const WANHUA = 15;
    const date = nextDate([3]);
    const [a, b] = await Promise.all([newPlayer(), newPlayer()]);
    const ra = await api('/api/interests', { token: a, body: { courtId: WANHUA, date } });
    const rb = await api('/api/interests', { token: b, body: { courtId: WANHUA, date } });
    expect([ra.json.count, rb.json.count], ra.text + rb.text).toEqual([1, 2]);
    const del = await api('/api/me', { method: 'DELETE', token: a });
    expect(del.status, del.text).toBe(200);
    let r = await api(`/api/interests?from=${date}&to=${date}`);
    expect(r.json.interests, r.text).toEqual([{ courtId: WANHUA, date, count: 1, mine: false }]);
    await runDaily(env, Date.parse(`${date}T00:00:00+08:00`) + 3 * DAY);
    r = await api(`/api/interests?from=${date}&to=${date}`);
    expect(r.json.interests).toEqual([]);
  });
});
