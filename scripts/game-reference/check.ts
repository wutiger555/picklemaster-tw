/**
 * 同種子回歸：重跑 fixtures/events 的六種情境，逐分和存檔比對。
 * 改引擎後跑這個，紅了就代表單打／雙打行為被改到（刻意改就重新匯出）。
 * 用法：node scripts/game-reference/run.mjs scripts/game-reference/check.ts
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { simulateMatch } from './sim';

const ROOT = process.env.PM_ROOT ?? process.cwd();
const dir = join(ROOT, 'game-reference', 'fixtures', 'events');
let failed = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  const saved = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  const r = simulateMatch(saved._meta.opts);
  const now = r.points.map((p) => ({ winner: p.winner, reason: p.reason, faultTeam: p.faultTeam, rallyHits: p.rallyHits, kinds: p.kinds.join(','), call: p.after.call }));
  const same = JSON.stringify(now) === JSON.stringify(saved.points) && r.score.join('-') === saved.score.join('-');
  if (!same) {
    failed++;
    const i = now.findIndex((p, k) => JSON.stringify(p) !== JSON.stringify(saved.points[k]));
    console.log(`✗ ${file}  第 ${i + 1} 分開始不同：存檔 ${JSON.stringify(saved.points[i])}  現在 ${JSON.stringify(now[i])}`);
  } else console.log(`✓ ${file}  ${r.score.join('-')}，${now.length} 分逐字相同`);
}
if (failed) {
  console.log(`\n${failed} 個情境和參考包不同。刻意改引擎就重跑 npm run reference:export。`);
  process.exit(1);
}
