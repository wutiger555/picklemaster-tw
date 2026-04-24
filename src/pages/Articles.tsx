import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { ARTICLES, ARTICLE_CATEGORIES, type ArticleCategory } from '../data/articlesData';
import SEOHead from '../components/common/SEOHead';

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  器材評測: 'bg-emerald-100 text-emerald-700',
  運動科學: 'bg-rose-100 text-rose-700',
  技術戰術: 'bg-blue-100 text-blue-700',
  族群指南: 'bg-purple-100 text-purple-700',
  規則知識: 'bg-amber-100 text-amber-700',
  比較分析: 'bg-teal-100 text-teal-700',
};

const Articles = () => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | ArticleCategory>('all');

  const filtered = useMemo(() => {
    return ARTICLES
      .filter(a => categoryFilter === 'all' || a.category === categoryFilter)
      .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
  }, [categoryFilter]);

  return (
    <LazyMotion features={domAnimation}>
      <SEOHead page="articles" />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        <section className="pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
              Deep Articles · 深度長文
            </span>
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
            >
              匹克球<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">深度專欄</span>
            </m.h1>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              每篇 2000-3000 字深度內容。器材評測、運動科學、戰術分析、族群指南一次到位。
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-2xl p-3 shadow-sm border border-neutral-100">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                categoryFilter === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              全部 ({ARTICLES.length})
            </button>
            {ARTICLE_CATEGORIES.map(c => {
              const count = ARTICLES.filter(a => a.category === c).length;
              if (count === 0) return null;
              return (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    categoryFilter === c ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {c} ({count})
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
            {filtered.map((a, i) => (
              <m.article
                key={a.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <Link
                  to={`/articles/${a.slug}`}
                  className="group block bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center text-7xl">
                    {a.coverEmoji}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[a.category]}`}>
                        {a.category}
                      </span>
                      {a.featured && <span className="text-xs text-yellow-600 font-bold">⭐ 精選</span>}
                      <span className="text-xs text-neutral-400 ml-auto">{a.readingTime} 分鐘</span>
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">
                      {a.title}
                    </h2>
                    <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-3">{a.summary}</p>
                    <div className="text-sm font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform inline-block">
                      閱讀全文 →
                    </div>
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

export default Articles;
