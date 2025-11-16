import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PickleballGame from '../components/game/PickleballGame';
import { ROUTES } from '../utils/constants';

const Game = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sport-50 via-court-50 to-pickleball-50">
      {/* 返回按鈕 */}
      <div className="container mx-auto px-4 py-4">
        <Link
          to={ROUTES.LEARNING}
          className="inline-flex items-center space-x-2 text-sport-600 hover:text-sport-700 font-semibold transition-colors"
        >
          <span>←</span>
          <span>返回教學</span>
        </Link>
      </div>

      {/* 遊戲標題 */}
      <div className="container mx-auto px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-sport-600 via-court-600 to-pickleball-600">
            匹克球互動遊戲
          </h1>
          <p className="text-gray-600 text-lg">
            體驗簡化版的乒乓球式匹克球對戰！使用上下鍵移動球拍接球
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
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🎮</span>
              遊戲玩法
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-sport-500 mr-2">•</span>
                <span>按空白鍵開始遊戲，球會自動左右移動</span>
              </li>
              <li className="flex items-start">
                <span className="text-sport-500 mr-2">•</span>
                <span>使用上下方向鍵（或 W/S）移動球拍</span>
              </li>
              <li className="flex items-start">
                <span className="text-sport-500 mr-2">•</span>
                <span>用球拍接住球並反彈回對方場地</span>
              </li>
              <li className="flex items-start">
                <span className="text-sport-500 mr-2">•</span>
                <span>讓對手接不到球就可以得分</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              遊戲技巧
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-court-500 mr-2">•</span>
                <span>保持球拍在中間位置，方便上下移動</span>
              </li>
              <li className="flex items-start">
                <span className="text-court-500 mr-2">•</span>
                <span>預判球的移動方向，提前移動球拍</span>
              </li>
              <li className="flex items-start">
                <span className="text-court-500 mr-2">•</span>
                <span>在球拍上下不同位置接球會改變角度</span>
              </li>
              <li className="flex items-start">
                <span className="text-court-500 mr-2">•</span>
                <span>嘗試讓球以刁鑽角度反彈讓對手難接</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Game;
