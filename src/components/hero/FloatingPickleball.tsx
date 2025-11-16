import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function PickleballMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // 輕微旋轉
      meshRef.current.rotation.y += 0.01;
      // 上下漂浮動畫
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* 主球體 - 黃綠色匹克球 */}
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial
          color="#9efc3f"
          roughness={0.3}
          metalness={0.2}
        />
      </Sphere>

      {/* 球上的孔洞效果 - 使用小黑球模擬 */}
      {Array.from({ length: 40 }).map((_, i) => {
        const phi = Math.acos(-1 + (2 * i) / 40);
        const theta = Math.sqrt(40 * Math.PI) * phi;
        const x = 1.02 * Math.cos(theta) * Math.sin(phi);
        const y = 1.02 * Math.sin(theta) * Math.sin(phi);
        const z = 1.02 * Math.cos(phi);

        return (
          <Sphere key={i} args={[0.08, 8, 8]} position={[x, y, z]}>
            <meshStandardMaterial color="#333333" />
          </Sphere>
        );
      })}
    </group>
  );
}

export default function FloatingPickleball() {
  return (
    <div className="w-full h-64 md:h-80">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
        <PickleballMesh />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
