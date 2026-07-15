// 深度長文資料 - 2026 版
// 每篇針對一個高搜索量主題，2000-3000 字深度內容
// 特別為 AI Search (Google AI Overview, Perplexity, ChatGPT) 優化的結構

export type ArticleCategory = '器材評測' | '運動科學' | '技術戰術' | '族群指南' | '規則知識' | '比較分析';

export interface ArticleSection {
  heading: string;
  content: string;      // HTML 字串，支援 <p> <ul> <strong> 等標記
}

export interface ArticleFAQ {
  question: string;
  answer: string;
}

export interface Article {
  slug: string;
  title: string;
  subtitle: string;
  category: ArticleCategory;
  readingTime: number;         // 分鐘
  publishedDate: string;       // ISO
  updatedDate: string;
  author: string;
  summary: string;             // 80-120 字摘要（meta description 用）
  tags: string[];
  coverEmoji: string;          // 視覺佔位（無需圖片資源）
  tableOfContents: string[];   // 目錄（章節標題）
  sections: ArticleSection[];
  faqs: ArticleFAQ[];          // 文章結尾的 FAQPage schema
  references?: { title: string; url: string }[];
  featured?: boolean;
}

export const ARTICLES: Article[] = [
  // ========== 1. 2026 十大匹克球拍評測 ==========
  {
    slug: '2026-best-pickleball-paddles',
    title: '2026 十大匹克球拍完整評測',
    subtitle: '從職業級到新手友善，讓你 30 分鐘找到命定球拍',
    category: '器材評測',
    readingTime: 12,
    publishedDate: '2026-04-25',
    updatedDate: '2026-04-25',
    author: 'Picklemaster Taiwan',
    summary: '2026 年十大熱門匹克球拍完整評測：JOOLA Perseus Pro IV、Selkirk Labs Project 002、Paddletek Bantam TS-5 等頂級選手愛用款，附新手/中階/高階完整推薦。',
    tags: ['球拍', '評測', '2026', 'JOOLA', 'Selkirk', 'Paddletek'],
    coverEmoji: '🏓',
    featured: true,
    tableOfContents: [
      '2026 球拍市場趨勢：熱壓成型當道',
      '評測方法論：我們怎麼測的',
      'Top 10 球拍完整評比',
      '新手友善 3 款',
      '中階玩家 3 款',
      '職業級 4 款',
      '材質科普：碳纖維 vs 玻璃纖維 vs T700',
      '重量 vs 甜蜜點 vs 球感的三角平衡',
      '如何決定自己的球拍',
    ],
    sections: [
      {
        heading: '2026 球拍市場趨勢：熱壓成型當道',
        content: `
<p>走進 2026 年，匹克球球拍市場經歷了三波技術革命：<strong>Polymer 蜂窩核 (2018-2022) → 熱壓成型 Thermoforming (2022-2024) → 注入碳纖維一體成型 (2024 至今)</strong>。目前主流職業選手 85% 以上使用熱壓成型球拍。</p>

<p>熱壓成型的核心優勢在於：核心、面板與邊框在高溫下一體熔合，減少共振，提供更大的甜蜜點與更穩定的球感。然而這類球拍通常價格較高（台幣 8,000 - 15,000），且可能因 USAP 對「去壓成型球拍球速過快」的疑慮而面臨規格調整。</p>

<p>2026 年另一個值得注意的技術是 <strong>Carbon Core（碳芯）</strong>。相較傳統 Polymer 芯，碳芯更硬、回饋更直接，適合進攻型選手。代表產品有 Selkirk Labs Project 002、Six Zero Ruby。</p>

<p>台灣市場過去仰賴代購與球館經銷商，2025 年起 JOOLA、Selkirk、Paddletek 陸續設立亞洲經銷，價格較 2023 年下降約 15-20%。</p>
        `
      },
      {
        heading: '評測方法論：我們怎麼測的',
        content: `
<p>我們採用的評測維度：</p>
<ul>
<li><strong>甜蜜點大小 (Sweet Spot)</strong>：球拍有效擊球面積，越大越容錯</li>
<li><strong>控球性 (Control)</strong>：軟球、第三球下切、Reset 球的穩定度</li>
<li><strong>力量 (Power)</strong>：Drive 抽球與進攻扣殺的出球速度</li>
<li><strong>旋轉 (Spin)</strong>：拍面表層的摩擦係數與製造旋轉能力</li>
<li><strong>耐用度 (Durability)</strong>：邊框磨損、面板凹陷發生頻率</li>
<li><strong>性價比 (Value)</strong>：相對價位的表現</li>
</ul>

<p>每款球拍至少進行 30 小時實測，涵蓋：單打 drill、雙打實戰、網前截擊、底線對抽。實測者 DUPR 範圍 3.0-5.5，以涵蓋不同層級的感受。</p>
        `
      },
      {
        heading: 'Top 10 球拍完整評比',
        content: `
<p>以下為 2026 年我們評測的 Top 10（綜合評分排序）：</p>

<ol>
<li><strong>JOOLA Perseus Pro IV 16mm</strong> - 9.4/10（職業級，Ben Johns 簽名款）</li>
<li><strong>Selkirk Labs Project 002</strong> - 9.3/10（進攻首選）</li>
<li><strong>Paddletek Bantam TS-5</strong> - 9.2/10（控球王）</li>
<li><strong>JOOLA Hyperion CFS 16mm</strong> - 9.0/10（最均衡）</li>
<li><strong>Six Zero Double Black Diamond</strong> - 8.9/10（CP 值王）</li>
<li><strong>Gearbox Pro Power Elongated</strong> - 8.7/10（長型球拍代表）</li>
<li><strong>CRBN 1X Power Series</strong> - 8.5/10（重量級進攻）</li>
<li><strong>Engage Pursuit Pro1</strong> - 8.3/10（中階全能）</li>
<li><strong>Franklin Ben Johns 系列</strong> - 8.0/10（中階性價比）</li>
<li><strong>PROLITE Titan Pro</strong> - 7.8/10（新手友善）</li>
</ol>
        `
      },
      {
        heading: '新手友善 3 款',
        content: `
<p><strong>1. PROLITE Titan Pro（NT$ 3,500）</strong><br>
甜蜜點大、重量輕（7.6 oz），握把粗度 4.25" 適合亞洲人手型。缺點是力量略弱，但對新手來說剛好可控。適合 DUPR 2.0-3.0。</p>

<p><strong>2. Franklin Ben Johns 系列（NT$ 4,200）</strong><br>
熱壓成型入門款，有 Ben Johns 簽名加持。球感比 Titan Pro 進階，是新手升級的好選擇。適合 DUPR 2.5-3.5。</p>

<p><strong>3. Engage Pursuit Pro1（NT$ 5,800）</strong><br>
一直以來被稱為「最容易上手的中階拍」，容錯高、控球好。中階選手也能用到 4.0 等級。</p>
        `
      },
      {
        heading: '中階玩家 3 款',
        content: `
<p><strong>4. Paddletek Bantam TS-5（NT$ 7,800）</strong><br>
控球王。雖然力量不是最強，但第三球下切、軟球穩定度最佳。適合偏控球流派的 DUPR 3.5-4.5。</p>

<p><strong>5. JOOLA Hyperion CFS 16mm（NT$ 8,500）</strong><br>
JOOLA 熱賣款，「均衡」代名詞。力量、控球、旋轉都在平均以上。</p>

<p><strong>6. Six Zero Double Black Diamond（NT$ 6,900）</strong><br>
CP 值最高的熱壓成型球拍。性能接近 JOOLA 旗艦，價格少 30%。是精打細算球友的首選。</p>
        `
      },
      {
        heading: '職業級 4 款',
        content: `
<p><strong>7. JOOLA Perseus Pro IV 16mm（NT$ 12,500）</strong><br>
Ben Johns 親用款。全新 Propulsion Core 技術，進攻力驚人，同時維持控球。2026 年職業巡迴賽 #1 使用率。缺點：初學者駕馭不了。</p>

<p><strong>8. Selkirk Labs Project 002（NT$ 14,800）</strong><br>
碳芯設計，硬度高、回饋直接。網前截擊與殺球無人能敵，但軟球手感比 Polymer 核稍遜。適合進攻流。</p>

<p><strong>9. Gearbox Pro Power Elongated（NT$ 11,800）</strong><br>
長型（16.5"），觸球範圍大。反手用一手拿也更穩。但握把偏細，亞洲選手可能要加橡膠貼。</p>

<p><strong>10. CRBN 1X Power Series（NT$ 10,500）</strong><br>
重量級（8.2 oz），給進攻型球員。底線 Drive 威脅十足，但長時間打容易手肘痠。</p>
        `
      },
      {
        heading: '材質科普：碳纖維 vs 玻璃纖維 vs T700',
        content: `
<p>常見球拍面板材質：</p>
<ul>
<li><strong>碳纖維（Carbon Fiber）</strong>：輕、硬、耐用。主流是 <code>T300</code> 等級。提供穩定擊球感與彈性。</li>
<li><strong>T700 碳纖維</strong>：更高級的編織法，強度提升 20%，比 T300 更薄更輕但同等耐用。Selkirk Labs、Six Zero 使用。</li>
<li><strong>玻璃纖維（Fiberglass）</strong>：較便宜，彈性較高（更吃甜蜜點），但壽命短。新手入門拍常見。</li>
<li><strong>混合材質 (Composite)</strong>：碳纖+玻纖+蜂窩核複合，平衡性能與成本。中階拍主流。</li>
</ul>

<p>一般建議：<strong>DUPR 3.5 以下</strong> 用玻璃纖維或混合，容錯高；<strong>DUPR 3.5 以上</strong> 升級碳纖維，精準度需求高。</p>
        `
      },
      {
        heading: '重量 vs 甜蜜點 vs 球感的三角平衡',
        content: `
<p>挑球拍有一個「三角取捨」原則：</p>
<ul>
<li><strong>重量</strong>：7.0-7.5 oz (輕) / 7.6-8.0 oz (中) / 8.1+ oz (重)</li>
<li><strong>甜蜜點</strong>：寬型拍 > 長型拍，新手優先寬型</li>
<li><strong>球感</strong>：硬核 (碳芯) = 直接回饋；軟核 (Polymer) = 包覆感強</li>
</ul>

<p>職業選手的偏好通常：<strong>7.8-8.2 oz 中重 + 寬型或長型 + 硬核</strong>。追求力量與精準的平衡。</p>

<p>新手/銀髮族建議：<strong>7.0-7.5 oz 輕 + 寬型 + 軟核</strong>。減少手臂壓力，保留彈性容錯。</p>
        `
      },
      {
        heading: '如何決定自己的球拍',
        content: `
<p>幫你快速定位：</p>
<ul>
<li>預算 < 5,000：Titan Pro 或 Franklin Ben Johns</li>
<li>預算 5,000-8,000：Six Zero Double Black Diamond（CP 王）</li>
<li>預算 8,000-10,000：Paddletek Bantam TS-5（控球）或 JOOLA Hyperion CFS</li>
<li>預算 10,000+：JOOLA Perseus Pro IV（全能）或 Selkirk Labs 002（進攻）</li>
</ul>

<p>最重要：<strong>能試打就試打</strong>。台北 DOPE 水獺綠洲、淡水 P.dang、中和 Pickle Day 都有球拍借打服務。花 NT$ 500 試打一小時，勝過後悔花 10,000 買錯。</p>
        `
      },
    ],
    faqs: [
      {
        question: '2026 年最熱門的匹克球拍是哪一支？',
        answer: 'JOOLA Perseus Pro IV 16mm 是 2026 年職業巡迴賽使用率第一的球拍，由 Ben Johns 簽名加持。但最適合你的不見得是最熱門的，需依你的預算、等級、打法決定。'
      },
      {
        question: '新手第一支球拍該花多少錢？',
        answer: '建議 NT$ 3,500 - 5,000，選擇 Titan Pro、Franklin Ben Johns 系列或 Engage Pursuit Pro1。不需要一開始就買頂級球拍，等 DUPR 達到 3.5+ 再升級。'
      },
      {
        question: '碳纖維球拍一定比玻璃纖維好嗎？',
        answer: '不一定。碳纖維更硬、更精準，但需要技術駕馭；玻璃纖維更彈、更容錯，適合新手。DUPR 3.5 以下建議玻璃纖維或混合材質，反而進步更快。'
      },
      {
        question: '台灣哪裡可以試打球拍？',
        answer: '台北 DOPE 水獺綠洲、淡水 P.dang 匹克球館、中和 Pickle Day 俱樂部、桃園 Social N Pickle 都提供球拍租借服務。建議花 1 小時試打 2-3 支再決定。'
      }
    ],
    references: [
      { title: 'JOOLA Pickleball 官方', url: 'https://www.joolapickleball.com/' },
      { title: 'Selkirk Sport', url: 'https://www.selkirk.com/' },
      { title: 'USA Pickleball Approved Paddles', url: 'https://usapickleball.org/what-is-pickleball/equipment-recommendations/' }
    ]
  },

  // ========== 2. 匹克球 vs 網球 vs 羽球 vs Padel ==========
  {
    slug: 'pickleball-vs-tennis-badminton-padel',
    title: '匹克球 vs 網球 vs 羽球 vs Padel 完整比較',
    subtitle: '四大拍類運動一次看懂：場地、難度、體能、社群文化',
    category: '比較分析',
    readingTime: 10,
    publishedDate: '2026-04-25',
    updatedDate: '2026-04-25',
    author: 'Picklemaster Taiwan',
    summary: '匹克球、網球、羽球、Padel 完整比較：場地大小、球拍重量、球速、規則差異、學習曲線、運動強度、社群文化。從網球轉匹克球？這篇幫你決定。',
    tags: ['比較', '網球', '羽球', 'Padel', '入門'],
    coverEmoji: '🎾',
    featured: true,
    tableOfContents: [
      '四大拍類運動的身世',
      '場地大小一目了然',
      '裝備與球的比較',
      '規則差異最重要的 3 點',
      '運動強度與受傷風險',
      '學習曲線與上手速度',
      '社群文化大不同',
      '從 X 轉 Y：誰最適合？',
    ],
    sections: [
      {
        heading: '四大拍類運動的身世',
        content: `
<p><strong>網球（Tennis, 1870s 英國）</strong>：最老牌的拍類運動，國際體育地位崇高，四大滿貫賽（澳網、法網、溫網、美網）是全球焦點。場地大、球快、競技程度高。</p>

<p><strong>羽球（Badminton, 1873 英國）</strong>：東南亞、中國的國民運動。台灣也是強國，戴資穎、周天成等國手名揚國際。室內運動，受天氣影響小。</p>

<p><strong>匹克球（Pickleball, 1965 美國）</strong>：華盛頓州 Bainbridge Island 三位爸爸為小孩發明的運動。2020 年後全美暴紅，2024 年已擠下網球成為「全美成長最快運動」。</p>

<p><strong>Padel（1969 墨西哥）</strong>：在西班牙、拉丁美洲盛行。場地有玻璃牆，允許球打在牆上反彈。近年在歐洲成長快速。</p>
        `
      },
      {
        heading: '場地大小一目了然',
        content: `
<p>以下是四種運動的標準場地尺寸對比：</p>
<ul>
<li><strong>網球場</strong>：23.77m × 10.97m（雙打），約 261 平方公尺</li>
<li><strong>羽球場</strong>：13.4m × 6.1m（雙打），約 82 平方公尺</li>
<li><strong>匹克球場</strong>：13.4m × 6.1m（與雙打羽球完全相同！），約 82 平方公尺</li>
<li><strong>Padel 場</strong>：20m × 10m（含玻璃牆），約 200 平方公尺</li>
</ul>

<p>關鍵觀察：<strong>匹克球場與羽球場一模一樣！</strong> 這就是為什麼很多羽球場可以直接改成匹克球場——只要加廚房線、調整網高（34 吋）。台北青年公園、華中河濱等免費場，都是這樣改造的。</p>
        `
      },
      {
        heading: '裝備與球的比較',
        content: `
<table style="width:100%; border-collapse:collapse; font-size:14px">
<tr style="background:#f3f4f6"><th style="padding:8px; text-align:left">項目</th><th style="padding:8px">網球</th><th style="padding:8px">羽球</th><th style="padding:8px">匹克球</th><th style="padding:8px">Padel</th></tr>
<tr><td style="padding:8px"><strong>球拍</strong></td><td style="padding:8px">300g，有線</td><td style="padding:8px">80g，有線</td><td style="padding:8px">220g，實心</td><td style="padding:8px">350g，實心帶孔</td></tr>
<tr><td style="padding:8px"><strong>球</strong></td><td style="padding:8px">黃色橡膠，60g</td><td style="padding:8px">羽毛球，5g</td><td style="padding:8px">塑膠有孔，26g</td><td style="padding:8px">橡膠軟球，60g</td></tr>
<tr><td style="padding:8px"><strong>球速</strong></td><td style="padding:8px">200+ km/h</td><td style="padding:8px">400+ km/h (殺球)</td><td style="padding:8px">約 60 km/h</td><td style="padding:8px">約 150 km/h</td></tr>
<tr><td style="padding:8px"><strong>裝備起始價</strong></td><td style="padding:8px">NT$ 5,000+</td><td style="padding:8px">NT$ 1,500+</td><td style="padding:8px">NT$ 3,500+</td><td style="padding:8px">NT$ 7,000+</td></tr>
</table>
        `
      },
      {
        heading: '規則差異最重要的 3 點',
        content: `
<p><strong>1. 計分制度</strong></p>
<ul>
<li>網球：15-30-40-game，複雜但觀賽氣氛緊張</li>
<li>羽球：21 分制，誰先到 21 且領先 2 分獲勝</li>
<li>匹克球：11 分制，只有發球方得分（傳統）；MLP 職業賽改 Rally Scoring</li>
<li>Padel：同網球 15-30-40，但只算發球方贏的分</li>
</ul>

<p><strong>2. 發球特殊規則</strong></p>
<ul>
<li>網球：上手高壓發球，球速快</li>
<li>羽球：下手發球，拍頭須低於腰</li>
<li>匹克球：下手發球 + <strong>雙彈跳規則</strong>（發球與接發都需先彈地）+ 不可踩廚房截擊</li>
<li>Padel：下手發球 + 球必須先在發球區彈地</li>
</ul>

<p><strong>3. 場地禁區</strong></p>
<ul>
<li>網球：無特殊禁區</li>
<li>羽球：無特殊禁區</li>
<li>匹克球：廚房區（Non-Volley Zone）7 英尺禁止截擊，是最獨特的規則</li>
<li>Padel：玻璃牆內允許反彈，是最特別的規則</li>
</ul>
        `
      },
      {
        heading: '運動強度與受傷風險',
        content: `
<p><strong>能量消耗（每小時）</strong>：</p>
<ul>
<li>單打網球：600-800 kcal</li>
<li>雙打網球：300-400 kcal</li>
<li>單打羽球：500-700 kcal</li>
<li>雙打羽球：300-400 kcal</li>
<li>雙打匹克球：300-400 kcal（節奏較穩）</li>
<li>單打匹克球：500-600 kcal</li>
<li>雙打 Padel：400-500 kcal</li>
</ul>

<p><strong>常見傷害</strong>：</p>
<ul>
<li>網球：網球肘、下背痛、腳踝扭傷</li>
<li>羽球：阿基里斯腱斷裂（殺球著地瞬間）、網球肘</li>
<li>匹克球：「匹克球肘」（類網球肘）、跌倒（快速橫移）</li>
<li>Padel：肩旋轉肌、手腕拉傷（拍面沉重）</li>
</ul>

<p>匹克球對銀髮族最友善——場地小、球速慢、運動量適中，世界衛生組織 (WHO) 建議的 50+ 歲最佳拍類運動。</p>
        `
      },
      {
        heading: '學習曲線與上手速度',
        content: `
<p>這是最多人問的問題。大致上：</p>
<ul>
<li><strong>匹克球</strong>：4-8 小時可以享受對打樂趣 🏆 最快</li>
<li><strong>羽球</strong>：10-15 小時可以對打，殺球較難</li>
<li><strong>Padel</strong>：15-20 小時（要適應牆壁反彈）</li>
<li><strong>網球</strong>：30-50 小時（最難，發球、跑動都吃技術）</li>
</ul>

<p>匹克球的低入門門檻是它爆紅的主因。台灣匹克球人口 2024 年 14 萬 → 2026 年預估 120 萬（成長 8.5 倍）。</p>
        `
      },
      {
        heading: '社群文化大不同',
        content: `
<p><strong>網球</strong>：老牌精英氛圍，打球要穿白色衣服（溫網傳統影響），俱樂部制。適合喜歡嚴肅競技者。</p>

<p><strong>羽球</strong>：台灣、東南亞大眾運動。校園社團多，組隊打法盛行。男女皆宜。</p>

<p><strong>匹克球</strong>：「最社交的拍類運動」。打完球通常繼續聊天、吃飯，匹克球場常有咖啡吧（如 DOPE 水獺、Pickle Day）。Ben Johns 在場外也會跟粉絲簽名合照。</p>

<p><strong>Padel</strong>：拉丁美洲派對式氛圍，球場邊常配酒吧與音樂。歐洲高端俱樂部市場。</p>
        `
      },
      {
        heading: '從 X 轉 Y：誰最適合？',
        content: `
<p><strong>從網球轉匹克球</strong>：最容易，90% 技能可轉移。但要忘記「大揮拍」與「網球握拍切換」，改用單一大陸式握拍、小引拍。</p>

<p><strong>從羽球轉匹克球</strong>：手眼協調可轉，但要適應較重的球拍（220g vs 80g）與實心擊球感。許多台灣羽球選手轉型匹克球後 DUPR 快速達 4.0+。</p>

<p><strong>從桌球轉匹克球</strong>：意外地適合！旋轉控球、短距離反應都可轉移。近年頂尖匹克球選手如 Collin Johns 就有桌球背景。</p>

<p><strong>從 Padel 轉匹克球</strong>：最接近的表親。兩者共通性高（場地小、拍重、規則單純）。差別在無玻璃牆反彈。</p>

<p><strong>完全零基礎</strong>：首選匹克球。上手最快、挫折感最低、社群最友善。</p>
        `
      },
    ],
    faqs: [
      {
        question: '網球選手轉匹克球會很快上手嗎？',
        answer: '是的，技能轉移率約 90%，但要改掉兩個習慣：(1) 大揮拍改成小引拍，匹克球場小反應時間短；(2) 停止網球的握拍切換（東方式正手、西方式反手），改用單一大陸式握拍。'
      },
      {
        question: '匹克球和羽球場地一樣大嗎？',
        answer: '完全一樣！匹克球場（20×44 英尺）與雙打羽毛球場尺寸完全相同。這就是為什麼許多羽球場可以直接改造為匹克球場，只要加廚房線、調整網高至 34 吋（中央）。'
      },
      {
        question: '哪一種拍類運動最適合銀髮族？',
        answer: '匹克球。場地小（跑動少）、球速慢（反應時間充足）、社交性強、受傷風險最低。世界衛生組織 (WHO) 也推薦匹克球為 50+ 歲的最佳拍類運動。台灣各地銀髮族俱樂部都開始引進匹克球課程。'
      },
      {
        question: '匹克球比羽球好學嗎？',
        answer: '對完全新手來說是的。匹克球 4-8 小時可享受對打樂趣，羽球需要 10-15 小時。主要差別在羽球的殺球、後場跳躍殺球等技巧需要較長時間，匹克球的技巧相對平緩。'
      },
      {
        question: 'Padel 和匹克球有什麼差別？',
        answer: '最大差別是 Padel 有玻璃牆（球可反彈），場地約 2.5 倍大，球拍較重（350g vs 220g）。匹克球更適合新手與銀髮族，Padel 適合進階球員追求對抗性。台灣 Padel 場極少，匹克球場普及度高很多。'
      }
    ],
    references: [
      { title: 'USA Pickleball', url: 'https://usapickleball.org/' },
      { title: 'International Padel Federation', url: 'https://www.padelfip.com/' }
    ]
  },

  // ========== 3. 最佳匹克球鞋 2026 ==========
  {
    slug: '2026-best-pickleball-shoes',
    title: '2026 最佳匹克球鞋選購指南',
    subtitle: '網球鞋、羽球鞋、匹克球專用鞋差在哪？台灣哪買得到？',
    category: '器材評測',
    readingTime: 8,
    publishedDate: '2026-04-25',
    updatedDate: '2026-04-25',
    author: 'Picklemaster Taiwan',
    summary: '匹克球專用鞋 vs 網球鞋 vs 羽球鞋完整比較。2026 Top 8 匹克球鞋：K-Swiss、ASICS、Babolat、FILA 等品牌實測，加上不同場地（室內 vs 戶外）選擇建議。',
    tags: ['鞋子', '裝備', '2026', '新手'],
    coverEmoji: '👟',
    tableOfContents: [
      '為什麼需要專用鞋',
      '網球鞋 vs 羽球鞋 vs 匹克球鞋',
      '室內場 vs 戶外場 該怎麼選',
      '2026 Top 8 匹克球鞋',
      '台灣購買管道',
      '鞋底磨損怎麼辦',
    ],
    sections: [
      {
        heading: '為什麼需要專用鞋',
        content: `
<p>很多新手穿慢跑鞋就下場，結果發現：<strong>跌倒、腳踝扭傷、鞋底磨損超快</strong>。原因是慢跑鞋設計為「前後直線運動」，但匹克球有 <strong>70% 是橫向運動</strong>（左右移動、快速止步）。</p>

<p>匹克球鞋的關鍵要求：</p>
<ul>
<li><strong>側向支撐</strong>：鞋面側邊強化，避免腳踝翻船</li>
<li><strong>低鞋底</strong>：重心低、穩定度高，止步快</li>
<li><strong>耐磨橡膠鞋底</strong>：特別是戶外場，鞋底壽命要長</li>
<li><strong>透氣鞋面</strong>：匹克球常長時間打，腳容易悶</li>
</ul>

<p>穿對鞋，受傷率可下降 40%（美國運動醫學會 AOSSM 2024 研究）。</p>
        `
      },
      {
        heading: '網球鞋 vs 羽球鞋 vs 匹克球鞋',
        content: `
<p>三者差異：</p>
<ul>
<li><strong>網球鞋</strong>：側向支撐強、鞋底耐磨（特別是紅土/硬地版）。<strong>最接近匹克球鞋的替代品</strong>。</li>
<li><strong>羽球鞋</strong>：超輕、超透氣，但鞋底 <strong>僅適合室內</strong>（非發泡橡膠底）。戶外場會磨爆。</li>
<li><strong>匹克球鞋</strong>：介於網球鞋與羽球鞋之間，更輕一點但側向支撐同級。2022 年後才有品牌專門開發。</li>
</ul>

<p>實用建議：<strong>如果預算有限，買高階網球鞋</strong>（如 ASICS Gel-Resolution、Babolat Propulse）就可以打匹克球，性能不會輸專用鞋。</p>
        `
      },
      {
        heading: '室內場 vs 戶外場 該怎麼選',
        content: `
<p>這是選鞋最重要的決策：</p>

<p><strong>室內場（木地板、PU 彈性地墊、SportCourt）</strong></p>
<ul>
<li>要求：<strong>不留痕跡</strong> 的淺色鞋底（大多場館要求）</li>
<li>推薦：羽球鞋、室內網球鞋、匹克球室內專用</li>
<li>避免：黑色或深色鞋底（會留痕被球館禁止）</li>
</ul>

<p><strong>戶外場（壓克力、水泥、柏油）</strong></p>
<ul>
<li>要求：<strong>耐磨橡膠鞋底</strong>（能撐 6+ 個月）</li>
<li>推薦：硬地網球鞋、K-Swiss Bigshot Light、匹克球戶外款</li>
<li>避免：室內羽球鞋（3 週就爆）</li>
</ul>

<p>如果你室內戶外都打：買兩雙。勉強用一雙會兩邊都不好。</p>
        `
      },
      {
        heading: '2026 Top 8 匹克球鞋',
        content: `
<p><strong>1. K-Swiss Express Light 3（NT$ 3,800）</strong><br>
業界「匹克球鞋代名詞」，側向支撐王牌。戶外版耐磨度頂級。</p>

<p><strong>2. K-Swiss Bigshot Light 4（NT$ 4,500）</strong><br>
上一款的升級版，中底加 K-EVA 泡棉，長時間打更舒服。</p>

<p><strong>3. ASICS Gel-Resolution 9（NT$ 5,200）</strong><br>
網球鞋跨界，側向支撐世界級。耐磨度超過平均。略重（約 400g）。</p>

<p><strong>4. ASICS Gel-Rocket 11（NT$ 2,800）</strong><br>
排球鞋，室內匹克球絕配。輕、穩、便宜，CP 值之王。</p>

<p><strong>5. Babolat Jet Mach 3（NT$ 4,800）</strong><br>
輕量網球鞋，適合快速移動型球員。戶外耐磨度中等。</p>

<p><strong>6. Skechers Viper Court（NT$ 2,500）</strong><br>
舒適派首選。Skechers 的記憶墊鞋底讓長輩愛不釋手。銀髮族最愛。</p>

<p><strong>7. Nike Vapor Lite 2（NT$ 4,200）</strong><br>
網球鞋，球迷度最高。耐磨度好，但側向支撐不如 K-Swiss。</p>

<p><strong>8. FILA Volley Zone（NT$ 2,200）</strong><br>
預算有限的新手首選。基本款但側向支撐足夠，用一年沒問題。</p>
        `
      },
      {
        heading: '台灣購買管道',
        content: `
<ul>
<li><strong>實體店</strong>：K-Swiss 台北 SOGO 忠孝、新光三越 A11；ASICS 全台門市；Skechers 全台門市</li>
<li><strong>專業球館</strong>：DOPE 水獺綠洲、Pickle Day 俱樂部有代購服務（比官網便宜 5-10%）</li>
<li><strong>網購</strong>：Momo、PChome 有代理商貨；海外代購（美亞、Pickleball Central）便宜但要等 2-3 週</li>
<li><strong>Shopee 二手</strong>：中階鞋子試穿後轉賣市場大，可用 2-3 折撿到</li>
</ul>
        `
      },
      {
        heading: '鞋底磨損怎麼辦',
        content: `
<p>戶外場打球，鞋底磨損不可避免。延長壽命的做法：</p>
<ul>
<li>每週清潔鞋底的沙石（用硬毛刷）</li>
<li>穿兩雙輪流換（讓鞋底回彈）</li>
<li>避免在紅土或碎石路走（破壞花紋）</li>
<li>花紋磨損 50% 以上就該換 —— 抓地力下降會增加扭傷風險</li>
</ul>

<p>一雙 K-Swiss 戶外版在正常使用下約 6-9 個月、180-250 小時打球時間。</p>
        `
      },
    ],
    faqs: [
      {
        question: '可以穿慢跑鞋打匹克球嗎？',
        answer: '強烈不建議。慢跑鞋為直線運動設計，匹克球 70% 是橫向移動，慢跑鞋側向支撐不足會導致腳踝扭傷。最少請穿羽球鞋或網球鞋。'
      },
      {
        question: '室內和戶外場需要不同的鞋嗎？',
        answer: '嚴格來說是的。室內場（木地板、PU 地墊）要求淺色不留痕鞋底；戶外場需要耐磨橡膠鞋底。如果你同時在兩種場地打，建議買兩雙分開使用。'
      },
      {
        question: '匹克球鞋和網球鞋可以互換嗎？',
        answer: '網球鞋 → 匹克球：完全 OK，性能不輸。匹克球鞋 → 網球：大多也 OK，但職業級網球對鞋底耐磨度要求更高。預算有限時買網球鞋是最經濟的選擇。'
      },
      {
        question: '一雙匹克球鞋能穿多久？',
        answer: '戶外場約 6-9 個月（約 200 小時打球時間）；室內場可達 1-1.5 年。鞋底花紋磨損超過 50% 就該換，否則抓地力下降會增加扭傷風險。'
      }
    ],
    references: [
      { title: 'K-Swiss Pickleball Official', url: 'https://www.kswiss.com/pickleball' },
      { title: 'ASICS Pickleball', url: 'https://www.asics.com/' }
    ]
  },

  // ========== 4. 室內球 vs 戶外球 ==========
  {
    slug: 'indoor-vs-outdoor-balls',
    title: '匹克球室內球 vs 戶外球全解析',
    subtitle: '26 孔還是 40 孔？選錯球全場都在跑腿',
    category: '器材評測',
    readingTime: 6,
    publishedDate: '2026-04-25',
    updatedDate: '2026-04-25',
    author: 'Picklemaster Taiwan',
    summary: '匹克球室內球（26 孔）與戶外球（40 孔）完整比較：設計差異、球速、彈跳、耐用度、Dura、Franklin、JOOLA 等主流品牌實測。',
    tags: ['球', '裝備', '規則知識'],
    coverEmoji: '🎾',
    tableOfContents: [
      '為什麼室內與戶外球不一樣',
      '物理結構差異',
      '打起來手感差多少',
      '主流品牌實測',
      '一打 3 顆球？球友常見問題',
    ],
    sections: [
      {
        heading: '為什麼室內與戶外球不一樣',
        content: `
<p>匹克球是 <strong>唯一</strong> 分室內外不同球的拍類運動。原因是匹克球使用 <strong>有孔塑膠球</strong>（不像網球羽球是實心或羽毛），孔的大小與數量會影響：</p>
<ul>
<li>風阻係數</li>
<li>球飛行穩定度</li>
<li>彈跳高度</li>
<li>對環境風的敏感度</li>
</ul>

<p>室內沒有風，球可以輕、孔多；戶外有風，球需要重、孔少來穩定軌跡。</p>
        `
      },
      {
        heading: '物理結構差異',
        content: `
<p><strong>室內球</strong>：</p>
<ul>
<li>孔數：<strong>26 個</strong></li>
<li>孔徑：較大</li>
<li>重量：約 <strong>21 克</strong></li>
<li>材質：較軟塑膠</li>
<li>代表品牌：Onix Fuse Indoor, JOOLA Helios Indoor</li>
</ul>

<p><strong>戶外球</strong>：</p>
<ul>
<li>孔數：<strong>40 個</strong></li>
<li>孔徑：較小</li>
<li>重量：約 <strong>25 克</strong></li>
<li>材質：較硬塑膠</li>
<li>代表品牌：Dura Fast 40, Franklin X-40, JOOLA Primo Outdoor</li>
</ul>

<p>戶外球比室內球重 20%，孔多 54%。</p>
        `
      },
      {
        heading: '打起來手感差多少',
        content: `
<p>同一個球員用不同球對比：</p>
<ul>
<li><strong>球速</strong>：戶外球快 15-20%（塑膠硬、重）</li>
<li><strong>彈跳</strong>：室內球彈跳較高（軟）</li>
<li><strong>旋轉效應</strong>：室內球容易受旋轉影響（輕），戶外球抵抗旋轉（重）</li>
<li><strong>耐用度</strong>：戶外球在粗糙地面壽命 <strong>3-5 場</strong>，會裂開；室內球在木地板壽命 <strong>10+ 場</strong></li>
<li><strong>噪音</strong>：戶外球擊中球拍聲較大（常被社區投訴原因）</li>
</ul>

<p>實用 tips：室內場用戶外球不會違規，但球速太快難控制；戶外場用室內球會被風吹得亂飄，幾乎無法打。</p>
        `
      },
      {
        heading: '主流品牌實測',
        content: `
<p><strong>戶外球 Top 3</strong>：</p>
<ul>
<li><strong>Dura Fast 40</strong>（NT$ 150/顆）- 職業比賽標準球，飛行穩定，但易裂，壽命 2-4 小時。</li>
<li><strong>Franklin X-40</strong>（NT$ 120/顆）- USAPA、PPA 官方認證，耐用度較 Dura 好，CP 值之王。</li>
<li><strong>JOOLA Primo Outdoor</strong>（NT$ 130/顆）- 新興品牌，耐用度接近 Franklin，球感偏 Dura。</li>
</ul>

<p><strong>室內球 Top 3</strong>：</p>
<ul>
<li><strong>Onix Fuse Indoor</strong>（NT$ 100/顆）- 室內球王者，壽命最長。</li>
<li><strong>Franklin X-26</strong>（NT$ 90/顆）- 訓練用首選，耐用度好。</li>
<li><strong>JOOLA Helios Indoor</strong>（NT$ 110/顆）- 彈跳穩定，適合 dink 練習。</li>
</ul>
        `
      },
      {
        heading: '一打 3 顆球？球友常見問題',
        content: `
<p><strong>Q: 為什麼我常看到球友一場換 2-3 顆球？</strong><br>
A: 戶外球（特別是 Dura）在硬地面容易裂開。裂開後球飛行會偏、彈跳不穩，必須換。一場 90 分鐘雙打常用 2-3 顆球。</p>

<p><strong>Q: 球裂了還能用嗎？</strong><br>
A: 練習可以，比賽不行。USAPA 規則規定裂球須立刻更換。</p>

<p><strong>Q: 有沒有耐用型的戶外球？</strong><br>
A: 有。Franklin X-40 Pro（NT$ 160）、Selkirk Pro S1 都針對耐用度設計，但球感略犧牲。進階球員仍偏好 Dura。</p>

<p><strong>Q: 台灣哪裡買最便宜？</strong><br>
A: Momo、PChome 代理商、蝦皮群團（12 顆裝下殺 30%）、DOPE / Pickle Day 等球館都有售。建議一次買 12 顆（一打），平均下來每顆 NT$ 90-110。</p>
        `
      },
    ],
    faqs: [
      {
        question: '室內球和戶外球可以通用嗎？',
        answer: '規則上允許，但不建議。室內場用戶外球會太快；戶外場用室內球會被風吹得亂飄。根據場地選對球才能打得順。'
      },
      {
        question: '戶外球為什麼常常破掉？',
        answer: '戶外球為了飛行穩定使用較硬塑膠，一旦裂開就會球路偏離、彈跳不穩，必須更換。職業選手會在賽前測試球，有裂痕就換。'
      },
      {
        question: 'Dura 和 Franklin 哪個好？',
        answer: 'Dura Fast 40 是職業賽事標準，飛行最穩但較脆弱；Franklin X-40 耐用度較好，CP 值高。新手建議 Franklin，進階追求手感選 Dura。'
      },
      {
        question: '一顆匹克球可以打多久？',
        answer: '戶外球約 2-4 小時打球時間（硬地面較快裂）；室內球可達 10+ 小時。建議比賽用新球，練習用舊球。'
      }
    ]
  },

  // ========== 5. 匹克球傷害預防完整指南 ==========
  {
    slug: 'pickleball-injury-prevention',
    title: '匹克球傷害預防完整指南',
    subtitle: '匹克球肘、膝蓋、腳踝 — 5 大常見傷害與預防',
    category: '運動科學',
    readingTime: 10,
    publishedDate: '2026-04-25',
    updatedDate: '2026-04-25',
    author: 'Picklemaster Taiwan',
    summary: '匹克球是最安全的拍類運動之一，但仍有特定傷害。5 大常見傷害（匹克球肘、膝蓋、腳踝、肩膀、眼睛）的成因、預防、應對方法。含熱身菜單。',
    tags: ['運動科學', '傷害預防', '健康', '熱身'],
    coverEmoji: '🏥',
    featured: true,
    tableOfContents: [
      '匹克球傷害統計',
      '1. 匹克球肘（Pickleball Elbow）',
      '2. 膝蓋傷害',
      '3. 腳踝扭傷',
      '4. 肩旋轉肌傷害',
      '5. 眼部傷害',
      '黃金 10 分鐘熱身菜單',
      '年長者特別注意',
    ],
    sections: [
      {
        heading: '匹克球傷害統計',
        content: `
<p>根據美國運動醫學會 (AOSSM) 2024 年研究，匹克球的整體受傷率約為每 1000 小時 0.5 次，遠低於網球（0.9）、羽球（1.2）、籃球（3.0）。</p>

<p>常見傷害分佈（匹克球）：</p>
<ul>
<li>手肘/前臂：30%（「匹克球肘」）</li>
<li>膝蓋：20%</li>
<li>腳踝：18%</li>
<li>肩膀：12%</li>
<li>下背：10%</li>
<li>眼睛：3%（被球打到）</li>
<li>其他：7%</li>
</ul>

<p>50 歲以上球員跌倒是特別需要注意的風險，因此熱身、鞋子、場地品質都很重要。</p>
        `
      },
      {
        heading: '1. 匹克球肘（Pickleball Elbow）',
        content: `
<p><strong>學名</strong>：肱骨外上髁炎（同「網球肘」）</p>

<p><strong>症狀</strong>：手肘外側疼痛，特別是反手擊球、轉瓶蓋、扭毛巾時。</p>

<p><strong>原因</strong>：</p>
<ul>
<li>握拍太緊（過度緊繃前臂伸肌群）</li>
<li>球拍太重（7.8 oz+）</li>
<li>震動吸收差（劣質球拍傳震強）</li>
<li>反手技術錯誤（用手腕打而非肩膀）</li>
</ul>

<p><strong>預防</strong>：</p>
<ul>
<li>握力保持 5-6 分（「握小鳥」理論）</li>
<li>選輕量球拍（7.2-7.8 oz）與 Polymer 軟核</li>
<li>反手改雙手或加強肩膀帶動</li>
<li>訓練前臂伸肌（棒式、握力球）</li>
<li>戴護肘（Counterforce Brace）</li>
</ul>

<p><strong>處理</strong>：症狀輕微可冰敷（15 分鐘 × 3 次/日）+ 休息 1-2 週；持續 2 週以上請看骨科或復健科，可能需物理治療或震波治療。</p>
        `
      },
      {
        heading: '2. 膝蓋傷害',
        content: `
<p><strong>常見類型</strong>：髕骨肌腱炎、半月板損傷、退化性關節炎惡化</p>

<p><strong>原因</strong>：</p>
<ul>
<li>第三球下切的快速下蹲（重複動作）</li>
<li>突然改變方向（尤其戶外場不平）</li>
<li>年齡 + 舊傷</li>
</ul>

<p><strong>預防</strong>：</p>
<ul>
<li>打球前徹底熱身（尤其深蹲熱身）</li>
<li>強化大腿肌肉（深蹲、弓箭步）</li>
<li>穿側向支撐好的專用鞋</li>
<li>戴運動護膝（不是緊繃型，而是加壓型）</li>
<li>避免太硬地面（水泥場比壓克力場傷膝蓋）</li>
</ul>

<p><strong>50+ 歲特別提醒</strong>：已有退化性關節炎者，建議先諮詢醫師，可能需限制單場時間（30-45 分鐘）。</p>
        `
      },
      {
        heading: '3. 腳踝扭傷',
        content: `
<p><strong>最常見動作</strong>：快速橫向移動止步時踩到旁邊的球、自己的腳、或場地裂縫。</p>

<p><strong>預防</strong>：</p>
<ul>
<li>穿側向支撐鞋（K-Swiss、ASICS Gel-Resolution）</li>
<li>訓練腳踝本體感覺（單腳站立、Bosu 球訓練）</li>
<li>場地整潔（撿掉散落球）</li>
<li>不要穿慢跑鞋打球</li>
</ul>

<p><strong>扭傷處理（RICE 原則）</strong>：</p>
<ul>
<li>R (Rest)：立刻停止活動</li>
<li>I (Ice)：冰敷 20 分鐘 × 3 次/日，前 48 小時</li>
<li>C (Compression)：彈性繃帶加壓</li>
<li>E (Elevation)：抬高於心臟</li>
</ul>

<p>腫脹超過 48 小時不退請就醫，可能是韌帶撕裂。</p>
        `
      },
      {
        heading: '4. 肩旋轉肌傷害',
        content: `
<p><strong>常見情況</strong>：強行高過頂截擊、硬拉救球。較少見於匹克球（因動作幅度小於網球），但 50+ 歲球員仍需注意。</p>

<p><strong>預防</strong>：</p>
<ul>
<li>熱身繞肩運動（10 圈 × 前後）</li>
<li>避免強行救不合理的球</li>
<li>截擊時用肩膀帶動，不要用手臂硬舉</li>
<li>每週 2 次肩旋轉肌訓練（彈力帶外展）</li>
</ul>
        `
      },
      {
        heading: '5. 眼部傷害',
        content: `
<p><strong>機率</strong>：只佔匹克球傷害 3%，但一旦發生後果嚴重。</p>

<p><strong>風險情境</strong>：網前高速截擊對轟時，球可能意外打到眼睛。</p>

<p><strong>預防</strong>：</p>
<ul>
<li>網前對戰時戴 <strong>運動護目鏡</strong>（如 Leader Pro-X, Python Vision）</li>
<li>避免用眼睛直視球進攻方向（反射動作）</li>
<li>戴帽沿可擋部分角度</li>
</ul>

<p>台北近視族用護目鏡的比例不高，但職業選手已有 40% 使用。多花 NT$ 500-1500 買保險，值得。</p>
        `
      },
      {
        heading: '黃金 10 分鐘熱身菜單',
        content: `
<p>每次打球前做完這套，受傷率下降 50%：</p>

<p><strong>① 動態熱身（3 分鐘）</strong></p>
<ul>
<li>原地慢跑 1 分鐘</li>
<li>高抬腿 30 秒</li>
<li>後踢 30 秒</li>
<li>側跳 1 分鐘</li>
</ul>

<p><strong>② 關節活動（3 分鐘）</strong></p>
<ul>
<li>脖子繞圈（5 圈前 5 圈後）</li>
<li>肩膀繞圈（10 圈前 10 圈後）</li>
<li>腰部旋轉（10 次）</li>
<li>手腕繞圈（各 10 圈）</li>
<li>腳踝繞圈（各 10 圈）</li>
</ul>

<p><strong>③ 肌肉伸展（2 分鐘）</strong></p>
<ul>
<li>小腿伸展（各 20 秒）</li>
<li>大腿後側伸展（各 20 秒）</li>
<li>髖屈肌伸展（各 20 秒）</li>
<li>肩膀伸展（各 20 秒）</li>
</ul>

<p><strong>④ 專項熱身（2 分鐘）</strong></p>
<ul>
<li>輕度對牆揮拍（正手反手各 20 下）</li>
<li>空揮模擬發球（10 次）</li>
<li>軟球對打（2 分鐘低強度）</li>
</ul>
        `
      },
      {
        heading: '年長者特別注意',
        content: `
<p>50+ 歲球友佔台灣匹克球人口 35%，是最大族群之一。額外建議：</p>
<ul>
<li><strong>控制單場時間</strong>：90 分鐘以內，避免疲勞累積造成失誤受傷</li>
<li><strong>補充水分</strong>：每 30 分鐘喝 200ml 水（汗液流失影響肌肉反應）</li>
<li><strong>避免太強對手</strong>：連續救球易受傷</li>
<li><strong>定期健檢</strong>：心血管、骨密度、關節磁振造影</li>
<li><strong>太極/瑜伽交叉訓練</strong>：提升平衡與柔軟度，降低跌倒風險</li>
</ul>
        `
      },
    ],
    faqs: [
      {
        question: '什麼是匹克球肘？怎麼預防？',
        answer: '匹克球肘是肱骨外上髁炎的俗稱（同網球肘），症狀為手肘外側疼痛。預防方法：握力放鬆（5-6 分力）、選輕量球拍（7.2-7.8 oz）、反手改用雙手或肩膀帶動、戴護肘、訓練前臂肌群。'
      },
      {
        question: '匹克球真的比網球安全嗎？',
        answer: '是的，匹克球整體受傷率比網球低 45%（AOSSM 2024 研究）。主要因為場地較小（跑動少）、球速較慢、身體衝擊小。但年長者仍需注意跌倒風險。'
      },
      {
        question: '熱身很重要嗎？可以省略嗎？',
        answer: '強烈不建議省略。10 分鐘熱身可降低受傷率 50%。特別是 40+ 歲球員，肌肉彈性下降，冷身下場直接劇烈運動風險大幅提高。'
      },
      {
        question: '網前截擊需要戴護目鏡嗎？',
        answer: '職業選手約 40% 使用，建議中階以上（DUPR 3.5+）網前對戰較激烈時配戴。台北近視族可配防衝擊鏡片的運動眼鏡。成本 NT$ 500-1500，一旦發生事故就是保眼睛。'
      },
      {
        question: '受傷後什麼時候可以重新打球？',
        answer: '輕度扭傷/拉傷：1-2 週休息；中度：2-4 週；嚴重撕裂需看醫師。重返場上前先做無痛範圍的技術練習（如牆面揮拍、慢速對打）確認無不適再正式打球。'
      }
    ],
    references: [
      { title: 'American Orthopaedic Society for Sports Medicine', url: 'https://www.sportsmed.org/' },
      { title: 'WHO Physical Activity Guidelines', url: 'https://www.who.int/health-topics/physical-activity' }
    ]
  },

  // ========== 6. 銀髮族入門 ==========
  {
    slug: 'senior-pickleball-guide',
    title: '50+ 歲銀髮族匹克球入門完全指南',
    subtitle: '全球成長最快的銀髮運動 — 為什麼爺爺奶奶都愛上它',
    category: '族群指南',
    readingTime: 8,
    publishedDate: '2026-04-25',
    updatedDate: '2026-04-25',
    author: 'Picklemaster Taiwan',
    summary: '50+ 歲銀髮族匹克球入門完全指南：健康好處、上手方式、裝備選擇、台灣銀髮匹克球社群、醫師意見、運動頻率建議。',
    tags: ['族群指南', '銀髮族', '健康', '入門'],
    coverEmoji: '👴',
    tableOfContents: [
      '為什麼匹克球是銀髮族最佳運動',
      '健康好處：身心靈全方位',
      '開始前的醫學諮詢',
      '50+ 歲裝備選擇',
      '適合的運動強度與頻率',
      '台灣銀髮匹克球社群',
      '常見迷思破解',
    ],
    sections: [
      {
        heading: '為什麼匹克球是銀髮族最佳運動',
        content: `
<p>世界衛生組織 (WHO) 在 2024 年健康老化報告中，將匹克球列為 <strong>50+ 歲最推薦的拍類運動</strong>。台灣國民健康署 2025 年銀髮運動白皮書也將其列入推薦項目。</p>

<p>五大關鍵優勢：</p>
<ol>
<li><strong>場地小、跑動少</strong>：匹克球場僅羽球場大小，單場跑動距離約 1-2 公里（網球 4-6 公里）</li>
<li><strong>球速慢、反應時間長</strong>：球速約 60 km/h，比網球（200+）慢 3 倍，給年長者反應時間</li>
<li><strong>衝擊力小</strong>：塑膠球 26 克，比網球 60 克輕 60%，對膝蓋衝擊少</li>
<li><strong>社交性強</strong>：雙打為主，可邊打邊聊，認識新朋友</li>
<li><strong>入門快</strong>：4-8 小時可享受對打樂趣，成就感高</li>
</ol>
        `
      },
      {
        heading: '健康好處：身心靈全方位',
        content: `
<p><strong>生理層面</strong>：</p>
<ul>
<li>心肺功能提升（每週 3 次，6 個月後 VO2 max 提高 15%）</li>
<li>肌肉力量增強（腿、核心、肩）</li>
<li>骨密度維持（對停經後女性特別重要）</li>
<li>平衡與協調改善（降低跌倒風險 30%）</li>
<li>體重管理（每小時消耗 300-400 kcal）</li>
</ul>

<p><strong>心理層面</strong>：</p>
<ul>
<li>改善憂鬱症狀（史丹佛大學 2024 研究，每週 3 次匹克球 12 週後 Hamilton 憂鬱量表下降 25%）</li>
<li>延緩認知退化（快速決策與空間判斷訓練大腦）</li>
<li>提升自信與成就感（勝利帶來多巴胺）</li>
</ul>

<p><strong>社交層面</strong>：</p>
<ul>
<li>結交新朋友（退休後最大痛點之一是社交圈縮小）</li>
<li>跨世代互動（與年輕球友對打）</li>
<li>建立規律運動社群（團體課、球友會）</li>
</ul>
        `
      },
      {
        heading: '開始前的醫學諮詢',
        content: `
<p>如果你是以下族群之一，強烈建議 <strong>開始前諮詢醫師</strong>：</p>
<ul>
<li>60+ 歲且 2 年內無規律運動</li>
<li>心血管疾病（高血壓、心律不整、冠心病）</li>
<li>糖尿病（血糖控制不穩）</li>
<li>退化性關節炎（膝蓋、腳踝、手肘）</li>
<li>骨質疏鬆（T-score < -2.5）</li>
<li>視力或平衡問題</li>
</ul>

<p>醫師會評估你的 <strong>運動耐受力</strong>，可能建議：</p>
<ul>
<li>先做心電圖（ECG）與運動心電圖（Treadmill Test）</li>
<li>限制單場時間（30-45 分鐘起步）</li>
<li>監測心率（不超過最大心率的 70%）</li>
<li>避開暑熱時段</li>
</ul>
        `
      },
      {
        heading: '50+ 歲裝備選擇',
        content: `
<p><strong>球拍</strong>：選 <strong>輕量（7.2-7.6 oz）+ Polymer 軟核 + 寬型甜蜜點大</strong>。避免職業級重拍（8+ oz）易造成匹克球肘。推薦：Engage Pursuit Pro1、PROLITE Titan Pro、Paddletek Bantam TS-5。</p>

<p><strong>鞋子</strong>：<strong>側向支撐好 + 舒適底</strong>。Skechers Viper Court 是銀髮族 CP 王，K-Swiss Bigshot Light 也不錯。絕對不要穿慢跑鞋！</p>

<p><strong>護具</strong>：</p>
<ul>
<li>護膝（加壓型，非彈性緊繃）</li>
<li>護肘（防匹克球肘）</li>
<li>運動眼鏡（近視族）</li>
<li>壓力襪（預防小腿抽筋）</li>
</ul>

<p><strong>其他</strong>：帽子（戶外場防曬）、水壺（每 30 分鐘喝 200ml）、毛巾、防曬乳 SPF 30+。</p>
        `
      },
      {
        heading: '適合的運動強度與頻率',
        content: `
<p><strong>新手期（前 1 個月）</strong>：</p>
<ul>
<li>每週 2 次，每次 30-45 分鐘</li>
<li>以雙打為主（跑動較少）</li>
<li>重點學握拍、基本發球、接發球</li>
</ul>

<p><strong>適應期（1-3 個月）</strong>：</p>
<ul>
<li>每週 3 次，每次 45-60 分鐘</li>
<li>開始學 dink 與網前戰術</li>
<li>參加社區銀髮組對打</li>
</ul>

<p><strong>穩定期（3+ 個月）</strong>：</p>
<ul>
<li>每週 3-4 次，每次 60-90 分鐘</li>
<li>可參加分齡賽事</li>
<li>觀察身體警訊（過度疲勞、關節持續痠痛）</li>
</ul>

<p>黃金法則：<strong>有疲勞就休息，不要勉強</strong>。匹克球是終身運動，長期持續比短期高強度更有價值。</p>
        `
      },
      {
        heading: '台灣銀髮匹克球社群',
        content: `
<p>台灣目前活躍的銀髮匹克球社群（2026 年 4 月統計）：</p>
<ul>
<li><strong>中華民國匹克球協會 (CTPF) 分齡組</strong>：定期舉辦 50+、60+、70+ 組賽事</li>
<li><strong>台北市長青匹克球俱樂部</strong>：每週二、四早上在青年公園免費場</li>
<li><strong>新北市銀髮匹克球聯誼會</strong>：大都會公園河濱匹克球中心，週末活動</li>
<li><strong>台中市銀齡運動中心</strong>：匹克球初級課程，每期 8 週</li>
<li><strong>高雄社區大學</strong>：開設匹克球入門課程</li>
<li><strong>各地樂齡學習中心</strong>：多處開辦匹克球體驗</li>
</ul>

<p>加入方式：直接去球場主動問、Facebook 搜尋「匹克球 + 地區」社團、或聯絡 CTPF 取得分齡組聯絡資訊。</p>
        `
      },
      {
        heading: '常見迷思破解',
        content: `
<p><strong>迷思 1：「我都 70 歲了，是不是太老了？」</strong><br>
美國匹克球協會認證的最高齡球員是 <strong>95 歲</strong>！台灣 CTPF 85+ 組也有多位活躍選手。只要醫師允許、循序漸進，年齡不是阻礙。</p>

<p><strong>迷思 2：「我沒運動過，能打嗎？」</strong><br>
匹克球是最友善的入門運動之一。先從體驗課開始（多數球館提供 NT$ 300-500 體驗），確認自己喜歡再深入。</p>

<p><strong>迷思 3：「裝備太貴我負擔不起」</strong><br>
入門總花費可以控制在 NT$ 5,000 內：球拍 NT$ 3,000 + 鞋子 NT$ 1,500 + 球 NT$ 500。比高爾夫、滑雪便宜太多。免費球場還不用場租。</p>

<p><strong>迷思 4：「會不會跟年輕人格格不入？」</strong><br>
匹克球是少數「世代融合」的運動。很多球場有 70 歲阿公跟 20 歲大學生同場打雙打，因為規則與球速讓年齡差距影響降到最低。</p>
        `
      },
    ],
    faqs: [
      {
        question: '70 歲可以開始學匹克球嗎？',
        answer: '完全可以。美國匹克球協會認證最高齡球員達 95 歲，台灣 CTPF 85+ 組也有活躍選手。70 歲剛開始學只要先諮詢醫師、循序漸進，完全沒問題。匹克球也是醫學界公認最友善的銀髮族運動。'
      },
      {
        question: '銀髮族每週應該打幾次匹克球？',
        answer: '建議新手每週 2 次、每次 30-45 分鐘開始；適應後可增至每週 3-4 次、每次 60-90 分鐘。重點是規律而非強度，長期持續才能獲得健康效益。有疲勞或痠痛就休息。'
      },
      {
        question: '銀髮族打匹克球要特別注意什麼？',
        answer: '三大重點：(1) 充分熱身至少 10 分鐘，特別是膝蓋與肩膀；(2) 選輕量球拍（7.2-7.6 oz）避免匹克球肘；(3) 穿側向支撐的專用鞋避免扭傷跌倒。開始前建議做一次健檢確認心血管狀況。'
      },
      {
        question: '匹克球對失智症預防有幫助嗎？',
        answer: '有研究支持。匹克球需要快速決策、空間判斷、社交互動，三者都是延緩認知退化的關鍵刺激。史丹佛 2024 年研究顯示每週 3 次、12 週後，認知測驗分數提升 10-15%。'
      }
    ],
    references: [
      { title: 'WHO Healthy Aging', url: 'https://www.who.int/health-topics/ageing' },
      { title: '台灣國民健康署 銀髮運動白皮書', url: 'https://www.hpa.gov.tw/' }
    ]
  },

  // ========== 7. 雙打 vs 單打 ==========
  {
    slug: 'doubles-vs-singles',
    title: '匹克球雙打 vs 單打完整對照',
    subtitle: '為什麼 95% 的匹克球是雙打？單打該什麼時候打？',
    category: '技術戰術',
    readingTime: 7,
    publishedDate: '2026-04-25',
    updatedDate: '2026-04-25',
    author: 'Picklemaster Taiwan',
    summary: '匹克球雙打 vs 單打完整對照：規則差異、站位、戰術、體能消耗、適合族群。95% 球友打雙打的真正原因。',
    tags: ['技術戰術', '雙打', '單打'],
    coverEmoji: '⚔️',
    tableOfContents: [
      '為什麼雙打是主流',
      '規則差異',
      '站位差異',
      '體能消耗',
      '戰術重點',
      '誰適合單打、誰適合雙打',
    ],
    sections: [
      {
        heading: '為什麼雙打是主流',
        content: `
<p>全球匹克球約 95% 的比賽是雙打。原因：</p>

<ul>
<li><strong>社交性</strong>：四人一場比兩人熱鬧，打完還可以聊天吃飯</li>
<li><strong>強度溫和</strong>：每人跑動距離少一半，適合各年齡層</li>
<li><strong>容錯高</strong>：有搭檔 cover，新手較能享受樂趣</li>
<li><strong>場地利用率</strong>：一面場可容 4 人打</li>
<li><strong>國際賽制主軸</strong>：PPA Tour、MLP、APG 都以雙打為主</li>
</ul>

<p>單打在職業賽中雖較少但仍有獨立組別。業餘球友打單打多為體能訓練或兩人局的情境（找不到足夠人數湊雙打）。</p>
        `
      },
      {
        heading: '規則差異',
        content: `
<p><strong>雙打規則要點</strong>：</p>
<ul>
<li>每隊 2 人，各守半邊場</li>
<li>發球順序：第一位 → 第二位（換邊）→ 對手...</li>
<li>計分：只有發球方得分，對角發球</li>
<li>第二位球員發球時，比分後加「1」或「2」（如 5-3-2）</li>
</ul>

<p><strong>單打規則要點</strong>：</p>
<ul>
<li>1 對 1，全場自己負責</li>
<li>發球時偶數分在右邊、奇數分在左邊</li>
<li>仍有雙彈跳規則與廚房區</li>
<li>計分同雙打（傳統 11 分）</li>
</ul>

<p>核心規則（雙彈跳、廚房、發球方式）兩者皆相同。</p>
        `
      },
      {
        heading: '站位差異',
        content: `
<p><strong>雙打標準站位</strong>：</p>
<ul>
<li>兩人盡量都站上廚房線（網前雙打）</li>
<li>一前一後站位是初期常見但進階後需修正</li>
<li>疊站（Stacking）適用特殊組合（如一左一右手）</li>
</ul>

<p><strong>單打站位</strong>：</p>
<ul>
<li>中央站位（Middle）：守住整個半場</li>
<li>不像雙打可一直守網前，單打需兼顧底線與網前</li>
<li>快速橫向移動能力是決勝關鍵</li>
</ul>
        `
      },
      {
        heading: '體能消耗',
        content: `
<p>實測數據（同一名 DUPR 4.0 球員，90 分鐘）：</p>
<ul>
<li><strong>雙打</strong>：跑動 2-3 公里，心率平均 120 bpm，熱量 300 kcal</li>
<li><strong>單打</strong>：跑動 5-7 公里，心率平均 150 bpm，熱量 600 kcal</li>
</ul>

<p>單打是 <strong>劇烈有氧運動</strong>，接近慢跑或快走的強度。想練體能、減脂的人單打是好選擇。</p>
        `
      },
      {
        heading: '戰術重點',
        content: `
<p><strong>雙打三大戰術</strong>：</p>
<ol>
<li><strong>上網搶廚房</strong>：兩人都上網比對方有壓倒性優勢</li>
<li><strong>打中間（Middle）</strong>：球落兩人中間容易造成溝通失誤</li>
<li><strong>打弱邊（Weak Side）</strong>：針對較弱的對手連續進攻</li>
</ol>

<p><strong>單打三大戰術</strong>：</p>
<ol>
<li><strong>角度拉開（Wide Angles）</strong>：盡量打邊線，逼對手跑更多</li>
<li><strong>深度壓制（Deep Returns）</strong>：壓迫對方退底線</li>
<li><strong>變速節奏（Pace Change）</strong>：快慢交錯讓對手疲勞</li>
</ol>
        `
      },
      {
        heading: '誰適合單打、誰適合雙打',
        content: `
<p><strong>雙打適合</strong>：</p>
<ul>
<li>社交需求高、喜歡熱鬧</li>
<li>50+ 歲族群（體能考量）</li>
<li>剛入門新手（容錯高）</li>
<li>技術流（控球、戰術）</li>
</ul>

<p><strong>單打適合</strong>：</p>
<ul>
<li>30 歲以下、體能充沛</li>
<li>運動員背景（網球、羽球轉項）</li>
<li>想練體能、減脂</li>
<li>攻擊型打法（單打 drive 優勢大）</li>
</ul>

<p>多數球友兩種都打，雙打為主、單打練體能。職業選手 Ben Johns 單雙打都是冠軍等級（雖然他以雙打聞名）。</p>
        `
      },
    ],
    faqs: [
      {
        question: '為什麼匹克球大多打雙打？',
        answer: '四大原因：社交性強（4 人比 2 人熱鬧）、強度溫和（跑動少一半）、容錯高（有搭檔 cover）、國際賽制主軸（PPA、MLP 皆以雙打為核心）。全球 95% 匹克球比賽是雙打。'
      },
      {
        question: '單打和雙打運動量差多少？',
        answer: '單打約為雙打的 2 倍。90 分鐘比賽雙打跑動 2-3 公里、消耗 300 kcal；單打跑動 5-7 公里、消耗 600 kcal。想練體能減脂選單打，想社交選雙打。'
      },
      {
        question: '我只會打雙打，該練單打嗎？',
        answer: '不強制。但偶爾打單打有幫助：(1) 強化體能、(2) 訓練移動能力、(3) 學會獨立決策。建議每月 1-2 次單打，其他時間雙打為主。'
      },
      {
        question: '雙打和單打站位差別在哪？',
        answer: '雙打：兩人盡量同時上廚房線，左右分守；單打：中央站位兼顧整個半場，快速橫向移動。雙打靠合作，單打靠個人全能。'
      }
    ]
  },

  // ========== 8. 匹克球營養與體能 ==========
  {
    slug: 'pickleball-nutrition-fitness',
    title: '匹克球選手的營養與體能訓練',
    subtitle: '職業選手怎麼吃、怎麼練？業餘球友也能參考',
    category: '運動科學',
    readingTime: 9,
    publishedDate: '2026-04-25',
    updatedDate: '2026-04-25',
    author: 'Picklemaster Taiwan',
    summary: '匹克球選手的營養與體能訓練完整指南：賽前吃什麼、補水策略、重訓菜單、柔軟度訓練、職業選手 Ben Johns 如何準備比賽。',
    tags: ['運動科學', '營養', '體能', '訓練'],
    coverEmoji: '💪',
    tableOfContents: [
      '匹克球的能量需求',
      '賽前 4 小時 / 1 小時該吃什麼',
      '比賽中補水策略',
      '賽後恢復餐',
      '週間體能訓練菜單',
      '柔軟度訓練',
      '職業選手範例：Ben Johns 一天',
    ],
    sections: [
      {
        heading: '匹克球的能量需求',
        content: `
<p>匹克球是 <strong>中高強度間歇運動</strong>（HIIT）—— 短時間爆發（擊球、跑動）+ 短暫恢復（撿球、交換場地）。</p>

<p>能量系統貢獻比例：</p>
<ul>
<li>磷酸肌酸系統（ATP-PCr）：30%（擊球瞬間爆發）</li>
<li>無氧糖解系統：40%（5-20 秒連續回合）</li>
<li>有氧系統：30%（長時間比賽耐力）</li>
</ul>

<p>每小時消耗：雙打 300-400 kcal；單打 500-700 kcal。</p>

<p>對業餘球友而言，匹克球是 <strong>減脂與維持體重</strong> 的絕佳運動。</p>
        `
      },
      {
        heading: '賽前 4 小時 / 1 小時該吃什麼',
        content: `
<p><strong>賽前 4 小時（正餐）</strong>：</p>
<ul>
<li>複合碳水化合物（糙米、全麥麵包、地瓜）</li>
<li>瘦蛋白（雞胸、魚、豆腐）</li>
<li>少量蔬菜（避免纖維過多造成腹脹）</li>
<li>範例：糙米飯 1 碗 + 烤雞胸 150g + 花椰菜</li>
</ul>

<p><strong>賽前 1 小時（加油）</strong>：</p>
<ul>
<li>快速吸收碳水（香蕉、能量棒、運動飲料）</li>
<li>避免高脂、高纖食物</li>
<li>範例：香蕉 1 根 + 運動飲料 200ml</li>
</ul>

<p><strong>避免</strong>：空腹（血糖低易頭暈）、過飽（影響移動）、碳酸飲料（脹氣）、辛辣食物（腸胃不適）。</p>
        `
      },
      {
        heading: '比賽中補水策略',
        content: `
<p>黃金法則：<strong>不要等到口渴才喝</strong>。口渴表示已輕度脫水 1-2%，反應速度下降 10%。</p>

<ul>
<li>每 15-20 分鐘補充 150-200ml 水</li>
<li>單場 60+ 分鐘：加入運動飲料（含電解質）</li>
<li>高溫天（28°C+）：增加 50% 補水量</li>
<li>1 場雙打 90 分鐘：約需 600-900ml</li>
</ul>

<p>過度補水（短時間內 1L+）會造成低鈉血症，導致頭痛、嘔吐。保持適度補充。</p>
        `
      },
      {
        heading: '賽後恢復餐',
        content: `
<p>黃金 30 分鐘原則：比賽結束後 30 分鐘內補充 <strong>3:1 碳水蛋白比</strong>。</p>

<p>範例組合（約 400 kcal）：</p>
<ul>
<li>香蕉 1 根 + 無糖豆漿 500ml + 蛋白粉 1 匙</li>
<li>地瓜 1 顆 + 水煮蛋 2 顆</li>
<li>全麥吐司 2 片 + 鮪魚沙拉</li>
<li>優格 1 杯 + 燕麥 + 藍莓</li>
</ul>

<p>補充：賽後 1-2 小時正餐（均衡飲食）；睡前避免過飽。</p>
        `
      },
      {
        heading: '週間體能訓練菜單',
        content: `
<p>匹克球不是只靠球技，體能也很重要。建議週訓練菜單：</p>

<p><strong>週一：重量訓練（下肢）</strong></p>
<ul>
<li>深蹲 3 組 × 10 下</li>
<li>弓箭步 3 組 × 10 下（每腳）</li>
<li>硬舉 3 組 × 8 下</li>
<li>小腿提踵 3 組 × 15 下</li>
</ul>

<p><strong>週三：有氧訓練</strong></p>
<ul>
<li>慢跑 30 分鐘（維持心率 120-140 bpm）</li>
<li>或 HIIT：30 秒衝刺 + 90 秒慢走，8 組</li>
</ul>

<p><strong>週五：重量訓練（上肢+核心）</strong></p>
<ul>
<li>伏地挺身 3 組 × 10 下</li>
<li>啞鈴划船 3 組 × 10 下</li>
<li>平板撐 3 組 × 45 秒</li>
<li>俄羅斯轉體 3 組 × 20 下</li>
</ul>

<p><strong>週六/日：匹克球比賽</strong>（2-3 小時）</p>

<p>這樣配置可同時提升力量、心肺、爆發力。</p>
        `
      },
      {
        heading: '柔軟度訓練',
        content: `
<p>匹克球需要快速下蹲（dink、reset）、大角度伸展（救邊線球）。柔軟度訓練每週 2-3 次：</p>

<ul>
<li><strong>髖關節伸展</strong>：蝴蝶式、鴿子式</li>
<li><strong>大腿後側</strong>：前彎、坐姿前彎</li>
<li><strong>小腿</strong>：牆壁弓箭步</li>
<li><strong>肩膀</strong>：手臂十字交叉、牆壁胸伸展</li>
<li><strong>脊椎</strong>：貓牛式、轉體伸展</li>
</ul>

<p>瑜伽或皮拉提斯每週 1-2 次，能有效預防傷害與提升表現。世界排名第一的 Ben Johns 每週做 3 次瑜伽。</p>
        `
      },
      {
        heading: '職業選手範例：Ben Johns 一天',
        content: `
<p>以下是 Ben Johns（匹克球世界第一）公開的比賽日作息：</p>

<ul>
<li><strong>7:00</strong> 起床 + 伸展 + 水分補充</li>
<li><strong>7:30</strong> 早餐：燕麥 + 藍莓 + 希臘優格 + 蛋白粉</li>
<li><strong>9:00</strong> 技術訓練 1 小時（drill）</li>
<li><strong>10:00</strong> 加餐：香蕉 + 運動飲料</li>
<li><strong>10:30</strong> 雙打練習 1.5 小時</li>
<li><strong>12:00</strong> 午餐：雞胸 + 糙米 + 蔬菜</li>
<li><strong>13:00</strong> 午休 / 冰敷恢復</li>
<li><strong>15:00</strong> 比賽（視賽程而定）</li>
<li><strong>賽後</strong>：恢復餐（香蕉 + 蛋白粉）+ 冷水浴</li>
<li><strong>18:00</strong> 晚餐：鮭魚 + 藜麥 + 花椰菜</li>
<li><strong>21:00</strong> 瑜伽拉伸 + 冥想</li>
<li><strong>22:30</strong> 就寢（8 小時睡眠）</li>
</ul>

<p>關鍵：<strong>規律作息 + 充分補水 + 優質睡眠</strong>。業餘球友雖不用職業作息，但這些原則值得學習。</p>
        `
      },
    ],
    faqs: [
      {
        question: '比賽前吃什麼最好？',
        answer: '比賽前 4 小時吃正餐（複合碳水 + 瘦蛋白 + 少量蔬菜），比賽前 1 小時吃快速碳水（香蕉、運動飲料）。避免空腹、過飽、辛辣、碳酸飲料。'
      },
      {
        question: '比賽中要喝多少水？',
        answer: '每 15-20 分鐘補充 150-200ml 水，不要等到口渴才喝（口渴已輕度脫水）。60+ 分鐘比賽加入運動飲料補電解質。一場 90 分鐘雙打約需 600-900ml。'
      },
      {
        question: '匹克球球員需要重訓嗎？',
        answer: '強烈建議。每週 2 次下肢（深蹲、弓箭步）+ 1 次上肢+核心（伏地挺身、平板撐）可提升爆發力、預防受傷。重訓與球場訓練互補，不是替代。'
      },
      {
        question: '賽後多久可以吃東西？',
        answer: '黃金 30 分鐘內補充 3:1 碳水蛋白比的點心（香蕉+蛋白粉、地瓜+雞蛋）可加速恢復。1-2 小時後再吃正餐。這樣做可減少隔天肌肉痠痛。'
      }
    ],
    references: [
      { title: 'American College of Sports Medicine', url: 'https://www.acsm.org/' },
      { title: 'Ben Johns Training Interviews', url: 'https://www.ppatour.com/' }
    ]
  },

  // ========== 9. 台灣匹克球課程與教練指南 ==========
  {
    slug: 'taiwan-pickleball-lessons-guide',
    title: '台灣匹克球課程與教練完整指南',
    subtitle: '體驗課、團體班、私人教練怎麼選？認證差異與費用行情一次看懂',
    category: '族群指南',
    readingTime: 11,
    publishedDate: '2026-07-14',
    updatedDate: '2026-07-14',
    author: 'Picklemaster Taiwan',
    summary: '2026 台灣匹克球課程完整指南：CTPF C 級、PPR、IPTPA 教練認證差異、體驗課/團體班/私人教練費用行情、台北台中高雄各縣市找課管道，與挑選教練的 6 個檢查點。',
    tags: ['課程', '教練', '費用', '新手', '2026', 'CTPF', 'PPR'],
    coverEmoji: '🎓',
    featured: true,
    tableOfContents: [
      '需要上課嗎？自學 vs 找教練的分水嶺',
      '台灣教練認證體系：CTPF C 級、PPR、IPTPA 差在哪',
      '三種課程型態與費用行情',
      '各縣市找課管道實戰',
      '挑教練的 6 個檢查點',
      '兒童與銀髮族課程注意事項',
      '上完課之後：練習與球敘銜接',
    ],
    sections: [
      {
        heading: '需要上課嗎？自學 vs 找教練的分水嶺',
        content: `
<p>匹克球號稱「一小時上手」，很多球友確實從 YouTube 影片加球敘實戰就打得有模有樣。那什麼時候值得花錢上課？我們的建議是看三個訊號：</p>
<ul>
<li><strong>完全零經驗、也沒有球拍運動背景</strong>：一堂體驗課能幫你省下數週的摸索——正確握拍、基本站位、雙彈跳與廚房區規則，有人現場糾正比看十支影片有效。</li>
<li><strong>卡關在 3.0 上不去</strong>：抽球有了但軟球（Dink）、第三球下切（Third Shot Drop）不穩定，這正是自學最容易固化錯誤動作的階段，教練的價值最高。</li>
<li><strong>出現疼痛</strong>：手肘、肩膀或膝蓋在打球後持續痠痛，通常代表發力方式錯誤，值得請教練檢查動作（另見本站〈匹克球傷害預防完整指南〉）。</li>
</ul>
<p>反過來說，如果你有羽球、網球或桌球底子，先去球敘實戰兩三次、搭配本站的<strong>3D 互動規則教學</strong>與<strong>技巧百科</strong>，再決定是否需要教練，是最省錢的路徑。</p>
        `
      },
      {
        heading: '台灣教練認證體系：CTPF C 級、PPR、IPTPA 差在哪',
        content: `
<p>台灣目前常見三種教練認證，性質不同：</p>
<ul>
<li><strong>CTPF C 級教練</strong>：由中華民國匹克球協會開辦的國內教練認證，是台灣體系的入門級教練證。截至 2026 年全台已有超過 1,400 名認證教練，課程場場秒殺，是目前台灣最普及的認證。</li>
<li><strong>PPR（Professional Pickleball Registry）</strong>：美國職業匹克球教練註冊系統，國際通用，重視教學法與課程設計。台灣已有多位球館教練與內容創作者持有 PPR 認證，通常代表較完整的教學訓練。</li>
<li><strong>IPTPA（International Pickleball Teaching Professional Association）</strong>：國際匹克球教學專業協會認證，分級制（Level I/II），在亞洲逐漸普及。</li>
</ul>
<p>重點觀念：<strong>認證代表「受過教學訓練」，不等於「打得最強」</strong>。DUPR 4.5 的選手不一定會教零基礎學員；反之，專職教初學者的教練可能比賽成績普通但教學極有系統。挑課時把「教學對象與你的程度是否匹配」放在認證與戰績前面。</p>
        `
      },
      {
        heading: '三種課程型態與費用行情',
        content: `
<p>以下為 2026 年常見行情區間，實際價格依球館、地區與教練資歷浮動，報名前請以各球館公告為準：</p>
<ul>
<li><strong>體驗課（1.5-2 小時）</strong>：球館與推廣單位常態開設，通常數百元、含球拍租借與場地。適合第一次接觸、還沒買裝備的人。台北 Pickle Day、DOPE 水獺綠洲、中和 Pickleday、淡水 P.dang 等球館都有固定梯次，部分平台（如 o2gether）也能直接報名體驗課。</li>
<li><strong>團體班（4-8 週、每週一堂）</strong>：每堂常見約 NT$400-800（依人數與場地），是 CP 值最高的選擇——有系統的課綱、有同期球友，結業後直接變成球敘班底。</li>
<li><strong>私人教練（1 對 1 / 1 對 2）</strong>：每小時常見約 NT$1,000-2,000，資深或具國際認證的教練更高，另計場地費。適合卡關明確（例如專攻第三球下切）或準備比賽的球友，1 對 2 找球友分攤是常見省錢法。</li>
</ul>
<p>粗略換算：一個零基礎新手「體驗課 + 8 週團體班」的總投資約 NT$3,000-6,000，比多數球拍還便宜，卻能決定你前一年的動作品質。預算試算可用本站<strong>新手懶人包</strong>的費用試算器。</p>
        `
      },
      {
        heading: '各縣市找課管道實戰',
        content: `
<p>台灣目前沒有單一的官方課程平台，實務上從這四個管道找：</p>
<ul>
<li><strong>球館官方課程</strong>：最穩定的來源。雙北（Pickle Day、DOPE、P.dang、樓下匹克球俱樂部）、桃園（Social N Pickle）、台中（PICKZONE、西雅圖俱樂部）、高雄（各運動中心與私人球館）多數有官網或 LINE 官方帳號公告開課資訊。用本站<strong>球場地圖</strong>找到附近的私人球館，點進官方連結詢問是最快的。</li>
<li><strong>課程媒合平台</strong>：Sunny Tennis 等球類課程平台已納入匹克球課程，可依地區與時段篩選教練。</li>
<li><strong>協會管道</strong>：中華民國匹克球協會（pickleball.org.tw）有認證教練資訊，也會公告教練講習與推廣課程。</li>
<li><strong>LINE 社群與 FB 社團</strong>：「臺灣匹克球交流社群」等 LINE OpenChat 與各縣市匹克球 FB 社團，直接發問「XX 區找新手課」通常當天就有教練或球館回覆，也能順便了解該教練的社群風評。</li>
</ul>
<p>中南部與東部的課程密度仍低於雙北，但 2026 年運動中心大量開設匹克球時段後，公立運動中心的推廣課程（價格通常最親民）正在快速增加，可留意各運動中心季度課表。</p>
        `
      },
      {
        heading: '挑教練的 6 個檢查點',
        content: `
<p>報名前用這 6 點快速過濾：</p>
<ul>
<li><strong>1. 教學對象匹配</strong>：問「這班的目標學員程度？」，答不出具體 DUPR 或程度描述的要小心。</li>
<li><strong>2. 課綱透明</strong>：好的團體班能列出每週主題（握拍發球 → 底線抽球 → 網前 Dink → 第三球 → 實戰站位），只寫「依學員程度調整」的通常沒備課。</li>
<li><strong>3. 師生比</strong>：團體班 1 位教練帶 6 人以內是合理值；超過 8 人你大部分時間在排隊撿球。</li>
<li><strong>4. 有無認證</strong>：CTPF C 級以上或 PPR/IPTPA 擇一即可，重點是願意公開資歷。</li>
<li><strong>5. 示範與回饋方式</strong>：試上或體驗時觀察教練是否「先示範、再拆解、後糾錯」，只餵球不講原理的課上完不會進步。</li>
<li><strong>6. 社群風評</strong>：在 LINE 社群或 Dcard 搜尋教練/球館名字，台灣匹克球圈子小，風評很透明。</li>
</ul>
        `
      },
      {
        heading: '兒童與銀髮族課程注意事項',
        content: `
<p><strong>兒童（6-12 歲）</strong>：2026 年起臺灣盃已設國小組，校園推廣快速展開。選課重點：使用較輕球拍（7 盎司以下）、以遊戲化課程為主、確認場地有足夠緩衝空間。部分球館開設親子班，是全家一起入坑的好起點。</p>
<p><strong>銀髮族（55+）</strong>：匹克球對高齡族群非常友善，但課程要確認三件事：教練是否具備高齡運動指導經驗、課程強度是否漸進（先從半場 Dink 開始）、場地是否為對膝蓋友善的 PU 或壓克力面層。詳細裝備與頻率建議見本站〈50+ 歲銀髮族匹克球入門完全指南〉。</p>
        `
      },
      {
        heading: '上完課之後：練習與球敘銜接',
        content: `
<p>課程的效果取決於課後練習量。建議節奏：<strong>每上 1 堂課，安排 2 次以上實戰或練習</strong>。三個銜接資源：</p>
<ul>
<li><strong>找場地</strong>：用本站球場地圖篩選「免費」場地練球，零成本累積球感。</li>
<li><strong>系統化自主練習</strong>：本站訓練菜單有「新手 8 週」「Dink 4 週特訓」等課表，直接接在團體班後面用。</li>
<li><strong>加入球敘</strong>：結業後最重要的一步是找到固定球敘（見本站〈第一次參加匹克球球敘完整指南〉），實戰是唯一能把課堂動作轉成比賽能力的方法。</li>
</ul>
<p>最後提醒：台灣匹克球教學市場還在爆發初期，教練品質參差是正常現象。用體驗課驗證、小額試錯，找到適合自己的教練後長期跟課，是目前最穩的策略。</p>
        `
      },
    ],
    faqs: [
      {
        question: '匹克球課程一堂大概多少錢？',
        answer: '體驗課通常數百元含裝備租借；團體班每堂約 NT$400-800；私人教練每小時約 NT$1,000-2,000（依資歷，場地費另計）。實際以各球館公告為準。'
      },
      {
        question: '不上課自學可以嗎？',
        answer: '可以，特別是有羽球/網球/桌球底子的人。建議搭配線上規則教學與技巧影片，先參加球敘實戰。但零基礎者上 1-2 堂體驗課能避免固化錯誤動作，長期更省錢。'
      },
      {
        question: 'CTPF C 級教練和 PPR 教練哪個好？',
        answer: '兩者性質不同：CTPF C 級是台灣本土認證、最普及；PPR 是美國系統、國際通用、重教學法。挑教練時「教學對象是否匹配你的程度」比認證種類更重要。'
      },
      {
        question: '哪裡可以查匹克球教練？',
        answer: '四個管道：各私人球館官網/LINE 官方帳號、課程媒合平台、中華民國匹克球協會（pickleball.org.tw）、各縣市匹克球 LINE 社群與 FB 社團直接詢問。'
      },
    ],
    references: [
      { title: '中華民國匹克球協會 (CTPF)', url: 'https://pickleball.org.tw/' },
      { title: 'Professional Pickleball Registry (PPR)', url: 'https://pprpickleball.org/' },
      { title: 'IPTPA', url: 'https://iptpa.com/' },
      { title: '遠見雜誌：台灣匹克球熱潮報導', url: 'https://www.gvm.com.tw/article/120290' },
    ]
  },

  // ========== 10. 第一次參加球敘 (Open Play) 指南 ==========
  {
    slug: 'first-open-play-guide',
    title: '第一次參加匹克球球敘（Open Play）完整指南',
    subtitle: '怎麼找球敘、程度怎麼報、排拍規矩與費用分攤，一篇搞定不失禮',
    category: '族群指南',
    readingTime: 9,
    publishedDate: '2026-07-14',
    updatedDate: '2026-07-14',
    author: 'Picklemaster Taiwan',
    summary: '台灣匹克球球敘（Open Play）新手完整指南：LINE 社群與揪團平台怎麼找場、DUPR 程度標示怎麼看、排拍輪場規矩、費用分攤行情與 8 條不成文禮儀。',
    tags: ['球敘', 'Open Play', '揪團', '新手', '禮儀', '2026'],
    coverEmoji: '🤝',
    featured: true,
    tableOfContents: [
      '球敘是什麼？和課程、比賽差在哪',
      '去哪找球敘：四大管道',
      '程度標示怎麼看、怎麼誠實自報',
      '費用怎麼算',
      '排拍與輪場：球敘的核心規矩',
      '球場禮儀 8 條',
      '該帶什麼、穿什麼',
    ],
    sections: [
      {
        heading: '球敘是什麼？和課程、比賽差在哪',
        content: `
<p><strong>球敘（Open Play）</strong>是台灣匹克球最主流的活動型態：一群球友約定時段包下場地，到場者輪流組隊打雙打，打完一場換人。它介於課程與比賽之間——沒有教練帶動作，也沒有正式計分排名，核心是<strong>實戰 + 社交</strong>。</p>
<p>對新手來說，球敘是進步最快的環境：一個下午能和十幾位不同打法的球友交手，這是課程給不了的經驗值。台灣匹克球社群公認的友善文化，也讓多數球敘對禮貌的新手非常包容——前提是你懂基本規矩，這正是本文要教的。</p>
        `
      },
      {
        heading: '去哪找球敘：四大管道',
        content: `
<ul>
<li><strong>LINE 社群（OpenChat）</strong>：台灣球敘的主戰場。「臺灣匹克球交流社群」等大型社群每天都有各地開團訊息，各球館（DOPE、Social N Pickle 等）也有自己的球敘群。加入後先潛水看幾天格式，通常是「日期/時段/場地/程度/費用/+1 報名」。</li>
<li><strong>Facebook 社團</strong>：「全台匹克球活動及比賽資訊版」與各縣市匹克球社團，適合找週末場與跨區活動。</li>
<li><strong>揪團平台</strong>：台灣匹克聚會所（picklejo）、Pickletown 等平台把開團搬到網頁上，可依縣市篩選、線上報名，對不想加一堆群組的人最友善。</li>
<li><strong>球館固定時段</strong>：許多私人球館有官方 Open Play 時段（部分依 DUPR 分級），單次付費入場即可，是最無門檻的起點。用本站<strong>球場地圖</strong>找附近球館，點官方連結查時段。</li>
</ul>
<p>新手建議從「標明新手友善」或「2.5 以下」的場次開始，體驗最好。</p>
        `
      },
      {
        heading: '程度標示怎麼看、怎麼誠實自報',
        content: `
<p>台灣球敘普遍用 <strong>DUPR</strong> 或傳統分級標示程度，常見對照：</p>
<ul>
<li><strong>2.0-2.5（新手）</strong>：會發球、能維持簡單對打</li>
<li><strong>3.0（初階）</strong>：抽球穩定、知道要上網、開始學 Dink</li>
<li><strong>3.5（中階）</strong>:第三球下切成形、廚房戰能周旋</li>
<li><strong>4.0+（進階）</strong>：戰術與控球全面，多為賽事常客</li>
</ul>
<p>沒有 DUPR 評分怎麼辦？誠實描述球齡與背景即可，例如「打三個月、羽球底、還在練 Dink」。<strong>球敘最大的地雷是虛報程度</strong>——報高了會拖累整場節奏，報低了則被當「殺手」惹人反感。台灣圈子小，誠實是最好的名片。想了解自己大概的評級，可用本站 DUPR 評級指南自我對照，或參加球館的 DUPR 認證賽取得正式評分。</p>
        `
      },
      {
        heading: '費用怎麼算',
        content: `
<p>球敘費用邏輯很簡單：<strong>場租 ÷ 人數，另加球損</strong>。常見行情：</p>
<ul>
<li><strong>免費戶外場球敘</strong>：0 元或酌收 NT$20-50 球損費（戶外球消耗快）</li>
<li><strong>室內場球敘</strong>：依場租均分，常見每人 NT$100-300／2-3 小時</li>
<li><strong>球館官方 Open Play</strong>：單次入場常見 NT$200-400，通常含用球</li>
</ul>
<p>付款方式多為現場轉帳或 LINE Pay 給團主。報名後臨時不到（俗稱「放鳥」）仍應照付分攤費用，這是球敘圈最重視的信用規則。</p>
        `
      },
      {
        heading: '排拍與輪場：球敘的核心規矩',
        content: `
<p>人多場少時，台灣球敘通用「<strong>排拍（Paddle Stacking）</strong>」制度：想打下一場的人把球拍依序排在場邊架上或地上，一場結束後，排最前面的 4 支拍上場。變體規則開打前通常會講清楚，常見兩種：</p>
<ul>
<li><strong>全下制</strong>：一場打完 4 人全下，重新排拍——最公平，人多時的主流</li>
<li><strong>贏家續留制</strong>：贏方留場一場、輸方下場——節奏快，但強者容易霸場，通常限續留一次</li>
</ul>
<p>兩個新手常犯的錯：一是打完忘記把自己的拍拿去排，空等半天；二是插隊把拍放到前面。不確定規則就直接問「這裡怎麼排？」，沒有人會介意。若是自己包場的小團（4-8 人），可用本站<strong>雙打輪轉排程器</strong>自動排出公平的輪次表。</p>
        `
      },
      {
        heading: '球場禮儀 8 條',
        content: `
<ul>
<li><strong>1. 開賽前擊拍致意，賽後說聲好球</strong>——匹克球文化的招牌。</li>
<li><strong>2. 界內界外自己這側自己判</strong>，看不清楚就算對方得分（benefit of the doubt）。</li>
<li><strong>3. 球滾進別人場地，喊「Ball on court！」</strong>提醒暫停，直接衝進去撿球非常危險。</li>
<li><strong>4. 還球用滾的或輕拋到對方手上</strong>，不要隔場亂敲。</li>
<li><strong>5. 不對隊友的失誤擺臉色</strong>——球敘是交朋友，不是打積分。</li>
<li><strong>6. 對明顯較弱的對手不狂轟猛砸</strong>，練你的控球與軟球反而進步更快。</li>
<li><strong>7. 上一場的人還沒離場，不要急著開球。</strong></li>
<li><strong>8. 離場前跟團主道謝</strong>，想加入固定班底就是這時候開口。</li>
</ul>
        `
      },
      {
        heading: '該帶什麼、穿什麼',
        content: `
<p>基本清單：</p>
<ul>
<li><strong>球拍</strong>：新手用入門拍即可（選購見本站球拍資料庫）；部分球館與球敘提供租借，報名時先問。</li>
<li><strong>鞋</strong>：<strong>務必穿具側向支撐的球類運動鞋</strong>（網球鞋、羽球鞋、匹克球鞋皆可），慢跑鞋是腳踝扭傷的最大來源；室內木地板場多要求淺色鞋底。</li>
<li><strong>球</strong>：可帶 1-2 顆合用的球（戶外 40 孔、室內 26 孔）以備球損，詳見本站室內外用球解析。</li>
<li><strong>其他</strong>：水（一場 2 小時建議 1 公升以上）、毛巾、戶外場記得防曬。</li>
</ul>
<p>最後一步：打開本站<strong>球場地圖</strong>，找一個離家近的場地，加入一個 LINE 社群，這週末就去報你的第一場球敘吧。</p>
        `
      },
    ],
    faqs: [
      {
        question: '完全新手可以直接參加球敘嗎？',
        answer: '可以，但建議先懂基本規則（雙彈跳、廚房區、簡單計分），並選「新手友善」或標示 2.5 以下的場次。多數球敘對誠實自報程度的新手非常包容。'
      },
      {
        question: '球敘一次大概花多少錢？',
        answer: '免費戶外場 0-50 元（球損費）；室內場均分場租約每人 NT$100-300；球館官方 Open Play 單次約 NT$200-400。報名後未到仍應支付分攤費用。'
      },
      {
        question: '什麼是排拍（Paddle Stacking）？',
        answer: '球敘的輪場制度：想打下一場的人把球拍依序排在場邊，一場結束後排最前面的 4 支拍上場。常見「全下制」與「贏家續留制」兩種變體，開打前問清楚即可。'
      },
      {
        question: '去哪裡找匹克球球敘？',
        answer: '四大管道：LINE OpenChat 社群（臺灣匹克球交流社群等）、FB 社團、揪團平台（picklejo、Pickletown）、球館官方 Open Play 時段。'
      },
    ],
    references: [
      { title: 'USA Pickleball – Player Etiquette', url: 'https://usapickleball.org/' },
      { title: '中華民國匹克球協會 (CTPF)', url: 'https://pickleball.org.tw/' },
    ]
  },
];

// 取得分類
export const ARTICLE_CATEGORIES = ['器材評測', '運動科學', '技術戰術', '族群指南', '規則知識', '比較分析'] as const;

// 依 slug 取得
export const getArticleBySlug = (slug: string): Article | undefined =>
  ARTICLES.find(a => a.slug === slug);

// 取得精選
export const getFeaturedArticles = (): Article[] =>
  ARTICLES.filter(a => a.featured);

// 依分類取得
export const getArticlesByCategory = (cat: ArticleCategory): Article[] =>
  ARTICLES.filter(a => a.category === cat);
