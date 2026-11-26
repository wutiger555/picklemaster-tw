import { useState } from 'react';
import { m } from 'framer-motion';

/**
 * 握拍對照：從拍柄底部看八個切面、虎口落在哪一面，以及這個握法在正手／反手擊球點的拍面角度。
 * 拍面角度是示意（正值＝拍面朝上打開），用來比較三種握法的差別，不是量測值。
 */

interface Grip {
  key: string;
  name: string;
  bevel: number;
  fh: number;
  bh: number;
  tag: string;
  body: string;
}

const GRIPS: Grip[] = [
  {
    key: 'continental',
    name: '大陸式',
    bevel: 2,
    fh: 12,
    bh: 12,
    tag: '推薦',
    body: '正手、反手是同一個拍面角度：拍面都略微打開，dink、下切、截擊、抽球都打得到，網前快速對打完全不用換握。',
  },
  {
    key: 'eastern',
    name: '東方式',
    bevel: 3,
    fh: 0,
    bh: 42,
    tag: '正手好抽',
    body: '正手拍面垂直，抽球很舒服；但同一個握法打反手，拍面會大開、球容易冒高。網前來不及換握時就會吃虧。',
  },
  {
    key: 'semiwestern',
    name: '半西方式',
    bevel: 4,
    fh: -22,
    bh: 66,
    tag: '不建議',
    body: '正手拍面朝下，適合刷上旋大力抽球；但低球和 dink 很難往上撈，反手幾乎無法直接打。網球選手常帶著這個習慣來。',
  },
];

const CX = 120;
const CY = 118;
const RAD = 78;
/** 從正上方順時針量的角度 → SVG 座標 */
const at = (deg: number, r: number) => [CX + r * Math.sin((deg * Math.PI) / 180), CY - r * Math.cos((deg * Math.PI) / 180)] as const;

const Handle = ({ bevel }: { bevel: number }) => {
  const verts = Array.from({ length: 8 }, (_, k) => at(k * 45 - 22.5, RAD));
  const a = (bevel - 1) * 45;
  const [p0, p1] = [at(a - 22.5, RAD), at(a + 22.5, RAD)];
  const [lx, ly] = at(a, RAD + 26);
  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[260px] mx-auto block" role="img" aria-label={`拍柄底部視角：虎口對準第 ${bevel} 面`}>
      {/* 拍面（從拍柄底部看是一條直立的薄板） */}
      <rect x={CX - 7} y={8} width={14} height={224} rx={6} fill="#cbd5e1" opacity={0.45} />
      <text x={CX - 20} y={22} textAnchor="end" fontSize={11} fill="#94a3b8" fontWeight={700}>
        拍面 ←
      </text>
      <text x={CX + 20} y={22} fontSize={11} fill="#94a3b8" fontWeight={700}>
        → 拍面
      </text>
      <polygon points={verts.map((v) => v.join(',')).join(' ')} fill="#1f2937" stroke="#0f172a" strokeWidth={2} />
      {verts.map((_, k) => {
        const [tx, ty] = at(k * 45, RAD - 16);
        return (
          <text key={k} x={tx} y={ty + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill={k + 1 === bevel ? '#fde047' : '#64748b'}>
            {k + 1}
          </text>
        );
      })}
      <m.line initial={false} animate={{ x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1] }} transition={{ type: 'spring', stiffness: 160, damping: 18 }} stroke="#fde047" strokeWidth={7} strokeLinecap="round" />
      <m.g initial={false} animate={{ x: lx, y: ly }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
        <rect x={-21} y={-12} width={42} height={22} rx={11} fill="#fde047" />
        <text textAnchor="middle" y={4} fontSize={11} fontWeight={900} fill="#713f12">
          虎口
        </text>
      </m.g>
      <text x={CX} y={CY + 5} textAnchor="middle" fontSize={11} fill="#94a3b8" fontWeight={700}>
        拍柄底部
      </text>
    </svg>
  );
};

