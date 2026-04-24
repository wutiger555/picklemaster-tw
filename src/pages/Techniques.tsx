import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { TECHNIQUES, TECHNIQUE_CATEGORIES, TECHNIQUE_LEVELS, type TechniqueCategory, type TechniqueLevel } from '../data/techniquesData';
import SEOHead from '../components/common/SEOHead';

const LEVEL_COLORS: Record<TechniqueLevel, string> = {
  '新手': 'bg-slate-100 text-slate-700',
  '初階': 'bg-emerald-100 text-emerald-700',
  '中階': 'bg-blue-100 text-blue-700',
  '進階': 'bg-purple-100 text-purple-700',
  '高手': 'bg-rose-100 text-rose-700',
};

const Techniques = () => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | TechniqueCategory>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | TechniqueLevel>('all');

  const filtered = useMemo(() => {
    return TECHNIQUES
      .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
      .filter(t => levelFilter === 'all' || t.level === levelFilter);
  }, [categoryFilter, levelFilter]);

  return (
    <LazyMotion features={domAnimation}>
      <SEOHead page="techniques" />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        <section className="pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
              Techniques · 技巧百科
            </span>
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
            >
              匹克球技巧<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">完全百科</span>
            </m.h1>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              {TECHNIQUES.length} 個深度技巧教學，每則含步驟分解、常見錯誤、專屬練習菜單與職業選手心法。
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-2">分類：</span>
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  categoryFilter === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                全部
              </button>
              {TECHNIQUE_CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    categoryFilter === c ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-2">等級：</span>
              <button
                onClick={() => setLevelFilter('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  levelFilter === 'all' ? 'bg-emerald-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                全部
              </button>
              {TECHNIQUE_LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setLevelFilter(l)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    levelFilter === l ? 'bg-emerald-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {filtered.map((t, i) => (
              <m.article
                key={t.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.25) }}
              >
                <Link
                  to={`/techniques/${t.slug}`}
                  className="group block bg-white rounded-2xl border border-neutral-100 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${LEVEL_COLORS[t.level]}`}>
                      {t.level}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                      {t.category}
                    </span>
                    <span className="ml-auto text-xs text-neutral-400">
                      難度 {'★'.repeat(t.difficulty)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {t.name}
                  </h2>
                  <p className="text-sm text-neutral-400 font-medium mb-2">{t.nameEn}</p>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-3">{t.tagline}</p>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>⏱️ {t.timeToLearn}</span>
                    <span className="text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">
                      深入了解 →
                    </span>
                  </div>
                </Link>
              </m.article>
            ))}
          </div>
        </section>
      </div>
    </LazyMotion>
  );
};

export default Techniques;
