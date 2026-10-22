import { Component, type MutableRefObject, type ReactNode, Suspense, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { COURT } from './engine/constants';
import type { GameEngine, GameEvent, InputState } from './engine/game';
import { teamSide } from './engine/rules';
import { Stadium } from './scene/Stadium';
import { RoseGardenVenue } from './scene/RoseGardenVenue';
import type { Venue } from './GameScreens';
import { AthleteModel } from './scene/AthleteModel';
import { lookFromCharacter } from './scene/characterData';
import type { CharacterDef } from './characters';
import { BallModel } from './scene/BallModel';
import { Effects } from './scene/Effects';
import { Guide } from './scene/Guide';
import { type FxBus, createFxBus } from './scene/fxBus';

/** 選手模型載入失敗（網路、素材）時只是不顯示，不要讓整個遊戲畫面掛掉 */
class SkipOnError extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('athlete failed to load', error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const L = COURT.halfLength;
const K = COURT.kitchen;

interface SceneProps {
  engine: GameEngine;
  /** [玩家, 對手] 的角色：臉與配色會套到 3D 選手上 */
  characters: [CharacterDef, CharacterDef];
  readInput: () => InputState;
  paused: boolean;
  onEvents: (events: GameEvent[]) => void;
  lowSpec: boolean;
  /** 比賽場地：夜間體育館或新生公園戶外場 */
  venue: Venue;
}

type Num = MutableRefObject<number>;

/** 主迴圈＋鏡頭：轉播視角，必殺時切到發招選手的特寫運鏡 */
const Rig = ({
  engine,
  readInput,
  paused,
  onEvents,
  bus,
  excite,
  flash,
  aberration,
}: SceneProps & { bus: FxBus; excite: Num; flash: Num; aberration: Num }) => {
  const { camera, size } = useThree();
  const shake = useRef(0);
  const look = useRef(new THREE.Vector3(0, 0.5, -2));
  const first = useRef(true);
  const fovKick = useRef(0);
  // 擊球時鏡頭往擊球方向「踢」一下，再彈簧回位
  const kick = useRef(new THREE.Vector3());
  const clock = useRef(0);
  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3() }), []);
  /** 鏡頭的基準位置（不含踢動），渲染位置 = 基準 + 踢動 */
  const base = useRef(new THREE.Vector3(0, 5.2, 11));

  useFrame((_, delta) => {
    if (!paused) engine.update(delta, readInput());
    const events = engine.drainEvents();
    if (events.length) {
      for (const e of events) {
        bus.queue.push(e);
        if (e.type === 'hit') {
          if (e.special) {
            shake.current = 0.35;
            fovKick.current = 8;
            flash.current = 1;
            excite.current = Math.max(excite.current, 0.7);
            aberration.current = 1;
          } else {
            const power = Math.min(1, e.speed / 24);
            if (e.team === 0) {
              // 自己擊球：鏡頭沿擊球方向往前踢，完美擊球再推近一點
              kick.current.set(0, -0.04 - power * 0.06, -(0.12 + power * 0.22));
              if (e.quality !== null && e.quality >= 0.9) fovKick.current = Math.min(fovKick.current, -2.5);
              shake.current = Math.max(shake.current, 0.03 + power * 0.06);
              // 殺球、突擊：重扣的手感
              if (e.kind === 'smash' || e.kind === 'speedup') {
                shake.current = Math.max(shake.current, e.kind === 'smash' ? 0.16 : 0.1);
                fovKick.current = Math.min(fovKick.current, -4);
              }
            } else if (e.kind === 'smash' || e.kind === 'speedup' || e.speed > 20) shake.current = Math.max(shake.current, 0.1);
          }
        } else if (e.type === 'bounce' && e.special) {
          shake.current = e.special === 'thunder' ? 0.5 : 0.25;
          aberration.current = Math.max(aberration.current, 0.6);
        } else if (e.type === 'counter') {
          shake.current = 0.3;
          excite.current = 1;
          aberration.current = 0.8;
        } else if (e.type === 'point') {
          excite.current = Math.max(excite.current, e.faultTeam === null ? 1 : 0.35);
        } else if (e.type === 'net') shake.current = Math.max(shake.current, 0.04);
      }
      onEvents(events);
    }

    const cam = camera as THREE.PerspectiveCamera;
    const portrait = size.width < size.height;
    const k = first.current ? 1 : 1 - Math.exp(-delta * 4);
    first.current = false;

    const cin = engine.cinematic;
    const cinAge = cin ? engine.real - cin.start : 99;
    let fov = portrait ? 58 : 46;
    if (cin && cinAge < 0.85) {
      // 必殺特寫：從發招選手前方低角度仰拍，慢慢繞一點
      const a = engine.athletes.find((x) => x.team === cin.team)!;
      const s = teamSide(a.team);
      const orbit = 0.6 + cinAge * 0.5;
      const px = a.pos.x + Math.sin(orbit) * 3.1 * s;
      const pz = a.pos.z - Math.cos(orbit) * 3.1 * s;
      const kk = 1 - Math.exp(-delta * 14);
      base.current.lerp(v.a.set(px, 1.15, pz), kk);
      cam.position.copy(base.current);
      look.current.lerp(v.b.set(a.pos.x, 1.25, a.pos.z), kk);
      cam.lookAt(look.current);
      cam.rotateZ(-0.12 * s);
      fov = 40;
    } else {
      // 轉播視角：鏡頭在玩家身後斜上方，跟著左右移動；上網時拉近
      const h = engine.human.pos;
      const forward = THREE.MathUtils.clamp((L - h.z) / (L - K), 0, 1);
      const tx = h.x * 0.5;
      const ty = (portrait ? 8.6 : 5.2) - forward * 0.6;
      const tz = Math.max(h.z + (portrait ? 6.4 : 5.6), (portrait ? 11.4 : 10.4) - forward * 1.6);
      const kk = cinAge < 2 ? 1 - Math.exp(-delta * 6) : k;
      // 踢動用彈簧回位（真實時間），頓幀時也看得到
      kick.current.multiplyScalar(Math.exp(-delta * 10));
      const bp = base.current;
      bp.x += (tx - bp.x) * kk;
      bp.y += (ty - bp.y) * kk;
      bp.z += (tz - bp.z) * kk;
      look.current.lerp(v.b.set(h.x * 0.3, 0.3, (portrait ? -1.2 : -2.4) + forward * 0.8), kk);
      shake.current = Math.max(0, shake.current - delta * 0.9);
      // 平滑的震動（正弦噪聲），不是每幀亂跳
      clock.current += delta;
      const sh = shake.current;
      const t = clock.current;
      const sx = (Math.sin(t * 53) + Math.sin(t * 31.7) * 0.6) * 0.5 * sh;
      const sy = (Math.sin(t * 47.3) + Math.sin(t * 23.1) * 0.6) * 0.5 * sh;
      cam.position.copy(bp).add(kick.current);
      cam.lookAt(look.current.x + sx, look.current.y + sy, look.current.z);
    }
    fovKick.current += (0 - fovKick.current) * Math.min(1, delta * 9);
    const targetFov = fov + fovKick.current;
    if (Math.abs(cam.fov - targetFov) > 0.05) {
      cam.fov += (targetFov - cam.fov) * Math.min(1, delta * 10);
      cam.updateProjectionMatrix();
    }
    aberration.current = Math.max(0, aberration.current - delta * 1.6);
  });
  return null;
};

