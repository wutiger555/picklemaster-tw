import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const BallAnimation = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { name: '發球', description: '從底線對角發球', position: { x: 50, y: 160 } },
    { name: '接發球', description: '對方接發球', position: { x: 350, y: 40 } },
    { name: '回擊', description: '回擊到對方場地', position: { x: 100, y: 60 } },
    { name: '截擊', description: '在非截擊區外截擊', position: { x: 320, y: 100 } },
    { name: '得分', description: '球落地得分', position: { x: 80, y: 120 } },
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

  return (
    <div className="w-full max-w-6xl mx-auto mt-12">
      <div className="bg-gradient-to-br from-sport-50 to-court-50 rounded-3xl shadow-2xl p-4 md:p-8">
        <h3 className="text-3xl font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sport-600 to-court-600">
          球路徑動畫演示
        </h3>
        <p className="text-center text-gray-600 mb-6">
          觀看完整的發球到得分過程
        </p>

        <div className="relative">
          <svg
            viewBox="0 0 440 200"
            className="w-full h-auto bg-court-700 rounded-2xl"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 簡化的球場 */}
            <rect x="20" y="20" width="400" height="160" fill="none" stroke="white" strokeWidth="2" />
            <line x1="220" y1="20" x2="220" y2="180" stroke="white" strokeWidth="1.5" />
            <line x1="20" y1="100" x2="420" y2="100" stroke="white" strokeWidth="3" strokeDasharray="5,5" />

            {/* 非截擊區標記 */}
            <rect x="20" y="20" width="70" height="160" fill="rgba(251, 191, 36, 0.2)" stroke="white" strokeWidth="1" />
            <rect x="350" y="20" width="70" height="160" fill="rgba(251, 191, 36, 0.2)" stroke="white" strokeWidth="1" />

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
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 }}
                      transition={{ duration: 0.8 }}
                    />
                  );
                })}
              </>
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

          {/* 當前步驟說明 */}
          {isPlaying && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 max-w-xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pickleball-400 to-sport-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentStep + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{steps[currentStep].name}</h4>
                  <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
                </div>
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
        <div className="mt-8 grid grid-cols-5 gap-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-lg text-center transition-all duration-300
                ${
                  isPlaying && index === currentStep
                    ? 'bg-gradient-to-br from-pickleball-400 to-sport-500 text-white shadow-lg scale-105'
                    : isPlaying && index < currentStep
                    ? 'bg-court-200 text-gray-700'
                    : 'bg-gray-100 text-gray-500'
                }
              `}
            >
              <div className="font-bold text-sm">{index + 1}</div>
              <div className="text-xs mt-1">{step.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BallAnimation;
