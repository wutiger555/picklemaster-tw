import type { NewsItem } from '../types/news';

export const NEWS_DATA: NewsItem[] = [
  // Courts News
  {
    id: 'courts-202509-1',
    title: '全台首座河濱匹克球中心啟用',
    summary: '新北大都會公園將舊籃球場改建為擁有 8 面球場的匹克球中心，於 2025 年 9 月正式啟用，提供市民更優質的運動空間。',
    content: `
      <p>新北市政府高灘地工程管理處宣布，位於新北大都會公園內的「微風匹克球場」已於 2025 年 9 月 19 日正式啟用。這是全台首座利用河濱空間改建的專業匹克球中心，原址為使用率較低的舊籃球場。</p>
      
      <p>這座全新的匹克球中心擁有 8 面標準硬地場地，採用國際賽事等級的壓克力面層，不僅防滑係數符合標準，更能提供良好的球速與彈跳感。場地周邊也增設了休息座椅與夜間照明設備，讓球友們從清晨到夜晚都能盡情享受打球樂趣。</p>

      <p>高灘處處長表示：「匹克球是近年來成長最快的新興運動，適合各年齡層參與。我們希望透過活化河濱空間，提供市民更多元的運動選擇。」未來此場地也計畫舉辦地區性賽事與推廣課程，歡迎市民朋友多加利用。</p>
      
      <p class="mt-8 text-sm text-gray-500">資料來源：<a href="https://focustaiwan.tw/sports/202509190001" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">Focus Taiwan</a></p>
    `,
    date: '2025-09-19',
    category: 'Courts',
    image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070&auto=format&fit=crop', // Outdoor court
    source: 'Focus Taiwan',
    link: 'https://focustaiwan.tw/sports/202509190001',
    tags: ['New Court', 'New Taipei City']
  },
  {
    id: 'courts-202510-1',
    title: '台北市中心新增室內匹克球專用場館',
    summary: '因應日益增長的匹克球人口，台北市中心某運動中心將羽球場改建為 4 面專業匹克球場，並配備專業地墊與照明。',
    content: `
      <p>台北市運動愛好者有福了！位於市中心的「活力運動中心」宣布，已將原本的 2 面羽球場改建為 4 面標準室內匹克球場，並於 2025 年 10 月 5 日起開放預約。</p>

      <p>這項改建計畫是回應近期匹克球人口的爆發性成長。館方表示，過去一年來詢問匹克球場地的民眾增加了三倍以上。新的場地採用專業運動地墊，能有效緩衝膝蓋壓力，並配備了防眩光照明系統，提供最舒適的打球環境。</p>

      <p>除了硬體設施，該中心也將與專業教練合作，開設平日晚間與週末的團體課程，從新手入門到進階戰術班應有盡有，希望能培育更多匹克球好手。</p>
      
      <p class="mt-8 text-sm text-gray-500">資料來源：<a href="https://sports.ltn.com.tw/" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">Taipei Sports News</a></p>
    `,
    date: '2025-10-05',
    category: 'Courts',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop', // Indoor court
    source: 'Taipei Sports News',
    link: 'https://sports.ltn.com.tw/',
    tags: ['New Court', 'Taipei', 'Indoor']
  },

  // Taiwan News
  {
    id: 'tw-1',
    title: '2024 亞洲匹克球運動會圓滿落幕',
    summary: '於台中舉行的亞洲匹克球運動會 (APG) 吸引了來自 11 個國家、780 位選手參賽，總獎金達 2 萬美元。',
    content: `
      <p>2024 亞洲匹克球運動會 (Asia Pickleball Games, APG) 於 10 月 27 日在台中圓滿落幕。這場為期四天的盛事吸引了來自日本、韓國、新加坡、印度等 11 個國家，共計 780 位頂尖好手齊聚一堂，角逐總獎金 2 萬美元的殊榮。</p>

      <p>台灣選手在本次賽事中表現亮眼，在公開組與分齡組共奪下 5 金 3 銀的好成績，展現了台灣在亞洲匹克球界的強大實力。其中，來自台中的雙打組合在決賽中擊敗強敵印度隊，將冠軍獎盃留在台灣，令現場觀眾熱血沸騰。</p>

      <p>主辦單位表示，APG 的成功舉辦不僅提升了台灣的國際能見度，也促進了亞洲各國間的體育交流。賽事期間還舉辦了「亞洲大學匹克球聯盟」(APUN) 的簽約儀式，未來將致力於在校園推廣這項運動。</p>
      
      <p class="mt-8 text-sm text-gray-500">資料來源：<a href="https://www.taichung.gov.tw/" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">Taichung City Government</a></p>
    `,
    date: '2024-10-27',
    category: 'Taiwan',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=2070&auto=format&fit=crop', // Tournament action
    source: 'Taichung City Government',
    link: 'https://www.taichung.gov.tw/',
    tags: ['Tournament', 'APG']
  },
  {
    id: 'tw-3',
    title: '2025 CAPA 台灣公開賽將於宜蘭舉行',
    summary: '預計於 2025 年 9 月在宜蘭運動公園舉辦，設有 20 面遮雨球場，公開組總獎金高達 1 萬美元。',
    content: `
      <p>CAPA (Chinese American Pickleball Association) 正式宣布，2025 CAPA 台灣公開賽將移師宜蘭舉行。比賽地點選定在風景優美的宜蘭運動公園，時間定於 2025 年 9 月 5 日至 7 日。</p>

      <p>本次賽事的一大亮點是場地規格的升級。宜蘭運動公園將提供 20 面具備遮雨棚的標準球場，確保賽程不受天氣影響。此外，主辦單位更加碼將公開組總獎金提高至 1 萬美元，預計將吸引更多國際職業選手來台參賽。</p>

      <p>宜蘭縣政府表示，非常歡迎 CAPA 台灣公開賽的到來，屆時將結合在地觀光資源，推出「運動觀光」套裝行程，讓選手與眷屬在比賽之餘，也能體驗宜蘭的好山好水與美食。</p>
      
      <p class="mt-8 text-sm text-gray-500">資料來源：<a href="https://www.playcapa.com/" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">CAPA Pickleball</a></p>
    `,
    date: '2025-09-05',
    category: 'Taiwan',
    image: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?q=80&w=1974&auto=format&fit=crop', // Scenic/Outdoor
    source: 'CAPA Pickleball',
    link: 'https://www.playcapa.com/',
    tags: ['Tournament', 'Yilan']
  },

  // International News
  {
    id: 'int-1',
    title: '2025 匹克球世界盃將在佛羅里達登場',
    summary: '預計將有超過 3000 名來自世界各地的選手齊聚 Fort Lauderdale，這將是年度最大規模的國際匹克球盛事之一。',
    content: `
      <p>全球匹克球愛好者引頸期盼的「2025 匹克球世界盃」(Pickleball World Cup) 確定將於 2025 年 12 月 14 日在美國佛羅里達州 Fort Lauderdale 盛大登場。這場被譽為「匹克球界奧運」的賽事，預計將創下參賽人數新高。</p>

      <p>賽事將在著名的 The FORT Pickleball Club 舉行，該場館擁有 43 面專業球場，包含一座可容納數千名觀眾的主場館。主辦單位透露，目前已有超過 50 個國家的代表隊報名參賽，預計總參賽人數將突破 3000 人。</p>

      <p>除了正規賽事，世界盃期間還將舉辦國際匹克球論壇、裝備博覽會以及多場球星見面會，將是一場結合競技、產業與文化的嘉年華會。</p>
      
      <p class="mt-8 text-sm text-gray-500">資料來源：<a href="https://www.swishtournaments.com/" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">Pickleball World Cup</a></p>
    `,
    date: '2025-12-14',
    category: 'International',
    image: 'https://images.unsplash.com/photo-1505235687559-28b5f54645b7?q=80&w=2070&auto=format&fit=crop', // Crowd/Stadium
    source: 'Pickleball World Cup',
    link: 'https://www.swishtournaments.com/',
    tags: ['World Cup', 'USA']
  },
  {
    id: 'int-2',
    title: 'PPA 巡迴賽擴展至澳洲',
    summary: 'PPA 澳洲匹克球公開賽將於 2025 年 2 月在墨爾本舉行，標誌著職業巡迴賽正式進軍亞太地區。',
    content: `
      <p>職業匹克球協會 (PPA Tour) 宣布其國際擴張計畫的重要一步：首屆 PPA 澳洲公開賽將於 2025 年 2 月 2 日在墨爾本會議中心舉行。這不僅是 PPA 首次進軍南半球，也象徵著職業匹克球運動在亞太地區的蓬勃發展。</p>

      <p>PPA 執行長表示：「澳洲擁有深厚的網球底蘊，近年來匹克球發展速度驚人。我們看好這裡的市場潛力，也希望透過頂級賽事的引進，進一步帶動當地的運動風氣。」</p>

      <p>屆時，包括世界球王 Ben Johns、球后 Anna Leigh Waters 等頂尖球星都將飛抵墨爾本獻技，澳洲當地的球迷將有機會親眼目睹世界級的對決。</p>
      
      <p class="mt-8 text-sm text-gray-500">資料來源：<a href="https://ppatour.com.au/" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">PPA Tour Australia</a></p>
    `,
    date: '2025-02-02',
    category: 'International',
    image: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=2148&auto=format&fit=crop', // Tennis/Pickleball court generic
    source: 'PPA Tour Australia',
    link: 'https://ppatour.com.au/',
    tags: ['PPA', 'Australia']
  },

  // Equipment News
  {
    id: 'eq-1',
    title: '2025 球拍科技新趨勢：泡沫核心 (Foam Core)',
    summary: '新一代 Gen 4 球拍全面採用泡沫核心技術，如 CRBN TruFoam Genesis，提供更強的耐用度與更大的甜蜜點。',
    content: `
      <p>2025 年的球拍市場迎來了重大技術革新，「泡沫核心」(Foam Core) 技術成為了各大品牌競相追逐的焦點。與傳統的蜂巢狀聚丙烯 (Polypropylene) 核心不同，新一代的 Gen 4 球拍在邊框或整個拍面核心注入了特殊的泡沫材料。</p>

      <p>這種技術最大的優勢在於大幅提升了球拍的穩定性與甜蜜點 (Sweet Spot) 大小。根據實驗室數據，採用泡沫核心的球拍，其有效擊球面積平均增加了 15%，且擊球時的震動減少了 20%，能有效降低網球肘的風險。</p>

      <p>目前市面上最具代表性的產品包括 CRBN 的 TruFoam Genesis 系列與 Selkirk 的 Project 008。雖然價格普遍較高，但其帶來的性能提升與耐用度，仍讓許多進階玩家趨之若鶩。</p>
      
      <p class="mt-8 text-sm text-gray-500">資料來源：<a href="https://crbnpickleball.com/" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">CRBN Pickleball</a></p>
    `,
    date: '2025-01-15',
    category: 'Equipment',
    image: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=2076&auto=format&fit=crop', // Generic paddle/racket
    source: 'CRBN Pickleball',
    link: 'https://crbnpickleball.com/',
    tags: ['Tech', 'Paddle']
  },
  {
    id: 'eq-2',
    title: '智慧球拍時代來臨',
    summary: '內建感測器的智慧球拍如 Potenza SMARTx 問世，可即時追蹤揮拍速度、旋轉與擊球力道。',
    content: `
      <p>想像一下，你的球拍就是你的私人教練。這不再是科幻電影的情節，隨著 Potenza SMARTx 等智慧球拍的問世，匹克球訓練正式進入了數據化時代。</p>

      <p>這款球拍在握把底蓋內建了微型六軸感測器，能夠精準捕捉每一次揮拍的軌跡、速度、擊球力道以及球的旋轉速率 (RPM)。數據會透過藍牙即時傳輸到手機 App，並生成詳細的分析報告。</p>

      <p>「這對修正動作非常有幫助，」一位參與測試的教練表示，「數據不會說謊，它能讓球員客觀地看到自己的強項與弱點，從而進行更有效率的訓練。」</p>
      
      <p class="mt-8 text-sm text-gray-500">資料來源：<a href="https://potenzapickleball.com/" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">Potenza Pickleball</a></p>
    `,
    date: '2025-03-10',
    category: 'Equipment',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop', // Tech/Sensor
    source: 'Potenza Pickleball',
    link: 'https://potenzapickleball.com/',
    tags: ['Tech', 'Smart']
  }
];
