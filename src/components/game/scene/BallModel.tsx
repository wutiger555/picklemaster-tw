import { type Ref, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLAYER } from '../engine/constants';
import type { GameEngine } from '../engine/game';
import { SPECIALS } from '../engine/paddles';
import { ballTexture } from './textures';

/** 畫面上的球放大 1.4 倍，遠端也看得清楚 */
const R = 0.037 * 1.4;
const Z = new THREE.Vector3(0, 0, 1);

/** 40 孔戶外球：外殼用 alpha 挖洞，裡面再放一顆深色內球 */
const Pickleball = ({
  meshRef,
  matRef,
  opacity = 1,
  tint,
}: {
  meshRef?: Ref<THREE.Group>;
  matRef?: Ref<THREE.MeshStandardMaterial>;
  opacity?: number;
  tint?: string;
}) => {
  const holes = ballTexture();
  return (
    <group ref={meshRef}>
      <mesh castShadow={opacity === 1}>
        <sphereGeometry args={[R, 32, 20]} />
        <meshStandardMaterial
          ref={matRef}
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

/**
 * 球：位置做物理步之間的內插；擊中瞬間被拍面壓扁並閃光，
 * 高速飛行時沿速度方向拉長；進入玩家打擊範圍時發亮。
 */
export const BallModel = ({ engine }: { engine: GameEngine }) => {
  const outer = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const decoys = useRef<(THREE.Group | null)[]>([]);
  const v = useMemo(
    () => ({ axis: new THREE.Vector3(), dir: new THREE.Vector3(), pos: new THREE.Vector3(), q: new THREE.Quaternion() }),
    [],
  );
  const impact = useRef(0);
  const lastHit = useRef(-1);
  const clock = useRef(0);

  useFrame((_, rdt) => {
    const b = engine.ball;
    const dt = Math.min(0.05, rdt) * engine.timeScale;
    clock.current += rdt;
    if (!outer.current || !spinner.current || !shadow.current) return;
    const a = engine.alpha;
    const p = engine.prevBall;
    v.pos.set(p.x + (b.pos.x - p.x) * a, p.y + (b.pos.y - p.y) * a, p.z + (b.pos.z - p.z) * a);
    outer.current.position.copy(v.pos);

    // 擊中瞬間：壓扁＋閃白（用真實時間衰減，頓幀時也看得到）
    if (engine.rally.lastHitTime !== lastHit.current) {
      lastHit.current = engine.rally.lastHitTime;
      if (engine.phase === 'rally') impact.current = 1;
    }
    impact.current = Math.max(0, impact.current - Math.min(0.05, rdt) * 7);
    const speed = Math.hypot(b.vel.x, b.vel.y, b.vel.z);
    if (speed > 0.5) {
      v.dir.set(b.vel.x / speed, b.vel.y / speed, b.vel.z / speed);
      v.q.setFromUnitVectors(Z, v.dir);
      outer.current.quaternion.copy(v.q);
    }
    const im = impact.current;
    const stretch = 1 + Math.min(0.7, speed / 40) - im * 0.45;
    const squash = 1 + im * 0.3 - Math.min(0.15, speed / 160);
    outer.current.scale.set(squash, squash, stretch);

    // 旋轉：上旋、下旋看得出來
    const w = Math.hypot(b.spin.x, b.spin.y, b.spin.z);
    if (w > 0.1) {
      v.axis.set(b.spin.x / w, b.spin.y / w, b.spin.z / w);
      spinner.current.rotateOnWorldAxis(v.axis, w * dt * 0.35);
    }

    // 發光：擊中閃白、進入打擊範圍時脈動
    const h = engine.human;
    const mine = engine.phase === 'rally' && engine.rally.lastTeam !== h.team && !h.ai;
    const near = mine && Math.hypot(b.pos.x - h.pos.x, b.pos.z - h.pos.z) < PLAYER.reach + 0.25 && b.pos.y < PLAYER.maxContactHeight;
    if (mat.current) {
      const glow = near ? 1.1 + Math.sin(clock.current * 30) * 0.4 : 0.35;
      mat.current.emissiveIntensity = glow + im * 6;
      mat.current.emissive.set(im > 0.3 ? '#ffffff' : near ? '#eaff5a' : '#b6cc1a');
    }

    const ht = Math.max(0, b.pos.y - 0.037);
    shadow.current.position.set(v.pos.x, 0.006, v.pos.z);
    shadow.current.scale.setScalar(1 + ht * 0.35);
    (shadow.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0.15, 0.6 - ht * 0.12);

    // 幻影分身：兩顆假球往兩側散開，快落地時消失
    const sp = b.special;
    const phantom = sp && sp.id === 'phantom' && !sp.spent;
    decoys.current.forEach((d, i) => {
      if (!d) return;
      d.visible = !!phantom;
      if (!phantom) return;
      const k = Math.min(1, sp.t / sp.period);
      const spread = Math.sin(k * Math.PI) * 1.1 * (i === 0 ? 1 : -1);
      d.position.set(
        v.pos.x + sp.perp.x * spread,
        v.pos.y + Math.sin(k * Math.PI * 2 + i) * 0.15,
        v.pos.z + sp.perp.z * spread,
      );
    });
  });

  return (
    <group>
      <group ref={outer}>
        <group ref={spinner}>
          <Pickleball matRef={mat} />
        </group>
      </group>
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