/** 側面看擊球瞬間的拍面：右邊是球網，箭頭是球大致飛出去的方向 */
const Face = ({ title, deg }: { title: string; deg: number }) => {
  const r = (deg * Math.PI) / 180;
  const px = 62;
  const py = 84;
  const top = [px - 34 * Math.sin(r), py - 34 * Math.cos(r)];
  const bot = [px + 34 * Math.sin(r), py + 34 * Math.cos(r)];
  const tip = [px + 78 * Math.cos(r), py - 78 * Math.sin(r)];
  const tone = deg > 30 ? { c: '#e11d48', t: '大開：球容易冒高' } : deg < -10 ? { c: '#d97706', t: '朝下：低球撈不起來' } : { c: '#059669', t: deg > 4 ? '略開：最好控制' : '垂直：適合抽球' };
  return (
    <div className="rounded-xl bg-white border border-neutral-100 p-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-bold text-neutral-800">{title}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color: tone.c }}>
          {deg > 0 ? `開 ${deg}°` : deg < 0 ? `關 ${-deg}°` : '0°'}
        </span>
      </div>
      <svg viewBox="0 0 200 140" className="w-full block" role="img" aria-label={`${title}拍面角度：${tone.t}`}>
        <line x1={0} x2={200} y1={132} y2={132} stroke="#e2e8f0" strokeWidth={2} />
        <rect x={180} y={86} width={5} height={46} fill="#94a3b8" />
        <text x={182} y={80} textAnchor="middle" fontSize={10} fill="#94a3b8" fontWeight={700}>
          網
        </text>
        <m.line initial={false} animate={{ x1: px, y1: py, x2: tip[0], y2: tip[1] }} transition={{ type: 'spring', stiffness: 140, damping: 18 }} stroke={tone.c} strokeWidth={2.5} strokeDasharray="4 4" />
        <m.circle initial={false} animate={{ cx: tip[0], cy: tip[1] }} transition={{ type: 'spring', stiffness: 140, damping: 18 }} r={5} fill="#e6f53a" stroke="#a3a10f" />
        <m.line initial={false} animate={{ x1: top[0], y1: top[1], x2: bot[0], y2: bot[1] }} transition={{ type: 'spring', stiffness: 140, damping: 18 }} stroke="#0f172a" strokeWidth={9} strokeLinecap="round" />
      </svg>
      <div className="text-xs font-semibold mt-1" style={{ color: tone.c }}>
        {tone.t}
      </div>
    </div>
  );
};

const PRESSURE = [
  { max: 3, label: '太鬆', note: '拍子在手裡晃，對方一抽就被打掉。', c: 'text-amber-600' },
  { max: 6, label: '剛好（平常保持）', note: '手腕可以輕鬆轉動，dink 和重置球手感最好。', c: 'text-emerald-600' },
  { max: 8, label: '擊球瞬間', note: '抽球、截擊下壓的那一下才短暫加到這裡，打完馬上放鬆。', c: 'text-sky-600' },
  { max: 10, label: '死握', note: '前臂僵硬、失去手感，軟球彈太高，打久了手肘也會痛。', c: 'text-rose-600' },
];

const GripExplorer = () => {
  const [g, setG] = useState(GRIPS[0]);
  const [force, setForce] = useState(5);
  const p = PRESSURE.find((z) => force <= z.max)!;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="握拍方式">
        {GRIPS.map((x) => (
          <button
            key={x.key}
            type="button"
            aria-pressed={g.key === x.key}
            onClick={() => setG(x)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
              g.key === x.key ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' : 'bg-white text-neutral-700 border-neutral-200 hover:border-emerald-300'
            }`}
          >
            {x.name}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${g.key === x.key ? 'bg-white/20' : 'bg-neutral-100 text-neutral-500'}`}>{x.tag}</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4 items-stretch">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 p-4 flex flex-col">
          <Handle bevel={g.bevel} />
          <p className="text-sm text-emerald-50/90 leading-relaxed mt-2">
            右手持拍、拍面直立，從拍柄底部看：虎口（拇指與食指之間的 V 字）壓在<b className="text-yellow-300">第 {g.bevel} 面</b>。
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Face title="正手擊球" deg={g.fh} />
            <Face title="反手擊球" deg={g.bh} />
          </div>
          <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-4 flex-1">
            <div className="font-bold text-neutral-900 mb-1">{g.name}握拍</div>
            <p className="text-sm text-neutral-700 leading-relaxed">{g.body}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-100 p-4 sm:p-5">
        <label className="block">
          <span className="flex flex-wrap justify-between gap-2 text-sm font-semibold text-neutral-700 mb-2">
            握力（滿分 10）
            <span className={`tabular-nums ${p.c}`}>
              {force} 分 · {p.label}
            </span>
          </span>
          <input type="range" min={1} max={10} step={1} value={force} onChange={(e) => setForce(+e.target.value)} className="w-full accent-emerald-600" />
        </label>
        <div className="mt-1 grid grid-cols-10 gap-0.5" aria-hidden>
          {Array.from({ length: 10 }, (_, k) => (
            <span key={k} className={`h-1.5 rounded-full ${k < 3 ? 'bg-amber-300' : k < 6 ? 'bg-emerald-400' : k < 8 ? 'bg-sky-400' : 'bg-rose-400'} ${k < force ? '' : 'opacity-25'}`} />
          ))}
        </div>
        <p className="text-sm text-neutral-600 leading-relaxed mt-3" aria-live="polite">
          {p.note}
        </p>
      </div>
      <p className="mt-3 text-xs text-neutral-400 leading-relaxed">拍面角度是示意，實際會隨手腕角度和擊球點高低變化；重點是比較：只有大陸式的正反手拍面一樣。</p>
    </div>
  );
};

export default GripExplorer;
