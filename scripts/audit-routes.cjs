#!/usr/bin/env node
/**
 * 路由涵蓋率巡檢 —— 抓「使用者看得到但爬蟲看不到」的頁面
 *
 *   npm run build && node scripts/audit-routes.cjs
 *   node scripts/audit-routes.cjs --live      # 額外用 Googlebot UA 對線上抽驗
 *
 * 為什麼需要這支：本站靠預渲染讓爬蟲與 AI 引擎讀到內容，但路由是寫在
 * src/utils/constants.ts、預渲染是寫在 scripts/generate-static-pages.cjs，
 * 兩邊沒有任何機制互相對照。2026-09 就這樣漏掉整組 /news/:id（27 篇新聞
 * 對爬蟲全回 404，使用者靠 404.html 的 SPA fallback 才看得到），以及
 * /contact 與 /privacy-policy。
 *
 * 四個方向都查：
 *   1. 靜態路由 → docs 下有沒有對應的 index.html
 *   2. 動態路由 → 前綴目錄下有沒有頁面（整組漏掉就是這樣被抓到的）
 *   3. 預渲染頁 → 有沒有進 sitemap（有頁面但爬蟲找不到路）
 *   4. sitemap URL → 檔案是否真的存在（sitemap 指向 404 比沒列還糟）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const live = process.argv.includes('--live');
const BASE = 'https://picklemastertw.com';
const GOOGLEBOT =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

/**
 * 刻意沒有預渲染頁的路由，寫在這裡並附理由。
 * 空的話就代表「每一條路由都該有靜態頁」——目前正是如此。
 * 加白名單前先想清楚：使用者到得了、爬蟲到不了的頁面，等於送給 Google 一個 404。
 */
const INTENTIONALLY_UNRENDERED = {
  // '/example': '理由寫在這裡',
};

function readRoutes() {
  const src = fs.readFileSync(path.join(ROOT, 'src/utils/constants.ts'), 'utf-8');
  const i = src.indexOf('export const ROUTES');
  const j = src.indexOf('} as const;', i);
  if (i < 0 || j < 0) throw new Error('在 src/utils/constants.ts 找不到 ROUTES —— 常數搬家了？');
  const entries = [...src.slice(i, j).matchAll(/(\w+):\s*'([^']+)'/g)].map((m) => ({
    key: m[1],
    route: m[2],
  }));
  return {
    static: entries.filter((e) => !e.route.includes(':')),
    dynamic: entries.filter((e) => e.route.includes(':')),
  };
}

const pageFor = (route) =>
  route === '/' ? path.join(DOCS, 'index.html') : path.join(DOCS, route, 'index.html');

/** 遞迴收集 docs 下所有預渲染頁，回傳網站路徑（'/' 或 '/courts/court-1'） */
function collectRenderedPaths() {
  const out = [];
  // 只跳純資產目錄。注意不能跳 videos —— 它同時放 mp4 和 /videos 的 index.html，
  // 整個跳掉會讓 /videos 被誤報成「sitemap 指向不存在的頁面」。
  const skip = new Set(['assets', 'og', 'data', 'images']);
  (function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (rel === '' && skip.has(entry.name)) continue;
        walk(path.join(dir, entry.name), `${rel}/${entry.name}`);
      } else if (entry.name === 'index.html') {
        out.push(rel === '' ? '/' : rel);
      }
    }
  })(DOCS, '');
  return out;
}

function readSitemapPaths() {
  const f = path.join(DOCS, 'sitemap.xml');
  if (!fs.existsSync(f)) return null;
  const xml = fs.readFileSync(f, 'utf-8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    const u = m[1].replace(BASE, '');
    return u === '' ? '/' : u.replace(/\/$/, '') || '/';
  });
}

async function httpStatus(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': GOOGLEBOT },
      signal: AbortSignal.timeout(20000),
    });
    return res.status;
  } catch {
    return 0;
  }
}

