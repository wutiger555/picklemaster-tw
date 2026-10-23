import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { COURT, PLAYER } from '../engine/constants';
import { AUTO_CHARGE, type GameEngine } from '../engine/game';
import type { ShotKind } from '../engine/shots';

const K = COURT.kitchen;
const W = COURT.halfWidth;

const AIM_COLOR: Record<ShotKind, string> = {
  serve: '#facc15',
  dink: '#34d399',
  drop: '#34d399',
  drive: '#f97316',
  smash: '#ef4444',
  lob: '#60a5fa',
  punch: '#fb923c',
  block: '#5eead4',
  speedup: '#f43f5e',
};

const additive = (color: string, opacity = 1) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    side: THREE.DoubleSide,
  });

/**
 * 擊球導引層（只給玩家看）：
 * 站位圈＝該站哪裡、計時圈＝縮到最小就揮拍、空中擊球點、出界球的紅色 X、
 * 球進入打擊範圍時發亮、蓄力時的瞄準落點、廚房警示。
 */
export const Guide = ({ engine }: { engine: GameEngine }) => {
  const { camera } = useThree();
  const stand = useRef<THREE.Group>(null);
  const contact = useRef<THREE.Group>(null);
  const timing = useRef<THREE.Mesh>(null);
  const timingCore = useRef<THREE.Mesh>(null);
  const out = useRef<THREE.Group>(null);
  const reach = useRef<THREE.Mesh>(null);
  const aim = useRef<THREE.Group>(null);
  const kitchen = useRef<THREE.MeshBasicMaterial>(null);
  const mats = useMemo(
    () => ({
      stand: additive('#34f5c5', 0.9),
      standFill: additive('#34f5c5', 0.18),
      contact: additive('#ffffff', 0.85),
      timing: additive('#7dd3fc', 0.9),
      core: additive('#fde047', 0),
      out: additive('#ff3b3b', 0.95),
      reach: additive('#34d399', 0.2),
      aim: additive('#34d399', 0.9),
      aimDot: additive('#ffffff', 0.95),
    }),
    [],
  );
  const clock = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rdt) => {
    clock.current += rdt;
    const t = clock.current;
    const g = engine.guide;
    const h = engine.human;
    const live = engine.phase === 'rally' && !h.ai && !engine.replay;

    // 站位圈：輔助模式時是「自動跑過去的目標」，手動模式是「建議站這裡」
    if (stand.current) {
      const show = live && !!g && !g.leave;
      stand.current.visible = show;
      if (show) {
        stand.current.position.set(g!.stand.x, 0.012, g!.stand.z);
        const d = Math.hypot(h.pos.x - g!.stand.x, h.pos.z - g!.stand.z);
        const there = d < 0.25;
        // 機會球（瑪利歐網球的 chance area）：殺球 → 金色；網前推擋／突擊 → 紅色
        const smash = engine.chance === 'smash';
        const attack = !!engine.chance && !smash;
        const chance = smash || attack;
        mats.stand.color.set(smash ? '#fbbf24' : attack ? '#fb7185' : there ? '#a3ff6b' : '#34f5c5');
        stand.current.scale.setScalar(chance ? 1.15 + Math.sin(t * 12) * 0.12 : there ? 1 : 1 + Math.sin(t * 8) * 0.08);
      }
    }

    // 空中擊球點與計時圈：圈從大縮到小，縮到最小（並變金色）就是揮拍時機
    const remain = g ? g.hitT - engine.time : 99;
    const showTiming = live && !!g && !g.leave && remain > -0.05 && remain < g.span + 0.1;
    if (contact.current) {
      contact.current.visible = showTiming;
      if (showTiming) {
        contact.current.position.set(g!.contact.x, g!.contact.y, g!.contact.z);
        contact.current.lookAt(camera.position);
        // 機會球：空中擊球點變成會閃的大準星，一眼看出「在這裡打下去」
        const c = engine.chance;
        mats.contact.color.set(c === 'smash' ? '#fbbf24' : c ? '#fb7185' : '#ffffff');
        contact.current.scale.setScalar(c ? 2.1 + Math.sin(t * 14) * 0.35 : 1);
      }
    }
    if (timing.current && timingCore.current) {
      timing.current.visible = showTiming;
      timingCore.current.visible = showTiming;
      if (showTiming) {
        // 計時圈跟著球走
        const b = engine.ball.pos;
        const p = engine.prevBall;
        const a = engine.alpha;
        tmp.set(p.x + (b.x - p.x) * a, p.y + (b.y - p.y) * a, p.z + (b.z - p.z) * a);
        timing.current.position.copy(tmp);
        timingCore.current.position.copy(tmp);
        timing.current.lookAt(camera.position);
        timingCore.current.lookAt(camera.position);
        const k = THREE.MathUtils.clamp(remain / Math.min(0.9, g!.span), 0, 1);
        timing.current.scale.setScalar(0.16 + k * 1.1);
        let now: boolean;
        let color: string;
        if (engine.controls === 'auto') {
          // 提早按：已經按下且來得及蓄滿 → 金色；按了但蓄不滿 → 綠；還沒按、再不按就蓄不滿 → 橘
          const sw = h.swing;
          const committed = sw.state !== 'idle';
          now = g!.reachable && committed && g!.hitT - sw.t0 >= AUTO_CHARGE;
          color = !g!.reachable ? '#fb7185' : now ? '#fde047' : committed ? '#a7f3d0' : remain < AUTO_CHARGE ? '#fdba74' : '#7dd3fc';
        } else {
          now = g!.reachable && Math.abs(remain - PLAYER.swingWindup) < 0.06;
          color = !g!.reachable ? '#fb7185' : now ? '#fde047' : k < 0.35 ? '#a7f3d0' : '#7dd3fc';
        }
        // 打不到（站錯位置）時計時圈變紅：先跑到地上的綠圈
        mats.timing.color.set(color);
        mats.timing.opacity = 0.35 + (1 - k) * 0.6;
        mats.core.opacity = now ? 0.9 : 0;
        timingCore.current.scale.setScalar(now ? 1.2 + Math.sin(t * 40) * 0.15 : 1);
      }
    }

    // 出界球：在預計落點畫紅色 X
    if (out.current) {
      const show = live && !!g && g.leave;
      out.current.visible = show;
      if (show) {
        out.current.position.set(g!.contact.x, 0.015, g!.contact.z);
        out.current.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
        out.current.scale.setScalar(1 + Math.sin(t * 10) * 0.1);
      }
    }

    // 腳下的打擊範圍：球進入範圍時亮起
    if (reach.current) {
      reach.current.visible = live && engine.rally.lastTeam !== h.team;
      reach.current.position.set(h.pos.x, 0.01, h.pos.z);
      const b = engine.ball.pos;
      const inReach = Math.hypot(b.x - h.pos.x, b.z - h.pos.z) < PLAYER.reach + 0.15 && b.y < PLAYER.maxContactHeight;
      mats.reach.opacity += ((inReach ? 0.55 : 0.12) - mats.reach.opacity) * Math.min(1, rdt * 14);
    }

    // 蓄力時的瞄準落點
    const preview = engine.aimPreview();
    if (aim.current) {
      aim.current.visible = !!preview;
      if (preview) {
        aim.current.position.set(preview.target.x, 0.014, preview.target.z);
        mats.aim.color.set(AIM_COLOR[preview.kind]);
        aim.current.scale.setScalar(1 + Math.sin(t * 6) * 0.06);
      }
    }

    // 廚房警示：站進廚房亮橘色，剛截擊完還在廚房邊緣亮紅色
    if (kitchen.current) {
      const inK = Math.abs(h.pos.z) - 0.12 <= K;
      const locked = engine.time < h.kitchenLockUntil;
      let o = 0;
      if (inK && live) o = locked ? 0.4 + Math.sin(t * 18) * 0.15 : 0.18;
      kitchen.current.opacity += (o - kitchen.current.opacity) * Math.min(1, rdt * 10);
      kitchen.current.color.set(locked ? '#ef4444' : '#f59e0b');
    }
  });

  return (
    <group>
      <group ref={stand} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={mats.stand}>
          <ringGeometry args={[0.3, 0.37, 40]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={mats.standFill}>
          <circleGeometry args={[0.3, 40]} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, (i * Math.PI) / 2]} position={[0, 0.001, 0]} material={mats.stand}>
            <ringGeometry args={[0.42, 0.5, 6, 1, -0.25, 0.5]} />
          </mesh>
        ))}
      </group>
      <group ref={contact} visible={false}>
        <mesh material={mats.contact}>
          <ringGeometry args={[0.1, 0.125, 32]} />
        </mesh>
      </group>
      <mesh ref={timing} material={mats.timing} visible={false}>
        <ringGeometry args={[0.92, 1, 48]} />
      </mesh>
      <mesh ref={timingCore} material={mats.core} visible={false}>
        <ringGeometry args={[0.1, 0.16, 32]} />
      </mesh>
      <group ref={out} visible={false}>
        <mesh material={mats.out}>
          <planeGeometry args={[0.6, 0.09]} />
        </mesh>
        <mesh material={mats.out} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[0.6, 0.09]} />
        </mesh>
      </group>
      <mesh ref={reach} rotation={[-Math.PI / 2, 0, 0]} material={mats.reach} visible={false}>
        <ringGeometry args={[PLAYER.reach - 0.04, PLAYER.reach + 0.02, 48]} />
      </mesh>
      <group ref={aim} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={mats.aim}>
          <ringGeometry args={[0.24, 0.3, 36]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={mats.aimDot}>
          <circleGeometry args={[0.05, 16]} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, K / 2]}>
        <planeGeometry args={[W * 2, K]} />
        <meshBasicMaterial ref={kitchen} color="#f59e0b" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
};
