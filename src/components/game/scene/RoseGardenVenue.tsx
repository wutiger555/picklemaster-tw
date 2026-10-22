import { type MutableRefObject, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { COURT } from '../engine/constants';
import { Net } from './Stadium';
import {
  badmintonLinesTexture,
  buildingTexture,
  daySkyTexture,
  gardenSignTexture,
  glowTexture,
  graniteTexture,
  grainBump,
  grassTexture,
  hedgeTexture,
  palmFrondTexture,
  treelineTexture,
  wornCourtTexture,
} from './textures';

/**
 * 新生公園羽毛球場（台北玫瑰園旁）：白天的戶外硬地場。
 * 中間那面羽毛球場加貼匹克球線來比賽，前後各一面羽毛球場。
 */

const W = COURT.halfWidth;
const L = COURT.halfLength;
const K = COURT.kitchen;
const LINE = COURT.lineWidth;

/*
 * 實際方位（Google 街景確認）：一條南北向的窄長場地，羽毛球場頭尾相接排成一列。
 * 鏡頭在玩家身後往北看：−z = 北、+x = 東、−x = 西。
 * 西邊是花崗岩矮牆＋樹籬、紅磚人行道、新生北路與高架道路；
 * 東邊只有低矮緣石，外面是草地、噴水池、玫瑰花圃，東北角是蘑菇柱，再過去是白色建築。
 */
/** 相鄰球場中心的距離（頭尾相接，中間留一點走道） */
const COURT_STEP = L * 2 + 2.4;
const COURTS_Z = [-COURT_STEP, 0, COURT_STEP];
/** 綠色場地：寬度只比一面球場多一點，南北很長 */
const PAD_X = W + 1.5;
const PAD_N = -(COURT_STEP + L + 2.2);
const PAD_S = COURT_STEP + L + 2.2;
const PAD_LEN = PAD_S - PAD_N;
const PAD_MID = (PAD_S + PAD_N) / 2;
const SIDEWALK_X = -(PAD_X + 3.7);
const ROAD_X = SIDEWALK_X - 8.3;
const VIADUCT_X = ROAD_X - 2;
const FOUNTAIN: [number, number] = [13, -2];

/** 可重複的偽亂數：每次載入的佈置都一樣 */
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

const tmp = new THREE.Object3D();
const tmpColor = new THREE.Color();

interface Inst {
  p: [number, number, number];
  r?: [number, number, number];
  s: [number, number, number] | number;
  c?: string;
}

/** 一批相同幾何的物件：一次 draw call */
const Instanced = ({
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

/** 凹凸不平的球體：樹冠、灌木 */
const lumpyGeometry = (seed: number) => {
  const base = new THREE.IcosahedronGeometry(1, 3);
  base.deleteAttribute('normal');
  base.deleteAttribute('uv');
  const geo = mergeVertices(base);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = Math.sin(v.x * 5.1 + seed) * Math.sin(v.y * 4.3 + seed * 2) * Math.sin(v.z * 4.7 + seed * 3);
    const n2 = Math.sin(v.x * 11 + v.z * 9 + seed) * 0.04;
    v.multiplyScalar(1 + n * 0.16 + n2);
    // 底部壓平一點，比較像樹冠
    if (v.y < -0.3) v.y = -0.3 + (v.y + 0.3) * 0.55;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
};

// ───────────────────────────── 球場 ─────────────────────────────

const PB_TAPE = '#f2c230';

const Tape = ({ x, z, w, d }: { x: number; z: number; w: number; d: number }) => (
  <mesh position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[w, d]} />
    <meshStandardMaterial color={PB_TAPE} roughness={0.5} />
  </mesh>
);

/** 羽毛球網柱（其他場地沒掛網，只剩柱子，街景裡就是這樣） */
const BadmintonPosts = ({ z }: { z: number }) => (
  <group position={[0, 0, z]}>
    {[1, -1].map((s) => (
      <mesh key={s} position={[s * (W + 0.05), 0.775, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 1.55, 12]} />
        <meshStandardMaterial color="#c9ccd1" metalness={0.8} roughness={0.3} />
      </mesh>
    ))}
  </group>
);

const Courts = () => {
  const surface = useMemo(() => {
    const t = wornCourtTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(PAD_X / 4, PAD_LEN / 8);
    return t;
  }, []);
  const bump = grainBump();
  const lines = badmintonLinesTexture();
  const granite = useMemo(() => {
    const t = graniteTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(1, 40);
    return t;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, PAD_MID]} receiveShadow>
        <planeGeometry args={[PAD_X * 2, PAD_LEN]} />
        <meshStandardMaterial map={surface} bumpMap={bump} bumpScale={0.004} roughness={0.85} />
      </mesh>
      {COURTS_Z.map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, z]} receiveShadow>
          <planeGeometry args={[W * 2, L * 2]} />
          <meshStandardMaterial map={lines} transparent depthWrite={false} roughness={0.6} />
        </mesh>
      ))}
      {/* 匹克球線：黃色膠帶貼在羽毛球線上（外框共用，再加廚房線與中線） */}
      {[1, -1].map((s) => (
        <group key={s}>
          <Tape x={s * (W - LINE / 2)} z={0} w={LINE} d={L * 2} />
          <Tape x={0} z={s * (L - LINE / 2)} w={W * 2} d={LINE} />
          <Tape x={0} z={s * (K - LINE / 2)} w={W * 2} d={LINE} />
          <Tape x={0} z={(s * (K + L)) / 2} w={LINE} d={L - K} />
        </group>
      ))}
      {COURTS_Z.filter((z) => z !== 0).map((z) => (
        <BadmintonPosts key={z} z={z} />
      ))}
      {/* 西側（人行道那邊）：排水溝蓋＋花崗岩矮牆 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(PAD_X - 0.2), 0.003, PAD_MID]}>
        <planeGeometry args={[0.22, PAD_LEN]} />
        <meshStandardMaterial color="#3a403d" roughness={0.9} />
      </mesh>
      <mesh position={[-(PAD_X + 0.2), 0.2, PAD_MID]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.4, PAD_LEN]} />
        <meshStandardMaterial map={granite} roughness={0.75} />
      </mesh>
      {/* 東側（草地那邊）只有低矮緣石 */}
      <mesh position={[PAD_X + 0.12, 0.1, PAD_MID]} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.2, PAD_LEN]} />
        <meshStandardMaterial color="#a9a8a0" roughness={0.85} />
      </mesh>
    </group>
  );
};

