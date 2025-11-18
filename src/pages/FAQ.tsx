import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTitle } from '../hooks/usePageTitle';
import GlassCard from '../components/common/GlassCard';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import SEOHead from '../components/common/SEOHead';
import { faqStructuredData } from '../utils/seo';
import { useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  relatedLinks?: Array<{ text: string; url: string }>;
}

const FAQ = () => {
  usePageTitle('常見問題 FAQ');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  // 添加 FAQ 結構化資料
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-faq', 'true');
    script.textContent = JSON.stringify(faqStructuredData);
    document.head.appendChild(script);

    return () => {
      const oldScript = document.querySelector('script[data-faq]');
      if (oldScript) {
        oldScript.remove();
      }
    };
  }, []);

  const faqs: FAQItem[] = [
    {
      category: '基礎知識',
      question: '什麼是匹克球（Pickleball）？',
      answer: '匹克球（Pickleball）是一項結合網球、羽毛球和乒乓球特點的球拍運動。使用類似乒乓球拍的實心球拍和有孔的塑膠球，在類似羽毛球大小的場地上進行。匹克球易學易玩，適合各年齡層，是美國成長最快的運動之一，目前在台灣也快速發展中。',
      relatedLinks: [
        { text: '了解規則', url: ROUTES.RULES },
        { text: '學習路徑', url: ROUTES.LEARNING_PATHS }
      ]
    },
    {
      category: '球場資訊',
      question: '台灣哪裡可以打匹克球？',
      answer: '台灣目前有超過55個匹克球場，主要分佈在台北、新北、台中、高雄、台南等城市。包括公園運動中心（如大安森林公園、河濱公園）、學校操場、私人球館等。您可以使用我們的「球場地圖」功能，依據地區、室內/室外、收費/免費等條件篩選，找到離您最近的匹克球場。',
      relatedLinks: [
        { text: '查看球場地圖', url: ROUTES.COURTS }
      ]
    },
    {
      category: '規則說明',
      question: '匹克球的基本規則是什麼？',
      answer: '匹克球的核心規則包括：\n\n1. **雙彈跳規則** - 發球和接發球都必須讓球落地彈起後才能擊球，這是匹克球最獨特的規則\n\n2. **廚房區（Non-Volley Zone）** - 在網前7英尺（約2.13米）的區域內不能截擊（凌空擊球），必須等球彈地\n\n3. **對角發球** - 發球必須從右側或左側對角線發向對方場地，發球時至少一隻腳要在底線後\n\n4. **計分制** - 只有發球方可以得分，雙打時每方有兩次發球機會（第一局除外），通常打到11分且領先對手2分以上獲勝。',
      relatedLinks: [
        { text: '互動式規則教學', url: ROUTES.RULES }
      ]
    },
    {
      category: '新手入門',
      question: '新手如何開始學習匹克球？',
      answer: '新手入門建議按照以下步驟：\n\n1. **了解基本規則** - 使用我們的互動式規則教學，快速掌握雙彈跳、廚房區等核心規則\n\n2. **選擇適合的球拍** - 初學者建議選擇中等重量（7.5-8.5盎司）、複合材質的球拍，價格約1000-2000元\n\n3. **找球場練習** - 使用球場地圖找離家近的場地，許多球場提供球拍租借服務\n\n4. **加入社群** - 加入本地匹克球社團（如Facebook「台灣匹克球社團」），與球友交流學習\n\n5. **觀看教學** - 觀看YouTube教學影片（如Pickleball Kitchen、Third Shot Sports）學習基本技巧\n\n我們提供完整的新手到進階學習路徑，幫助您系統化學習！',
      relatedLinks: [
        { text: '新手學習路徑', url: ROUTES.LEARNING_PATHS },
        { text: '選擇球拍', url: ROUTES.EQUIPMENT }
      ]
    },
    {
      category: '裝備選購',
      question: '匹克球拍如何選擇？',
      answer: '選擇匹克球拍需考慮以下因素：\n\n**材質選擇**\n- 碳纖維：高級選擇，輕量、穩定、價格較高（3000元以上）\n- 玻璃纖維：中級選擇，耐用、彈性好、價格適中（1500-3000元）\n- 複合材質：初學選擇，經濟實惠、適合入門（1000-1500元）\n\n**重量考量**\n- 輕拍（<7.3盎司）：靈活度高，適合網前截擊\n- 中拍（7.3-8.4盎司）：平衡性好，最受歡迎\n- 重拍（>8.5盎司）：力量大，適合底線抽球\n\n**握把尺寸**\n測量手掌到無名指尖的距離：\n- 小握把：4英寸（約10cm）\n- 中握把：4.25-4.5英寸（約11-11.5cm）\n- 大握把：4.75英寸以上\n\n**球拍形狀**\n- 寬型球拍：甜區較大，容錯率高，適合初學者\n- 長型球拍：觸球範圍廣，適合網前截擊\n\n使用我們的球拍對比工具和智能推薦系統，幫您找到最適合的球拍！',
      relatedLinks: [
        { text: '球拍完全指南', url: ROUTES.EQUIPMENT },
        { text: '球拍對比工具', url: ROUTES.EQUIPMENT }
      ]
    },
    {
      category: '規則說明',
      question: '什麼是「廚房區」（Kitchen/Non-Volley Zone）？',
      answer: '「廚房區」（Kitchen）也稱為「禁止截擊區」（Non-Volley Zone），是匹克球最重要的規則之一：\n\n**位置**：網前兩側各7英尺（約2.13米）的區域\n\n**規則**：\n- 球員站在廚房區內時，不能進行截擊（凌空擊球）\n- 必須等球落地彈起後才能擊球\n- 擊球後的慣性動作也不能踩入廚房區\n- 如果球彈地後落在廚房區內，可以進入擊球\n\n**為什麼叫「廚房」？**\n有多種說法，最流行的是：就像廚房裡不能隨意進出一樣，這個區域有特殊限制\n\n**戰術意義**：\n廚房區規則讓匹克球成為更具戰術性的運動，球員需要學習「軟球」（Dink）技術，在網前進行精巧的來回對打。',
      relatedLinks: [
        { text: '3D互動規則教學', url: ROUTES.RULES }
      ]
    },
    {
      category: '基礎知識',
      question: '匹克球和網球有什麼不同？',
      answer: '匹克球和網球的主要差異：\n\n**場地大小**\n- 匹克球場：13.4m x 6.1m（接近羽球場大小）\n- 網球場：23.77m x 10.97m（雙打）\n\n**球拍與球**\n- 匹克球：實心球拍（類似乒乓球拍放大版）+ 塑膠有孔球\n- 網球：有線球拍 + 橡膠球\n\n**規則差異**\n- 匹克球：有雙彈跳規則和廚房區限制\n- 網球：可以直接截擊\n\n**發球方式**\n- 匹克球：下手發球，必須對角線\n- 網球：上手發球\n\n**運動強度**\n- 匹克球：較溫和，適合各年齡層（5-85歲都能玩）\n- 網球：強度較大，需要較好的體能\n\n**易學程度**\n- 匹克球：規則簡單，30分鐘就能開始打\n- 網球：需要較長時間練習基本動作',
      relatedLinks: [
        { text: '了解更多規則', url: ROUTES.RULES }
      ]
    },
    {
      category: '賽事活動',
      question: '台灣有匹克球比賽嗎？',
      answer: '是的，台灣匹克球運動正在快速發展，賽事活動日益增加：\n\n**官方賽事**（由中華民國匹克球協會主辦）\n- 全國匹克球錦標賽\n- 分齡賽（35歲以上、50歲以上、65歲以上等）\n- 青少年錦標賽\n\n**地區性賽事**\n- 台北市匹克球聯賽\n- 台中市匹克球公開賽\n- 高雄市匹克球邀請賽\n\n**社群活動**\n- 各地球友會定期舉辦友誼賽\n- 雙打配對賽\n- 新手友善賽\n\n**如何參加？**\n1. 關注「中華民國匹克球協會」官網和Facebook\n2. 加入本地匹克球社團獲取賽事資訊\n3. 初學者可先參加友誼賽累積經驗\n\n賽事資訊會在我們的資源頁面更新！',
      relatedLinks: [
        { text: '學習資源', url: ROUTES.RESOURCES }
      ]
    },
    {
      category: '裝備選購',
      question: '打匹克球需要什麼裝備？',
      answer: '打匹克球需要的裝備（按重要性排序）：\n\n**必需品**\n1. **匹克球拍** - 價格從800元到8000元不等\n   - 初學者：1000-2000元的複合材質球拍即可\n   - 進階者：2000-4000元的玻璃纖維球拍\n   - 專業級：4000元以上的碳纖維球拍\n\n2. **匹克球** - 約50-150元/顆\n   - 室內用球：26孔，較軟，飛行速度慢\n   - 室外用球：40孔，較硬，耐風性好\n   - 建議購買3-6顆備用\n\n3. **運動鞋** - 建議穿著室內運動鞋\n   - 避免黑色鞋底（會留下痕跡）\n   - 選擇有良好側向支撐的鞋款\n   - 羽球鞋、網球鞋都適合\n\n**建議配備**\n- 護腕/護肘：保護關節\n- 運動毛巾：擦汗用\n- 水壺：補充水分\n- 球拍包：保護球拍\n- 握把布/吸汗帶：增加握感\n\n**初期建議**\n新手可以先到球場租借球拍體驗（通常50-100元/次），確定喜歡後再購買自己的裝備。',
      relatedLinks: [
        { text: '裝備選購指南', url: ROUTES.EQUIPMENT }
      ]
    },
    {
      category: '規則說明',
      question: '匹克球如何計分？',
      answer: '匹克球的計分規則：\n\n**基本計分**\n- 只有發球方可以得分\n- 通常打到11分（領先2分）獲勝\n- 部分比賽打15分或21分\n\n**雙打計分（最常見）**\n- 報分順序：發球方分數-接球方分數-發球員編號\n- 例如「5-3-2」表示：發球方5分、接球方3分、第2位發球員\n- 每方有兩次發球機會（除了第一局開始）\n- 第一位發球員失誤後，換第二位發球員\n- 第二位發球員也失誤，就換對方發球\n\n**單打計分**\n- 報分順序：發球方分數-接球方分數\n- 發球方得分後換邊發球\n- 分數是偶數時從右側發球，奇數時從左側發球\n\n**Deuce（平分）**\n- 當雙方都達到10分時，必須領先2分才能獲勝\n- 例如：可能打到12-10、13-11等\n\n使用我們的計分器工具，可以自動追蹤分數和發球順序！',
      relatedLinks: [
        { text: '使用計分器', url: ROUTES.SCORER }
      ]
    },
    {
      category: '技術訓練',
      question: '初學者應該練習哪些基本技巧？',
      answer: '初學者建議按順序練習以下技巧：\n\n**1. 握拍方式**（最基礎）\n- 大陸式握法（最推薦）：像握手一樣握拍\n- 確保握拍放鬆，不要過度用力\n\n**2. 發球技術**（第一優先）\n- 下手發球，擊球點在腰部以下\n- 對角線發向對方發球區\n- 練習穩定性比力量重要\n\n**3. 基本站位**\n- 準備姿勢：半蹲、膝蓋微彎、重心前傾\n- 學習正確的場上站位\n\n**4. 正反手擊球**\n- 正手抽球：側身、轉腰、揮拍\n- 反手抽球：雙手反拍較穩定\n- 練習擊球後快速回位\n\n**5. 軟球（Dink）**（進階技術）\n- 在廚房區邊緣的輕柔來回\n- 控制力道，讓球低過網\n- 這是匹克球最重要的技術之一\n\n**6. 截擊技術**\n- 在廚房區外進行截擊\n- 動作要簡短、乾脆\n\n**練習建議**\n- 每次練習1-2個技巧就好\n- 多與球友對打累積實戰經驗\n- 觀看我們的3D教學影片理解技術要領',
      relatedLinks: [
        { text: '技巧教學', url: ROUTES.LEARNING },
        { text: '學習路徑', url: ROUTES.LEARNING_PATHS }
      ]
    },
    {
      category: '球場資訊',
      question: '台灣的匹克球場是免費的嗎？',
      answer: '台灣的匹克球場收費情況各不相同：\n\n**免費球場**（約佔60%）\n- 公園運動場：大安森林公園、河濱公園等\n- 學校操場：部分學校開放時段免費\n- 社區活動中心：部分社區提供\n\n**收費球場**（約佔40%）\n- 運動中心：約100-200元/小時\n- 私人球館：約200-500元/小時\n- 租借場地：依場地設施而定\n\n**使用球場地圖篩選**\n我們的球場地圖功能可以依「免費/收費」進行篩選：\n1. 打開球場地圖\n2. 使用篩選功能選擇「免費」\n3. 查看離您最近的免費球場\n\n**注意事項**\n- 免費球場可能需要排隊或預約\n- 部分球場有開放時段限制\n- 建議先查詢球場規定或加入當地球友群組了解情況',
      relatedLinks: [
        { text: '查看球場地圖', url: ROUTES.COURTS }
      ]
    }
  ];

  const categories = ['全部', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = activeCategory === '全部'
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50">
      <SEOHead page="faq" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white py-20 overflow-hidden">
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
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-display-2xl font-black mb-4"
          >
            常見問題 FAQ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-body-xl text-white/90 max-w-2xl mx-auto"
          >
            關於匹克球的所有疑問，都在這裡為您解答
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 分類篩選 */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    activeCategory === category
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ 列表 */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <GlassCard
                key={index}
                variant="light"
                size="lg"
                hoverable
                clickable
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              >
                <div className="cursor-pointer">
                  {/* 問題 */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-700 rounded-full text-caption-sm font-bold mb-3">
                        {faq.category}
                      </span>
                      <h3 className="font-display text-heading-lg font-black text-neutral-900">
                        {faq.question}
                      </h3>
                    </div>
                    <motion.div
                      animate={{ rotate: activeIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl text-primary-500 flex-shrink-0"
                    >
                      ▼
                    </motion.div>
                  </div>

                  {/* 答案 */}
                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-neutral-200">
                          <div className="text-body-md text-neutral-700 leading-relaxed whitespace-pre-line mb-4">
                            {faq.answer}
                          </div>

                          {/* 相關連結 */}
                          {faq.relatedLinks && faq.relatedLinks.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-neutral-200">
                              <p className="text-caption-md font-bold text-neutral-600 mb-2">
                                相關資源：
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {faq.relatedLinks.map((link, i) => (
                                  <Link
                                    key={i}
                                    to={link.url}
                                    className="inline-flex items-center px-4 py-2 bg-secondary-500/10 hover:bg-secondary-500/20 text-secondary-700 rounded-lg font-bold text-caption-md transition-all"
                                  >
                                    {link.text} →
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <GlassCard variant="primary" size="xl" className="text-center">
              <h3 className="font-display text-heading-2xl font-black text-neutral-900 mb-4">
                找不到答案？
              </h3>
              <p className="text-body-lg text-neutral-700 mb-6">
                歡迎加入我們的社群，與其他球友交流討論！
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to={ROUTES.RESOURCES}>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-secondary-600 rounded-full font-display font-black text-heading-md shadow-elevated-lg hover:shadow-elevated-xl transition-all duration-300"
                  >
                    查看社群資源
                  </motion.button>
                </Link>
                <Link to={ROUTES.COURTS}>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/30 backdrop-blur-sm border-2 border-white text-neutral-900 rounded-full font-display font-black text-heading-md hover:bg-white/50 transition-all duration-300"
                  >
                    尋找附近球場
                  </motion.button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
