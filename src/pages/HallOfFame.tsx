import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import { FOUNDERS, PIONEERS, LEGENDS, TAIWAN, type HoFMember } from '../data/hallOfFameData';

const Section = ({ title, members, gradient }: { title: string; members: HoFMember[]; gradient: string }) => (
  <section className="mb-12">
    <h2 className={`text-2xl md:text-3xl font-black mb-6 inline-block bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
      {title}
    </h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {members.map((m, i) => (
        <motion.article
          key={m.name}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: Math.min(i * 0.05, 0.3) }}
          className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl transition-all"
        >
          <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center text-7xl text-white`}>
            {m.emoji}
          </div>
          <div className="p-5">
            <h3 className="text-xl font-bold text-neutral-900 mb-1">{m.name}</h3>
            {m.nameZh && <p className="text-sm text-neutral-400 mb-2">{m.nameZh}</p>}
            <div className="text-sm text-emerald-600 font-semibold mb-2">{m.role}</div>
            <div className="text-xs text-neutral-500 mb-3">📅 {m.era}</div>
            <p className="text-sm text-neutral-700 leading-relaxed mb-3">{m.contribution}</p>
            {m.inducted && (
              <div className="text-xs bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full px-3 py-1 inline-block">
                🏅 {m.inducted}
              </div>
            )}
          </div>
        </motion.article>
      ))}
    </div>
  </section>
);

const HallOfFame = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
      <SEOHead page="hall-of-fame" />

      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-yellow-600 bg-yellow-50 px-4 py-1.5 rounded-full mb-6">
            Hall of Fame · 名人堂
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
          >
            匹克球<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500">名人堂</span>
          </motion.h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            從 1965 年三位後院父親到 2026 年世界冠軍，致敬讓匹克球走到今日的傳奇人物。
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl pb-20">
        <Section title="🌱 創辦人 — 1965 年三位後院父親" members={FOUNDERS} gradient="from-emerald-500 to-teal-500" />
        <Section title="🏛️ 組織建設者與先鋒" members={PIONEERS} gradient="from-blue-500 to-indigo-500" />
        <Section title="👑 當代傳奇選手" members={LEGENDS} gradient="from-purple-500 to-pink-500" />
        <Section title="🇹🇼 台灣推廣者" members={TAIWAN} gradient="from-red-500 to-rose-500" />

        {/* Cross link */}
        <div className="mt-12 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 md:p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">想了解更多歷史？</h2>
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <Link to="/history" className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full transition">📅 60 年編年史</Link>
            <Link to="/pro-players" className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full transition">🏆 25+ 頂尖選手</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallOfFame;
