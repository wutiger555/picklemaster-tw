import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GameEngine } from '../game/engine/game';
import { COURT } from '../game/engine/constants';
import { CHARACTERS } from '../game/characters';
import { AthleteModel } from '../game/scene/AthleteModel';
import { lookFromCharacter, paddleTips } from '../game/scene/characterData';
import type { CameraView, DemoClock, StrokeDemoConfig } from './strokeConfig';

/**
 * 3D 動作示範：用 /game 的選手模型與揮拍姿勢解算（有關節限制的 IK、重心轉移、動力鏈），
 * 餵一個不推進的引擎當資料來源，時間由示範時鐘控制，所以可以慢動作、暫停、拖時間軸。
 */

/** 擊球瞬間的引擎時間（任意值，只要遠離 0） */
const TC = 100;
/** 示範選手用引擎的 1 號座位（AI、遠端半場，面向 +Z、右手在 −X） */
const SEAT = 1;
const STAND = new THREE.Vector3(0, 0, -6);
const R = new THREE.Vector3(-1, 0, 0);
const BALL_R = 0.037;

const VIEWS: Record<CameraView, { pos: [number, number, number]; target: [number, number, number] }> = {
  side: { pos: [-3.5, 1.35, -4.3], target: [-0.25, 0.95, -5.8] },
  front: { pos: [-0.9, 1.5, -2.3], target: [-0.25, 0.95, -5.9] },
  back: { pos: [0.85, 1.75, -9.7], target: [-0.3, 0.95, -5.5] },
  top: { pos: [-0.35, 5.8, -5.68], target: [-0.35, 0.4, -5.75] },
};

const useDemo = (cfg: StrokeDemoConfig) =>
  useMemo(() => {
    const engine = new GameEngine({ mode: 'match', difficulty: 'rookie', assist: false, specials: false, paddles: ['storm', 'storm'] });
    const a = engine.athletes[SEAT];
    a.traits = { ...a.traits, grip: cfg.grip, backhand: 'two' };
    a.pos.x = a.prevPos.x = STAND.x;
    a.pos.z = a.prevPos.z = STAND.z;
    const [right, up, fwd] = cfg.contact;
    const c = STAND.clone().addScaledVector(R, right).setY(up);
    c.z += fwd;
    engine.phase = 'rally';
    engine.rally.lastTeam = 0;
    a.swing.button = cfg.button;
    a.ai!.plan = {
      contactT: TC,
      stand: { x: STAND.x, z: STAND.z },
      path: [],
      pathT0: 0,
      pathBounces0: 0,
      leave: false,
      swung: true,
      contact: { x: c.x, y: c.y, z: c.z },
      timingError: 0,
      volley: false,
      feasible: true,
    };
    // 對手出手的瞬間：示範選手照真實節奏先做分腿墊步
    engine.athletes[0].swing.contactAt = TC + cfg.from + 0.1;
    return { engine, contact: c };
  }, [cfg]);

/** 球的位置：來球先落地彈起、在擊球點被打出去（擊球前後各一段拋物線） */
const ballAt = (cfg: StrokeDemoConfig, c: THREE.Vector3, u: number, out: THREE.Vector3) => {
  const g = 4.905;
  if (u >= 0) {
    out.set(c.x - 0.5 * u, c.y + cfg.ballOut.vy * u - g * u * u, c.z + cfg.ballOut.speed * u);
  } else {
    const tb = cfg.ballIn.bounceBefore;
    const vb = (c.y - BALL_R + g * tb * tb) / tb;
    const s = u + tb;
    const y = s >= 0 ? BALL_R + vb * s - g * s * s : BALL_R - (vb / 0.7) * s - g * s * s;
    out.set(c.x + 0.15 * u, y, c.z - cfg.ballIn.speed * u);
  }
  out.y = Math.max(BALL_R, out.y);
  return out;
};

