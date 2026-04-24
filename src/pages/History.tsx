import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SEOHead from '../components/common/SEOHead';
import { HISTORY_TIMELINE, RULE_EVOLUTION, type HistoryEvent } from '../data/historyData';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS: Record<HistoryEvent['category'], string> = {
  全球: 'bg-blue-100 text-blue-700 border-blue-300',
  台灣: 'bg-red-100 text-red-700 border-red-300',
  規則: 'bg-purple-100 text-purple-700 border-purple-300',
  賽事: 'bg-amber-100 text-amber-700 border-amber-300',
  科技: 'bg-emerald-100 text-emerald-700 border-emerald-300',
};

const History = () => {
  const [tab, setTab] = useState<'timeline' | 'rules'>('timeline');
  const [filter, setFilter] = useState<'全部' | HistoryEvent['category']>('全部');

  const filtered = useMemo(
    () => HISTORY_TIMELINE.filter(e => filter === '全部' || e.category === filter),
    [filter]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
      <SEOHead page="history" />

      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
            History · 1965 - 2026
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
          >
            匹克球 60 年<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">編年史</span>
          </motion.h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            從 1965 年華盛頓州一個後院發明的遊戲，到 2026 年全球千萬人的運動。{HISTORY_TIMELINE.length} 個關鍵事件 × {RULE_EVOLUTION.length} 次規則演變。
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-5xl">
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-neutral-100 rounded-xl p-1">
            <button
              onClick={() => setTab('timeline')}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${
                tab === 'timeline' ? 'bg-white text-neutral-900 shadow' : 'text-neutral-600'
              }`}
            >
              📅 時間軸
            </button>
            <button
              onClick={() => setTab('rules')}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${
                tab === 'rules' ? 'bg-white text-neutral-900 shadow' : 'text-neutral-600'
              }`}
            >
              ⚖️ 規則演變史
            </button>
          </div>
        </div>

        {tab === 'timeline' && (
          <>
            {/* Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {(['全部', '全球', '台灣', '規則', '賽事', '科技'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                    filter === c ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <div className="relative pb-20">
              {/* Central line */}
              <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-blue-300 to-purple-300" />

              <div className="space-y-8">
                {filtered.map((event, i) => {
                  const isEven = i % 2 === 0;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className={`relative pl-20 md:pl-0 md:grid md:grid-cols-2 md:gap-10 ${isEven ? '' : 'md:flex-row-reverse'}`}
                    >
                      {/* Year bubble */}
                      <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0">
                        <div className={`w-16 h-16 rounded-full border-4 ${event.milestone ? 'border-yellow-400 bg-yellow-50' : 'border-white bg-white'} shadow-lg flex items-center justify-center text-2xl`}>
                          {event.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className={`${isEven ? 'md:col-start-1 md:text-right md:pr-10' : 'md:col-start-2 md:pl-10'}`}>
                        <div className={`bg-white rounded-2xl border p-5 hover:shadow-lg transition-shadow ${event.milestone ? 'border-yellow-300 shadow-md' : 'border-neutral-100'}`}>
                          <div className={`flex flex-wrap items-center gap-2 mb-2 ${isEven ? 'md:justify-end' : ''}`}>
                            <span className="text-xl font-black text-neutral-900">{event.year}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[event.category]}`}>
                              {event.category}
                            </span>
                            {event.milestone && <span className="text-xs">⭐ 里程碑</span>}
                          </div>
                          <h3 className="text-lg font-bold text-neutral-900 mb-2 leading-tight">{event.title}</h3>
                          <p className="text-sm text-neutral-600 leading-relaxed">{event.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab === 'rules' && (
          <div className="space-y-4 pb-20">
            {RULE_EVOLUTION.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
                className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-7 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-baseline gap-3 mb-3">
                  <span className="text-3xl font-black text-emerald-600">{r.year}</span>
                  <h2 className="text-xl font-bold text-neutral-900">{r.ruleTitle}</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">變更內容</span>
                    <p className="text-neutral-700 leading-relaxed mt-1">{r.change}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border-l-4 border-emerald-400">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">影響</span>
                    <p className="text-neutral-700 leading-relaxed mt-1">{r.impact}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Cross-link */}
        <div className="mt-8 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 md:p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">想了解更多匹克球文化？</h2>
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <Link to="/pro-players" className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full transition">🏆 頂尖選手資料庫</Link>
            <Link to="/tournaments" className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full transition">📅 2026 賽事總覽</Link>
            <Link to="/glossary" className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full transition">📖 80+ 術語字典</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default History;
