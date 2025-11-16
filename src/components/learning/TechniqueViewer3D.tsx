import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// 3D 人形模型（使用基礎幾何體）
function PlayerModel({ technique, step }: { technique: string; step: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  // 根據技術和步驟設定詳細姿勢（基於 USA Pickleball 官方規範）
  const getPose = () => {
    if (technique === 'serve') {
      switch (step) {
        case 0: // 準備姿勢
          return {
            armRotation: 0,
            armSwing: 0,
            bodyRotation: 0,
            bodyLean: 0,
            leftLegBend: 0,
            rightLegBend: 0,
            paddleAngle: 0,
          };
        case 1: // 後擺動作
          return {
            armRotation: -0.3,
            armSwing: -Math.PI / 6,
            bodyRotation: -0.3,
            bodyLean: 0.1,
            leftLegBend: 0.1,
            rightLegBend: -0.1,
            paddleAngle: -Math.PI / 6,
          };
        case 2: // 擊球瞬間（關鍵：由下往上）
          return {
            armRotation: 0.2,
            armSwing: Math.PI / 3,
            bodyRotation: 0.2,
            bodyLean: -0.15,
            leftLegBend: 0.2,
            rightLegBend: -0.2,
            paddleAngle: Math.PI / 4,
          };
        case 3: // 跟進動作
          return {
            armRotation: 0.4,
            armSwing: Math.PI / 2,
            bodyRotation: 0.4,
            bodyLean: -0.2,
            leftLegBend: 0.15,
            rightLegBend: -0.15,
            paddleAngle: Math.PI / 3,
          };
        default:
          return {
            armRotation: 0,
            armSwing: 0,
            bodyRotation: 0,
            bodyLean: 0,
            leftLegBend: 0,
            rightLegBend: 0,
            paddleAngle: 0,
          };
      }
    } else if (technique === 'volley') {
      switch (step) {
        case 0: // 準備站位
          return {
            armRotation: 0,
            armSwing: Math.PI / 6,
            bodyRotation: 0,
            bodyLean: 0.05,
            leftLegBend: 0.1,
            rightLegBend: 0.1,
            paddleAngle: Math.PI / 6,
          };
        case 1: // 預判來球
          return {
            armRotation: -0.2,
            armSwing: Math.PI / 4,
            bodyRotation: -0.2,
            bodyLean: 0.1,
            leftLegBend: 0.15,
            rightLegBend: 0.05,
            paddleAngle: Math.PI / 4,
          };
        case 2: // 快速反應擊球
          return {
            armRotation: 0.3,
            armSwing: Math.PI / 3,
            bodyRotation: 0.3,
            bodyLean: -0.1,
            leftLegBend: 0.2,
            rightLegBend: 0.1,
            paddleAngle: Math.PI / 3,
          };
        case 3: // 回位
          return {
            armRotation: 0.1,
            armSwing: Math.PI / 6,
            bodyRotation: 0,
            bodyLean: 0,
            leftLegBend: 0.1,
            rightLegBend: 0.1,
            paddleAngle: Math.PI / 6,
          };
        default:
          return {
            armRotation: 0,
            armSwing: 0,
            bodyRotation: 0,
            bodyLean: 0,
            leftLegBend: 0,
            rightLegBend: 0,
            paddleAngle: 0,
          };
      }
    }
    return {
      armRotation: 0,
      armSwing: 0,
      bodyRotation: 0,
      bodyLean: 0,
      leftLegBend: 0,
      rightLegBend: 0,
      paddleAngle: 0,
    };
  };

  const pose = getPose();

  useFrame(() => {
    if (groupRef.current) {
      // 平滑過渡身體旋轉
      groupRef.current.rotation.y += (pose.bodyRotation - groupRef.current.rotation.y) * 0.1;
      groupRef.current.rotation.x += (pose.bodyLean - groupRef.current.rotation.x) * 0.1;
    }
    if (leftArmRef.current) {
      // 平滑過渡左手臂動作
      leftArmRef.current.rotation.z += (pose.armRotation - leftArmRef.current.rotation.z) * 0.1;
      leftArmRef.current.rotation.x += (pose.armSwing - leftArmRef.current.rotation.x) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 身體 */}
      <group ref={bodyRef} position={[0, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 1.2, 0.4]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      </group>

      {/* 頭部 */}
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      {/* 左手臂（持拍手）*/}
      <group ref={leftArmRef} position={[-0.5, 1.5, 0]}>
        {/* 上臂 */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
        {/* 前臂 */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.4]} />
          <meshStandardMaterial color="#93c5fd" />
        </mesh>
        {/* 球拍 */}
        <group position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, pose.paddleAngle]}>
          {/* 拍面 */}
          <mesh>
            <cylinderGeometry args={[0.28, 0.28, 0.04]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
          {/* 拍柄 */}
          <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.25]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
      </group>

      {/* 右手臂 */}
      <group ref={rightArmRef} position={[0.5, 1.5, 0]} rotation={[0, 0, -0.3]}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
      </group>

      {/* 左腿 */}
      <mesh position={[-0.2, 0.3 + pose.leftLegBend * 0.2, 0]} rotation={[pose.leftLegBend, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* 右腿 */}
      <mesh position={[0.2, 0.3 + pose.rightLegBend * 0.2, 0]} rotation={[pose.rightLegBend, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* 腳部位置標記 */}
      {technique === 'serve' && step === 0 && (
        <Html position={[0, -0.2, 0]} center>
          <div className="bg-court-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
            🦶 雙腳站穩
          </div>
        </Html>
      )}

      {/* 擊球點標註 */}
      {step === 2 && (
        <>
          <Html position={[-0.5, 1.0, 0]} center>
            <div className="bg-pickleball-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
              🏓 擊球點（低於腰部）
            </div>
          </Html>
          <Html position={[0, 0.5, 0]} center>
            <div className="bg-sport-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
              ⚖️ 重心前移
            </div>
          </Html>
          <Html position={[-0.5, 1.6, 0]} center>
            <div className="bg-court-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
              📐 拍面由下往上
            </div>
          </Html>
        </>
      )}

      {/* 後擺標註 */}
      {technique === 'serve' && step === 1 && (
        <Html position={[-0.5, 1.3, 0]} center>
          <div className="bg-pickleball-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
            ↙️ 後擺準備
          </div>
        </Html>
      )}

      {/* 跟進標註 */}
      {technique === 'serve' && step === 3 && (
        <Html position={[-0.5, 1.5, 0]} center>
          <div className="bg-sport-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
            ↗️ 順勢跟進
          </div>
        </Html>
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

  // 資料來源：USA Pickleball Official Rulebook 2024
  const techniques = [
    {
      id: 'serve',
      name: '發球技術',
      icon: '🎾',
      steps: [
        {
          name: '準備姿勢',
          description: '站在底線後，雙腳與肩同寬，身體放鬆面向球場',
          keyPoints: [
            '🦶 至少一隻腳在底線後方',
            '⚖️ 重心均勻分配於雙腳',
            '👀 視線注視對角發球區',
            '🏓 球拍自然握持，手腕放鬆',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 4.A.4',
        },
        {
          name: '後擺動作',
          description: '球拍向後下方擺動，為擊球蓄積力量',
          keyPoints: [
            '↙️ 球拍向身體後方擺動',
            '🔄 身體微微轉向持拍側',
            '⬇️ 球拍頭部位置低於手腕',
            '💪 手臂保持放鬆，不要過度用力',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 4.A.5',
        },
        {
          name: '擊球瞬間',
          description: '由下往上擊球，擊球點必須低於腰部高度',
          keyPoints: [
            '🏓 擊球點必須低於腰部',
            '📐 球拍面由下往上揮動',
            '⬆️ 擊球時手臂向上延伸',
            '🎯 球必須越過廚房線落在對角區',
            '⚠️ 手腕不能高於肘部（規則限制）',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 4.A.5-7',
        },
        {
          name: '跟進動作',
          description: '球拍順勢向前上方跟進，保持身體平衡',
          keyPoints: [
            '↗️ 球拍自然向目標方向延伸',
            '🏃 重心隨擊球動作向前移動',
            '⚖️ 保持身體平衡，準備下一步移動',
            '👀 眼睛追蹤球的飛行軌跡',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 4.L',
        },
      ],
    },
    {
      id: 'volley',
      name: '截擊技術',
      icon: '⚡',
      steps: [
        {
          name: '準備站位',
          description: '站在非截擊區外，雙腳微彎保持警覺',
          keyPoints: [
            '📍 必須站在廚房區外',
            '⚖️ 重心略微下降，雙腳與肩同寬',
            '🏓 球拍舉至胸前高度',
            '👀 注視對方與來球',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 9',
        },
        {
          name: '預判來球',
          description: '觀察對方動作，預判球的方向和速度',
          keyPoints: [
            '👁️ 觀察對方擊球動作',
            '🧠 預判球的落點和速度',
            '🦶 調整步伐準備移動',
            '⚡ 保持反應準備狀態',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 7',
        },
        {
          name: '快速反應',
          description: '短促有力的擊球動作，在空中截擊來球',
          keyPoints: [
            '⚡ 動作要快速簡潔',
            '💪 使用前臂和手腕發力',
            '🎯 控制球的方向和力道',
            '❌ 確保雙腳未觸碰廚房區',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 9.B',
        },
        {
          name: '回位準備',
          description: '擊球後立即調整位置，準備下一球',
          keyPoints: [
            '🏃 快速回到準備位置',
            '⚖️ 保持平衡和警覺',
            '👀 注視對方和球的動向',
            '🎯 維持在最佳防守位置',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 9',
        },
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

        {/* 步驟說明與關鍵點 */}
        <div className="bg-gradient-to-br from-pickleball-50 to-sport-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">
              步驟 {currentStep + 1}: {currentTechnique.steps[currentStep].name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-semibold">
                {currentStep + 1} / {currentTechnique.steps.length}
              </span>
            </div>
          </div>
          <p className="text-gray-700 text-base mb-4">
            {currentTechnique.steps[currentStep].description}
          </p>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-sm font-semibold text-gray-600 mb-3">🔑 關鍵要點：</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentTechnique.steps[currentStep].keyPoints.map((point: string, index: number) => (
                <li key={index} className="flex items-start text-sm text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            {currentTechnique.steps[currentStep].source && (
              <p className="text-xs text-gray-400 mt-4 italic">
                資料來源：{currentTechnique.steps[currentStep].source}
              </p>
            )}
          </div>
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

        {/* 重要規則提醒 */}
        {selectedTechnique === 'serve' && (
          <div className="mt-8 bg-gradient-to-r from-pickleball-50 to-sport-50 rounded-2xl p-6 border-2 border-pickleball-200">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-lg">下手發球規則（Underhand Serve）</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-start">
                    <span className="mr-2">🏓</span>
                    <span><strong>擊球點位置：</strong>擊球時，球必須在腰部以下。腰部定義為肚臍的位置。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">📐</span>
                    <span><strong>球拍角度：</strong>擊球時，球拍頭部（拍面頂端）不能高於手腕。球拍面必須由下往上揮動。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">⚖️</span>
                    <span><strong>手腕位置：</strong>擊球瞬間，持拍手的手腕不能高於肘部。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">🦶</span>
                    <span><strong>腳部位置：</strong>發球時至少一隻腳必須在底線後方，不能踩踏或越過底線。</span>
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-4 italic">
                  USA Pickleball Official Rulebook 2024, Section 4.A.5-7
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 截擊規則提醒 */}
        {selectedTechnique === 'volley' && (
          <div className="mt-8 bg-gradient-to-r from-sport-50 to-court-50 rounded-2xl p-6 border-2 border-sport-200">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">🚫</span>
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-lg">非截擊區規則（Kitchen Rules）</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-start">
                    <span className="mr-2">❌</span>
                    <span><strong>禁止截擊：</strong>不能站在廚房區（非截擊區）內進行截擊（volley）。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">🦶</span>
                    <span><strong>腳部限制：</strong>雙腳都不能觸碰廚房區線或進入廚房區。壓線也算犯規。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">🏃</span>
                    <span><strong>慣性動作：</strong>截擊後的慣性動作如果讓你踏入廚房區也算犯規。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span><strong>允許擊球：</strong>球彈地後可以進入廚房區擊球，但必須重新建立站位（雙腳觸地於區外）才能再次截擊。</span>
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-4 italic">
                  USA Pickleball Official Rulebook 2024, Section 9
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechniqueViewer3D;
