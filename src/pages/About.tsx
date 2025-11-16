import { motion } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';

const About = () => {
  usePageTitle('關於我們');
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-sport-50 to-court-50">
      <div className="container mx-auto px-4 py-12">
        {/* 標題區 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pickleball-600 to-sport-600">
            關於匹克球
          </h1>
          <p className="text-xl text-gray-600">
            全球成長最快速的球拍運動
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* 什麼是匹克球 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-black text-gray-800">什麼是匹克球？</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                匹克球（Pickleball）是一種結合<strong className="text-sport-600">網球</strong>、
                <strong className="text-court-600">羽毛球</strong>和
                <strong className="text-pickleball-600">乒乓球</strong>元素的球拍運動，
                於 <strong>1965 年</strong>在美國華盛頓州誕生。這項運動使用特殊的塑膠球和實心球拍，
                在類似網球但較小的場地上進行。
              </p>
              <div className="bg-gradient-to-r from-sport-50 to-court-50 rounded-2xl p-6">
                <p className="text-gray-800 text-base leading-relaxed">
                  匹克球以其<strong>易學性、趣味性和社交性</strong>，成為全球成長最快速的運動之一。
                  無論年齡或技術水平如何，都能輕鬆上手享受這項運動的樂趣！
                </p>
              </div>
            </div>

            {/* 統計數據 */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 mt-8">
              <div className="bg-gradient-to-br from-sport-100 to-sport-200 rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-3xl font-black text-sport-700">8.9M+</div>
                <div className="text-xs md:text-sm text-gray-700 mt-1">美國球員數</div>
              </div>
              <div className="bg-gradient-to-br from-court-100 to-court-200 rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-3xl font-black text-court-700">70+</div>
                <div className="text-xs md:text-sm text-gray-700 mt-1">國家普及</div>
              </div>
              <div className="bg-gradient-to-br from-pickleball-100 to-pickleball-200 rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-3xl font-black text-pickleball-700">158.6%</div>
                <div className="text-xs md:text-sm text-gray-700 mt-1">三年成長率</div>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-3 md:p-4 text-center">
                <div className="text-2xl md:text-3xl font-black text-gray-700">1965</div>
                <div className="text-xs md:text-sm text-gray-700 mt-1">運動誕生年</div>
              </div>
            </div>
          </motion.section>

          {/* 球場規格 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-black text-gray-800">球場規格</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-sport-50 to-white rounded-2xl p-6">
                <h3 className="font-bold text-xl text-sport-700 mb-4">
                  場地尺寸
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-sport-500 mr-2 font-bold">•</span>
                    <span className="text-gray-700"><strong>長度：</strong>13.41 公尺（44 英尺）</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sport-500 mr-2 font-bold">•</span>
                    <span className="text-gray-700"><strong>寬度：</strong>6.10 公尺（20 英尺）</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sport-500 mr-2 font-bold">•</span>
                    <span className="text-gray-700"><strong>非截擊區：</strong>2.13 公尺（7 英尺）</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sport-500 mr-2 font-bold">•</span>
                    <span className="text-gray-700"><strong>球網高度：</strong>91.4 公分（中央）</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-court-50 to-white rounded-2xl p-6">
                <h3 className="font-bold text-xl text-court-700 mb-4">
                  裝備規格
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-court-500 mr-2 font-bold">•</span>
                    <span className="text-gray-700"><strong>球拍：</strong>實心複合材質（最長 24 英吋）</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-court-500 mr-2 font-bold">•</span>
                    <span className="text-gray-700"><strong>球：</strong>有孔塑膠球（26-40 個孔）</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-court-500 mr-2 font-bold">•</span>
                    <span className="text-gray-700"><strong>室外球：</strong>40 孔，較重</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-court-500 mr-2 font-bold">•</span>
                    <span className="text-gray-700"><strong>室內球：</strong>26 孔，較輕</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* 為什麼選擇匹克球 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-pickleball-100 to-sport-100 rounded-3xl shadow-2xl p-8 md:p-12 mb-8"
          >
            <h2 className="text-3xl font-black text-gray-800 mb-8 text-center">
              為什麼選擇匹克球？
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-2 text-gray-800">易學易上手</h3>
                <p className="text-gray-600 text-sm">
                  規則簡單明瞭，初學者也能在短時間內掌握基本技巧，快速享受比賽樂趣
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-2 text-gray-800">社交性強</h3>
                <p className="text-gray-600 text-sm">
                  雙打為主的比賽形式，促進團隊合作與社交互動，結交志同道合的球友
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-2 text-gray-800">老少咸宜</h3>
                <p className="text-gray-600 text-sm">
                  運動強度適中，從兒童到長者都能參與，是全家大小都適合的運動
                </p>
              </div>
            </div>
          </motion.section>

          {/* 匹克球在台灣 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-black text-gray-800">匹克球在台灣</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                匹克球在台灣的發展<strong className="text-sport-600">日益蓬勃</strong>，各縣市陸續增設專用球場。
                <strong className="text-court-600">台灣匹克球協會</strong>積極推廣這項運動，
                舉辦各級賽事和教練培訓課程，讓更多人認識並愛上匹克球。
              </p>
              <div className="bg-gradient-to-r from-sport-50 to-court-50 rounded-2xl p-6">
                <p className="text-gray-800 leading-relaxed">
                  從<strong>公園</strong>到<strong>運動中心</strong>，越來越多地方可以打匹克球。
                  無論你是想運動健身、社交交友，或是追求競技挑戰，
                  匹克球都是一個絕佳的選擇！立即在<strong className="text-sport-600">球場地圖</strong>找到離你最近的球場，
                  開始你的匹克球之旅吧！
                </p>
              </div>
            </div>

            {/* CTA 按鈕 */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="/picklemaster-tw/courts"
                className="px-8 py-4 bg-gradient-to-r from-sport-500 to-court-500 text-white rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                尋找附近球場
              </a>
              <a
                href="/picklemaster-tw/learning"
                className="px-8 py-4 bg-white border-2 border-sport-500 text-sport-700 rounded-full font-bold hover:bg-sport-50 hover:scale-105 transition-all duration-300"
              >
                開始學習技巧
              </a>
            </div>
          </motion.section>

          {/* 關於開發者 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mt-8"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-black text-gray-800">關於開發者</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 個人資訊 */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-br from-sport-50 to-court-50 rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-sport-500 to-court-500 rounded-full flex items-center justify-center text-white text-4xl font-black">
                      MW
                    </div>
                    <h3 className="text-2xl font-black text-gray-800">Max Wu</h3>
                    <p className="text-gray-600 font-semibold">@wutiger555</p>
                    <p className="text-sm text-gray-500 mt-2">Taipei, Taiwan</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">•</span>
                      <span>Technical Consultant</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">•</span>
                      <span>PMP® Certified</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">•</span>
                      <span>Focusing</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center space-x-3">
                    <a
                      href="https://github.com/wutiger555"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all text-sm font-semibold"
                    >
                      GitHub
                    </a>
                    <a
                      href="https://linkedin.com/in/wutiger555"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>

              {/* 專業技能與經歷 */}
              <div className="md:col-span-2">
                <div className="space-y-6">
                  {/* 簡介 */}
                  <div>
                    <h4 className="font-bold text-lg text-gray-800 mb-3">關於我</h4>
                    <p className="text-gray-700 leading-relaxed">
                      從後端工程師到技術專案經理，目前在全球顧問公司擔任技術顧問，
                      負責台灣最大核心銀行現代化專案的子系統交付。熱衷於使用 AI 工具提升工作效率，
                      相信「重複的事情就自動化，複雜的事情就簡化」。
                    </p>
                  </div>

                  {/* 技術棧 */}
                  <div>
                    <h4 className="font-bold text-lg text-gray-800 mb-3">技術棧</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">程式語言</p>
                        <div className="flex flex-wrap gap-2">
                          {['Python', 'TypeScript', 'Swift', 'Go', 'SQL'].map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-sport-100 text-sport-700 rounded-full text-xs font-semibold"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">框架/工具</p>
                        <div className="flex flex-wrap gap-2">
                          {['React', 'React Native', 'SwiftUI', 'FastAPI'].map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-court-100 text-court-700 rounded-full text-xs font-semibold"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">雲端服務</p>
                        <div className="flex flex-wrap gap-2">
                          {['AWS', 'GCP', 'Firebase', 'Docker'].map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-pickleball-100 text-pickleball-700 rounded-full text-xs font-semibold"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">AI 工具</p>
                        <div className="flex flex-wrap gap-2">
                          {['Claude', 'ChatGPT', 'Cursor', 'Copilot'].map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 精選專案 */}
                  <div>
                    <h4 className="font-bold text-lg text-gray-800 mb-3">精選專案</h4>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-sport-50 to-white rounded-xl p-4">
                        <h5 className="font-bold text-gray-800 mb-1">Picklemaster Taiwan</h5>
                        <p className="text-sm text-gray-600">
                          台灣匹克球社群平台，提供球場地圖、互動遊戲、學習資源等功能
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-court-50 to-white rounded-xl p-4">
                        <h5 className="font-bold text-gray-800 mb-1">Aura - 遠距情侶氛圍分享</h5>
                        <p className="text-sm text-gray-600">
                          使用 React Native + TypeScript 開發的即時同步氛圍分享應用
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-pickleball-50 to-white rounded-xl p-4">
                        <h5 className="font-bold text-gray-800 mb-1">Meeting Notes AI</h5>
                        <p className="text-sm text-gray-600">
                          整合 Claude API 與 Notion 的會議記錄自動化工具
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 座右銘 */}
                  <div className="bg-gradient-to-r from-sport-100 to-court-100 rounded-2xl p-6">
                    <p className="text-gray-800 text-center italic font-semibold">
                      "If it's repetitive, automate it. If it's complex, simplify it."
                    </p>
                    <p className="text-gray-600 text-center text-sm mt-2">
                      — 重複的事情就自動化，複雜的事情就簡化
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default About;
