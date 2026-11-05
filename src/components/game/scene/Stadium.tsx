import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COURT, NET_TOTAL_HALF_WIDTH, netHeightAt } from '../engine/constants';
import type { GameEngine } from '../engine/game';
import { courtLogoTexture, courtTexture, glowTexture, grainBump, ledTexture, netTexture, skyTexture } from './textures';

const W = COURT.halfWidth;
const L = COURT.halfLength;
const K = COURT.kitchen;
const LINE = COURT.lineWidth;

/** 場外區域（比照職業賽場地 30×60 呎以上） */
const SURROUND_X = W + 3.4;
const SURROUND_Z = L + 4.8;

// ───────────────────────────── 球場 ─────────────────────────────

const Line = ({ x, z, w, d }: { x: number; z: number; w: number; d: number }) => (
  <mesh position={[x, 0.003, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[w, d]} />
    <meshStandardMaterial color="#f7f9fc" roughness={0.55} />
  </mesh>
);

const Court = () => {
  const bump = grainBump();
  const surround = courtTexture('#24604a', 'surround', [8, 12]);
  const court = courtTexture('#1f4f9a', 'court', [3, 6]);
  const kitchen = courtTexture('#2c66b5', 'kitchen', [3, 1]);
  const logo = courtLogoTexture();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.003, 0]} receiveShadow>
        <planeGeometry args={[SURROUND_X * 2, SURROUND_Z * 2]} />
        <meshStandardMaterial map={surround} bumpMap={bump} bumpScale={0.003} roughness={0.82} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.006, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0d1712" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W * 2, L * 2]} />
        <meshStandardMaterial map={court} bumpMap={bump} bumpScale={0.003} roughness={0.78} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, (s * K) / 2]} receiveShadow>
          <planeGeometry args={[W * 2, K]} />
          <meshStandardMaterial map={kitchen} bumpMap={bump} bumpScale={0.003} roughness={0.78} />
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
      {/* 底線後方的噴漆字樣（遠端那面朝向鏡頭） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -(L + 2.3)]}>
        <planeGeometry args={[5.2, 1.3]} />
        <meshStandardMaterial map={logo} transparent roughness={0.6} depthWrite={false} />
      </mesh>
    </group>
  );
};

export const Net = () => {
  const tex = netTexture();
  const { netGeo, tapeGeo } = useMemo(() => {
    const seg = 48;
    const geo = new THREE.PlaneGeometry(NET_TOTAL_HALF_WIDTH * 2, 1, seg, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setY(i, pos.getY(i) > 0 ? netHeightAt(x) : 0.03);
    }
    geo.computeVertexNormals();
    const pts = [];
    for (let i = 0; i <= seg; i++) {
      const x = -NET_TOTAL_HALF_WIDTH + (i / seg) * NET_TOTAL_HALF_WIDTH * 2;
      pts.push(new THREE.Vector3(x, netHeightAt(x), 0));
    }
    return { netGeo: geo, tapeGeo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, 0.026, 8, false) };
  }, []);
  return (
    <group>
      <mesh geometry={netGeo} castShadow>
        <meshStandardMaterial map={tex} transparent alphaTest={0.3} side={THREE.DoubleSide} color="#0b0b10" roughness={0.9} />
      </mesh>
      <mesh geometry={tapeGeo} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.45} />
      </mesh>
      <mesh position={[0, COURT.netCenterHeight / 2, 0]}>
        <boxGeometry args={[0.05, COURT.netCenterHeight, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s} position={[s * (NET_TOTAL_HALF_WIDTH + 0.035), 0, 0]}>
          <mesh position={[0, COURT.netPostHeight / 2 + 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.038, 0.042, COURT.netPostHeight + 0.04, 18]} />
            <meshStandardMaterial color="#20232b" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.16, 0.18, 0.04, 24]} />
            <meshStandardMaterial color="#20232b" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, COURT.netPostHeight + 0.045, 0]}>
            <sphereGeometry args={[0.042, 16, 10]} />
            <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ───────────────────────────── 看板與大螢幕 ─────────────────────────────

const LED_LINES = [
  { text: 'PICKLE MASTER TW  ·  台灣匹克球  ·  ', color: '#34d399' },
  { text: 'PLAY · LEARN · COMPETE  ·  ', color: '#fbbf24' },
  { text: '找球場就上 picklemastertw.com  ·  ', color: '#60a5fa' },
];

const LedBoards = () => {
  const mats = useMemo(
    () =>
      LED_LINES.map((l) => {
        const t = ledTexture(l.text, l.color).clone();
        t.needsUpdate = true;
        t.repeat.set(2, 1);
        return new THREE.MeshBasicMaterial({ map: t, toneMapped: false });
      }),
    [],
  );
  useFrame((_, dt) => {
    mats.forEach((m, i) => {
      m.map!.offset.x = (m.map!.offset.x + dt * (0.04 + i * 0.012)) % 1;
    });
  });
  const boards: { p: [number, number, number]; r: number; w: number; m: number }[] = [
    { p: [0, 0.45, -SURROUND_Z], r: 0, w: SURROUND_X * 2, m: 0 },
    { p: [-SURROUND_X, 0.45, 0], r: Math.PI / 2, w: SURROUND_Z * 2, m: 1 },
    { p: [SURROUND_X, 0.45, 0], r: -Math.PI / 2, w: SURROUND_Z * 2, m: 2 },
  ];
  return (
    <group>
      {boards.map((b, i) => (
        <group key={i} position={b.p} rotation={[0, b.r, 0]}>
          <mesh material={mats[b.m]}>
            <planeGeometry args={[b.w, 0.9]} />
          </mesh>
          <mesh position={[0, 0, -0.06]}>
            <boxGeometry args={[b.w, 0.95, 0.1]} />
            <meshStandardMaterial color="#0a0c12" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** 遠端大螢幕：顯示比分，分數變了才重畫 */
const Jumbotron = ({ engine, names }: { engine: GameEngine; names: [string, string] }) => {
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, tex: t };
  }, []);
  const last = useRef('');
  useFrame(() => {
    const key = `${engine.match.score[0]}-${engine.match.score[1]}-${engine.match.serving}-${engine.mode}-${engine.dinkStreak}`;
    if (key === last.current) return;
    last.current = key;
    const g = canvas.getContext('2d')!;
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, '#061a14');
    grd.addColorStop(1, '#03070a');
    g.fillStyle = grd;
    g.fillRect(0, 0, 1024, 512);
    g.textAlign = 'center';
    g.fillStyle = '#34d399';
    g.font = 'italic 900 64px "Inter", Arial, sans-serif';
    g.fillText('PICKLE MASTER', 512, 90);
    if (engine.mode === 'dink') {
      g.fillStyle = '#ffffff';
      g.font = '900 220px "Inter", Arial, sans-serif';
      g.fillText(String(engine.dinkStreak), 512, 360);
      g.font = '800 48px "Inter", Arial, sans-serif';
      g.fillStyle = '#fbbf24';
      g.fillText('DINK STREAK', 512, 450);
    } else {
      g.font = '800 54px "Inter", Arial, sans-serif';
      g.fillStyle = '#a7f3d0';
      g.font = '800 54px "Inter", "PingFang TC", "Noto Sans TC", sans-serif';
      g.fillText(names[0], 270, 190);
      g.fillStyle = '#fed7aa';
      g.fillText(names[1], 754, 190);
      g.fillStyle = '#ffffff';
      g.font = '900 220px "Inter", Arial, sans-serif';
      g.fillText(String(engine.match.score[0]), 270, 410);
      g.fillText(String(engine.match.score[1]), 754, 410);
      g.fillStyle = '#fbbf24';
      g.beginPath();
      g.arc(engine.match.serving === 0 ? 120 : 904, 330, 18, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = 0; y < 512; y += 4) g.fillRect(0, y, 1024, 1);
    tex.needsUpdate = true;
  });
  return (
    <group position={[0, 9.5, -(SURROUND_Z + 9.5)]}>
      <mesh>
        <planeGeometry args={[9, 4.5]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[9.5, 5, 0.25]} />
        <meshStandardMaterial color="#0b0d12" metalness={0.5} roughness={0.4} />
      </mesh>
      {[-3.5, 3.5].map((x) => (
        <mesh key={x} position={[x, -5.5, -0.3]}>
          <boxGeometry args={[0.35, 7, 0.35]} />
          <meshStandardMaterial color="#1b1f27" />
        </mesh>
      ))}
    </group>
  );
};

