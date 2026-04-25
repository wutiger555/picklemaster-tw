import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PLAYBOOK, PLAYBOOK_CATEGORIES, type PlaybookCategory, type PlaybookScenario } from '../data/playbookData';
import SEOHead from '../components/common/SEOHead';

const LEVEL_COLORS: Record<PlaybookScenario['level'], string> = {
  '新手必備': 'bg-emerald-100 text-emerald-700',
  '中階關鍵': 'bg-blue-100 text-blue-700',
  '進階武器': 'bg-purple-100 text-purple-700',
};

const Playbook = () => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | PlaybookCategory>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | PlaybookScenario['level']>('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return PLAYBOOK.filter(s => {
      const cm = categoryFilter === 'all' || s.category === categoryFilter;
      const lm = levelFilter === 'all' || s.level === levelFilter;
      const q = search.trim().toLowerCase();
      const sm = !q || s.scenario.toLowerCase().includes(q) || s.bestResponse.toLowerCase().includes(q);
      return cm && lm && sm;
    });
  }, [categoryFilter, levelFilter, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
      <SEOHead page="playbook" />

      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
            Tactical Playbook · {PLAYBOOK.length} 個情境戰術
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
          >
            匹克球<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">戰術劇本庫</span>
          </motion.h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            「對方做 X，我該怎麼辦？」場上實戰情境 × 最佳回應對照。從新手必備到進階武器一次掌握。
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 mb-6">
          <div className="relative mb-3">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="搜尋情境（如「反手」「強攻」「失誤」）..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-400 outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            <button onClick={() => setCategoryFilter('all')} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${categoryFilter === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>全部分類</button>
            {PLAYBOOK_CATEGORIES.map(c => {
              const count = PLAYBOOK.filter(s => s.category === c).length;
              if (count === 0) return null;
              return (
                <button key={c} onClick={() => setCategoryFilter(c)} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${categoryFilter === c ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>{c} ({count})</button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setLevelFilter('all')} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${levelFilter === 'all' ? 'bg-emerald-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>全部等級</button>
            {(['新手必備', '中階關鍵', '進階武器'] as const).map(l => (
              <button key={l} onClick={() => setLevelFilter(l)} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${levelFilter === l ? 'bg-emerald-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="text-sm text-neutral-500 mb-4">共 {filtered.length} 個情境戰術</div>

        <div className="space-y-3 pb-20">
          {filtered.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.2) }}
              className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === s.id ? null : s.id)}
                className="w-full text-left p-5 hover:bg-neutral-50 transition"
              >
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">{s.category}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[s.level]}`}>{s.level}</span>
                  <span className={`ml-auto text-2xl text-neutral-400 transition-transform ${openId === s.id ? 'rotate-45' : ''}`}>+</span>
                </div>
                <h2 className="text-lg font-bold text-neutral-900 leading-tight pr-8">
                  💭 {s.scenario}
                </h2>
              </button>

              {openId === s.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-5 pb-5 border-t border-neutral-100 space-y-4"
                >
                  <div className="pt-4">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">為什麼會發生</div>
                    <p className="text-neutral-700 text-sm leading-relaxed">{s.whyHappens}</p>
                  </div>

                  <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded-r-xl p-4">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">✓ 最佳回應</div>
                    <p className="text-emerald-900 leading-relaxed font-medium">{s.bestResponse}</p>
                  </div>

                  {s.alternativeResponses && s.alternativeResponses.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">替代方案</div>
                      <ul className="space-y-1.5">
                        {s.alternativeResponses.map((alt, ai) => (
                          <li key={ai} className="flex gap-2 text-sm text-neutral-700">
                            <span className="text-blue-500">→</span>
                            <span>{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {s.proExample && (
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-4">
                      <div className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1">⭐ 職業案例</div>
                      <p className="text-yellow-900 text-sm leading-relaxed">{s.proExample}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Playbook;
