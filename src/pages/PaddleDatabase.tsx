import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PADDLE_DATABASE, PADDLE_BRANDS, PADDLE_LEVELS, type Paddle, type PaddleBrand, type PaddleLevel } from '../data/paddleDatabase';
import SEOHead from '../components/common/SEOHead';

const LEVEL_COLORS: Record<PaddleLevel, string> = {
  新手: 'bg-slate-100 text-slate-700',
  中階: 'bg-blue-100 text-blue-700',
  進階: 'bg-purple-100 text-purple-700',
  職業: 'bg-rose-100 text-rose-700',
};

const PaddleCard = ({ p, index }: { p: Paddle; index: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: Math.min(index * 0.02, 0.2) }}
    className="bg-white rounded-2xl border border-neutral-100 p-5 hover:shadow-xl hover:border-emerald-200 transition-all"
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <div>
        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{p.brand}</div>
        <h3 className="text-lg font-bold text-neutral-900 leading-tight">{p.model}</h3>
      </div>
      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${LEVEL_COLORS[p.level]}`}>{p.level}</span>
    </div>

    {p.endorser && (
      <div className="text-xs text-emerald-600 mb-2">⭐ {p.endorser}</div>
    )}

    <div className="grid grid-cols-2 gap-2 text-xs my-3 bg-neutral-50 rounded-xl p-3">
      <div><span className="text-neutral-500">重量:</span> <strong>{p.weight}</strong></div>
      <div><span className="text-neutral-500">厚度:</span> <strong>{p.thickness}</strong></div>
      <div><span className="text-neutral-500">形狀:</span> <strong>{p.shape}</strong></div>
      <div><span className="text-neutral-500">握把:</span> <strong>{p.gripSize}</strong></div>
      <div className="col-span-2"><span className="text-neutral-500">核心:</span> <strong>{p.core}</strong></div>
      <div className="col-span-2"><span className="text-neutral-500">面板:</span> <strong>{p.face}</strong></div>
    </div>

    <div className="grid grid-cols-4 gap-1 text-center text-xs mb-3">
      {Object.entries(p.rating).map(([k, v]) => {
        const labels: Record<string, string> = { power: '力量', control: '控球', spin: '旋轉', forgiveness: '容錯' };
        return (
          <div key={k} className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg py-1.5">
            <div className="font-black text-neutral-900">{v}</div>
            <div className="text-[10px] text-neutral-500">{labels[k]}</div>
          </div>
        );
      })}
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
      <span className="text-lg font-black text-emerald-600">NT$ {p.priceTWD.toLocaleString()}</span>
      {p.usapApproved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">USAP 認證</span>}
    </div>
  </motion.article>
);

const PaddleDatabasePage = () => {
  const [brandFilter, setBrandFilter] = useState<'all' | PaddleBrand>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | PaddleLevel>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price-low' | 'price-high'>('rating');

  const filtered = useMemo(() => {
    let r = PADDLE_DATABASE
      .filter(p => brandFilter === 'all' || p.brand === brandFilter)
      .filter(p => levelFilter === 'all' || p.level === levelFilter);
    if (sortBy === 'price-low') r.sort((a, b) => a.priceTWD - b.priceTWD);
    else if (sortBy === 'price-high') r.sort((a, b) => b.priceTWD - a.priceTWD);
    else r.sort((a, b) => {
      const sa = (a.rating.power + a.rating.control + a.rating.spin + a.rating.forgiveness) / 4;
      const sb = (b.rating.power + b.rating.control + b.rating.spin + b.rating.forgiveness) / 4;
      return sb - sa;
    });
    return r;
  }, [brandFilter, levelFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
      <SEOHead page="paddle-database" />

      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
            Paddle Database · {PADDLE_DATABASE.length}+ 款球拍
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
          >
            匹克球拍<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">完整資料庫</span>
          </motion.h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            12 大品牌 {PADDLE_DATABASE.length}+ 款球拍規格完整查詢。重量、厚度、核心材質、面板、價格一次看。
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-7xl">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 mb-6 space-y-3">
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
                  onClick={() => setBrandFilter(b)}
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
                onClick={() => setLevelFilter(l)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${levelFilter === l ? 'bg-emerald-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
              >{l}</button>
            ))}
            <span className="ml-auto flex items-center gap-2">
              <span className="text-xs text-neutral-500">排序：</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs border border-neutral-200 rounded-lg px-2 py-1 outline-none focus:border-emerald-400"
              >
                <option value="rating">評分高至低</option>
                <option value="price-low">價格低至高</option>
                <option value="price-high">價格高至低</option>
              </select>
            </span>
          </div>
        </div>

        <div className="text-sm text-neutral-500 mb-4">共 {filtered.length} 款</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {filtered.map((p, i) => <PaddleCard key={p.slug} p={p} index={i} />)}
        </div>
      </section>
    </div>
  );
};

export default PaddleDatabasePage;
