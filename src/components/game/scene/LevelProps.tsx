import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COURT } from '../engine/constants';
import type { GameEngine } from '../engine/game';
import { type CupsLevel, type PearlsLevel, GIANT_CUP, PEARL_SLOTS } from '../engine/levels';
import { cupLabelTexture, glowTexture } from './textures';

/**
 * 關卡道具：珍奶杯、珍珠、發球機、積水、雨與風。
 * 全部的網格與材質都在開場（元件掛上去時）建好，比賽中只改位置、縮放、透明度，
 * 不會中途建新物件（中途建＝當場編著色器、上傳貼圖＝卡一下）。
 */

const L = COURT.halfLength;
const W = COURT.halfWidth;
const tmp = new THREE.Object3D();
/** 縮成 0 = 藏起這個實例 */
const zero = new THREE.Matrix4().makeScale(0, 0, 0);

/** 手搖杯的杯身輪廓（高 1、杯口半徑 1，往下收窄），杯蓋是半球 */
const cupGeometry = () => {
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(0.78, 0), new THREE.Vector2(0.8, 0.04), new THREE.Vector2(1, 0.96), new THREE.Vector2(1.04, 1)];
  return new THREE.LatheGeometry(pts, 24);
};

/** 離開這一關時釋放自己建的網格與材質（貼圖是共用快取，不動） */
const useDisposeOnUnmount = (res: Record<string, unknown>) =>
  useEffect(
    () => () => {
      for (const v of Object.values(res)) if (v instanceof THREE.BufferGeometry || v instanceof THREE.Material) v.dispose();
    },
    [res],
  );

const easeOutBack = (k: number) => 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);

// ───────────────────────────── 打手搖杯 ─────────────────────────────

