import { useState } from 'react';
import { motion } from 'framer-motion';
import SEOHead from '../components/common/SEOHead';
import { usePageTitle } from '../hooks/usePageTitle';

// Data for top players
const PLAYERS = [
    {
        id: 1,
        rank: 1,
        name: "Ben Johns",
        country: "USA",
        image: "https://images.unsplash.com/photo-1599586120429-4828d5d17cb9?q=80&w=2070&auto=format&fit=crop", // Placeholder
        paddle: "JOOLA Perseus Pro IV",
        stats: { power: 98, control: 99, speed: 95 },
        desc: "被譽為匹克球界的 GOAT，擁有無懈可擊的控制力與戰術思維。"
    },
    {
        id: 2,
        rank: 1,
        name: "Anna Leigh Waters",
        country: "USA",
        image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop",
        paddle: "Paddletek Bantam ALW-C",
        stats: { power: 96, control: 95, speed: 100 },
        desc: "最年輕的世界冠軍，以極具侵略性的打法統治女子賽場。"
    },
    {
        id: 3,
        rank: 2,
        name: "Tyson McGuffin",
        country: "USA",
        image: "https://images.unsplash.com/photo-1530915512709-31d8989006d1?q=80&w=2070&auto=format&fit=crop",
        paddle: "JOOLA Magnus",
        stats: { power: 99, control: 90, speed: 96 },
        desc: "充滿魅力的球場明星，強力的發球與正手拍是他的招牌。"
    },
    {
        id: "tesla",
        rank: "SPECIAL",
        name: "Tesla Bot",
        country: "Future",
        image: "https://b2c-contenthub.com/wp-content/uploads/2024/07/Tesla-Optimus-Gen-2.jpg?quality=50&strip=all",
        paddle: "Tesla Plaid Paddle",
        stats: { power: 100, control: 100, speed: 100 },
        desc: "來自未來的完美球員？搭載 Tesla Plaid Paddle，展現極致空氣動力學。",
        isSpecial: true
    }
];

const PlayerCard = ({ player, index }: { player: any, index: number }) => {
    const [imageError, setImageError] = useState(false);

    // Dynamic gradients for fallback
    const fallbackGradients = [
        'from-indigo-600 via-purple-600 to-pink-600',
        'from-orange-500 via-red-500 to-yellow-500',
        'from-blue-600 via-cyan-500 to-teal-400',
        'from-emerald-600 via-green-500 to-lime-400'
    ];

    const bgGradient = player.isSpecial ? 'from-gray-700 via-gray-900 to-black' : fallbackGradients[index % fallbackGradients.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`group relative w-full md:w-[400px] h-[550px] rounded-3xl overflow-hidden shadow-2xl bg-neutral-800 ${player.isSpecial ? 'border-4 border-emerald-400' : ''}`}
        >
            {/* Background Image or Fallback */}
            <div className={`absolute inset-0 ${imageError ? `bg-gradient-to-br ${bgGradient}` : ''}`}>
                {!imageError ? (
                    <img
                        src={player.image}
                        alt={player.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    // Premium Fallback Design
                    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Abstract Background Elements */}
                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent animate-pulse" />
                        <div className="absolute top-0 -left-1/2 w-[200%] h-[200%] bg-white/5 rotate-12 transform origin-center" />

                        {/* Large Initial Watermark */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black text-white/10 select-none tracking-tighter">
                            {player.name.substring(0, 1)}
                        </div>

                        {/* Centered Icon */}
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20
                            }}
                            className="z-10 relative"
                        >
                            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-2xl ring-4 ring-white/5">
                                <span className="text-6xl filter drop-shadow-lg">
                                    {player.isSpecial ? '🤖' : '👤'}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                {/* Ranking Badge */}
                <div className="absolute top-6 right-6">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black ${player.isSpecial ? 'bg-emerald-500 text-white' : index === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 backdrop-blur-md text-white'}`}>
                        {typeof player.rank === 'number' ? `#${player.rank}` : '★'}
                    </div>
                </div>

                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-4xl font-black text-white mb-1 tracking-tight">{player.name}</h3>
                    <p className="text-white/70 font-semibold mb-6 flex items-center gap-2">
                        <span>{player.country === 'USA' ? '🇺🇸 USA' : '🏳️ Global'}</span>
                        <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                        <span className="text-emerald-400">{player.paddle}</span>
                    </p>

                    <p className="text-white/80 leading-relaxed mb-6 line-clamp-2 group-hover:line-clamp-none transition-all">
                        {player.desc}
                    </p>

                    {/* Stats Bars */}
                    <div className="space-y-3 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {Object.entries(player.stats).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/60 uppercase w-12">{key}</span>
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${value}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={`h-full rounded-full ${player.isSpecial ? 'bg-emerald-400' : 'bg-white'}`}
                                    />
                                </div>
                                <span className="text-xs font-bold text-white">{value as number}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ProPlayers = () => {
    usePageTitle();

    return (
        <div className="min-h-screen bg-neutral-900 text-white overflow-hidden">
            <SEOHead page="pro_players" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl rounded-full mix-blend-screen animate-pulse" />
                    <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl mix-blend-screen" />
                </div>

                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black mb-6 tracking-tighter"
                    >
                        MEET THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">TITANS</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-neutral-400 max-w-2xl mx-auto"
                    >
                        探索世界頂尖匹克球選手的數據、裝備與傳奇故事。
                    </motion.p>
                </div>
            </section>

            {/* Players Horizontal Scroll */}
            <section className="py-10 pb-32 overflow-x-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-8">
                        {PLAYERS.map((player, index) => (
                            <PlayerCard key={player.id} player={player} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-neutral-800 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">想和冠軍用一樣的裝備？</h2>
                    <p className="text-neutral-400 mb-8 max-w-xl mx-auto">了解職業選手的秘密武器，找到最適合你的神兵利器。</p>
                    <a href="/equipment" className="inline-block bg-white text-neutral-900 px-8 py-4 rounded-full font-bold hover:bg-emerald-400 transition-colors duration-300">
                        查看裝備指南
                    </a>
                </div>
            </section>
        </div>
    );
};

export default ProPlayers;
