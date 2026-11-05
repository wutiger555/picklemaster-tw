/**
 * 匯出「參考包」：把網頁版調好的手感變成另一個專案（手機版）看得懂的資料。
 *
 *   game-reference/params.json            引擎所有常數（球、拍、選手、AI 程度、球拍倍率、角色素質、絕招…）
 *   game-reference/fixtures/bands.json    約 2,000 場無頭模擬的統計帶：拍數、失誤率、ACE 率、勝率、球路組成
 *   game-reference/fixtures/rules/*.json  規則對答案：一串回合勝方 → 每一分之後的比分、發球權、發球員、站區
 *   game-reference/fixtures/events/*.json 同種子的完整逐分紀錄（只有這個 TS 引擎能重現，給網頁版自己回歸用）
 *
 * 用法：node scripts/game-reference/run.mjs scripts/game-reference/export.ts [--quick]
 * --quick 把場數除以 10，幾十秒跑完，拿來確認腳本沒壞。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { COURT, BALL, AIR, PADDLE, PLAYER, PHYSICS_DT } from '../../src/components/game/engine/constants';
import { AI_PROFILES, type Difficulty } from '../../src/components/game/engine/ai';
import { PADDLES, SPECIALS, ENERGY } from '../../src/components/game/engine/paddles';
import { SKILLS, SKILL_RECHARGE_POINTS } from '../../src/components/game/engine/skills';
import { AWAKEN, CHALLENGES, DIVE, QUAKE, THUNDER_R, SKILL_FX } from '../../src/components/game/engine/game';
import { SERVE_DEPTH, SMASH_HEIGHT, NET_ZONE, BLOCK_SPEED, ATTACK_SLACK, type ShotKind } from '../../src/components/game/engine/shots';
import { CHARACTERS, traitsOf } from '../../src/components/game/characters';
import { simulateMatch, type SimOptions, type PointRecord } from './sim';

const ROOT = process.env.PM_ROOT ?? process.cwd();
const OUT = join(ROOT, 'game-reference');
const quick = process.argv.includes('--quick');
const N = (n: number) => (quick ? Math.max(2, Math.round(n / 10)) : n);

const git = (...args: string[]) => {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};
const commit = git('rev-parse', 'HEAD');
const date = new Date().toISOString().slice(0, 10);

mkdirSync(join(OUT, 'fixtures', 'rules'), { recursive: true });
mkdirSync(join(OUT, 'fixtures', 'events'), { recursive: true });
const writeJson = (rel: string, data: unknown) => writeFileSync(join(OUT, rel), JSON.stringify(data, null, 2) + '\n');

// ───────────────────────────── 1. 常數 ─────────────────────────────

const params = {
  _meta: { source: 'picklemaster-tw src/components/game', commit, exportedAt: date, units: 'SI：公尺、秒、公斤；角度以座標系：x 橫跨球場、y 向上、z 沿長邊，球網在 z=0，玩家隊在 z>0' },
  court: COURT,
  ball: BALL,
  air: AIR,
  paddle: PADDLE,
  player: PLAYER,
  physicsDt: PHYSICS_DT,
  shots: { serveDepth: SERVE_DEPTH, smashHeight: SMASH_HEIGHT, netZone: NET_ZONE, blockSpeed: BLOCK_SPEED, attackSlack: ATTACK_SLACK },
  aiProfiles: AI_PROFILES,
  /** 角色素質 1–5 換算成倍率的係數（3 = 標準選手） */
  traitFormula: { speedPerLevel: 0.07, pacePerLevel: 0.065, errorPerLevel: -0.05, reachMetersPerLevel: 0.07 },
  characters: CHARACTERS.map((c) => ({
    id: c.id,
    name: c.name,
    title: c.title,
    archetype: c.archetype,
    stats: c.stats,
    traits: traitsOf(c),
    skill: c.skill,
    grip: c.grip,
    backhand: c.backhand,
  })),
  paddles: PADDLES.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    model: p.model,
    shape: p.shape,
    length: p.length,
    width: p.width,
    thicknessMm: p.thickness,
    weightOz: p.weightOz,
    rating: p.rating,
    mods: p.mods,
    special: p.special,
  })),
  specials: Object.values(SPECIALS).map((s) => ({ id: s.id, name: s.name, title: s.title, desc: s.desc, counter: s.counter })),
  skills: Object.values(SKILLS).map((s) => ({ id: s.id, name: s.name, title: s.title, desc: s.desc })),
  skillFx: SKILL_FX,
  skillRechargePoints: SKILL_RECHARGE_POINTS,
  energy: ENERGY,
  awaken: AWAKEN,
  challengesPerGame: CHALLENGES,
  dive: DIVE,
  quake: QUAKE,
  thunderRadius: THUNDER_R,
};
writeJson('params.json', params);
console.log('params.json 寫好');

