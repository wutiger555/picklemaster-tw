import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PADDLE_DATABASE, PADDLE_BRANDS, PADDLE_LEVELS, PADDLE_TAGS, MAX_COMPARE, getPaddleBySlug,
  getPurchaseChannels, CHANNEL_TYPE_META,
  type Paddle, type PaddleBrand, type PaddleLevel, type PaddleTag, type PurchaseChannelType,
} from '../data/paddleDatabase';
import PaddleVisual from '../components/equipment/PaddleVisual';
import PaddleCompareSheet from '../components/equipment/PaddleCompareSheet';
import SEOHead from '../components/common/SEOHead';

const LEVEL_COLORS: Record<PaddleLevel, string> = {
  新手: 'bg-slate-100 text-slate-700',
  中階: 'bg-blue-100 text-blue-700',
  進階: 'bg-purple-100 text-purple-700',
  職業: 'bg-rose-100 text-rose-700',
};

const TAG_COLORS: Record<PaddleTag, string> = {
  小紅書熱門: 'bg-red-50 text-red-600',
  CP值首選: 'bg-emerald-50 text-emerald-600',
  新手友善: 'bg-sky-50 text-sky-600',
  近期熱搜: 'bg-orange-50 text-orange-600',
  護肘友善: 'bg-teal-50 text-teal-600',
  高顏值: 'bg-pink-50 text-pink-600',
  電商爆款: 'bg-amber-50 text-amber-600',
  經典長青: 'bg-neutral-100 text-neutral-600',
};

const CHANNEL_STYLES: Record<PurchaseChannelType, string> = {
  'tw-official': 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  'tw-store': 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
  'global': 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100',
};

const RATING_ORDER: { key: keyof Paddle['rating']; label: string; color: string }[] = [
  { key: 'power', label: '力量', color: '#f97316' },
  { key: 'control', label: '控球', color: '#10b981' },
  { key: 'spin', label: '旋轉', color: '#8b5cf6' },
  { key: 'forgiveness', label: '容錯', color: '#0ea5e9' },
];

const avgRating = (p: Paddle) =>
  (p.rating.power + p.rating.control + p.rating.spin + p.rating.forgiveness) / 4;

/* ===== 編輯精選 ===== */
const FEATURED: { slug: string; title: string; reason: string }[] = [
  { slug: 'niupipo-mx07', title: '新手首選', reason: '千元有找的電商銷量王，第一支拍免煩惱' },
  { slug: 'ronbus-r1-16', title: 'CP 值之王', reason: '80 美金打出碳纖旗艦八成功力' },
  { slug: 'honolulu-j2k', title: '熱搜爆款', reason: 'Kevlar 編織面板，海外社群刷屏話題款' },
  { slug: 'selkirk-luxx-control-air-invikta', title: '控球天花板', reason: '20mm 超厚芯，網前 Dink 穩到犯規' },
  { slug: 'joola-perseus-pro-iv-14mm', title: '火力最強', reason: '力量評分 98 全場最高，殺球一錘定音' },
  { slug: 'paddletek-bantam-alw-c', title: '球后同款', reason: 'Anna Leigh Waters 親用，曬拍常客' },
];

/* ===== 情境快選 ===== */
interface Scenario {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  filter: (p: Paddle) => boolean;
  sort: (a: Paddle, b: Paddle) => number;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'newbie', emoji: '🔰', label: '完全新手',
    desc: '容錯與上手度優先——新手期先把球穩穩打過網，再談其他',
    filter: p => p.level === '新手',
    sort: (a, b) => b.rating.forgiveness - a.rating.forgiveness,
  },
  {
    id: 'budget', emoji: '💰', label: '預算 3 千內',
    desc: '3 千內也有正經好拍，先求有再求好',
    filter: p => p.priceTWD <= 3000,
    sort: (a, b) => a.priceTWD - b.priceTWD,
  },
  {
    id: 'xhs', emoji: '📕', label: '小紅書同款',
    desc: '社群曬拍率最高的話題款，跟風也要跟得有品味',
    filter: p => p.tags?.includes('小紅書熱門') ?? false,
    sort: (a, b) => avgRating(b) - avgRating(a),
  },
  {
    id: 'comfort', emoji: '🛡️', label: '護肘舒適',
    desc: '震手感低、甜蜜點大——手肘手腕有舊傷也能安心打',
    filter: p => p.rating.forgiveness >= 90 || (p.tags?.includes('護肘友善') ?? false),
    sort: (a, b) => b.rating.forgiveness - a.rating.forgiveness,
  },
  {
    id: 'attack', emoji: '⚔️', label: '進攻火力',
    desc: '殺球與 Drive 火力優先，適合力量流打法',
    filter: p => p.rating.power >= 93,
    sort: (a, b) => b.rating.power - a.rating.power,
  },
  {
    id: 'control', emoji: '🎯', label: '控球流',
    desc: 'Dink 與小球手感優先，網前戰術流的選擇',
    filter: p => p.rating.control >= 93,
    sort: (a, b) => b.rating.control - a.rating.control,
  },
  {
    id: 'tw-buy', emoji: '🇹🇼', label: '台灣買得到',
    desc: '台灣有官方或實體通路可購買，不必等海外集運、售後也好處理',
    filter: p => getPurchaseChannels(p.brand).some(c => c.type !== 'global'),
    sort: (a, b) => avgRating(b) - avgRating(a),
  },
];

