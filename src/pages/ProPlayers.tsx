import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEOHead from '../components/common/SEOHead';
import { usePageTitle } from '../hooks/usePageTitle';
import { PLAYERS, PLAYER_CATEGORIES, type PlayerCategory, type Player } from '../data/playersData';

const PlayerCard = ({ player, index }: { player: Player; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link
        to={`/players/${player.slug}`}
        className="group block relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 h-[420px] hover:-translate-y-2"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${player.accentGradient}`} />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative h-full flex flex-col justify-between p-6 text-white">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm uppercase tracking-wider">
                {player.category}
              </span>
              <span className="text-3xl">{player.countryFlag}</span>
            </div>
            {player.rank && (
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black opacity-30">#{player.rank}</span>
                <span className="text-xs opacity-80">{player.rankCategory}</span>
              </div>
            )}
            <h2 className="text-2xl md:text-3xl font-black leading-tight mb-1 group-hover:translate-x-1 transition-transform">
              {player.name}
            </h2>
            {player.nameZh && player.nameZh !== player.name && (
              <p className="text-sm opacity-80">{player.nameZh}</p>
            )}
            <p className="text-xs opacity-70 mt-1">{player.country}</p>
          </div>

          <div className="text-center text-7xl my-2 opacity-90">{player.emoji}</div>

          <div>
            <p className="text-sm mb-3 line-clamp-2 opacity-90">{player.bio}</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center bg-black/20 rounded-lg py-1.5 backdrop-blur-sm">
                <div className="text-lg font-black">{player.stats.power}</div>
                <div className="text-[10px] opacity-70 uppercase">力量</div>
              </div>
              <div className="text-center bg-black/20 rounded-lg py-1.5 backdrop-blur-sm">
                <div className="text-lg font-black">{player.stats.control}</div>
                <div className="text-[10px] opacity-70 uppercase">控球</div>
              </div>
              <div className="text-center bg-black/20 rounded-lg py-1.5 backdrop-blur-sm">
                <div className="text-lg font-black">{player.stats.speed}</div>
                <div className="text-[10px] opacity-70 uppercase">速度</div>
              </div>
            </div>
            <div className="text-xs opacity-80 truncate">🏓 {player.paddle}</div>
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
};

const ProPlayers = () => {
  usePageTitle('頂尖選手資料庫');
  const [categoryFilter, setCategoryFilter] = useState<'全部' | PlayerCategory>('全部');

  const filtered = useMemo(() => {
    return PLAYERS
      .filter(p => categoryFilter === '全部' || p.category === categoryFilter)
      .sort((a, b) => (a.rank || 99) - (b.rank || 99));
  }, [categoryFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50/30">
      <SEOHead
        page="pro-players"
        customTitle={`世界頂尖匹克球選手 ${PLAYERS.length}+ 位完整資料庫 | Picklemaster Taiwan`}
        customDescription={`認識 ${PLAYERS.length}+ 位世界頂級匹克球選手。Ben Johns、Anna Leigh Waters、Federico Staksrud 等 PPA、MLP 頂尖選手的裝備、戰績、打法完整解析。`}
      />

      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
            Pro Players · {PLAYERS.length}+ 位頂級選手
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
          >
            世界頂尖<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">匹克球選手</span>
          </motion.h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            PPA Tour、MLP 職業聯賽頂尖選手，加上亞洲區（日本、越南、中國、台灣）代表人物。裝備、戰績、打法、招牌技巧一次掌握。
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-2xl p-3 shadow-sm border border-neutral-100 justify-center">
          <button
            onClick={() => setCategoryFilter('全部')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              categoryFilter === '全部' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            全部 ({PLAYERS.length})
          </button>
          {PLAYER_CATEGORIES.map(c => {
            const count = PLAYERS.filter(p => p.category === c).length;
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
      </section>

      <section className="container mx-auto px-4 max-w-7xl pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((player, i) => (
            <PlayerCard key={player.slug} player={player} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProPlayers;
