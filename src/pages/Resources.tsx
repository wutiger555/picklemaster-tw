import { motion } from 'framer-motion';

const Resources = () => {
  const organizations = [
    {
      name: '中華民國匹克球協會',
      nameEn: 'Taiwan Pickleball Association',
      url: 'https://pickleball.org.tw',
      description: '台灣官方匹克球組織，提供賽事資訊、教練培訓、球場資訊等',
      icon: '🇹🇼',
      type: '官方組織',
    },
    {
      name: 'USA Pickleball',
      nameEn: 'Official Governing Body',
      url: 'https://usapickleball.org',
      description: '美國匹克球協會，提供官方規則、教學影片、賽事資訊',
      icon: '🇺🇸',
      type: '國際組織',
    },
    {
      name: 'International Federation of Pickleball',
      nameEn: 'IFP',
      url: 'https://ifp pickleball.org',
      description: '國際匹克球聯盟，推動全球匹克球運動發展',
      icon: '🌍',
      type: '國際組織',
    },
  ];

  const youtubeChannels = [
    {
      name: 'Pickleball Kitchen',
      description: '詳細的技術分析與戰術教學',
      subscribers: '350K+',
      icon: '🎬',
      topics: ['技術分析', '戰術教學', '職業賽事'],
    },
    {
      name: 'Third Shot Sports',
      description: '新手友善的基礎教學與技巧分享',
      subscribers: '250K+',
      icon: '📚',
      topics: ['基礎教學', '技巧分享', '裝備評測'],
    },
    {
      name: 'Pickleball 411',
      description: '進階技巧與策略，適合中高階球員',
      subscribers: '180K+',
      icon: '🏆',
      topics: ['進階技巧', '比賽策略', 'Drill 練習'],
    },
    {
      name: 'Better Pickleball',
      description: '專注於改善球技的系統化教學',
      subscribers: '200K+',
      icon: '📈',
      topics: ['系統化教學', '常見錯誤', '技巧提升'],
    },
  ];

  const communities = [
    {
      platform: 'Facebook',
      name: '台灣匹克球社團',
      description: '台灣最大的匹克球社群，分享球場資訊、球友交流、活動公告',
      icon: '📘',
      members: '5,000+',
    },
    {
      platform: 'LINE',
      name: '各地區匹克球群組',
      description: '按地區加入 LINE 群組，即時約球、球場通知、技術討論',
      icon: '💬',
      members: '多個群組',
    },
    {
      platform: 'Instagram',
      name: '#台灣匹克球',
      description: '追蹤 #pickleballtaiwan #台灣匹克球，看精彩球技影片',
      icon: '📷',
      members: '成長中',
    },
    {
      platform: 'Discord',
      name: 'Pickleball Taiwan Server',
      description: '線上即時討論、尋找球友、語音通話約球',
      icon: '🎮',
      members: '新興社群',
    },
  ];

  const books = [
    {
      title: 'Pickleball Fundamentals',
      author: 'Mary Littlewood',
      description: '全面性的基礎教學，適合初學者入門',
      icon: '📖',
    },
    {
      title: 'Championship Pickleball',
      author: 'Prem Carnot',
      description: '進階策略與競賽技巧，適合想參加比賽的球員',
      icon: '🏅',
    },
    {
      title: 'Smart Pickleball',
      author: 'Prem Carnot & Scott Moore',
      description: '戰術思考與心理素質，提升比賽表現',
      icon: '🧠',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-court-50 to-sport-50">
      <div className="container mx-auto px-4 py-12">
        {/* 標題區 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-court-600 to-pickleball-600">
            學習資源
          </h1>
          <p className="text-xl text-gray-600">
            精選優質資源，助你快速成長 📚
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-12">
          {/* 官方組織 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center">
              <span className="mr-3 text-4xl">🏛️</span>
              官方組織
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {organizations.map((org, index) => (
                <a
                  key={index}
                  href={org.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <div className="text-5xl mb-3">{org.icon}</div>
                  <span className="inline-block px-3 py-1 bg-sport-100 text-sport-700 rounded-full text-xs font-bold mb-3">
                    {org.type}
                  </span>
                  <h3 className="font-bold text-lg mb-1 text-gray-800">{org.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{org.nameEn}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{org.description}</p>
                  <div className="mt-4 flex items-center text-sport-600 font-semibold text-sm">
                    前往網站 →
                  </div>
                </a>
              ))}
            </div>
          </motion.section>

          {/* YouTube 教學頻道 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center">
              <span className="mr-3 text-4xl">🎥</span>
              YouTube 教學頻道
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {youtubeChannels.map((channel, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{channel.icon}</div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                      {channel.subscribers}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{channel.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{channel.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {channel.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gradient-to-r from-sport-50 to-court-50 text-gray-700 rounded-full text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 社群與活動 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center">
              <span className="mr-3 text-4xl">👥</span>
              社群與活動
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communities.map((community, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{community.icon}</div>
                    <span className="px-3 py-1 bg-pickleball-100 text-pickleball-700 rounded-full text-xs font-bold">
                      {community.members}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-gray-800">{community.platform}</h3>
                  <p className="text-sm font-semibold text-sport-600 mb-2">{community.name}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{community.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 推薦書籍 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center">
              <span className="mr-3 text-4xl">📚</span>
              推薦書籍
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {books.map((book, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-5xl mb-3">{book.icon}</div>
                  <h3 className="font-bold text-lg mb-1 text-gray-800">{book.title}</h3>
                  <p className="text-sm text-sport-600 mb-3">by {book.author}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{book.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 裝備建議 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-pickleball-100 to-sport-100 rounded-3xl shadow-2xl p-8 md:p-12"
          >
            <h2 className="text-3xl font-black text-gray-800 mb-8 text-center flex items-center justify-center">
              <span className="mr-3 text-4xl">🛒</span>
              裝備選購建議
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-bold text-xl text-court-700 mb-4 flex items-center">
                  <span className="mr-2">🏓</span>球拍預算參考
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-semibold text-gray-700">入門級</span>
                    <span className="text-court-600 font-bold">NT$ 2,000 - 4,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-semibold text-gray-700">中階級</span>
                    <span className="text-sport-600 font-bold">NT$ 4,000 - 8,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">高階級</span>
                    <span className="text-pickleball-600 font-bold">NT$ 8,000+</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  💡 提示：新手建議從中階球拍開始，重量 7.5-8.5 oz 較適合
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-bold text-xl text-sport-700 mb-4 flex items-center">
                  <span className="mr-2">👕</span>其他裝備
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-sport-500 mr-2">•</span>
                    <div>
                      <p className="font-semibold text-gray-800">鞋子</p>
                      <p className="text-sm text-gray-600">室內運動鞋或網球鞋，良好抓地力</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-sport-500 mr-2">•</span>
                    <div>
                      <p className="font-semibold text-gray-800">服裝</p>
                      <p className="text-sm text-gray-600">透氣排汗的運動服飾</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-sport-500 mr-2">•</span>
                    <div>
                      <p className="font-semibold text-gray-800">配件</p>
                      <p className="text-sm text-gray-600">護腕、頭帶、運動毛巾</p>
                    </div>
                  </div>
                </div>
                <a
                  href="/picklemaster-tw/learning#paddle-guide"
                  className="inline-block mt-4 px-4 py-2 bg-sport-500 text-white rounded-full text-sm font-semibold hover:bg-sport-600 transition-colors"
                >
                  查看詳細球拍指南 →
                </a>
              </div>
            </div>
          </motion.section>

          {/* CTA 區塊 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center"
          >
            <h3 className="text-2xl font-black text-gray-800 mb-4">
              準備好開始你的匹克球之旅了嗎？
            </h3>
            <p className="text-gray-600 mb-8">
              探索台灣各地球場，學習專業技巧，加入球友社群！
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/picklemaster-tw/courts"
                className="px-8 py-4 bg-gradient-to-r from-sport-500 to-court-500 text-white rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                🗺️ 尋找球場
              </a>
              <a
                href="/picklemaster-tw/learning"
                className="px-8 py-4 bg-white border-2 border-sport-500 text-sport-700 rounded-full font-bold hover:bg-sport-50 hover:scale-105 transition-all duration-300"
              >
                📚 學習技巧
              </a>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Resources;
