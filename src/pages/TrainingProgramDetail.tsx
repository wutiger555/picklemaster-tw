import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProgramBySlug } from '../data/trainingProgramsData';
import SEOHead from '../components/common/SEOHead';

const TrainingProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const program = slug ? getProgramBySlug(slug) : undefined;
  const [activeWeek, setActiveWeek] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // Load completion progress from localStorage
  useEffect(() => {
    if (!program) return;
    const saved = localStorage.getItem(`pickle-progress-${program.slug}`);
    if (saved) {
      try {
        setCompleted(new Set(JSON.parse(saved)));
      } catch {/* ignore */}
    }
  }, [program]);

  useEffect(() => {
    if (!program) return;
    // HowTo schema
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: program.title,
      description: program.subtitle,
      totalTime: `P${program.duration.replace(/[^\d]/g, '') || '4'}W`,
      tool: program.equipment.map(e => ({ '@type': 'HowToTool', name: e })),
      step: program.weeks.map((w, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: `第 ${w.week} 週：${w.theme}`,
        text: w.goals.join('、'),
      })),
    };
    const old = document.querySelector('script[data-structured="program"]');
    if (old) old.remove();
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-structured', 'program');
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
    return () => { s.remove(); };
  }, [program]);

  if (!program) return <Navigate to="/training-programs" replace />;

  const week = program.weeks[activeWeek];

  const toggleComplete = (key: string) => {
    const next = new Set(completed);
    if (next.has(key)) next.delete(key); else next.add(key);
    setCompleted(next);
    localStorage.setItem(`pickle-progress-${program.slug}`, JSON.stringify([...next]));
  };

  const totalDrills = program.weeks.reduce((sum, w) => sum + w.days.reduce((s2, d) => s2 + d.drills.length, 0), 0);
  const completedCount = completed.size;
  const progressPct = totalDrills > 0 ? Math.round((completedCount / totalDrills) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
      <SEOHead
        customTitle={`${program.title} | 匹克球訓練菜單`}
        customDescription={`${program.subtitle} - ${program.duration} 系統化訓練計劃，每週逐日詳細安排。`}
      />

      {/* Hero */}
      <section className={`relative bg-gradient-to-br ${program.accentGradient} text-white pt-16 pb-10`}>
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/training-programs" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-6">
            ← 返回訓練菜單
          </Link>

          <div className="flex flex-wrap items-start gap-6">
            <div className="text-7xl md:text-9xl">{program.emoji}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">{program.level}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">{program.focus}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">⏱ {program.duration}</span>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-2"
              >
                {program.title}
              </motion.h1>
              <p className="text-lg opacity-90 mb-4">{program.subtitle}</p>

              <div className="grid md:grid-cols-3 gap-3 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-xs opacity-70 uppercase tracking-wider">每週時數</div>
                  <div className="font-bold">{program.weeklyHours}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-xs opacity-70 uppercase tracking-wider">先決條件</div>
                  <div className="text-xs">{program.prerequisite}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-xs opacity-70 uppercase tracking-wider">完成後可達</div>
                  <div className="text-xs">{program.outcome}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-10">
        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-neutral-700">進度追蹤（自動儲存）</span>
            <span className="text-2xl font-black text-emerald-600">{progressPct}%</span>
          </div>
          <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${program.accentGradient} transition-all`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-xs text-neutral-500 mt-2">{completedCount} / {totalDrills} 項練習已完成</div>
        </div>

        {/* Equipment */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-6">
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">需要裝備</h2>
          <div className="flex flex-wrap gap-2">
            {program.equipment.map((e, i) => (
              <span key={i} className="text-sm bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full">{e}</span>
            ))}
          </div>
        </div>

        {/* Week selector */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-3 mb-6 sticky top-20 z-30 shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {program.weeks.map((w, i) => (
              <button
                key={i}
                onClick={() => setActiveWeek(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  activeWeek === i
                    ? `bg-gradient-to-r ${program.accentGradient} text-white shadow-md`
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                第 {w.week} 週
              </button>
            ))}
          </div>
        </div>

        {/* Week detail */}
        {week && (
          <motion.div
            key={activeWeek}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 mb-6"
          >
            <div className="mb-5">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">第 {week.week} 週</span>
              <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mt-1 mb-3">{week.theme}</h2>
              <div className="flex flex-wrap gap-2">
                {week.goals.map((g, i) => (
                  <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">🎯 {g}</span>
                ))}
              </div>
            </div>

            {/* Days */}
            <div className="space-y-5">
              {week.days.map((day, di) => (
                <div key={di} className="border-l-4 border-emerald-300 pl-4 py-2">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-lg font-black text-neutral-900">{day.day}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{day.sessionType}</span>
                    <span className="text-xs text-neutral-500 ml-auto">⏱ {day.totalTime}</span>
                  </div>
                  <div className="space-y-2">
                    {day.drills.map((drill, dri) => {
                      const key = `w${week.week}-d${di}-dr${dri}`;
                      const isDone = completed.has(key);
                      return (
                        <label
                          key={dri}
                          className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition ${
                            isDone ? 'bg-emerald-50' : 'bg-neutral-50 hover:bg-neutral-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => toggleComplete(key)}
                            className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold ${isDone ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>{drill.name}</span>
                              <span className="text-xs text-neutral-500">· {drill.duration}</span>
                              {drill.reps && <span className="text-xs text-emerald-600">· {drill.reps}</span>}
                            </div>
                            <p className={`text-sm leading-relaxed ${isDone ? 'text-neutral-400' : 'text-neutral-600'}`}>{drill.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly checkpoint */}
            <div className="mt-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-xl p-4">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">本週驗收</div>
              <p className="text-amber-900">{week.weeklyCheckpoint}</p>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setActiveWeek(Math.max(0, activeWeek - 1))}
            disabled={activeWeek === 0}
            className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-sm font-semibold text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            ← 上一週
          </button>
          <span className="text-sm text-neutral-500">{activeWeek + 1} / {program.weeks.length}</span>
          <button
            onClick={() => setActiveWeek(Math.min(program.weeks.length - 1, activeWeek + 1))}
            disabled={activeWeek === program.weeks.length - 1}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600"
          >
            下一週 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingProgramDetail;
