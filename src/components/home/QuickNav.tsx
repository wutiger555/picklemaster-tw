import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../utils/constants';
import GlassCard from '../common/GlassCard';
import SearchBar from '../search/SearchBar';

const QuickNav = () => {
  const quickLinks = [
    {
      title: '🏟️ 找球場',
      description: '55+ 球場地圖',
      path: ROUTES.COURTS,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: '🎯 學規則',
      description: '互動式教學',
      path: ROUTES.RULES,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: '🏓 選球拍',
      description: '裝備推薦',
      path: ROUTES.EQUIPMENT,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: '📚 開始學',
      description: '完整課程',
      path: ROUTES.LEARNING,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
    },
  ];

  const popularContent = [
    {
      icon: '📍',
      title: '台北球場推薦',
      description: '查看台北市最熱門的匹克球場',
      path: ROUTES.COURTS,
      tag: '熱門',
    },
    {
      icon: '❓',
      title: '新手常見問題',
      description: '初學者必看的FAQ',
      path: ROUTES.FAQ,
      tag: '新手',
    },
    {
      icon: '🎮',
      title: '線上互動遊戲',
      description: '在遊戲中學習規則',
      path: ROUTES.GAME,
      tag: '推薦',
    },
    {
      icon: '📊',
      title: '專業計分器',
      description: '比賽計分必備工具',
      path: ROUTES.SCORER,
      tag: '工具',
    },
    {
      icon: '🎥',
      title: 'YouTube 教學',
      description: '精選影片教學資源',
      path: ROUTES.RESOURCES,
      tag: '資源',
    },
    {
      icon: '🏆',
      title: '學習路徑',
      description: '系統化進階課程',
      path: ROUTES.LEARNING_PATHS,
      tag: '進階',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-neutral-50">
      <div className="container mx-auto px-4">
        {/* 大型搜尋欄 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-neutral-900">
            快速找到你需要的資訊
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            搜尋球場、規則、裝備或任何匹克球相關內容
          </p>
          <div className="flex justify-center">
            <SearchBar variant="hero" />
          </div>
        </motion.div>

        {/* 快速連結 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h3 className="font-display text-2xl font-bold mb-6 text-neutral-900 text-center">
            快速入口
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {quickLinks.map((link, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={link.path}
                  className={`block ${link.bgColor} rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:border-neutral-200`}
                >
                  <div className={`text-4xl mb-3 bg-gradient-to-r ${link.color} bg-clip-text text-transparent font-bold`}>
                    {link.title.split(' ')[0]}
                  </div>
                  <div className="font-bold text-neutral-900 mb-1">
                    {link.title.substring(link.title.indexOf(' ') + 1)}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {link.description}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 熱門內容索引 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard variant="light" size="lg">
            <h3 className="font-display text-2xl font-bold mb-6 text-neutral-900 text-center">
              熱門內容
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularContent.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="group block p-4 rounded-xl hover:bg-white transition-all duration-300 border-2 border-transparent hover:border-primary-200 hover:shadow-md"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl flex-shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* 底部提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center space-x-2 text-sm text-neutral-600 bg-neutral-100 px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>找不到資訊？使用上方搜尋欄或</span>
            <Link to={ROUTES.FAQ} className="text-primary-600 hover:text-primary-700 font-semibold underline">
              查看常見問題
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QuickNav;