const Cups = ({ engine, level }: { engine: GameEngine; level: CupsLevel }) => {
  const res = useMemo(() => {
    const label = cupLabelTexture();
    return {
      body: cupGeometry(),
      lid: new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      straw: new THREE.CylinderGeometry(0.07, 0.07, 1, 8),
      tea: new THREE.CircleGeometry(1, 24),
      cupMat: new THREE.MeshStandardMaterial({ map: label, roughness: 0.25, metalness: 0.05 }),
      lidMat: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2, transparent: true, opacity: 0.85 }),
      strawMat: new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.4 }),
      teaMat: new THREE.MeshStandardMaterial({ color: '#c08a5a', roughness: 0.3 }),
      giantMat: new THREE.MeshStandardMaterial({ map: label, roughness: 0.25, side: THREE.DoubleSide }),
      ringMat: new THREE.MeshBasicMaterial({ color: '#fde047', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
      ring: new THREE.RingGeometry(0.9, 1, 40),
    };
  }, []);
  useDisposeOnUnmount(res);
  const outer = useRef<(THREE.Group | null)[]>([]);
  const inner = useRef<(THREE.Group | null)[]>([]);
  /** 每個杯子上一次被看到的狀態（重新擺好時要彈出來） */
  const state = useMemo(() => level.cups.map(() => ({ down: false, upAt: -9 })), [level]);
  const giantRing = useRef<THREE.Mesh>(null);
  const giant = useRef<THREE.Group>(null);

  useFrame(() => {
    const t = engine.time;
    level.cups.forEach((c, i) => {
      const o = outer.current[i];
      const n = inner.current[i];
      if (!o || !n) return;
      const s = state[i];
      if (s.down && !c.down) s.upAt = t;
      s.down = c.down;
      if (c.down) {
        // 以杯底被撞的那一側為支點往前倒
        const k = Math.min(1, (t - c.downAt) / 0.22);
        o.position.set(c.x + c.dir.x * c.r, 0, c.z + c.dir.z * c.r);
        o.rotation.set(k * k * (Math.PI / 2 - 0.08), Math.atan2(c.dir.x, c.dir.z), 0, 'YXZ');
        n.position.set(0, 0, -c.r);
        n.scale.set(c.r, c.h, c.r);
      } else {
        const k = Math.min(1, (t - s.upAt) / 0.35);
        const pop = s.upAt < 0 ? 1 : easeOutBack(k);
        o.position.set(c.x, 0, c.z);
        o.rotation.set(0, 0, 0);
        n.position.set(0, 0, 0);
        n.scale.set(c.r * pop, c.h * pop, c.r * pop);
      }
    });
    // 霸王杯：灌籃時杯口發光、整杯彈一下
    const since = t - level.dunkAt;
    if (giantRing.current) {
      giantRing.current.visible = since < 1.2;
      const k = Math.min(1, since / 1.2);
      giantRing.current.scale.setScalar(GIANT_CUP.r * (1 + k * 2.5));
      res.ringMat.opacity = 0.9 * (1 - k);
    }
    if (giant.current) giant.current.scale.y = since < 0.4 ? 1 - Math.sin((since / 0.4) * Math.PI) * 0.12 : 1;
  });

  return (
    <group>
      {level.cups.map((c, i) => (
        <group key={i} ref={(g) => void (outer.current[i] = g)} position={[c.x, 0, c.z]}>
          <group ref={(g) => void (inner.current[i] = g)} scale={[c.r, c.h, c.r]}>
            <mesh geometry={res.body} material={res.cupMat} castShadow />
            <mesh geometry={res.lid} material={res.lidMat} position={[0, 1, 0]} scale={[1.04, 0.22, 1.04]} />
            <mesh geometry={res.straw} material={res.strawMat} position={[0.25, 1.25, 0]} rotation={[0, 0, -0.18]} scale={[1, 0.6, 1]} />
          </group>
        </group>
      ))}
      <group ref={giant} position={[GIANT_CUP.x, 0, GIANT_CUP.z]}>
        <mesh geometry={res.body} material={res.giantMat} scale={[GIANT_CUP.r, GIANT_CUP.h, GIANT_CUP.r]} castShadow />
        <mesh geometry={res.tea} material={res.teaMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, GIANT_CUP.h * 0.82, 0]} scale={GIANT_CUP.r * 0.93} />
        <mesh geometry={res.straw} material={res.strawMat} position={[GIANT_CUP.r * 0.5, GIANT_CUP.h + 0.25, 0]} rotation={[0, 0, -0.25]} scale={[2, 1.1, 2]} />
        <mesh ref={giantRing} geometry={res.ring} material={res.ringMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, GIANT_CUP.h + 0.02, 0]} visible={false} />
      </group>
    </group>
  );
};

// ───────────────────────────── 波霸大收集 ─────────────────────────────