// ───────────────────────────── 地面：草地、人行道、新生北路與高架橋 ─────────────────────────────

const Grounds = ({ lowSpec }: { lowSpec: boolean }) => {
  const grass = useMemo(() => {
    const t = grassTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(40, 40);
    return t;
  }, []);
  const hedgeLong = useMemo(() => {
    const t = hedgeTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(30, 1);
    return t;
  }, []);
  const hedgeShort = useMemo(() => {
    const t = hedgeTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(6, 1);
    return t;
  }, []);
  const tl = treelineTexture();
  const pillars = useMemo(() => {
    const out: number[] = [];
    for (let z = -84; z <= 60; z += 24) out.push(z);
    return out;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[240, 240]} />
        <meshStandardMaterial map={grass} roughness={1} />
      </mesh>
      {/* 西側樹籬（在矮牆跟球場之間） */}
      <mesh position={[-(PAD_X + 0.95), 0.45, PAD_MID]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.9, PAD_LEN + 2]} />
        <meshStandardMaterial map={hedgeLong} roughness={0.95} />
      </mesh>
      {/* 南北兩端的樹籬 */}
      {[PAD_N - 0.9, PAD_S + 0.9].map((z) => (
        <mesh key={z} position={[0, 0.45, z]} castShadow receiveShadow>
          <boxGeometry args={[PAD_X * 2 + 2.2, 0.9, 1.1]} />
          <meshStandardMaterial map={hedgeShort} roughness={0.95} />
        </mesh>
      ))}
      {/* 西側花崗岩外牆＋紅磚人行道 */}
      <mesh position={[-(PAD_X + 1.7), 0.35, PAD_MID]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.7, PAD_LEN + 2]} />
        <meshStandardMaterial map={graniteTexture()} roughness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SIDEWALK_X, 0.01, -10]} receiveShadow>
        <planeGeometry args={[3.6, 150]} />
        <meshStandardMaterial color="#8d7f78" roughness={0.95} />
      </mesh>
      {/* 新生北路：路面＋車道線 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ROAD_X, 0.005, -10]} receiveShadow>
        <planeGeometry args={[13, 150]} />
        <meshStandardMaterial color="#5d6064" roughness={0.95} />
      </mesh>
      {[-3, 1.5].map((dx) =>
        Array.from({ length: 25 }, (_, i) => (
          <mesh key={`${dx}-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[ROAD_X + dx, 0.012, -84 + i * 6]}>
            <planeGeometry args={[0.15, 3]} />
            <meshStandardMaterial color="#e8e8e2" roughness={0.8} />
          </mesh>
        )),
      )}
      {/* 新生高架道路：橋面＋護欄＋橋墩 */}
      <group position={[VIADUCT_X, 0, 0]}>
        <mesh position={[0, 7.6, -10]} castShadow receiveShadow>
          <boxGeometry args={[11, 1.2, 150]} />
          <meshStandardMaterial color="#b4b2aa" roughness={0.9} />
        </mesh>
        {[-5.3, 5.3].map((dx) => (
          <mesh key={dx} position={[dx, 8.75, -10]}>
            <boxGeometry args={[0.3, 1.1, 150]} />
            <meshStandardMaterial color="#c9c7bf" roughness={0.85} />
          </mesh>
        ))}
        {pillars.map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh position={[0, 3.5, 0]} castShadow>
              <boxGeometry args={[1.6, 7, 1.6]} />
              <meshStandardMaterial color="#a8a69e" roughness={0.9} />
            </mesh>
            <mesh position={[0, 6.7, 0]}>
              <boxGeometry args={[7, 0.8, 1.8]} />
              <meshStandardMaterial color="#a8a69e" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
      {/* 北端廣場與往白色建築的車道 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0.006, PAD_N - 7]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#c3beb2" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, 0.007, -50]} receiveShadow>
        <planeGeometry args={[7, 50]} />
        <meshStandardMaterial color="#a9aaa6" roughness={0.95} />
      </mesh>
      {!lowSpec && <ParkedCars />}
      {/* 遠方一圈樹林剪影，接到天空 */}
      <mesh position={[0, 7, 0]}>
        <cylinderGeometry args={[100, 100, 22, 64, 1, true]} />
        <meshBasicMaterial map={tl} transparent alphaTest={0.4} side={THREE.BackSide} fog={false} color="#c2d2c2" />
      </mesh>
    </group>
  );
};

