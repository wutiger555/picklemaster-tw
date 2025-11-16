import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 正確的匹克球規格：
// - 直徑：2.87-2.97 英吋 (約 7.3-7.5 cm)
// - 26-40 個圓形穿透孔洞
// - 顏色：黃色為主（也有白色、橘色）
//
// 正確的匹克球拍規格：
// - 形狀：扁平橢圓形/長方形圓角
// - 長度：15.5-17 英吋
// - 寬度：7-8.5 英吋
// - 厚度：較薄，通常 < 0.5 英吋

function PickleballWithPaddle() {
  const ballRef = useRef<THREE.Group>(null);
  const paddleRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ballRef.current) {
      // 球的旋轉和漂浮
      ballRef.current.rotation.y += 0.008;
      ballRef.current.rotation.x += 0.003;
      ballRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15 + 0.5;
    }
    if (paddleRef.current) {
      // 球拍輕微擺動
      paddleRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
      paddleRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  // 生成均勻分布的孔洞位置
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

  const holes = generateHoles(32);

  return (
    <group>
      {/* 匹克球 */}
      <group ref={ballRef} position={[0.8, 0.5, 0]}>
        {/* 主球體 - 鮮黃色 */}
        <mesh castShadow>
          <sphereGeometry args={[0.75, 32, 32]} />
          <meshStandardMaterial
            color="#FFE135"
            roughness={0.5}
            metalness={0.05}
          />
        </mesh>

        {/* 孔洞效果 - 使用深色凹陷的圓圈 */}
        {holes.map((position, index) => {
          const holePosition = position.clone().multiplyScalar(0.74);
          const normal = position.clone().normalize();

          return (
            <group key={index} position={holePosition}>
              {/* 孔洞外圈 */}
              <mesh
                rotation={[
                  Math.atan2(Math.sqrt(normal.x ** 2 + normal.y ** 2), normal.z),
                  Math.atan2(normal.y, normal.x),
                  0
                ]}
              >
                <circleGeometry args={[0.11, 16]} />
                <meshStandardMaterial
                  color="#222222"
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* 孔洞內圈陰影 */}
              <mesh
                position={normal.clone().multiplyScalar(0.01)}
                rotation={[
                  Math.atan2(Math.sqrt(normal.x ** 2 + normal.y ** 2), normal.z),
                  Math.atan2(normal.y, normal.x),
                  0
                ]}
              >
                <circleGeometry args={[0.09, 16]} />
                <meshStandardMaterial
                  color="#111111"
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 匹克球拍 - 正確的扁平橢圓形 */}
      <group ref={paddleRef} position={[-1.2, 0.3, 0]} rotation={[0, 0.4, 0.1]}>
        {/* 球拍面 - 扁平橢圓形 */}
        <mesh castShadow>
          <boxGeometry args={[0.85, 1.15, 0.065]} />
          <meshStandardMaterial
            color="#2563eb"
            roughness={0.35}
            metalness={0.15}
          />
        </mesh>

        {/* 球拍邊框 (Edge Guard) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.88, 1.18, 0.055]} />
          <meshStandardMaterial
            color="#1e3a8a"
            roughness={0.4}
          />
        </mesh>

        {/* 球拍表面蜂窩紋理 */}
        {[...Array(12)].map((_, row) => (
          [...Array(9)].map((_, col) => {
            const x = -0.38 + col * 0.095;
            const y = -0.52 + row * 0.095;
            const offsetX = row % 2 === 0 ? 0 : 0.0475;

            return (
              <mesh
                key={`hex-${row}-${col}`}
                position={[x + offsetX, y, 0.033]}
              >
                <circleGeometry args={[0.035, 6]} />
                <meshStandardMaterial
                  color="#3b82f6"
                  roughness={0.3}
                />
              </mesh>
            );
          })
        )).flat()}

        {/* 握把 - 更真實的形狀 */}
        <group position={[0, -0.78, 0]}>
          {/* 握把主體 */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.075, 0.55, 16]} />
            <meshStandardMaterial
              color="#1f2937"
              roughness={0.85}
            />
          </mesh>

          {/* 握把纏帶紋理 */}
          {[...Array(12)].map((_, i) => (
            <mesh
              key={`grip-${i}`}
              position={[0, -0.24 + i * 0.045, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.067, 0.067, 0.015, 16]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#374151' : '#1f2937'}
                roughness={0.9}
              />
            </mesh>
          ))}

          {/* 握把端蓋 */}
          <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.075, 0.03, 16]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>

        {/* 品牌標誌區域 */}
        <mesh position={[0, 0.35, 0.034]}>
          <planeGeometry args={[0.3, 0.12]} />
          <meshStandardMaterial
            color="#ffffff"
            opacity={0.8}
            transparent
          />
        </mesh>
      </group>

      {/* 陰影接收平面 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[6, 6]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function FloatingPickleball() {
  return (
    <div className="w-full h-64 md:h-80">
      <Canvas
        shadows
        camera={{ position: [0, 1, 5], fov: 40 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 3, -3]} intensity={0.4} color="#60a5fa" />
        <spotLight
          position={[0, 6, 0]}
          intensity={0.6}
          angle={0.4}
          penumbra={0.8}
          castShadow
        />

        <PickleballWithPaddle />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.2}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}