const Pearls = ({ engine, level }: { engine: GameEngine; level: PearlsLevel }) => {
  const res = useMemo(
    () => ({
      geo: new THREE.SphereGeometry(0.11, 16, 12),
      beam: new THREE.CylinderGeometry(0.16, 0.3, 2.4, 16, 1, true).translate(0, 1.2, 0),
      shadow: new THREE.PlaneGeometry(0.34, 0.34).rotateX(-Math.PI / 2),
      pearl: new THREE.MeshStandardMaterial({ color: '#2b1608', roughness: 0.18, metalness: 0.1 }),
      gold: new THREE.MeshStandardMaterial({ color: '#fbbf24', emissive: '#f59e0b', emissiveIntensity: 1.4, roughness: 0.2, metalness: 0.6 }),
      beamMat: new THREE.MeshBasicMaterial({ color: '#fde047', transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }),
      shadowMat: new THREE.MeshBasicMaterial({ map: glowTexture(), color: '#000000', transparent: true, opacity: 0.45, depthWrite: false }),
      warnMat: new THREE.MeshBasicMaterial({ color: '#ff3b3b', transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false }),
    }),
    [],
  );
  useDisposeOnUnmount(res);
  const normal = useRef<THREE.InstancedMesh>(null);
  const gold = useRef<THREE.InstancedMesh>(null);
  const beams = useRef<THREE.InstancedMesh>(null);
  const shadows = useRef<THREE.InstancedMesh>(null);
  const hit = useRef<THREE.Mesh>(null);
  const hitMat = useRef<THREE.MeshBasicMaterial>(null);
  const warn = useRef<THREE.Group>(null);

  useFrame(() => {
    const t = engine.time;
    const nm = normal.current;
    const gm = gold.current;
    const bm = beams.current;
    const sm = shadows.current;
    if (!nm || !gm || !bm || !sm) return;
    level.pearls.forEach((p, i) => {
      const k = Math.min(1, (t - p.bornAt) / 0.3);
      const s = p.alive ? easeOutBack(k) * (p.gold ? 1.5 : 1) : 0;
      // 金珍珠快消失時閃爍
      const blink = p.gold && p.until - t < 0.4 ? (Math.sin(t * 40) > 0 ? 1 : 0.4) : 1;
      tmp.position.set(p.x, 0.12 + Math.sin(t * 4 + i) * 0.03 + (p.gold ? 0.1 : 0), p.z);
      tmp.rotation.set(0, t * 2 + i, 0);
      tmp.scale.setScalar(s * blink);
      tmp.updateMatrix();
      nm.setMatrixAt(i, p.gold ? zero : tmp.matrix);
      gm.setMatrixAt(i, p.gold ? tmp.matrix : zero);
      tmp.position.set(p.x, 0, p.z);
      tmp.rotation.set(0, t * 3, 0);
      tmp.scale.set(s, p.gold ? s : 0, s);
      tmp.updateMatrix();
      bm.setMatrixAt(i, p.gold && p.alive ? tmp.matrix : zero);
      tmp.position.set(p.x, 0.005, p.z);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.setScalar(s);
      tmp.updateMatrix();
      sm.setMatrixAt(i, tmp.matrix);
    });
    nm.instanceMatrix.needsUpdate = true;
    gm.instanceMatrix.needsUpdate = true;
    bm.instanceMatrix.needsUpdate = true;
    sm.instanceMatrix.needsUpdate = true;
    // 砲彈的落點：紅色準星（看這個閃）
    const m = engine.landingMarker;
    if (warn.current) {
      const show = !!m && engine.phase === 'rally' && engine.rally.lastTeam === 1;
      warn.current.visible = show;
      if (show) {
        warn.current.position.set(m!.x, 0.012, m!.z);
        warn.current.scale.setScalar(1 + Math.sin(engine.real * 16) * 0.12);
      }
    }
    // 被砲彈打中：腳下一圈紅光
    const since = t - level.hitAt;
    if (hit.current && hitMat.current) {
      hit.current.visible = since < 0.6;
      if (since < 0.6) {
        const h = engine.human.pos;
        hit.current.position.set(h.x, 0.02, h.z);
        hit.current.scale.setScalar(0.4 + since * 3);
        hitMat.current.opacity = 0.8 * (1 - since / 0.6);
      }
    }
  });

  return (
    <group>
      <instancedMesh ref={shadows} args={[res.shadow, res.shadowMat, PEARL_SLOTS]} frustumCulled={false} />
      <instancedMesh ref={normal} args={[res.geo, res.pearl, PEARL_SLOTS]} castShadow frustumCulled={false} />
      <instancedMesh ref={gold} args={[res.geo, res.gold, PEARL_SLOTS]} frustumCulled={false} />
      <instancedMesh ref={beams} args={[res.beam, res.beamMat, PEARL_SLOTS]} frustumCulled={false} />
      <group ref={warn} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={res.warnMat}>
          <ringGeometry args={[0.36, 0.44, 32]} />
        </mesh>
        {[0, Math.PI / 2].map((r) => (
          <mesh key={r} rotation={[-Math.PI / 2, 0, r]} material={res.warnMat}>
            <planeGeometry args={[1.1, 0.06]} />
          </mesh>
        ))}
      </group>
      <mesh ref={hit} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.8, 1, 40]} />
        <meshBasicMaterial ref={hitMat} color="#f43f5e" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ───────────────────────────── 發球機 ─────────────────────────────