/** 路邊停的幾台車（簡單的方塊車身＋車窗） */
const ParkedCars = () => {
  const cars: [number, string][] = [
    [-30, '#e5e7eb'],
    [-22, '#1f2937'],
    [-8, '#b91c1c'],
    [6, '#d1d5db'],
    [20, '#334155'],
  ];
  return (
    <group>
      {cars.map(([z, c]) => (
        <group key={z} position={[ROAD_X + 5.2, 0, z]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.75, 0.7, 4.3]} />
            <meshStandardMaterial color={c} metalness={0.4} roughness={0.35} />
          </mesh>
          <mesh position={[0, 1.1, -0.2]}>
            <boxGeometry args={[1.55, 0.5, 2.3]} />
            <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.15} />
          </mesh>
          {[-1.4, 1.4].map((dz) =>
            [-0.8, 0.8].map((dx) => (
              <mesh key={`${dz}${dx}`} position={[dx, 0.3, dz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
                <meshStandardMaterial color="#111" roughness={0.8} />
              </mesh>
            )),
          )}
        </group>
      ))}
    </group>
  );
};

/** 玫瑰花圃：矮樹籬框＋紅、粉、黃的花點 */
const ROSE_BEDS: [number, number, number, number][] = [
  [9.5, 7, 5, 2.2],
  [9.5, 11, 5, 2.2],
  [16, 7, 5, 2.2],
  [16, 11, 5, 2.2],
];

const RoseBeds = ({ lowSpec }: { lowSpec: boolean }) => {
  const res = useMemo(
    () => ({
      geo: new THREE.IcosahedronGeometry(1, 1),
      mat: new THREE.MeshStandardMaterial({ roughness: 0.6 }),
      bush: lumpyGeometry(8.1),
      leaf: new THREE.MeshStandardMaterial({ color: '#3f6a2e', roughness: 0.95 }),
    }),
    [],
  );
  const { flowers, bushes } = useMemo(() => {
    const r = rng(314);
    const cols = ['#d61f3c', '#e8487a', '#f59ab5', '#c0122d', '#f6c343', '#fff1f2'];
    const f: Inst[] = [];
    const b: Inst[] = [];
    for (const [x, z, w, d] of ROSE_BEDS) {
      const n = Math.round(w * d * (lowSpec ? 3 : 7));
      for (let i = 0; i < n; i++) {
        const px = x + (r() - 0.5) * (w - 0.4);
        const pz = z + (r() - 0.5) * (d - 0.4);
        b.push({ p: [px, 0.25, pz], s: [0.28, 0.3, 0.28] });
        f.push({ p: [px + (r() - 0.5) * 0.1, 0.5 + r() * 0.12, pz + (r() - 0.5) * 0.1], s: 0.07 + r() * 0.04, c: cols[Math.floor(r() * cols.length)] });
      }
    }
    return { flowers: f, bushes: b };
  }, [lowSpec]);
  return (
    <group>
      {ROSE_BEDS.map(([x, z, w, d]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.07, 0]} receiveShadow>
            <boxGeometry args={[w + 0.24, 0.14, d + 0.24]} />
            <meshStandardMaterial color="#b9b6ae" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.085, 0]} receiveShadow>
            <boxGeometry args={[w, 0.17, d]} />
            <meshStandardMaterial color="#5a4636" roughness={1} />
          </mesh>
        </group>
      ))}
      <Instanced key={`rb${lowSpec}`} items={bushes} geometry={res.bush} material={res.leaf} />
      <Instanced key={`rf${lowSpec}`} items={flowers} geometry={res.geo} material={res.mat} />
    </group>
  );
};

