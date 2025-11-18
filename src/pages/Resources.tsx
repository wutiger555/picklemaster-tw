import { motion } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';
import GlassCard from '../components/common/GlassCard';
import { staggerContainer, staggerItem } from '../utils/animations';

const Resources = () => {
  usePageTitle('匹克球資源');

  const organizations = [
    {
      name: '中華民國匹克球協會',
      nameEn: 'Taiwan Pickleball Association',
      url: 'https://pickleball.org.tw',
      description: '台灣官方匹克球組織，提供賽事資訊、教練培訓、球場資訊等',
      type: '官方組織',
      variant: 'primary' as const,
    },
    {
      name: 'USA Pickleball',
      nameEn: 'Official Governing Body',
      url: 'https://usapickleball.org',
      description: '美國匹克球協會，提供官方規則、教學影片、賽事資訊',
      type: '國際組織',
      variant: 'secondary' as const,
    },
    {
      name: 'International Federation of Pickleball',
      nameEn: 'IFP',
      url: 'https://ifppickleball.org',
      description: '國際匹克球聯盟，推動全球匹克球運動發展',
      type: '國際組織',
      variant: 'accent' as const,
    },
  ];

  const youtubeChannels = [
    {
      name: 'Pickleball Kitchen',
      description: '詳細的技術分析與戰術教學',
      subscribers: '350K+',
      topics: ['技術分析', '戰術教學', '職業賽事'],
      icon: '🎬',
    },
    {
      name: 'Third Shot Sports',
      description: '新手友善的基礎教學與技巧分享',
      subscribers: '250K+',
      topics: ['基礎教學', '技巧分享', '裝備評測'],
      icon: '📹',
    },
    {
      name: 'Pickleball 411',
      description: '進階技巧與策略，適合中高階球員',
      subscribers: '180K+',
      topics: ['進階技巧', '比賽策略', 'Drill 練習'],
      icon: '🎓',
    },
    {
      name: 'Better Pickleball',
      description: '專注於改善球技的系統化教學',
      subscribers: '200K+',
      topics: ['系統化教學', '常見錯誤', '技巧提升'],
      icon: '⭐',
    },
  ];

  const communities = [
    {
      platform: 'Facebook',
      name: '台灣匹克球社團',
      description: '台灣最大的匹克球社群，分享球場資訊、球友交流、活動公告',
      members: '5,000+',
      icon: '👥',
      variant: 'secondary' as const,
    },
    {
      platform: 'LINE',
      name: '各地區匹克球群組',
      description: '按地區加入 LINE 群組，即時約球、球場通知、技術討論',
      members: '多個群組',
      icon: '💬',
      variant: 'primary' as const,
    },
    {
      platform: 'Instagram',
      name: '#台灣匹克球',
      description: '追蹤 #pickleballtaiwan #台灣匹克球，看精彩球技影片',
      members: '成長中',
      icon: '📸',
      variant: 'accent' as const,
    },
    {
      platform: 'Discord',
      name: 'Pickleball Taiwan Server',
      description: '線上即時討論、尋找球友、語音通話約球',
      members: '新興社群',
      icon: '🎮',
      variant: 'primary' as const,
    },
  ];

  const books = [
    {
      title: 'Pickleball Fundamentals',
      author: 'Mary Littlewood',
      description: '全面性的基礎教學，適合初學者入門',
      icon: '📗',
    },
    {
      title: 'Championship Pickleball',
      author: 'Prem Carnot',
      description: '進階策略與競賽技巧，適合想參加比賽的球員',
      icon: '📘',
    },
    {
      title: 'Smart Pickleball',
      author: 'Prem Carnot & Scott Moore',
      description: '戰術思考與心理素質，提升比賽表現',
      icon: '📙',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50">
      {/* Header Section */}
      <section className="relative bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white py-20 overflow-hidden">
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <motion.path
              d="M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z"
              fill="white"
              animate={{
                d: [
                  "M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z",
                  "M0,50 C150,20 350,100 600,50 C850,0 1050,80 1200,50 L1200,120 L0,120 Z",
                  "M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z"
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="font-display text-display-2xl font-black mb-4">
              學習資源
            </h1>
            <p className="text-body-xl text-white/90 max-w-2xl mx-auto">
              精選優質資源，助你快速成長
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* 官方組織 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-heading-2xl font-black text-neutral-900 mb-8 text-center">
              🏛️ 官方組織
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {organizations.map((org, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    <GlassCard
                      variant={org.variant}
                      size="md"
                      hoverable
                      magnetic
                      className="h-full"
                    >
                      <span className="inline-block px-3 py-1 bg-white/50 backdrop-blur-sm text-neutral-900 rounded-full text-caption-sm font-bold mb-4">
                        {org.type}
                      </span>
                      <h3 className="font-display text-heading-lg font-black mb-2 text-neutral-900">
                        {org.name}
                      </h3>
                      <p className="text-caption-md text-neutral-600 mb-3">{org.nameEn}</p>
                      <p className="text-body-md text-neutral-700 leading-relaxed mb-4">
                        {org.description}
                      </p>
                      <div className="flex items-center text-neutral-900 font-bold text-caption-lg">
                        前往網站 →
                      </div>
                    </GlassCard>
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* YouTube 教學頻道 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-heading-2xl font-black text-neutral-900 mb-8 text-center">
              📺 YouTube 教學頻道
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {youtubeChannels.map((channel, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <GlassCard
                    variant="light"
                    size="md"
                    hoverable
                    magnetic
                    className="h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{channel.icon}</span>
                      <span className="px-3 py-1 bg-accent-500/20 backdrop-blur-sm text-accent-700 rounded-full text-caption-sm font-bold font-mono">
                        {channel.subscribers}
                      </span>
                    </div>
                    <h3 className="font-display text-heading-lg font-black mb-2 text-neutral-900">
                      {channel.name}
                    </h3>
                    <p className="text-body-md text-neutral-700 mb-4">{channel.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {channel.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-secondary-500/10 backdrop-blur-sm text-neutral-700 rounded-full text-caption-sm font-semibold"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* 社群與活動 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-heading-2xl font-black text-neutral-900 mb-8 text-center">
              🌐 社群與活動
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {communities.map((community, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <GlassCard
                    variant={community.variant}
                    size="md"
                    hoverable
                    magnetic
                    className="h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{community.icon}</span>
                      <span className="px-3 py-1 bg-white/50 backdrop-blur-sm text-neutral-900 rounded-full text-caption-sm font-bold font-mono">
                        {community.members}
                      </span>
                    </div>
                    <h3 className="font-display text-heading-lg font-black mb-1 text-neutral-900">
                      {community.platform}
                    </h3>
                    <p className="text-body-md font-bold text-neutral-800 mb-2">
                      {community.name}
                    </p>
                    <p className="text-body-md text-neutral-700 leading-relaxed">
                      {community.description}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* 推薦書籍 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-heading-2xl font-black text-neutral-900 mb-8 text-center">
              📚 推薦書籍
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {books.map((book, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <GlassCard
                    variant="light"
                    size="md"
                    hoverable
                    magnetic
                    className="h-full"
                  >
                    <div className="text-5xl mb-4">{book.icon}</div>
                    <h3 className="font-display text-heading-lg font-black mb-1 text-neutral-900">
                      {book.title}
                    </h3>
                    <p className="text-caption-lg text-secondary-600 font-bold mb-3">
                      by {book.author}
                    </p>
                    <p className="text-body-md text-neutral-700 leading-relaxed">
                      {book.description}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* CTA 區塊 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard variant="primary" size="xl" className="text-center">
              <h3 className="font-display text-heading-2xl font-black text-neutral-900 mb-4">
                準備好開始你的匹克球之旅了嗎？
              </h3>
              <p className="text-body-lg text-neutral-700 mb-8">
                探索台灣各地球場，學習專業技巧，加入球友社群！
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.a
                  href="/picklemaster-tw/courts"
                  className="px-8 py-4 bg-white text-secondary-600 rounded-full font-display font-black text-heading-md shadow-elevated-lg hover:shadow-elevated-xl transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🗺️ 尋找球場
                </motion.a>
                <motion.a
                  href="/picklemaster-tw/rules"
                  className="px-8 py-4 bg-white/30 backdrop-blur-sm border-2 border-white text-neutral-900 rounded-full font-display font-black text-heading-md hover:bg-white/50 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📚 學習規則
                </motion.a>
              </div>
            </GlassCard>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Resources;
