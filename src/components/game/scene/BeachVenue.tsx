import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COURT } from '../engine/constants';
import type { GameEngine } from '../engine/game';
import { Net } from './Stadium';
import { buildPalmFrond } from './palmGeometry';
import { awningTexture, boothSignTexture, courtTexture, cupLabelTexture, grainBump, palmFrondTexture, sandTexture, seaTexture, stormSkyTexture } from './textures';

/**
 * 踢館之旅第一站「海邊・颱風天」：宜蘭外澳的海邊水泥球場。
 * 鏡頭往 −z 看出去就是太平洋；右手邊是照常營業的珍奶攤，網柱旁掛風向袋。
 * 颱風關（Boss）天色更暗、會打雷；所有網格與材質開場就建好，比賽中只改位置與強度。
 */

const W = COURT.halfWidth;
const L = COURT.halfLength;
const K = COURT.kitchen;
const LINE = COURT.lineWidth;
const PAD_X = W + 2.6;
const PAD_Z = L + 3.6;
/** 海岸線（z），再過去是海 */
const SHORE = -(PAD_Z + 7);

const Line = ({ x, z, w, d }: { x: number; z: number; w: number; d: number }) => (
  <mesh position={[x, 0.003, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[w, d]} />
    <meshStandardMaterial color="#f7f9fc" roughness={0.5} />
  </mesh>
);

const Court = ({ storm }: { storm: boolean }) => {
  const bump = grainBump();
  const court = courtTexture('#1f6f8b', 'beach-court', [3, 6]);
  const kitchen = courtTexture('#2a86a3', 'beach-kitchen', [3, 1]);
  const pad = courtTexture('#8a9599', 'beach-pad', [6, 10]);
  // 下雨的地面比較亮、比較滑（粗糙度低一點）
  const rough = storm ? 0.42 : 0.7;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]} receiveShadow>
        <planeGeometry args={[PAD_X * 2, PAD_Z * 2]} />
        <meshStandardMaterial map={pad} bumpMap={bump} bumpScale={0.003} roughness={rough + 0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W * 2, L * 2]} />
        <meshStandardMaterial map={court} bumpMap={bump} bumpScale={0.003} roughness={rough} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, (s * K) / 2]} receiveShadow>
          <planeGeometry args={[W * 2, K]} />
          <meshStandardMaterial map={kitchen} bumpMap={bump} bumpScale={0.003} roughness={rough} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <group key={s}>
          <Line x={s * (W - LINE / 2)} z={0} w={LINE} d={L * 2} />
          <Line x={0} z={s * (L - LINE / 2)} w={W * 2} d={LINE} />
          <Line x={0} z={s * (K - LINE / 2)} w={W * 2} d={LINE} />
          <Line x={0} z={(s * (K + L)) / 2} w={LINE} d={L - K} />
        </group>
      ))}
      {/* 水泥場邊的矮牆 */}
      {[1, -1].map((s) => (
        <mesh key={`w${s}`} position={[s * (PAD_X + 0.15), 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.5, PAD_Z * 2]} />
          <meshStandardMaterial color="#9aa3a6" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

/** 沙灘＋海：海面貼圖往岸邊捲動，岸邊一條白浪來回推 */
const Shore = ({ storm }: { storm: boolean }) => {
  const sand = sandTexture();
  const sea = useMemo(() => {
    const t = seaTexture().clone();
    t.needsUpdate = true;
    return t;
  }, []);
  const foam = useRef<THREE.Mesh>(null);
  const foamMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, dt) => {
    sea.offset.y += dt * (storm ? 0.09 : 0.04);
    sea.offset.x += dt * 0.01;
    const t = performance.now() / 1000;
    if (foam.current) foam.current.position.z = SHORE - 1.6 + Math.sin(t * (storm ? 0.9 : 0.6)) * 1.4;
    if (foamMat.current) foamMat.current.opacity = 0.55 + Math.sin(t * 1.3) * 0.2;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 6]} receiveShadow>
        <planeGeometry args={[140, 60]} />
        <meshStandardMaterial map={sand} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, SHORE - 60]}>
        <planeGeometry args={[320, 120]} />
        <meshStandardMaterial map={sea} color={storm ? '#6f8a96' : '#9cb8c4'} roughness={0.25} metalness={0.3} />
      </mesh>
      <mesh ref={foam} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, SHORE - 1.6]}>
        <planeGeometry args={[320, 2.2]} />
        <meshBasicMaterial ref={foamMat} color="#f1f5f9" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      {/* 消波塊：一排灰色的四腳塊，颱風天海邊的招牌 */}
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i} position={[-26 + i * 6.5 + (i % 2) * 1.3, 0.4, SHORE - 3.2 - (i % 3) * 0.7]} rotation={[0.3 * i, i * 1.7, 0.2]}>
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} rotation={[k === 3 ? 0 : 1.91, (k * Math.PI * 2) / 3, 0]} castShadow>
              <cylinderGeometry args={[0.28, 0.42, 1.4, 6]} />
              <meshStandardMaterial color="#8b9196" roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

