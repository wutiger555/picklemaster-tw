import { useMemo, useState } from 'react';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { TOURNAMENTS_2026, type Tournament, type TournamentLevel, TAIWAN_PICKLEBALL_STATS_2026 } from '../data/tournamentsData';
import SEOHead from '../components/common/SEOHead';

const LEVEL_FILTERS: Array<{ key: 'all' | TournamentLevel; label: string }> = [
  { key: 'all', label: '全部' },
  { key: '國際', label: '國際賽' },
  { key: '全國', label: '全國賽' },
  { key: '區域', label: '區域賽' },
  { key: '分齡', label: '分齡賽' },
  { key: '公益', label: '公益賽' },
];

const STATUS_STYLES = {
  upcoming: { label: '即將開打', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  registration: { label: '報名中', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  ongoing: { label: '進行中', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500 animate-pulse' },
  completed: { label: '已結束', bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' },
} as const;

const LEVEL_STYLES: Record<TournamentLevel, string> = {
  '國際': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
  '全國': 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
  '區域': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  '公益': 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
  '分齡': 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
};

const TournamentCard = ({ t, index }: { t: Tournament; index: number }) => {
  const status = STATUS_STYLES[t.status];
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.5 }}
      className="group bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
    >
      {/* accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-wrap items-start gap-2 mb-4">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${LEVEL_STYLES[t.level]}`}>{t.level}</span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${status.bg} ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
        {t.featured && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">⭐ 年度重點</span>
        )}
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-1 leading-tight">{t.name}</h3>
      {t.nameEn && <p className="text-sm text-neutral-400 font-medium mb-4">{t.nameEn}</p>}

      <div className="space-y-2 text-sm text-neutral-600 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500">📅</span>
          <span className="font-semibold">{t.dateLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-500">📍</span>
          <span>{t.venue}・{t.city}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-500">🏛️</span>
          <span className="text-xs">{t.organizer}</span>
        </div>
      </div>

      <p className="text-sm text-neutral-700 leading-relaxed mb-4">{t.summary}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {t.categories.map(c => (
          <span key={c} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md">{c}</span>
        ))}
      </div>

      {t.registrationDeadline && (
        <div className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-3">
          📌 報名截止：{t.registrationDeadline}
        </div>
      )}

      {t.officialUrl && (
        <a
          href={t.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          官方資訊 <span aria-hidden>→</span>
        </a>
      )}
    </m.div>
  );
};

const Tournaments = () => {
  const [levelFilter, setLevelFilter] = useState<'all' | TournamentLevel>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const filtered = useMemo(() => {
    return TOURNAMENTS_2026
      .filter(t => levelFilter === 'all' || t.level === levelFilter)
      .filter(t => showCompleted || t.status !== 'completed')
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [levelFilter, showCompleted]);

  const upcomingCount = TOURNAMENTS_2026.filter(t => t.status !== 'completed').length;

  return (
    <LazyMotion features={domAnimation}>
      <SEOHead page="tournaments" />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        {/* Hero */}
        <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 max-w-6xl">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
                Tournaments · 2026 Season
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight">
                2026 台灣匹克球<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">賽事總覽</span>
              </h1>
              <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                涵蓋 CTPF 全年認證賽事、國際積分賽、區域邀請賽與公益賽。
                完整掌握報名截止、場地、組別與獎金資訊。
              </p>
            </m.div>

            {/* Stats */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              {[
                { label: '2026 年度賽事', value: TOURNAMENTS_2026.length, suffix: '場' },
                { label: '即將開打', value: upcomingCount, suffix: '場' },
                { label: '全台球友', value: '120', suffix: '萬人' },
                { label: '認證教練', value: TAIWAN_PICKLEBALL_STATS_2026.certifiedCoaches, suffix: '人' },
              ].map((s, i) => (
                <div key={i} className="bg-white border border-neutral-100 rounded-2xl p-5 text-center shadow-sm">
                  <div className="text-3xl md:text-4xl font-black text-neutral-900">
                    {s.value}<span className="text-base font-bold text-neutral-500 ml-1">{s.suffix}</span>
                  </div>
                  <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </m.div>
          </div>
        </section>

        {/* Filters */}
        <section className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center gap-2 mb-6 bg-white rounded-2xl p-3 shadow-sm border border-neutral-100">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-2">分類：</span>
            {LEVEL_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setLevelFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  levelFilter === f.key
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {f.label}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-sm text-neutral-600 cursor-pointer px-2">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={e => setShowCompleted(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
              />
              顯示已結束賽事
            </label>
          </div>
        </section>

        {/* Cards */}
        <section className="container mx-auto px-4 max-w-6xl pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((t, i) => (
              <TournamentCard key={t.id} t={t} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-neutral-500">
              <p className="text-lg">目前沒有符合條件的賽事</p>
            </div>
          )}
        </section>

        {/* Authority footer */}
        <section className="bg-neutral-900 text-white py-12">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">資料來源</h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
              本頁賽事資訊彙整自<a href="https://pickleball.org.tw/" target="_blank" rel="noopener" className="text-emerald-400 hover:underline mx-1">中華民國匹克球協會 (CTPF)</a>、
              <a href="https://www.ctpf.org.tw/" target="_blank" rel="noopener" className="text-emerald-400 hover:underline mx-1">Chinese Taipei Pickleball Federation</a> 與
              <a href="https://www.afpickleball.org/" target="_blank" rel="noopener" className="text-emerald-400 hover:underline mx-1">Asia Federation of Pickleball</a>。
              實際賽程以官方最新公告為準。
            </p>
            <p className="text-neutral-500 text-xs mt-4">資料更新時間：{TAIWAN_PICKLEBALL_STATS_2026.lastUpdated}</p>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
};

export default Tournaments;
