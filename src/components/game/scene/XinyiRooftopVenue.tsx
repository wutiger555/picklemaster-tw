import { useMemo } from 'react';
import * as THREE from 'three';
import { COURT } from '../engine/constants';
import { Net } from './Stadium';
import { buildingTexture, courtTexture, grainBump, netTexture } from './textures';
import { Box, CourtPlate, DayLights, DaySky, Instanced } from './venueKit';
import { type Inst, useSkyline } from './venueUtils';

/**
 * 台北市信義運動中心頂樓匹克球場：大樓屋頂上的綠色硬地，
 * 四周和頭頂是鋼管骨架拉的黑色防護網，網外就是信義區的大樓，正前方遠處是台北 101。
 * 鏡頭在玩家身後往 −z 看。
 */

const W = COURT.halfWidth;
const L = COURT.halfLength;
/** 防護網籠子的半寬、半長、高度 */
const CX = W + 3;
const CZ = L + 4.2;
/** 籠子要比直拿手機的比賽鏡頭（約 8.6 m）還高，鏡頭才會在網內、不會被頂上的鋼管擋住 */
const CH = 9.2;
const ROOF_X = 22;
const ROOF_Z = 30;

const STEEL = '#8e959c';

/** 鋼管骨架：立柱、頂上橫樑、牆頂縱樑 */
const CageFrame = () => {
  const { posts, beams, rails } = useMemo(() => {
    const posts: Inst[] = [];
    const beams: Inst[] = [];
    const rails: Inst[] = [];
    const zs: number[] = [];
    for (let z = -CZ; z <= CZ + 0.01; z += (CZ * 2) / 6) zs.push(z);
    for (const z of zs)
      for (const s of [1, -1]) {
        posts.push({ p: [s * CX, CH / 2, z], s: [1, CH, 1] });
      }
    // 橫跨頭頂的鋼管：圓柱預設是直的，轉 90° 躺平，再往中間抬一點成拱形
    for (const z of zs) {
      for (const s of [1, -1]) beams.push({ p: [(s * CX) / 2, CH + 0.35, z], r: [0, 0, s * (Math.PI / 2 - 0.12)], s: [1, CX * 1.01, 1] });
    }
    for (const s of [1, -1]) {
      rails.push({ p: [s * CX, CH, 0], r: [Math.PI / 2, 0, 0], s: [1, CZ * 2, 1] });
      rails.push({ p: [s * CX, 1.6, 0], r: [Math.PI / 2, 0, 0], s: [0.7, CZ * 2, 0.7] });
    }
    for (const s of [1, -1]) rails.push({ p: [0, CH, s * CZ], r: [0, 0, Math.PI / 2], s: [1, CX * 2, 1] });
    return { posts, beams, rails };
  }, []);
  const pipe = useMemo(() => new THREE.CylinderGeometry(0.07, 0.07, 1, 10), []);
  const thin = useMemo(() => new THREE.CylinderGeometry(0.05, 0.05, 1, 8), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: STEEL, metalness: 0.7, roughness: 0.35 }), []);
  return (
    <group>
      <Instanced items={posts} geometry={pipe} material={mat} castShadow />
      <Instanced items={beams} geometry={pipe} material={mat} castShadow />
      <Instanced items={rails} geometry={thin} material={mat} castShadow />
    </group>
  );
};

