import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { type GameEngine, type GameEvent, QUAKE, THUNDER_R } from '../engine/game';
import { SPECIALS, type SpecialId } from '../engine/paddles';
import { SKILLS } from '../engine/skills';
import { teamSide } from '../engine/rules';
import { paddleTips } from './characterData';
import type { FxBus } from './fxBus';
import { decalTexture, glowTexture } from './textures';


// ───────────────────────────── 粒子 ─────────────────────────────

const MAX_P = 2400;

interface EmitOpts {
  pos: THREE.Vector3;
  count: number;
  speed: number;
  spread?: number;
  /** 基本方向（不給就四散） */
  dir?: THREE.Vector3;
  up?: number;
  gravity?: number;
  drag?: number;
  life: number;
  size: number;
  grow?: number;
  color: THREE.Color;
  /** 生命結束時的顏色 */
  color2?: THREE.Color;
  jitter?: number;
}

/**
 * CPU 更新、GPU 繪製的粒子池。用 additive blending 畫在柔光圓點上，
 * 搭配 Bloom 後處理就有發光的感覺。
 */
class ParticlePool {
  geo = new THREE.BufferGeometry();
  pos = new Float32Array(MAX_P * 3);
  col = new Float32Array(MAX_P * 3);
  size = new Float32Array(MAX_P);
  alpha = new Float32Array(MAX_P);
  vel = new Float32Array(MAX_P * 3);
  life = new Float32Array(MAX_P);
  maxLife = new Float32Array(MAX_P);
  baseSize = new Float32Array(MAX_P);
  grow = new Float32Array(MAX_P);
  grav = new Float32Array(MAX_P);
  drag = new Float32Array(MAX_P);
  jitter = new Float32Array(MAX_P);
  c1 = new Float32Array(MAX_P * 3);
  c2 = new Float32Array(MAX_P * 3);
  next = 0;
  /** 還活著的粒子數：0 的時候整段更新與上傳都跳過 */
  alive = 0;
  mat: THREE.ShaderMaterial;

