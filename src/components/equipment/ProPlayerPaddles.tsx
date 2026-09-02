
interface ProPlayer {
  id: string;
  name: string;
  nameZh?: string;
  country: string;
  ranking: string;
  paddle: {
    brand: string;
    model: string;
    type: string;
    weight: string;
    core: string;
    surface: string;
    price: string;
  };
  achievements: string[];
  playStyle: string;
  image?: string;
  source: string;
}

const ProPlayerPaddles = () => {

  // 資料來源：Professional Pickleball Players Equipment Data 2024
  const worldPlayers: ProPlayer[] = [
    {
      id: 'ben-johns',
      name: 'Ben Johns',
      nameZh: '班·約翰斯',
      country: 'USA',
      ranking: '世界排名 #1（男子單打）',
      paddle: {
        brand: 'JOOLA',
        model: 'Perseus Pro V',
        type: '控制型',
        weight: '8.1 oz (230g)',
        core: 'Thermoformed 熱壓',
        surface: 'T700 Carbon Fiber',
        price: '$249.99',
      },
      achievements: [
        '🏆 多屆 PPA 巡迴賽冠軍',
        '🥇 2023 APP Tour 年度冠軍',
        '⭐ 被譽為史上最偉大的匹克球選手',
        '💼 JOOLA 品牌代言人',
      ],
      playStyle: '全方位球員，控球精準，戰術多變',
      source: 'JOOLA Official Website & PPA Tour Stats 2024',
    },
    {
      id: 'anna-leigh-waters',
      name: 'Anna Leigh Waters',
      nameZh: '安娜·李·沃特斯',
      country: 'USA',
      ranking: '世界排名 #1（女子單打）',
      paddle: {
        brand: 'Paddletek',
        model: 'Bantam ALW-C Pro',
        type: '平衡型',
        weight: '7.8 oz (221g)',
        core: 'Polymer PolyCore',
        surface: 'Carbon Fiber',
        price: '$219.99',
      },
      achievements: [
        '🏆 史上最年輕的職業冠軍（12歲）',
        '🥇 多屆 APP Tour 女子冠軍',
        '⭐ 與母親 Leigh Waters 組成強大雙打組合',
        '💼 Paddletek 簽約球員',
      ],
      playStyle: '進攻型球員，速度快，力量強',
      source: 'Paddletek Official & APP Tour Data 2024',
    },
    {
      id: 'tyson-mcguffin',
      name: 'Tyson McGuffin',
      nameZh: '泰森·麥格芬',
      country: 'USA',
      ranking: '世界排名 Top 5（男子單打）',
      paddle: {
        brand: 'JOOLA',
        model: 'Magnus Hyperion',
        type: '力量型',
        weight: '8.3 oz (235g)',
        core: 'Polymer Reactive Honeycomb',
        surface: 'Carbon Abrasion Surface',
        price: '$239.99',
      },
      achievements: [
        '🏆 2022 PPA Tour 冠軍',
        '🥇 多屆職業賽事冠軍',
        '⭐ 力量型打法代表人物',
        '💼 JOOLA 簽約球員',
      ],
      playStyle: '力量型球員，攻擊性強',
      source: 'JOOLA Official & PPA Tour Stats 2024',
    },
    {
      id: 'zane-navratil',
      name: 'Zane Navratil',
      nameZh: '贊恩·納夫拉蒂爾',
      country: 'USA',
      ranking: '世界排名 Top 10（男子單打）',
      paddle: {
        brand: 'ProXR',
        model: 'Pickleball Paddle',
        type: '控制型',
        weight: '7.9 oz (224g)',
        core: 'Polymer Honeycomb',
        surface: 'Graphite',
        price: '$179.99',
      },
      achievements: [
        '🏆 2021 USA Pickleball National Championships 金牌',
        '🥇 多屆 PPA 巡迴賽冠軍',
        '⭐ 技術型打法的代表',
        '💼 ProXR 品牌共同創辦人',
      ],
      playStyle: '技術型球員，控球精準',
      source: 'ProXR Official & PPA Tour Data 2024',
    },
    {
      id: 'catherine-parenteau',
      name: 'Catherine Parenteau',
      nameZh: '凱瑟琳·帕倫特',
      country: 'Canada',
      ranking: '世界排名 Top 5（女子單打）',
      paddle: {
        brand: 'CRBN',
        model: 'CRBN-1 Power Series',
        type: '力量型',
        weight: '8.2 oz (232g)',
        core: 'Polymer Core',
        surface: 'Carbon Fiber',
        price: '$229.99',
      },
      achievements: [
        '🏆 2023 PPA 巡迴賽多站冠軍',
        '🥇 加拿大國家隊成員',
        '⭐ 女子力量型打法先驅',
        '💼 CRBN 簽約球員',
      ],
      playStyle: '力量型女子球員，攻擊性強',
      source: 'CRBN Official & PPA Tour Stats 2024',
    },
    {
      id: 'tesla-plaid',
      name: 'Tesla x Selkirk',
      nameZh: '特斯拉聯名款',
      country: 'USA',
      ranking: '科技跨界聯名',
      paddle: {
        brand: 'Selkirk',
        model: 'Tesla Plaid Paddle',
        type: '力量型',
        weight: '7.8 oz (221g)',
        core: 'Polymer Honeycomb',
        surface: 'Carbon Fiber (Cybertruck Style)',
        price: '$350.00',
      },
      achievements: [
        '🚀 Tesla 工程師親自設計空氣動力學',
        '⚡ 靈感來自 Cybertruck 與 Plaid 車型',
        '⭐ 2025 年 12 月 12 日限量發售幾小時完售',
        '💼 汽車工藝與運動科技的極致結合',
      ],
      playStyle: '極致速度與未來科技感',
      source: 'Tesla & Selkirk Official Announcement',
    },
    {
      id: 'razer-joola',
      name: 'Razer x JOOLA',
      nameZh: '雷蛇電競聯名款',
      country: 'USA',
      ranking: '電競跨界聯名',
      paddle: {
        brand: 'JOOLA',
        model: 'Perseus Pro IV (Razer Ed.)',
        type: '控制型',
        weight: '8.0 oz (227g)',
        core: 'Polymer Honeycomb',
        surface: 'Carbon Friction (Razer Green)',
        price: '$299.95',
      },
      achievements: [
        '🐍 電競潮牌 Razer 跨界首作',
        '🎮 限量 1337 支 (LEET) 秒殺逸品',
        '⭐ 結合電競美學與世界冠軍球拍性能',
        '💼 2025 年 12 月 9 日限量發行',
      ],
      playStyle: '精準操控與電競潮流風格',
      source: 'Razer & JOOLA Official Collaboration',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mt-12">
      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sport-600 to-court-600">
          頂尖選手裝備
        </h2>
        <p className="text-center text-gray-600 mb-8">
          了解世界級選手使用的球拍 • 學習專業裝備選擇
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {worldPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100"
            >
              {/* 選手資訊 */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{player.name}</h3>
                    {player.nameZh && (
                      <p className="text-base text-gray-600">{player.nameZh}</p>
                    )}
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-2xl">{player.country === 'USA' ? '🇺🇸' : player.country === 'Canada' ? '🇨🇦' : '🇹🇼'}</span>
                      <span className="text-sm text-gray-600">{player.country}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-pickleball-100 to-sport-100 rounded-xl px-4 py-2">
                    <p className="text-xs text-gray-600 text-center">排名</p>
                    <p className="text-sm font-bold text-gray-800 text-center whitespace-nowrap">
                      {player.ranking.split('（')[0]}
                    </p>
                  </div>
                </div>

                {/* 成就 */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">🏆 主要成就：</p>
                  <ul className="space-y-1">
                    {player.achievements.map((achievement, index) => (
                      <li key={index} className="text-sm text-gray-700">{achievement}</li>
                    ))}
                  </ul>
                </div>

                {/* 打法風格 */}
                <div className="bg-sport-50 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">打法風格</p>
                  <p className="text-sm text-gray-800">{player.playStyle}</p>
                </div>
              </div>

              {/* 球拍資訊 */}
              <div className="bg-gradient-to-r from-pickleball-50 to-court-50 rounded-xl p-5 border-2 border-pickleball-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">🏓</span>
                  使用球拍
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">品牌</span>
                    <span className="text-base font-bold text-pickleball-700">{player.paddle.brand}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">型號</span>
                    <span className="text-sm font-semibold text-gray-800">{player.paddle.model}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">類型</span>
                    <span className="text-sm text-gray-800">{player.paddle.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">重量</span>
                    <span className="text-sm text-gray-800">{player.paddle.weight}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">核心</span>
                    <span className="text-sm text-gray-800">{player.paddle.core}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">表面</span>
                    <span className="text-sm text-gray-800">{player.paddle.surface}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-pickleball-200">
                    <span className="text-sm font-semibold text-gray-700">參考售價</span>
                    <span className="text-lg font-bold text-sport-600">{player.paddle.price}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 italic mt-4">{player.source}</p>
            </div>
          ))}
        </div>

        {/* 選購建議 */}
        <div className="mt-8 bg-gradient-to-br from-pickleball-50 to-white rounded-2xl p-6">
          <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
            <span className="text-2xl mr-2">💡</span>
            選購建議
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="mr-2">✓</span>
              <span>職業選手的裝備不一定適合所有人，請根據自己的打法和程度選擇</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">✓</span>
              <span>初學者建議從平衡型球拍開始，找到適合自己的風格後再升級</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">✓</span>
              <span>可以先試打看看，確認球拍的重量、握感和揮拍感覺</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">✓</span>
              <span>考慮預算和使用頻率，選擇性價比高的球拍</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProPlayerPaddles;