/** 北端的園區立牌 */
const GardenSign = ({ x, z }: { x: number; z: number }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
      <boxGeometry args={[6.6, 0.6, 1]} />
      <meshStandardMaterial map={graniteTexture()} roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.9, 0]} castShadow>
      <boxGeometry args={[6.2, 2.6, 0.24]} />
      <meshStandardMaterial color="#1f3d2c" roughness={0.6} />
    </mesh>
    <mesh position={[0, 1.9, 0.125]}>
      <planeGeometry args={[6, 2.34]} />
      <meshStandardMaterial map={gardenSignTexture()} roughness={0.55} />
    </mesh>
  </group>
);

// ───────────────────────────── 樹木 ─────────────────────────────

const PALM_FRONDS = 9;

const buildPalmFrond = () => {
  const len = 3.6;
  const geo = new THREE.PlaneGeometry(1.2, len, 1, 10);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) + len / 2;
    const x = pos.getX(i);
    // 先往外上揚，再往下垂
    pos.setXYZ(i, x * (0.4 + (y / len) * 0.6), y * 0.55 - y * y * 0.17, y * 0.92);
  }
  geo.computeVertexNormals();
  return geo;
};

const Trees = ({ lowSpec }: { lowSpec: boolean }) => {
  const data = useMemo(() => {
    const r = rng(2024);
    const palms: { x: number; z: number; h: number }[] = [];
    // 北邊車道兩側的大王椰子，一路排到白色建築
    for (let z = PAD_N - 2; z > -80; z -= lowSpec ? 7 : 4.6) {
      palms.push({ x: 4 + (r() - 0.5) * 0.3, z, h: 11 + r() * 3.5 });
      palms.push({ x: 12 + (r() - 0.5) * 0.3, z: z - 2, h: 11 + r() * 3.5 });
    }
    // 闊葉大樹：西側人行道的行道樹，加上東側草地與北邊
    const trees: { x: number; z: number; s: number; c: number }[] = [];
    for (let z = -44; z <= 40; z += lowSpec ? 12 : 8) trees.push({ x: SIDEWALK_X - 0.8, z: z + r() * 2, s: 0.75 + r() * 0.15, c: r() });
    const spots: [number, number, number][] = [
      [20, -14, 1.5],
      [24, 2, 1.3],
      [19, 20, 1.4],
      [30, -26, 1.6],
      [34, 12, 1.4],
      [-4, -42, 1.4],
      [26, -42, 1.5],
      [40, -6, 1.6],
      [13, 30, 1.3],
      [-12, -52, 1.5],
    ];
    for (const [x, z, s] of lowSpec ? spots.slice(0, 6) : spots) trees.push({ x, z, s: s * (0.9 + r() * 0.25), c: r() });
    // 東側草地上的修剪灌木
    const shrubs: { x: number; z: number; s: number }[] = [];
    for (let i = 0; i < (lowSpec ? 10 : 22); i++) {
      const x = PAD_X + 3 + r() * 20;
      const z = -22 + r() * 44;
      if (Math.hypot(x - FOUNTAIN[0], z - FOUNTAIN[1]) < 4.8) continue;
      if (x > 6.5 && x < 19 && z > 5 && z < 13) continue;
      shrubs.push({ x, z, s: 0.6 + r() * 0.7 });
    }
    return { palms, trees, shrubs };
  }, [lowSpec]);

  const res = useMemo(() => {
    const frond = palmFrondTexture();
    return {
      trunkGeo: new THREE.CylinderGeometry(0.16, 0.24, 1, 10).translate(0, 0.5, 0),
      shaftGeo: new THREE.CylinderGeometry(0.2, 0.2, 1, 10).translate(0, 0.5, 0),
      frondGeo: buildPalmFrond(),
      foliageGeo: lumpyGeometry(1.7),
      shrubGeo: lumpyGeometry(4.2),
      barkGeo: new THREE.CylinderGeometry(0.12, 0.2, 1, 8).translate(0, 0.5, 0),
      blobGeo: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      palmTrunk: new THREE.MeshStandardMaterial({ color: '#b8b4aa', roughness: 0.9 }),
      shaft: new THREE.MeshStandardMaterial({ color: '#7f9a4c', roughness: 0.7 }),
      frondMat: new THREE.MeshStandardMaterial({ map: frond, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.8 }),
      bark: new THREE.MeshStandardMaterial({ color: '#5a4c3f', roughness: 1 }),
      leaf: new THREE.MeshStandardMaterial({ roughness: 0.95 }),
      blob: new THREE.MeshBasicMaterial({ map: glowTexture(), color: '#000000', transparent: true, opacity: 0.32, depthWrite: false }),
    };
  }, []);

  const inst = useMemo(() => {
    const r = rng(7);
    const trunks: Inst[] = [];
    const shafts: Inst[] = [];
    const fronds: Inst[] = [];
    const bark: Inst[] = [];
    const leaves: Inst[] = [];
    const shrubs: Inst[] = [];
    const blobs: Inst[] = [];
    for (const p of data.palms) {
      trunks.push({ p: [p.x, 0, p.z], s: [1, p.h, 1] });
      shafts.push({ p: [p.x, p.h - 0.1, p.z], s: [1, 1.5, 1] });
      const off = r() * Math.PI;
      for (let k = 0; k < PALM_FRONDS; k++) {
        const a = off + (k / PALM_FRONDS) * Math.PI * 2;
        const s = 0.85 + r() * 0.3;
        fronds.push({ p: [p.x, p.h + 1.3, p.z], r: [(r() - 0.5) * 0.3, a, 0], s: [s, s, s] });
      }
      blobs.push({ p: [p.x, 0.005, p.z], s: [3.6, 1, 3.6] });
    }
    const greens = ['#3f6a2e', '#4a7a34', '#56843a', '#365f2a', '#5e8c3f'];
    for (const t of data.trees) {
      const h = 3.2 * t.s;
      bark.push({ p: [t.x, 0, t.z], s: [1.6 * t.s, h + 1, 1.6 * t.s] });
      const n = 5;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + t.c * 6;
        const rad = k === 0 ? 0 : 2.2 * t.s;
        const sz = (k === 0 ? 3.4 : 2.4 + r()) * t.s;
        leaves.push({
          p: [t.x + Math.cos(a) * rad, h + 2.2 * t.s + (k === 0 ? 1.2 : r() * 0.8) * t.s, t.z + Math.sin(a) * rad],
          r: [0, r() * 6, 0],
          s: [sz, sz * 0.78, sz],
          c: greens[(k + Math.floor(t.c * 5)) % greens.length],
        });
      }
      blobs.push({ p: [t.x, 0.006, t.z], s: [11 * t.s, 1, 11 * t.s] });
    }
    for (const s of data.shrubs) {
      shrubs.push({ p: [s.x, s.s * 0.55, s.z], r: [0, r() * 6, 0], s: [s.s, s.s * 0.85, s.s], c: greens[Math.floor(r() * greens.length)] });
      blobs.push({ p: [s.x, 0.006, s.z], s: [s.s * 2.8, 1, s.s * 2.8] });
    }
    return { trunks, shafts, fronds, bark, leaves, shrubs, blobs };
  }, [data]);

  return (
    <group>
      <Instanced key={`b${lowSpec}`} items={inst.blobs} geometry={res.blobGeo} material={res.blob} />
      <Instanced key={`t${lowSpec}`} items={inst.trunks} geometry={res.trunkGeo} material={res.palmTrunk} />
      <Instanced key={`s${lowSpec}`} items={inst.shafts} geometry={res.shaftGeo} material={res.shaft} />
      <Instanced key={`f${lowSpec}`} items={inst.fronds} geometry={res.frondGeo} material={res.frondMat} />
      <Instanced key={`k${lowSpec}`} items={inst.bark} geometry={res.barkGeo} material={res.bark} castShadow={!lowSpec} />
      {/* 行道樹的樹蔭會斑駁地落在球場西半邊 */}
      <Instanced key={`l${lowSpec}`} items={inst.leaves} geometry={res.foliageGeo} material={res.leaf} castShadow={!lowSpec} />
      <Instanced key={`h${lowSpec}`} items={inst.shrubs} geometry={res.shrubGeo} material={res.leaf} />
    </group>
  );
};

