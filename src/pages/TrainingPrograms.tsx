import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TRAINING_PROGRAMS, PROGRAM_LEVELS, PROGRAM_FOCUSES, type ProgramLevel, type ProgramFocus } from '../data/trainingProgramsData';
import SEOHead from '../components/common/SEOHead';

const TrainingPrograms = () => {
  const [levelFilter, setLevelFilter] = useState<'all' | ProgramLevel>('all');
  const [focusFilter, setFocusFilter] = useState<'all' | ProgramFocus>('all');

  const filtered = useMemo(() => {
    return TRAINING_PROGRAMS
      .filter(p => levelFilter === 'all' || p.level === levelFilter)
      .filter(p => focusFilter === 'all' || p.focus === focusFilter);
  }, [levelFilter, focusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
      <SEOHead page="training-programs" />

      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
            Training Programs · {TRAINING_PROGRAMS.length} 套系統菜單
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
          >
            匹克球<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">系統訓練菜單</span>
          </motion.h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            從新手 8 週入門到 Reset 大師 4 週，每套菜單都有逐週逐日的具體練習項目。跟著做就會進步。
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-2">等級：</span>
            <button onClick={() => setLevelFilter('all')} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${levelFilter === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>全部</button>
            {PROGRAM_LEVELS.map(l => {
              const count = TRAINING_PROGRAMS.filter(p => p.level === l).length;
              if (count === 0) return null;
              return (
                <button key={l} onClick={() => setLevelFilter(l)} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${levelFilter === l ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>{l} ({count})</button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-2">專注：</span>
            <button onClick={() => setFocusFilter('all')} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${focusFilter === 'all' ? 'bg-emerald-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>全部</button>
            {PROGRAM_FOCUSES.map(f => {
              const count = TRAINING_PROGRAMS.filter(p => p.focus === f).length;
              if (count === 0) return null;
              return (
                <button key={f} onClick={() => setFocusFilter(f)} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${focusFilter === f ? 'bg-emerald-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>{f} ({count})</button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-20">
          {filtered.map((p, i) => (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <Link
                to={`/training-programs/${p.slug}`}
                className="group block bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 h-full"
              >
                <div className={`h-32 bg-gradient-to-br ${p.accentGradient} flex items-center justify-center text-7xl text-white relative`}>
                  {p.emoji}
                  {p.featured && (
                    <span className="absolute top-3 right-3 text-xs font-bold bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-full">⭐ 精選</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">{p.level}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{p.focus}</span>
                    <span className="text-xs text-neutral-500 ml-auto">⏱ {p.duration}</span>
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">{p.title}</h2>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-3">{p.subtitle}</p>
                  <div className="bg-emerald-50 rounded-lg p-3 mb-3">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">完成後</div>
                    <p className="text-xs text-emerald-900 leading-snug">{p.outcome}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>📅 {p.weeklyHours}/週</span>
                    <span className="text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">查看完整菜單 →</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TrainingPrograms;
