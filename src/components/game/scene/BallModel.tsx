import { type Ref, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GameEngine } from '../engine/game';
import { SPECIALS } from '../engine/paddles';
import { ballTexture } from './textures';

/** 畫面上的球放大 1.4 倍，遠端也看得清楚 */
const R = 0.037 * 1.4;

/** 40 孔戶外球：外殼用 alpha 挖洞，裡面再放一顆深色內球 */
const Pickleball = ({ meshRef, opacity = 1, tint }: { meshRef?: Ref<THREE.Group>; opacity?: number; tint?: string }) => {
  const holes = ballTexture();
  return (
    <group ref={meshRef}>
      <mesh castShadow={opacity === 1}>
        <sphereGeometry args={[R, 32, 20]} />
        <meshStandardMaterial
          color={tint ?? '#d8f03a'}
          alphaMap={holes}
          alphaTest={0.5}
          roughness={0.42}
          emissive={tint ?? '#b6cc1a'}
          emissiveIntensity={tint ? 1.2 : 0.35}
          transparent={opacity < 1}
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[R * 0.9, 16, 12]} />
        <meshStandardMaterial color="#3c4a08" roughness={0.9} transparent={opacity < 1} opacity={opacity} />
      </mesh>
    </group>
  );
};

export const BallModel = ({ engine }: { engine: GameEngine }) => {
  const ball = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const decoys = useRef<(THREE.Group | null)[]>([]);
  const spinAxis = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rdt) => {
    const b = engine.ball;
    const dt = Math.min(0.05, rdt) * engine.timeScale;
    if (!ball.current || !shadow.current) return;
    ball.current.position.set(b.pos.x, b.pos.y, b.pos.z);
    // 依角速度轉動：上旋、下旋看得出來
    const w = Math.hypot(b.spin.x, b.spin.y, b.spin.z);
    if (w > 0.1) {
      spinAxis.set(b.spin.x / w, b.spin.y / w, b.spin.z / w);
      ball.current.rotateOnWorldAxis(spinAxis, w * dt * 0.35);
    }
    const h = Math.max(0, b.pos.y - 0.037);
    shadow.current.position.set(b.pos.x, 0.006, b.pos.z);
    shadow.current.scale.setScalar(1 + h * 0.35);
    (shadow.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0.15, 0.6 - h * 0.12);

    // 幻影分身：兩顆假球往兩側散開，快落地時消失
    const sp = b.special;
    const phantom = sp && sp.id === 'phantom' && !sp.spent;
    decoys.current.forEach((d, i) => {
      if (!d) return;
      d.visible = !!phantom;
      if (!phantom) return;
      const k = Math.min(1, sp.t / sp.period);
      const spread = Math.sin(k * Math.PI) * 1.1 * (i === 0 ? 1 : -1);
      const hs = Math.hypot(b.vel.x, b.vel.z) || 1;
      d.position.set(b.pos.x + (-b.vel.z / hs) * spread, b.pos.y + Math.sin(k * Math.PI * 2 + i) * 0.15, b.pos.z + (b.vel.x / hs) * spread);
    });
  });

  return (
    <group>
      <Pickleball meshRef={ball} />
      {[0, 1].map((i) => (
        <Pickleball key={i} meshRef={(g) => void (decoys.current[i] = g)} opacity={0.75} tint={SPECIALS.phantom.color} />
      ))}
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <circleGeometry args={[0.07, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
};