/** 發球機：砲管會轉向玩家，出球時往後一縮 */
const FeedMachine = ({ engine }: { engine: GameEngine }) => {
  const from = engine.level!.feedFrom!;
  const yaw = useRef<THREE.Group>(null);
  const barrel = useRef<THREE.Group>(null);
  const lastFeed = useRef(-1);
  useFrame(() => {
    const h = engine.human.pos;
    if (yaw.current) {
      const want = Math.atan2(h.x - from.x, h.z - from.z);
      yaw.current.rotation.y += (want - yaw.current.rotation.y) * 0.15;
    }
    if (engine.rally.lastTeam === 1 && engine.rally.lastHitTime !== lastFeed.current && engine.phase === 'rally') lastFeed.current = engine.rally.lastHitTime;
    const since = engine.time - lastFeed.current;
    if (barrel.current) barrel.current.position.z = since < 0.25 ? -0.18 * (1 - since / 0.25) : 0;
  });
  return (
    <group position={[from.x, 0, from.z - 0.15]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.7, 0.5, 0.6]} />
        <meshStandardMaterial color="#f97316" roughness={0.5} />
      </mesh>
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 14]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
      ))}
      <group ref={yaw} position={[0, 0.75, 0]}>
        <group rotation={[-0.35, 0, 0]}>
          <group ref={barrel}>
            <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.12, 0.6, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.09, 0.025, 8, 20]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </group>
        </group>
        <mesh position={[0, 0.02, -0.12]}>
          <sphereGeometry args={[0.2, 16, 10]} />
          <meshStandardMaterial color="#fb923c" roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
};

// ───────────────────────────── 積水 ─────────────────────────────

const PUDDLE_POOL = 8;

/** 積水：深色反光的水窪，雨打下來一圈圈漣漪；黑框爆噴出來的會長出來 */
const Puddles = ({ engine }: { engine: GameEngine }) => {
  const res = useMemo(
    () => ({
      disc: new THREE.CircleGeometry(1, 40),
      ripple: new THREE.RingGeometry(0.9, 1, 32),
      water: new THREE.MeshStandardMaterial({ color: '#1e3445', roughness: 0.05, metalness: 0.65, transparent: true, opacity: 0.82, depthWrite: false }),
      rippleMat: new THREE.MeshBasicMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false }),
    }),
    [],
  );
  useDisposeOnUnmount(res);
  const discs = useRef<(THREE.Mesh | null)[]>([]);
  const ripples = useRef<(THREE.Mesh | null)[]>([]);
  const born = useMemo(() => new WeakMap<object, number>(), []);
  useFrame(() => {
    const t = engine.time;
    for (let i = 0; i < PUDDLE_POOL; i++) {
      const p = engine.puddles[i];
      const d = discs.current[i];
      const r = ripples.current[i];
      if (!d || !r) continue;
      d.visible = !!p;
      r.visible = !!p;
      if (!p) continue;
      if (!born.has(p)) born.set(p, t);
      const grow = Math.min(1, (t - born.get(p)!) / 0.4);
      d.position.set(p.x, 0.006, p.z);
      // 稍微橢圓，比較像自然積水
      d.scale.set(p.r * grow, p.r * 0.82 * grow, 1);
      const k = ((t * 0.8 + i * 0.37) % 1 + 1) % 1;
      r.position.set(p.x + Math.sin(i * 7) * p.r * 0.3, 0.008, p.z + Math.cos(i * 5) * p.r * 0.25);
      r.scale.setScalar(Math.max(0.01, p.r * 0.7 * k * grow));
    }
  });
  return (
    <group>
      {Array.from({ length: PUDDLE_POOL }, (_, i) => (
        <group key={i}>
          <mesh ref={(m) => void (discs.current[i] = m)} geometry={res.disc} material={res.water} rotation={[-Math.PI / 2, 0, 0]} visible={false} receiveShadow />
          <mesh ref={(m) => void (ripples.current[i] = m)} geometry={res.ripple} material={res.rippleMat} rotation={[-Math.PI / 2, 0, 0]} visible={false} />
        </group>
      ))}
    </group>
  );
};

