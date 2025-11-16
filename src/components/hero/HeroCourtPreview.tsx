import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// 簡化的球場模型（專門用於首頁展示）
function SimpleCourt() {
  const scale = 0.22;
  const courtLength = 44 * scale; // 9.68
  const courtWidth = 20 * scale; // 4.4
  const kitchenLength = 7 * scale; // 1.54
  const netHeight = 3 * scale; // 0.66

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      {/* 球場地面 */}
      <mesh receiveShadow>
        <planeGeometry args={[courtWidth, courtLength]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>

      {/* 球場外框 */}
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

      {/* 廚房區線 */}
      <mesh position={[0, kitchenLength, 0.015]}>
        <boxGeometry args={[courtWidth, 0.06, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -kitchenLength, 0.015]}>
        <boxGeometry args={[courtWidth, 0.06, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 中線虛線 */}
      {[...Array(12)].map((_, i) => (
        <mesh
          key={`top-${i}`}
          position={[0, kitchenLength + (courtLength / 2 - kitchenLength) / 12 * (i + 0.5), 0.015]}
        >
          <boxGeometry args={[0.04, (courtLength / 2 - kitchenLength) / 24, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      {[...Array(12)].map((_, i) => (
        <mesh
          key={`bottom-${i}`}
          position={[0, -kitchenLength - (courtLength / 2 - kitchenLength) / 12 * (i + 0.5), 0.015]}
        >
          <boxGeometry args={[0.04, (courtLength / 2 - kitchenLength) / 24, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* 廚房區標記（半透明黃色）*/}
      <mesh position={[0, kitchenLength / 2, 0.008]}>
        <planeGeometry args={[courtWidth - 0.05, kitchenLength]} />
        <meshStandardMaterial color="#fbbf24" opacity={0.2} transparent />
      </mesh>
      <mesh position={[0, -kitchenLength / 2, 0.008]}>
        <planeGeometry args={[courtWidth - 0.05, kitchenLength]} />
        <meshStandardMaterial color="#fbbf24" opacity={0.2} transparent />
      </mesh>

      {/* 球場周圍區域 */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[courtWidth + 2, courtLength + 2]} />
        <meshStandardMaterial color="#166534" roughness={0.9} />
      </mesh>
    </group>
  );
}

// 3D 場景
function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 4, 5]} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={8}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={1.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
      />

      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-8, 10, -5]} intensity={0.6} />

      <Suspense fallback={null}>
        <SimpleCourt />
      </Suspense>
    </>
  );
}

const HeroCourtPreview = () => {
  return (
    <div className="w-full h-64 md:h-80">
      <Canvas shadows>
        <Scene />
      </Canvas>
    </div>
  );
};

export default HeroCourtPreview;
