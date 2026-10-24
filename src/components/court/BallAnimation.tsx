import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimationStep {
  name: string;
  description: string;
  position: { x: number; y: number };
  regulations: string[];
  serverPosition?: { x: number; y: number };
  highlightZones?: string[];
  source?: string;
}

const BallAnimation = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 資料來源：USA Pickleball Official Rulebook 2024
  // 球場座標系統：240x480 SVG
  // - 球場範圍：x=20~220 (寬200), y=20~460 (高440)
  // - 球網中線：y=240
  // - 上半場：y=20~240 (頂線y=20, 廚房線y=171)
  // - 下半場：y=240~460 (廚房線y=309, 底線y=460)
  // - 左右分界：x=120 (左側x=20~120, 右側x=120~220)
  const steps: AnimationStep[] = [
    {
      name: '發球準備',
      description: '發球方站在底線後，準備對角線發球',
      position: { x: 170, y: 440 },
      serverPosition: { x: 170, y: 440 },
      highlightZones: ['baseline-server', 'service-target-even'],
      regulations: [
        '🦶 至少一隻腳必須在底線後方',
        '❌ 不能踩踏或越過底線',
        '↗️ 必須對角線發球到對方發球區',
        '🎯 發球方站在偶數區（右側）',
        '✋ 必須使用下手發球（underhand）',
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 4.A',
    },
    {
      name: '發球擊球',
      description: '由下往上擊球，球必須斜對角越過廚房區',
      position: { x: 120, y: 260 },
      serverPosition: { x: 170, y: 440 },
      highlightZones: ['kitchen-zone', 'service-target-even'],
      regulations: [
        '🎯 擊球點必須低於腰部',
        '📐 球拍面必須由下往上揮動',
        '⚠️ 球必須越過非截擊區線（廚房線）',
        '❌ 觸碰廚房線算短球犯規',
        '✅ 球必須在空中越過球網',
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 4.A.5-7',
    },
    {
      name: '發球落點',
      description: '球斜對角落在對方左側偶數發球區內',
      position: { x: 70, y: 90 },
      serverPosition: { x: 170, y: 440 },
      highlightZones: ['service-target-even'],
      regulations: [
        '✅ 球必須落在對方對角發球區內',
        '❌ 壓線算出界（發球時）',
        '📍 必須落在邊線和底線內',
        '⚠️ 超過底線或邊線算失誤',
        '🎯 不能觸碰廚房區',
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 4.B',
    },
    {
      name: '接發球',
      description: '接發球方必須等球彈地後才能擊球',
      position: { x: 70, y: 90 },
      highlightZones: ['service-target-even'],
      regulations: [
        '⏱️ 必須等球彈地後才能擊球',
        '❌ 不能在空中截擊發球（volley）',
        '✅ 這是「雙彈地規則」的第一彈',
        '🎯 接發球後可以選擇任何回球方式',
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 4.H',
    },
    {
      name: '第三球回擊',
      description: '發球方必須等球彈地後才能擊球（雙彈地規則）',
      position: { x: 70, y: 380 },
      highlightZones: [],
      regulations: [
        '⏱️ 發球方也必須等球彈地後擊球',
        '❌ 這是「雙彈地規則」的第二彈',
        '✅ 之後雙方可以自由截擊或擊地球',
        '🎯 通常發球方會打高球準備上網',
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 7.A',
    },
    {
      name: '截擊得分',
      description: '在廚房區外截擊，球落在對方場內得分',
      position: { x: 100, y: 320 },
      highlightZones: ['kitchen-zone'],
      regulations: [
        '✅ 雙彈地規則後可以自由截擊',
        '❌ 但不能站在廚房區內截擊',
        '⚠️ 慣性動作踏入廚房區也算犯規',
        '🏆 球落在對方場內得分',
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 9',
    },
  ];

  const playAnimation = () => {
    setIsPlaying(true);
    setCurrentStep(0);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (currentStep === steps.length - 1) {
      setTimeout(() => setIsPlaying(false), 1000);
    }
  }, [isPlaying, currentStep, steps.length]);

  // 檢查是否應該高亮某個區域
  const shouldHighlight = (zoneId: string) => {
    if (!isPlaying) return false;
    return steps[currentStep].highlightZones?.includes(zoneId) || false;
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-12">
      <div className="bg-gradient-to-br from-sport-50 to-court-50 rounded-3xl shadow-2xl p-4 md:p-8">
        <h3 className="text-3xl font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sport-600 to-court-600">
          球路徑動畫演示
        </h3>
        <p className="text-center text-gray-600 mb-4">
          觀看完整的發球到得分過程 • 了解每一步的規範與限制
        </p>
        <p className="text-center text-sm text-gray-500 mb-6">
          資料來源：USA Pickleball Official Rulebook 2024
        </p>

        <div className="relative">
          <svg
            viewBox="0 0 240 480"
            className="w-full h-auto max-w-sm mx-auto bg-court-700 rounded-2xl"
            style={{ maxHeight: '65vh' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 球場外框 - 正確的俯視圖 (20' x 44') */}
            <rect x="20" y="20" width="200" height="440" fill="none" stroke="white" strokeWidth="3" />

            {/* 球網（中線）*/}
            <line x1="20" y1="240" x2="220" y2="240" stroke="white" strokeWidth="4" />

            {/* 上半場廚房區線 */}
            <line x1="20" y1="171" x2="220" y2="171" stroke="white" strokeWidth="2" />

            {/* 下半場廚房區線 */}
            <line x1="20" y1="309" x2="220" y2="309" stroke="white" strokeWidth="2" />

            {/* 中線虛線 - 上半場 */}
            {[...Array(15)].map((_, i) => (
              <rect
                key={`top-dash-${i}`}
                x="118"
                y={20 + i * 10.1}
                width="4"
                height="5"
                fill="white"
              />
            ))}

            {/* 中線虛線 - 下半場 */}
            {[...Array(15)].map((_, i) => (
              <rect
                key={`bottom-dash-${i}`}
                x="118"
                y={309 + i * 10.1}
                width="4"
                height="5"
                fill="white"
              />
            ))}

            {/* 廚房區（上半場）*/}
            <rect
              x="20"
              y="171"
              width="200"
              height="69"
              fill={shouldHighlight('kitchen-zone') ? 'rgba(251, 191, 36, 0.5)' : 'rgba(251, 191, 36, 0.2)'}
              stroke={shouldHighlight('kitchen-zone') ? '#fbbf24' : 'transparent'}
              strokeWidth="2"
              className="transition-all duration-300"
            />
            {shouldHighlight('kitchen-zone') && (
              <text x="120" y="210" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">
                ❌ 廚房區（不可截擊）
              </text>
            )}

            {/* 廚房區（下半場）*/}
            <rect
              x="20"
              y="240"
              width="200"
              height="69"
              fill={shouldHighlight('kitchen-zone') ? 'rgba(251, 191, 36, 0.5)' : 'rgba(251, 191, 36, 0.2)'}
              stroke={shouldHighlight('kitchen-zone') ? '#fbbf24' : 'transparent'}
              strokeWidth="2"
              className="transition-all duration-300"
            />

            {/* 上半場偶數發球區（左側）- 對角發球目標區 */}
            <rect
              x="20"
              y="20"
              width="100"
              height="151"
              fill={shouldHighlight('service-target-even') ? 'rgba(96, 165, 250, 0.5)' : 'rgba(96, 165, 250, 0.15)'}
              stroke={shouldHighlight('service-target-even') ? '#60a5fa' : 'transparent'}
              strokeWidth="2"
              className="transition-all duration-300"
            />
            {shouldHighlight('service-target-even') && (
              <text x="70" y="100" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle">
                🎯 目標發球區
              </text>
            )}

            {/* 下半場偶數發球區（右側）*/}
            <rect
              x="120"
              y="309"
              width="100"
              height="151"
              fill={shouldHighlight('baseline-server') ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.15)'}
              stroke={shouldHighlight('baseline-server') ? '#22c55e' : 'transparent'}
              strokeWidth="2"
              className="transition-all duration-300"
            />
            {shouldHighlight('baseline-server') && (
              <text x="170" y="385" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle">
                📍 發球區
              </text>
            )}

            {/* 底線標記 */}
            <line x1="20" y1="460" x2="220" y2="460" stroke="#ef4444" strokeWidth="3" strokeDasharray="4,4" />
            {shouldHighlight('baseline-server') && (
              <text x="120" y="475" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">
                ⚠️ 底線（發球時不可越過）
              </text>
            )}

            {/* 球的軌跡線 */}
            {isPlaying && currentStep > 0 && (
              <>
                {steps.slice(0, currentStep + 1).map((step, index) => {
                  if (index === 0) return null;
                  const prevStep = steps[index - 1];
                  return (
                    <motion.line
                      key={index}
                      x1={prevStep.position.x}
                      y1={prevStep.position.y}
                      x2={step.position.x}
                      y2={step.position.y}
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.7 }}
                      transition={{ duration: 0.8 }}
                    />
                  );
                })}
              </>
            )}

            {/* 發球方位置標記 */}
            {isPlaying && steps[currentStep].serverPosition && (
              <g>
                <circle
                  cx={steps[currentStep].serverPosition!.x}
                  cy={steps[currentStep].serverPosition!.y}
                  r="8"
                  fill="#22c55e"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={steps[currentStep].serverPosition!.x}
                  y={steps[currentStep].serverPosition!.y + 4}
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  🧍
                </text>
                {currentStep < 3 && (
                  <text
                    x={steps[currentStep].serverPosition!.x}
                    y={steps[currentStep].serverPosition!.y - 15}
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    發球方
                  </text>
                )}
              </g>
            )}

            {/* 動畫球 */}
            {isPlaying && (
              <motion.circle
                cx={steps[currentStep].position.x}
                cy={steps[currentStep].position.y}
                r="8"
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1.2, 1],
                  x: currentStep > 0 ? [steps[currentStep - 1]?.position.x - steps[currentStep].position.x, 0] : 0,
                  y: currentStep > 0 ? [steps[currentStep - 1]?.position.y - steps[currentStep].position.y, 0] : 0,
                }}
                transition={{ duration: currentStep === 0 ? 0.3 : 1 }}
              >
                <animate
                  attributeName="opacity"
                  values="0.6;1;0.6"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </motion.circle>
            )}

            {/* 起始位置標記 */}
            {!isPlaying && (
              <circle
                cx={steps[0].position.x}
                cy={steps[0].position.y}
                r="6"
                fill="#60a5fa"
                opacity="0.6"
              />
            )}
          </svg>

          {/* 當前步驟說明與規範 */}
          {isPlaying && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-5 max-w-md"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pickleball-400 to-sport-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {currentStep + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{steps[currentStep].name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{steps[currentStep].description}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">📋 規範與限制：</p>
                <ul className="space-y-1.5">
                  {steps[currentStep].regulations.map((regulation, index) => (
                    <li key={index} className="text-xs text-gray-700 flex items-start">
                      <span className="mr-1.5">{regulation}</span>
                    </li>
                  ))}
                </ul>
                {steps[currentStep].source && (
                  <p className="text-xs text-gray-400 mt-3 italic">
                    來源：{steps[currentStep].source}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* 控制按鈕 */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={playAnimation}
            disabled={isPlaying}
            className={`
              px-8 py-3 rounded-full font-bold text-white transition-all duration-300 flex items-center space-x-2
              ${
                isPlaying
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sport-500 to-court-500 hover:shadow-lg hover:scale-105'
              }
            `}
          >
            <span>{isPlaying ? '播放中...' : '播放動畫'}</span>
            {!isPlaying && <span className="text-xl">▶️</span>}
          </button>

          <button
            onClick={resetAnimation}
            className="px-8 py-3 rounded-full font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-300"
          >
            重置
          </button>
        </div>

        {/* 步驟指示器 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-xl text-center transition-all duration-300
                ${
                  isPlaying && index === currentStep
                    ? 'bg-gradient-to-br from-pickleball-400 to-sport-500 text-white shadow-lg scale-105'
                    : isPlaying && index < currentStep
                    ? 'bg-court-200 text-gray-700'
                    : 'bg-gray-100 text-gray-500'
                }
              `}
            >
              <div className="font-bold text-sm mb-1">{index + 1}</div>
              <div className="text-xs leading-tight">{step.name}</div>
            </div>
          ))}
        </div>

        {/* 重要提醒 */}
        <div className="mt-8 bg-gradient-to-r from-pickleball-50 to-sport-50 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">雙彈地規則（Two-Bounce Rule）</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                發球後，接發球方和發球方都必須等球彈地一次後才能擊球。這是匹克球的關鍵規則，
                防止發球方立即衝到網前佔據優勢位置。只有在雙方都完成一次擊地球後，才能開始截擊。
              </p>
              <p className="text-xs text-gray-500 mt-2 italic">
                USA Pickleball Official Rulebook 2024, Section 7
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BallAnimation;