// ───────────────────────────── 2. 統計帶 ─────────────────────────────

const ATTACK: ShotKind[] = ['smash', 'punch', 'speedup', 'drive'];
const FAULTS = new Set(['out', 'net', 'serveShort', 'serveWide', 'serveLong', 'twoBounce', 'kitchenVolley', 'kitchenMomentum', 'bodyHit', 'netTouch']);

interface Scenario {
  id: string;
  desc: string;
  games: number;
  opts: Omit<SimOptions, 'seed'>;
}

const scenarios: Scenario[] = [];
const diffs: Difficulty[] = ['rookie', 'club', 'pro'];
for (const a of diffs) for (const b of diffs) scenarios.push({ id: `singles-${a}-${b}`, desc: `單打 ${a} 對 ${b}，中性素質，正規版`, games: N(80), opts: { difficulty: [a, b] } });
for (const c of CHARACTERS) {
  if (c.id === 'default') continue;
  scenarios.push({ id: `char-${c.id}`, desc: `${c.name}（${c.archetype}）對台灣隊（全 3），club 對 club，正規版`, games: N(50), opts: { difficulty: ['club', 'club'], characters: [c.id, 'default'] } });
}
for (const p of PADDLES) {
  if (p.id === 'storm') continue;
  scenarios.push({ id: `paddle-${p.id}`, desc: `${p.brand} ${p.name} 對 Selkirk Invikta，club 對 club，正規版`, games: N(40), opts: { difficulty: ['club', 'club'], paddles: [p.id, 'storm'] } });
}
scenarios.push({ id: 'paddle-storm', desc: 'Selkirk Invikta 對 JOOLA Perseus，club 對 club，正規版', games: N(40), opts: { difficulty: ['club', 'club'], paddles: ['storm', 'blaze'] } });
for (const d of diffs) scenarios.push({ id: `doubles-${d}`, desc: `雙打 ${d} 對 ${d}，中性素質，正規版`, games: N(d === 'club' ? 100 : 60), opts: { difficulty: [d, d], doubles: true } });
scenarios.push({ id: 'arcade-singles-club', desc: '熱血版單打：阿灰對城主，club 對 club，必殺與絕招全開', games: N(120), opts: { difficulty: ['club', 'club'], specials: true, characters: ['p1', 'p2'] } });
scenarios.push({ id: 'arcade-singles-pro', desc: '熱血版單打：狐面對虎爺，pro 對 pro', games: N(80), opts: { difficulty: ['pro', 'pro'], specials: true, characters: ['anna', 'tiger'] } });
scenarios.push({ id: 'arcade-doubles-club', desc: '熱血版雙打：帽哥＋黑框 對 酸黃瓜＋包子武士，club', games: N(80), opts: { difficulty: ['club', 'club'], specials: true, doubles: true, characters: ['p5', 'cucumber', 'p4', 'bao'] } });

const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const r3 = (x: number) => Math.round(x * 1000) / 1000;

