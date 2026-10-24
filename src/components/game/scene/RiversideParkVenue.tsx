import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { COURT } from '../engine/constants';
import { Net } from './Stadium';
import { buildingTexture, courtTexture, grassTexture, netTexture, treelineTexture } from './textures';
import { Box, CourtPlate, DayLights, DaySky, Instanced } from './venueKit';
import { type Inst, rng, useSkyline } from './venueUtils';

/**
 * 新北大都會公園河濱匹克球中心：河濱高灘地上的 8 面專用場，
 * 深藍外場＋淺藍廚房，整片綠色場地，場與場之間是低矮的綠色鐵絲網，
 * 外圍是高燈柱、停車場、紅白帳篷、草地與樹，再遠是堤防和對岸的大樓。
 * 比賽用的那面在原點，鏡頭在玩家身後往 −z 看。
 */

const W = COURT.halfWidth;
const L = COURT.halfLength;
/** 球場排列：4 欄 × 2 排（我們在第二欄、前排） */
const COL = W * 2 + 3.4;
const ROW = L * 2 + 5;
const XS = [-COL, 0, COL, COL * 2];
const ZS = [0, -ROW];
const PAD_X0 = XS[0] - W - 2.4;
const PAD_X1 = XS[3] + W + 2.4;
const PAD_Z0 = ZS[1] - L - 3.2;
const PAD_Z1 = L + 3.6;
const PAD_W = PAD_X1 - PAD_X0;
const PAD_D = PAD_Z1 - PAD_Z0;
const PAD_CX = (PAD_X0 + PAD_X1) / 2;
const PAD_CZ = (PAD_Z0 + PAD_Z1) / 2;

const OUTER = '#2f5fae';
const KITCHEN = '#4d9be0';
const PAD = '#3d7a4e';

