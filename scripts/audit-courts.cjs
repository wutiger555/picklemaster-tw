#!/usr/bin/env node
/**
 * 球場資料巡檢 —— 機械化能查的部分
 *
 *   node scripts/audit-courts.cjs
 *   node scripts/audit-courts.cjs --json    # 給程式吃的輸出
 *
 * 查四件事：
 *   1. 外部連結健檢（booking_url / website / contact_details / iplay.website）
 *   2. 資料新鮮度（last_updated 超過門檻的場地）
 *   3. 資料完整性（佔位字串、缺聯絡管道、格式錯誤的網址）
 *   4. 已標記關閉的場地是否該回頭複查
 *
 * 查不到的部分（需要瀏覽器讀 Google 地圖的營業狀態）會輸出成待查清單，
 * 因為 HTTP 200 不代表店還開著 —— 2026-09 的 Pickle Side 就是回 200 但粉專已刪、
 * Google 地圖標示暫時關閉。詳見 memory/venue-closure-audit-method.md。
 */
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const { execFile } = require('child_process');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const TIMEOUT_MS = 20000;
const STALE_DAYS = 120; // 超過這個天數沒查證就列出來
const RECHECK_CLOSED_DAYS = 60; // 標記關閉超過這麼久就該複查是否已復業
const CONCURRENCY = 6; // 再高會讓 DNS 誤報 ENOTFOUND

// Facebook / Instagram 對非瀏覽器客戶端會回 400/302，不代表連結壞掉
const SOCIAL_HOSTS = /(^|\.)(facebook|instagram|threads|line|lin)\.(com|me|ee)$/i;

const asJson = process.argv.includes('--json');

function loadCourts() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../public/data/courts.json'), 'utf-8')
  );
  return Array.isArray(raw) ? raw : raw.courts;
}

function collectLinks(courts) {
  const out = [];
  for (const c of courts) {
    const push = (field, url) => out.push({ id: c.id, name: c.name, ownership: c.ownership, field, url });
    if (c.booking_url) push('booking_url', c.booking_url);
    if (c.website) push('website', c.website);
    for (const [k, v] of Object.entries(c.contact_details || {})) {
      if (typeof v === 'string' && v.startsWith('http')) push(`contact.${k}`, v);
    }
    if (c.iplay && c.iplay.website) push('iplay.website', c.iplay.website);
  }
  return out;
}

/**
 * 第二意見。Node 的 undici 對憑證鏈的要求比瀏覽器嚴格，
 * 好幾個政府場館網站在瀏覽器打得開但 Node fetch 會拋錯。
 * 這裡用 curl -k 再問一次：能通就只是設定瑕疵，不是連結死了。
 */
function curlStatus(url) {
  return new Promise((resolve) => {
    execFile(
      'curl',
      ['-sS', '-o', '/dev/null', '-w', '%{http_code}', '-kL', '--max-time', '20', '-A', UA, url],
      { timeout: TIMEOUT_MS + 5000 },
      (err, stdout) => resolve(err ? 0 : parseInt(String(stdout).trim(), 10) || 0)
    );
  });
}

async function probe(item) {
  let host;
  try {
    host = new URL(item.url).hostname;
  } catch {
    return { ...item, ok: false, code: 0, reason: 'URL 格式錯誤（無法解析）' };
  }
  // 先確認網域還在。DNS 消失是最明確的「這個連結死了」。
  try {
    await dns.lookup(host);
  } catch {
    try {
      await new Promise((r) => setTimeout(r, 400));
      await dns.lookup(host); // 序列重試一次，避免並行造成的假性失敗
    } catch {
      return { ...item, ok: false, code: 0, reason: `網域已無 DNS 紀錄（${host}）` };
    }
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(item.url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
    });
    if (res.ok) return { ...item, ok: true, code: res.status };
    if (SOCIAL_HOSTS.test(host)) {
      return { ...item, ok: true, code: res.status, reason: '社群平台阻擋非瀏覽器請求，需人工開啟確認' };
    }
    const alt = await curlStatus(item.url);
    if (alt >= 200 && alt < 400) {
      return { ...item, ok: true, code: alt, reason: `Node 得到 HTTP ${res.status} 但 curl 回 ${alt} —— 對方在擋特定客戶端` };
    }
    return { ...item, ok: false, code: res.status, reason: `HTTP ${res.status}${alt ? `（curl 也回 ${alt}）` : ''}` };
  } catch (e) {
    const cause = (e.cause && (e.cause.code || e.cause.message)) || e.name;
    const alt = await curlStatus(item.url);
    if (alt >= 200 && alt < 400) {
      return {
        ...item,
        ok: true,
        code: alt,
        reason: `Node 連不上但 curl 通（HTTP ${alt}）—— 憑證鏈或 TLS 設定瑕疵，瀏覽器多半可開。原因：${cause}`,
      };
    }
    return { ...item, ok: false, code: 0, reason: `連線失敗：${cause}${alt ? `（curl 也回 ${alt}）` : '（curl 同樣失敗）'}` };
  } finally {
    clearTimeout(timer);
  }
}

