import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PickleballGame from '../components/game/PickleballGame';
import { ROUTES } from '../utils/constants';
import { usePageTitle } from '../hooks/usePageTitle';

import { staggerContainer, staggerItem } from '../utils/animations';
import SEOHead from '../components/common/SEOHead';

const Game = () => {
  usePageTitle('匹克球大師 | 互動遊戲');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-800">
      <SEOHead
        title="匹克球大師 Pickle Master | 第一人稱擬真體驗"
        description="體驗全台首款第一人稱匹克球網頁遊戲！具備必殺技火焰球、幸運一擊系統，以及擬真的物理引擎。立即挑戰成為匹克球大師！"
        image="/og-game.png"
      />

      {/* 返回按鈕 */}
      <div className="container mx-auto px-4 py-6">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center space-x-2 text-white/70 hover:text-white font-display font-bold transition-colors group"
        >
          <motion.span
            className="inline-block"
            whileHover={{ x: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            ←
          </motion.span>
          <span>返回首頁</span>
        </Link>
      </div>

      {/* 遊戲標題 */}
      <div className="container mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-5xl md:text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-yellow-400 to-red-500 drop-shadow-lg italic tracking-tighter">
            PICKLE MASTER
          </h1>
          <p className="text-xl text-white/80 font-bold tracking-widest">
            第一人稱街機匹克球 • 必殺技 • 幸運一擊
          </p>
        </motion.div>
      </div>

      {/* 遊戲區域 */}
      <div className="container mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="shadow-2xl shadow-blue-900/20 rounded-2xl"
        >
          <PickleballGame />
        </motion.div>
      </div>

      {/* 遊戲說明卡片 */}
      <div className="container mx-auto px-4 pb-20">
        <motion.div
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* 操作說明 */}
          <motion.div variants={staggerItem} className="md:col-span-1">
            <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <h3 className="font-display text-2xl font-black text-blue-400 mb-4 flex items-center">
                <span className="mr-3">🎮</span>
                極簡操作
              </h3>
              <ul className="space-y-4 text-white/90">
                <li className="flex items-start">
                  <span className="bg-blue-500/20 text-blue-300 p-1 rounded mr-3 text-sm font-mono">AIM</span>
                  <span><strong className="text-white">滑鼠瞄準</strong>：移動游標控制擊球落點，角色會自動跑位。</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500/20 text-blue-300 p-1 rounded mr-3 text-sm font-mono">HIT</span>
                  <span><strong className="text-white">蓄力擊球</strong>：按住左鍵集氣，放開揮拍。</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* 必殺技系統 */}
          <motion.div variants={staggerItem} className="md:col-span-1">
            <div className="h-full bg-gradient-to-br from-red-900/40 to-purple-900/40 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 hover:border-red-500/50 transition-colors">
              <h3 className="font-display text-2xl font-black text-red-400 mb-4 flex items-center">
                <span className="mr-3">🔥</span>
                必殺系統
              </h3>
              <ul className="space-y-4 text-white/90">
                <li className="flex items-start">
                  <span className="bg-red-500/20 text-red-300 p-1 rounded mr-3 text-sm font-mono">FOCUS</span>
                  <span><strong className="text-white">專注爆發</strong>：持續對打累積專注值，滿氣後自動擊出<span className="text-yellow-400 font-bold">火焰球</span>！</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-yellow-500/20 text-yellow-300 p-1 rounded mr-3 text-sm font-mono">LUCK</span>
                  <span><strong className="text-white">幸運一擊</strong>：每一球都有 15% 機率觸發爆擊，球速瞬間提升。</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* 規則提示 */}
          <motion.div variants={staggerItem} className="md:col-span-1">
            <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <h3 className="font-display text-2xl font-black text-green-400 mb-4 flex items-center">
                <span className="mr-3">📜</span>
                核心規則
              </h3>
              <ul className="space-y-4 text-white/90">
                <li className="flex items-start">
                  <span className="bg-green-500/20 text-green-300 p-1 rounded mr-3 text-sm font-mono">SCORE</span>
                  <span><strong className="text-white">換發球制</strong>：只有發球方能得分。輸掉拉鋸戰換對方發球 (Side Out)。</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-500/20 text-green-300 p-1 rounded mr-3 text-sm font-mono">ZONE</span>
                  <span><strong className="text-white">廚房規則</strong>：腳在橘色區域內時，不可直接截擊 (Volley)。</span>
                </li>
              </ul>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default Game;