const summarize = (sc: Scenario, results: ReturnType<typeof simulateMatch>[]) => {
  const pts: PointRecord[] = results.flatMap((r) => r.points);
  const n = pts.length;
  const count = (f: (p: PointRecord) => boolean) => pts.filter(f).length / n;
  const kindTotals: Partial<Record<ShotKind, number>> = {};
  let hits = 0;
  for (const p of pts)
    for (const k of p.kinds) {
      kindTotals[k] = (kindTotals[k] ?? 0) + 1;
      hits++;
    }
  const shotMix = Object.fromEntries(Object.entries(kindTotals).map(([k, v]) => [k, r3(v! / hits)]));
  const unforced = (p: PointRecord) => {
    if (p.faultTeam === null || !FAULTS.has(p.reason)) return false;
    // 失誤那一拍的前一拍如果是對手的攻擊球，就算受迫
    const prev = p.kinds[p.kinds.length - 2];
    return !prev || !ATTACK.includes(prev);
  };
  return {
    id: sc.id,
    desc: sc.desc,
    games: results.length,
    points: n,
    team0WinRate: r3(results.filter((r) => r.winner === 0).length / results.length),
    avgPointsPerGame: r3(n / results.length),
    avgSecondsPerGame: r3(mean(results.map((r) => r.seconds))),
    avgRallyHits: r3(mean(pts.map((p) => p.rallyHits))),
    medianRallyHits: median(pts.map((p) => p.rallyHits)),
    longestRallyMean: r3(mean(results.map((r) => r.longestRally))),
    faultRate: r3(count((p) => p.faultTeam !== null && FAULTS.has(p.reason))),
    unforcedErrorRate: r3(count(unforced)),
    outRate: r3(count((p) => p.reason === 'out')),
    netRate: r3(count((p) => p.reason === 'net')),
    serveFaultRate: r3(count((p) => p.reason === 'serveShort' || p.reason === 'serveWide' || p.reason === 'serveLong')),
    kitchenFaultRate: r3(count((p) => p.reason === 'kitchenVolley' || p.reason === 'kitchenMomentum')),
    aceRate: r3(count((p) => p.reason === 'ace')),
    winnerRate: r3(count((p) => p.reason === 'winner' || p.reason === 'notReturned')),
    sideOutRate: r3(count((p) => p.sideOut)),
    shotMix,
  };
};

const bands: unknown[] = [];
let seed = 1000;
const t0 = Date.now();
for (const sc of scenarios) {
  const results = [];
  for (let g = 0; g < sc.games; g++) results.push(simulateMatch({ ...sc.opts, seed: seed++ }));
  const s = summarize(sc, results);
  bands.push(s);
  console.log(`${sc.id.padEnd(24)} ${sc.games} 場  拍數 ${s.avgRallyHits}  失誤 ${s.faultRate}  ACE ${s.aceRate}  隊0勝率 ${s.team0WinRate}  (${Math.round((Date.now() - t0) / 1000)}s)`);
}
writeJson('fixtures/bands.json', {
  _meta: {
    commit,
    exportedAt: date,
    quick,
    tolerance: { avgRallyHits: '±1 拍', rates: '±0.03', team0WinRate: '±0.03', 說明: '新引擎跑同樣情境，落在容忍範圍內就算手感沒走味；刻意改設計時在 ADR 記下理由並更新這裡' },
    definitions: {
      faultRate: '以違例結束的分（出界、掛網、發球失誤、雙彈跳、廚房、身體、碰網）佔全部分數',
      unforcedErrorRate: '違例，而且前一拍不是對手的攻擊球（smash/punch/speedup/drive）',
      winnerRate: '致勝球或對手沒接到',
      aceRate: '發球直接得分',
      shotMix: '所有擊球裡各球路的比例',
      team0: 'athletes[0] 那一隊（網頁版的玩家位置）',
    },
  },
  scenarios: bands,
});
console.log(`bands.json 寫好：${scenarios.reduce((s, x) => s + x.games, 0)} 場，${Math.round((Date.now() - t0) / 1000)} 秒`);

// ───────────────────────────── 3. 規則對答案 ─────────────────────────────
// 這些不依賴物理：把「每一分誰贏」依序餵給任何引擎的計分規則，狀態序列必須完全一樣。

