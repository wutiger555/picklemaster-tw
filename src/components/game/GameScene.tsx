import { type MutableRefObject, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { COURT } from './engine/constants';
import type { GameEngine, GameEvent, InputState } from './engine/game';
import { teamSide } from './engine/rules';
import { Stadium } from './scene/Stadium';
import { Character } from './scene/Character';
import { lookFor } from './scene/characterData';
import { BallModel } from './scene/BallModel';
import { Effects } from './scene/Effects';
import { type FxBus, createFxBus } from './scene/fxBus';

const L = COURT.halfLength;
const K = COURT.kitchen;

interface SceneProps {
  engine: GameEngine;
  readInput: () => InputState;
  paused: boolean;
  onEvents: (events: GameEvent[]) => void;
  lowSpec: boolean;
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
          } else if (e.kind === 'smash' || e.speed > 20) shake.current = Math.max(shake.current, 0.12);
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
      cam.position.lerp(new THREE.Vector3(px, 1.15, pz), kk);
      look.current.lerp(new THREE.Vector3(a.pos.x, 1.25, a.pos.z), kk);
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
      cam.position.x += (tx - cam.position.x) * kk;
      cam.position.y += (ty - cam.position.y) * kk;
      cam.position.z += (tz - cam.position.z) * kk;
      look.current.lerp(new THREE.Vector3(h.x * 0.3, 0.3, (portrait ? -1.2 : -2.4) + forward * 0.8), kk);
      shake.current = Math.max(0, shake.current - delta * 0.9);
      const sh = shake.current;
      cam.lookAt(look.current.x + (Math.random() - 0.5) * sh, look.current.y + (Math.random() - 0.5) * sh, look.current.z);
    }
    fovKick.current = Math.max(0, fovKick.current - delta * 18);
    const targetFov = fov + fovKick.current;
    if (Math.abs(cam.fov - targetFov) > 0.05) {
      cam.fov += (targetFov - cam.fov) * Math.min(1, delta * 10);
      cam.updateProjectionMatrix();
    }
    aberration.current = Math.max(0, aberration.current - delta * 1.6);
  });
  return null;
};

/** 後處理：光暈讓火焰與燈光發亮；必殺演出時加一點色差 */
const PostFx = ({ aberration, lowSpec }: { aberration: Num; lowSpec: boolean }) => {
  const offset = useMemo(() => new THREE.Vector2(0, 0), []);
  useFrame(() => {
    const a = aberration.current * 0.003;
    offset.set(a, a * 0.6);
  });
  if (lowSpec) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.75} luminanceSmoothing={0.2} intensity={0.8} radius={0.7} />
        <Vignette eskil={false} offset={0.25} darkness={0.55} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={0.72} luminanceSmoothing={0.2} intensity={1.15} radius={0.75} />
      <ChromaticAberration offset={offset} blendFunction={BlendFunction.NORMAL} radialModulation={false} modulationOffset={0} />
      <Vignette eskil={false} offset={0.25} darkness={0.55} />
    </EffectComposer>
  );
};

export const GameScene = (props: SceneProps) => {
  const { engine, lowSpec } = props;
  const bus = useMemo(createFxBus, []);
  const excite = useRef(0);
  const flash = useRef(0);
  const aberration = useRef(0);
  const looks = useMemo(() => engine.athletes.map((a) => lookFor(a.team, a.paddle.id)), [engine]);
  return (
    <>
      <color attach="background" args={['#050913']} />
      <fog attach="fog" args={['#0a1226', 30, 75]} />
      <Stadium engine={engine} excite={excite} flash={flash} lowSpec={lowSpec} />
      {engine.athletes.map((a, i) => (
        <Character key={`${a.id}-${a.paddle.id}`} engine={engine} index={i} look={looks[i]} />
      ))}
      <BallModel engine={engine} />
      <Effects engine={engine} bus={bus} lowSpec={lowSpec} />
      <Rig {...props} bus={bus} excite={excite} flash={flash} aberration={aberration} />
      <PostFx aberration={aberration} lowSpec={lowSpec} />
    </>
  );
};