/** 後處理：光暈讓火焰與燈光發亮；必殺演出時加一點色差。白天場地門檻拉高，免得白牆、天空整片發光 */
const PostFx = ({ aberration, lowSpec, day }: { aberration: Num; lowSpec: boolean; day: boolean }) => {
  const offset = useMemo(() => new THREE.Vector2(0, 0), []);
  useFrame(() => {
    const a = aberration.current * 0.003;
    offset.set(a, a * 0.6);
  });
  if (lowSpec) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={day ? 1.1 : 0.75} luminanceSmoothing={0.2} intensity={day ? 0.6 : 0.8} radius={0.7} />
        <Vignette eskil={false} offset={0.25} darkness={day ? 0.35 : 0.55} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={day ? 1.1 : 0.72} luminanceSmoothing={0.2} intensity={day ? 0.7 : 1.15} radius={0.75} />
      <ChromaticAberration offset={offset} blendFunction={BlendFunction.NORMAL} radialModulation={false} modulationOffset={0} />
      <Vignette eskil={false} offset={0.25} darkness={day ? 0.35 : 0.55} />
    </EffectComposer>
  );
};

export const GameScene = (props: SceneProps) => {
  const { engine, lowSpec, venue } = props;
  const day = venue === 'rosegarden';
  const bus = useMemo(createFxBus, []);
  const excite = useRef(0);
  const flash = useRef(0);
  const aberration = useRef(0);
  const { characters } = props;
  const looks = useMemo(() => characters.map(lookFromCharacter), [characters]);
  return (
    <>
      {day ? (
        <>
          <color attach="background" args={['#a9cdf0']} />
          <fog attach="fog" args={['#c9dcea', 45, 150]} />
          <RoseGardenVenue excite={excite} lowSpec={lowSpec} />
        </>
      ) : (
        <>
          <color attach="background" args={['#050913']} />
          <fog attach="fog" args={['#0a1226', 30, 75]} />
          <Stadium engine={engine} names={[characters[0].name, characters[1].name]} excite={excite} flash={flash} lowSpec={lowSpec} />
        </>
      )}
      {engine.athletes.map((a, i) => (
        <SkipOnError key={`${a.id}-${a.paddle.id}-${looks[i].key}`}>
          <Suspense fallback={null}>
            <AthleteModel engine={engine} index={i} look={looks[i]} />
          </Suspense>
        </SkipOnError>
      ))}
      <Guide engine={engine} />
      <BallModel engine={engine} />
      <Effects engine={engine} bus={bus} lowSpec={lowSpec} />
      <Rig {...props} bus={bus} excite={excite} flash={flash} aberration={aberration} />
      <PostFx aberration={aberration} lowSpec={lowSpec} day={day} />
    </>
  );
};
