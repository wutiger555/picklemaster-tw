import { type MutableRefObject, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COURT } from '../engine/constants';
import { SKILL_FX, type GameEngine } from '../engine/game';
import { teamSide } from '../engine/rules';

const canvasTexture = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** 淹水的水面：一圈圈漣漪，貼圖會慢慢流動 */
const rippleTexture = () => {
  const t = canvasTexture(256, 256, (g) => {
    g.fillStyle = 'rgba(56,189,248,0.55)';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = 10 + Math.random() * 34;
      g.strokeStyle = `rgba(224,242,254,${0.25 + Math.random() * 0.35})`;
      g.lineWidth = 1.5 + Math.random() * 2;
      g.beginPath();
      g.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
      g.stroke();
    }
  });
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 3);
  return t;
};

/** 頭上冒的表情符號 */
const emojiTexture = (emoji: string) =>
  canvasTexture(128, 128, (g) => {
    g.font = '96px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(emoji, 64, 70);
  });

/** 中招的人頭上冒的符號：被嗆聲火大、被醃到發酸、被虎嘯嚇到、能量被吃掉 */
const MOODS = [
  ['taunt', '💢'],
  ['roar', '😱'],
  ['sour', '😖'],
  ['feast', '💸'],
] as const;

/**
 * 角色絕招的持續效果畫面：淹水的水面、被嗆聲的人頭上冒💢、帽哥的全息分身；
 * 全民應援時把觀眾的情緒拉滿。全部事先建好、只切換顯示（不會在比賽中編譯著色器）。
 */
export const SkillFx = ({ engine, excite }: { engine: GameEngine; excite: MutableRefObject<number> }) => {
  const clock = useRef(0);
  const flood = useMemo(() => {
    const front = SKILL_FX.flood.front;
    const depth = COURT.halfLength + 1 - front;
    const geo = new THREE.PlaneGeometry((COURT.halfWidth + 1.2) * 2, depth);
    const map = rippleTexture();
    return ([0, 1] as const).map((team) => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 }));
      m.rotation.set(-Math.PI / 2, 0, 0);
      m.position.set(0, 0.014, teamSide(team) * (front + depth / 2));
      m.visible = false;
      return m;
    });
  }, []);
  const moods = useMemo(
    () =>
      MOODS.map(([id, emoji]) => {
        const mat = new THREE.SpriteMaterial({ map: emojiTexture(emoji), transparent: true, depthWrite: false });
        return {
          id,
          sprites: ([0, 1] as const).map(() => {
            const sp = new THREE.Sprite(mat);
            sp.scale.setScalar(0.5);
            sp.visible = false;
            return sp;
          }),
        };
      }),
    [],
  );
  const clones = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({ color: '#bef264', transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    // 全息人形：軀幹、頭、雙臂（右手舉拍）、雙腿，腳下一圈光環
    const limb = (r: number, len: number) => new THREE.CylinderGeometry(r, r * 0.8, len, 10, 1);
    return ([0, 1] as const).map(() => {
      const g = new THREE.Group();
      const add = (geo: THREE.BufferGeometry, x: number, y: number, z: number, rz = 0) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.rotation.z = rz;
        g.add(m);
        return m;
      };
      add(new THREE.CylinderGeometry(0.16, 0.2, 0.62, 14), 0, 1.12, 0);
      add(new THREE.SphereGeometry(0.13, 16, 12), 0, 1.6, 0);
      add(limb(0.055, 0.56), -0.27, 1.12, 0, 0.35);
      add(limb(0.055, 0.56), 0.3, 1.3, 0, -1.9);
      add(limb(0.07, 0.8), -0.1, 0.42, 0, 0.08);
      add(limb(0.07, 0.8), 0.1, 0.42, 0, -0.08);
      add(new THREE.CircleGeometry(0.17, 20), 0.6, 1.42, 0);
      const ring = add(new THREE.RingGeometry(0.36, 0.44, 32), 0, 0.02, 0);
      ring.rotation.x = -Math.PI / 2;
      g.visible = false;
      return g;
    });
  }, []);

  useFrame((_, dt) => {
    clock.current += dt;
    const t = clock.current;
    // 淹水：被淹的是放招方的對手那半場
    for (const team of [0, 1] as const) {
      const m = flood[team];
      const on = engine.effectOn('flood', team);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity += ((on ? 0.85 : 0) - mat.opacity) * Math.min(1, dt * 6);
      m.visible = mat.opacity > 0.02;
      if (m.visible && mat.map) mat.map.offset.set(t * 0.03, t * 0.05);
    }
    engine.athletes.forEach((a, i) => {
      // 同時中好幾招時只冒第一個（清單前面的優先）
      let shown = false;
      for (const m of moods) {
        const sp = m.sprites[i];
        if (!sp) continue;
        sp.visible = !shown && engine.effectOn(m.id, a.team) && !engine.replay;
        if (!sp.visible) continue;
        shown = true;
        sp.position.set(a.pos.x + 0.25, 2.15 + Math.sin(t * 6) * 0.05, a.pos.z);
        sp.scale.setScalar(0.45 + Math.max(0, Math.sin(t * 9)) * 0.08);
      }
    });
    for (const team of [0, 1] as const) {
      const g = clones[team];
      const p = engine.clonePos(team);
      g.visible = !!p;
      if (p) {
        g.position.set(p.x, 0, p.z);
        g.rotation.y = team === 0 ? Math.PI : 0;
        // 全息投影的閃爍
        ((g.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 23) * 0.06 + Math.sin(t * 3) * 0.08;
      }
    }
    // 全民應援：觀眾整場沸騰
    if (engine.effectBy('cheer', 0) || engine.effectBy('cheer', 1)) excite.current = Math.max(excite.current, 0.9);
  });

  return (
    <group>
      {flood.map((m, i) => (
        <primitive key={`f${i}`} object={m} />
      ))}
      {moods.flatMap((m) => m.sprites.map((s, i) => <primitive key={`${m.id}${i}`} object={s} />))}
      {clones.map((g, i) => (
        <primitive key={`c${i}`} object={g} />
      ))}
    </group>
  );
};