/** 推進示範時鐘、把時間與球寫進引擎（要比選手的 useFrame 先跑：放在選手前面掛載） */
const Driver = ({ engine, clock, cfg, contact, ball }: { engine: GameEngine; clock: DemoClock; cfg: StrokeDemoConfig; contact: THREE.Vector3; ball: React.RefObject<THREE.Mesh> }) => {
  const p = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, raw) => {
    const dt = Math.min(0.05, raw);
    if (clock.playing) {
      clock.u += dt * clock.speed;
      if (clock.u > cfg.to) {
        clock.u = cfg.from;
        clock.loop++;
      }
    }
    engine.time = TC + clock.u;
    engine.real = engine.time;
    ballAt(cfg, contact, clock.u, p);
    engine.ball.pos.x = p.x;
    engine.ball.pos.y = p.y;
    engine.ball.pos.z = p.z;
    if (ball.current) ball.current.position.copy(p);
  });
  return null;
};

/** 拍面甜區的揮拍軌跡：每輪重畫，暫停時保留上一輪 */
const SwingTrail = ({ clock, cfg }: { clock: DemoClock; cfg: StrokeDemoConfig }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const st = useRef({ loop: -1, pts: [] as THREE.Vector3[], built: 0 });
  useEffect(() => () => mesh.current?.geometry.dispose(), []);
  useFrame(() => {
    const s = st.current;
    const m = mesh.current;
    if (!clock.playing || !m) return;
    if (s.loop !== clock.loop) {
      s.loop = clock.loop;
      s.pts = [];
      s.built = 0;
    }
    const tip = paddleTips.get(SEAT);
    if (!tip || clock.u < cfg.trail[0] || clock.u > cfg.trail[1]) return;
    const last = s.pts[s.pts.length - 1];
    if (!last || last.distanceToSquared(tip) > 0.0004) s.pts.push(tip.clone());
    // 每多幾個點重建一次管子（一輪約 100 個點，成本很低）
    if (s.pts.length >= 4 && s.pts.length - s.built >= 3) {
      s.built = s.pts.length;
      const curve = new THREE.CatmullRomCurve3(s.pts);
      m.geometry.dispose();
      m.geometry = new THREE.TubeGeometry(curve, Math.min(240, s.pts.length * 3), 0.011, 6, false);
    }
  });
  return (
    <mesh ref={mesh}>
      <bufferGeometry />
      <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.9} roughness={0.4} transparent opacity={0.9} />
    </mesh>
  );
};

/** 擊球點：擊球瞬間前後亮起的圈 */
const ContactMark = ({ clock, contact }: { clock: DemoClock; contact: THREE.Vector3 }) => {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ring.current) return;
    const k = Math.max(0, 1 - Math.abs(clock.u) / 0.25);
    ring.current.scale.setScalar(0.7 + 0.6 * k);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + 0.7 * k;
  });
  return (
    <mesh ref={ring} position={contact}>
      <torusGeometry args={[0.12, 0.008, 8, 40]} />
      <meshBasicMaterial color="#fde047" transparent depthWrite={false} />
    </mesh>
  );
};

const CameraRig = ({ clock }: { clock: DemoClock }) => {
  const { camera, controls, size } = useThree();
  const a = useRef({ nonce: -1, t: 1, fromP: new THREE.Vector3(), fromT: new THREE.Vector3(), toP: new THREE.Vector3(), toT: new THREE.Vector3() });
  useFrame((_, raw) => {
    const ctl = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    const s = a.current;
    if (s.nonce !== clock.viewNonce) {
      s.nonce = clock.viewNonce;
      s.t = 0;
      s.fromP.copy(camera.position);
      s.fromT.copy(ctl?.target ?? new THREE.Vector3(...VIEWS[clock.view].target));
      s.toT.set(...VIEWS[clock.view].target);
      // 直式畫面（手機）視野比較窄：鏡頭往後拉，整個人才放得進來
      const back = size.width < size.height ? 1.5 : 1;
      s.toP.set(...VIEWS[clock.view].pos).sub(s.toT).multiplyScalar(back).add(s.toT);
    }
    if (s.t >= 1) return;
    s.t = Math.min(1, s.t + Math.min(0.05, raw) / 0.8);
    const k = s.t * s.t * (3 - 2 * s.t);
    camera.position.lerpVectors(s.fromP, s.toP, k);
    if (ctl) {
      ctl.target.lerpVectors(s.fromT, s.toT, k);
      ctl.update();
    } else camera.lookAt(s.toT);
  });
  return null;
};

