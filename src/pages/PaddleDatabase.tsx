import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PADDLE_DATABASE, PADDLE_BRANDS, PADDLE_LEVELS, PADDLE_TAGS, MAX_COMPARE,
  type Paddle, type PaddleBrand, type PaddleLevel, type PaddleTag,
} from '../data/paddleDatabase';
import PaddleVisual from '../components/equipment/PaddleVisual';
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

const RATING_LABELS: Record<keyof Paddle['rating'], string> = {
  power: '力量',
  control: '控球',
  spin: '旋轉',
  forgiveness: '容錯',
};

const avgRating = (p: Paddle) =>
  (p.rating.power + p.rating.control + p.rating.spin + p.rating.forgiveness) / 4;

/* ============ 球拍卡片 ============ */
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
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: Math.min(index * 0.02, 0.2) }}
    className={`bg-white rounded-2xl border p-5 hover:shadow-xl transition-all ${
      inCompare ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-neutral-100 hover:border-emerald-200'
    }`}
  >
    <div className="flex gap-3 mb-2">
      <div className="w-20 h-32 shrink-0 bg-gradient-to-b from-neutral-50 to-neutral-100 rounded-xl flex items-center justify-center">
        <PaddleVisual paddle={p} className="w-16 h-28" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider truncate">{p.brand}</div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">{p.model}</h3>
          </div>
          <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${LEVEL_COLORS[p.level]}`}>{p.level}</span>
        </div>
        {p.endorser && <div className="text-xs text-emerald-600 mt-1">⭐ {p.endorser}</div>}
        {p.tags && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {p.tags.map(t => (
              <span key={t} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TAG_COLORS[t]}`}>
                {t === '小紅書熱門' ? '📕 ' : t === '近期熱搜' ? '🔥 ' : ''}{t}
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-neutral-500 mt-2">
          <div>重量 <strong className="text-neutral-800">{p.weight}</strong></div>
          <div>厚度 <strong className="text-neutral-800">{p.thickness}</strong></div>
          <div className="col-span-2 truncate">面板 <strong className="text-neutral-800">{p.face}</strong></div>
          <div className="col-span-2 truncate">核心 <strong className="text-neutral-800">{p.core}</strong></div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-1 text-center text-xs mb-3">
      {(Object.keys(p.rating) as (keyof Paddle['rating'])[]).map(k => (
        <div key={k} className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg py-1.5">
          <div className="font-black text-neutral-900">{p.rating[k]}</div>
          <div className="text-[10px] text-neutral-500">{RATING_LABELS[k]}</div>
        </div>
      ))}
    </div>

    <ul className="text-xs text-neutral-600 space-y-1 mb-3">
      {p.highlights.slice(0, 3).map((h, i) => (
        <li key={i} className="flex gap-1.5"><span className="text-emerald-500">✓</span>{h}</li>
      ))}
    </ul>

    <div className="text-xs text-neutral-500 mb-2"><strong>適合：</strong>{p.bestFor}</div>

    {p.cons && (
      <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mb-2">⚠️ {p.cons}</div>
    )}

    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
      <div>
        <span className="text-lg font-black text-emerald-600">NT$ {p.priceTWD.toLocaleString()}</span>
        <span className="block text-[10px] text-neutral-400">台灣行情參考價</span>
      </div>
      <div className="flex items-center gap-2">
        {p.usapApproved && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">USAP</span>}
        <button
          onClick={() => onToggleCompare(p.slug)}
          disabled={!inCompare && compareFull}
          className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${
            inCompare
              ? 'bg-emerald-500 text-white'
              : compareFull
                ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                : 'bg-neutral-100 text-neutral-700 hover:bg-emerald-100 hover:text-emerald-700'
          }`}
        >
          {inCompare ? '✓ 已加入' : '＋ 比較'}
        </button>
      </div>
    </div>
  </motion.article>
);

/* ============ 比較表 ============ */
const CompareOverlay = ({
  paddles, onClose, onRemove,
}: {
  paddles: Paddle[];
  onClose: () => void;
  onRemove: (slug: string) => void;
}) => {
  const minPrice = Math.min(...paddles.map(p => p.priceTWD));

  const SpecRow = ({ label, values, highlightDiff = true }: { label: string; values: (string | number)[]; highlightDiff?: boolean }) => {
    const allSame = values.every(v => v === values[0]);
    return (
      <tr className="border-b border-neutral-100">
        <th className="sticky left-0 bg-white text-left text-xs font-bold text-neutral-500 py-3 pr-3 min-w-[84px] align-top">{label}</th>
        {values.map((v, i) => (
          <td key={i} className={`py-3 px-3 text-sm min-w-[170px] align-top ${highlightDiff && !allSame ? 'font-bold text-neutral-900' : 'text-neutral-600'}`}>
            {v}
          </td>
        ))}
      </tr>
    );
  };

  const RatingRow = ({ label, values }: { label: string; values: number[] }) => {
    const max = Math.max(...values);
    return (
      <tr className="border-b border-neutral-100">
        <th className="sticky left-0 bg-white text-left text-xs font-bold text-neutral-500 py-3 pr-3 align-middle">{label}</th>
        {values.map((v, i) => (
          <td key={i} className="py-3 px-3 min-w-[170px]">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${v === max ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                  style={{ width: `${v}%` }}
                />
              </div>
              <span className={`text-sm font-bold w-8 text-right ${v === max ? 'text-emerald-600' : 'text-neutral-500'}`}>{v}</span>
            </div>
          </td>
        ))}
      </tr>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="bg-white w-full max-w-6xl max-h-[92vh] rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div>
            <h2 className="text-lg font-black text-neutral-900">球拍規格比較</h2>
            <p className="text-xs text-neutral-500">粗體 = 規格不同 · 綠色 = 該項最佳</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold transition"
            aria-label="關閉比較"
          >✕</button>
        </div>

        <div className="overflow-auto flex-1 px-5 pb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white min-w-[84px]" />
                {paddles.map(p => (
                  <th key={p.slug} className="pt-4 px-3 pb-2 min-w-[170px] align-bottom">
                    <div className="flex flex-col items-center gap-1">
                      <PaddleVisual paddle={p} className="w-16 h-24" />
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{p.brand}</div>
                      <div className="text-sm font-black text-neutral-900 text-center leading-tight">{p.model}</div>
                      <div className="text-emerald-600 font-black">
                        NT$ {p.priceTWD.toLocaleString()}
                        {p.priceTWD === minPrice && paddles.length > 1 && (
                          <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full align-middle">最低價</span>
                        )}
                      </div>
                      <button
                        onClick={() => onRemove(p.slug)}
                        className="text-[11px] text-neutral-400 hover:text-red-500 transition"
                      >移除</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SpecRow label="等級" values={paddles.map(p => p.level)} />
              <SpecRow label="形狀" values={paddles.map(p => p.shape)} />
              <SpecRow label="重量" values={paddles.map(p => p.weight)} />
              <SpecRow label="厚度" values={paddles.map(p => p.thickness)} />
              <SpecRow label="核心" values={paddles.map(p => p.core)} />
              <SpecRow label="面板" values={paddles.map(p => p.face)} />
              <SpecRow label="握把長" values={paddles.map(p => p.gripLength)} />
              <SpecRow label="握把粗" values={paddles.map(p => p.gripSize)} />
              <SpecRow label="年份" values={paddles.map(p => p.year)} />
              <RatingRow label="力量" values={paddles.map(p => p.rating.power)} />
              <RatingRow label="控球" values={paddles.map(p => p.rating.control)} />
              <RatingRow label="旋轉" values={paddles.map(p => p.rating.spin)} />
              <RatingRow label="容錯" values={paddles.map(p => p.rating.forgiveness)} />
              <RatingRow label="綜合" values={paddles.map(p => Math.round(avgRating(p)))} />
              <SpecRow
                label="代言"
                values={paddles.map(p => p.endorser ?? '—')}
                highlightDiff={false}
              />
              <SpecRow
                label="適合"
                values={paddles.map(p => p.bestFor)}
                highlightDiff={false}
              />
              <SpecRow
                label="注意"
                values={paddles.map(p => p.cons ?? '—')}
                highlightDiff={false}
              />
              <SpecRow
                label="USAP"
                values={paddles.map(p => (p.usapApproved ? '✓ 認證' : '未認證'))}
              />
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ============ 主頁面 ============ */
const PaddleDatabasePage = () => {
  const [brandFilter, setBrandFilter] = useState<'all' | PaddleBrand>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | PaddleLevel>('all');
  const [tagFilter, setTagFilter] = useState<'all' | PaddleTag>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'price-low' | 'price-high'>('rating');
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const r = PADDLE_DATABASE
      .filter(p => brandFilter === 'all' || p.brand === brandFilter)
      .filter(p => levelFilter === 'all' || p.level === levelFilter)
      .filter(p => tagFilter === 'all' || p.tags?.includes(tagFilter))
      .filter(p => !q || `${p.brand} ${p.model}`.toLowerCase().includes(q));
    if (sortBy === 'price-low') r.sort((a, b) => a.priceTWD - b.priceTWD);
    else if (sortBy === 'price-high') r.sort((a, b) => b.priceTWD - a.priceTWD);
    else r.sort((a, b) => avgRating(b) - avgRating(a));
    return r;
  }, [brandFilter, levelFilter, tagFilter, search, sortBy]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
      <SEOHead page="paddle-database" />

      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
            Paddle Database · {PADDLE_BRANDS.length} 大品牌 {PADDLE_DATABASE.length} 款球拍
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
          >
            匹克球拍<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">完整資料庫</span>
          </motion.h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            {PADDLE_BRANDS.length} 大品牌 {PADDLE_DATABASE.length} 款球拍完整規格。從千元入門到職業旗艦，
            小紅書熱門款、高 CP 值新銳品牌一次收錄，還能勾選 2-{MAX_COMPARE} 支並排比較。
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-7xl">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜尋品牌或型號，如 JOOLA、Ronbus…"
              className="flex-1 min-w-[200px] text-sm border border-neutral-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-400"
            />
            <span className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">排序：</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs border border-neutral-200 rounded-lg px-2 py-2 outline-none focus:border-emerald-400"
              >
                <option value="rating">評分高至低</option>
                <option value="price-low">價格低至高</option>
                <option value="price-high">價格高至低</option>
              </select>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-2">熱門：</span>
            <button
              onClick={() => setTagFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${tagFilter === 'all' ? 'bg-orange-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >全部</button>
            {PADDLE_TAGS.map(t => {
              const count = PADDLE_DATABASE.filter(p => p.tags?.includes(t)).length;
              if (count === 0) return null;
              return (
                <button
                  key={t}
                  onClick={() => setTagFilter(tagFilter === t ? 'all' : t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${tagFilter === t ? 'bg-orange-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                >{t === '小紅書熱門' ? '📕 ' : t === '近期熱搜' ? '🔥 ' : ''}{t} ({count})</button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-2">品牌：</span>
            <button
              onClick={() => setBrandFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${brandFilter === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >全部</button>
            {PADDLE_BRANDS.map(b => {
              const count = PADDLE_DATABASE.filter(p => p.brand === b).length;
              if (count === 0) return null;
              return (
                <button
                  key={b}
                  onClick={() => setBrandFilter(brandFilter === b ? 'all' : b)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${brandFilter === b ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                >{b} ({count})</button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-2">等級：</span>
            <button
              onClick={() => setLevelFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${levelFilter === 'all' ? 'bg-emerald-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >全部</button>
            {PADDLE_LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevelFilter(levelFilter === l ? 'all' : l)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${levelFilter === l ? 'bg-emerald-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
              >{l}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-neutral-500">共 {filtered.length} 款</div>
          <div className="text-xs text-neutral-400">價格為台灣市場行情參考，實際依通路為準 · 球拍圖為依規格繪製之示意圖</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-32">
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
            <div className="col-span-full text-center py-20 text-neutral-400">
              找不到符合條件的球拍，試著放寬篩選條件
            </div>
          )}
        </div>
      </section>

      {/* 比較浮動列 */}
      <AnimatePresence>
        {compare.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
          >
            <div className="bg-neutral-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
              <div className="flex -space-x-2 shrink-0">
                {comparePaddles.map(p => (
                  <div key={p.slug} className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden" title={`${p.brand} ${p.model}`}>
                    <PaddleVisual paddle={p} className="w-6 h-8" />
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0 text-xs text-neutral-300 truncate">
                已選 {compare.length}/{MAX_COMPARE} 支
                {compare.length < 2 && ' · 至少選 2 支才能比較'}
              </div>
              <button
                onClick={() => setCompare([])}
                className="text-xs text-neutral-400 hover:text-white transition shrink-0"
              >清空</button>
              <button
                onClick={() => setShowCompare(true)}
                disabled={compare.length < 2}
                className={`text-sm font-bold px-4 py-2 rounded-xl transition shrink-0 ${
                  compare.length >= 2
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                    : 'bg-white/10 text-neutral-500 cursor-not-allowed'
                }`}
              >
                比較 ({compare.length})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 比較彈窗 */}
      <AnimatePresence>
        {showCompare && comparePaddles.length >= 2 && (
          <CompareOverlay
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
