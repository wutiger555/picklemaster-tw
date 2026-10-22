import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { GameEngine, GameEvent } from '../engine/game';
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
const SPECIAL_COLORS: Record<SpecialId, [THREE.Color, THREE.Color]> = {
  inferno: [FIRE_A, FIRE_B],
  thunder: [COLOR('#ffffff'), COLOR('#3d6bff')],
  phantom: [COLOR('#f5d9ff'), COLOR('#8a2be2')],
  frost: [COLOR('#ffffff'), COLOR('#39c6ff')],
};

export const Effects = ({ engine, bus, lowSpec }: { engine: GameEngine; bus: FxBus; lowSpec: boolean }) => {
  const { camera, scene } = useThree();
  const pool = useMemo(() => new ParticlePool(), []);
  const ballTrail = useMemo(() => new Ribbon(28, '#ffffff'), []);
  const swingTrails = useMemo(() => engine.athletes.map(() => new Ribbon(14, '#ffffff')), [engine]);
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
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ map: decalTexture(kind), transparent: true, depthWrite: false, toneMapped: kind !== 'frost' }),
    );
    m.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI * 2);
    m.position.set(p.x, 0.008 + decals.current.length * 0.0005, p.z);
    scene.add(m);
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
    } else if (e.type === 'net') {
      pool.emit({ pos: tmp.set(e.pos.x, e.pos.y, e.pos.z).clone(), count: 8, speed: 1.5, life: 0.3, size: 0.06, color: COLOR('#e2e8f0'), gravity: -5 });
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
      am.uniforms.color.value.set(SPECIALS[special].color);
      const target = a.armed ? 0.8 : firing ? 0.7 : 0;
      am.uniforms.strength.value += (target - am.uniforms.strength.value) * Math.min(1, dt * 6);
      if (aura) {
        aura.visible = am.uniforms.strength.value > 0.02;
        aura.position.set(a.pos.x, 1.05, a.pos.z);
        aura.rotation.y = teamSide(a.team) > 0 ? 0 : Math.PI;
      }
    });

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
        scene.remove(d.mesh);
        d.mesh.geometry.dispose();
        m.dispose();
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
