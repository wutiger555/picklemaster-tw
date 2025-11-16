import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 正確的匹克球規格：
// - 直徑：2.87-2.97 英吋 (約 7.3-7.5 cm)
// - 26-40 個圓形孔洞
// - 孔洞直徑約 0.97-1.02 cm
// - 顏色：黃色為主（也有白色、橘色）

function PickleballWithPaddle() {
  const ballRef = useRef<THREE.Group>(null);
  const paddleRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ballRef.current) {
      // 球的旋轉和漂浮
      ballRef.current.rotation.y += 0.01;
      ballRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.2 + 0.5;
    }
    if (paddleRef.current) {
      // 球拍輕微擺動
      paddleRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // 生成均勻分布的孔洞位置（使用費波那契球面）
  const generateHoles = (count: number) => {
    const holes: THREE.Vector3[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      const x = Math.sin(inclination) * Math.cos(azimuth);
      const y = Math.sin(inclination) * Math.sin(azimuth);
      const z = Math.cos(inclination);

      holes.push(new THREE.Vector3(x, y, z));
    }

    return holes;
  };

  const holes = generateHoles(32); // 32個孔洞

  return (
    <group>
      {/* 匹克球 */}
      <group ref={ballRef} position={[0.5, 0.5, 0]}>
        {/* 主球體 - 黃綠色 */}
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color="#c5ed37"
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>

        {/* 孔洞效果 - 使用稍微凹陷的深色圓圈 */}
        {holes.map((position, index) => (
          <mesh
            key={index}
            position={position.clone().multiplyScalar(0.79)}
            rotation={[
              Math.atan2(Math.sqrt(position.x ** 2 + position.y ** 2), position.z),
              Math.atan2(position.y, position.x),
              0
            ]}
          >
            <circleGeometry args={[0.12, 16]} />
            <meshStandardMaterial
              color="#333333"
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* 匹克球拍 */}
      <group ref={paddleRef} position={[-1.5, 0, 0]} rotation={[0, 0.3, 0]}>
        {/* 球拍面 */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 1.1, 0.08]} />
          <meshStandardMaterial
            color="#2563eb"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* 球拍邊框 */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.85, 1.15, 0.06]} />
          <meshStandardMaterial
            color="#1e40af"
            roughness={0.4}
          />
        </mesh>

        {/* 球拍表面紋理線條 */}
        {[...Array(8)].map((_, i) => (
          <mesh key={`h-${i}`} position={[0, -0.5 + i * 0.14, 0.041]}>
            <boxGeometry args={[0.75, 0.01, 0.005]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
        ))}
        {[...Array(6)].map((_, i) => (
          <mesh key={`v-${i}`} position={[-0.35 + i * 0.14, 0, 0.041]}>
            <boxGeometry args={[0.01, 1.05, 0.005]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
        ))}

        {/* 握把 */}
        <mesh position={[0, -0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.5, 16]} />
          <meshStandardMaterial
            color="#1f2937"
            roughness={0.8}
          />
        </mesh>

        {/* 握把纏帶 */}
        {[...Array(8)].map((_, i) => (
          <mesh
            key={`grip-${i}`}
            position={[0, -0.55 - i * 0.06, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.065, 0.065, 0.02, 16]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#374151' : '#1f2937'} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function FloatingPickleball() {
  return (
    <div className="w-full h-64 md:h-80">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#60a5fa" />
        <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.3} penumbra={1} />

        <PickleballWithPaddle />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