// ───────────────────────────── 看台與觀眾 ─────────────────────────────

interface Seat {
  x: number;
  y: number;
  z: number;
  /** 面向：觀眾都朝著球場中央 */
  ry: number;
  phase: number;
}

const ROWS = 8;
const ROW_DEPTH = 0.85;
const ROW_RISE = 0.48;

const buildStands = () => {
  const seats: Seat[] = [];
  const steps: { p: [number, number, number]; s: [number, number, number] }[] = [];
  const r = (() => {
    let seed = 99;
    return () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
  })();
  const sideLen = SURROUND_Z * 2 + 4;
  for (const side of [-1, 1]) {
    for (let row = 0; row < ROWS; row++) {
      const x = side * (SURROUND_X + 2.4 + row * ROW_DEPTH);
      const y = 0.3 + row * ROW_RISE;
      steps.push({ p: [x, y / 2, 0], s: [ROW_DEPTH, y, sideLen] });
      for (let z = -sideLen / 2 + 0.5; z < sideLen / 2 - 0.3; z += 0.62) {
        if (r() < 0.1) continue;
        seats.push({ x, y, z: z + (r() - 0.5) * 0.12, ry: side > 0 ? Math.PI / 2 : -Math.PI / 2, phase: r() * 10 });
      }
    }
  }
  const endLen = (SURROUND_X + 2.4) * 2;
  for (let row = 0; row < ROWS; row++) {
    const z = -(SURROUND_Z + 2.2 + row * ROW_DEPTH);
    const y = 0.3 + row * ROW_RISE;
    steps.push({ p: [0, y / 2, z], s: [endLen + ROWS * ROW_DEPTH * 2, y, ROW_DEPTH] });
    for (let x = -endLen / 2 - row * ROW_DEPTH; x < endLen / 2 + row * ROW_DEPTH; x += 0.62) {
      if (r() < 0.1) continue;
      seats.push({ x: x + (r() - 0.5) * 0.12, y, z, ry: 0, phase: r() * 10 });
    }
  }
  return { seats, steps };
};

