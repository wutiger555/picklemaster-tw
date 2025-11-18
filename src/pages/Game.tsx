import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PickleballGame from '../components/game/PickleballGame';
import { ROUTES } from '../utils/constants';
import { usePageTitle } from '../hooks/usePageTitle';
import GlassCard from '../components/common/GlassCard';
import { staggerContainer, staggerItem } from '../utils/animations';
import SEOHead from '../components/common/SEOHead';

const Game = () => {
  usePageTitle('互動遊戲');

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50">
      <SEOHead page="game" />
      {/* 返回按鈕 */}
      <div className="container mx-auto px-4 py-4">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center space-x-2 text-secondary-600 hover:text-secondary-700 font-display font-bold transition-colors group"
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
      <div className="container mx-auto px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-display-xl md:text-display-2xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-secondary-600 via-primary-600 to-accent-600">
            匹克球互動遊戲
          </h1>
          <p className="text-body-lg text-neutral-600">
            體驗真正的匹克球遊戲！包含雙彈跳規則、廚房區、對角發球等核心規則
          </p>
        </motion.div>
      </div>

      {/* 遊戲區域 */}
      <div className="container mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PickleballGame />
        </motion.div>
      </div>

      {/* 遊戲提示 */}
      <div className="container mx-auto px-4 pb-12">
        <motion.div
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <GlassCard
              variant="secondary"
              size="lg"
              hoverable
              magnetic
              className="h-full"
            >
              <h3 className="font-display text-heading-xl font-black text-neutral-900 mb-4 flex items-center">
                <span className="text-4xl mr-3">🎮</span>
                遊戲玩法
              </h3>
              <ul className="space-y-3 text-body-md text-neutral-700">
                <li className="flex items-start">
                  <span className="text-secondary-500 font-black mr-3 text-lg">•</span>
                  <span>按<kbd className="px-2 py-1 bg-neutral-900 text-white rounded text-caption-md font-mono">空白鍵</kbd>發球，球會自動往對角線飛</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-500 font-black mr-3 text-lg">•</span>
                  <span>使用<kbd className="px-2 py-1 bg-neutral-900 text-white rounded text-caption-md font-mono">↑↓</kbd>（或<kbd className="px-2 py-1 bg-neutral-900 text-white rounded text-caption-md font-mono">W/S</kbd>）移動球拍</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-500 font-black mr-3 text-lg">•</span>
                  <span><strong className="text-neutral-900 font-bold">雙彈跳</strong>：發球和接發球都必須等球彈地</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-500 font-black mr-3 text-lg">•</span>
                  <span><strong className="text-accent-600 font-bold">廚房區</strong>（黃色區域）內不能截擊</span>
                </li>
              </ul>
            </GlassCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <GlassCard
              variant="primary"
              size="lg"
              hoverable
              magnetic
              className="h-full"
            >
              <h3 className="font-display text-heading-xl font-black text-neutral-900 mb-4 flex items-center">
                <span className="text-4xl mr-3">💡</span>
                遊戲技巧
              </h3>
              <ul className="space-y-3 text-body-md text-neutral-700">
                <li className="flex items-start">
                  <span className="text-primary-500 font-black mr-3 text-lg">•</span>
                  <span>發球和接發球要<strong className="text-neutral-900 font-bold">耐心等球彈地</strong>才能擊球</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 font-black mr-3 text-lg">•</span>
                  <span>第三球之後可以<strong className="text-neutral-900 font-bold">選擇截擊或彈地擊球</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 font-black mr-3 text-lg">•</span>
                  <span>避免在<strong className="text-accent-600 font-bold">廚房區內截擊</strong>，會直接犯規失分</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 font-black mr-3 text-lg">•</span>
                  <span>球只能彈地一次，<strong className="text-neutral-900 font-bold">彈兩次會失分</strong></span>
                </li>
              </ul>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* 額外提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto mt-6"
        >
          <GlassCard variant="accent" size="md">
            <div className="flex items-start space-x-4">
              <span className="text-4xl">⚡</span>
              <div>
                <h4 className="font-display text-heading-md font-black text-neutral-900 mb-2">
                  專業提示
                </h4>
                <p className="text-body-md text-neutral-700">
                  這個遊戲模擬了真實的匹克球規則！熟悉遊戲後，你就能更容易理解實際比賽中的規則和戰術。
                  嘗試不同的擊球時機和位置，找到最佳的得分策略！
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Game;