/* ===== 球拍卡片 ===== */
const PaddleCard = ({
  p, index, inCompare, compareFull, onToggleCompare,
}: {
  p: Paddle;
  index: number;
  inCompare: boolean;
  compareFull: boolean;
  onToggleCompare: (slug: string) => void;
}) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    transition={{ delay: Math.min(index * 0.02, 0.15), type: 'spring', stiffness: 300, damping: 25 }}
    className={`group bg-white rounded-3xl border p-5 transition-shadow ${
      inCompare
        ? 'border-emerald-400 ring-2 ring-emerald-100 shadow-lg shadow-emerald-100/50'
        : 'border-neutral-100 hover:shadow-xl hover:shadow-neutral-200/60 hover:border-neutral-200'
    }`}
  >
    <div className="flex gap-4 mb-3">
      {/* 視覺區：以球拍自身配色打光 */}
      <div className="relative w-24 shrink-0">
        <div
          className="h-40 rounded-2xl flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(165deg, ${p.colors.face}1f, ${p.colors.face}08 70%)` }}
        >
          <motion.div className="transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:rotate-[4deg]">
            <PaddleVisual paddle={p} className="w-[72px] h-[124px] drop-shadow-md" />
          </motion.div>
        </div>
        <div className="absolute -top-2 -left-2 w-9 h-9 rounded-full bg-neutral-900 text-white flex flex-col items-center justify-center shadow-md">
          <span className="text-[11px] font-black leading-none">{Math.round(avgRating(p))}</span>
          <span className="text-[6px] text-neutral-400 leading-none mt-0.5">綜合</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate">{p.brand}</div>
            <h3 className="text-base font-black text-neutral-900 leading-tight">{p.model}</h3>
          </div>
          <span className={`shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${LEVEL_COLORS[p.level]}`}>{p.level}</span>
        </div>
        {p.endorser && <div className="text-[11px] text-emerald-600 mt-1 truncate">⭐ {p.endorser}</div>}
        {p.tags && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {p.tags.map(t => (
              <span key={t} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${TAG_COLORS[t]}`}>
                {t === '小紅書熱門' ? '📕 ' : t === '近期熱搜' ? '🔥 ' : ''}{t}
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-neutral-400 mt-2.5">
          <div>重量 <strong className="text-neutral-700 font-bold">{p.weight}</strong></div>
          <div>厚度 <strong className="text-neutral-700 font-bold">{p.thickness}</strong></div>
          <div className="col-span-2 truncate">面板 <strong className="text-neutral-700 font-bold">{p.face}</strong></div>
          <div className="col-span-2 truncate">核心 <strong className="text-neutral-700 font-bold">{p.core}</strong></div>
        </div>
      </div>
    </div>

    {/* 性能條 */}
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3.5 px-0.5">
      {RATING_ORDER.map(({ key, label, color }) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-neutral-400 w-6 shrink-0">{label}</span>
          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${p.rating[key]}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            />
          </div>
          <span className="text-[11px] font-black text-neutral-700 w-6 text-right tabular-nums">{p.rating[key]}</span>
        </div>
      ))}
    </div>

    <ul className="text-xs text-neutral-600 space-y-1 mb-3">
      {p.highlights.slice(0, 2).map((h, i) => (
        <li key={i} className="flex gap-1.5"><span className="text-emerald-500">✓</span>{h}</li>
      ))}
    </ul>

    <div className="text-xs text-neutral-500 mb-2 line-clamp-1"><strong className="text-neutral-700">適合：</strong>{p.bestFor}</div>

    {p.cons && (
      <div className="text-[11px] text-amber-700 bg-amber-50 rounded-xl px-2.5 py-1.5 mb-2 line-clamp-1">⚠️ {p.cons}</div>
    )}

    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
      <div>
        <span className="text-lg font-black text-emerald-600">NT$ {p.priceTWD.toLocaleString()}</span>
        <span className="block text-[9px] text-neutral-400">台灣行情參考價{p.usapApproved ? ' · USAP 認證' : ''}</span>
      </div>
      <button
        onClick={() => onToggleCompare(p.slug)}
        disabled={!inCompare && compareFull}
        className={`text-xs font-bold px-4 py-2 rounded-full transition-all active:scale-95 ${
          inCompare
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
            : compareFull
              ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
              : 'bg-neutral-900 text-white hover:bg-emerald-600'
        }`}
      >
        {inCompare ? '✓ 已加入比較' : '＋ 比較'}
      </button>
    </div>

    {/* 正版購買管道 */}
    {getPurchaseChannels(p.brand).length > 0 && (
      <div className="mt-3 pt-3 border-t border-dashed border-neutral-200">
        <div className="text-[10px] font-bold text-neutral-400 mb-1.5">哪裡買得到正品</div>
        <div className="flex flex-wrap gap-1.5">
          {getPurchaseChannels(p.brand).map(c => (
            <a
              key={c.url}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              title={c.note ?? c.label}
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-full border transition active:scale-95 ${CHANNEL_STYLES[c.type]}`}
            >
              {CHANNEL_TYPE_META[c.type].icon} {c.label}
              <span className="opacity-40">↗</span>
            </a>
          ))}
        </div>
      </div>
    )}
  </motion.article>
);