/** 綠色鐵絲網（低矮的場間隔網＋外圍較高的圍網） */
const Fences = () => {
  const items = useMemo(() => {
    const low: { x: number; z: number; len: number; along: 'x' | 'z'; h: number }[] = [];
    // 欄與欄之間（沿 z 方向）
    for (let i = 0; i < XS.length - 1; i++) {
      const x = (XS[i] + XS[i + 1]) / 2;
      for (const z of ZS) low.push({ x, z, len: L * 2 + 2, along: 'z', h: 1.1 });
    }
    // 兩排之間（沿 x 方向）
    low.push({ x: PAD_CX, z: (ZS[0] + ZS[1]) / 2, len: PAD_W - 1, along: 'x', h: 1.1 });
    // 外圍圍網
    low.push({ x: PAD_CX, z: PAD_Z0, len: PAD_W, along: 'x', h: 1.8 });
    low.push({ x: PAD_CX, z: PAD_Z1, len: PAD_W, along: 'x', h: 1.8 });
    low.push({ x: PAD_X0, z: PAD_CZ, len: PAD_D, along: 'z', h: 1.8 });
    low.push({ x: PAD_X1, z: PAD_CZ, len: PAD_D, along: 'z', h: 1.8 });
    return low;
  }, []);
  const posts = useMemo(() => {
    const out: Inst[] = [];
    for (const f of items) {
      const n = Math.max(2, Math.round(f.len / 2.5));
      for (let i = 0; i <= n; i++) {
        const t = -f.len / 2 + (f.len * i) / n;
        out.push({ p: f.along === 'x' ? [f.x + t, f.h / 2, f.z] : [f.x, f.h / 2, f.z + t], s: [1, f.h, 1] });
      }
    }
    return out;
  }, [items]);
  const postGeo = useMemo(() => new THREE.CylinderGeometry(0.035, 0.035, 1, 8), []);
  const postMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9aa1a3', metalness: 0.6, roughness: 0.4 }), []);
  const mesh = (len: number, h: number) => {
    const t = netTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(len / 0.12, h / 0.12);
    return t;
  };
  return (
    <group>
      <Instanced items={posts} geometry={postGeo} material={postMat} castShadow />
      {items.map((f, i) => (
        <mesh key={i} position={[f.x, f.h / 2, f.z]} rotation={[0, f.along === 'z' ? Math.PI / 2 : 0, 0]}>
          <planeGeometry args={[f.len, f.h]} />
          <meshBasicMaterial map={mesh(f.len, f.h)} transparent opacity={0.55} color="#2e5a3a" side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

/** 場地：綠色底＋8 面雙色藍球場，其他場也掛網 */
const Courts = () => {
  const pad = courtTexture(PAD, 'riverside-pad', [PAD_W / 4, PAD_D / 4]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PAD_CX, 0, PAD_CZ]} receiveShadow>
        <planeGeometry args={[PAD_W, PAD_D]} />
        <meshStandardMaterial map={pad} roughness={0.85} />
      </mesh>
      {XS.flatMap((x) => ZS.map((z) => <CourtPlate key={`${x},${z}`} x={x} z={z} color={OUTER} kitchen={KITCHEN} />))}
      {/* 其他場的網子：簡單的網柱＋黑色網面 */}
      {XS.flatMap((x) =>
        ZS.filter((z) => x !== 0 || z !== 0).map((z) => (
          <group key={`n${x},${z}`} position={[x, 0, z]}>
            {[1, -1].map((s) => (
              <Box key={s} p={[s * (W + 0.3), 0.46, 0]} s={[0.05, 0.92, 0.05]} color="#2b2f33" metal={0.5} rough={0.4} />
            ))}
            <mesh position={[0, 0.62, 0]}>
              <planeGeometry args={[W * 2 + 0.6, 0.6]} />
              <meshBasicMaterial color="#141618" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <Box p={[0, 0.9, 0]} s={[W * 2 + 0.6, 0.05, 0.02]} color="#f2f2f2" shadow={false} />
          </group>
        )),
      )}
      {/* 場邊水泥走道（照片下方那條灰色步道） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PAD_CX, 0.002, PAD_Z1 + 2.6]} receiveShadow>
        <planeGeometry args={[PAD_W + 10, 4.6]} />
        <meshStandardMaterial color="#b8b7b0" roughness={0.95} />
      </mesh>
    </group>
  );
};

/** 高燈柱：場地四周每隔一段一支 */
const LightPoles = () => {
  const poles: [number, number][] = [];
  for (const x of [PAD_X0 + 0.6, PAD_X1 - 0.6]) for (const z of [PAD_Z0 + 2, PAD_CZ, PAD_Z1 - 2]) poles.push([x, z]);
  for (let i = 0; i < XS.length - 1; i++) poles.push([(XS[i] + XS[i + 1]) / 2, (ZS[0] + ZS[1]) / 2]);
  return (
    <group>
      {poles.map(([x, z]) => (
        <group key={`${x},${z}`} position={[x, 0, z]}>
          <mesh position={[0, 5.5, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 11, 10]} />
            <meshStandardMaterial color="#c7cbcd" metalness={0.6} roughness={0.35} />
          </mesh>
          <Box p={[0, 11.1, 0]} s={[0.9, 0.25, 0.5]} color="#e7e9ea" metal={0.3} rough={0.4} />
        </group>
      ))}
    </group>
  );
};

/** 凹凸不平的球體：樹冠 */
const lumpy = () => {
  const base = new THREE.IcosahedronGeometry(1, 2);
  base.deleteAttribute('normal');
  base.deleteAttribute('uv');
  const geo = mergeVertices(base);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = Math.sin(v.x * 5.1) * Math.sin(v.y * 4.3 + 1) * Math.sin(v.z * 4.7 + 2);
    v.multiplyScalar(1 + n * 0.18);
    if (v.y < -0.3) v.y = -0.3 + (v.y + 0.3) * 0.5;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
};

/** 草地、樹、停車場、帳篷、堤防、遠方大樓 */
const Grounds = ({ lowSpec }: { lowSpec: boolean }) => {
  const grass = useMemo(() => {
    const t = grassTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(50, 50);
    return t;
  }, []);
  const trees = useMemo(() => {
    const r = rng(7);
    const crowns: Inst[] = [];
    const trunks: Inst[] = [];
    const n = lowSpec ? 22 : 40;
    for (let i = 0; i < n; i++) {
      // 場地後方與兩側的一排排樹
      const side = i % 3;
      const x = side === 0 ? PAD_X0 - 6 - r() * 18 : side === 1 ? PAD_X1 + 6 + r() * 14 : PAD_CX - 40 + r() * 80;
      const z = side === 2 ? PAD_Z0 - 8 - r() * 22 : PAD_Z0 + r() * (PAD_D + 10);
      const s = 2 + r() * 2.2;
      crowns.push({ p: [x, 2.6 + s * 0.8, z], s: [s * 1.2, s, s * 1.2], c: ['#3f6b35', '#4b7a3b', '#365f2f'][i % 3] });
      trunks.push({ p: [x, 1.4, z], s: [1, 2.8, 1] });
    }
    return { crowns, trunks };
  }, [lowSpec]);
  const crownGeo = useMemo(lumpy, []);
  const crownMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.95 }), []);
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.16, 0.22, 1, 8), []);
  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5b4636', roughness: 0.95 }), []);
  const cars = useMemo(() => {
    const r = rng(3);
    const out: Inst[] = [];
    const tones = ['#e5e7eb', '#1f2937', '#9ca3af', '#f8fafc', '#334155', '#b91c1c', '#d1d5db'];
    for (let i = 0; i < (lowSpec ? 6 : 11); i++) out.push({ p: [PAD_X0 + 4 + i * 2.6, 0.62, PAD_Z0 - 4.5 - r() * 0.6], s: [1.8, 1.2, 4.3], c: tones[i % tones.length] });
    return out;
  }, [lowSpec]);
  const carGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const carMat = useMemo(() => new THREE.MeshStandardMaterial({ metalness: 0.45, roughness: 0.35 }), []);
  const city = useSkyline(41, lowSpec ? 10 : 18, { r0: 105, r1: 122, a0: -1.2, a1: 1.2, h0: 15, h1: 55 });
  const cityMat = useMemo(() => {
    const t = buildingTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(2, 5);
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 });
  }, []);
  const tl = treelineTexture();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[260, 260]} />
        <meshStandardMaterial map={grass} roughness={1} />
      </mesh>
      {/* 停車場 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PAD_CX - 6, 0.003, PAD_Z0 - 5]} receiveShadow>
        <planeGeometry args={[34, 8]} />
        <meshStandardMaterial color="#8e9090" roughness={0.95} />
      </mesh>
      <Instanced items={cars} geometry={carGeo} material={carMat} castShadow />
      <Instanced items={trees.trunks} geometry={trunkGeo} material={trunkMat} castShadow />
      <Instanced items={trees.crowns} geometry={crownGeo} material={crownMat} castShadow />
      {/* 紅白帳篷（活動攤位） */}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[PAD_CX + 8 + i * 3.4, 0, PAD_Z0 - 4]}>
          <mesh position={[0, 2.5, 0]} castShadow>
            <coneGeometry args={[2.1, 0.9, 4]} />
            <meshStandardMaterial color={i % 2 ? '#f5f5f4' : '#dc2626'} roughness={0.7} />
          </mesh>
          {[
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
          ].map(([a, b]) => (
            <Box key={`${a}${b}`} p={[a * 1.4, 1.03, b * 1.4]} s={[0.05, 2.05, 0.05]} color="#d4d4d4" metal={0.5} shadow={false} />
          ))}
        </group>
      ))}
      {/* 堤防：場地右側遠方的長斜坡水泥牆，堤頂有一條路 */}
      <mesh position={[PAD_X1 + 28, 3, PAD_CZ]} rotation={[0, 0, 0.5]} receiveShadow>
        <boxGeometry args={[14, 1.2, 220]} />
        <meshStandardMaterial color="#b5b6b1" roughness={0.95} />
      </mesh>
      <Box p={[PAD_X1 + 37, 6.2, PAD_CZ]} s={[6, 0.6, 220]} color="#9b9d9b" shadow={false} />
      {/* 對岸的大樓群與一圈樹林剪影 */}
      <Instanced items={city} geometry={carGeo} material={cityMat} />
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[98, 98, 14, 64, 1, true]} />
        <meshBasicMaterial map={tl} transparent alphaTest={0.4} side={THREE.BackSide} fog={false} color="#b9c8b8" />
      </mesh>
    </group>
  );
};

export const RiversideParkVenue = ({ lowSpec }: { lowSpec: boolean }) => (
  <group>
    <DaySky radius={135} />
    <DayLights lowSpec={lowSpec} sun={[8, 26, 6]} />
    <Courts />
    <Net />
    <Fences />
    <LightPoles />
    <Grounds lowSpec={lowSpec} />
  </group>
);