// ───────────────────────────── 地標 ─────────────────────────────

const WHITE = '#f1f2ef';

/** 白色蘑菇柱：圓柱＋頂端圓盤，底座兩層圓台 */
const MushroomPillar = ({ x, z }: { x: number; z: number }) => {
  const capGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.001, -0.5),
      new THREE.Vector2(0.4, -0.45),
      new THREE.Vector2(1.2, -0.22),
      new THREE.Vector2(1.95, -0.02),
      new THREE.Vector2(2.0, 0.08),
      new THREE.Vector2(1.9, 0.12),
      new THREE.Vector2(0.001, 0.14),
    ];
    return new THREE.LatheGeometry(pts, 40);
  }, []);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.25, 1.35, 0.24, 36]} />
        <meshStandardMaterial map={graniteTexture()} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.8, 0.22, 32]} />
        <meshStandardMaterial color="#d9d8d2" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.6, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.38, 6.4, 28]} />
        <meshStandardMaterial color={WHITE} roughness={0.55} />
      </mesh>
      <mesh position={[0, 7.25, 0]} geometry={capGeo} castShadow>
        <meshStandardMaterial color={WHITE} roughness={0.55} />
      </mesh>
    </group>
  );
};

/** 白色現代建築：方塊主體＋圓弧塔樓 */
const WhiteBuilding = ({ x, z, ry }: { x: number; z: number; ry: number }) => {
  const tex = useMemo(() => {
    const t = buildingTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(4, 1);
    return t;
  }, []);
  const round = useMemo(() => {
    const t = buildingTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(3, 1);
    return t;
  }, []);
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <mesh position={[0, 3.5, 0]} receiveShadow>
        <boxGeometry args={[24, 7, 11]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
      <mesh position={[0, 7.4, 0]}>
        <boxGeometry args={[24.6, 0.5, 11.6]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} />
      </mesh>
      {[-8, 3, 11].map((x, i) => (
        <group key={x} position={[x, 0, 5.4]}>
          <mesh position={[0, i === 1 ? 5 : 4.2, 0]}>
            <cylinderGeometry args={[2.4, 2.4, i === 1 ? 10 : 8.4, 32]} />
            <meshStandardMaterial map={round} roughness={0.65} />
          </mesh>
          <mesh position={[0, i === 1 ? 10.15 : 8.55, 0]}>
            <cylinderGeometry args={[2.6, 2.6, 0.3, 32]} />
            <meshStandardMaterial color={WHITE} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* 屋頂上的冷氣機組 */}
      {[-6, -2.5, 1].map((x) => (
        <mesh key={x} position={[x, 8.1, -2]}>
          <boxGeometry args={[2.6, 1, 1.6]} />
          <meshStandardMaterial color="#d6d8d6" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

/** 圓形噴水池：藍色欄杆圍起來，外面一圈矮樹籬 */
const Fountain = ({ x, z }: { x: number; z: number }) => {
  const posts = 28;
  const hedge = useMemo(() => {
    const t = hedgeTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(10, 1);
    return t;
  }, []);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.4, 0.5, 40]} />
        <meshStandardMaterial color="#a9aaa4" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.1, 40]} />
        <meshStandardMaterial color="#5f8fa0" roughness={0.08} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.25, 0.4, 0.9, 16]} />
        <meshStandardMaterial color="#c9c8c0" roughness={0.7} />
      </mesh>
      {Array.from({ length: posts }, (_, i) => {
        const a = (i / posts) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.55, 0.65, Math.sin(a) * 2.55]}>
            <cylinderGeometry args={[0.025, 0.025, 1.3, 6]} />
            <meshStandardMaterial color="#4f86a8" metalness={0.5} roughness={0.4} />
          </mesh>
        );
      })}
      {[0.55, 1.28].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.55, 0.03, 6, 64]} />
          <meshStandardMaterial color="#4f86a8" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.75]} castShadow>
        <torusGeometry args={[3.6, 0.5, 8, 48]} />
        <meshStandardMaterial map={hedge} roughness={0.95} />
      </mesh>
    </group>
  );
};