const PALMS: [number, number, number][] = [
  [-(PAD_X + 2.2), -6, 7.5],
  [-(PAD_X + 3.4), 2, 8.5],
  [-(PAD_X + 2.0), 9, 7],
  [PAD_X + 3.6, -10, 8],
  [PAD_X + 6.2, 4, 9],
  [-14, -16, 9.5],
  [12, -18, 8.5],
];

/** 椰子樹：整棵順著風彎，風越大彎越多，還會被陣風吹得晃 */
const Palms = ({ engine }: { engine: GameEngine }) => {
  const res = useMemo(
    () => ({
      trunk: new THREE.CylinderGeometry(0.14, 0.22, 1, 8).translate(0, 0.5, 0),
      frond: buildPalmFrond(),
      bark: new THREE.MeshStandardMaterial({ color: '#8a7a62', roughness: 0.95 }),
      leaf: new THREE.MeshStandardMaterial({ map: palmFrondTexture(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.85 }),
    }),
    [],
  );
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    const w = engine.ball.wind;
    const t = engine.real;
    // 沒有風的小遊戲也輕輕晃
    const wx = w ? w.x : 0.8;
    const wz = w ? w.z : 0;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const sway = 1 + Math.sin(t * 1.6 + i) * 0.25;
      g.rotation.z = THREE.MathUtils.clamp(-wx * 0.028 * sway, -0.35, 0.35);
      g.rotation.x = THREE.MathUtils.clamp(wz * 0.028 * sway, -0.35, 0.35);
    });
  });
  return (
    <group>
      {PALMS.map(([x, z, h], i) => (
        <group key={i} position={[x, 0, z]} ref={(g) => void (refs.current[i] = g)}>
          <mesh geometry={res.trunk} material={res.bark} scale={[1, h, 1]} castShadow />
          {Array.from({ length: 8 }, (_, k) => (
            <mesh key={k} geometry={res.frond} material={res.leaf} position={[0, h + 0.1, 0]} rotation={[(k % 2) * 0.2 - 0.1, (k / 8) * Math.PI * 2 + i, 0]} scale={0.8} />
          ))}
        </group>
      ))}
    </group>
  );
};

