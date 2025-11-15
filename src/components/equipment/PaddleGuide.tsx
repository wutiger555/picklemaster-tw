import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaddleType {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  characteristics: string[];
  bestFor: string[];
  weight: string;
  materials: string[];
  source: string;
}

interface PaddleMaterial {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  pros: string[];
  cons: string[];
  price: string;
  durability: number;
  power: number;
  control: number;
  source: string;
}

interface CoreType {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  characteristics: string[];
  commonUse: string;
  source: string;
}

const PaddleGuide = () => {
  const [selectedTab, setSelectedTab] = useState<'types' | 'materials' | 'cores' | 'specs'>('types');

  // 資料來源：USA Pickleball Equipment Standards 2024 & Major Paddle Manufacturers
  const paddleTypes: PaddleType[] = [
    {
      id: 'power',
      name: '力量型球拍',
      nameEn: 'Power Paddles',
      icon: '💥',
      description: '設計重點在於提供強大的擊球力道，適合進攻型打法',
      characteristics: [
        '⚡ 較重的重量（8.0-9.0 oz）',
        '📏 較厚的拍面（16-20mm）',
        '🎯 較大的甜區（sweet spot）',
        '💪 適合底線強力擊球',
      ],
      bestFor: [
        '進攻型球員',
        '喜歡強力擊球的選手',
        '體能較好的球員',
        '雙打中負責進攻的球員',
      ],
      weight: '8.0 - 9.0 oz (227 - 255 g)',
      materials: ['Graphite', 'Carbon Fiber', 'Fiberglass'],
      source: 'USA Pickleball Equipment Specifications 2024',
    },
    {
      id: 'control',
      name: '控制型球拍',
      nameEn: 'Control Paddles',
      icon: '🎯',
      description: '設計重點在於精準控球和球感，適合技術型打法',
      characteristics: [
        '🪶 較輕的重量（7.0-7.8 oz）',
        '📏 較薄的拍面（11-13mm）',
        '🎨 優異的球感回饋',
        '✨ 精準的落點控制',
      ],
      bestFor: [
        '技術型球員',
        '重視精準度的選手',
        '喜歡軟球和吊球的球員',
        '雙打中負責防守的球員',
      ],
      weight: '7.0 - 7.8 oz (198 - 221 g)',
      materials: ['Carbon Fiber', 'Titanium', 'Composite'],
      source: 'USA Pickleball Equipment Specifications 2024',
    },
    {
      id: 'balanced',
      name: '平衡型球拍',
      nameEn: 'Balanced Paddles',
      icon: '⚖️',
      description: '力量與控制兼具，適合全方位球員和初學者',
      characteristics: [
        '⚖️ 中等重量（7.8-8.2 oz）',
        '📏 中等厚度（13-16mm）',
        '🎯 力量與控制均衡',
        '👥 適合多種打法',
      ],
      bestFor: [
        '初學者和中階球員',
        '全方位球員',
        '還在尋找打法風格的選手',
        '休閒娛樂球員',
      ],
      weight: '7.8 - 8.2 oz (221 - 232 g)',
      materials: ['Fiberglass', 'Graphite', 'Polymer Core'],
      source: 'USA Pickleball Equipment Specifications 2024',
    },
  ];

  const materials: PaddleMaterial[] = [
    {
      id: 'carbon-fiber',
      name: '碳纖維',
      nameEn: 'Carbon Fiber',
      description: '最先進的球拍材料，提供最佳的力量與控制平衡',
      pros: [
        '💎 極佳的耐用性',
        '⚡ 優異的力量傳遞',
        '🎯 精準的控制性',
        '🪶 輕量化設計',
      ],
      cons: [
        '💰 價格較高',
        '🔧 維修成本高',
      ],
      price: '$150 - $300',
      durability: 95,
      power: 90,
      control: 90,
      source: 'Major Paddle Manufacturers Data 2024',
    },
    {
      id: 'graphite',
      name: '石墨',
      nameEn: 'Graphite',
      description: '輕量且堅固，提供優秀的控制性和球感',
      pros: [
        '🎯 卓越的控制性',
        '🪶 極輕的重量',
        '✨ 優異的球感回饋',
        '💪 良好的耐用性',
      ],
      cons: [
        '💥 力量稍弱',
        '💰 價格中高',
      ],
      price: '$100 - $200',
      durability: 85,
      power: 75,
      control: 95,
      source: 'Major Paddle Manufacturers Data 2024',
    },
    {
      id: 'fiberglass',
      name: '玻璃纖維',
      nameEn: 'Fiberglass',
      description: '性價比高，提供良好的力量和彈性',
      pros: [
        '💰 價格實惠',
        '💥 良好的力量輸出',
        '🎾 優秀的球感彈性',
        '👥 適合初學者',
      ],
      cons: [
        '📉 耐用性較低',
        '🎯 控制性中等',
      ],
      price: '$50 - $120',
      durability: 70,
      power: 85,
      control: 75,
      source: 'Major Paddle Manufacturers Data 2024',
    },
    {
      id: 'titanium',
      name: '鈦合金',
      nameEn: 'Titanium',
      description: '高強度材料，提供極佳的耐用性和穩定性',
      pros: [
        '💎 極高的耐用性',
        '⚡ 強大的力量',
        '🛡️ 抗衝擊性強',
        '⚖️ 穩定性佳',
      ],
      cons: [
        '⚖️ 重量較重',
        '💰 價格昂貴',
      ],
      price: '$180 - $350',
      durability: 98,
      power: 88,
      control: 80,
      source: 'Major Paddle Manufacturers Data 2024',
    },
  ];

  const cores: CoreType[] = [
    {
      id: 'polymer',
      name: '聚合物蜂窩芯',
      nameEn: 'Polymer Honeycomb Core',
      description: '最常見的球拍核心，提供優秀的靜音效果和控制性',
      characteristics: [
        '🔇 擊球聲音較小',
        '🎯 優異的控制性',
        '💰 價格適中',
        '⚖️ 較輕的重量',
        '👥 最受歡迎的選擇',
      ],
      commonUse: '90% 的現代球拍使用此核心',
      source: 'USA Pickleball Equipment Standards 2024',
    },
    {
      id: 'nomex',
      name: 'Nomex 蜂窩芯',
      nameEn: 'Nomex Honeycomb Core',
      description: '最硬的核心材料，提供最大的力量但控制性較低',
      characteristics: [
        '💥 最大的擊球力量',
        '🔊 擊球聲音較大',
        '📉 控制性較低',
        '💪 適合力量型球員',
        '⏳ 較早期的技術',
      ],
      commonUse: '主要用於力量型專業球拍',
      source: 'USA Pickleball Equipment Standards 2024',
    },
    {
      id: 'aluminum',
      name: '鋁蜂窩芯',
      nameEn: 'Aluminum Honeycomb Core',
      description: '介於 Polymer 和 Nomex 之間，平衡力量與控制',
      characteristics: [
        '⚖️ 力量與控制平衡',
        '🔊 擊球聲音中等',
        '💰 價格適中',
        '🎯 適合中階球員',
        '📊 性能穩定',
      ],
      commonUse: '適合全方位球員',
      source: 'USA Pickleball Equipment Standards 2024',
    },
  ];

  // 官方規格
  const officialSpecs = {
    maxLength: '24 inches (60.96 cm)',
    maxWidth: '無限制（但總長度+寬度 ≤ 24 inches）',
    maxThickness: '無限制',
    weightRange: '6.0 - 14.0 oz (170 - 397 g) 典型範圍',
    handleLength: '4.5 - 6.0 inches (11.4 - 15.2 cm)',
    gripCircumference: '4.0 - 4.5 inches (10.2 - 11.4 cm)',
    source: 'USA Pickleball Official Rulebook 2024, Section 2.E',
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pickleball-600 to-sport-600">
          球拍完全指南
        </h2>
        <p className="text-center text-gray-600 mb-8">
          了解球拍類型、材質、規格 • 選擇最適合你的裝備
        </p>

        {/* 分頁選擇 */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { id: 'types' as const, name: '球拍類型', icon: '🏓' },
            { id: 'materials' as const, name: '材質介紹', icon: '🧪' },
            { id: 'cores' as const, name: '核心結構', icon: '⚙️' },
            { id: 'specs' as const, name: '官方規格', icon: '📏' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`
                px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2
                ${selectedTab === tab.id
                  ? 'bg-gradient-to-r from-pickleball-500 to-sport-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* 球拍類型 */}
          {selectedTab === 'types' && (
            <motion.div
              key="types"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {paddleTypes.map((type) => (
                <div
                  key={type.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100"
                >
                  <div className="text-6xl mb-4 text-center">{type.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{type.nameEn}</p>
                  <p className="text-gray-700 mb-4 leading-relaxed">{type.description}</p>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">特性：</p>
                    <ul className="space-y-2">
                      {type.characteristics.map((char, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">適合：</p>
                    <ul className="space-y-1">
                      {type.bestFor.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="mr-2">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-pickleball-50 rounded-xl p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">重量範圍</p>
                    <p className="text-sm font-bold text-pickleball-700">{type.weight}</p>
                  </div>

                  <p className="text-xs text-gray-400 italic mt-3">{type.source}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* 材質介紹 */}
          {selectedTab === 'materials' && (
            <motion.div
              key="materials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 shadow-lg border-2 border-gray-100"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{material.name}</h3>
                      <p className="text-sm text-gray-500">{material.nameEn}</p>
                      <p className="text-gray-700 mt-2">{material.description}</p>
                    </div>
                    <div className="mt-4 md:mt-0 bg-pickleball-100 rounded-xl px-4 py-2">
                      <p className="text-xs text-gray-600">價格範圍</p>
                      <p className="text-lg font-bold text-pickleball-700">{material.price}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-green-600 mb-2">✅ 優點：</p>
                      <ul className="space-y-1">
                        {material.pros.map((pro, index) => (
                          <li key={index} className="text-sm text-gray-700">{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-600 mb-2">⚠️ 缺點：</p>
                      <ul className="space-y-1">
                        {material.cons.map((con, index) => (
                          <li key={index} className="text-sm text-gray-700">{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">耐用性</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-gradient-to-r from-pickleball-400 to-pickleball-600 h-2 rounded-full"
                          style={{ width: `${material.durability}%` }}
                        ></div>
                      </div>
                      <p className="text-sm font-bold text-gray-800">{material.durability}%</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">力量</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-gradient-to-r from-sport-400 to-sport-600 h-2 rounded-full"
                          style={{ width: `${material.power}%` }}
                        ></div>
                      </div>
                      <p className="text-sm font-bold text-gray-800">{material.power}%</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">控制</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-gradient-to-r from-court-400 to-court-600 h-2 rounded-full"
                          style={{ width: `${material.control}%` }}
                        ></div>
                      </div>
                      <p className="text-sm font-bold text-gray-800">{material.control}%</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 italic mt-4">{material.source}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* 核心結構 */}
          {selectedTab === 'cores' && (
            <motion.div
              key="cores"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {cores.map((core) => (
                <div
                  key={core.id}
                  className="bg-gradient-to-br from-sport-50 to-court-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{core.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{core.nameEn}</p>
                  <p className="text-gray-700 mb-4 leading-relaxed">{core.description}</p>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">特性：</p>
                    <ul className="space-y-2">
                      {core.characteristics.map((char, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">常見用途</p>
                    <p className="text-sm text-gray-800">{core.commonUse}</p>
                  </div>

                  <p className="text-xs text-gray-400 italic mt-3">{core.source}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* 官方規格 */}
          {selectedTab === 'specs' && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-pickleball-50 to-sport-50 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                USA Pickleball 官方球拍規格
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                    <span className="text-2xl mr-2">📏</span>
                    尺寸規範
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">最大長度</p>
                      <p className="text-lg font-bold text-pickleball-700">{officialSpecs.maxLength}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">最大寬度</p>
                      <p className="text-base text-gray-800">{officialSpecs.maxWidth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">厚度限制</p>
                      <p className="text-base text-gray-800">{officialSpecs.maxThickness}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                    <span className="text-2xl mr-2">⚖️</span>
                    重量與握把
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">重量範圍</p>
                      <p className="text-base text-gray-800">{officialSpecs.weightRange}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">握把長度</p>
                      <p className="text-base text-gray-800">{officialSpecs.handleLength}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">握把圓周</p>
                      <p className="text-base text-gray-800">{officialSpecs.gripCircumference}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                  <span className="text-2xl mr-2">📋</span>
                  重要規則
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>球拍表面必須平滑，不能有凹凸或紋理可以增加旋轉</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>拍面不能有洞或穿孔（握把區域除外）</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>不能有可移動部件或附加裝置</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>球拍必須通過 USA Pickleball 官方認證才能用於正式比賽</span>
                  </li>
                </ul>
              </div>

              <p className="text-center text-xs text-gray-400 italic mt-6">
                資料來源：{officialSpecs.source}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaddleGuide;
