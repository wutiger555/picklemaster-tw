import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CourtArea {
  id: string;
  name: string;
  description: string;
  rules: string[];
}

const InteractiveCourt = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  const courtAreas: CourtArea[] = [
    {
      id: 'kitchen-left',
      name: '非截擊區 (廚房區)',
      description: '靠近球網的 7 英尺區域',
      rules: [
        '❌ 不能在此區內截擊球',
        '✅ 球彈地後可進入擊球',
        '⚠️ 雙腳不能碰線',
      ],
    },
    {
      id: 'service-even',
      name: '偶數發球區',
      description: '分數為偶數時的發球區',
      rules: [
        '📍 分數 0, 2, 4... 時發球',
        '↗️ 對角線發到對方偶數區',
        '🦶 至少一腳在發球區後',
      ],
    },
    {
      id: 'service-odd',
      name: '奇數發球區',
      description: '分數為奇數時的發球區',
      rules: [
        '📍 分數 1, 3, 5... 時發球',
        '↗️ 對角線發到對方奇數區',
      ],
    },
    {
      id: 'baseline',
      name: '底線區',
      description: '球場後方區域',
      rules: [
        '🎾 發球時站在此區',
        '🏃 大部分對打在此進行',
        '💪 需要較強的體能',
      ],
    },
  ];

  const getAreaInfo = (id: string) => {
    return courtAreas.find((area) => area.id === id);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pickleball-600 to-sport-600">
          互動式匹克球場
        </h2>
        <p className="text-center text-gray-600 mb-8">
          點擊球場區域了解規則 • 將滑鼠移到線條上查看尺寸
        </p>

        <div className="relative">
          {/* SVG 球場 */}
          <svg
            viewBox="0 0 440 200"
            className="w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 球場背景 */}
            <rect
              x="0"
              y="0"
              width="440"
              height="200"
              fill="#15803d"
              className="transition-all duration-300"
            />

            {/* 球場邊框 */}
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
            <line
              x1="220"
              y1="20"
              x2="220"
              y2="180"
              stroke="white"
              strokeWidth="2"
              className="cursor-help hover:stroke-pickleball-400 transition-colors"
              onMouseEnter={() => setHoveredArea('centerline')}
              onMouseLeave={() => setHoveredArea(null)}
            />

            {/* 左側非截擊區 (廚房區) */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('kitchen-left')}
              onMouseEnter={() => setHoveredArea('kitchen-left')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="20"
                y="20"
                width="70"
                height="160"
                fill={
                  hoveredArea === 'kitchen-left' || selectedArea === 'kitchen-left'
                    ? 'rgba(251, 191, 36, 0.5)'
                    : 'rgba(251, 191, 36, 0.2)'
                }
                stroke={
                  hoveredArea === 'kitchen-left' || selectedArea === 'kitchen-left'
                    ? '#fbbf24'
                    : 'white'
                }
                strokeWidth="2"
              />
              <line x1="90" y1="20" x2="90" y2="180" stroke="white" strokeWidth="2" />
            </g>

            {/* 右側非截擊區 (廚房區) */}
            <g
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedArea('kitchen-left')}
              onMouseEnter={() => setHoveredArea('kitchen-left')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <rect
                x="350"
                y="20"
                width="70"
                height="160"
                fill={
                  hoveredArea === 'kitchen-left' || selectedArea === 'kitchen-left'
                    ? 'rgba(251, 191, 36, 0.5)'
                    : 'rgba(251, 191, 36, 0.2)'
                }
                stroke={
                  hoveredArea === 'kitchen-left' || selectedArea === 'kitchen-left'
                    ? '#fbbf24'
                    : 'white'
                }
                strokeWidth="2"
              />
              <line x1="350" y1="20" x2="350" y2="180" stroke="white" strokeWidth="2" />
            </g>

            {/* 左側偶數發球區 */}
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
            </g>

            {/* 左側奇數發球區 */}
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
            </g>

            {/* 球網 */}
            <line
              x1="20"
              y1="100"
              x2="420"
              y2="100"
              stroke="white"
              strokeWidth="4"
              strokeDasharray="5,5"
            />
            <circle cx="220" cy="100" r="6" fill="white" />

            {/* 標註文字 */}
            {hoveredArea === 'centerline' && (
              <text
                x="220"
                y="15"
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                中線
              </text>
            )}
          </svg>

          {/* Hover Tooltip */}
          <AnimatePresence>
            {hoveredArea && hoveredArea !== 'centerline' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 max-w-xs"
              >
                <p className="text-sm font-semibold text-gray-800">
                  {getAreaInfo(hoveredArea)?.name}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  點擊查看詳細規則
                </p>
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
                  <p className="text-gray-600 mt-1">
                    {getAreaInfo(selectedArea)?.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedArea(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 mb-2">規則說明：</h4>
                {getAreaInfo(selectedArea)?.rules.map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 bg-white rounded-lg p-3 shadow-sm"
                  >
                    <span className="text-lg">{rule.split(' ')[0]}</span>
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
            <span className="text-sm text-gray-700">非截擊區</span>
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
            <div className="w-6 h-6 bg-court-700 rounded"></div>
            <span className="text-sm text-gray-700">底線區</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCourt;
