import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CourtArea {
  id: string;
  name: string;
  description: string;
  rules: string[];
  measurements?: string;
  source: string;
}

const InteractiveCourt = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  // 資料來源：USA Pickleball Official Rulebook 2024
  const courtAreas: CourtArea[] = [
    {
      id: 'kitchen',
      name: '非截擊區（廚房區）The Kitchen / Non-Volley Zone',
      description: '球網兩側各 7 英尺（2.13 公尺）的區域',
      measurements: '深度：7 英尺（2.13 公尺）｜寬度：20 英尺（6.10 公尺）',
      rules: [
        '❌ 不能在此區域內截擊（volley）球',
        '✅ 球彈地後可以進入此區擊球',
        '⚠️ 雙腳不能碰觸非截擊區線',
        '⚠️ 球拍和身體任何部位都不能接觸此區域',
        '🏃 截擊後的慣性動作如果讓你踏入此區也算犯規',
        '✅ 必須重新建立站位（雙腳觸地於區外）才能再次截擊',
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 9',
    },
    {
      id: 'service-even',
      name: '偶數發球區（右側發球區）',
      description: '當發球方分數為偶數（0, 2, 4...）時的發球區',
      measurements: '長度：15 英尺（4.57 公尺）｜寬度：10 英尺（3.05 公尺）',
      rules: [
        '📍 分數為 0, 2, 4, 6, 8, 10... 時從此區發球',
        '↗️ 必須對角線發到對方偶數發球區',
        '✅ 發球必須越過非截擊區線（Kitchen Line）',
        '❌ 觸碰非截擊區線算短球犯規',
        '🦶 發球時至少一隻腳必須在底線後',
        '✅ 發球必須落在對方發球區內（不含邊線和底線）',
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 4',
    },
    {
      id: 'service-odd',
      name: '奇數發球區（左側發球區）',
      description: '當發球方分數為奇數（1, 3, 5...）時的發球區',
      measurements: '長度：15 英尺（4.57 公尺）｜寬度：10 英尺（3.05 公尺）',
      rules: [
        '📍 分數為 1, 3, 5, 7, 9, 11... 時從此區發球',
        '↗️ 必須對角線發到對方奇數發球區',
        '✅ 發球必須越過非截擊區線（Kitchen Line）',
        '❌ 觸碰非截擊區線算短球犯規',
        '🦶 發球時至少一隻腳必須在底線後',
        '✅ 發球必須落在對方發球區內（不含邊線和底線）',
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 4',
    },
    {
      id: 'baseline',
      name: '底線區（Baseline Area）',
      description: '球場後方的擊球區域',
      measurements: '底線寬度：20 英尺（6.10 公尺）',
      rules: [
        '🎾 發球時站在此區域後方',
        '✅ 發球時至少一隻腳必須觸地且在底線後',
        '❌ 發球時腳不能觸碰底線',
        '🏃 大部分對打和防守在此進行',
        '💪 需要良好的體能和移動能力',
        '🎯 深球（Deep Shot）通常瞄準對方底線',
      ],
      source: 'USA Pickleball Official Rulebook 2024',
    },
    {
      id: 'sideline',
      name: '邊線（Sideline）',
      description: '球場兩側的邊界線',
      measurements: '長度：44 英尺（13.41 公尺）',
      rules: [
        '✅ 球觸碰邊線算界內',
        '❌ 球完全越過邊線算出界',
        '👥 雙打時可使用完整球場寬度',
        '🎯 邊線球是有效的進攻策略',
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 2',
    },
    {
      id: 'centerline',
      name: '中線（Centerline）',
      description: '將發球區一分為二的中央線',
      measurements: '從底線延伸至非截擊區線',
      rules: [
        '✅ 球觸碰中線算界內',
        '📍 用於區分偶數和奇數發球區',
        '🎯 發球時瞄準中線可減少對手回擊角度',
      ],
      source: 'USA Pickleball Official Rulebook 2024',
    },
  ];

  const getAreaInfo = (id: string) => {
    return courtAreas.find((area) => area.id === id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pickleball-600 to-sport-600">
          互動式匹克球場
        </h2>
        <p className="text-center text-sm text-gray-500 mb-2">
          資料來源：USA Pickleball Official Rulebook 2024
        </p>
        <p className="text-center text-gray-600 mb-8">
          Hover 球場區域即時查看規則 • 點擊展開完整資訊
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 球場SVG */}
          <div className="lg:col-span-2 relative">
          {/* SVG 球場 - 正確的俯視圖 */}
          <svg
            viewBox="0 0 240 480"
            className="w-full h-auto max-w-md mx-auto border-2 border-gray-300 rounded-lg shadow-lg"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 球場背景 */}
            <rect x="0" y="0" width="240" height="480" fill="#15803d" />

            {/* 球場外框 - 20英尺寬 x 44英尺長 */}
            <rect
              x="20"
              y="20"
              width="200"
              height="440"
              fill="none"
              stroke="white"
              strokeWidth="3"
            />

            {/* ===== 上半場（近端）===== */}

            {/* 上半場中線 - 從底線到廚房區 */}
            <g
              className="cursor-help transition-all duration-300"
              onMouseEnter={() => setHoveredArea('centerline')}
              onMouseLeave={() => setHoveredArea(null)}
              onClick={() => setSelectedArea('centerline')}
            >
              <line
                x1="120"
                y1="20"
                x2="120"
                y2="171"
                stroke={hoveredArea === 'centerline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'centerline' ? '3' : '2'}
                strokeDasharray="10,5"
              />
            </g>

            {/* 上半場偶數發球區（右側，從底線往球網看） */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('service-even')}
              onMouseEnter={() => setHoveredArea('service-even')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="120"
                y="20"
                width="100"
                height="151"
                fill={
                  hoveredArea === 'service-even' || selectedArea === 'service-even'
                    ? 'rgba(96, 165, 250, 0.5)'
                    : 'rgba(96, 165, 250, 0.2)'
                }
                stroke={hoveredArea === 'service-even' ? '#60a5fa' : 'transparent'}
                strokeWidth="2"
              />
              {hoveredArea === 'service-even' && (
                <text x="170" y="100" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  偶數
                </text>
              )}
            </g>

            {/* 上半場奇數發球區（左側，從底線往球網看） */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('service-odd')}
              onMouseEnter={() => setHoveredArea('service-odd')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="20"
                y="20"
                width="100"
                height="151"
                fill={
                  hoveredArea === 'service-odd' || selectedArea === 'service-odd'
                    ? 'rgba(74, 222, 128, 0.5)'
                    : 'rgba(74, 222, 128, 0.2)'
                }
                stroke={hoveredArea === 'service-odd' ? '#4ade80' : 'transparent'}
                strokeWidth="2"
              />
              {hoveredArea === 'service-odd' && (
                <text x="70" y="100" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  奇數
                </text>
              )}
            </g>

            {/* 上半場廚房區線 */}
            <line x1="20" y1="171" x2="220" y2="171" stroke="white" strokeWidth="2" />

            {/* 上半場廚房區（非截擊區）- 7英尺 */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('kitchen')}
              onMouseEnter={() => setHoveredArea('kitchen')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="20"
                y="171"
                width="200"
                height="69"
                fill={
                  hoveredArea === 'kitchen' || selectedArea === 'kitchen'
                    ? 'rgba(251, 191, 36, 0.5)'
                    : 'rgba(251, 191, 36, 0.25)'
                }
                stroke={hoveredArea === 'kitchen' ? '#fbbf24' : 'transparent'}
                strokeWidth="2"
              />
              {hoveredArea === 'kitchen' && (
                <text x="120" y="210" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  廚房區
                </text>
              )}
            </g>

            {/* ===== 球網 - 在正中央 ===== */}
            <g>
              <line x1="20" y1="240" x2="220" y2="240" stroke="white" strokeWidth="5" />
              <line x1="20" y1="238" x2="220" y2="238" stroke="#666" strokeWidth="1" />
              <line x1="20" y1="242" x2="220" y2="242" stroke="#666" strokeWidth="1" />
              <circle cx="120" cy="240" r="8" fill="white" stroke="#333" strokeWidth="2" />
              <text x="120" y="244" textAnchor="middle" fill="#333" fontSize="10" fontWeight="bold">
                網
              </text>
            </g>

            {/* ===== 下半場（遠端）===== */}

            {/* 下半場廚房區（非截擊區）- 7英尺 */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('kitchen')}
              onMouseEnter={() => setHoveredArea('kitchen')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="20"
                y="240"
                width="200"
                height="69"
                fill={
                  hoveredArea === 'kitchen' || selectedArea === 'kitchen'
                    ? 'rgba(251, 191, 36, 0.5)'
                    : 'rgba(251, 191, 36, 0.25)'
                }
                stroke={hoveredArea === 'kitchen' ? '#fbbf24' : 'transparent'}
                strokeWidth="2"
              />
              {hoveredArea === 'kitchen' && (
                <text x="120" y="280" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  廚房區
                </text>
              )}
            </g>

            {/* 下半場廚房區線 */}
            <line x1="20" y1="309" x2="220" y2="309" stroke="white" strokeWidth="2" />

            {/* 下半場中線 - 從廚房區到底線 */}
            <g
              className="cursor-help transition-all duration-300"
              onMouseEnter={() => setHoveredArea('centerline')}
              onMouseLeave={() => setHoveredArea(null)}
              onClick={() => setSelectedArea('centerline')}
            >
              <line
                x1="120"
                y1="309"
                x2="120"
                y2="460"
                stroke={hoveredArea === 'centerline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'centerline' ? '3' : '2'}
                strokeDasharray="10,5"
              />
            </g>

            {/* 下半場奇數發球區（左側 - 鏡像後變成右側） */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('service-odd')}
              onMouseEnter={() => setHoveredArea('service-odd')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="120"
                y="309"
                width="100"
                height="151"
                fill={
                  hoveredArea === 'service-odd' || selectedArea === 'service-odd'
                    ? 'rgba(74, 222, 128, 0.5)'
                    : 'rgba(74, 222, 128, 0.2)'
                }
                stroke={hoveredArea === 'service-odd' ? '#4ade80' : 'transparent'}
                strokeWidth="2"
              />
              {hoveredArea === 'service-odd' && (
                <text x="170" y="385" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  奇數
                </text>
              )}
            </g>

            {/* 下半場偶數發球區（右側 - 鏡像後變成左側） */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('service-even')}
              onMouseEnter={() => setHoveredArea('service-even')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="20"
                y="309"
                width="100"
                height="151"
                fill={
                  hoveredArea === 'service-even' || selectedArea === 'service-even'
                    ? 'rgba(96, 165, 250, 0.5)'
                    : 'rgba(96, 165, 250, 0.2)'
                }
                stroke={hoveredArea === 'service-even' ? '#60a5fa' : 'transparent'}
                strokeWidth="2"
              />
              {hoveredArea === 'service-even' && (
                <text x="70" y="385" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  偶數
                </text>
              )}
            </g>

            {/* 邊線標註 */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedArea('sideline')}
              onMouseEnter={() => setHoveredArea('sideline')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <line
                x1="20"
                y1="20"
                x2="20"
                y2="460"
                stroke={hoveredArea === 'sideline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'sideline' ? '5' : '3'}
              />
              <line
                x1="220"
                y1="20"
                x2="220"
                y2="460"
                stroke={hoveredArea === 'sideline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'sideline' ? '5' : '3'}
              />
            </g>

            {/* 底線標註 */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedArea('baseline')}
              onMouseEnter={() => setHoveredArea('baseline')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <line
                x1="20"
                y1="20"
                x2="220"
                y2="20"
                stroke={hoveredArea === 'baseline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'baseline' ? '5' : '3'}
              />
              <line
                x1="20"
                y1="460"
                x2="220"
                y2="460"
                stroke={hoveredArea === 'baseline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'baseline' ? '5' : '3'}
              />
            </g>

            {/* 尺寸標註 */}
            <text x="230" y="95" fill="white" fontSize="10" fontWeight="bold">
              15'
            </text>
            <text x="230" y="210" fill="white" fontSize="10" fontWeight="bold">
              7'
            </text>
            <text x="230" y="280" fill="white" fontSize="10" fontWeight="bold">
              7'
            </text>
            <text x="230" y="385" fill="white" fontSize="10" fontWeight="bold">
              15'
            </text>
            <text x="120" y="15" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
              20' (6.10m)
            </text>
            <text x="10" y="240" fill="white" fontSize="10" fontWeight="bold" transform="rotate(-90 10 240)">
              44' (13.41m)
            </text>
          </svg>

            {/* 尺寸說明 */}
            <div className="mt-4 text-sm text-gray-600 text-center space-y-1">
              <p>球場總長度：44 英尺 (13.41m) ｜ 球場總寬度：20 英尺 (6.10m)</p>
              <p className="text-xs">廚房區：7 英尺 ｜ 發球區：15 英尺 ｜ 球網高度：中央 34"（86cm）、兩側 36"（91cm）</p>
            </div>
          </div>

          {/* 側邊即時資訊面板 */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {hoveredArea || selectedArea ? (
                <motion.div
                  key={hoveredArea || selectedArea}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gradient-to-br from-pickleball-50 to-sport-50 rounded-2xl p-6 border-2 border-pickleball-200 sticky top-24 max-h-[600px] overflow-y-auto"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {getAreaInfo(hoveredArea || selectedArea!)?.name}
                    </h3>
                    {selectedArea && (
                      <button
                        onClick={() => setSelectedArea(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                    {getAreaInfo(hoveredArea || selectedArea!)?.description}
                  </p>

                  {getAreaInfo(hoveredArea || selectedArea!)?.measurements && (
                    <p className="text-sm text-sport-600 font-semibold mb-3 bg-white rounded-lg p-2">
                      📏 {getAreaInfo(hoveredArea || selectedArea!)?.measurements}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-gray-700 text-sm">官方規則說明：</h4>
                    {getAreaInfo(hoveredArea || selectedArea!)?.rules.map((rule, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start space-x-2 bg-white rounded-lg p-2 shadow-sm text-sm"
                      >
                        <span className="text-base flex-shrink-0">{rule.split(' ')[0]}</span>
                        <span className="text-gray-700">{rule.substring(rule.indexOf(' ') + 1)}</span>
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-300">
                    📚 資料來源：{getAreaInfo(hoveredArea || selectedArea!)?.source}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-300 h-64 flex items-center justify-center"
                >
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">將滑鼠移到球場區域</p>
                    <p className="text-xs mt-1">即時查看規則說明</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 圖例 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-400 rounded"></div>
            <span className="text-sm text-gray-700">非截擊區（廚房）</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-400 rounded"></div>
            <span className="text-sm text-gray-700">偶數發球區（右）</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-400 rounded"></div>
            <span className="text-sm text-gray-700">奇數發球區（左）</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white border-2 border-gray-400 rounded"></div>
            <span className="text-sm text-gray-700">球場邊界</span>
          </div>
        </div>

        {/* 重要提示 */}
        <div className="mt-6 bg-gradient-to-r from-pickleball-100 to-sport-100 rounded-xl p-4">
          <h4 className="font-bold text-gray-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            重要提醒
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• 所有規則以 USA Pickleball Official Rulebook 2024 為準</li>
            <li>• 球觸碰線算界內（包括邊線、底線、中線）</li>
            <li>• 非截擊區線被視為非截擊區的一部分</li>
            <li>• 發球時球觸碰非截擊區線算短球犯規</li>
            <li>• 偶數區在右側、奇數區在左側（從底線往球網看）</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCourt;
