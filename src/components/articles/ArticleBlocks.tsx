/**
 * ArticleBlocks — 專欄文章可嵌入的互動元件
 *
 * 文章的 section 除了 HTML 內文外，可再掛一個 block，用來放圖表、
 * 互動測驗、真實球拍卡等。所有需要球拍資料的區塊都直接讀資料庫，
 * 不重複維護一份。
 *
 * 視覺化規範：
 *  - 四色分類配色沿用站上評分色（力量橘／控球綠／旋轉紫／容錯藍），
 *    已通過色盲安全驗證（最差相鄰對 deutan ΔE 10.9、normal ΔE 19.8）
 *  - 因色塊對比低於 3:1，一律附可見數值標籤作為輔助編碼
 *  - 文字使用中性色，不用色塊顏色，識別靠色塊本身
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PADDLE_DATABASE, getPaddleBySlug, getArchetype, ARCHETYPE_INFO,
  type PaddleArchetype,
} from '../../data/paddleDatabase';
import PaddleVisual from '../equipment/PaddleVisual';

/* ===== 型別 ===== */
export type ArticleBlock =
  | { type: 'paddle-quiz' }
  | { type: 'thickness-explorer' }
  | { type: 'swing-weight-scale' }
  | { type: 'price-tiers' }
  | { type: 'face-decoder' }
  | { type: 'core-timeline' }
  | { type: 'paddle-cards'; slugs: string[]; caption?: string }
  | { type: 'checklist'; title: string; items: { label: string; hint?: string }[] }
  | { type: 'do-dont'; dos: string[]; donts: string[] }
  | { type: 'callout'; tone: 'tip' | 'warn' | 'info'; title: string; body: string };

const CARD = 'rounded-2xl border border-neutral-200 bg-white';

/* ===== 1. 互動選拍測驗 ===== */
const QUIZ_Q: { q: string; opts: { label: string; scores: Partial<Record<PaddleArchetype, number>> }[] }[] = [
  {
    q: '你打球時最常出現的狀況是？',
    opts: [
      { label: '球常常打不到拍面中央', scores: { 全能型: 2 } },
      { label: '想殺球但球速不夠快', scores: { 爆發型: 2 } },
      { label: '網前小球老是控制不好', scores: { 控制型: 2 } },
      { label: '想製造角度但球不太轉', scores: { 旋轉型: 2 } },
    ],
  },
  {
    q: '你最想在球場上做到什麼？',
    opts: [
      { label: '穩穩把球打回去、少失誤', scores: { 全能型: 2, 控制型: 1 } },
      { label: '一拍把球轟死', scores: { 爆發型: 2 } },
      { label: '在網前跟對手耗到他先失誤', scores: { 控制型: 2 } },
      { label: '用弧線和落點讓對手接不到', scores: { 旋轉型: 2, 控制型: 1 } },
    ],
  },
  {
    q: '你的球齡與頻率？',
    opts: [
      { label: '剛開始，一個月打幾次', scores: { 全能型: 2 } },
      { label: '打半年到一年，每週一兩次', scores: { 控制型: 1, 全能型: 1 } },
      { label: '一年以上，每週三次以上', scores: { 爆發型: 1, 旋轉型: 1 } },
      { label: '有在打比賽', scores: { 爆發型: 1, 旋轉型: 1, 控制型: 1 } },
    ],
  },
];