/** 公園的綠色路燈：細桿＋白色燈罩 */
const ParkLamp = ({ x, z }: { x: number; z: number }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 1.7, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.07, 3.4, 10]} />
      <meshStandardMaterial color="#7da23a" roughness={0.5} metalness={0.3} />
    </mesh>
    <mesh position={[0, 3.55, 0]}>
      <cylinderGeometry args={[0.16, 0.1, 0.4, 12]} />
      <meshStandardMaterial color="#f5f5ef" roughness={0.3} />
    </mesh>
    <mesh position={[0, 3.8, 0]}>
      <coneGeometry args={[0.2, 0.15, 12]} />
      <meshStandardMaterial color="#5f7f2d" roughness={0.5} />
    </mesh>
  </group>
);

/** 球場照明燈桿：灰色高桿＋投光燈 */
const FloodPole = ({ x, z }: { x: number; z: number }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 4.5, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.11, 9, 10]} />
      <meshStandardMaterial color="#b8bcc0" metalness={0.6} roughness={0.4} />
    </mesh>
    <group position={[0, 9, 0]} rotation={[0, Math.atan2(-x, -z), 0]}>
      {[-0.35, 0.35].map((dx) => (
        <mesh key={dx} position={[dx, 0, 0.15]} rotation={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.3, 0.12]} />
          <meshStandardMaterial color="#9ea3a8" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
    </group>
  </group>
);

const Bench = ({ x, z, ry }: { x: number; z: number; ry: number }) => (
  <group position={[x, 0, z]} rotation={[0, ry, 0]}>
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[0, 0.45, -0.15 + i * 0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.04, 0.12]} />
        <meshStandardMaterial color="#9a6b42" roughness={0.8} />
      </mesh>
    ))}
    <mesh position={[0, 0.75, -0.24]} rotation={[-0.15, 0, 0]} castShadow>
      <boxGeometry args={[1.8, 0.3, 0.04]} />
      <meshStandardMaterial color="#9a6b42" roughness={0.8} />
    </mesh>
    {[-0.75, 0.75].map((dx) => (
      <mesh key={dx} position={[dx, 0.22, 0]} castShadow>
        <boxGeometry args={[0.06, 0.45, 0.45]} />
        <meshStandardMaterial color="#333a3a" metalness={0.5} roughness={0.5} />
      </mesh>
    ))}
  </group>
);