// ───────────────────────────── 雨與風 ─────────────────────────────

/**
 * 雨：一大把線段，每幀在原本的緩衝區裡移動（不建新物件）；雨絲順著風斜。
 * 颱風關另外有幾條橫掃的風痕，一眼看出風往哪吹。
 */
const Weather = ({ engine, heavy, lowSpec }: { engine: GameEngine; heavy: boolean; lowSpec: boolean }) => {
  const n = Math.round((heavy ? 1100 : 300) * (lowSpec ? 0.5 : 1));
  const streaksN = heavy ? (lowSpec ? 18 : 34) : 0;
  const rain = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 6);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
    const drops = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      drops[i * 3] = (Math.random() - 0.5) * 26;
      drops[i * 3 + 1] = Math.random() * 12;
      drops[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    const mat = new THREE.LineBasicMaterial({ color: '#d6e6f5', transparent: true, opacity: heavy ? 0.5 : 0.3, depthWrite: false });
    return { geo, pos, drops, mat, obj: new THREE.LineSegments(geo, mat) };
  }, [n, heavy]);
  const wind = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(Math.max(1, streaksN) * 6);
    const col = new Float32Array(Math.max(1, streaksN) * 6);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
    const s = new Float32Array(Math.max(1, streaksN) * 4);
    for (let i = 0; i < streaksN; i++) {
      s[i * 4] = (Math.random() - 0.5) * 24;
      s[i * 4 + 1] = 0.4 + Math.random() * 4.5;
      s[i * 4 + 2] = (Math.random() - 0.5) * 26;
      s[i * 4 + 3] = Math.random();
    }
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const obj = new THREE.LineSegments(geo, mat);
    obj.visible = streaksN > 0;
    return { geo, pos, col, s, mat, obj };
  }, [streaksN]);
  useDisposeOnUnmount(rain);
  useDisposeOnUnmount(wind);

  useFrame((_, rdt) => {
    const dt = Math.min(0.05, rdt) * Math.max(0.3, engine.timeScale);
    const w = engine.ball.wind ?? { x: 0.8, z: 0 };
    const vx = w.x * 0.9;
    const vz = w.z * 0.9;
    const vy = -13;
    const { pos, drops } = rain;
    const len = 0.045;
    for (let i = 0; i < n; i++) {
      const j = i * 3;
      drops[j] += vx * dt;
      drops[j + 1] += vy * dt;
      drops[j + 2] += vz * dt;
      if (drops[j + 1] < 0) {
        drops[j] = (Math.random() - 0.5) * 26 - vx * 0.4;
        drops[j + 1] = 10 + Math.random() * 3;
        drops[j + 2] = (Math.random() - 0.5) * 30 - vz * 0.4;
      }
      if (drops[j] > 14) drops[j] -= 28;
      else if (drops[j] < -14) drops[j] += 28;
      if (drops[j + 2] > 16) drops[j + 2] -= 32;
      else if (drops[j + 2] < -16) drops[j + 2] += 32;
      const k = i * 6;
      pos[k] = drops[j];
      pos[k + 1] = drops[j + 1];
      pos[k + 2] = drops[j + 2];
      pos[k + 3] = drops[j] - vx * len;
      pos[k + 4] = drops[j + 1] - vy * len;
      pos[k + 5] = drops[j + 2] - vz * len;
    }
    (rain.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    if (streaksN) {
      const sp = Math.hypot(w.x, w.z) || 1;
      const ux = w.x / sp;
      const uz = w.z / sp;
      const { s, pos: wp, col } = wind;
      for (let i = 0; i < streaksN; i++) {
        const j = i * 4;
        s[j] += w.x * 2.6 * dt;
        s[j + 2] += w.z * 2.6 * dt;
        s[j + 3] += dt * 0.7;
        if (s[j + 3] > 1 || Math.abs(s[j]) > 13 || Math.abs(s[j + 2]) > 14) {
          s[j] = (Math.random() - 0.5) * 22 - ux * 6;
          s[j + 1] = 0.4 + Math.random() * 4.5;
          s[j + 2] = (Math.random() - 0.5) * 24 - uz * 6;
          s[j + 3] = 0;
        }
        const life = Math.sin(s[j + 3] * Math.PI);
        const l = 1.2 + sp * 0.35;
        const k = i * 6;
        wp[k] = s[j];
        wp[k + 1] = s[j + 1];
        wp[k + 2] = s[j + 2];
        wp[k + 3] = s[j] - ux * l;
        wp[k + 4] = s[j + 1];
        wp[k + 5] = s[j + 2] - uz * l;
        const c = 0.55 * life;
        col[k] = c;
        col[k + 1] = c;
        col[k + 2] = c;
        col[k + 3] = 0;
        col[k + 4] = 0;
        col[k + 5] = 0;
      }
      (wind.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (wind.geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    }
  });
  return (
    <group>
      <primitive object={rain.obj} frustumCulled={false} />
      <primitive object={wind.obj} frustumCulled={false} />
    </group>
  );
};

/**
 * 開場暖身：平常藏起來的道具（落點準星、光圈、積水）第一次出現時，three 才會把頂點資料傳上 GPU。
 * 掛上去的第一幀先把它們全部畫一次、下一幀再藏回去，比賽中就不會再建新的緩衝區。
 */
const useWarmUp = (root: React.RefObject<THREE.Group>) => {
  const frame = useRef(0);
  const shown = useRef<THREE.Object3D[]>([]);
  useFrame(() => {
    frame.current++;
    if (frame.current === 1 && root.current) {
      shown.current = [];
      root.current.traverse((o) => {
        if (!o.visible) {
          o.visible = true;
          shown.current.push(o);
        }
      });
    } else if (frame.current === 2) {
      for (const o of shown.current) o.visible = false;
      shown.current = [];
    }
  });
};

/** 每一關（每個引擎）重新掛一次：子元件先訂閱 useFrame，暖身才會在它們設定完可見度之後執行 */
const engineIds = new WeakMap<GameEngine, number>();
let nextEngineId = 0;

export const LevelProps = (props: { engine: GameEngine; lowSpec: boolean }) => {
  if (!engineIds.has(props.engine)) engineIds.set(props.engine, ++nextEngineId);
  return <LevelPropsFor key={engineIds.get(props.engine)} {...props} />;
};

const LevelPropsFor = ({ engine, lowSpec }: { engine: GameEngine; lowSpec: boolean }) => {
  const root = useRef<THREE.Group>(null);
  useWarmUp(root);
  const level = engine.level;
  if (!level) return null;
  return (
    <group ref={root}>
      {level.id === 'cups' && <Cups engine={engine} level={level as CupsLevel} />}
      {level.id === 'pearls' && <Pearls engine={engine} level={level as PearlsLevel} />}
      {level.feedFrom && <FeedMachine engine={engine} />}
      {level.id === 'typhoon' && <Puddles engine={engine} />}
      <Weather engine={engine} heavy={level.id === 'typhoon'} lowSpec={lowSpec} />
      {/* 場外的範圍提示：小遊戲裡對面的半場是「靶場」 */}
      {level.id === 'cups' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -L / 2]}>
          <planeGeometry args={[W * 2, L]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.06} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};
