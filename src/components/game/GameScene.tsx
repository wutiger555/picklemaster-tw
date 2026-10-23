import { Component, type MutableRefObject, type ReactNode, type Ref, Suspense, memo, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction, type ChromaticAberrationEffect } from 'postprocessing';
import * as THREE from 'three';
import { COURT } from './engine/constants';
import type { GameEngine, GameEvent, InputState } from './engine/game';
import { teamSide } from './engine/rules';
import { Stadium } from './scene/Stadium';
import { RoseGardenVenue } from './scene/RoseGardenVenue';
import { BeachVenue } from './scene/BeachVenue';
import { LevelProps } from './scene/LevelProps';
import type { Venue } from './GameScreens';
import { AthleteModel } from './scene/AthleteModel';
import { lookFromCharacter } from './scene/characterData';
import type { CharacterDef } from './characters';
import { BallModel } from './scene/BallModel';
import { Effects } from './scene/Effects';
import { Guide } from './scene/Guide';
import { ReviewFx } from './scene/ReviewFx';
import { type FxBus, createFxBus } from './scene/fxBus';
import type { ClipRecorder } from './clip';

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
  /** 比賽場地：夜間體育館、新生公園戶外場，或踢館之旅的海邊 */
  venue: Venue;
  /** 精彩球錄影（不支援錄影的瀏覽器是 null） */
  clip: ClipRecorder | null;
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
  const reviewAngle = useRef<string | null>(null);
  const reviewSince = useRef(0);
  const replayCut = useRef(0);

  useFrame((_, delta) => {
    if (!paused) engine.update(delta, readInput());
    const events = engine.drainEvents();
    if (events.length) {
      for (const e of events) {
        bus.queue.push(e);
        if (e.type === 'hit') {
          if (e.dive) {
            // 撲到了：推近、震一下，觀眾跟著興奮
            shake.current = Math.max(shake.current, 0.14);
            fovKick.current = Math.min(fovKick.current, -5);
            excite.current = Math.max(excite.current, 0.6);
          } else if (e.special) {
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
          shake.current = e.special === 'thunder' || e.special === 'quake' ? 0.5 : 0.25;
          aberration.current = Math.max(aberration.current, 0.6);
        } else if (e.type === 'counter') {
          shake.current = 0.3;
          excite.current = 1;
          aberration.current = 0.8;
        } else if (e.type === 'point') {
          excite.current = Math.max(excite.current, e.faultTeam === null ? 1 : 0.35);
        } else if (e.type === 'awaken' || e.type === 'comboMilestone') {
          // 覺醒、連擊里程碑：全場起立
          excite.current = 1;
          if (e.type === 'awaken') {
            flash.current = 1;
            aberration.current = 1;
          }
        } else if (e.type === 'diveLand') {
          // 撲倒落地：重重一震
          shake.current = Math.max(shake.current, e.team === 0 ? 0.28 : 0.16);
          if (e.team === 0) kick.current.set(0, -0.12, 0);
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
    const awk = engine.awakening;
    const awkAge = awk ? engine.real - awk.start : 99;
    const cel = engine.celebration;
    const celAge = cel && engine.phase === 'dead' ? engine.real - cel.start : 99;
    let fov = portrait ? 63 : 46;
    const rv = engine.reviewView();
    const rp = engine.replay;
    if (rp) {
      // 精彩重播：換一個轉播角度，換鏡頭時直接切
      const cut = replayCut.current !== engine.replayCuts;
      replayCut.current = engine.replayCuts;
      const b = engine.ball.pos;
      const a = engine.athletes.find((x) => x.team === rp.team)!;
      const s = teamSide(rp.team);
      const sx = Math.sign(a.pos.x) || 1;
      if (rp.angle === 'side') {
        // 邊線外的軌道攝影機：低角度跟著球沿邊線走
        v.a.set(sx * (portrait ? 9.6 : 8.2), 1.45, THREE.MathUtils.clamp(b.z * 0.75, -L + 1, L - 1));
        v.b.set(b.x * 0.35, 0.75, b.z * 0.9);
        fov = portrait ? 58 : 44;
      } else {
        // 得分者這半場、對面邊線外貼地的低角度：隔著半個場地仰看出手（和得分者同一側的網前，網不會擋住）
        v.a.set(-sx * (COURT.halfWidth + 1.6), 0.4, s * 1.6);
        v.b.set(a.pos.x * 0.8 + b.x * 0.2, 1.0, a.pos.z * 0.8 + b.z * 0.2);
        fov = portrait ? 66 : 52;
      }
      const kk = cut ? 1 : 1 - Math.exp(-delta * 5);
      base.current.lerp(v.a, kk);
      look.current.lerp(v.b, kk);
      cam.position.copy(base.current);
      cam.lookAt(look.current);
      if (cut) {
        cam.fov = fov;
        cam.updateProjectionMatrix();
      }
    } else if (rv) {
      // 電視輔助判決：像轉播一樣切鏡頭（換角度時直接切，不滑過去）
      if (rv.angle !== reviewAngle.current) {
        reviewAngle.current = rv.angle;
        reviewSince.current = 0;
      }
      reviewSince.current += delta;
      const p = rv.pos;
      const sx = Math.sign(p.x) || 1;
      const sz = Math.sign(p.z) || 1;
      const lineZ = rv.line === 'kitchen' ? sz * COURT.kitchen : sz * COURT.halfLength;
      const lineX = rv.line === 'center' ? 0 : sx * COURT.halfWidth;
      const alongZ = rv.line === 'side' || rv.line === 'center';
      const u = reviewSince.current;
      if (rv.angle === 'broadcast') {
        // 高角度轉播慢動作：從球場側邊斜看整段球路
        v.a.set(-sx * 7.5, 3.8, p.z * 0.55 + sz * 1.5);
        v.b.set(p.x * 0.6, 0.5, p.z * 0.7);
        fov = 42;
      } else if (rv.angle === 'hawk') {
        // 鷹眼：落點正上方，慢慢推近
        const h = THREE.MathUtils.lerp(2.6, 0.9, Math.min(1, u / 1.6));
        v.a.set(p.x + (alongZ ? 0 : 0.01), h, p.z + (alongZ ? 0.01 : 0) + 0.12 * sz);
        v.b.set(p.x, 0, p.z);
        fov = 32;
      } else {
        // 線審視角：貼地沿著那條線看過去（mini 是比較遠、慢慢繞的版本）
        const far = rv.angle === 'mini' ? 3.4 : 2.2;
        const hgt = rv.angle === 'mini' ? 0.45 + Math.sin(u * 0.5) * 0.08 : 0.13;
        // 從線的哪一頭看：挑離選手比較遠的那邊，免得鏡頭被腿擋住
        const clear = (x: number, z: number) => Math.min(...engine.athletes.map((a) => Math.hypot(a.pos.x - x, a.pos.z - z)));
        if (alongZ) {
          const d = clear(lineX, p.z - sz * far) >= clear(lineX, p.z + sz * far) ? -sz : sz;
          v.a.set(lineX, hgt, p.z + d * far);
        } else {
          const d = clear(p.x - sx * far, lineZ) >= clear(p.x + sx * far, lineZ) ? -sx : sx;
          v.a.set(p.x + d * far, hgt, lineZ);
        }
        v.b.set(p.x, 0.03, p.z);
        fov = rv.angle === 'mini' ? 36 : 30;
      }
      cam.position.copy(v.a);
      base.current.copy(v.a);
      look.current.copy(v.b);
      cam.lookAt(v.b);
    } else if (cin && cinAge < 0.85) {
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
    } else if (awk && awkAge < 1.85) {
      // 覺醒：切入畫面後面先就位，切入收掉後從正前方低角度往上搖，選手全身入鏡、慢慢繞到側面
      const a = engine.athletes.find((x) => x.team === awk.team)!;
      const s = teamSide(a.team);
      const orbit = -0.45 + awkAge * 0.5;
      const kk = 1 - Math.exp(-delta * 12);
      base.current.lerp(v.a.set(a.pos.x + Math.sin(orbit) * 3.4 * s, 0.7 + awkAge * 0.5, a.pos.z - Math.cos(orbit) * 3.4 * s), kk);
      cam.position.copy(base.current);
      look.current.lerp(v.b.set(a.pos.x, 1.15, a.pos.z), kk);
      cam.lookAt(look.current);
      fov = 42;
    } else if (cel && celAge > 0.25 && celAge < 1.85) {
      // 得分慶祝：鏡頭帶到得分者（從網前斜側拍，選手站在畫面下半，上面留給得分卡）
      const a = engine.athletes.find((x) => x.team === cel.team)!;
      const s = teamSide(a.team);
      const side = a.pos.x * s > 0 ? -1 : 1;
      const kk = 1 - Math.exp(-delta * 4.5);
      base.current.lerp(v.a.set(a.pos.x + side * 1.6 * s, 1.5, a.pos.z - 3.6 * s), kk);
      cam.position.copy(base.current);
      look.current.lerp(v.b.set(a.pos.x, 1.45, a.pos.z), kk);
      cam.lookAt(look.current);
      fov = cel.big ? 40 : 44;
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
    // 直向時畫面往上推一點：下面三分之一被搖桿和擊球鍵蓋住，自己的選手要站在按鈕上方；
    // 橫拿手機（畫面矮）時選手會貼著下緣，也稍微往上推
    const oy = Math.round(size.height * (portrait ? 0.18 : size.height < 500 ? 0.1 : 0));
    const view = cam.view;
    if (oy ? !view?.enabled || view.offsetY !== oy || view.fullWidth !== size.width || view.fullHeight !== size.height : view?.enabled) {
      if (oy) cam.setViewOffset(size.width, size.height, 0, oy, size.width, size.height);
      else cam.clearViewOffset();
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

/**
 * 預先編譯著色器、上傳貼圖：平常藏起來的東西（招式特效、分身球、地面痕跡）第一次出現時才編譯會當場卡住。
 * gl.compile 只走看得見的物件，所以先全部打開、編完再還原。模型與貼圖是非同步載入的，
 * 物件數或貼圖變了（貼圖晚到也會換著色器）就再做一次。
 */
const Prewarm = () => {
  const { gl, scene, camera } = useThree();
  // 畫面一律經過後處理（先畫到離屏緩衝）：著色器的色調映射、色彩空間設定和直接畫到螢幕不同，
  // 預熱時也要綁一個離屏目標，編出來的才是之後真的會用到的版本
  const target = useMemo(() => new THREE.WebGLRenderTarget(1, 1), []);
  useEffect(() => () => target.dispose(), [target]);
  const seen = useRef('');
  const tick = useRef(0);
  useFrame(() => {
    if (tick.current++ % 30 !== 1) return;
    let count = 0;
    const textures = new Set<THREE.Texture>();
    scene.traverse((o) => {
      count++;
      const mat = (o as THREE.Mesh).material;
      for (const m of Array.isArray(mat) ? mat : mat ? [mat] : []) {
        for (const v of Object.values(m)) if (v instanceof THREE.Texture) textures.add(v);
      }
    });
    // 只數「已經載好」的貼圖：畫布貼圖（LED 看板等）每幀都會加 version，直接加總會讓這裡每半秒重做一次
    let ver = 0;
    for (const t of textures) if (t.version > 0) ver++;
    const sig = `${count}/${textures.size}/${ver}`;
    if (sig === seen.current) return;
    seen.current = sig;
    const hidden: THREE.Object3D[] = [];
    scene.traverse((o) => {
      // 燈光不能打開：燈的數量會寫進著色器，數量不同就等於編了一份用不到的
      if (!o.visible && !(o as THREE.Light).isLight) {
        hidden.push(o);
        o.visible = true;
      }
    });
    // 精彩重播會切到平常看不到的角度：畫面外的物件也先畫一次（上傳頂點資料），第一次重播時才不會當場上傳
    const culled: THREE.Object3D[] = [];
    scene.traverse((o) => {
      if (o.frustumCulled) {
        culled.push(o);
        o.frustumCulled = false;
      }
    });
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(target);
    gl.compile(scene, camera);
    gl.render(scene, camera);
    gl.setRenderTarget(prev);
    for (const o of culled) o.frustumCulled = true;
    for (const t of textures) gl.initTexture(t);
    for (const o of hidden) o.visible = false;
  });
  return null;
};

/**
 * 後處理：光暈讓火焰與燈光發亮；必殺演出時加一點色差。白天場地門檻拉高，免得白牆、天空整片發光。
 * 效果結構要從開場就固定：EffectComposer 每次重繪都會拆掉重建 pass，而效果元件的 props 一變（JSON 比對）就換新實例、
 * 被排到最後，pass 分組跟著變，著色器當場重編。所以 memo 擋掉父層重繪，色差 offset 只走 ref、不進 props。
 */
const PostFx = memo(({ aberration, lowSpec, day }: { aberration: Num; lowSpec: boolean; day: boolean }) => {
  const chroma = useRef<ChromaticAberrationEffect>(null);
  useFrame(() => {
    const a = aberration.current * 0.003;
    chroma.current?.offset.set(a, a * 0.6);
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
    <EffectComposer multisampling={2}>
      <Bloom mipmapBlur luminanceThreshold={day ? 1.1 : 0.72} luminanceSmoothing={0.2} intensity={day ? 0.7 : 1.15} radius={0.75} />
      {/* 套件把 ref 型別寫成類別本身，實際拿到的是實例 */}
      <ChromaticAberration ref={chroma as unknown as Ref<typeof ChromaticAberrationEffect>} blendFunction={BlendFunction.NORMAL} radialModulation={false} modulationOffset={0} />
      <Vignette eskil={false} offset={0.25} darkness={day ? 0.35 : 0.55} />
    </EffectComposer>
  );
});

/** 精彩球錄影：後處理畫完這一幀之後（優先序 2），把畫面連同比分、連擊疊字合成到錄影用的畫布 */
const ClipCapture = ({ clip, engine, characters }: { clip: ClipRecorder; engine: GameEngine; characters: [CharacterDef, CharacterDef] }) => {
  const gl = useThree((s) => s.gl);
  const names = useMemo((): [string, string] => [characters[0].name, characters[1].name], [characters]);
  useFrame(() => clip.frame(gl.domElement, engine, names), 2);
  return null;
};

export const GameScene = (props: SceneProps) => {
  const { engine, lowSpec, venue } = props;
  const day = venue !== 'arena';
  const storm = engine.level?.id === 'typhoon';
  const bus = useMemo(createFxBus, []);
  const excite = useRef(0);
  const flash = useRef(0);
  const aberration = useRef(0);
  const { characters } = props;
  const looks = useMemo(() => characters.map(lookFromCharacter), [characters]);
  return (
    <>
      {venue === 'beach' ? (
        <>
          <color attach="background" args={[storm ? '#2b3744' : '#7d8f9e']} />
          <fog attach="fog" args={[storm ? '#3a4652' : '#8a9bab', storm ? 18 : 30, storm ? 85 : 120]} />
          <BeachVenue engine={engine} />
        </>
      ) : day ? (
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
      <LevelProps engine={engine} lowSpec={lowSpec} />
      <Guide engine={engine} />
      <ReviewFx engine={engine} />
      <BallModel engine={engine} />
      <Effects engine={engine} bus={bus} lowSpec={lowSpec} />
      <Prewarm />
      <Rig {...props} bus={bus} excite={excite} flash={flash} aberration={aberration} />
      <PostFx aberration={aberration} lowSpec={lowSpec} day={day} />
      {props.clip && <ClipCapture clip={props.clip} engine={engine} characters={characters} />}
    </>
  );
};