// ───────────────────────────── 路人 ─────────────────────────────

interface Person {
  x: number;
  z: number;
  ry: number;
  shirt: string;
  pants: string;
  skin: string;
  phase: number;
  /** 散步的人：沿著 x 或 z 方向來回走 */
  walk?: { axis: 'x' | 'z'; from: number; to: number; speed: number };
}

const PEOPLE: Person[] = [
  // 西側人行道上隔著樹籬看球的人
  { x: SIDEWALK_X + 0.9, z: -3.4, ry: Math.PI / 2, shirt: '#e5e7eb', pants: '#1f2937', skin: '#e0ac85', phase: 0 },
  { x: SIDEWALK_X + 0.9, z: 2.6, ry: Math.PI / 2, shirt: '#0e7490', pants: '#374151', skin: '#f1c7a3', phase: 1.3 },
  // 東側草地
  { x: PAD_X + 1.6, z: -9, ry: -Math.PI / 2, shirt: '#be185d', pants: '#e5e7eb', skin: '#c68863', phase: 2.1 },
  { x: PAD_X + 2.2, z: 3.5, ry: -Math.PI / 2, shirt: '#ca8a04', pants: '#1e3a8a', skin: '#f5d6bf', phase: 0.7 },
  { x: 11.5, z: 9, ry: -2.2, shirt: '#15803d', pants: '#111827', skin: '#e0ac85', phase: 3.3 },
  // 散步
  { x: SIDEWALK_X - 0.3, z: 0, ry: 0, shirt: '#f97316', pants: '#334155', skin: '#f1c7a3', phase: 4, walk: { axis: 'z', from: -30, to: 20, speed: 1.1 } },
  { x: 0, z: -19.5, ry: 0, shirt: '#6d28d9', pants: '#cbd5e1', skin: '#8d5a3b', phase: 5, walk: { axis: 'x', from: 24, to: 8, speed: 0.9 } },
];

