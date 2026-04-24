import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';
import { FAQ_DATA, FAQ_CATEGORIES, getFaqCountByCategory, generateFaqStructuredData, type FAQCategory } from '../data/faqData';

const CATEGORY_COLORS: Record<FAQCategory, string> = {
  基礎入門: 'from-emerald-400 to-teal-500',
  規則細節: 'from-blue-400 to-indigo-500',
  裝備器材: 'from-amber-400 to-orange-500',
  技術訓練: 'from-purple-400 to-pink-500',
  比賽賽事: 'from-rose-400 to-red-500',
  球場設施: 'from-cyan-400 to-blue-500',
  社群生活: 'from-yellow-400 to-amber-500',
  運動健康: 'from-lime-400 to-green-500',
};

const FAQ = () => {
  usePageTitle('常見問題 FAQ');
  const [activeCategory, setActiveCategory] = useState<'全部' | FAQCategory>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const schema = generateFaqStructuredData();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-faq', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => {
      const old = document.querySelector('script[data-faq]');
      if (old) old.remove();
    };
  }, []);

  const filtered = useMemo(() => {
    return FAQ_DATA.filter(f => {
      const matchCat = activeCategory === '全部' || f.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
      <SEOHead page="faq" />

      {/* Hero */}
      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
            FAQ · {FAQ_DATA.length} 題完整解答
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
          >
            匹克球<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">常見問題大全</span>
          </motion.h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            從「什麼是匹克球」到「心臟病能打嗎」，{FAQ_DATA.length} 題深度問答涵蓋 {FAQ_CATEGORIES.length} 大類別。
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
              placeholder="搜尋問題關鍵字..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition text-base"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setActiveCategory('全部')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === '全部' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              全部 ({FAQ_DATA.length})
            </button>
            {FAQ_CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === c ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {c} ({getFaqCountByCategory(c)})
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-3 pb-20">
          {filtered.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.3) }}
              className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 text-left hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className={`flex-shrink-0 inline-block text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${CATEGORY_COLORS[faq.category]}`}>
                    {faq.category}
                  </span>
                  <span className="font-bold text-neutral-900">{faq.question}</span>
                </div>
                <span className={`flex-shrink-0 text-2xl text-neutral-400 transition-transform ${openIndex === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openIndex === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-5 pb-4 md:px-6 md:pb-5 border-t border-neutral-100"
                >
                  <p className="text-neutral-700 leading-relaxed pt-3 whitespace-pre-line">{faq.answer}</p>
                  {faq.relatedLinks && faq.relatedLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {faq.relatedLinks.map(l => (
                        <a key={l.url} href={l.url} className="text-xs text-emerald-600 hover:underline">→ {l.text}</a>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-neutral-500">
              <p className="text-lg">找不到相關問題</p>
              <p className="text-sm mt-1">試試其他關鍵字？</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FAQ;
