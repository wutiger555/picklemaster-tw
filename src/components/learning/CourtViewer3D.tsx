import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';

// 專業標準的匹克球場 3D 模型
// 參考：USA Pickleball Official Rulebook 2024
// 球場規格：44英尺長 x 20英尺寬 (13.41m x 6.10m)
function PickleballCourt({ highlightZone }: { highlightZone: string | null }) {
  const scale = 0.22;
  const courtLength = 44 * scale; // 9.68
  const courtWidth = 20 * scale; // 4.4
  const kitchenLength = 7 * scale; // 1.54
  const netHeight = 3 * scale; // 0.66 (球網高度3英尺)

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      {/* 球場地面 */}
      <mesh receiveShadow>
        <planeGeometry args={[courtWidth, courtLength]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>

      {/* 球場外框（邊線和底線）*/}
      <lineSegments position={[0, 0, 0.01]}>
        <edgesGeometry
          attach="geometry"
          args={[new THREE.PlaneGeometry(courtWidth, courtLength)]}
        />
        <lineBasicMaterial color="#ffffff" linewidth={4} />
      </lineSegments>

      {/* 球網結構 */}
      <group position={[0, 0, netHeight / 2 + 0.01]}>
        {/* 球網主體 */}
        <mesh castShadow>
          <boxGeometry args={[courtWidth + 0.2, 0.02, netHeight]} />
          <meshStandardMaterial
            color="#1f2937"
            transparent
            opacity={0.7}
            roughness={0.9}
          />
        </mesh>

        {/* 球網頂部白色帶 */}
        <mesh position={[0, 0, netHeight / 2]}>
          <boxGeometry args={[courtWidth + 0.2, 0.04, 0.08]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* 球網網格效果 */}
        {[...Array(8)].map((_, i) => (
          <mesh key={`net-h-${i}`} position={[0, 0, -netHeight / 2 + i * (netHeight / 7)]}>
            <boxGeometry args={[courtWidth + 0.2, 0.01, 0.01]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
        ))}
        {[...Array(12)].map((_, i) => (
          <mesh key={`net-v-${i}`} position={[-courtWidth / 2 + i * (courtWidth / 11), 0, 0]}>
            <boxGeometry args={[0.01, 0.01, netHeight]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
        ))}

        {/* 球網支柱 */}
        <mesh position={[-courtWidth / 2 - 0.15, 0, -netHeight / 2]}>
          <cylinderGeometry args={[0.04, 0.04, netHeight, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[courtWidth / 2 + 0.15, 0, -netHeight / 2]}>
          <cylinderGeometry args={[0.04, 0.04, netHeight, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      {/* 上半場廚房區線 */}
      <mesh position={[0, kitchenLength, 0.015]}>
        <boxGeometry args={[courtWidth, 0.06, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 下半場廚房區線 */}
      <mesh position={[0, -kitchenLength, 0.015]}>
        <boxGeometry args={[courtWidth, 0.06, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 中線（分隔發球區）- 虛線效果 */}
      {/* 上半場中線 */}
      {[...Array(18)].map((_, i) => (
        <mesh
          key={`top-${i}`}
          position={[0, kitchenLength + (courtLength / 2 - kitchenLength) / 18 * (i + 0.5), 0.015]}
        >
          <boxGeometry args={[0.04, (courtLength / 2 - kitchenLength) / 36, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* 下半場中線 */}
      {[...Array(18)].map((_, i) => (
        <mesh
          key={`bottom-${i}`}
          position={[0, -kitchenLength - (courtLength / 2 - kitchenLength) / 18 * (i + 0.5), 0.015]}
        >
          <boxGeometry args={[0.04, (courtLength / 2 - kitchenLength) / 36, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* 廚房區標記（半透明黃色區域）*/}
      <mesh position={[0, kitchenLength / 2, 0.008]}>
        <planeGeometry args={[courtWidth - 0.05, kitchenLength]} />
        <meshStandardMaterial
          color="#fbbf24"
          opacity={highlightZone === 'kitchen-top' ? 0.5 : 0.15}
          transparent
        />
      </mesh>
      <mesh position={[0, -kitchenLength / 2, 0.008]}>
        <planeGeometry args={[courtWidth - 0.05, kitchenLength]} />
        <meshStandardMaterial
          color="#fbbf24"
          opacity={highlightZone === 'kitchen-bottom' ? 0.5 : 0.15}
          transparent
        />
      </mesh>

      {/* 發球區標記 */}
      {/* 上半場右側（偶數區）*/}
      <mesh position={[courtWidth / 4, courtLength / 4 - kitchenLength / 2, 0.005]}>
        <planeGeometry args={[courtWidth / 2 - 0.05, courtLength / 2 - kitchenLength]} />
        <meshStandardMaterial
          color="#60a5fa"
          opacity={highlightZone === 'service-top-right' ? 0.4 : 0.1}
          transparent
        />
      </mesh>

      {/* 上半場左側（奇數區）*/}
      <mesh position={[-courtWidth / 4, courtLength / 4 - kitchenLength / 2, 0.005]}>
        <planeGeometry args={[courtWidth / 2 - 0.05, courtLength / 2 - kitchenLength]} />
        <meshStandardMaterial
          color="#34d399"
          opacity={highlightZone === 'service-top-left' ? 0.4 : 0.1}
          transparent
        />
      </mesh>

      {/* 下半場右側（偶數區）*/}
      <mesh position={[courtWidth / 4, -courtLength / 4 + kitchenLength / 2, 0.005]}>
        <planeGeometry args={[courtWidth / 2 - 0.05, courtLength / 2 - kitchenLength]} />
        <meshStandardMaterial
          color="#60a5fa"
          opacity={highlightZone === 'service-bottom-right' ? 0.4 : 0.1}
          transparent
        />
      </mesh>

      {/* 下半場左側（奇數區）*/}
      <mesh position={[-courtWidth / 4, -courtLength / 4 + kitchenLength / 2, 0.005]}>
        <planeGeometry args={[courtWidth / 2 - 0.05, courtLength / 2 - kitchenLength]} />
        <meshStandardMaterial
          color="#34d399"
          opacity={highlightZone === 'service-bottom-left' ? 0.4 : 0.1}
          transparent
        />
      </mesh>

      {/* 球場周圍區域（界外）*/}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[courtWidth + 2, courtLength + 2]} />
        <meshStandardMaterial color="#166534" roughness={0.9} />
      </mesh>
    </group>
  );
}

// 站位標記
function PositionMarker({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  return (
    <group position={position}>
      {/* 圓形標記 */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* 標籤 */}
      <Html position={[0, 0.3, 0]} center>
        <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl border-2 border-white/20">
          {label}
        </div>
      </Html>
    </group>
  );
}

// 3D 場景組件
function Scene({ highlightZone, positions }: { highlightZone: string | null; positions: Array<{ pos: [number, number, number]; label: string; color: string }> }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[6, 5, 6]} />
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.2}
      />

      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-8, 10, -5]} intensity={0.6} />
      <pointLight position={[0, 5, 0]} intensity={0.5} />

      <Suspense fallback={null}>
        <PickleballCourt highlightZone={highlightZone} />
        {positions.map((pos, index) => (
          <PositionMarker key={index} position={pos.pos} label={pos.label} color={pos.color} />
        ))}
      </Suspense>
    </>
  );
}

const CourtViewer3D = () => {
  const [selectedView, setSelectedView] = useState('structure');

  // 球場區域詳細說明
  const courtAreas = [
    {
      id: 'structure',
      name: '球場結構',
      icon: '🏗️',
      highlightZone: null,
      positions: [],
      description: '完整的匹克球場配置與規格',
      details: [
        {
          title: '球場尺寸',
          items: [
            '📏 長度：44 英尺（13.41 公尺）',
            '📏 寬度：20 英尺（6.10 公尺）',
            '📏 球網高度：中間 34 英寸（86.36 公分）',
            '📏 球網高度：兩側 36 英寸（91.44 公分）',
          ],
        },
        {
          title: '場地標線',
          items: [
            '⚪ 底線（Baseline）：球場兩端的界線',
            '⚪ 邊線（Sideline）：球場兩側的界線',
            '🟡 非截擊區線（廚房線）：距離球網 7 英尺',
            '⚪ 中線：將發球區分為左右兩側',
          ],
        },
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 2',
    },
    {
      id: 'kitchen',
      name: '非截擊區（廚房）',
      icon: '🚫',
      highlightZone: 'kitchen-top',
      positions: [],
      description: '7 英尺的禁止截擊區域',
      details: [
        {
          title: '廚房區規則',
          items: [
            '❌ 不能站在廚房區內進行截擊（volley）',
            '❌ 截擊後的慣性動作踏入廚房也算犯規',
            '❌ 壓線也算在廚房區內',
            '✅ 球彈地後可以進入廚房區擊球',
          ],
        },
        {
          title: '重要說明',
          items: [
            '📍 距離球網 7 英尺（2.13 公尺）',
            '📍 兩側場地各有一個廚房區',
            '⚠️ 這是匹克球最重要的規則之一',
            '✅ 必須重新建立站位才能再次截擊',
          ],
        },
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 9',
    },
    {
      id: 'serve-position',
      name: '發球站位',
      icon: '🎾',
      highlightZone: 'service-bottom-right',
      positions: [
        { pos: [1.1, 0, -4.0] as [number, number, number], label: '發球方（偶數區）', color: '#3b82f6' },
        { pos: [-1.1, 0, -4.0] as [number, number, number], label: '發球方（奇數區）', color: '#3b82f6' },
        { pos: [1.1, 0, 3.2] as [number, number, number], label: '接發球方目標區', color: '#22c55e' },
      ],
      description: '發球時的站位與規則',
      details: [
        {
          title: '發球方站位',
          items: [
            '🦶 至少一隻腳必須在底線後方',
            '📊 比分為偶數時，在右側發球區發球',
            '📊 比分為奇數時，在左側發球區發球',
            '↗️ 必須對角線發球到對方發球區',
          ],
        },
        {
          title: '發球規則',
          items: [
            '✋ 必須使用下手發球（underhand serve）',
            '🏓 擊球點必須低於腰部',
            '📐 球拍面必須由下往上揮動',
            '❌ 不能踩踏或越過底線',
          ],
        },
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 4',
    },
    {
      id: 'net-position',
      name: '網前站位',
      icon: '⚡',
      highlightZone: null,
      positions: [
        { pos: [0.6, 0, 1.6] as [number, number, number], label: '網前最佳位置', color: '#f59e0b' },
        { pos: [-0.6, 0, 1.6] as [number, number, number], label: '雙打搭檔位置', color: '#f59e0b' },
      ],
      description: '進攻時的網前站位策略',
      details: [
        {
          title: '網前站位要點',
          items: [
            '📍 站在廚房線外，盡量靠近廚房線',
            '⚖️ 保持身體重心略微下降，隨時準備移動',
            '👀 注視對方和來球，保持警覺',
            '🤝 雙打時與搭檔保持適當距離',
          ],
        },
        {
          title: '網前優勢',
          items: [
            '⚡ 可以快速反應對方的回球',
            '💪 掌控球場，給對方施加壓力',
            '🎯 有更多的角度選擇',
            '✅ 更容易得分',
          ],
        },
      ],
      source: 'USA Pickleball Official Rulebook 2024, Section 7-9',
    },
  ];

  const currentView = courtAreas.find((area) => area.id === selectedView) || courtAreas[0];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sport-600 to-court-600">
          3D 球場配置教學
        </h2>
        <p className="text-center text-gray-600 mb-8">
          360 度檢視球場配置 • 了解每個區域的規則與站位
        </p>

        {/* 視角選擇 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {courtAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedView(area.id)}
              className={`
                px-4 py-3 rounded-xl font-bold transition-all duration-300 flex flex-col items-center space-y-1
                ${selectedView === area.id
                  ? 'bg-gradient-to-r from-sport-500 to-court-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-2xl">{area.icon}</span>
              <span className="text-sm">{area.name}</span>
            </button>
          ))}
        </div>

        {/* 3D 視圖 */}
        <div className="relative w-full h-[500px] bg-gradient-to-b from-sky-100 to-green-100 rounded-2xl overflow-hidden mb-6 shadow-inner">
          <Canvas shadows>
            <Scene highlightZone={currentView.highlightZone} positions={currentView.positions} />
          </Canvas>

          {/* 提示文字 */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            <p className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="mr-2">🖱️</span>
              拖動旋轉 • 滾輪縮放
            </p>
          </div>
        </div>

        {/* 詳細說明 */}
        <div className="bg-gradient-to-br from-sport-50 to-court-50 rounded-2xl p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
            <span className="text-3xl mr-3">{currentView.icon}</span>
            {currentView.name}
          </h3>
          <p className="text-gray-700 text-lg mb-6">{currentView.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentView.details.map((detail, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-3 text-lg">{detail.title}</h4>
                <ul className="space-y-2">
                  {detail.items.map((item, i) => (
                    <li key={i} className="text-gray-700 text-sm flex items-start">
                      <span className="mr-2 flex-shrink-0">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {currentView.source && (
            <p className="text-xs text-gray-400 mt-6 italic text-center">
              資料來源：{currentView.source}
            </p>
          )}
        </div>

        {/* 重要提醒 */}
        <div className="bg-gradient-to-r from-pickleball-50 to-sport-50 rounded-2xl p-6 border-2 border-pickleball-200">
          <div className="flex items-start space-x-3">
            <span className="text-3xl flex-shrink-0">💡</span>
            <div>
              <h4 className="font-bold text-gray-800 mb-3 text-lg">球場尺寸記憶口訣</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-start">
                  <span className="mr-2 font-bold">🏓</span>
                  <span><strong>44-20-7</strong>：球場長 44 英尺、寬 20 英尺、廚房區 7 英尺</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2 font-bold">📏</span>
                  <span><strong>雙打與單打</strong>：雙打和單打使用相同的球場尺寸</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2 font-bold">🌐</span>
                  <span><strong>國際標準</strong>：全球統一規格，所有正式比賽都使用相同尺寸</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtViewer3D;
