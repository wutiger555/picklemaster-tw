import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { COURT } from '../engine/constants';
import { courtTexture, daySkyTexture, grainBump } from './textures';
import type { Inst } from './venueUtils';

/** 新場地共用的小零件：一次 draw call 的批次物件、壓克力球場、白天天空 */

const W = COURT.halfWidth;
const L = COURT.halfLength;
const K = COURT.kitchen;
const LINE = COURT.lineWidth;

const tmp = new THREE.Object3D();
const tmpColor = new THREE.Color();


/** 一批相同幾何的物件：一次 draw call */
export const Instanced = ({
  items,
  geometry,
  material,
  castShadow = false,
  receiveShadow = false,
}: {
  items: Inst[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    items.forEach((it, i) => {
      tmp.position.set(...it.p);
      tmp.rotation.set(...(it.r ?? [0, 0, 0]));
      if (typeof it.s === 'number') tmp.scale.setScalar(it.s);
      else tmp.scale.set(...it.s);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      if (it.c) m.setColorAt(i, tmpColor.set(it.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow={castShadow} receiveShadow={receiveShadow} />;
};

const Line = ({ x, z, w, d, color }: { x: number; z: number; w: number; d: number; color: string }) => (
  <mesh position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[w, d]} />
    <meshStandardMaterial color={color} roughness={0.6} />
  </mesh>
);

/**
 * 一面匹克球場（壓克力面＋白線）。kitchen 給顏色時廚房區另外上色（河濱場是深藍外場＋淺藍廚房）。
 * 位置是球場中心，比賽用的那面在原點。
 */
export const CourtPlate = ({
  x = 0,
  z = 0,
  color,
  kitchen,
  line = '#f4f6f8',
}: {
  x?: number;
  z?: number;
  color: string;
  kitchen?: string;
  line?: string;
}) => {
  const tex = courtTexture(color, `plate-${color}`, [2, 4]);
  const kTex = kitchen ? courtTexture(kitchen, `plate-${kitchen}`, [2, 1]) : null;
  const bump = grainBump();
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[W * 2, L * 2]} />
        <meshStandardMaterial map={tex} bumpMap={bump} bumpScale={0.003} roughness={0.8} />
      </mesh>
      {kTex && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
          <planeGeometry args={[W * 2, K * 2]} />
          <meshStandardMaterial map={kTex} bumpMap={bump} bumpScale={0.003} roughness={0.8} />
        </mesh>
      )}
      {[1, -1].map((s) => (
        <group key={s}>
          <Line x={s * (W - LINE / 2)} z={0} w={LINE} d={L * 2} color={line} />
          <Line x={0} z={s * (L - LINE / 2)} w={W * 2} d={LINE} color={line} />
          <Line x={0} z={s * (K - LINE / 2)} w={W * 2} d={LINE} color={line} />
          <Line x={0} z={(s * (K + L)) / 2} w={LINE} d={L - K} color={line} />
        </group>
      ))}
    </group>
  );
};

/** 白天天空球 */
export const DaySky = ({ radius = 130 }: { radius?: number }) => {
  const tex = daySkyTexture();
  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
};

/** 白天的太陽＋天光（陰影範圍只框住球場附近） */
export const DayLights = ({ lowSpec, sun = [-6, 26, 8] }: { lowSpec: boolean; sun?: [number, number, number] }) => (
  <>
    <hemisphereLight args={['#d6e8ff', '#6a7a6f', 1.05]} />
    <ambientLight intensity={0.15} />
    <directionalLight
      position={sun}
      intensity={3.6}
      color="#fff3df"
      castShadow
      shadow-mapSize={lowSpec ? [1024, 1024] : [2048, 2048]}
      shadow-camera-left={-20}
      shadow-camera-right={20}
      shadow-camera-top={20}
      shadow-camera-bottom={-20}
      shadow-camera-near={2}
      shadow-camera-far={60}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
    />
  </>
);

/** 一個方塊（常用的牆、柱、車身） */
export const Box = ({
  p,
  s,
  color,
  rough = 0.85,
  metal = 0,
  shadow = true,
  map,
}: {
  p: [number, number, number];
  s: [number, number, number];
  color?: string;
  rough?: number;
  metal?: number;
  shadow?: boolean;
  map?: THREE.Texture;
}) => (
  <mesh position={p} castShadow={shadow} receiveShadow={shadow}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={color} map={map} roughness={rough} metalness={metal} />
  </mesh>
);