/** 球場：真實尺寸（20 × 44 ft），只畫示範選手這半場附近 */
const Court = () => {
  const line = (x: number, z: number, w: number, d: number, key: string) => (
    <mesh key={key} position={[x, 0.003, z]} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.6} />
    </mesh>
  );
  const L = 0.05;
  const hw = COURT.halfWidth;
  const hl = COURT.halfLength;
  const k = COURT.kitchen;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.002, -2]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1d4d3c" roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[hw * 2, hl * 2]} />
        <meshStandardMaterial color="#1e5f8c" roughness={0.85} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[hw * 2, k * 2]} />
        <meshStandardMaterial color="#2b77ad" roughness={0.85} />
      </mesh>
      {line(0, -hl, hw * 2 + L, L, 'base')}
      {line(0, hl, hw * 2 + L, L, 'base2')}
      {line(-hw, 0, L, hl * 2, 'sideL')}
      {line(hw, 0, L, hl * 2, 'sideR')}
      {line(0, -k, hw * 2, L, 'kit')}
      {line(0, k, hw * 2, L, 'kit2')}
      {line(0, -(hl + k) / 2, L, hl - k, 'center')}
      {line(0, (hl + k) / 2, L, hl - k, 'center2')}
      {/* 球網 */}
      <mesh position={[0, COURT.netCenterHeight / 2, 0]}>
        <planeGeometry args={[hw * 2 + 0.6, COURT.netCenterHeight]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, COURT.netCenterHeight, 0]}>
        <boxGeometry args={[hw * 2 + 0.6, 0.05, 0.02]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw + 0.3), COURT.netPostHeight / 2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, COURT.netPostHeight, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

const Ready = ({ onReady }: { onReady: () => void }) => {
  useEffect(onReady, [onReady]);
  return null;
};

interface Props {
  cfg: StrokeDemoConfig;
  clock: DemoClock;
  active: boolean;
  orbit: boolean;
  onReady: () => void;
}

const StrokeScene = ({ cfg, clock, active, orbit, onReady }: Props) => {
  const { engine, contact } = useDemo(cfg);
  const look = useMemo(() => lookFromCharacter(CHARACTERS[0]), []);
  const ball = useRef<THREE.Mesh>(null);
  const lightTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.copy(STAND);
    return o;
  }, []);
  const v = VIEWS[cfg.view];

  return (
    <Canvas shadows dpr={[1, 1.75]} frameloop={active ? 'always' : 'never'} camera={{ position: v.pos, fov: 34, near: 0.1, far: 60 }} gl={{ antialias: true }}>
      <color attach="background" args={['#0d1f1a']} />
      <fog attach="fog" args={['#0d1f1a', 9, 20]} />
      <hemisphereLight args={['#ffffff', '#24463a', 1.5]} />
      <primitive object={lightTarget} />
      <directionalLight
        position={[-2.5, 6, -3.5]}
        intensity={3.2}
        target={lightTarget}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[3, 2.5, -9]} intensity={1.4} color="#a7f3d0" />
      <Court />
      <Driver engine={engine} clock={clock} cfg={cfg} contact={contact} ball={ball} />
      <mesh ref={ball} castShadow>
        <sphereGeometry args={[BALL_R, 20, 14]} />
        <meshStandardMaterial color="#e6f53a" roughness={0.45} emissive="#6b7008" emissiveIntensity={0.35} />
      </mesh>
      <ContactMark clock={clock} contact={contact} />
      <Suspense fallback={null}>
        <AthleteModel engine={engine} index={SEAT} look={look} />
        <SwingTrail clock={clock} cfg={cfg} />
        <Ready onReady={onReady} />
      </Suspense>
      <CameraRig clock={clock} />
      <OrbitControls makeDefault enabled={orbit} target={v.target} enablePan={false} minDistance={1.6} maxDistance={9} maxPolarAngle={Math.PI / 2 - 0.05} />
    </Canvas>
  );
};

export default StrokeScene;