/** 照常營業的珍奶攤（帽哥顧的）：條紋雨棚、招牌、一串燈泡、檯面上幾杯珍奶 */
const BobaStand = () => {
  const awning = awningTexture();
  const sign = boothSignTexture();
  const label = cupLabelTexture();
  const bulbs = useMemo(() => Array.from({ length: 9 }, (_, i) => i), []);
  return (
    <group position={[PAD_X + 2.4, 0, -3.2]} rotation={[0, -Math.PI / 2 + 0.25, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 1, 0.9]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[3.3, 0.06, 1]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} />
      </mesh>
      {[-1.55, 1.55].map((x) => (
        <mesh key={x} position={[x, 1.25, -0.4]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 2.5, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 2.45, 0.15]} rotation={[0.35, 0, 0]} castShadow>
        <planeGeometry args={[3.6, 1.4]} />
        <meshStandardMaterial map={awning} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.95, -0.38]}>
        <planeGeometry args={[2.4, 0.75]} />
        <meshStandardMaterial map={sign} emissive="#facc15" emissiveIntensity={0.25} emissiveMap={sign} />
      </mesh>
      {bulbs.map((i) => (
        <mesh key={i} position={[-1.5 + i * 0.375, 2.18 - Math.sin((i / 8) * Math.PI) * 0.12, 0.62]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#fde68a" toneMapped={false} />
        </mesh>
      ))}
      {[-0.9, -0.5, 0.6, 1.0].map((x) => (
        <mesh key={x} position={[x, 1.2, 0.1]}>
          <cylinderGeometry args={[0.07, 0.055, 0.3, 14]} />
          <meshStandardMaterial map={label} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
};

/** 風向袋：網柱旁的竿子，袋子指向風吹去的方向，風越大越撐直 */
const Windsocks = ({ engine }: { engine: GameEngine }) => {
  const socks = useRef<(THREE.Group | null)[]>([]);
  const geo = useMemo(() => new THREE.ConeGeometry(0.18, 0.9, 12, 1, true).rotateZ(-Math.PI / 2).translate(0.45, 0, 0), []);
  useFrame(() => {
    const w = engine.ball.wind;
    const wx = w ? w.x : 0.6;
    const wz = w ? w.z : 0.2;
    const sp = Math.hypot(wx, wz);
    const t = engine.real;
    socks.current.forEach((g, i) => {
      if (!g) return;
      g.rotation.y = Math.atan2(-wz, wx) + Math.sin(t * 7 + i) * 0.06;
      // 風小的時候垂下來
      g.rotation.z = -THREE.MathUtils.lerp(1.2, 0.05, Math.min(1, sp / 6)) + Math.sin(t * 9 + i * 2) * 0.05;
    });
  });
  return (
    <group>
      {[1, -1].map((s, i) => (
        <group key={s} position={[s * (W + 0.9), 0, 0.4]}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.035, 2.8, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
          </mesh>
          <group position={[0, 2.7, 0]} ref={(g) => void (socks.current[i] = g)}>
            <mesh geometry={geo}>
              <meshStandardMaterial color="#f97316" side={THREE.DoubleSide} roughness={0.7} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
};

/** 颱風天的天空與燈光：打雷時整個天空閃白 */
const Sky = ({ engine, storm }: { engine: GameEngine; storm: boolean }) => {
  const tex = stormSkyTexture(storm);
  const skyMat = useRef<THREE.MeshBasicMaterial>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const base = storm ? 0.9 : 1.15;
  useFrame(() => {
    const lv = engine.level as { thunderAt?: number } | null;
    const since = engine.time - (lv?.thunderAt ?? -99);
    // 閃兩下：先亮、暗一點、再亮一次
    const f = since >= 0 && since < 0.6 ? Math.exp(-since * 9) + (since > 0.12 ? Math.exp(-(since - 0.12) * 12) * 0.8 : 0) : 0;
    if (hemi.current) hemi.current.intensity = base + f * 2.6;
    if (sun.current) sun.current.intensity = (storm ? 0.9 : 1.8) + f * 1.5;
    if (skyMat.current) skyMat.current.color.setScalar(1 + f * 1.4);
  });
  return (
    <>
      <mesh>
        <sphereGeometry args={[150, 40, 20]} />
        <meshBasicMaterial ref={skyMat} map={tex} side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>
      <hemisphereLight ref={hemi} args={[storm ? '#9fb2c6' : '#d2dde6', '#5b5040', base]} />
      <ambientLight intensity={storm ? 0.2 : 0.25} />
      <directionalLight
        ref={sun}
        position={[6, 22, 10]}
        intensity={storm ? 0.9 : 1.8}
        color={storm ? '#cfd8e3' : '#fff4e0'}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={2}
        shadow-camera-far={50}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
    </>
  );
};

export const BeachVenue = ({ engine }: { engine: GameEngine }) => {
  const storm = engine.level?.id === 'typhoon';
  return (
    <group>
      <Sky engine={engine} storm={storm} />
      <Court storm={storm} />
      <Net />
      <Shore storm={storm} />
      <Palms engine={engine} />
      <BobaStand />
      <Windsocks engine={engine} />
    </group>
  );
};
