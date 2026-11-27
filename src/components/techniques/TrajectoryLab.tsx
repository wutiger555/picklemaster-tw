import { useEffect, useMemo, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { COURT } from '../game/engine/constants';
import { ATTACK_HEIGHT, HITTER_Z, OPP_LINE_Z, type ShotTrace, traceDrive, traceDrop } from './trajectory';

/**
 * 第三球下切的球路實驗室：拖拉「弧線最高點」與「落點深度」，
 * 用 /game 的真實球體物理即時算出球路，告訴你對手能不能攻擊、你有多少時間上網。
 */

// ── 側視圖座標：左邊是自己的底線，右邊是對手的底線
const W = 820;
const H = 300;
const GROUND = 262;
const PX = 780 / 14.8;
const sx = (z: number) => 20 + (7.4 - z) * PX;
const sy = (y: number) => GROUND - y * PX;

/** 跑速（公尺／秒）：打完往前衝、對手擊球前要分腿墊步站定 */
const RUN_SPEED = 3.5;

interface Preset {
  key: string;
  label: string;
  apex: number;
  depth: number;
}

const PRESETS: Preset[] = [
  { key: 'ideal', label: '理想下切', apex: 2.2, depth: 1.4 },
  { key: 'high', label: '弧線太高', apex: 3.6, depth: 1.6 },
  { key: 'deep', label: '太平太深', apex: 1.25, depth: 4.2 },
  { key: 'net', label: '弧線太低', apex: 0.9, depth: 0.6 },
];

type Tone = 'good' | 'warn' | 'bad';

const verdict = (t: ShotTrace): { tone: Tone; title: string; body: string } => {
  if (!t.land || t.land.z > 0 || t.netMargin < 0) {
    return { tone: 'bad', title: '掛網', body: '最高點太低，球過不了網。下切要「舀」起來，弧線頂點要明顯高過網子。' };
  }
  if (t.land.z < -COURT.halfLength) return { tone: 'bad', title: '出界', body: '力道太大，下切不是抽球，用推送的就好。' };
  if (t.atOppLine !== null) {
    if (t.atOppLine > ATTACK_HEIGHT) {
      return { tone: 'bad', title: '送對手扣殺', body: `球經過對手面前還有 ${t.atOppLine.toFixed(2)} 公尺高，站在廚房線的對手可以直接往下壓。` };
    }
    return { tone: 'warn', title: '太深，對手可以直接截擊', body: '球落在廚房外，對手不必等落地就能截擊，你還來不及上網。目標是對方廚房裡。' };
  }
  if (t.bounceApex > ATTACK_HEIGHT) {
    return { tone: 'warn', title: '彈得太高', body: `弧線太高，落地後彈到 ${t.bounceApex.toFixed(2)} 公尺，高過網子，對手可以攻擊。把最高點降低一點。` };
  }
  if (t.netMargin < 0.15) {
    return { tone: 'warn', title: '太貼網', body: `只高過網 ${Math.round(t.netMargin * 100)} 公分，稍微失手就掛網。頂點再拉高一點比較保險。` };
  }
  return { tone: 'good', title: '好球！', body: '球落在對方廚房裡、彈起低於網高，對手只能往上挑回來，你有時間上網。' };
};

const TONE = {
  good: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  warn: 'bg-amber-50 border-amber-200 text-amber-800',
  bad: 'bg-rose-50 border-rose-200 text-rose-800',
} as const;
const TONE_ICON = { good: '✓', warn: '!', bad: '✕' } as const;
const TONE_DOT = { good: 'bg-emerald-500', warn: 'bg-amber-500', bad: 'bg-rose-500' } as const;

const pathD = (t: ShotTrace) => t.pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.z).toFixed(1)},${sy(p.y).toFixed(1)}`).join('');

/** 簡化的人形（真實身高 1.7 m） */
const Person = ({ z, color, label, crouch = 0 }: { z: number; color: string; label: string; crouch?: number }) => {
  const x = sx(z);
  const h = 1.7 - crouch;
  return (
    <g>
      <circle cx={x} cy={sy(h - 0.12)} r={0.12 * PX} fill={color} />
      <rect x={x - 0.17 * PX} y={sy(h - 0.26)} width={0.34 * PX} height={(h - 0.26 - 0.85 + crouch * 0.4) * PX} rx={6} fill={color} />
      <path d={`M${x - 0.1 * PX},${sy(0.85 - crouch * 0.4)} L${x - 0.16 * PX},${GROUND} M${x + 0.1 * PX},${sy(0.85 - crouch * 0.4)} L${x + 0.16 * PX},${GROUND}`} stroke={color} strokeWidth={9} strokeLinecap="round" />
      <text x={x} y={GROUND + 28} textAnchor="middle" fontSize={17} fontWeight={700} fill="#475569">
        {label}
      </text>
    </g>
  );
};

const TrajectoryLab = () => {
  const [apex, setApex] = useState(2.2);
  const [depth, setDepth] = useState(1.4);
  const [compare, setCompare] = useState(false);
  const [run, setRun] = useState(0);
  const shot = useMemo(() => traceDrop(apex, depth), [apex, depth]);
  const drive = useMemo(() => traceDrive(), []);
  const v = verdict(shot);
  const preset = PRESETS.find((p) => Math.abs(p.apex - apex) < 0.01 && Math.abs(p.depth - depth) < 0.01)?.key;

  // 球沿著軌跡飛（真實時間），參數一變就重播
  const ball = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const el = ball.current;
    if (!el) return;
    const pts = shot.pts;
    const end = pts[pts.length - 1].t;
    let raf = 0;
    const start = performance.now() + 350;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const tick = (now: number) => {
      const t = reduce ? shot.land?.t ?? end : Math.min(end, Math.max(0, (now - start) / 1000));
      let i = 1;
      while (i < pts.length - 1 && pts[i].t < t) i++;
      const a = pts[i - 1];
      const b = pts[i];
      const k = b.t > a.t ? Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))) : 1;
      el.setAttribute('cx', sx(a.z + (b.z - a.z) * k).toFixed(1));
      el.setAttribute('cy', sy(a.y + (b.y - a.y) * k).toFixed(1));
      if (t < end && !reduce) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shot, run]);

  // 對手要等多久才碰得到球：球先落在廚房裡＝落地後彈到最高點；否則在廚房線直接截擊
  const oppHitT = shot.land && shot.atOppLine === null ? shot.land.t + 0.3 : shot.pts.find((p) => p.z <= OPP_LINE_Z)?.t ?? shot.land?.t ?? 0;
  const runDist = Math.max(0, oppHitT * RUN_SPEED);
  const reachZ = Math.max(COURT.kitchen, HITTER_Z - runDist);
  const apexPt = shot.pts.reduce((a, p) => (p.y > a.y ? p : a), shot.pts[0]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => {
              setApex(p.apex);
              setDepth(p.depth);
              setRun((n) => n + 1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              preset === p.key ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' : 'bg-white text-neutral-700 border-neutral-200 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCompare((c) => !c)}
          aria-pressed={compare}
          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
            compare ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-sky-700 border-sky-200 hover:border-sky-400'
          }`}
        >
          {compare ? '隱藏抽球對照' : '對照：抽球'}
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-neutral-100 bg-gradient-to-b from-sky-50 via-white to-emerald-50/60">
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-auto block [&_text]:text-[26px] sm:[&_text]:text-[16px]" role="img" aria-label={`第三球下切側視圖：最高點 ${apex.toFixed(1)} 公尺，${v.title}`}>
          <defs>
            <linearGradient id="tl-path" x1="0" x2="1">
              <stop offset="0" stopColor="#10b981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
            <pattern id="tl-net" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0,0 L8,8 M8,0 L0,8" stroke="#334155" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* 場地 */}
          <rect x={sx(COURT.halfLength)} y={GROUND} width={sx(-COURT.halfLength) - sx(COURT.halfLength)} height={10} fill="#1e6091" />
          <rect x={sx(COURT.kitchen)} y={GROUND} width={sx(-COURT.kitchen) - sx(COURT.kitchen)} height={10} fill="#3b82c4" />
          <text x={sx(COURT.kitchen / 2)} y={GROUND + 48} textAnchor="middle" fontSize={15} fill="#64748b">
            廚房
          </text>
          <text x={sx(-COURT.kitchen / 2)} y={GROUND + 48} textAnchor="middle" fontSize={15} fill="#64748b">
            對方廚房
          </text>

          {/* 對手攻擊區 */}
          <rect x={sx(OPP_LINE_Z) - 0.45 * PX} y={sy(2.3)} width={0.9 * PX} height={(2.3 - ATTACK_HEIGHT) * PX} rx={10} fill="#f43f5e" opacity={0.1} />
          <text x={sx(OPP_LINE_Z)} y={sy(2.3) - 8} textAnchor="middle" fontSize={15} fontWeight={700} fill="#e11d48">
            對手攻擊區
          </text>

          {/* 上網距離 */}
          {shot.land && shot.land.z < 0 && (
            <g>
              <line x1={sx(HITTER_Z)} x2={sx(reachZ)} y1={GROUND - 6} y2={GROUND - 6} stroke="#0f172a" strokeWidth={3} strokeDasharray="2 6" strokeLinecap="round" />
              <path d={`M${sx(reachZ) - 9},${GROUND - 12} L${sx(reachZ) + 1},${GROUND - 6} L${sx(reachZ) - 9},${GROUND}`} fill="none" stroke="#0f172a" strokeWidth={3} strokeLinecap="round" />
            </g>
          )}

          {/* 球網 */}
          <rect x={sx(0) - 3} y={sy(COURT.netCenterHeight)} width={6} height={COURT.netCenterHeight * PX} fill="url(#tl-net)" />
          <line x1={sx(0)} x2={sx(0)} y1={sy(COURT.netCenterHeight)} y2={GROUND} stroke="#0f172a" strokeWidth={1.5} />
          <rect x={sx(0) - 4} y={sy(COURT.netCenterHeight) - 3} width={8} height={5} rx={1.5} fill="#f8fafc" stroke="#0f172a" strokeWidth={1} />

          <Person z={HITTER_Z + 0.2} color="#059669" label="你" crouch={0.25} />
          <Person z={OPP_LINE_Z - 0.35} color="#64748b" label="對手" />

          {/* 抽球對照 */}
          {compare && <path d={pathD(drive)} fill="none" stroke="#0284c7" strokeWidth={3} strokeDasharray="10 8" opacity={0.75} />}

          {/* 下切球路 */}
          <m.path
            key={`${apex}-${depth}-${run}`}
            d={pathD(shot)}
            fill="none"
            stroke="url(#tl-path)"
            strokeWidth={4.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: Math.min(1.6, shot.pts[shot.pts.length - 1].t), ease: 'linear', delay: 0.35 }}
          />
          {/* 最高點 */}
          <line x1={sx(apexPt.z)} x2={sx(apexPt.z)} y1={sy(apexPt.y) + 8} y2={GROUND} stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 5" />
          <text x={sx(apexPt.z)} y={sy(apexPt.y) - 12} textAnchor="middle" fontSize={16} fontWeight={800} fill="#047857">
            最高點 {apexPt.y.toFixed(1)} m
          </text>
          {shot.land && shot.land.z < 0 && <circle cx={sx(shot.land.z)} cy={GROUND} r={7} fill="none" stroke="#047857" strokeWidth={3} />}
          <circle ref={ball} cx={sx(HITTER_Z)} cy={sy(0.45)} r={8} fill="#e6f53a" stroke="#a3a10f" strokeWidth={1.5} />
        </svg>
      </div>

      {/* 控制 */}
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        <label className="block">
          <span className="flex justify-between text-sm font-semibold text-neutral-700 mb-1.5">
            弧線最高點 <span className="text-emerald-700 tabular-nums">{apex.toFixed(2)} m</span>
          </span>
          <input type="range" min={0.9} max={4} step={0.05} value={apex} onChange={(e) => setApex(+e.target.value)} className="w-full accent-emerald-600" />
        </label>
        <label className="block">
          <span className="flex justify-between text-sm font-semibold text-neutral-700 mb-1.5">
            落點（離網多遠） <span className="text-emerald-700 tabular-nums">{depth.toFixed(1)} m</span>
          </span>
          <input type="range" min={0.4} max={5.5} step={0.1} value={depth} onChange={(e) => setDepth(+e.target.value)} className="w-full accent-emerald-600" />
        </label>
      </div>

      <div className={`mt-5 rounded-xl border p-4 flex gap-3 ${TONE[v.tone]}`} aria-live="polite">
        <span className={`flex-shrink-0 w-7 h-7 rounded-full text-white text-sm font-black flex items-center justify-center ${TONE_DOT[v.tone]}`}>{TONE_ICON[v.tone]}</span>
        <div>
          <div className="font-bold">{v.title}</div>
          <div className="text-sm leading-relaxed opacity-90">{v.body}</div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ['過網高度', shot.netMargin > 0 ? `${Math.round(shot.netMargin * 100)} cm` : '掛網'],
          ['落點', shot.land && shot.land.z < 0 ? (Math.abs(shot.land.z) <= COURT.kitchen ? `廚房內 ${Math.abs(shot.land.z).toFixed(1)} m` : `廚房外 ${Math.abs(shot.land.z).toFixed(1)} m`) : '—'],
          ['彈起高度', shot.land && shot.land.z < 0 ? `${Math.round(shot.bounceApex * 100)} cm` : '—'],
          ['你能往前衝', shot.land && shot.land.z < 0 ? (runDist >= HITTER_Z - COURT.kitchen ? '衝得到廚房線' : `${runDist.toFixed(1)} m`) : '—'],
        ].map(([k, val]) => (
          <div key={k} className="bg-white rounded-xl border border-neutral-100 p-3">
            <dt className="text-xs text-neutral-400 font-semibold">{k}</dt>
            <dd className="text-neutral-900 font-bold mt-0.5 tabular-nums">{val}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
        球路用本站匹克球遊戲的物理引擎計算（26 g 戶外球、空氣阻力、旋轉與落地反彈），從底線、膝蓋高度出手；網高 34 吋（86 cm）。
        「能往前衝」以每秒 3.5 公尺估算到對手觸球前。
      </p>
    </div>
  );
};

export default TrajectoryLab;