/** 場邊路人：好球時會跳起來拍手，散步的人沿著步道走 */
const Bystanders = ({ excite, lowSpec }: { excite: MutableRefObject<number>; lowSpec: boolean }) => {
  const people = lowSpec ? PEOPLE.slice(0, 5) : PEOPLE;
  const refs = useRef<(THREE.Group | null)[]>([]);
  const legs = useRef<(THREE.Group | null)[]>([]);
  const clock = useRef(0);
  useFrame((_, dt) => {
    clock.current += dt;
    excite.current = Math.max(0, excite.current - dt * 0.45);
    const e = excite.current;
    const t = clock.current;
    people.forEach((p, i) => {
      const g = refs.current[i];
      if (!g) return;
      if (p.walk) {
        const span = p.walk.to - p.walk.from;
        const dur = Math.abs(span) / p.walk.speed;
        const u = ((t + p.phase * 3) % (dur * 2)) / dur;
        const k = u < 1 ? u : 2 - u;
        const dir = u < 1 ? Math.sign(span) : -Math.sign(span);
        if (p.walk.axis === 'x') {
          g.position.x = p.walk.from + span * k;
          g.rotation.y = dir * (Math.PI / 2);
        } else {
          g.position.z = p.walk.from + span * k;
          g.rotation.y = dir > 0 ? 0 : Math.PI;
        }
        g.position.y = Math.abs(Math.sin(t * 7 + p.phase)) * 0.04;
        const lg = legs.current[i];
        if (lg) {
          lg.children[0].rotation.x = Math.sin(t * 7 + p.phase) * 0.45;
          lg.children[1].rotation.x = -Math.sin(t * 7 + p.phase) * 0.45;
        }
      } else {
        g.position.y = e > 0.05 ? Math.max(0, Math.sin(t * 9 + p.phase * 3)) * 0.22 * e : 0;
      }
    });
  });
  return (
    <group>
      {people.map((p, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[p.x, 0, p.z]}
          rotation={[0, p.ry, 0]}
        >
          <group
            ref={(el) => {
              legs.current[i] = el;
            }}
          >
            {[-0.09, 0.09].map((dx) => (
              <group key={dx} position={[dx, 0.82, 0]}>
                <mesh position={[0, -0.41, 0]} castShadow>
                  <capsuleGeometry args={[0.065, 0.68, 4, 8]} />
                  <meshStandardMaterial color={p.pants} roughness={0.9} />
                </mesh>
              </group>
            ))}
          </group>
          <mesh position={[0, 1.15, 0]} scale={[1.2, 1, 0.75]} castShadow>
            <capsuleGeometry args={[0.17, 0.4, 4, 10]} />
            <meshStandardMaterial color={p.shirt} roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.63, 0]} castShadow>
            <sphereGeometry args={[0.11, 14, 10]} />
            <meshStandardMaterial color={p.skin} roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.69, -0.01]} scale={[1, 0.6, 1]}>
            <sphereGeometry args={[0.115, 14, 10]} />
            <meshStandardMaterial color="#1c1917" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ───────────────────────────── 天空與燈光 ─────────────────────────────

const DaySky = () => {
  const tex = daySkyTexture();
  return (
    <mesh>
      <sphereGeometry args={[130, 48, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
};

export interface RoseGardenVenueProps {
  excite: MutableRefObject<number>;
  lowSpec: boolean;
}

export const RoseGardenVenue = ({ excite, lowSpec }: RoseGardenVenueProps) => (
  <group>
    <DaySky />
    <hemisphereLight args={['#d6e8ff', '#6a8a4f', 1.05]} />
    <ambientLight intensity={0.15} />
    {/* 太陽：近中午、偏南偏西，行道樹的影子只落在球場西緣 */}
    <directionalLight
      position={[-6, 26, 8]}
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
    <Courts />
    <Net />
    <Grounds lowSpec={lowSpec} />
    <Trees lowSpec={lowSpec} />
    <RoseBeds lowSpec={lowSpec} />
    <GardenSign x={-1.2} z={PAD_N - 3.6} />
    <MushroomPillar x={PAD_X + 2.6} z={PAD_N + 9} />
    <WhiteBuilding x={26} z={-48} ry={-0.5} />
    <Fountain x={FOUNTAIN[0]} z={FOUNTAIN[1]} />
    {[-14, 0, 14].map((z) => (
      <ParkLamp key={z} x={PAD_X + 1.3} z={z + 4} />
    ))}
    {[-14, 8].map((z) => (
      <ParkLamp key={z} x={SIDEWALK_X + 1.3} z={z} />
    ))}
    {[-COURT_STEP - 2, -2, COURT_STEP - 2].map((z) => (
      <FloodPole key={z} x={PAD_X + 0.9} z={z} />
    ))}
    <Bench x={PAD_X + 2.8} z={-3} ry={-Math.PI / 2} />
    <Bench x={PAD_X + 2.8} z={9} ry={-Math.PI / 2} />
    <Bench x={SIDEWALK_X - 1.3} z={-12} ry={Math.PI / 2} />
    <Bystanders excite={excite} lowSpec={lowSpec} />
  </group>
);
