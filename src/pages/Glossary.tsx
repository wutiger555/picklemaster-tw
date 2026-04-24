import { useMemo, useState } from 'react';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { GLOSSARY, GLOSSARY_CATEGORIES, type GlossaryTerm } from '../data/glossaryData';
import SEOHead from '../components/common/SEOHead';

const CATEGORY_COLORS: Record<GlossaryTerm['category'], string> = {
  規則: 'bg-emerald-100 text-emerald-800',
  技術: 'bg-blue-100 text-blue-800',
  戰術: 'bg-purple-100 text-purple-800',
  裝備: 'bg-amber-100 text-amber-800',
  場地: 'bg-teal-100 text-teal-800',
  賽制: 'bg-rose-100 text-rose-800',
};

const Glossary = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | GlossaryTerm['category']>('all');

  const filtered = useMemo(() => {
    return GLOSSARY.filter(t => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.termEn.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [query, activeCategory]);

  return (
    <LazyMotion features={domAnimation}>
      <SEOHead page="glossary" />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        <section className="pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
              Glossary · 術語權威字典
            </span>
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight"
            >
              匹克球<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">術語大全</span>
            </m.h1>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
              全台最完整的中英文匹克球術語對照表。從規則、技術、戰術到裝備賽制，{GLOSSARY.length} 個關鍵詞彙一次掌握。
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 max-w-5xl">
          {/* Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 mb-6">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="搜尋術語（中英皆可）..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition text-base"
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                全部 ({GLOSSARY.length})
              </button>
              {GLOSSARY_CATEGORIES.map(cat => {
                const count = GLOSSARY.filter(t => t.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      activeCategory === cat ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3 pb-20">
            {filtered.map((t, i) => (
              <m.article
                id={t.id}
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                className="bg-white rounded-2xl border border-neutral-100 p-5 md:p-6 hover:shadow-md hover:border-emerald-200 transition-all group"
              >
                <div className="flex flex-wrap items-baseline gap-3 mb-2">
                  <h2 className="text-xl md:text-2xl font-bold text-neutral-900">{t.term}</h2>
                  <span className="text-sm text-neutral-400 font-medium">{t.termEn}</span>
                  <span className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[t.category]}`}>
                    {t.category}
                  </span>
                </div>
                <p className="text-neutral-700 text-sm md:text-base leading-relaxed mb-3">{t.definition}</p>
                {t.example && (
                  <div className="text-sm text-neutral-600 bg-neutral-50 border-l-2 border-emerald-400 px-4 py-2 rounded-r-lg mb-2">
                    <span className="font-semibold text-neutral-500 text-xs uppercase tracking-wider mr-2">例：</span>
                    {t.example}
                  </div>
                )}
                {t.relatedTerms && t.relatedTerms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mr-1">相關：</span>
                    {t.relatedTerms.map(rt => (
                      <span key={rt} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">{rt}</span>
                    ))}
                  </div>
                )}
              </m.article>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-neutral-500">
                <p className="text-lg">找不到相關術語</p>
                <p className="text-sm mt-1">試試其他關鍵字？</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </LazyMotion>
  );
};

export default Glossary;
