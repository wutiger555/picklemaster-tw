import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COURT } from '../engine/constants';
import type { GameEngine } from '../engine/game';

/**
 * 電視輔助判決的鷹眼圖層：把判定的那條線打亮、在落點畫出球印。
 * 揭曉前球印是白色，揭曉後界內綠、出界紅。
 */
export const ReviewFx = ({ engine }: { engine: GameEngine }) => {
  const root = useRef<THREE.Group>(null);
  const line = useRef<THREE.Mesh>(null);
  const mark = useRef<THREE.Mesh>(null);
  const ghost = useRef<THREE.Mesh>(null);
  const lineMat = useRef<THREE.MeshBasicMaterial>(null);
  const markMat = useRef<THREE.MeshBasicMaterial>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    const g = root.current;
    if (!g) return;
    const rv = engine.reviewView();
    const show = !!rv && rv.angle !== 'broadcast';
    g.visible = show;
    if (!rv || !show) return;
    t.current += delta;
    const p = rv.pos;
    const sx = Math.sign(p.x) || 1;
    const sz = Math.sign(p.z) || 1;
    const lw = COURT.lineWidth;
    // 判定線：沿著線放一條發光的長條（只畫落點附近 3 公尺）
    if (line.current) {
      if (rv.line === 'side' || rv.line === 'center') {
        const x = rv.line === 'side' ? sx * (COURT.halfWidth - lw / 2) : 0;
        line.current.position.set(x, 0.006, p.z);
        line.current.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      } else {
        const z = rv.line === 'kitchen' ? sz * COURT.kitchen : sz * (COURT.halfLength - lw / 2);
        line.current.position.set(p.x, 0.006, z);
        line.current.rotation.set(-Math.PI / 2, 0, 0);
      }
    }
    if (lineMat.current) lineMat.current.opacity = 0.55 + Math.sin(t.current * 6) * 0.2;
    // 球印與幻影球（鷹眼畫面才顯示球印）
    const hawk = rv.angle === 'hawk';
    if (mark.current) {
      mark.current.visible = hawk;
      mark.current.position.set(p.x, 0.008, p.z);
    }
    if (markMat.current) markMat.current.color.set(!rv.revealed ? '#ffffff' : rv.truthIn ? '#22c55e' : '#ef4444');
    if (ghost.current) {
      ghost.current.visible = hawk;
      ghost.current.position.set(p.x, 0.037, p.z);
    }
  });

  return (
    <group ref={root} visible={false}>
      <mesh ref={line} renderOrder={3}>
        <planeGeometry args={[3, COURT.lineWidth]} />
        <meshBasicMaterial ref={lineMat} color="#7dd3fc" transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {/* 球落地壓扁的接觸面：比球小、略呈橢圓 */}
      <mesh ref={mark} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1.35, 1]} renderOrder={4}>
        <circleGeometry args={[0.034, 32]} />
        <meshBasicMaterial ref={markMat} color="#ffffff" transparent opacity={0.92} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ghost}>
        <sphereGeometry args={[0.037, 24, 16]} />
        <meshStandardMaterial color="#d8f03a" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
};
