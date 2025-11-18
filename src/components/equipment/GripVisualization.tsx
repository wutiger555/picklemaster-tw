import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GripStyle {
  id: 'eastern' | 'western' | 'continental';
  name: string;
  nameEn: string;
  description: string;
  bestFor: string[];
  steps: {
    step: number;
    title: string;
    instruction: string;
  }[];
  keyPoints: string[];
  commonMistakes: string[];
  visualTip: string;
}

const GripVisualization = () => {
  const [selectedGrip, setSelectedGrip] = useState<'eastern' | 'western' | 'continental'>('eastern');
  const [currentStep, setCurrentStep] = useState(0);

  const gripStyles: GripStyle[] = [
    {
      id: 'eastern',
      name: '東方式握法',
      nameEn: 'Eastern Grip',
      description: '像「握手」一樣自然的握法，最適合初學者',
      bestFor: ['初學者', '全方位球員', '雙打選手', '需要快速切換正反手'],
      steps: [
        {
          step: 1,
          title: '球拍垂直放置',
          instruction: '將球拍拍面垂直於地面，像是要跟球拍握手',
        },
        {
          step: 2,
          title: '伸出手掌',
          instruction: '手掌張開，從側面貼近握把',
        },
        {
          step: 3,
          title: '握住握把',
          instruction: '手掌包覆握把，拇指與食指形成 "V" 字對準握把頂部',
        },
        {
          step: 4,
          title: '調整手指',
          instruction: '其餘三指自然環繞握把，不要過度用力',
        },
      ],
      keyPoints: [
        '👍 拇指與食指形成的 "V" 字對準握把頂部中心',
        '✋ 手掌平貼握把側面，如同握手姿勢',
        '🤏 握把時保持輕鬆，不要過度用力',
        '↔️ 正反手切換時無需大幅調整握法',
      ],
      commonMistakes: [
        '❌ 握得太緊，導致手臂緊繃',
        '❌ "V" 字位置偏移，影響擊球角度',
        '❌ 手掌過度向後或向前旋轉',
      ],
      visualTip: '想像你在跟球拍握手，這就是最自然的東方式握法',
    },
    {
      id: 'western',
      name: '西方式握法',
      nameEn: 'Western Grip',
      description: '手掌位置較低，適合打上旋球和進攻',
      bestFor: ['進攻型球員', '喜歡上旋球', '底線強攻手', '正手為主的打法'],
      steps: [
        {
          step: 1,
          title: '從東方式開始',
          instruction: '先採用東方式握法',
        },
        {
          step: 2,
          title: '向下旋轉',
          instruction: '將手掌向下旋轉約 45 度（順時針，右手持拍）',
        },
        {
          step: 3,
          title: '檢查 V 字位置',
          instruction: '"V" 字現在應該對準握把右側',
        },
        {
          step: 4,
          title: '調整拇指',
          instruction: '拇指貼在握把側面，增加穩定性',
        },
      ],
      keyPoints: [
        '🔄 手掌向下旋轉約 45 度',
        '📐 "V" 字對準握把右側（右手持拍）',
        '⬆️ 拍面自然向上傾斜',
        '🎾 便於產生強烈上旋',
      ],
      commonMistakes: [
        '❌ 旋轉角度過大，影響反手擊球',
        '❌ 拇指位置不當，降低控制力',
        '❌ 握把過度向後，難以打平擊球',
      ],
      visualTip: '想像你要從上方拍打球，手掌自然下壓的位置就是西方式',
    },
    {
      id: 'continental',
      name: '大陸式握法',
      nameEn: 'Continental Grip',
      description: '手掌側面接觸握把，最適合網前截擊',
      bestFor: ['網前選手', '雙打高手', '發球專用', '防守型球員'],
      steps: [
        {
          step: 1,
          title: '從東方式開始',
          instruction: '先採用東方式握法',
        },
        {
          step: 2,
          title: '向上旋轉',
          instruction: '將手掌向上旋轉約 45 度（逆時針，右手持拍）',
        },
        {
          step: 3,
          title: '檢查 V 字位置',
          instruction: '"V" 字現在應該對準握把左側',
        },
        {
          step: 4,
          title: '手掌側面接觸',
          instruction: '主要用手掌側面（小魚際）接觸握把',
        },
      ],
      keyPoints: [
        '🔄 手掌向上旋轉約 45 度',
        '📐 "V" 字對準握把左側（右手持拍）',
        '🤚 手掌側面為主要接觸點',
        '⚡ 正反手無需換握，反應快',
      ],
      commonMistakes: [
        '❌ 旋轉角度不足，無法發揮優勢',
        '❌ 用手掌心握持，失去側面接觸',
        '❌ 握得太緊，降低靈活性',
      ],
      visualTip: '想像你要用球拍側面敲擊東西，這就是大陸式的手掌角度',
    },
  ];

  const currentGrip = gripStyles.find((g) => g.id === selectedGrip)!;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 shadow-xl border-2 border-gray-100">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-2">
          握拍方式圖解教學
        </h3>
        <p className="text-gray-600">分步驟學習正確的握拍姿勢</p>
      </div>

      {/* 握法選擇器 */}
      <div className="flex gap-3 justify-center flex-wrap mb-8">
        {gripStyles.map((grip) => (
          <motion.button
            key={grip.id}
            onClick={() => {
              setSelectedGrip(grip.id);
              setCurrentStep(0);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              selectedGrip === grip.id
                ? 'bg-gradient-to-r from-pickleball-500 to-sport-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            {grip.name}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedGrip}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* 握法描述 */}
          <div className="bg-gradient-to-r from-pickleball-50 to-sport-50 rounded-xl p-6 border-2 border-pickleball-200 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-6xl">🤝</div>
              <div className="flex-1">
                <h4 className="text-2xl font-black text-gray-800 mb-2">{currentGrip.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{currentGrip.nameEn}</p>
                <p className="text-gray-700 leading-relaxed mb-4">{currentGrip.description}</p>

                {/* 適合對象 */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold text-gray-600 mr-2">適合：</span>
                  {currentGrip.bestFor.map((player, idx) => (
                    <span
                      key={idx}
                      className="bg-sport-100 text-sport-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {player}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 分步驟教學 */}
          <div className="mb-8">
            <h5 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              分步驟教學
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentGrip.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setCurrentStep(index)}
                  className={`bg-white rounded-xl p-5 border-2 cursor-pointer transition-all ${
                    currentStep === index
                      ? 'border-pickleball-500 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-pickleball-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pickleball-500 to-sport-500 text-white flex items-center justify-center text-lg font-black">
                      {step.step}
                    </div>
                    <h6 className="font-bold text-gray-800 text-sm">{step.title}</h6>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{step.instruction}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 簡化示意圖 */}
          <div className="bg-white rounded-xl p-6 shadow-md mb-8">
            <h5 className="text-lg font-bold text-gray-800 mb-4 text-center">
              握把示意圖
            </h5>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* 握把頂視圖 */}
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600 mb-3">握把頂視圖</p>
                <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
                  {/* 握把圓形 */}
                  <circle cx="100" cy="100" r="60" fill="#fbbf24" stroke="#d97706" strokeWidth="3" />

                  {/* "V" 字位置標記 - 根據不同握法調整 */}
                  <g>
                    {(() => {
                      let angle = 0;
                      if (selectedGrip === 'eastern') angle = -90;
                      else if (selectedGrip === 'western') angle = -135;
                      else angle = -45;

                      const angleRad = (angle * Math.PI) / 180;
                      const x = 100 + 75 * Math.cos(angleRad);
                      const y = 100 + 75 * Math.sin(angleRad);

                      return (
                        <>
                          <line x1="100" y1="100" x2={x} y2={y} stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrow)" />
                          <text x={x + 10} y={y + 5} fill="#dc2626" fontSize="20" fontWeight="bold">V</text>
                        </>
                      );
                    })()}
                  </g>

                  {/* 箭頭定義 */}
                  <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                    </marker>
                  </defs>

                  {/* 角度文字 */}
                  <text x="100" y="30" fill="#666" fontSize="12" textAnchor="middle" fontWeight="bold">
                    {selectedGrip === 'eastern' ? '頂部中心' : selectedGrip === 'western' ? '向右 45°' : '向左 45°'}
                  </text>
                </svg>
                <p className="text-xs text-gray-500 mt-2">紅色箭頭指向 "V" 字對準位置</p>
              </div>

              {/* 視覺提示 */}
              <div className="flex-1 max-w-md">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">💡</span>
                    <div>
                      <h6 className="font-bold text-amber-900 mb-2">記憶訣竅</h6>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        {currentGrip.visualTip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 關鍵要點 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">✅</span>
                關鍵要點
              </h5>
              <ul className="space-y-3">
                {currentGrip.keyPoints.map((point, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start text-sm text-gray-700"
                  >
                    <span className="mr-2">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                常見錯誤
              </h5>
              <ul className="space-y-3">
                {currentGrip.commonMistakes.map((mistake, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start text-sm text-gray-700"
                  >
                    <span className="mr-2">{mistake}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* 練習建議 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🎯</span>
              <div className="flex-1">
                <h5 className="text-lg font-bold text-blue-900 mb-2">練習建議</h5>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>每次練習前花 5 分鐘確認握法是否正確</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>在鏡子前檢查 "V" 字位置是否對準</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>練習時保持放鬆，不要過度用力握拍</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>可以用手機拍照記錄自己的握法，方便對照調整</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GripVisualization;