const ruleFixtures = [
  { id: 'singles-11', seed: 1, opts: { difficulty: ['club', 'club'] as [Difficulty, Difficulty] } },
  { id: 'singles-deuce', seed: 23, opts: { difficulty: ['pro', 'pro'] as [Difficulty, Difficulty] } },
  { id: 'singles-7', seed: 5, opts: { difficulty: ['club', 'rookie'] as [Difficulty, Difficulty], target: 7 } },
  { id: 'doubles-11', seed: 2, opts: { difficulty: ['club', 'club'] as [Difficulty, Difficulty], doubles: true } },
  { id: 'doubles-pro', seed: 31, opts: { difficulty: ['pro', 'pro'] as [Difficulty, Difficulty], doubles: true } },
  { id: 'doubles-7', seed: 9, opts: { difficulty: ['rookie', 'club'] as [Difficulty, Difficulty], doubles: true, target: 7 } },
];
for (const f of ruleFixtures) {
  const r = simulateMatch({ ...f.opts, seed: f.seed });
  writeJson(`fixtures/rules/${f.id}.json`, {
    _meta: { commit, doubles: !!f.opts.doubles, target: f.opts.target ?? 11, winBy: 2, start: f.opts.doubles ? '雙打 0-0-2 開局：先發球隊只有一位發球員' : '單打：發球方分數偶數從右區發' },
    rallyWinners: r.points.map((p) => p.winner),
    expected: r.points.map((p) => p.after),
    finalWinner: r.winner,
  });
}
console.log('fixtures/rules 寫好');

// ───────────────────────────── 4. 同種子逐分紀錄（網頁版自己回歸用） ─────────────────────────────

const eventFixtures = [
  { id: 'singles-club-club', opts: { seed: 101, difficulty: ['club', 'club'] as [Difficulty, Difficulty] } },
  { id: 'singles-pro-rookie', opts: { seed: 102, difficulty: ['pro', 'rookie'] as [Difficulty, Difficulty] } },
  { id: 'singles-chars', opts: { seed: 103, difficulty: ['club', 'club'] as [Difficulty, Difficulty], characters: ['p1', 'anna'] } },
  { id: 'singles-arcade', opts: { seed: 104, difficulty: ['club', 'club'] as [Difficulty, Difficulty], specials: true, characters: ['p2', 'tiger'] } },
  { id: 'doubles-club', opts: { seed: 105, difficulty: ['club', 'club'] as [Difficulty, Difficulty], doubles: true } },
  { id: 'doubles-arcade', opts: { seed: 106, difficulty: ['pro', 'pro'] as [Difficulty, Difficulty], doubles: true, specials: true, characters: ['p5', 'cucumber', 'p4', 'bao'] } },
];
for (const f of eventFixtures) {
  const r = simulateMatch(f.opts);
  writeJson(`fixtures/events/${f.id}.json`, {
    _meta: { commit, opts: f.opts, note: '只有同一份 TS 引擎同種子才會逐字相同；手機版不比這個，比 bands.json 與 rules/' },
    score: r.score,
    winner: r.winner,
    seconds: r3(r.seconds),
    points: r.points.map((p) => ({ winner: p.winner, reason: p.reason, faultTeam: p.faultTeam, rallyHits: p.rallyHits, kinds: p.kinds.join(','), call: p.after.call })),
  });
}
console.log('fixtures/events 寫好');

// ───────────────────────────── 5. EXPORT.md ─────────────────────────────

writeFileSync(
  join(OUT, 'EXPORT.md'),
  `# 參考包匯出紀錄

- 來源 commit：\`${commit}\`
- 匯出日期：${date}${quick ? '（--quick，場數只有十分之一，正式交付前要重跑）' : ''}
- 引擎原始碼：\`src/components/game/engine/\`（同一個 commit）
- 重新產生：\`npm run reference:export\`（約 15 分鐘）；\`npm run reference:check\` 用同種子驗證引擎沒被改到

## 交付給手機專案時

\`\`\`bash
scripts/game-reference/pack.sh <目的地>/reference/web-v1
\`\`\`

會把這個資料夾加上 \`engine-src/\`（引擎原始碼快照）複製過去，並寫入 \`VERSION\`。
手機專案只讀 \`params.json\`、\`FEEL.md\`、\`fixtures/bands.json\`、\`fixtures/rules/\`；\`fixtures/events/\` 是網頁版自己的回歸資料。
`,
);
console.log('EXPORT.md 寫好');