  constructor() {
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.geo.setAttribute('size', new THREE.BufferAttribute(this.size, 1));
    this.geo.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1));
    this.geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: glowTexture() }, scale: { value: 600 } },
      vertexShader: `
        attribute float size; attribute float alpha; attribute vec3 color;
        varying vec3 vColor; varying float vAlpha; uniform float scale;
        void main() {
          vColor = color; vAlpha = alpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * scale / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D map; varying vec3 vColor; varying float vAlpha;
        void main() {
          vec4 t = texture2D(map, gl_PointCoord);
          gl_FragColor = vec4(vColor * t.rgb * vAlpha * 2.2, t.a * vAlpha);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  emit(o: EmitOpts) {
    this.alive += o.count;
    for (let n = 0; n < o.count; n++) {
      const i = this.next;
      this.next = (this.next + 1) % MAX_P;
      const sp = o.speed * (0.4 + Math.random() * 0.8);
      let vx: number;
      let vy: number;
      let vz: number;
      if (o.dir) {
        const s = o.spread ?? 0.5;
        vx = o.dir.x + (Math.random() - 0.5) * s;
        vy = o.dir.y + (Math.random() - 0.5) * s;
        vz = o.dir.z + (Math.random() - 0.5) * s;
      } else {
        const u = Math.random() * 2 - 1;
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(1 - u * u);
        vx = r * Math.cos(a);
        vy = u;
        vz = r * Math.sin(a);
      }
      const m = Math.hypot(vx, vy, vz) || 1;
      this.vel[i * 3] = (vx / m) * sp;
      this.vel[i * 3 + 1] = (vy / m) * sp + (o.up ?? 0);
      this.vel[i * 3 + 2] = (vz / m) * sp;
      this.pos[i * 3] = o.pos.x + (Math.random() - 0.5) * 0.04;
      this.pos[i * 3 + 1] = o.pos.y + (Math.random() - 0.5) * 0.04;
      this.pos[i * 3 + 2] = o.pos.z + (Math.random() - 0.5) * 0.04;
      this.maxLife[i] = this.life[i] = o.life * (0.6 + Math.random() * 0.6);
      this.baseSize[i] = o.size * (0.6 + Math.random() * 0.8);
      this.grow[i] = o.grow ?? 0;
      this.grav[i] = o.gravity ?? 0;
      this.drag[i] = o.drag ?? 1.5;
      this.jitter[i] = o.jitter ?? 0;
      const c2 = o.color2 ?? o.color;
      this.c1[i * 3] = o.color.r;
      this.c1[i * 3 + 1] = o.color.g;
      this.c1[i * 3 + 2] = o.color.b;
      this.c2[i * 3] = c2.r;
      this.c2[i * 3 + 1] = c2.g;
      this.c2[i * 3 + 2] = c2.b;
    }
  }

  update(dt: number) {
    if (this.alive <= 0) return;
    let alive = 0;
    for (let i = 0; i < MAX_P; i++) {
      if (this.life[i] <= 0) {
        this.alpha[i] = 0;
        continue;
      }
      alive++;
      this.life[i] -= dt;
      const k = 1 - Math.max(0, this.life[i]) / this.maxLife[i];
      const d = Math.exp(-this.drag[i] * dt);
      this.vel[i * 3] *= d;
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * d + this.grav[i] * dt;
      this.vel[i * 3 + 2] *= d;
      const j = this.jitter[i];
      this.pos[i * 3] += this.vel[i * 3] * dt + (j ? (Math.random() - 0.5) * j : 0);
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt + (j ? (Math.random() - 0.5) * j : 0);
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt + (j ? (Math.random() - 0.5) * j : 0);
      for (let c = 0; c < 3; c++) this.col[i * 3 + c] = this.c1[i * 3 + c] + (this.c2[i * 3 + c] - this.c1[i * 3 + c]) * k;
      this.size[i] = this.baseSize[i] * (1 + this.grow[i] * k);
      this.alpha[i] = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
    }
    this.alive = alive;
    for (const n of ['position', 'color', 'size', 'alpha']) (this.geo.attributes[n] as THREE.BufferAttribute).needsUpdate = true;
  }
}

// ───────────────────────────── 光帶軌跡 ─────────────────────────────

/** 面向鏡頭的光帶：給球與揮拍用 */
class Ribbon {
  n: number;
  pts: THREE.Vector3[] = [];
  geo = new THREE.BufferGeometry();
  posArr: Float32Array;
  alphaArr: Float32Array;
  mat: THREE.ShaderMaterial;
  mesh: THREE.Mesh;

  constructor(n: number, color: string) {
    this.n = n;
    this.posArr = new Float32Array(n * 2 * 3);
    this.alphaArr = new Float32Array(n * 2);
    const idx: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    this.geo.setIndex(idx);
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.posArr, 3));
    this.geo.setAttribute('alpha', new THREE.BufferAttribute(this.alphaArr, 1));
    this.geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(color) }, strength: { value: 1 } },
      vertexShader: `attribute float alpha; varying float vA; void main(){ vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 color; uniform float strength; varying float vA; void main(){ gl_FragColor = vec4(color * strength * 1.6, vA * strength); }`,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(this.geo, this.mat);
    this.mesh.frustumCulled = false;
  }

  push(p: THREE.Vector3) {
    this.pts.unshift(p.clone());
    if (this.pts.length > this.n) this.pts.pop();
  }

  clear() {
    this.pts = [];
  }

  build(cam: THREE.Vector3, width: number) {
    const pts = this.pts;
    const tmpDir = new THREE.Vector3();
    const toCam = new THREE.Vector3();
    const side = new THREE.Vector3();
    for (let i = 0; i < this.n; i++) {
      const p = pts[Math.min(i, pts.length - 1)];
      if (!p || pts.length < 2) {
        this.alphaArr[i * 2] = this.alphaArr[i * 2 + 1] = 0;
        continue;
      }
      const q = pts[Math.min(i + 1, pts.length - 1)];
      const r = pts[Math.min(Math.max(i - 1, 0), pts.length - 1)];
      tmpDir.subVectors(r, q);
      if (tmpDir.lengthSq() < 1e-8) tmpDir.set(0, 0, 1);
      toCam.subVectors(cam, p);
      side.crossVectors(tmpDir, toCam).normalize();
      const t = i / (this.n - 1);
      const w = width * (1 - t);
      this.posArr.set([p.x + side.x * w, p.y + side.y * w, p.z + side.z * w], i * 6);
      this.posArr.set([p.x - side.x * w, p.y - side.y * w, p.z - side.z * w], i * 6 + 3);
      const a = i < pts.length ? (1 - t) * (1 - t) : 0;
      this.alphaArr[i * 2] = this.alphaArr[i * 2 + 1] = a;
    }
    (this.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.attributes.alpha as THREE.BufferAttribute).needsUpdate = true;
  }
}

const shotColor = (button: string, ballY: number) =>
  button === 'soft' ? '#60a5fa' : button === 'lob' ? '#facc15' : button === 'drive' ? (ballY > 1.4 ? '#c084fc' : '#f87171') : '#ffffff';

// ───────────────────────────── 蓄勢氣場 ─────────────────────────────

const auraMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, color: { value: new THREE.Color('#ff6a00') }, strength: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform float time; uniform vec3 color; uniform float strength; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      void main(){
        vec2 p = vec2(vUv.x * 8.0, vUv.y * 3.0 - time * 2.2);
        float n = noise(p) * 0.6 + noise(p * 2.3) * 0.4;
        float fade = (1.0 - vUv.y) * smoothstep(0.0, 0.15, vUv.y);
        float a = smoothstep(0.35, 0.9, n + (1.0 - vUv.y) * 0.45) * fade * strength;
        gl_FragColor = vec4(color * 2.0, a);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

// ───────────────────────────── 主元件 ─────────────────────────────

interface Decal {
  mesh: THREE.Mesh;
  born: number;
  life: number;
}

const COLOR = (hex: string) => new THREE.Color(hex);
const FIRE_A = COLOR('#fff1a8');
const FIRE_B = COLOR('#ff3d00');
const SPARK = COLOR('#fff7cc');
const AWAKEN_COLOR = '#f59e0b';
const AWAKEN_A = COLOR('#fff3b0');
const AWAKEN_B = COLOR('#ff5a1f');
/** 撲倒揚起的球場灰塵 */
const DUST_A = COLOR('#9c8f7a');
/** 奶茶潑出來（加法混色，用偏亮的奶茶色才看得到） */
const TEA_A = COLOR('#fff1dc');
const TEA_B = COLOR('#d6a36e');
const DUST_B = COLOR('#4a4136');
const SPECIAL_COLORS: Record<SpecialId, [THREE.Color, THREE.Color]> = {
  inferno: [FIRE_A, FIRE_B],
  thunder: [COLOR('#ffffff'), COLOR('#3d6bff')],
  phantom: [COLOR('#f5d9ff'), COLOR('#8a2be2')],
  frost: [COLOR('#ffffff'), COLOR('#39c6ff')],
  cyclone: [COLOR('#f0fdfa'), COLOR('#0d9488')],
  quake: [COLOR('#fff7d6'), COLOR('#c2410c')],
};

/** 每種地形效果最多同時幾塊（網格事先建好，放招時不編譯著色器） */
const HAZARD_SLOTS = 4;

export const Effects = ({ engine, bus, lowSpec }: { engine: GameEngine; bus: FxBus; lowSpec: boolean }) => {
  const { camera } = useThree();
  const pool = useMemo(() => new ParticlePool(), []);
  const ballTrail = useMemo(() => new Ribbon(28, '#ffffff'), []);
  const swingTrails = useMemo(() => engine.athletes.map(() => new Ribbon(14, '#ffffff')), [engine]);
  const cuts = useRef(engine.replayCuts);
  const auraMats = useMemo(() => engine.athletes.map(() => auraMaterial()), [engine]);
  const auras = useRef<(THREE.Mesh | null)[]>([]);
  const bolts = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 2 * 60 * 3), 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
    return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#dfe8ff', toneMapped: false, transparent: true }));
  }, []);
  const rings = useMemo(
    () =>
      Array.from({ length: 6 }, () => {
        const m = new THREE.Mesh(
          new THREE.RingGeometry(0.82, 1, 48),
          new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }),
        );
        m.visible = false;
        m.userData = { born: -10, life: 0.5, max: 2 };
        return m;
      }),
    [],
  );
  const decals = useRef<Decal[]>([]);
  // 地面痕跡（焦痕、冰霜、裂痕）事先建好放著重複用：放招時才建網格與材質會當場編譯著色器、上傳貼圖而卡頓
  const decalPool = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1);
    return (['scorch', 'frost', 'crack'] as const).flatMap((kind) =>
      Array.from({ length: 4 }, () => {
        const m = new THREE.Mesh(
          geo,
          new THREE.MeshBasicMaterial({ map: decalTexture(kind), transparent: true, depthWrite: false, toneMapped: kind !== 'frost' }),
        );
        m.visible = false;
        m.userData.kind = kind;
        return m;
      }),
    );
  }, []);
  // 結冰、水灘：跟著引擎的 hazards 畫，壽命由引擎決定
  const hazardPool = useMemo(() => {
    const geo = new THREE.CircleGeometry(1, 40);
    return (['ice', 'water'] as const).flatMap((kind) =>
      Array.from({ length: HAZARD_SLOTS }, () => {
        const m = new THREE.Mesh(
          geo,
          new THREE.MeshBasicMaterial({ map: decalTexture(kind === 'ice' ? 'frost' : 'water'), transparent: true, depthWrite: false, toneMapped: false }),
        );
        m.rotation.set(-Math.PI / 2, 0, 0);
        m.visible = false;
        m.userData.kind = kind;
        return m;
      }),
    );
  }, []);
  // 必殺球的落點預警：天雷的落雷圈、震地的震波範圍、旋風的竄出方向
  const warn = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), mat);
    const fill = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), mat.clone());
    const tri = new THREE.Shape();
    tri.moveTo(0, 0.55);
    tri.lineTo(-0.32, 0);
    tri.lineTo(-0.12, 0);
    tri.lineTo(-0.12, -0.45);
    tri.lineTo(0.12, -0.45);
    tri.lineTo(0.12, 0);
    tri.lineTo(0.32, 0);
    tri.closePath();
    const arrow = new THREE.Mesh(new THREE.ShapeGeometry(tri), mat.clone());
    const g = new THREE.Group();
    ring.rotation.x = fill.rotation.x = -Math.PI / 2;
    g.add(ring, fill);
    g.visible = false;
    arrow.visible = false;
    return { g, ring, fill, arrow };
  }, []);
  const flashLight = useRef<THREE.PointLight>(null);
  const flashSprite = useRef<THREE.Sprite>(null);
  const clock = useRef(0);
  const boltUntil = useRef(0);
  const boltTarget = useRef(new THREE.Vector3());
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const dirTmp = useMemo(() => new THREE.Vector3(), []);

  const ring = (p: THREE.Vector3, color: string, max: number, flat: boolean, life = 0.5) => {
    const m = rings.find((r) => clock.current - r.userData.born > r.userData.life) ?? rings[0];
    m.position.copy(p);
    if (flat) m.rotation.set(-Math.PI / 2, 0, 0);
    else m.lookAt(camera.position);
    (m.material as THREE.MeshBasicMaterial).color.set(color);
    m.userData = { born: clock.current, life, max };
    m.visible = true;
  };

  const decal = (p: THREE.Vector3, kind: 'scorch' | 'frost' | 'crack', size: number) => {
    // 同種類裡挑一個閒置的；都在用就重用最舊的
    const pool = decalPool.filter((d) => d.userData.kind === kind);
    const m = pool.find((d) => !d.visible) ?? decals.current.find((d) => d.mesh.userData.kind === kind)?.mesh ?? pool[0];
    decals.current = decals.current.filter((d) => d.mesh !== m);
    m.scale.set(size, size, 1);
    m.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI * 2);
    m.position.set(p.x, 0.008 + decals.current.length * 0.0005, p.z);
    (m.material as THREE.MeshBasicMaterial).opacity = 1;
    m.visible = true;
    decals.current.push({ mesh: m, born: clock.current, life: 3.5 });
  };

  const flash = (p: THREE.Vector3, color: string, intensity: number) => {
    if (flashLight.current) {
      flashLight.current.position.copy(p).setY(p.y + 0.6);
      flashLight.current.color.set(color);
      flashLight.current.intensity = intensity;
    }
    if (flashSprite.current) {
      flashSprite.current.position.copy(p);
      (flashSprite.current.material as THREE.SpriteMaterial).color.set(color);
      flashSprite.current.scale.setScalar(Math.min(3, 0.6 + intensity * 0.2));
      (flashSprite.current.material as THREE.SpriteMaterial).opacity = 1;
    }
  };

  const handle = (e: GameEvent) => {
    if (e.type === 'hit') {
      const p = tmp.set(e.pos.x, e.pos.y, e.pos.z).clone();
      const power = Math.min(1, e.speed / 25);
      const mine = e.team === 0;
      pool.emit({ pos: p, count: 10 + Math.round(power * 18), speed: 3 + power * 5, life: 0.3, size: 0.07, gravity: -6, color: SPARK, color2: COLOR('#ffb347') });
      // 沿出球方向噴出一束高速火花：球被「轟出去」的感覺
      const bv = engine.ball.vel;
      const sp = Math.hypot(bv.x, bv.y, bv.z) || 1;
      dirTmp.set(bv.x / sp, bv.y / sp, bv.z / sp);
      pool.emit({
        pos: p,
        count: (mine ? 14 : 6) + Math.round(power * 16),
        speed: 6 + power * 10,
        dir: dirTmp,
        spread: 0.35,
        life: 0.22,
        size: 0.05,
        drag: 4,
        color: COLOR('#ffffff'),
        color2: COLOR('#ffd27a'),
      });
      if (mine && !e.special) flash(p, '#fff4cf', 1.2 + power * 2);
      if (e.special) {
        const [c1, c2] = SPECIAL_COLORS[e.special];
        pool.emit({ pos: p, count: 70, speed: 7, life: 0.6, size: 0.18, grow: 1.5, color: c1, color2: c2, drag: 3 });
        ring(p, SPECIALS[e.special].color, 4, false, 0.6);
        flash(p, SPECIALS[e.special].glow, 6);
        ballTrail.clear();
      } else if (e.dive) {
        // 飛身救球：青色光環
        ring(p, '#67e8f9', 1.8, false, 0.45);
        flash(p, '#cffafe', 3);
      } else if (e.quality !== null && e.quality >= 0.9 && e.team === 0) {
        // 完美擊球：金色星爆＋光環
        ring(p, '#fde047', 1.6, false, 0.4);
        pool.emit({ pos: p, count: 36, speed: 5, life: 0.45, size: 0.1, color: COLOR('#fff7b0'), color2: COLOR('#f59e0b'), drag: 3.5 });
        flash(p, '#fff6c2', 4);
      } else if (power > 0.75) {
        ring(p, '#ffffff', 1, false, 0.3);
      }
    } else if (e.type === 'bounce') {
      const p = tmp.set(e.pos.x, 0.02, e.pos.z).clone();
      if (e.special === 'inferno') {
        decal(p, 'scorch', 1.2);
        pool.emit({ pos: p, count: 50, speed: 3, up: 2.5, life: 0.7, size: 0.25, grow: 2, color: FIRE_A, color2: FIRE_B, gravity: 1 });
        ring(p, '#ff7a1a', 2.2, true, 0.5);
      } else if (e.special === 'frost') {
        decal(p, 'frost', 1.8);
        pool.emit({ pos: p, count: 60, speed: 2.4, up: 1.6, life: 1.1, size: 0.12, color: COLOR('#ffffff'), color2: COLOR('#4fd8ff'), gravity: -3 });
        ring(p, '#a5f3ff', 2.6, true, 0.7);
        flash(p, '#bdf4ff', 4);
      } else if (e.special === 'thunder') {
        decal(p, 'crack', 2.6);
        boltUntil.current = clock.current + 0.35;
        boltTarget.current.copy(p);
        pool.emit({ pos: p, count: 90, speed: 7, up: 2, life: 0.6, size: 0.12, color: COLOR('#ffffff'), color2: COLOR('#5b8cff'), gravity: -8, jitter: 0.02 });
        ring(p, '#9db8ff', 4.5, true, 0.6);
        flash(p, '#c9d8ff', 12);
      } else if (e.special === 'cyclone') {
        // 旋風把球捲走：沿竄出方向噴一道風，地上一圈旋渦
        const bv = engine.ball.vel;
        const hs = Math.hypot(bv.x, bv.z) || 1;
        dirTmp.set(bv.x / hs, 0.25, bv.z / hs);
        pool.emit({ pos: p, count: 70, speed: 9, dir: dirTmp, spread: 0.6, life: 0.55, size: 0.12, drag: 3, color: COLOR('#f0fdfa'), color2: COLOR('#14b8a6') });
        for (let i = 0; i < 16; i++) {
          const ang = (i / 16) * Math.PI * 2;
          dirTmp.set(-Math.sin(ang), 0.6, Math.cos(ang));
          pool.emit({ pos: new THREE.Vector3(p.x + Math.cos(ang) * 0.5, 0.1, p.z + Math.sin(ang) * 0.5), count: 3, speed: 3, dir: dirTmp, spread: 0.2, life: 0.6, size: 0.09, drag: 2, color: COLOR('#ccfbf1'), color2: COLOR('#0f766e') });
        }
        ring(p, '#5eead4', 1.8, true, 0.5);
      } else if (e.special === 'quake') {
        // 震地：兩圈震波（外圈＝站不穩的範圍）、裂痕、飛石與塵土
        decal(p, 'crack', 2.2);
        ring(p, '#fbbf24', QUAKE.r, true, 0.55);
        ring(p, '#fff7d6', 1.4, true, 0.35);
        pool.emit({ pos: p, count: 80, speed: 4.5, up: 1.4, life: 0.9, size: 0.22, grow: 1.8, color: COLOR('#e7d3b0'), color2: COLOR('#78350f'), gravity: 2, drag: 2.5 });
        pool.emit({ pos: p, count: 40, speed: 6, up: 4, life: 0.8, size: 0.07, color: COLOR('#fde68a'), color2: COLOR('#57534e'), gravity: -12 });
        flash(p, '#fcd34d', 9);
      } else if (e.special === 'phantom') {
        ring(p, '#c084fc', 1.6, true, 0.5);
        pool.emit({ pos: p, count: 30, speed: 1.8, up: 1.2, life: 0.8, size: 0.1, color: COLOR('#f5d9ff'), color2: COLOR('#8a2be2') });
      } else if (e.speed > 4) {
        pool.emit({ pos: p, count: 6, speed: 1.2, up: 0.6, life: 0.35, size: 0.06, color: COLOR('#cbd5e1'), gravity: -4 });
      }
    } else if (e.type === 'skill') {
      const sk = SKILLS[e.id];
      const a = engine.athletes[e.team];
      const b = engine.ball.pos;
      const p = new THREE.Vector3(b.x, b.y, b.z);
      const feet = new THREE.Vector3(a.pos.x, 0.03, a.pos.z);
      ring(p, sk.color, 3, false, 0.5);
      flash(p, sk.glow, 6);
      pool.emit({ pos: p, count: 60, speed: 6, life: 0.5, size: 0.14, color: COLOR(sk.glow), color2: COLOR(sk.color), drag: 3 });
      if (e.id === 'squatSmash') {
        // 秒蹲：腳下炸開一圈塵土
        ring(feet, sk.color, 3.2, true, 0.5);
        pool.emit({ pos: feet, count: 70, speed: 4, up: 1.2, life: 0.6, size: 0.18, grow: 1.6, color: COLOR('#d6c3a5'), color2: COLOR('#7c6a55'), gravity: 2, drag: 3 });
      } else if (e.id === 'spinSmash') {
        // 幹他：空中轉一圈的紅色旋風
        const top = new THREE.Vector3(a.pos.x, 1.4, a.pos.z);
        ring(top, sk.color, 2.4, true, 0.45);
        ring(top, '#ffffff', 1.6, true, 0.3);
        pool.emit({ pos: top, count: 80, speed: 5, up: 0.4, life: 0.5, size: 0.12, color: COLOR('#fecaca'), color2: COLOR('#dc2626'), drag: 2.5 });
        // 從腳下捲上去的龍捲風：沿螺旋線放切線方向的粒子
        for (let i = 0; i < 30; i++) {
          const t = i / 30;
          const ang = t * Math.PI * 6;
          const rad = 0.25 + t * 0.55;
          dirTmp.set(-Math.sin(ang), 0.5, Math.cos(ang));
          pool.emit({
            pos: new THREE.Vector3(a.pos.x + Math.cos(ang) * rad, 0.05 + t * 2.2, a.pos.z + Math.sin(ang) * rad),
            count: 2,
            speed: 3,
            dir: dirTmp,
            spread: 0.15,
            life: 0.55,
            size: 0.1,
            drag: 2,
            color: COLOR('#fff1f2'),
            color2: COLOR('#b91c1c'),
          });
        }
      } else if (e.id === 'splash') {
        // 爆噴：一道水柱噴向對手，落地成一灘水
        const o = engine.opponentOf(a);
        const to = new THREE.Vector3(o.pos.x - p.x, 0, o.pos.z - p.z);
        const d = to.length() || 1;
        dirTmp.set(to.x / d, 0.35, to.z / d).normalize();
        pool.emit({ pos: p, count: 160, speed: 16, dir: dirTmp, spread: 0.25, life: 1.1, size: 0.12, color: COLOR('#e0f2fe'), color2: COLOR('#0ea5e9'), gravity: -9 });
        const puddle = new THREE.Vector3(o.pos.x, 0.03, o.pos.z);
        decal(puddle, 'frost', 2.4);
        ring(puddle, '#7dd3fc', 2.6, true, 0.8);
        pool.emit({ pos: puddle, count: 70, speed: 3, up: 2.6, life: 0.9, size: 0.1, color: COLOR('#f0f9ff'), color2: COLOR('#38bdf8'), gravity: -7 });
      } else if (e.id === 'dualCurve') {
        // 左右逢源：兩側各一圈綠色光環
        ring(new THREE.Vector3(p.x + 0.6, p.y, p.z), sk.color, 1.6, false, 0.45);
        ring(new THREE.Vector3(p.x - 0.6, p.y, p.z), sk.color, 1.6, false, 0.45);
      } else if (e.id === 'pickle') {
        // 醃漬大法：一股綠色酸汁潑向對手，對手頭上冒酸泡泡
        const o = engine.opponentOf(a);
        const to = new THREE.Vector3(o.pos.x - p.x, 0, o.pos.z - p.z);
        const d = to.length() || 1;
        dirTmp.set(to.x / d, 0.3, to.z / d).normalize();
        pool.emit({ pos: p, count: 110, speed: 13, dir: dirTmp, spread: 0.3, life: 1, size: 0.13, color: COLOR('#dcfce7'), color2: COLOR('#16a34a'), gravity: -6 });
        const head = new THREE.Vector3(o.pos.x, 1.9, o.pos.z);
        pool.emit({ pos: head, count: 40, speed: 1.2, up: 1.2, life: 1.2, size: 0.16, color: COLOR('#bbf7d0'), color2: COLOR('#15803d'), drag: 1.5 });
        ring(new THREE.Vector3(o.pos.x, 0.03, o.pos.z), sk.color, 1.6, true, 0.6);
      } else if (e.id === 'feast') {
        // 大胃王：對手身上的能量化成光點，一路被吸回包子武士
        const o = engine.opponentOf(a);
        const from = new THREE.Vector3(o.pos.x, 1.2, o.pos.z);
        const to = new THREE.Vector3(a.pos.x - o.pos.x, 0, a.pos.z - o.pos.z);
        const d = to.length() || 1;
        dirTmp.set(to.x / d, 0.15, to.z / d).normalize();
        pool.emit({ pos: from, count: 90, speed: Math.min(16, d * 1.6), dir: dirTmp, spread: 0.25, life: 0.9, size: 0.12, drag: 0.4, color: COLOR('#fef3c7'), color2: COLOR('#f59e0b') });
        ring(from, '#fbbf24', 1.8, false, 0.5);
        ring(new THREE.Vector3(a.pos.x, 1.1, a.pos.z), sk.color, 2.2, false, 0.7);
      } else if (e.id === 'roar') {
        // 虎嘯：從老虎往前推出好幾圈震波，對手那邊塵土飛揚
        for (let i = 0; i < 3; i++) ring(new THREE.Vector3(a.pos.x, 1.4, a.pos.z), i === 1 ? '#ffffff' : sk.color, 2.5 + i * 1.6, false, 0.45 + i * 0.12);
        const o = engine.opponentOf(a);
        pool.emit({ pos: new THREE.Vector3(o.pos.x, 0.1, o.pos.z), count: 50, speed: 3.5, up: 1, life: 0.7, size: 0.18, grow: 1.4, color: COLOR('#fed7aa'), color2: COLOR('#9a3412'), gravity: 2, drag: 2.5 });
      } else if (e.id === 'wave') {
        // 大浪：對手半場中央掀起一道水牆，往兩側邊線捲過去
        const o = engine.opponentOf(a);
        const sz = o.pos.z;
        for (let i = 0; i < 14; i++) {
          const z = sz + (i / 13 - 0.5) * 4.5;
          for (const side of [-1, 1]) {
            dirTmp.set(side, 0.55, 0).normalize();
            pool.emit({ pos: new THREE.Vector3(0, 0.15, z), count: 6, speed: 7, up: 2.5, dir: dirTmp, spread: 0.4, life: 1, size: 0.16, color: COLOR('#ecfeff'), color2: COLOR('#0891b2'), gravity: -8 });
          }
        }
        ring(new THREE.Vector3(o.pos.x, 0.03, o.pos.z), '#67e8f9', 3, true, 0.8);
      } else if (e.id === 'overclock') {
        // 超頻：全身迸出紫色電光
        const mid = new THREE.Vector3(a.pos.x, 1.1, a.pos.z);
        pool.emit({ pos: mid, count: 120, speed: 6, life: 0.5, size: 0.08, color: COLOR('#ffffff'), color2: COLOR('#9333ea'), jitter: 0.05 });
        ring(new THREE.Vector3(a.pos.x, 0.03, a.pos.z), sk.color, 2.4, true, 0.5);
      } else if (e.id === 'foxfire') {
        // 狐火：藍白色的鬼火繞著球打轉
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          pool.emit({ pos: new THREE.Vector3(p.x + Math.cos(ang) * 0.4, p.y + Math.sin(ang) * 0.25, p.z), count: 6, speed: 0.6, up: 0.8, life: 0.9, size: 0.2, grow: 0.6, color: COLOR('#e0f2fe'), color2: COLOR('#2563eb') });
        }
      }
      ballTrail.clear();
    } else if (e.type === 'counter') {
      const b = engine.ball.pos;
      const p = new THREE.Vector3(b.x, b.y, b.z);
      ring(p, '#ffffff', 5, false, 0.6);
      pool.emit({ pos: p, count: 90, speed: 9, life: 0.6, size: 0.14, color: COLOR('#ffffff'), color2: COLOR('#fde047'), drag: 2.5 });
      flash(p, '#ffffff', 8);
    } else if (e.type === 'blown') {
      const a = engine.athletes[e.team];
      const p = new THREE.Vector3(a.pos.x, 1.1, a.pos.z);
      const [c1, c2] = SPECIAL_COLORS[e.id];
      pool.emit({ pos: p, count: 60, speed: 5, life: 0.7, size: 0.16, color: c1, color2: c2 });
    } else if (e.type === 'dive') {
      // 蹬地起跳：腳下一小撮土
      const p = tmp.set(e.pos.x, 0.03, e.pos.z).clone();
      pool.emit({ pos: p, count: 14, speed: 1.6, up: 0.5, life: 0.4, size: 0.12, grow: 1.4, color: DUST_A, color2: DUST_B, gravity: 1.5, drag: 3 });
    } else if (e.type === 'diveLand') {
      // 撲倒落地：一大片揚塵往撲的方向噴，地上一圈衝擊波
      const a = engine.athletes[e.team];
      const p = tmp.set(e.pos.x, 0.04, e.pos.z).clone();
      const dir = a.dive ? dirTmp.set(a.dive.dir.x, 0.25, a.dive.dir.z).normalize() : undefined;
      pool.emit({ pos: p, count: 70, speed: 3.2, up: 0.9, life: 0.85, size: 0.22, grow: 2, color: DUST_A, color2: DUST_B, gravity: 1.2, drag: 3 });
      if (dir) pool.emit({ pos: p, count: 40, speed: 4.5, dir, spread: 0.6, life: 0.7, size: 0.16, grow: 1.6, color: DUST_A, color2: DUST_B, gravity: 1, drag: 3.5 });
      ring(p, '#b8ab96', 2.4, true, 0.45);
    } else if (e.type === 'net') {
      pool.emit({ pos: tmp.set(e.pos.x, e.pos.y, e.pos.z).clone(), count: 8, speed: 1.5, life: 0.3, size: 0.06, color: COLOR('#e2e8f0'), gravity: -5 });
    } else if (e.type === 'level' && e.pos) {
      // 踢館之旅：杯子潑出奶茶、撿到珍珠閃一下、扣 Boss 血噴火花
      const p = tmp.set(e.pos.x, e.pos.y, e.pos.z).clone();
      if (e.fx === 'cup') {
        pool.emit({ pos: p, count: 36, speed: 2.6, up: 2.2, life: 0.7, size: 0.09, color: TEA_A, color2: TEA_B, gravity: -9 });
        ring(tmp.set(p.x, 0.03, p.z).clone(), '#fde68a', 1.1, true, 0.4);
      } else if (e.fx === 'row') {
        ring(p, '#fbbf24', 5, true, 0.7);
      } else if (e.fx === 'dunk') {
        pool.emit({ pos: p, count: 90, speed: 3.5, up: 4.5, life: 1, size: 0.12, color: TEA_A, color2: TEA_B, gravity: -9 });
        ring(p, '#fde047', 3, true, 0.7);
        flash(p, '#fff3c4', 6);
      } else if (e.fx === 'pearl') {
        pool.emit({ pos: p, count: 10, speed: 1.6, up: 1.2, life: 0.45, size: 0.07, color: COLOR('#fff7cc'), color2: COLOR('#f59e0b'), gravity: -4 });
      } else if (e.fx === 'gold') {
        pool.emit({ pos: p, count: 46, speed: 3.5, up: 1.6, life: 0.7, size: 0.12, color: COLOR('#fff7b0'), color2: COLOR('#f59e0b'), drag: 2.5 });
        ring(p, '#fde047', 2, true, 0.5);
        flash(p, '#fff6c2', 4);
      } else if (e.fx === 'drop') {
        const q = tmp.set(p.x, 0.9, p.z).clone();
        pool.emit({ pos: q, count: 40, speed: 3, life: 0.5, size: 0.1, color: COLOR('#fecaca'), color2: COLOR('#e11d48'), drag: 3 });
        ring(tmp.set(p.x, 0.03, p.z).clone(), '#fb7185', 1.8, true, 0.45);
      } else if (e.fx === 'damage') {
        const q = tmp.set(p.x, 1.2, p.z).clone();
        pool.emit({ pos: q, count: 30 + Math.min(40, (e.n ?? 0) * 2), speed: 4.5, life: 0.5, size: 0.11, color: COLOR('#fff1a8'), color2: COLOR('#ff3d00'), drag: 3 });
        ring(q, '#fb923c', 1.6, false, 0.35);
      } else if (e.fx === 'ko') {
        const q = tmp.set(p.x, 1.1, p.z).clone();
        pool.emit({ pos: q, count: 160, speed: 8, life: 0.9, size: 0.16, grow: 1.4, color: COLOR('#ffffff'), color2: COLOR('#f59e0b'), drag: 2.5 });
        ring(q, '#fde047', 6, false, 0.8);
        flash(q, '#fff6c2', 10);
      } else if (e.fx === 'feed') {
        pool.emit({ pos: p, count: 12, speed: 1.2, up: 0.4, life: 0.5, size: 0.14, grow: 1.6, color: COLOR('#cbd5e1'), color2: COLOR('#475569'), drag: 3 });
      }
    }
  };

  /** 天雷的閃電：鋸齒線段，每幀重新產生 */
  const drawBolts = (from: THREE.Vector3, to: THREE.Vector3, count: number) => {
    const arr = (bolts.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    arr.fill(0);
    const SEG = 20;
    let k = 0;
    for (let b = 0; b < count; b++) {
      let px = from.x + (Math.random() - 0.5) * 1.5;
      let py = from.y;
      let pz = from.z + (Math.random() - 0.5) * 1.5;
      for (let s = 1; s <= SEG; s++) {
        const t = s / SEG;
        const nx = THREE.MathUtils.lerp(from.x, to.x, t) + (s < SEG ? (Math.random() - 0.5) * 0.7 * (1 - t * 0.5) : 0);
        const ny = THREE.MathUtils.lerp(from.y, to.y, t);
        const nz = THREE.MathUtils.lerp(from.z, to.z, t) + (s < SEG ? (Math.random() - 0.5) * 0.7 * (1 - t * 0.5) : 0);
        arr.set([px, py, pz, nx, ny, nz], k);
        k += 6;
        px = nx;
        py = ny;
        pz = nz;
      }
    }
    (bolts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    bolts.visible = count > 0;
  };

  useFrame((_, rdt) => {
    const dt = Math.min(0.05, rdt) * Math.max(0.25, engine.timeScale);
    clock.current += dt;
    for (const e of bus.queue) handle(e);
    bus.queue.length = 0;

    // 精彩重播開始／結束時球和選手會瞬移：拖尾清掉，免得畫出一條橫越全場的光
    if (cuts.current !== engine.replayCuts) {
      cuts.current = engine.replayCuts;
      ballTrail.clear();
      for (const t of swingTrails) t.clear();
    }
    const b = engine.ball;
    const bp = new THREE.Vector3(b.pos.x, b.pos.y, b.pos.z);
    const speed = Math.hypot(b.vel.x, b.vel.y, b.vel.z);
    const sp = b.special && !b.special.spent ? b.special.id : null;
    const live = engine.phase === 'rally' || engine.phase === 'dead';

    // 球的拖尾：一般快球淡淡白光，必殺球依招式上色
    if (live && engine.timeScale > 0.04) ballTrail.push(bp);
    if (!live) ballTrail.clear();
    const skillShot = engine.skillShot;
    const trailColor = b.special ? SPECIALS[b.special.id].color : skillShot ? SKILLS[skillShot.id].color : '#e8f5ff';
    ballTrail.mat.uniforms.color.value.set(trailColor);
    ballTrail.mat.uniforms.strength.value = b.special || skillShot ? 1 : Math.min(0.7, Math.max(0, (speed - 9) / 14));
    ballTrail.build(camera.position, b.special ? (b.special.id === 'inferno' ? 0.22 : 0.14) : 0.05);

    // 飛行中的必殺特效
    const emitN = (n: number) => Math.max(1, Math.round(n * (lowSpec ? 0.5 : 1)));
    if (sp === 'inferno') {
      pool.emit({ pos: bp, count: emitN(9), speed: 0.8, up: 1.4, life: 0.45, size: 0.32, grow: 1.4, color: FIRE_A, color2: FIRE_B, drag: 3 });
      pool.emit({ pos: bp, count: emitN(2), speed: 2.5, life: 0.3, size: 0.06, color: SPARK, gravity: -4 });
    } else if (sp === 'thunder') {
      pool.emit({ pos: bp, count: emitN(5), speed: 1.5, life: 0.25, size: 0.09, color: COLOR('#ffffff'), color2: COLOR('#5b8cff'), jitter: 0.06 });
      if (b.vel.y < 0) drawBolts(new THREE.Vector3(bp.x + (Math.random() - 0.5) * 2, 16, bp.z + (Math.random() - 0.5) * 2), bp, 2);
    } else if (sp === 'phantom') {
      pool.emit({ pos: bp, count: emitN(4), speed: 0.4, life: 0.6, size: 0.12, color: COLOR('#f5d9ff'), color2: COLOR('#7c3aed') });
    } else if (sp === 'frost') {
      pool.emit({ pos: bp, count: emitN(5), speed: 0.6, life: 0.9, size: 0.1, color: COLOR('#ffffff'), color2: COLOR('#39c6ff'), gravity: -1.5 });
    } else if (sp === 'cyclone') {
      // 螺旋氣流：粒子繞著球轉
      const ang = clock.current * 26;
      const hs = Math.hypot(b.vel.x, b.vel.z) || 1;
      const px = -b.vel.z / hs;
      const pz = b.vel.x / hs;
      for (let i = 0; i < 2; i++) {
        const a2 = ang + i * Math.PI;
        tmp.set(bp.x + px * Math.cos(a2) * 0.22, bp.y + Math.sin(a2) * 0.22, bp.z + pz * Math.cos(a2) * 0.22);
        pool.emit({ pos: tmp.clone(), count: emitN(2), speed: 0.3, life: 0.5, size: 0.09, color: COLOR('#f0fdfa'), color2: COLOR('#14b8a6') });
      }
    } else if (sp === 'quake') {
      // 隕鐵般的重球：橘紅餘燼加往下掉的碎石
      pool.emit({ pos: bp, count: emitN(5), speed: 0.6, up: 0.4, life: 0.4, size: 0.24, grow: 1, color: COLOR('#fde68a'), color2: COLOR('#b45309'), drag: 3 });
      pool.emit({ pos: bp, count: emitN(1), speed: 1.2, life: 0.6, size: 0.06, color: COLOR('#a8a29e'), gravity: -9 });
    } else if (skillShot?.id === 'squatSmash' && live && b.pos.y < 0.9 && engine.rally.bouncesSinceHit === 0) {
      // 秒蹲重砲貼地飛：地上被風壓掀起一道塵土
      pool.emit({ pos: new THREE.Vector3(bp.x, 0.05, bp.z), count: emitN(3), speed: 1.2, up: 0.8, life: 0.5, size: 0.16, grow: 1.2, color: COLOR('#e7d8bf'), color2: COLOR('#78716c'), drag: 2 });
    } else if (skillShot?.id === 'splash' && live) {
      pool.emit({ pos: bp, count: emitN(2), speed: 0.8, life: 0.5, size: 0.07, color: COLOR('#e0f2fe'), color2: COLOR('#0284c7'), gravity: -8 });
    } else if (b.special?.id === 'frost' && live) {
      pool.emit({ pos: bp, count: 1, speed: 0.3, life: 0.6, size: 0.08, color: COLOR('#dff8ff'), gravity: -1 });
    }
    if (clock.current < boltUntil.current) {
      drawBolts(new THREE.Vector3(boltTarget.current.x, 18, boltTarget.current.z), boltTarget.current, 3);
    } else if (sp !== 'thunder' || b.vel.y >= 0) {
      bolts.visible = false;
    }

    // 揮拍殘影、能量滿的拍子閃光、蓄勢氣場
    engine.athletes.forEach((a, i) => {
      const tipPos = paddleTips.get(a.id);
      const p = engine.swingProgress(a);
      const tr = swingTrails[i];
      if (tipPos && p > 0.05 && p < 0.7) tr.push(tipPos);
      else tr.clear();
      const firing = engine.cinematic?.team === a.team ? engine.cinematic.id : null;
      // 瑪利歐網球式的球路配色：軟球藍、抽球紅、挑高黃、殺球紫
      tr.mat.uniforms.color.value.set(firing ? SPECIALS[firing].color : shotColor(a.swing.button, engine.ball.pos.y));
      tr.mat.uniforms.strength.value = firing ? 1 : 0.5;
      tr.build(camera.position, firing ? 0.16 : 0.07);

      const special = a.paddle.special;
      if (engine.specials && a.energy >= 100 && tipPos && Math.random() < (a.armed ? 1 : 0.5)) {
        const [c1, c2] = SPECIAL_COLORS[special];
        pool.emit({ pos: tipPos, count: a.armed ? 3 : 1, speed: 0.6, up: 0.5, life: 0.5, size: 0.08, color: c1, color2: c2 });
      }
      const aura = auras.current[i];
      const am = auraMats[i];
      am.uniforms.time.value = clock.current;
      // 覺醒中：金色氣場＋往上竄的火星（蓄勢、放必殺時照樣用招式的顏色）
      const awake = a.awakenHits > 0;
      am.uniforms.color.value.set(awake && !a.armed && !firing ? AWAKEN_COLOR : SPECIALS[special].color);
      const target = a.armed ? 0.8 : firing ? 0.7 : awake ? 0.4 : 0;
      if (awake && Math.random() < (lowSpec ? 0.35 : 0.8)) {
        tmp.set(a.pos.x + (Math.random() - 0.5) * 0.7, 0.2 + Math.random() * 1.4, a.pos.z + (Math.random() - 0.5) * 0.5);
        pool.emit({ pos: tmp, count: 1, speed: 0.3, up: 2.2, life: 0.7, size: 0.07, color: AWAKEN_A, color2: AWAKEN_B, gravity: 1.5 });
      }
      am.uniforms.strength.value += (target - am.uniforms.strength.value) * Math.min(1, dt * 6);
      if (aura) {
        aura.visible = am.uniforms.strength.value > 0.02;
        aura.position.set(a.pos.x, 1.05, a.pos.z);
        aura.rotation.y = teamSide(a.team) > 0 ? 0 : Math.PI;
      }
    });

    // 狐火隱形球：球看不見，只偶爾閃一點藍色火光
    if (engine.ballHidden() && Math.random() < (lowSpec ? 0.15 : 0.3)) {
      pool.emit({ pos: bp, count: 1, speed: 0.2, up: 0.4, life: 0.35, size: 0.14, color: COLOR('#bfdbfe'), color2: COLOR('#1d4ed8') });
    }
    // 超頻中：腳下拖著電光
    for (const a of engine.athletes) {
      if (!engine.effectBy('overclock', a.team) || Math.random() > (lowSpec ? 0.3 : 0.6)) continue;
      pool.emit({ pos: new THREE.Vector3(a.pos.x, 0.08, a.pos.z), count: 1, speed: 1.2, up: 0.6, life: 0.35, size: 0.07, color: COLOR('#f5f3ff'), color2: COLOR('#7e22ce'), jitter: 0.04 });
    }

    // 落點預警：讓每招都有看得見的破解線索
    const wsp = b.special && !b.special.spent && engine.phase === 'rally' ? b.special : null;
    const warnKind = wsp && (wsp.id === 'thunder' || wsp.id === 'quake' || wsp.id === 'cyclone') ? wsp.id : null;
    warn.g.visible = !!warnKind;
    warn.arrow.visible = warnKind === 'cyclone';
    if (wsp && warnKind) {
      const pulse = 0.75 + Math.sin(clock.current * 14) * 0.25;
      const color = SPECIALS[warnKind].color;
      const radius = warnKind === 'quake' ? QUAKE.r : warnKind === 'thunder' ? THUNDER_R : 0.7;
      warn.g.position.set(wsp.target.x, 0.02, wsp.target.z);
      warn.g.scale.setScalar(radius);
      (warn.ring.material as THREE.MeshBasicMaterial).color.set(color);
      (warn.ring.material as THREE.MeshBasicMaterial).opacity = 0.85 * pulse;
      (warn.fill.material as THREE.MeshBasicMaterial).color.set(color);
      (warn.fill.material as THREE.MeshBasicMaterial).opacity = 0.12 * pulse;
      if (warnKind === 'cyclone') {
        // 箭頭指向落地後竄出的方向
        const ax = wsp.perp.x * wsp.sway;
        const az = wsp.perp.z * wsp.sway;
        const slide = (clock.current * 1.6) % 1;
        warn.arrow.position.set(wsp.target.x + ax * (0.6 + slide * 0.8), 0.025, wsp.target.z + az * (0.6 + slide * 0.8));
        warn.arrow.scale.setScalar(1.7);
        warn.arrow.rotation.set(-Math.PI / 2, 0, Math.atan2(-ax, -az));
        (warn.arrow.material as THREE.MeshBasicMaterial).color.set(color);
        (warn.arrow.material as THREE.MeshBasicMaterial).opacity = 0.95 * (1 - slide * 0.6);
      }
    }

    // 結冰與水灘：照引擎的地形效果畫，快消失時淡出
    const used = { ice: 0, water: 0 };
    for (const m of hazardPool) m.visible = false;
    for (const hz of engine.hazards) {
      const left = hz.until - engine.time;
      // 重播時引擎時間倒回去：還沒出現的結冰、水灘先不畫
      if (left <= 0 || engine.time < hz.born) continue;
      const slots = hazardPool.filter((m) => m.userData.kind === hz.kind);
      const m = slots[used[hz.kind]++];
      if (!m) continue;
      const grow = Math.min(1, (engine.time - hz.born) / 0.25);
      m.visible = true;
      m.position.set(hz.x, 0.01, hz.z);
      m.scale.setScalar(hz.r * (0.4 + 0.6 * grow));
      (m.material as THREE.MeshBasicMaterial).opacity = Math.min(1, left / 0.8) * (hz.kind === 'water' ? 0.8 + Math.sin(clock.current * 5) * 0.08 : 0.9);
      if (Math.random() < (lowSpec ? 0.1 : 0.25)) {
        const a3 = Math.random() * Math.PI * 2;
        const rr = Math.random() * hz.r * 0.8;
        pool.emit({
          pos: new THREE.Vector3(hz.x + Math.cos(a3) * rr, 0.04, hz.z + Math.sin(a3) * rr),
          count: 1,
          speed: 0.3,
          up: 0.4,
          life: 0.6,
          size: 0.06,
          color: COLOR('#ffffff'),
          color2: COLOR(hz.kind === 'ice' ? '#7dd3fc' : '#0ea5e9'),
        });
      }
    }

    pool.update(dt);

    for (const r of rings) {
      const age = clock.current - r.userData.born;
      if (age > r.userData.life) {
        r.visible = false;
        continue;
      }
      const k = age / r.userData.life;
      r.scale.setScalar(0.1 + (1 - (1 - k) * (1 - k)) * r.userData.max);
      (r.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.9;
    }
    decals.current = decals.current.filter((d) => {
      const age = clock.current - d.born;
      const m = d.mesh.material as THREE.MeshBasicMaterial;
      m.opacity = age < d.life - 1 ? 1 : Math.max(0, d.life - age);
      if (age > d.life) {
        d.mesh.visible = false;
        return false;
      }
      return true;
    });
    if (flashLight.current) flashLight.current.intensity *= Math.exp(-dt * 12);
    if (flashSprite.current) {
      const m = flashSprite.current.material as THREE.SpriteMaterial;
      m.opacity *= Math.exp(-dt * 10);
    }
  });

  const glow = glowTexture();
  return (
    <group>
      <points geometry={pool.geo} material={pool.mat} frustumCulled={false} />
      <primitive object={ballTrail.mesh} />
      {swingTrails.map((t, i) => (
        <primitive key={i} object={t.mesh} />
      ))}
      <primitive object={bolts} />
      {rings.map((r, i) => (
        <primitive key={i} object={r} />
      ))}
      {decalPool.map((d, i) => (
        <primitive key={`d${i}`} object={d} />
      ))}
      {hazardPool.map((d, i) => (
        <primitive key={`h${i}`} object={d} />
      ))}
      <primitive object={warn.g} />
      <primitive object={warn.arrow} />
      {engine.athletes.map((a, i) => (
        <mesh key={a.id} ref={(m) => void (auras.current[i] = m)} material={auraMats[i]} visible={false}>
          <cylinderGeometry args={[0.5, 0.65, 2.3, 32, 1, true]} />
        </mesh>
      ))}
      <pointLight ref={flashLight} intensity={0} distance={14} decay={1.6} />
      <sprite ref={flashSprite} scale={[1, 1, 1]}>
        <spriteMaterial map={glow} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
};
