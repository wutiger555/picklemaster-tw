import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GripStyle {
  id: 'eastern' | 'western' | 'continental';
  name: string;
  nameEn: string;
  description: string;
  handPosition: {
    rotation: number;
    palmAngle: string;
  };
  keyPoints: string[];
  thumbPosition: string;
  fingerPosition: string;
}

const GripVisualization = () => {
  const [selectedGrip, setSelectedGrip] = useState<'eastern' | 'western' | 'continental'>('eastern');
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState<'side' | 'front' | 'detail'>('side');

  const gripStyles: GripStyle[] = [
    {
      id: 'eastern',
      name: '東方式握法',
      nameEn: 'Eastern Grip',
      description: '手掌平貼握把側面，如同「握手」的姿勢',
      handPosition: {
        rotation: 0,
        palmAngle: '手掌與拍面呈 90 度',
      },
      keyPoints: [
        '掌根貼合握把底部',
        '食指與拇指形成 "V" 字對準握把頂部',
        '其餘三指環繞握把',
        '手腕保持自然放鬆',
      ],
      thumbPosition: '拇指與食指呈 45 度夾角',
      fingerPosition: '手指自然分散，不過度用力',
    },
    {
      id: 'western',
      name: '西方式握法',
      nameEn: 'Western Grip',
      description: '手掌位置更低，拍面角度更開放',
      handPosition: {
        rotation: 45,
        palmAngle: '手掌向下旋轉約 45 度',
      },
      keyPoints: [
        '手掌靠近握把底部',
        '"V" 字對準握把右側（右手持拍）',
        '拍面自然向上傾斜',
        '便於產生上旋球',
      ],
      thumbPosition: '拇指貼在握把側面',
      fingerPosition: '食指稍微延伸，其餘手指緊握',
    },
    {
      id: 'continental',
      name: '大陸式握法',
      nameEn: 'Continental Grip',
      description: '手掌側面接觸握把，適合截擊',
      handPosition: {
        rotation: -45,
        palmAngle: '手掌向上旋轉約 45 度',
      },
      keyPoints: [
        '手掌側面主要接觸點',
        '"V" 字對準握把左側（右手持拍）',
        '拍面較為垂直',
        '正反手無需換握',
      ],
      thumbPosition: '拇指環繞握把後側',
      fingerPosition: '手指平均分布力量',
    },
  ];

  const currentGrip = gripStyles.find((g) => g.id === selectedGrip)!;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 shadow-xl border-2 border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-2">
            握拍方式視覺化教學
          </h3>
          <p className="text-gray-600">互動式 3D 示意圖 - 學習正確的握拍姿勢</p>
        </div>

        {/* 視圖切換 */}
        <div className="flex gap-2 mt-4 md:mt-0">
          {[
            { id: 'side' as const, name: '側視圖', icon: '👁️' },
            { id: 'front' as const, name: '正視圖', icon: '🎯' },
            { id: 'detail' as const, name: '細節圖', icon: '🔍' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === mode.id
                  ? 'bg-pickleball-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{mode.icon}</span>
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側：SVG 視覺化 */}
        <div className="space-y-4">
          {/* 握法選擇器 */}
          <div className="flex gap-3 justify-center lg:justify-start flex-wrap">
            {gripStyles.map((grip) => (
              <motion.button
                key={grip.id}
                onClick={() => setSelectedGrip(grip.id)}
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

          {/* SVG 握拍示意圖 */}
          <motion.div
            key={selectedGrip + viewMode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <svg
              viewBox="0 0 400 500"
              className="w-full h-auto max-w-md mx-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {viewMode === 'side' && (
                <g>
                  {/* 球拍握把 */}
                  <g id="paddle-handle">
                    <rect
                      x="160"
                      y="100"
                      width="80"
                      height="300"
                      rx="10"
                      fill="#fbbf24"
                      stroke="#d97706"
                      strokeWidth="3"
                    />
                    {/* 握把紋理 */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <line
                        key={i}
                        x1="165"
                        y1={110 + i * 19}
                        x2="235"
                        y2={110 + i * 19}
                        stroke="#d97706"
                        strokeWidth="1.5"
                        opacity="0.4"
                      />
                    ))}
                  </g>

                  {/* 手部示意圖 - 根據不同握法調整 */}
                  <g
                    id="hand"
                    transform={`rotate(${currentGrip.handPosition.rotation} 200 250)`}
                    style={{ transformOrigin: '200px 250px' }}
                  >
                    {/* 手掌 */}
                    <ellipse
                      cx="200"
                      cy="250"
                      rx="65"
                      ry="90"
                      fill="#ffd6a5"
                      stroke="#d4a574"
                      strokeWidth="2"
                      opacity="0.9"
                    />

                    {/* 拇指 */}
                    <g id="thumb">
                      <ellipse
                        cx={selectedGrip === 'eastern' ? '145' : selectedGrip === 'western' ? '155' : '135'}
                        cy="230"
                        rx="18"
                        ry="50"
                        fill="#ffd6a5"
                        stroke="#d4a574"
                        strokeWidth="2"
                        transform={`rotate(${
                          selectedGrip === 'eastern' ? '-20' : selectedGrip === 'western' ? '-35' : '-10'
                        } ${selectedGrip === 'eastern' ? '145' : selectedGrip === 'western' ? '155' : '135'} 230)`}
                      />
                      {showLabels && (
                        <text
                          x={selectedGrip === 'eastern' ? '110' : selectedGrip === 'western' ? '120' : '100'}
                          y="230"
                          fill="#dc2626"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          拇指
                        </text>
                      )}
                    </g>

                    {/* 食指 */}
                    <ellipse
                      cx="200"
                      cy="340"
                      rx="15"
                      ry="55"
                      fill="#ffd6a5"
                      stroke="#d4a574"
                      strokeWidth="2"
                    />
                    {showLabels && (
                      <text x="210" y="370" fill="#dc2626" fontSize="12" fontWeight="bold">
                        食指
                      </text>
                    )}

                    {/* 中指 */}
                    <ellipse
                      cx="215"
                      cy="340"
                      rx="14"
                      ry="58"
                      fill="#ffd6a5"
                      stroke="#d4a574"
                      strokeWidth="2"
                    />

                    {/* 無名指 */}
                    <ellipse
                      cx="228"
                      cy="335"
                      rx="13"
                      ry="55"
                      fill="#ffd6a5"
                      stroke="#d4a574"
                      strokeWidth="2"
                    />

                    {/* 小指 */}
                    <ellipse
                      cx="240"
                      cy="325"
                      rx="11"
                      ry="48"
                      fill="#ffd6a5"
                      stroke="#d4a574"
                      strokeWidth="2"
                    />

                    {/* 手腕 */}
                    <rect
                      x="170"
                      y="160"
                      width="60"
                      height="40"
                      rx="8"
                      fill="#ffd6a5"
                      stroke="#d4a574"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  </g>

                  {/* 關鍵標註點 */}
                  {showLabels && (
                    <>
                      {/* V字標記 */}
                      <circle cx="200" cy="120" r="8" fill="#ef4444" opacity="0.8" />
                      <text x="215" y="125" fill="#dc2626" fontSize="14" fontWeight="bold">
                        "V" 字位置
                      </text>
                      <line x1="200" y1="120" x2="200" y2="150" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" />

                      {/* 接觸點標記 */}
                      <circle
                        cx={selectedGrip === 'eastern' ? '165' : selectedGrip === 'western' ? '170' : '155'}
                        cy="250"
                        r="6"
                        fill="#22c55e"
                        opacity="0.8"
                      />
                      <text
                        x={selectedGrip === 'eastern' ? '80' : selectedGrip === 'western' ? '85' : '70'}
                        y="255"
                        fill="#16a34a"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        主要接觸點
                      </text>
                    </>
                  )}
                </g>
              )}

              {viewMode === 'front' && (
                <g>
                  {/* 正視圖 - 從前方看握把 */}
                  <g id="handle-front-view">
                    {/* 握把圓形截面 */}
                    <circle cx="200" cy="250" r="40" fill="#fbbf24" stroke="#d97706" strokeWidth="3" />
                    {/* 握把紋理 */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const angle = (i * 45 * Math.PI) / 180;
                      const x1 = 200 + 30 * Math.cos(angle);
                      const y1 = 250 + 30 * Math.sin(angle);
                      const x2 = 200 + 40 * Math.cos(angle);
                      const y2 = 250 + 40 * Math.sin(angle);
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#d97706"
                          strokeWidth="2"
                          opacity="0.5"
                        />
                      );
                    })}
                  </g>

                  {/* 手指環繞示意 */}
                  <g id="fingers-front">
                    {/* 拇指位置 - 根據握法不同調整角度 */}
                    <g>
                      {(() => {
                        let thumbAngle = 0;
                        if (selectedGrip === 'eastern') thumbAngle = -90;
                        else if (selectedGrip === 'western') thumbAngle = -135;
                        else thumbAngle = -45;

                        const angle = (thumbAngle * Math.PI) / 180;
                        const x = 200 + 55 * Math.cos(angle);
                        const y = 250 + 55 * Math.sin(angle);

                        return (
                          <>
                            <circle cx={x} cy={y} r="22" fill="#ffd6a5" stroke="#d4a574" strokeWidth="2" />
                            {showLabels && (
                              <text x={x - 12} y={y + 5} fill="#dc2626" fontSize="12" fontWeight="bold">
                                拇指
                              </text>
                            )}
                          </>
                        );
                      })()}
                    </g>

                    {/* 食指 */}
                    {(() => {
                      const angle = (90 * Math.PI) / 180;
                      const x = 200 + 55 * Math.cos(angle);
                      const y = 250 + 55 * Math.sin(angle);

                      return (
                        <>
                          <circle cx={x} cy={y} r="20" fill="#ffd6a5" stroke="#d4a574" strokeWidth="2" />
                          {showLabels && (
                            <text x={x - 12} y={y + 5} fill="#dc2626" fontSize="11" fontWeight="bold">
                              食指
                            </text>
                          )}
                        </>
                      );
                    })()}

                    {/* 中指 */}
                    {(() => {
                      const angle = (45 * Math.PI) / 180;
                      const x = 200 + 55 * Math.cos(angle);
                      const y = 250 + 55 * Math.sin(angle);

                      return (
                        <circle cx={x} cy={y} r="19" fill="#ffd6a5" stroke="#d4a574" strokeWidth="2" />
                      );
                    })()}

                    {/* 無名指 */}
                    {(() => {
                      const angle = (0 * Math.PI) / 180;
                      const x = 200 + 55 * Math.cos(angle);
                      const y = 250 + 55 * Math.sin(angle);

                      return (
                        <circle cx={x} cy={y} r="18" fill="#ffd6a5" stroke="#d4a574" strokeWidth="2" />
                      );
                    })()}

                    {/* 小指 */}
                    {(() => {
                      const angle = (-45 * Math.PI) / 180;
                      const x = 200 + 55 * Math.cos(angle);
                      const y = 250 + 55 * Math.sin(angle);

                      return (
                        <circle cx={x} cy={y} r="16" fill="#ffd6a5" stroke="#d4a574" strokeWidth="2" />
                      );
                    })()}

                    {/* 手掌根部 */}
                    {(() => {
                      let palmAngle = 0;
                      if (selectedGrip === 'eastern') palmAngle = 180;
                      else if (selectedGrip === 'western') palmAngle = 135;
                      else palmAngle = -135;

                      const angle = (palmAngle * Math.PI) / 180;
                      const x = 200 + 65 * Math.cos(angle);
                      const y = 250 + 65 * Math.sin(angle);

                      return (
                        <>
                          <circle cx={x} cy={y} r="35" fill="#ffd6a5" stroke="#d4a574" strokeWidth="2" opacity="0.7" />
                          {showLabels && (
                            <text x={x - 12} y={y + 5} fill="#dc2626" fontSize="11" fontWeight="bold">
                              掌根
                            </text>
                          )}
                        </>
                      );
                    })()}
                  </g>

                  {/* 握法角度指示器 */}
                  <g>
                    <circle cx="200" cy="250" r="70" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
                    {(() => {
                      let indicatorAngle = 0;
                      if (selectedGrip === 'eastern') indicatorAngle = -90;
                      else if (selectedGrip === 'western') indicatorAngle = -135;
                      else indicatorAngle = -45;

                      const angle = (indicatorAngle * Math.PI) / 180;
                      const x = 200 + 80 * Math.cos(angle);
                      const y = 250 + 80 * Math.sin(angle);

                      return (
                        <>
                          <line x1="200" y1="250" x2={x} y2={y} stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrowhead)" />
                          <text x={x + 10} y={y} fill="#3b82f6" fontSize="13" fontWeight="bold">
                            {currentGrip.handPosition.palmAngle}
                          </text>
                        </>
                      );
                    })()}
                  </g>

                  {/* 箭頭標記定義 */}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                    </marker>
                  </defs>
                </g>
              )}

              {viewMode === 'detail' && (
                <g>
                  {/* 細節視圖 - 特寫拇指與食指形成的 V 字 */}
                  <text x="200" y="50" fill="#1f2937" fontSize="16" fontWeight="bold" textAnchor="middle">
                    拇指與食指 "V" 字細節
                  </text>

                  {/* 握把頂部視圖 */}
                  <rect x="150" y="100" width="100" height="200" rx="12" fill="#fbbf24" stroke="#d97706" strokeWidth="3" />

                  {/* 拇指 */}
                  <ellipse
                    cx={selectedGrip === 'eastern' ? '120' : selectedGrip === 'western' ? '130' : '110'}
                    cy="180"
                    rx="25"
                    ry="60"
                    fill="#ffd6a5"
                    stroke="#d4a574"
                    strokeWidth="2"
                    transform={`rotate(-15 ${
                      selectedGrip === 'eastern' ? '120' : selectedGrip === 'western' ? '130' : '110'
                    } 180)`}
                  />

                  {/* 食指 */}
                  <ellipse
                    cx={selectedGrip === 'eastern' ? '225' : selectedGrip === 'western' ? '235' : '215'}
                    cy="190"
                    rx="22"
                    ry="65"
                    fill="#ffd6a5"
                    stroke="#d4a574"
                    strokeWidth="2"
                    transform={`rotate(20 ${
                      selectedGrip === 'eastern' ? '225' : selectedGrip === 'western' ? '235' : '215'
                    } 190)`}
                  />

                  {/* V 字標記 */}
                  <path
                    d={`M ${selectedGrip === 'eastern' ? '140' : selectedGrip === 'western' ? '150' : '130'} 150 L 200 ${
                      selectedGrip === 'eastern' ? '110' : selectedGrip === 'western' ? '120' : '100'
                    } L ${selectedGrip === 'eastern' ? '220' : selectedGrip === 'western' ? '230' : '210'} 160`}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <text
                    x="200"
                    y={selectedGrip === 'eastern' ? '90' : selectedGrip === 'western' ? '100' : '80'}
                    fill="#dc2626"
                    fontSize="18"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    V
                  </text>

                  {/* 說明文字 */}
                  <g>
                    <rect x="80" y="340" width="240" height="120" rx="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
                    <text x="200" y="365" fill="#1f2937" fontSize="14" fontWeight="bold" textAnchor="middle">
                      {currentGrip.thumbPosition}
                    </text>
                    <text x="200" y="390" fill="#4b5563" fontSize="12" textAnchor="middle">
                      {currentGrip.fingerPosition}
                    </text>
                    <text x="200" y="415" fill="#4b5563" fontSize="11" textAnchor="middle">
                      V 字對準位置：
                    </text>
                    <text x="200" y="435" fill="#3b82f6" fontSize="13" fontWeight="bold" textAnchor="middle">
                      {currentGrip.handPosition.palmAngle}
                    </text>
                  </g>
                </g>
              )}
            </svg>

            {/* 標籤開關 */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowLabels(!showLabels)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all"
              >
                {showLabels ? '隱藏標籤' : '顯示標籤'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* 右側：詳細說明 */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedGrip}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* 握法名稱與描述 */}
              <div className="bg-gradient-to-r from-pickleball-50 to-sport-50 rounded-xl p-6 border-2 border-pickleball-200">
                <h4 className="text-2xl font-black text-gray-800 mb-2">{currentGrip.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{currentGrip.nameEn}</p>
                <p className="text-gray-700 leading-relaxed">{currentGrip.description}</p>
              </div>

              {/* 關鍵要點 */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">✨</span>
                  關鍵要點
                </h5>
                <ul className="space-y-3">
                  {currentGrip.keyPoints.map((point, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start text-gray-700"
                    >
                      <div className="w-6 h-6 rounded-full bg-pickleball-500 text-white flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm leading-relaxed">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* 手部位置細節 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <h6 className="text-sm font-bold text-blue-800 mb-2">🤚 拇指位置</h6>
                  <p className="text-xs text-blue-900">{currentGrip.thumbPosition}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <h6 className="text-sm font-bold text-green-800 mb-2">👆 手指排列</h6>
                  <p className="text-xs text-green-900">{currentGrip.fingerPosition}</p>
                </div>
              </div>

              {/* 提示框 */}
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">💡</span>
                  <div>
                    <h6 className="font-bold text-amber-900 mb-1">練習提示</h6>
                    <p className="text-sm text-amber-800">
                      初學者建議從東方式握法開始，這是最容易上手且適用範圍最廣的握法。熟練後再根據自己的打法風格調整。
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GripVisualization;