(async () => {
  if (!fs.existsSync(DOCS)) {
    console.error('找不到 docs/ —— 先跑 npm run build');
    process.exit(2);
  }

  const routes = readRoutes();
  const rendered = collectRenderedPaths();
  const renderedSet = new Set(rendered);
  const sitemap = readSitemapPaths();
  const problems = [];

  const line = (s = '') => console.log(s);
  line(`路由涵蓋率巡檢　${new Date().toISOString().slice(0, 10)}`);
  line(
    `路由 ${routes.static.length + routes.dynamic.length} 條（靜態 ${routes.static.length}／動態 ${routes.dynamic.length}）・預渲染 ${rendered.length} 頁・sitemap ${sitemap ? sitemap.length : '讀不到'} 筆`
  );
  line();

  // ① 靜態路由 → 有沒有預渲染頁
  const missingStatic = routes.static.filter(
    (e) => !fs.existsSync(pageFor(e.route)) && !(e.route in INTENTIONALLY_UNRENDERED)
  );
  line(`■ 靜態路由缺預渲染頁　${missingStatic.length} 條`);
  if (!missingStatic.length) line('  （無）');
  for (const e of missingStatic) {
    line(`  ${e.route}　（ROUTES.${e.key}）—— 使用者到得了，爬蟲會拿到 404`);
    problems.push(`靜態路由 ${e.route} 沒有預渲染頁`);
  }
  line();

  // ② 動態路由 → 前綴目錄下有沒有頁面
  line(`■ 動態路由涵蓋`);
  for (const e of routes.dynamic) {
    const prefix = e.route.split('/:')[0];
    const count = rendered.filter((p) => p.startsWith(prefix + '/')).length;
    const flag = count === 0 ? '　✗ 整組都沒有預渲染' : '';
    line(`  ${e.route.padEnd(30)} ${String(count).padStart(4)} 頁${flag}`);
    if (count === 0) problems.push(`動態路由 ${e.route} 整組沒有預渲染頁`);
  }
  line();

  // ③ 預渲染頁 → 有沒有進 sitemap
  if (sitemap) {
    const sitemapSet = new Set(sitemap);
    const notInSitemap = rendered.filter((p) => !sitemapSet.has(p));
    line(`■ 有頁面但不在 sitemap　${notInSitemap.length} 頁`);
    if (!notInSitemap.length) line('  （無）');
    for (const p of notInSitemap.slice(0, 20)) line(`  ${p}`);
    if (notInSitemap.length > 20) line(`  …另有 ${notInSitemap.length - 20} 頁`);
    if (notInSitemap.length) problems.push(`${notInSitemap.length} 個預渲染頁沒有列進 sitemap`);
    line();

    // ④ sitemap → 檔案是否存在
    const dangling = sitemap.filter((p) => !renderedSet.has(p));
    line(`■ sitemap 指向不存在的頁面　${dangling.length} 筆`);
    if (!dangling.length) line('  （無）');
    for (const p of dangling.slice(0, 20)) line(`  ${p}　—— 爬蟲會拿到 404`);
    if (dangling.length > 20) line(`  …另有 ${dangling.length - 20} 筆`);
    if (dangling.length) problems.push(`sitemap 有 ${dangling.length} 筆指向不存在的頁面`);
    line();
  }

  // ⑤ 選用：對線上用 Googlebot UA 抽驗
  if (live) {
    const sample = [
      ...routes.static.map((e) => e.route),
      ...routes.dynamic
        .map((e) => rendered.find((p) => p.startsWith(e.route.split('/:')[0] + '/')))
        .filter(Boolean),
    ];
    line(`■ 線上抽驗（Googlebot UA）　${sample.length} 條`);
    const bad = [];
    for (const r of sample) {
      const code = await httpStatus(BASE + r);
      if (code !== 200) {
        line(`  ${r}　HTTP ${code || '連線失敗'}`);
        bad.push(r);
      }
    }
    if (!bad.length) line('  全部 200');
    else problems.push(`線上有 ${bad.length} 條路由對 Googlebot 不是 200`);
    line();
  }

  if (Object.keys(INTENTIONALLY_UNRENDERED).length) {
    line('■ 刻意不預渲染（白名單）');
    for (const [r, why] of Object.entries(INTENTIONALLY_UNRENDERED)) line(`  ${r}　${why}`);
    line();
  }

  if (problems.length) {
    line(`✗ 發現 ${problems.length} 類問題：`);
    for (const p of problems) line(`  - ${p}`);
    line();
    line('修法：在 scripts/generate-static-pages.cjs 為該路由加上預渲染與 sitemap 條目。');
    line('如果某條路由確定不需要靜態頁，寫進本檔的 INTENTIONALLY_UNRENDERED 並附理由。');
    process.exitCode = 1;
  } else {
    line('✓ 每條路由都有預渲染頁，且與 sitemap 雙向一致');
  }
})();