const PaddleQuiz = () => {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const done = step >= QUIZ_Q.length;

  const pick = (s: Partial<Record<PaddleArchetype, number>>) => {
    setScores(prev => {
      const next = { ...prev };
      Object.entries(s).forEach(([k, v]) => { next[k] = (next[k] ?? 0) + (v ?? 0); });
      return next;
    });
    setStep(step + 1);
  };

  const winner = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '全能型') as PaddleArchetype;
  const info = ARCHETYPE_INFO[winner];
  const picks = PADDLE_DATABASE
    .filter(p => getArchetype(p) === winner)
    .sort((a, b) => {
      const av = (a.rating.power + a.rating.control + a.rating.spin + a.rating.forgiveness) / a.priceTWD;
      const bv = (b.rating.power + b.rating.control + b.rating.spin + b.rating.forgiveness) / b.priceTWD;
      return bv - av;
    })
    .slice(0, 3);

  return (
    <div className={`${CARD} p-5 my-7 not-prose`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">🧭</span>
        <h4 className="text-base font-black text-neutral-900 m-0">30 秒找出你的拍型</h4>
      </div>
      <p className="text-xs text-neutral-500 mb-4 m-0">回答三題，我們用本站的拍型分類邏輯給你方向</p>

      {!done ? (
        <div>
          <div className="flex gap-1.5 mb-4">
            {QUIZ_Q.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
            ))}
          </div>
          <p className="text-sm font-bold text-neutral-900 mb-3 m-0">
            <span className="text-emerald-600">Q{step + 1}.</span> {QUIZ_Q[step].q}
          </p>
          <div className="grid gap-2">
            {QUIZ_Q[step].opts.map(o => (
              <button
                key={o.label}
                onClick={() => pick(o.scores)}
                className="text-left text-sm px-4 py-2.5 rounded-xl border border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50 transition font-medium text-neutral-700"
              >{o.label}</button>
            ))}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: `${info.color}12`, border: `1px solid ${info.color}44` }}>
            <div className="text-[10px] font-black tracking-widest uppercase text-neutral-400 mb-1">你的拍型方向</div>
            <div className="text-2xl font-black text-neutral-900 mb-1.5">{winner}</div>
            <p className="text-sm text-neutral-700 leading-relaxed m-0">{info.desc}</p>
            <p className="text-xs text-neutral-500 leading-relaxed mt-1.5 m-0">{info.play}</p>
          </div>
          <div className="text-xs font-bold text-neutral-500 mb-2">這個定位裡 CP 值最高的三支</div>
          <div className="grid sm:grid-cols-3 gap-2.5 mb-3">
            {picks.map(p => (
              <Link key={p.slug} to={`/paddles/${p.slug}`} className="flex gap-2.5 p-2.5 rounded-xl border border-neutral-200 hover:border-emerald-300 hover:shadow-sm transition no-underline">
                <PaddleVisual paddle={p} className="w-9 h-16 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] font-bold text-neutral-400 uppercase truncate">{p.brand}</div>
                  <div className="text-xs font-black text-neutral-900 leading-tight line-clamp-2">{p.model}</div>
                  <div className="text-xs font-black text-emerald-600 mt-0.5">NT$ {p.priceTWD.toLocaleString()}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/paddles" className="text-xs font-black text-emerald-600 no-underline hover:underline">看全部 {winner} 球拍 →</Link>
            <button onClick={() => { setStep(0); setScores({}); }} className="text-xs text-neutral-400 hover:text-neutral-700 transition">重新測一次</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

/* ===== 2. 厚度互動比較 ===== */
const THICKNESS = [
  { mm: 13, label: '13mm', dwell: 25, feel: '出球最快、回饋最直接', good: '力量取向、快速平抽', bad: '小球容錯低，需自帶手感' },
  { mm: 14, label: '14mm', dwell: 45, feel: '力量與手感的折衷', good: '進攻型的主流厚度，揮速快', bad: '控球仍不如 16mm' },
  { mm: 16, label: '16mm', dwell: 72, feel: '停留明顯較長，能「留住」球一瞬間', good: '市場主流，新手最保險', bad: '出球速度不如薄芯' },
  { mm: 20, label: '20mm', dwell: 100, feel: '極長停留，小球黏拍感最強', good: '網前控制力最佳', bad: '要自帶揮速才打得出力量' },
];

const ThicknessExplorer = () => {
  const [sel, setSel] = useState(2);
  const t = THICKNESS[sel];
  return (
    <div className={`${CARD} p-5 my-7 not-prose`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">📏</span>
        <h4 className="text-base font-black text-neutral-900 m-0">核心厚度互動比較</h4>
      </div>
      <p className="text-xs text-neutral-500 mb-4 m-0">點選厚度，看它在實戰上代表什麼</p>

      <div className="flex gap-2 mb-4">
        {THICKNESS.map((x, i) => (
          <button
            key={x.mm}
            onClick={() => setSel(i)}
            className={`flex-1 py-2 rounded-xl text-sm font-black transition ${
              i === sel ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            }`}
          >{x.label}</button>
        ))}
      </div>

      {/* 剖面示意：核心厚度視覺化 */}
      <div className="flex items-end justify-center gap-3 h-24 mb-4 px-2">
        {THICKNESS.map((x, i) => (
          <button key={x.mm} onClick={() => setSel(i)} className="flex-1 flex flex-col items-center justify-end h-full group">
            <span className={`text-[10px] font-bold mb-1 ${i === sel ? 'text-neutral-900' : 'text-neutral-400'}`}>{x.mm}mm</span>
            <div
              className={`w-full rounded-t-md transition-all ${i === sel ? 'bg-emerald-500' : 'bg-neutral-200 group-hover:bg-neutral-300'}`}
              style={{ height: `${(x.mm / 20) * 100}%` }}
            />
          </button>
        ))}
      </div>

      {/* 停留時間相對長度 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-neutral-500">球在拍面的停留感（相對）</span>
          <span className="text-xs font-black text-neutral-900">{t.dwell}%</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            animate={{ width: `${t.dwell}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          />
        </div>
        <p className="text-[10px] text-neutral-400 mt-1 m-0">示意用相對值，非實測毫秒數</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={sel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid sm:grid-cols-3 gap-2.5">
          <div className="bg-neutral-50 rounded-xl p-3">
            <div className="text-[10px] font-black text-neutral-400 mb-1">手感</div>
            <div className="text-xs text-neutral-700 leading-relaxed">{t.feel}</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3">
            <div className="text-[10px] font-black text-emerald-600 mb-1">適合</div>
            <div className="text-xs text-neutral-700 leading-relaxed">{t.good}</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <div className="text-[10px] font-black text-amber-700 mb-1">取捨</div>
            <div className="text-xs text-neutral-700 leading-relaxed">{t.bad}</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ===== 3. 揮重量尺 ===== */
const SW_BANDS = [
  { label: '新手', from: 105, to: 115, color: '#0ea5e9', note: '揮動輕鬆、手速快，網前反應得過來' },
  { label: '中階', from: 112, to: 118, color: '#10b981', note: '力量與靈活的平衡點' },
  { label: '進階', from: 115, to: 122, color: '#f97316', note: '穿透力強、穩定，但需要體能支撐' },
];

const SwingWeightScale = () => {
  const MIN = 100, MAX = 128;
  const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;
  return (
    <div className={`${CARD} p-5 my-7 not-prose`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">⚖️</span>
        <h4 className="text-base font-black text-neutral-900 m-0">揮重對照尺</h4>
      </div>
      <p className="text-xs text-neutral-500 mb-5 m-0">揮重是揮動時的轉動慣量，跟秤上的重量不同。區間會重疊，因為這是建議而非硬性分界。</p>

      <div className="relative h-28 mb-2">
        {SW_BANDS.map((b, i) => (
          <div key={b.label} className="absolute h-8 flex items-center" style={{ left: `${pct(b.from)}%`, width: `${pct(b.to) - pct(b.from)}%`, top: i * 34 }}>
            <div className="w-full h-6 rounded-md flex items-center justify-between px-2" style={{ backgroundColor: b.color }}>
              <span className="text-[10px] font-black text-white">{b.label}</span>
              <span className="text-[10px] font-bold text-white/90 tabular-nums">{b.from}–{b.to}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="relative h-4 border-t border-neutral-200">
        {[100, 105, 110, 115, 120, 125].map(v => (
          <span key={v} className="absolute text-[9px] text-neutral-400 tabular-nums -translate-x-1/2" style={{ left: `${pct(v)}%` }}>{v}</span>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-2.5 mt-4">
        {SW_BANDS.map(b => (
          <div key={b.label} className="bg-neutral-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: b.color }} />
              <span className="text-[11px] font-black text-neutral-800">{b.label} {b.from}–{b.to}</span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed m-0">{b.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ===== 4. 價格區間 ===== */
const TIERS = [
  { range: '1,000–2,000', label: '玻纖入門', get: ['甜蜜點大、容錯高', '輕量好上手', '不容易打壞'], miss: ['旋轉能力弱', '進步後很快想換'], w: 22 },
  { range: '3,000–5,000', label: '入門碳纖', get: ['原始碳纖，旋轉躍升', '熱壓結構出球扎實', '性能約旗艦八成'], miss: ['細節不如旗艦'], w: 55, best: true },
  { range: '6,000–10,000', label: '旗艦', get: ['甜蜜點分布更均勻', '震動控制更好', '最新核心技術'], miss: ['新手感受不到差異', '可能放大技術缺陷'], w: 100 },
];

const PriceTiers = () => (
  <div className={`${CARD} p-5 my-7 not-prose`}>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">💰</span>
      <h4 className="text-base font-black text-neutral-900 m-0">預算區間你買到什麼</h4>
    </div>
    <p className="text-xs text-neutral-500 mb-4 m-0">橫條長度代表相對價位，不是性能——性能的提升在 3–5 千之後就開始遞減</p>
    <div className="space-y-3">
      {TIERS.map(t => (
        <div key={t.range} className={`rounded-2xl p-4 ${t.best ? 'bg-emerald-50 border border-emerald-200' : 'bg-neutral-50'}`}>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm font-black text-neutral-900">NT$ {t.range}</span>
            <span className="text-[11px] font-bold text-neutral-500">{t.label}</span>
            {t.best && <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">CP 值最高</span>}
          </div>
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full bg-neutral-800" style={{ width: `${t.w}%` }} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-black text-emerald-600 mb-1">你會得到</div>
              <ul className="m-0 pl-0 list-none space-y-0.5">
                {t.get.map(g => <li key={g} className="text-[11px] text-neutral-700 flex gap-1.5"><span className="text-emerald-500">✓</span>{g}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[10px] font-black text-neutral-400 mb-1">你不會得到</div>
              <ul className="m-0 pl-0 list-none space-y-0.5">
                {t.miss.map(g => <li key={g} className="text-[11px] text-neutral-500 flex gap-1.5"><span className="text-neutral-300">✗</span>{g}</li>)}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ===== 5. 面板材質對照 ===== */
const FACES = [
  { name: '玻璃纖維', spin: 55, power: 75, forgive: 95, note: '彈性高、甜蜜點大，新手友善；旋轉最弱' },
  { name: '石墨', spin: 65, power: 72, forgive: 82, note: '手感細膩、回饋清晰的經典材質' },
  { name: 'T700 碳纖', spin: 85, power: 92, forgive: 80, note: '高模數碳纖，剛性與旋轉兼顧' },
  { name: '原始碳纖', spin: 96, power: 88, forgive: 84, note: '表面不上漆、摩擦力最高，旋轉主流選擇' },
  { name: 'Kevlar 編織', spin: 93, power: 86, forgive: 88, note: '韌性高、形變小，旋轉衰減較慢' },
];
const FACE_METRICS = [
  { key: 'spin' as const, label: '旋轉', color: '#8b5cf6' },
  { key: 'power' as const, label: '力量', color: '#f97316' },
  { key: 'forgive' as const, label: '容錯', color: '#0ea5e9' },
];

const FaceDecoder = () => {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className={`${CARD} p-5 my-7 not-prose`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">🧬</span>
        <h4 className="text-base font-black text-neutral-900 m-0">拍面材質特性對照</h4>
      </div>
      <p className="text-xs text-neutral-500 mb-3 m-0">相對比較值，非實測數據。滑過或點選看說明。</p>

      {/* 圖例 */}
      <div className="flex flex-wrap gap-3 mb-3">
        {FACE_METRICS.map(m => (
          <span key={m.key} className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: m.color }} />{m.label}
          </span>
        ))}
      </div>

      <div className="space-y-2.5">
        {FACES.map(f => (
          <div
            key={f.name}
            onMouseEnter={() => setHover(f.name)}
            onMouseLeave={() => setHover(null)}
            onClick={() => setHover(hover === f.name ? null : f.name)}
            className={`rounded-xl p-3 cursor-pointer transition ${hover === f.name ? 'bg-neutral-50 ring-1 ring-neutral-200' : ''}`}
          >
            <div className="text-xs font-black text-neutral-800 mb-1.5">{f.name}</div>
            <div className="space-y-1">
              {FACE_METRICS.map(m => (
                <div key={m.key} className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400 w-6 shrink-0">{m.label}</span>
                  <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${f[m.key]}%`, backgroundColor: m.color }} />
                  </div>
                  <span className="text-[10px] font-black text-neutral-700 w-6 text-right tabular-nums">{f[m.key]}</span>
                </div>
              ))}
            </div>
            <AnimatePresence>
              {hover === f.name && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="text-[11px] text-neutral-600 leading-relaxed mt-2 mb-0 overflow-hidden"
                >{f.note}</motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ===== 6. 核心技術演進時間軸 ===== */
const CORE_ERA = [
  { era: '~2015', name: 'Nomex 紙蜂窩', desc: '出球脆彈、聲音大、震手感明顯。早期主流。' },
  { era: '2016–2022', name: '聚合物蜂窩', desc: '軟硬適中、成本與性能平衡，至今仍最普遍。缺點是會隨時間塌陷衰減。' },
  { era: '2023–', name: '熱壓成型', desc: '整支一體成型、邊框灌注發泡。剛性高、出球彈度大，中高階主流工藝。' },
  { era: '2025–', name: '發泡核心', desc: '以發泡取代蜂窩，甜蜜點分布均勻且不易衰減，耐用度明顯提升。' },
];

const CoreTimeline = () => (
  <div className={`${CARD} p-5 my-7 not-prose`}>
    <div className="flex items-center gap-2 mb-4">
      <span className="text-lg">🧱</span>
      <h4 className="text-base font-black text-neutral-900 m-0">核心結構的演進</h4>
    </div>
    <div className="relative pl-6">
      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-neutral-200 via-emerald-300 to-emerald-500" />
      {CORE_ERA.map((e, i) => (
        <motion.div
          key={e.name}
          initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="relative pb-5 last:pb-0"
        >
          <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${i === CORE_ERA.length - 1 ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
          <div className="text-[10px] font-black text-neutral-400 tabular-nums">{e.era}</div>
          <div className="text-sm font-black text-neutral-900">{e.name}</div>
          <p className="text-[11px] text-neutral-600 leading-relaxed mt-0.5 mb-0">{e.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

/* ===== 7. 嵌入真實球拍卡 ===== */
const PaddleCards = ({ slugs, caption }: { slugs: string[]; caption?: string }) => {
  const items = slugs.map(getPaddleBySlug).filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="my-7 not-prose">
      {caption && <p className="text-xs font-bold text-neutral-500 mb-2.5 m-0">{caption}</p>}
      <div className="grid sm:grid-cols-3 gap-3">
        {items.map(p => p && (
          <Link
            key={p.slug} to={`/paddles/${p.slug}`}
            className="group bg-white rounded-2xl border border-neutral-200 p-3.5 hover:shadow-lg hover:border-emerald-300 transition no-underline"
          >
            <div
              className="h-28 rounded-xl mb-2.5 flex items-center justify-center"
              style={{ background: `linear-gradient(160deg, ${p.colors.face}1a, ${p.colors.face}06)` }}
            >
              <PaddleVisual paddle={p} className="w-14 h-24 group-hover:scale-105 transition-transform" />
            </div>
            <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide truncate">{p.brand}</div>
            <div className="text-sm font-black text-neutral-900 leading-tight line-clamp-2 mb-1">{p.model}</div>
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: ARCHETYPE_INFO[getArchetype(p)].color }}>
                {getArchetype(p)}
              </span>
              <span className="text-[10px] text-neutral-400">{p.thickness} · {p.weight}</span>
            </div>
            <div className="text-sm font-black text-emerald-600">NT$ {p.priceTWD.toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

/* ===== 8. 可勾選清單 ===== */
const Checklist = ({ title, items }: { title: string; items: { label: string; hint?: string }[] }) => {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setDone(p => {
    const n = new Set(p);
    if (n.has(i)) n.delete(i); else n.add(i);
    return n;
  });
  return (
    <div className={`${CARD} p-5 my-7 not-prose`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-base font-black text-neutral-900 m-0">✅ {title}</h4>
        <span className="text-xs font-bold text-neutral-400 tabular-nums">{done.size}/{items.length}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((it, i) => (
          <button
            key={i} onClick={() => toggle(i)}
            className={`w-full text-left flex gap-2.5 p-2.5 rounded-xl transition ${done.has(i) ? 'bg-emerald-50' : 'hover:bg-neutral-50'}`}
          >
            <span className={`mt-0.5 w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center text-[10px] transition ${
              done.has(i) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-neutral-300'
            }`}>{done.has(i) && '✓'}</span>
            <span className="min-w-0">
              <span className={`block text-sm font-semibold ${done.has(i) ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}>{it.label}</span>
              {it.hint && <span className="block text-[11px] text-neutral-500 leading-relaxed mt-0.5">{it.hint}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ===== 9. 該做／不該做 ===== */
const DoDont = ({ dos, donts }: { dos: string[]; donts: string[] }) => (
  <div className="grid sm:grid-cols-2 gap-3 my-7 not-prose">
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-xs font-black text-emerald-700 mb-2">✓ 該這樣做</div>
      <ul className="m-0 pl-0 list-none space-y-1.5">
        {dos.map(d => <li key={d} className="text-[13px] text-neutral-700 leading-relaxed flex gap-1.5"><span className="text-emerald-500 shrink-0">·</span>{d}</li>)}
      </ul>
    </div>
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <div className="text-xs font-black text-red-700 mb-2">✗ 別這樣做</div>
      <ul className="m-0 pl-0 list-none space-y-1.5">
        {donts.map(d => <li key={d} className="text-[13px] text-neutral-700 leading-relaxed flex gap-1.5"><span className="text-red-400 shrink-0">·</span>{d}</li>)}
      </ul>
    </div>
  </div>
);

/* ===== 10. 提示框 ===== */
const TONE = {
  tip: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '💡', label: 'text-emerald-700' },
  warn: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️', label: 'text-amber-700' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'ℹ️', label: 'text-blue-700' },
};

const Callout = ({ tone, title, body }: { tone: 'tip' | 'warn' | 'info'; title: string; body: string }) => {
  const t = TONE[tone];
  return (
    <div className={`rounded-2xl border ${t.border} ${t.bg} p-4 my-7 not-prose`}>
      <div className={`text-sm font-black ${t.label} mb-1.5`}>{t.icon} {title}</div>
      <p className="text-[13px] text-neutral-700 leading-relaxed m-0">{body}</p>
    </div>
  );
};

/* ===== 分派 ===== */
const ArticleBlockRenderer = ({ block }: { block: ArticleBlock }) => {
  switch (block.type) {
    case 'paddle-quiz': return <PaddleQuiz />;
    case 'thickness-explorer': return <ThicknessExplorer />;
    case 'swing-weight-scale': return <SwingWeightScale />;
    case 'price-tiers': return <PriceTiers />;
    case 'face-decoder': return <FaceDecoder />;
    case 'core-timeline': return <CoreTimeline />;
    case 'paddle-cards': return <PaddleCards slugs={block.slugs} caption={block.caption} />;
    case 'checklist': return <Checklist title={block.title} items={block.items} />;
    case 'do-dont': return <DoDont dos={block.dos} donts={block.donts} />;
    case 'callout': return <Callout tone={block.tone} title={block.title} body={block.body} />;
    default: return null;
  }
};

export default ArticleBlockRenderer;
