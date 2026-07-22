import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPlayerBySlug, PLAYERS } from '../data/playersData';
import SEOHead from '../components/common/SEOHead';

const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="font-semibold text-neutral-600 uppercase tracking-wider">{label}</span>
      <span className="font-black text-neutral-900">{value}</span>
    </div>
    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  </div>
);

const PlayerDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const player = slug ? getPlayerBySlug(slug) : undefined;

  useEffect(() => {
    if (!player) return;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: player.name,
      alternateName: player.nameZh,
      nationality: player.country,
      birthDate: player.birthYear ? `${player.birthYear}-01-01` : undefined,
      height: player.height,
      jobTitle: 'Professional Pickleball Player',
      knowsAbout: ['Pickleball', 'Professional Sports'],
      description: player.bio,
      sponsor: player.sponsors?.map(s => ({ '@type': 'Organization', name: s })),
      award: player.achievements.map(a => `${a.year} ${a.event}`),
      url: `https://picklemastertw.site/players/${player.slug}`,
    };
    const base = 'https://picklemastertw.site';
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首頁', item: base + '/' },
        { '@type': 'ListItem', position: 2, name: '職業選手', item: base + '/pro-players' },
        { '@type': 'ListItem', position: 3, name: player.name, item: `${base}/players/${player.slug}` },
      ],
    };
    const inject = (obj: object, key: string) => {
      const old = document.querySelector(`script[data-structured="${key}"]`);
      if (old) old.remove();
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-structured', key);
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
      return s;
    };
    const s1 = inject(schema, 'player');
    const s2 = inject(breadcrumbSchema, 'player-breadcrumb');
    return () => { s1.remove(); s2.remove(); };
  }, [player]);

  if (!player) return <Navigate to="/pro-players" replace />;

  const related = player.relatedPlayers
    ? player.relatedPlayers.map(s => PLAYERS.find(p => p.slug === s)).filter(Boolean)
    : PLAYERS.filter(p => p.category === player.category && p.slug !== player.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        customTitle={`${player.name} ${player.nameZh ? `(${player.nameZh}) ` : ''}完整資料 | 球拍、戰績、打法 | 匹克球選手`}
        customDescription={`${player.name} - ${player.country} 匹克球職業選手。${player.bio} 使用球拍：${player.paddle}。DUPR 評分 ${player.duprRating}。`}
      />

      {/* Hero */}
      <section className={`relative min-h-[60vh] bg-gradient-to-br ${player.accentGradient} text-white overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="container mx-auto px-4 max-w-6xl relative z-10 pt-16 pb-10">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-white/80 mb-6" aria-label="breadcrumb">
            <Link to="/" className="hover:text-white transition-colors">首頁</Link>
            <span className="text-white/40">/</span>
            <Link to="/pro-players" className="hover:text-white transition-colors">職業選手</Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-medium line-clamp-1">{player.name}</span>
          </nav>

          <div className="grid md:grid-cols-5 gap-6 items-center">
            <div className="md:col-span-2 text-center">
              <div className="text-[160px] leading-none">{player.emoji}</div>
              <div className="text-4xl mt-2">{player.countryFlag}</div>
            </div>

            <div className="md:col-span-3">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm uppercase tracking-wider">
                  {player.category}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  {player.playingStyle}
                </span>
                {player.rank && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm">
                    世界 #{player.rank} {player.rankCategory}
                  </span>
                )}
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-2"
              >
                {player.name}
              </motion.h1>
              {player.nameZh && player.nameZh !== player.name && (
                <p className="text-xl md:text-2xl opacity-80 mb-3">{player.nameZh}</p>
              )}
              <p className="text-base md:text-lg opacity-95 leading-relaxed max-w-2xl">{player.bio}</p>

              {player.quote && (
                <blockquote className="mt-5 pl-4 border-l-4 border-white/50 italic text-sm md:text-base opacity-90">
                  "{player.quote}"
                </blockquote>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Grid */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
        <div className="grid md:grid-cols-3 gap-5">
          {/* Left: Basic Info */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">基本資料</h2>
              <dl className="text-sm space-y-2">
                <div className="flex justify-between"><dt className="text-neutral-500">國籍</dt><dd className="font-semibold">{player.country}</dd></div>
                {player.birthYear && <div className="flex justify-between"><dt className="text-neutral-500">出生</dt><dd className="font-semibold">{player.birthYear}（{new Date().getFullYear() - player.birthYear} 歲）</dd></div>}
                {player.height && <div className="flex justify-between"><dt className="text-neutral-500">身高</dt><dd className="font-semibold">{player.height}</dd></div>}
                <div className="flex justify-between"><dt className="text-neutral-500">慣用手</dt><dd className="font-semibold">{player.hand}</dd></div>
                {player.duprRating && <div className="flex justify-between"><dt className="text-neutral-500">DUPR 評分</dt><dd className="font-semibold text-emerald-600">{player.duprRating}</dd></div>}
                <div className="flex justify-between"><dt className="text-neutral-500">打法</dt><dd className="font-semibold">{player.playingStyle}</dd></div>
              </dl>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">🏓 使用裝備</h2>
              <div className="text-neutral-900 font-bold mb-1">{player.paddle}</div>
              <div className="text-sm text-neutral-500">贊助品牌：{player.paddleBrand}</div>
              {player.sponsors && player.sponsors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-100">
                  <div className="text-xs text-neutral-400 mb-1">贊助商</div>
                  <div className="flex flex-wrap gap-1.5">
                    {player.sponsors.map(s => (
                      <span key={s} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6">
              <h2 className="text-sm font-bold opacity-70 uppercase tracking-wider mb-3">⭐ 招牌技巧</h2>
              <p className="text-lg font-bold">{player.signatureShot}</p>
            </div>
          </div>

          {/* Middle: Stats */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-5">戰力評估</h2>
            <div className="space-y-4">
              <StatBar label="力量" value={player.stats.power} color="from-red-500 to-rose-500" />
              <StatBar label="控球" value={player.stats.control} color="from-emerald-500 to-teal-500" />
              <StatBar label="速度" value={player.stats.speed} color="from-blue-500 to-cyan-500" />
              <StatBar label="戰術" value={player.stats.strategy} color="from-purple-500 to-indigo-500" />
              <StatBar label="經驗" value={player.stats.experience} color="from-amber-500 to-orange-500" />
            </div>

            {/* Radar chart simplified */}
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <div className="text-xs text-neutral-500 mb-2">綜合評分</div>
              <div className="text-4xl font-black text-neutral-900">
                {Math.round((player.stats.power + player.stats.control + player.stats.speed + player.stats.strategy + player.stats.experience) / 5)}
                <span className="text-sm text-neutral-400 font-normal ml-1">/ 100</span>
              </div>
            </div>
          </div>

          {/* Right: Achievements */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">🏆 生涯成就</h2>
            <div className="space-y-3">
              {player.achievements.map((a, i) => (
                <div key={i} className="border-l-2 border-emerald-400 pl-3">
                  <div className="text-xs font-bold text-emerald-600">{a.year}</div>
                  <div className="text-sm text-neutral-700 leading-snug">{a.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Players */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-neutral-900 mb-5">相關選手</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map(p => p && (
                <Link
                  key={p.slug}
                  to={`/players/${p.slug}`}
                  className={`block rounded-2xl overflow-hidden shadow hover:shadow-lg transition bg-gradient-to-br ${p.accentGradient} text-white p-5 hover:-translate-y-1 duration-300`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{p.emoji}</div>
                    <div>
                      <div className="font-black text-lg">{p.name}</div>
                      <div className="text-xs opacity-80">{p.country} · {p.category}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PlayerDetail;