/** 防護網：四面牆＋頂網（黑色細網，半透明）；長邊下半截掛黑色擋風布 */
const CageNet = () => {
  const mk = (w: number, h: number) => {
    const t = netTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(w / 0.12, h / 0.12);
    return t;
  };
  const side = useMemo(() => mk(CZ * 2, CH), []);
  const end = useMemo(() => mk(CX * 2, CH), []);
  const roof = useMemo(() => mk(CX * 2, CZ * 2), []);
  const net = (map: THREE.Texture, opacity: number) => (
    <meshBasicMaterial map={map} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} color="#0b0c0e" />
  );
  return (
    <group>
      {[1, -1].map((s) => (
        <mesh key={`s${s}`} position={[s * CX, CH / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[CZ * 2, CH]} />
          {net(side, 0.5)}
        </mesh>
      ))}
      {/* 端牆只掛遠端那面：鏡頭在玩家身後、籠子外面，近端的網會整片糊在畫面上 */}
      <mesh position={[0, CH / 2, -CZ]}>
        <planeGeometry args={[CX * 2, CH]} />
        {net(end, 0.45)}
      </mesh>
      <mesh position={[0, CH + 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CX * 2, CZ * 2]} />
        {net(roof, 0.35)}
      </mesh>
      {/* 擋風布：長邊下半截 */}
      {[1, -1].map((s) => (
        <mesh key={`w${s}`} position={[s * (CX - 0.02), 0.8, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[CZ * 2, 1.6]} />
          <meshStandardMaterial color="#17191c" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

/** 屋頂：籠內綠色場地、籠外水泥屋面、女兒牆、冷氣主機 */
const Rooftop = () => {
  const pad = courtTexture('#3b6550', 'xinyi-pad', [CX / 2, CZ / 2]);
  const slab = useMemo(() => {
    const t = courtTexture('#9a9c98', 'xinyi-slab', [ROOF_X / 3, ROOF_Z / 3]).clone();
    t.needsUpdate = true;
    return t;
  }, []);
  const bump = grainBump();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[ROOF_X * 2, ROOF_Z * 2]} />
        <meshStandardMaterial map={slab} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[CX * 2, CZ * 2]} />
        <meshStandardMaterial map={pad} bumpMap={bump} bumpScale={0.003} roughness={0.85} />
      </mesh>
      <CourtPlate color="#3f6b56" />
      {/* 女兒牆＋欄杆 */}
      {[1, -1].map((s) => (
        <group key={s}>
          <Box p={[s * ROOF_X, 0.55, 0]} s={[0.3, 1.1, ROOF_Z * 2]} color="#c8c6bf" />
          <Box p={[0, 0.55, s * ROOF_Z]} s={[ROOF_X * 2, 1.1, 0.3]} color="#c8c6bf" />
        </group>
      ))}
      {/* 冷氣主機與水塔 */}
      <Box p={[CX + 5, 0.9, -8]} s={[3.2, 1.8, 2.2]} color="#d7d9d6" />
      <Box p={[CX + 5, 0.9, -4.6]} s={[3.2, 1.8, 2.2]} color="#d7d9d6" />
      <Box p={[-(CX + 6), 1.4, 10]} s={[2.6, 2.8, 2.6]} color="#bfc4c7" />
      {/* 樓梯間：籠子旁邊的白色小屋 */}
      <Box p={[-(CX + 5.5), 1.8, -12]} s={[6, 3.6, 5]} color="#eceee9" />
      <Box p={[-(CX + 2.45), 1.1, -12]} s={[0.08, 2.2, 1.2]} color="#5b6168" />
    </group>
  );
};

/** 台北 101：基座＋八節往外撐的「竹節」＋頂部塔身與尖塔 */
const Taipei101 = ({ x, z, scale }: { x: number; z: number; scale: number }) => {
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7fb3ab', metalness: 0.3, roughness: 0.3, fog: false }), []);
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9fb5b0', metalness: 0.4, roughness: 0.4, fog: false }), []);
  const seg = useMemo(() => new THREE.CylinderGeometry(1.25, 0.95, 1, 4, 1), []);
  const S = scale;
  const base = 18 * S;
  const segH = 8.5 * S;
  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI / 4, 0]}>
      {/* 基座與下段塔身（梯形往上收） */}
      <mesh position={[0, base / 2, 0]} material={glass}>
        <cylinderGeometry args={[7.5 * S, 10 * S, base, 4, 1]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[0, base + segH * (i + 0.5), 0]} scale={[7.6 * S, segH, 7.6 * S]}>
          <mesh geometry={seg} material={glass} />
          {/* 每節頂端一圈亮色的框 */}
          <mesh position={[0, 0.5, 0]} material={frame}>
            <cylinderGeometry args={[1.28, 1.28, 0.06, 4, 1]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, base + segH * 8 + 4 * S, 0]} material={glass}>
        <cylinderGeometry args={[3 * S, 4.2 * S, 8 * S, 4, 1]} />
      </mesh>
      <mesh position={[0, base + segH * 8 + 14 * S, 0]} material={frame}>
        <cylinderGeometry args={[0.25 * S, 0.6 * S, 14 * S, 6, 1]} />
      </mesh>
    </group>
  );
};

/** 拿掉擋在 101 前面的高樓（101 在正前方偏右） */
const clearView = (items: Inst[]) => items.filter((it) => Math.abs(Math.atan2(it.p[0] - 7, -it.p[2])) > 0.22 || it.p[1] * 2 < 18);

/** 信義區的大樓群（遠景）＋一支施工塔吊 */
const Skyline = ({ lowSpec }: { lowSpec: boolean }) => {
  // 往 101 那個方向（正前方偏右）不放大樓，免得把 101 擋住
  const nearAll = useSkyline(11, lowSpec ? 14 : 24, { r0: 45, r1: 80, a0: -1.6, a1: 1.6, h0: 14, h1: 70 });
  const farAll = useSkyline(29, lowSpec ? 10 : 20, { r0: 85, r1: 118, a0: -2.2, a1: 2.2, h0: 20, h1: 90 });
  const near = useMemo(() => clearView(nearAll), [nearAll]);
  const far = useMemo(() => clearView(farAll), [farAll]);
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => {
    const t = buildingTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(2, 6);
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.15 });
  }, []);
  return (
    <group>
      <Instanced items={near} geometry={geo} material={mat} />
      <Instanced items={far} geometry={geo} material={mat} />
      {/* 塔吊：101 旁邊正在蓋的大樓 */}
      <group position={[-16, 0, -78]}>
        <Box p={[0, 30, 0]} s={[22, 60, 22]} color="#cfd3d4" shadow={false} />
        <Box p={[0, 68, 0]} s={[1.2, 16, 1.2]} color="#d23b2a" shadow={false} />
        <Box p={[6, 76, 0]} s={[26, 1, 1]} color="#d23b2a" shadow={false} />
      </group>
      {/* 球場旁邊那棟白色大樓（照片右手邊） */}
      <Box p={[ROOF_X + 9, 9, -6]} s={[14, 30, 22]} map={mat.map ?? undefined} color="#f1f2ef" shadow={false} />
    </group>
  );
};

export const XinyiRooftopVenue = ({ lowSpec }: { lowSpec: boolean }) => (
  <group>
    <DaySky radius={140} />
    {/* 太陽偏西南，鋼管的影子斜斜落在場上 */}
    <DayLights lowSpec={lowSpec} sun={[-10, 24, 10]} />
    <Rooftop />
    <Net />
    <CageFrame />
    <CageNet />
    <Skyline lowSpec={lowSpec} />
    <Taipei101 x={7} z={-112} scale={0.85} />
  </group>
);