async function mapPool(items, worker, size) {
  const out = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        out[i] = await worker(items[i]);
      }
    })
  );
  return out;
}

const daysSince = (iso) => {
  if (!iso) return Infinity;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? Infinity : Math.floor((Date.now() - t) / 86400000);
};

function dataQuality(courts) {
  const PLACEHOLDER = /依官方|依場館|依現場|詳細地址|待確認|待補|公告$/;
  const issues = [];
  for (const c of courts) {
    const addr = c.location?.address || '';
    if (PLACEHOLDER.test(addr) || !/[0-9]/.test(addr)) {
      issues.push({ id: c.id, name: c.name, kind: 'address', detail: `地址無門牌：${addr}` });
    }
    const hasChannel =
      c.booking_url || c.website || Object.keys(c.contact_details || {}).length > 0;
    if (!hasChannel) {
      issues.push({ id: c.id, name: c.name, kind: 'contact', detail: '沒有任何可點擊的官方管道' });
    }
    for (const [k, v] of Object.entries(c.contact_details || {})) {
      if (typeof v === 'string' && v.startsWith('http')) {
        try {
          new URL(v);
        } catch {
          issues.push({ id: c.id, name: c.name, kind: 'url', detail: `${k} 網址格式錯誤：${v}` });
        }
      }
    }
  }
  return issues;
}

(async () => {
  const courts = loadCourts();
  const links = collectLinks(courts);
  const results = await mapPool(links, probe, CONCURRENCY);

  const broken = results.filter((r) => !r.ok);
  const needsEyes = results.filter((r) => r.ok && r.reason);
  const stale = courts
    .filter((c) => daysSince(c.last_updated) > STALE_DAYS)
    .map((c) => ({ id: c.id, name: c.name, ownership: c.ownership, days: daysSince(c.last_updated), last_updated: c.last_updated }))
    .sort((a, b) => b.days - a.days);
  const closed = courts
    .filter((c) => c.status)
    .map((c) => ({ id: c.id, name: c.name, status: c.status, days: daysSince(c.status_verified) }));
  const recheckClosed = closed.filter((c) => c.days > RECHECK_CLOSED_DAYS);
  const quality = dataQuality(courts);
  const priv = courts.filter((c) => c.ownership === 'private');

  if (asJson) {
    console.log(
      JSON.stringify({ total: courts.length, private: priv.length, broken, needsEyes, stale, closed, recheckClosed, quality }, null, 2)
    );
    return;
  }

  const line = (s = '') => console.log(s);
  line(`球場資料巡檢　${new Date().toISOString().slice(0, 10)}`);
  line(`場地 ${courts.length} 座（民營 ${priv.length}）・外部連結 ${links.length} 條`);
  line();

  line(`■ 連結失效　${broken.length} 條`);
  if (!broken.length) line('  （無）');
  for (const b of broken) line(`  id=${b.id} ${b.name}　${b.field}　${b.reason}\n     ${b.url}`);
  line();

  line(`■ 可連通但有雜訊（社群平台擋機器人、TLS 設定瑕疵）　${needsEyes.length} 條`);
  for (const n of needsEyes) line(`  id=${n.id} ${n.name}　${n.field}　HTTP ${n.code}\n     ${n.url}`);
  line();

  line(`■ 已標記關閉　${closed.length} 座`);
  for (const c of closed) {
    const flag = c.days > RECHECK_CLOSED_DAYS ? '　← 該複查是否已復業' : '';
    line(`  id=${c.id} ${c.name}　${c.status}　查證於 ${c.days} 天前${flag}`);
  }
  line();

  line(`■ 超過 ${STALE_DAYS} 天未查證　${stale.length} 座`);
  for (const s of stale.slice(0, 25)) line(`  id=${s.id} ${s.name}　${s.last_updated || '無日期'}（${s.days} 天）`);
  if (stale.length > 25) line(`  …另有 ${stale.length - 25} 座`);
  line();

  line(`■ 資料完整性　${quality.length} 項`);
  for (const q of quality) line(`  id=${q.id} ${q.name}　[${q.kind}] ${q.detail}`);
  line();

  line('■ 這支腳本查不到、需要瀏覽器的部分');
  line('  Google 地圖的營業狀態（營業中／暫時關閉／已歇業）。HTTP 200 不代表店還開著。');
  line('  作法見 memory/venue-closure-audit-method.md：開');
  line('  https://www.google.com/maps/search/?api=1&query=<場館名+行政區>');
  line('  navigate 後等 3 秒再讀文字，否則 Maps 還沒渲染完。');
  line(`  優先掃民營館（${priv.length} 座）—— 公有場地不會突然歇業。`);

  process.exitCode = broken.length ? 1 : 0;
})();
