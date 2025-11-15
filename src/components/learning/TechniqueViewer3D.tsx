import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// 簡化的 3D 人形模型（使用基礎幾何體）
function PlayerModel({ technique, step }: { technique: string; step: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // 根據技術和步驟設定姿勢
  const getPose = () => {
    if (technique === 'serve') {
      switch (step) {
        case 0: return { armRotation: 0, bodyRotation: 0 }; // 準備
        case 1: return { armRotation: -Math.PI / 4, bodyRotation: -0.2 }; // 後擺
        case 2: return { armRotation: Math.PI / 4, bodyRotation: 0.2 }; // 擊球
        case 3: return { armRotation: Math.PI / 2, bodyRotation: 0.3 }; // 跟進
        default: return { armRotation: 0, bodyRotation: 0 };
      }
    }
    return { armRotation: 0, bodyRotation: 0 };
  };

  const pose = getPose();

  useFrame(() => {
    if (groupRef.current) {
      // 平滑過渡到目標姿勢
      groupRef.current.rotation.y += (pose.bodyRotation - groupRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 身體 */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.6, 1.2, 0.4]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* 頭部 */}
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      {/* 左手臂 */}
      <group position={[-0.5, 1.5, 0]} rotation={[0, 0, pose.armRotation]}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
        {/* 球拍 */}
        <mesh position={[0, -0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.05]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>

      {/* 右手臂 */}
      <group position={[0.5, 1.5, 0]} rotation={[0, 0, -0.3]}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
      </group>

      {/* 左腿 */}
      <mesh position={[-0.2, 0.3, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* 右腿 */}
      <mesh position={[0.2, 0.3, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* 關鍵點標註 */}
      {step === 2 && (
        <>
          <Html position={[-0.5, 1.5, 0]} center>
            <div className="bg-pickleball-500 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
              擊球點
            </div>
          </Html>
          <Html position={[0, 0.3, 0]} center>
            <div className="bg-sport-500 text-white px-2 py-1 rounded text-xs font-bold">
              重心
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// 球場地板
function Court() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#15803d" />
      <gridHelper args={[10, 10, '#86efac', '#4ade80']} position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} />
    </mesh>
  );
}

// 3D 場景組件
function Scene({ technique, step }: { technique: string; step: number }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[4, 3, 4]} />
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />

      <Suspense fallback={null}>
        <PlayerModel technique={technique} step={step} />
        <Court />
      </Suspense>
    </>
  );
}

const TechniqueViewer3D = () => {
  const [selectedTechnique, setSelectedTechnique] = useState('serve');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const techniques = [
    {
      id: 'serve',
      name: '發球',
      icon: '🎾',
      steps: [
        { name: '準備姿勢', description: '雙腳與肩同寬，身體放鬆' },
        { name: '後擺動作', description: '球拍向後擺動，準備發力' },
        { name: '擊球瞬間', description: '由下往上擊球，接觸點在身體側面' },
        { name: '跟進動作', description: '球拍順勢向前跟進，保持平衡' },
      ],
    },
    {
      id: 'volley',
      name: '截擊',
      icon: '⚡',
      steps: [
        { name: '準備站位', description: '站在非截擊區外，保持警覺' },
        { name: '預判來球', description: '觀察對方動作，預判球路' },
        { name: '快速反應', description: '短促有力的擊球動作' },
        { name: '回位', description: '擊球後立即回到準備位置' },
      ],
    },
  ];

  const currentTechnique = techniques.find(t => t.id === selectedTechnique) || techniques[0];

  const nextStep = () => {
    if (currentStep < currentTechnique.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const playAnimation = () => {
    setIsPlaying(true);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= currentTechnique.steps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sport-600 to-court-600">
          3D 技術動作教學
        </h2>
        <p className="text-center text-gray-600 mb-8">
          360 度觀看動作分解 • 拖動旋轉視角
        </p>

        {/* 技術選擇 */}
        <div className="flex justify-center space-x-4 mb-6">
          {techniques.map((tech) => (
            <button
              key={tech.id}
              onClick={() => {
                setSelectedTechnique(tech.id);
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              className={`
                px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2
                ${selectedTechnique === tech.id
                  ? 'bg-gradient-to-r from-sport-500 to-court-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-xl">{tech.icon}</span>
              <span>{tech.name}</span>
            </button>
          ))}
        </div>

        {/* 3D 視圖 */}
        <div className="relative w-full h-[500px] bg-gradient-to-b from-sport-50 to-court-50 rounded-2xl overflow-hidden mb-6">
          <Canvas shadows>
            <Scene technique={selectedTechnique} step={currentStep} />
          </Canvas>

          {/* 提示文字 */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            <p className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="mr-2">🖱️</span>
              拖動旋轉 • 滾輪縮放
            </p>
          </div>
        </div>

        {/* 步驟說明 */}
        <div className="bg-gradient-to-br from-pickleball-50 to-sport-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">
              步驟 {currentStep + 1}: {currentTechnique.steps[currentStep].name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {currentStep + 1} / {currentTechnique.steps.length}
              </span>
            </div>
          </div>
          <p className="text-gray-700 text-lg">
            {currentTechnique.steps[currentStep].description}
          </p>
        </div>

        {/* 控制按鈕 */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 0 || isPlaying}
            className={`
              px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2
              ${currentStep === 0 || isPlaying
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
              }
            `}
          >
            <span>← 上一步</span>
          </button>

          <button
            onClick={playAnimation}
            disabled={isPlaying}
            className={`
              px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2
              ${isPlaying
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pickleball-500 to-sport-500 hover:shadow-lg hover:scale-105'
              } text-white
            `}
          >
            <span>{isPlaying ? '播放中...' : '自動播放'}</span>
            {!isPlaying && <span>▶️</span>}
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep === currentTechnique.steps.length - 1 || isPlaying}
            className={`
              px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2
              ${currentStep === currentTechnique.steps.length - 1 || isPlaying
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
              }
            `}
          >
            <span>下一步 →</span>
          </button>
        </div>

        {/* 步驟指示器 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {currentTechnique.steps.map((step, index) => (
            <motion.div
              key={index}
              onClick={() => !isPlaying && setCurrentStep(index)}
              whileHover={!isPlaying ? { scale: 1.05 } : {}}
              className={`
                p-4 rounded-xl text-center transition-all duration-300 cursor-pointer
                ${index === currentStep
                  ? 'bg-gradient-to-br from-sport-500 to-court-500 text-white shadow-lg'
                  : index < currentStep
                  ? 'bg-court-200 text-gray-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              <div className="font-bold text-sm mb-1">{index + 1}</div>
              <div className="text-xs">{step.name}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechniqueViewer3D;
