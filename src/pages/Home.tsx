import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../utils/constants';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* 英雄區塊 */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              歡迎來到台灣匹克球學院
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              互動式學習 • 3D 技術教學 • 全台球場地圖
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={ROUTES.LEARNING}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                開始學習
              </Link>
              <Link
                to={ROUTES.COURTS}
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold border-2 border-white hover:bg-primary-500 transition-colors"
              >
                尋找球場
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 功能介紹 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="text-4xl mb-4">🎾</div>
              <h3 className="text-xl font-semibold mb-3">互動式球場教學</h3>
              <p className="text-gray-600">
                點擊球場區域學習規則，動畫演示完整球路徑，讓你快速掌握比賽規則。
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-3">3D 技術動作教學</h3>
              <p className="text-gray-600">
                360 度旋轉觀看技術動作，分解步驟學習，標註關鍵身體位置。
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-3">全台球場地圖</h3>
              <p className="text-gray-600">
                互動式地圖顯示全台匹克球場，篩選條件快速找到適合的場地。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 學習路徑 */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">學習路徑</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-green-600">新手入門</h3>
              <p className="text-gray-600 mb-4">
                從零開始，學習基本規則、握拍方式、發球技巧。
              </p>
              <Link
                to={ROUTES.LEARNING}
                className="text-primary-500 hover:text-primary-600 font-semibold"
              >
                開始學習 →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">中階進修</h3>
              <p className="text-gray-600 mb-4">
                進階技巧、戰術策略、雙打配合。
              </p>
              <Link
                to={ROUTES.LEARNING}
                className="text-primary-500 hover:text-primary-600 font-semibold"
              >
                開始學習 →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-purple-600">進階強化</h3>
              <p className="text-gray-600 mb-4">
                專業技術、比賽心理、教練訓練方法。
              </p>
              <Link
                to={ROUTES.LEARNING}
                className="text-primary-500 hover:text-primary-600 font-semibold"
              >
                開始學習 →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