const SHIRTS = ['#b91c1c', '#c2410c', '#ca8a04', '#15803d', '#0f766e', '#0e7490', '#1d4ed8', '#6d28d9', '#be185d', '#e5e7eb', '#1f2937', '#475569', '#334155', '#f1f5f9', '#0f172a', '#78350f'];
const SKINS = ['#f1c7a3', '#e0ac85', '#c68863', '#8d5a3b', '#f5d6bf'];

const Crowd = ({ excite }: { excite: MutableRefObject<number> }) => {
  const { seats, steps } = useMemo(buildStands, []);
  const bodies = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const clock = useRef(0);
  /** 觀眾靜止時不更新矩陣（約 700 人 × 2 個矩陣，每幀更新很浪費） */
  const settled = useRef(false);

  useEffect(() => {
    const b = bodies.current;
    const h = heads.current;
    if (!b || !h) return;
    const c = new THREE.Color();
    seats.forEach((_, i) => {
      b.setColorAt(i, c.set(SHIRTS[i % SHIRTS.length]));
      h.setColorAt(i, c.set(SKINS[(i * 7) % SKINS.length]));
    });
    b.instanceColor!.needsUpdate = true;
    h.instanceColor!.needsUpdate = true;
  }, [seats]);

  useFrame((_, dt) => {
    clock.current += dt;
    excite.current = Math.max(0, excite.current - dt * 0.45);
    const e = excite.current;
    const t = clock.current;
    const b = bodies.current;
    const h = heads.current;
    if (!b || !h) return;
    if (e <= 0.01) {
      if (settled.current) return;
      settled.current = true;
    } else settled.current = false;
    for (let i = 0; i < seats.length; i++) {
      const s = seats[i];
      const jump = e > 0.05 ? Math.max(0, Math.sin(t * 9 + s.phase * 3)) * 0.28 * e : 0;
      const sway = e > 0.01 ? Math.sin(t * 1.3 + s.phase) * 0.02 : 0;
      const stand = e > 0.3 ? 0.12 : 0;
      tmp.position.set(s.x, s.y + 0.38 + jump + stand, s.z);
      tmp.rotation.set(0, s.ry, sway);
      tmp.scale.set(1.25, 1, 0.8);
      tmp.updateMatrix();
      b.setMatrixAt(i, tmp.matrix);
      tmp.scale.set(1, 1.1, 1);
      tmp.position.y += 0.4;
      tmp.updateMatrix();
      h.setMatrixAt(i, tmp.matrix);
    }
    b.instanceMatrix.needsUpdate = true;
    h.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {steps.map((st, i) => (
        <mesh key={i} position={st.p} receiveShadow>
          <boxGeometry args={st.s} />
          <meshStandardMaterial color={i % 2 ? '#1a2333' : '#202a3d'} roughness={0.9} />
        </mesh>
      ))}
      <instancedMesh ref={bodies} args={[undefined, undefined, seats.length]} frustumCulled={false}>
        <capsuleGeometry args={[0.19, 0.26, 4, 10]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, seats.length]} frustumCulled={false}>
        <sphereGeometry args={[0.125, 12, 10]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
    </group>
  );
};

/** 觀眾席的手機閃光：放必殺時閃個不停 */
const Flashes = ({ flash }: { flash: MutableRefObject<number> }) => {
  const N = 90;
  const { geo, mat } = useMemo(() => {
    const { seats } = buildStands();
    const pick: number[] = [];
    for (let i = 0; i < N; i++) {
      const s = seats[(i * 9973) % seats.length];
      pick.push(s.x, s.y + 1.1, s.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pick, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(new Array(N * 3).fill(0), 3));
    const m = new THREE.PointsMaterial({
      size: 0.9,
      map: glowTexture(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { geo: g, mat: m };
  }, []);
  useFrame((_, dt) => {
    flash.current = Math.max(0, flash.current - dt * 0.6);
    const col = geo.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      const on = flash.current > 0 && Math.random() < flash.current * 0.08 ? 3 : 0;
      const prev = col.getX(i);
      const v = Math.max(on, prev * Math.exp(-dt * 14));
      col.setXYZ(i, v, v, v);
    }
    col.needsUpdate = true;
  });
  return <points geometry={geo} material={mat} />;
};

// ───────────────────────────── 燈光與天空 ─────────────────────────────

const LightTowers = () => {
  const glow = glowTexture();
  const spots: [number, number][] = [
    [-(SURROUND_X + 8), -(SURROUND_Z + 6)],
    [SURROUND_X + 8, -(SURROUND_Z + 6)],
    [-(SURROUND_X + 8), SURROUND_Z + 4],
    [SURROUND_X + 8, SURROUND_Z + 4],
  ];
  return (
    <group>
      {spots.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 9, 0]}>
            <cylinderGeometry args={[0.18, 0.3, 18, 10]} />
            <meshStandardMaterial color="#2a3140" metalness={0.6} roughness={0.4} />
          </mesh>
          <group position={[0, 18.4, 0]} rotation={[0, Math.atan2(-x, -z), 0]}>
            <mesh>
              <boxGeometry args={[3.2, 2, 0.4]} />
              <meshStandardMaterial color="#151922" />
            </mesh>
            {Array.from({ length: 12 }, (_, k) => (
              <mesh key={k} position={[-1.2 + (k % 4) * 0.8, 0.6 - Math.floor(k / 4) * 0.6, 0.21]}>
                <circleGeometry args={[0.24, 16]} />
                <meshBasicMaterial color="#fffbe8" toneMapped={false} />
              </mesh>
            ))}
            <sprite position={[0, 0, 0.6]} scale={[9, 7, 1]}>
              <spriteMaterial map={glow} color="#fff4d6" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
          </group>
        </group>
      ))}
    </group>
  );
};

const Sky = () => {
  const tex = skyTexture();
  return (
    <mesh>
      <sphereGeometry args={[70, 32, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
};

export interface StadiumProps {
  engine: GameEngine;
  /** 大螢幕上顯示的雙方名字 */
  names: [string, string];
  excite: MutableRefObject<number>;
  flash: MutableRefObject<number>;
  lowSpec: boolean;
}

export const Stadium = ({ engine, names, excite, flash, lowSpec }: StadiumProps) => (
  <group>
    <Sky />
    <hemisphereLight args={['#9db7ff', '#0d1a14', 0.55]} />
    <ambientLight intensity={0.18} />
    <directionalLight
      position={[6, 16, 8]}
      intensity={2.4}
      color="#fff6e5"
      castShadow
      shadow-mapSize={lowSpec ? [1024, 1024] : [2048, 2048]}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={13}
      shadow-camera-bottom={-13}
      shadow-camera-near={2}
      shadow-camera-far={40}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[-8, 12, -10]} intensity={0.9} color="#cfe0ff" />
    <Court />
    <Net />
    <LedBoards />
    <Jumbotron engine={engine} names={names} />
    <Crowd excite={excite} />
    {!lowSpec && <Flashes flash={flash} />}
    <LightTowers />
  </group>
);
