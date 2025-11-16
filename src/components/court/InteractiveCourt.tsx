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
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pickleball-600 to-sport-600">
          互動式匹克球場
        </h2>
        <p className="text-center text-sm text-gray-500 mb-2">
          資料來源：USA Pickleball Official Rulebook 2024
        </p>
        <p className="text-center text-gray-600 mb-8">
          點擊球場區域了解詳細規則 • Hover 查看區域名稱
        </p>

        <div className="relative">
          {/* 球場尺寸標註 */}
          <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
            <span>← 20 英尺 (6.10 公尺) →</span>
          </div>

          {/* SVG 球場 */}
          <svg
            viewBox="0 0 440 200"
            className="w-full h-auto border-2 border-gray-300 rounded-lg"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 球場背景 */}
            <rect x="0" y="0" width="440" height="200" fill="#15803d" />

            {/* 球場外框 */}
            <rect
              x="20"
              y="20"
              width="400"
              height="160"
              fill="none"
              stroke="white"
              strokeWidth="3"
            />

            {/* 中線 */}
            <g
              className="cursor-help transition-all duration-300"
              onMouseEnter={() => setHoveredArea('centerline')}
              onMouseLeave={() => setHoveredArea(null)}
              onClick={() => setSelectedArea('centerline')}
            >
              <line
                x1="220"
                y1="20"
                x2="220"
                y2="87"
                stroke={hoveredArea === 'centerline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'centerline' ? '3' : '2'}
              />
              <line
                x1="220"
                y1="113"
                x2="220"
                y2="180"
                stroke={hoveredArea === 'centerline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'centerline' ? '3' : '2'}
              />
            </g>

            {/* 左側非截擊區 */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('kitchen')}
              onMouseEnter={() => setHoveredArea('kitchen')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="20"
                y="20"
                width="70"
                height="160"
                fill={
                  hoveredArea === 'kitchen' || selectedArea === 'kitchen'
                    ? 'rgba(251, 191, 36, 0.5)'
                    : 'rgba(251, 191, 36, 0.2)'
                }
                stroke={hoveredArea === 'kitchen' || selectedArea === 'kitchen' ? '#fbbf24' : 'white'}
                strokeWidth="2"
              />
              <line x1="90" y1="20" x2="90" y2="180" stroke="white" strokeWidth="2" />
              {hoveredArea === 'kitchen' && (
                <text x="55" y="105" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  廚房區
                </text>
              )}
            </g>

            {/* 右側非截擊區 */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('kitchen')}
              onMouseEnter={() => setHoveredArea('kitchen')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="350"
                y="20"
                width="70"
                height="160"
                fill={
                  hoveredArea === 'kitchen' || selectedArea === 'kitchen'
                    ? 'rgba(251, 191, 36, 0.5)'
                    : 'rgba(251, 191, 36, 0.2)'
                }
                stroke={hoveredArea === 'kitchen' || selectedArea === 'kitchen' ? '#fbbf24' : 'white'}
                strokeWidth="2"
              />
              <line x1="350" y1="20" x2="350" y2="180" stroke="white" strokeWidth="2" />
              {hoveredArea === 'kitchen' && (
                <text x="385" y="105" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  廚房區
                </text>
              )}
            </g>

            {/* 左側偶數發球區（右側） */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('service-even')}
              onMouseEnter={() => setHoveredArea('service-even')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="90"
                y="20"
                width="130"
                height="80"
                fill={
                  hoveredArea === 'service-even' || selectedArea === 'service-even'
                    ? 'rgba(96, 165, 250, 0.4)'
                    : 'rgba(96, 165, 250, 0.15)'
                }
              />
              {hoveredArea === 'service-even' && (
                <text x="155" y="65" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  偶數發球區
                </text>
              )}
            </g>

            {/* 左側奇數發球區（左側） */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('service-odd')}
              onMouseEnter={() => setHoveredArea('service-odd')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="90"
                y="100"
                width="130"
                height="80"
                fill={
                  hoveredArea === 'service-odd' || selectedArea === 'service-odd'
                    ? 'rgba(74, 222, 128, 0.4)'
                    : 'rgba(74, 222, 128, 0.15)'
                }
              />
              {hoveredArea === 'service-odd' && (
                <text x="155" y="145" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  奇數發球區
                </text>
              )}
            </g>

            {/* 右側偶數發球區 */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('service-even')}
              onMouseEnter={() => setHoveredArea('service-even')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="220"
                y="20"
                width="130"
                height="80"
                fill={
                  hoveredArea === 'service-even' || selectedArea === 'service-even'
                    ? 'rgba(96, 165, 250, 0.4)'
                    : 'rgba(96, 165, 250, 0.15)'
                }
              />
              {hoveredArea === 'service-even' && (
                <text x="285" y="65" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  偶數發球區
                </text>
              )}
            </g>

            {/* 右側奇數發球區 */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('service-odd')}
              onMouseEnter={() => setHoveredArea('service-odd')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="220"
                y="100"
                width="130"
                height="80"
                fill={
                  hoveredArea === 'service-odd' || selectedArea === 'service-odd'
                    ? 'rgba(74, 222, 128, 0.4)'
                    : 'rgba(74, 222, 128, 0.15)'
                }
              />
              {hoveredArea === 'service-odd' && (
                <text x="285" y="145" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  奇數發球區
                </text>
              )}
            </g>

            {/* 球網 */}
            <line x1="20" y1="100" x2="420" y2="100" stroke="white" strokeWidth="4" strokeDasharray="5,5" />
            <circle cx="220" cy="100" r="6" fill="white" />
            <text x="220" y="195" textAnchor="middle" fill="white" fontSize="10">
              球網高度：中央 34"（86cm）｜兩側 36"（91cm）
            </text>

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
                x2="20"
                y2="180"
                stroke={hoveredArea === 'baseline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'baseline' ? '5' : '3'}
              />
              <line
                x1="420"
                y1="20"
                x2="420"
                y2="180"
                stroke={hoveredArea === 'baseline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'baseline' ? '5' : '3'}
              />
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
                x2="420"
                y2="20"
                stroke={hoveredArea === 'sideline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'sideline' ? '5' : '3'}
              />
              <line
                x1="20"
                y1="180"
                x2="420"
                y2="180"
                stroke={hoveredArea === 'sideline' ? '#fbbf24' : 'white'}
                strokeWidth={hoveredArea === 'sideline' ? '5' : '3'}
              />
            </g>

            {/* 尺寸標註 */}
            <text x="10" y="105" fill="white" fontSize="10" transform="rotate(-90 10 105)">
              44' (13.41m)
            </text>
            <text x="55" y="15" textAnchor="middle" fill="white" fontSize="10">
              7'
            </text>
          </svg>

          {/* 尺寸說明 */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            球場總長度：44 英尺 (13.41m) ｜ 球場總寬度：20 英尺 (6.10m)
          </div>

          {/* Hover Tooltip */}
          <AnimatePresence>
            {hoveredArea && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 max-w-xs z-10"
              >
                <p className="text-sm font-semibold text-gray-800">
                  {getAreaInfo(hoveredArea)?.name}
                </p>
                <p className="text-xs text-gray-600 mt-1">點擊查看詳細規則</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 選中區域的詳細資訊 */}
        <AnimatePresence>
          {selectedArea && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-gradient-to-br from-pickleball-50 to-sport-50 rounded-2xl p-6 border-2 border-pickleball-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {getAreaInfo(selectedArea)?.name}
                  </h3>
                  <p className="text-gray-600 mt-1">{getAreaInfo(selectedArea)?.description}</p>
                  {getAreaInfo(selectedArea)?.measurements && (
                    <p className="text-sm text-sport-600 font-semibold mt-2">
                      📏 {getAreaInfo(selectedArea)?.measurements}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    📚 資料來源：{getAreaInfo(selectedArea)?.source}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedArea(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 mb-2">官方規則說明：</h4>
                {getAreaInfo(selectedArea)?.rules.map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 bg-white rounded-lg p-3 shadow-sm"
                  >
                    <span className="text-lg flex-shrink-0">{rule.split(' ')[0]}</span>
                    <span className="text-gray-700">{rule.substring(rule.indexOf(' ') + 1)}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 圖例 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-pickleball-400 rounded"></div>
            <span className="text-sm text-gray-700">非截擊區（廚房）</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-sport-400 rounded"></div>
            <span className="text-sm text-gray-700">偶數發球區</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-court-400 rounded"></div>
            <span className="text-sm text-gray-700">奇數發球區</span>
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
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCourt;