/* ===== 主頁面 ===== */
const PaddleDatabasePage = () => {
  const [brandFilter, setBrandFilter] = useState<'all' | PaddleBrand>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | PaddleLevel>('all');
  const [tagFilter, setTagFilter] = useState<'all' | PaddleTag>('all');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'price-low' | 'price-high'>('rating');
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const minPrice = useMemo(() => Math.min(...PADDLE_DATABASE.map(p => p.priceTWD)), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const r = PADDLE_DATABASE
      .filter(p => !scenario || scenario.filter(p))
      .filter(p => brandFilter === 'all' || p.brand === brandFilter)
      .filter(p => levelFilter === 'all' || p.level === levelFilter)
      .filter(p => tagFilter === 'all' || p.tags?.includes(tagFilter))
      .filter(p => !q || `${p.brand} ${p.model}`.toLowerCase().includes(q));
    if (scenario) r.sort(scenario.sort);
    else if (sortBy === 'price-low') r.sort((a, b) => a.priceTWD - b.priceTWD);
    else if (sortBy === 'price-high') r.sort((a, b) => b.priceTWD - a.priceTWD);
    else r.sort((a, b) => avgRating(b) - avgRating(a));
    return r;
  }, [scenario, brandFilter, levelFilter, tagFilter, search, sortBy]);

  const comparePaddles = useMemo(
    () => compare
      .map(slug => PADDLE_DATABASE.find(p => p.slug === slug))
      .filter((p): p is Paddle => Boolean(p)),
    [compare],
  );

  const toggleCompare = (slug: string) => {
    setCompare(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, slug];
    });
  };

  const removeFromCompare = (slug: string) => {
    setCompare(prev => {
      const next = prev.filter(s => s !== slug);
      if (next.length < 2) setShowCompare(false);
      return next;
    });
  };

  const featuredPaddles = useMemo(
    () => FEATURED
      .map(f => ({ ...f, paddle: getPaddleBySlug(f.slug) }))
      .filter((f): f is typeof f & { paddle: Paddle } => Boolean(f.paddle)),
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
      <SEOHead page="paddle-database" />

      {/* ===== Hero ===== */}
      <section className="relative pt-20 pb-10 md:pt-28 md:pb-14 overflow-hidden">
        {/* 環境光暈 */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        {/* 漂浮球拍裝飾（桌機） */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none" aria-hidden>
          {[
            { slug: 'six-zero-ruby', className: 'left-[6%] top-16 w-20 rotate-[-14deg]', delay: 0 },
            { slug: 'elevensix24-jelly-bean', className: 'right-[7%] top-10 w-16 rotate-[12deg]', delay: 1.2 },
            { slug: 'joola-perseus-pro-iv-16mm', className: 'right-[16%] bottom-2 w-14 rotate-[24deg]', delay: 0.6 },
          ].map(d => {
            const p = getPaddleBySlug(d.slug);
            if (!p) return null;
            return (
              <motion.div
                key={d.slug}
                className={`absolute opacity-[0.22] ${d.className}`}
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: d.delay }}
              >
                <PaddleVisual paddle={p} className="w-full" />
              </motion.div>
            );
          })}
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center relative">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
            Paddle Database 2026
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
          >
            匹克球拍<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">完整資料庫</span>
          </motion.h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-8">
            從千元入門到職業旗艦，小紅書熱門與高 CP 新銳一次收錄。
            選好 2-{MAX_COMPARE} 支，開啟並排比較找出你的下一支拍。
          </p>

          {/* 數據列 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex flex-wrap justify-center divide-x divide-neutral-200 bg-white/80 backdrop-blur rounded-2xl border border-neutral-100 shadow-sm"
          >
            {[
              { num: `${PADDLE_BRANDS.length}`, label: '品牌' },
              { num: `${PADDLE_DATABASE.length}`, label: '款球拍' },
              { num: `$${(minPrice / 1000).toFixed(1)}K 起`, label: '最低入手價' },
              { num: `${MAX_COMPARE} 支`, label: '並排比較' },
            ].map(s => (
              <div key={s.label} className="px-5 md:px-7 py-3">
                <div className="text-xl md:text-2xl font-black text-neutral-900">{s.num}</div>
                <div className="text-[10px] md:text-xs text-neutral-400 font-semibold">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 編輯精選（橫向捲動）===== */}
      <section className="mb-10">
        <div className="container mx-auto px-4 max-w-7xl mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900">編輯精選</h2>
            <p className="text-xs text-neutral-400 mt-0.5">六種需求，六支答案 —— 直接加入比較</p>
          </div>
          <span className="text-[11px] text-neutral-300 font-semibold hidden md:block">← 左右滑動 →</span>
        </div>
        <div className="overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-4 px-4 md:px-[max(1rem,calc((100vw-80rem)/2+1rem))] snap-x snap-mandatory w-max">
            {featuredPaddles.map((f, i) => {
              const p = f.paddle;
              const inCompare = compare.includes(p.slug);
              return (
                <motion.div
                  key={f.slug}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.06, 0.3) }}
                  whileHover={{ y: -6 }}
                  className="snap-start w-[280px] md:w-[320px] shrink-0 rounded-3xl p-5 text-white relative overflow-hidden shadow-lg"
                  style={{ background: `linear-gradient(150deg, ${p.colors.face} 15%, ${p.colors.face}d9 60%, ${p.colors.accent}66 130%)` }}
                >
                  {/* 背景光 */}
                  <div
                    className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-2xl opacity-30 pointer-events-none"
                    style={{ backgroundColor: p.colors.accent }}
                  />
                  <div className="relative flex gap-3">
                    <div className="flex-1 min-w-0">
                      <span
                        className="inline-block text-[10px] font-black px-2.5 py-1 rounded-full mb-3 text-neutral-900"
                        style={{ backgroundColor: p.colors.accent }}
                      >
                        {f.title}
                      </span>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{p.brand}</div>
                      <h3 className="text-lg font-black leading-tight mb-1.5">{p.model}</h3>
                      <p className="text-[11px] leading-relaxed opacity-85 mb-3 min-h-[3em]">{f.reason}</p>
                      <div className="text-xl font-black mb-3">NT$ {p.priceTWD.toLocaleString()}</div>
                      <button
                        onClick={() => toggleCompare(p.slug)}
                        disabled={!inCompare && compare.length >= MAX_COMPARE}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition active:scale-95 ${
                          inCompare
                            ? 'bg-white text-neutral-900'
                            : 'bg-white/15 hover:bg-white/30 text-white backdrop-blur border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                      >
                        {inCompare ? '✓ 已加入比較' : '＋ 加入比較'}
                      </button>
                    </div>
                    <motion.div
                      className="shrink-0 self-center"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    >
                      <PaddleVisual paddle={p} className="w-[88px] h-[150px] drop-shadow-2xl" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-7xl">
        {/* ===== 情境快選 ===== */}
        <div className="mb-5">
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map(s => {
              const active = scenario?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setScenario(active ? null : s)}
                  className={`text-sm font-bold px-4 py-2.5 rounded-2xl transition-all active:scale-95 border ${
                    active
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-lg'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {scenario && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-neutral-500 mt-2.5 pl-1 overflow-hidden"
              >
                💡 {scenario.desc}（已依此情境排序）
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ===== 篩選列（sticky）===== */}
        <div className="sticky top-[84px] md:top-[88px] z-30 -mx-4 px-4 mb-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-neutral-100 p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜尋品牌或型號，如 JOOLA、Ronbus…"
                className="flex-1 min-w-[180px] text-sm border border-neutral-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-400 bg-white"
              />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                disabled={Boolean(scenario)}
                className="text-xs border border-neutral-200 rounded-xl px-2.5 py-2 outline-none focus:border-emerald-400 bg-white disabled:opacity-50"
              >
                <option value="rating">評分高至低</option>
                <option value="price-low">價格低至高</option>
                <option value="price-high">價格高至低</option>
              </select>
            </div>
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setBrandFilter('all')}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition ${brandFilter === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
              >全部品牌</button>
              {PADDLE_BRANDS.map(b => (
                <button
                  key={b}
                  onClick={() => setBrandFilter(brandFilter === b ? 'all' : b)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition ${brandFilter === b ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
                >{b}</button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {PADDLE_LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setLevelFilter(levelFilter === l ? 'all' : l)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${levelFilter === l ? 'bg-emerald-500 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
                >{l}</button>
              ))}
              <span className="w-px h-4 bg-neutral-200 mx-1" />
              {PADDLE_TAGS.map(t => {
                const count = PADDLE_DATABASE.filter(p => p.tags?.includes(t)).length;
                if (count === 0) return null;
                return (
                  <button
                    key={t}
                    onClick={() => setTagFilter(tagFilter === t ? 'all' : t)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${tagFilter === t ? 'bg-orange-500 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
                  >{t === '小紅書熱門' ? '📕' : t === '近期熱搜' ? '🔥' : ''}{t}</button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-neutral-500 font-semibold">共 {filtered.length} 款</div>
          <div className="text-[11px] text-neutral-400 text-right">
            價格為台灣行情參考 · 球拍圖為依規格繪製之示意圖
            <span className="hidden md:inline"> · 經銷資訊查證於 2026-08，購買前請以品牌官方公告為準</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-36">
          {filtered.map((p, i) => (
            <PaddleCard
              key={p.slug}
              p={p}
              index={i}
              inCompare={compare.includes(p.slug)}
              compareFull={compare.length >= MAX_COMPARE}
              onToggleCompare={toggleCompare}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="text-4xl mb-3">🏓</div>
              <div className="text-neutral-400">找不到符合條件的球拍，試著放寬篩選條件</div>
            </div>
          )}
        </div>
      </section>

      {/* ===== 比較浮動列 ===== */}
      <AnimatePresence>
        {compare.length > 0 && !showCompare && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl"
          >
            <div className="bg-neutral-900/95 backdrop-blur text-white rounded-[22px] shadow-2xl shadow-neutral-900/30 px-4 py-3 flex items-center gap-3 border border-white/10">
              <div className="flex -space-x-2.5 shrink-0">
                {comparePaddles.map(p => (
                  <motion.div
                    key={p.slug}
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-10 h-10 rounded-full border-2 border-neutral-800 flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(150deg, ${p.colors.face}, ${p.colors.face}aa)` }}
                    title={`${p.brand} ${p.model}`}
                  >
                    <PaddleVisual paddle={p} className="w-6 h-9" />
                  </motion.div>
                ))}
              </div>
              <div className="flex-1 min-w-0 text-xs text-neutral-300">
                已選 <strong className="text-white">{compare.length}</strong>/{MAX_COMPARE} 支
                {compare.length < 2 && <span className="block text-[10px] text-neutral-500">再選 1 支即可比較</span>}
              </div>
              <button
                onClick={() => setCompare([])}
                className="text-xs text-neutral-500 hover:text-white transition shrink-0 font-semibold"
              >清空</button>
              <button
                onClick={() => setShowCompare(true)}
                disabled={compare.length < 2}
                className={`text-sm font-black px-5 py-2.5 rounded-2xl transition-all active:scale-95 shrink-0 ${
                  compare.length >= 2
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white/10 text-neutral-500 cursor-not-allowed'
                }`}
              >
                比較
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 比較 Sheet ===== */}
      <AnimatePresence>
        {showCompare && comparePaddles.length >= 2 && (
          <PaddleCompareSheet
            paddles={comparePaddles}
            onClose={() => setShowCompare(false)}
            onRemove={removeFromCompare}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaddleDatabasePage;
