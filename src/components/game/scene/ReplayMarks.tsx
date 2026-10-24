import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GameEngine } from '../engine/game';

const MAX_PTS = 400;
const LANDING_COLOR = { in: '#4ade80', out: '#f87171', net: '#fb923c' } as const;

const glow = (color: string, opacity = 0.9) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide });

/**
 * 重播時的標記：整條球路（跟著重播進度畫出來）、落點圈＋光柱（界內綠、出界紅、掛網橘）；
 * 失分重播再加上「你當時站這」（白圈）和「應該站這」（綠圈）與兩者之間的虛線。
 * 全部事先建好，只在重播時顯示。
 */
export const ReplayMarks = ({ engine }: { engine: GameEngine }) => {
  const shown = useRef(-1);
  const clock = useRef(0);
  const trail = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_PTS * 3), 3));
    geo.setDrawRange(0, 0);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#fde047', transparent: true, opacity: 0.95, toneMapped: false }));
    line.frustumCulled = false;
    line.visible = false;
    return line;
  }, []);
  const landing = useMemo(() => {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.24, 40), glow('#4ade80'));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), glow('#ffffff'));
    dot.rotation.x = -Math.PI / 2;
    dot.position.y = 0.021;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8, 1, true), glow('#4ade80', 0.5));
    post.position.y = 0.6;
    g.add(ring, dot, post);
    g.visible = false;
    return g;
  }, []);
  const people = useMemo(() => {
    const mk = (color: string) => {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.4, 40), glow(color));
      m.rotation.x = -Math.PI / 2;
      m.visible = false;
      return m;
    };
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const link = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: '#4ade80', dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.9, toneMapped: false }));
    link.frustumCulled = false;
    link.visible = false;
    return { me: mk('#ffffff'), stand: mk('#4ade80'), link };
  }, []);
  // 量尺：落點到最近的線，一條亮線＋兩端短橫，定格時看得出差幾公分
  const ruler = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6 * 3), 3));
    const line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#ffffff', toneMapped: false, depthTest: false }));
    line.frustumCulled = false;
    line.renderOrder = 5;
    line.visible = false;
    return line;
  }, []);

  useFrame((_, dt) => {
    clock.current += dt;
    const rp = engine.replay;
    if (!rp) {
      trail.visible = false;
      landing.visible = false;
      people.me.visible = people.stand.visible = people.link.visible = false;
      ruler.visible = false;
      shown.current = -1;
      return;
    }
    const info = rp.info;
    // 球路：只畫到目前重播的時間（看得到球一路飛過去），落地後整條留著
    const pos = trail.geometry.getAttribute('position') as THREE.BufferAttribute;
    if (shown.current !== rp.key) {
      shown.current = rp.key;
      const n = Math.min(MAX_PTS, info.path.length);
      for (let i = 0; i < n; i++) pos.setXYZ(i, info.path[i].x, info.path[i].y, info.path[i].z);
      pos.needsUpdate = true;
      trail.geometry.computeBoundingSphere();
    }
    const span = Math.max(0.001, rp.to - (rp.key - 0.02));
    const k = Math.min(1, Math.max(0, (rp.t - (rp.key - 0.02)) / span));
    trail.geometry.setDrawRange(0, Math.max(2, Math.round(Math.min(MAX_PTS, info.path.length) * k)));
    trail.visible = info.path.length > 1;

    const L = info.landing;
    // 定格時一定要看得到（球剛出手就落地時 k 還很小）
    const marked = k > 0.15 || rp.holdUntil > 0;
    landing.visible = !!L && marked;
    if (L) {
      const c = LANDING_COLOR[L.kind];
      landing.position.set(L.x, L.kind === 'net' ? 0.5 : 0, L.z);
      // 掛網：圈立起來貼著網面；光柱只在落地時才有
      landing.children[0].rotation.x = landing.children[1].rotation.x = L.kind === 'net' ? 0 : -Math.PI / 2;
      landing.children[2].visible = L.kind !== 'net';
      for (const ch of [landing.children[0], landing.children[2]]) ((ch as THREE.Mesh).material as THREE.MeshBasicMaterial).color.set(c);
      // 定格時不再跳動：要量離線幾公分就縮成球印大小（不然圈比差距還寬），否則放大一點
      landing.scale.setScalar(rp.holdUntil ? (L.edge ? 0.35 : 1.3) : 1 + Math.sin(clock.current * 7) * 0.12);
    }
    const e = L?.edge;
    ruler.visible = !!e && !!info.review && marked;
    if (L && e) {
      const rp2 = ruler.geometry.getAttribute('position') as THREE.BufferAttribute;
      // 尺的方向與兩端短橫（垂直於尺）
      const dx = e.x - L.x;
      const dz = e.z - L.z;
      const len = Math.hypot(dx, dz) || 1;
      const nx = (-dz / len) * 0.12;
      const nz = (dx / len) * 0.12;
      const y = 0.03;
      rp2.setXYZ(0, L.x, y, L.z);
      rp2.setXYZ(1, e.x, y, e.z);
      rp2.setXYZ(2, L.x - nx, y, L.z - nz);
      rp2.setXYZ(3, L.x + nx, y, L.z + nz);
      rp2.setXYZ(4, e.x - nx, y, e.z - nz);
      rp2.setXYZ(5, e.x + nx, y, e.z + nz);
      rp2.needsUpdate = true;
      (ruler.material as THREE.LineBasicMaterial).color.set(LANDING_COLOR[L.kind]);
    }

    const rv = info.review;
    people.me.visible = !!rv?.me;
    people.stand.visible = !!rv?.stand;
    people.link.visible = !!rv?.me && !!rv?.stand;
    if (rv?.me) people.me.position.set(rv.me.x, 0.018, rv.me.z);
    if (rv?.stand) people.stand.position.set(rv.stand.x, 0.019, rv.stand.z);
    if (rv?.me && rv?.stand) {
      const lp = people.link.geometry.getAttribute('position') as THREE.BufferAttribute;
      lp.setXYZ(0, rv.me.x, 0.03, rv.me.z);
      lp.setXYZ(1, rv.stand.x, 0.03, rv.stand.z);
      lp.needsUpdate = true;
      people.link.computeLineDistances();
    }
  });

  return (
    <group>
      <primitive object={trail} />
      <primitive object={landing} />
      <primitive object={people.me} />
      <primitive object={people.stand} />
      <primitive object={people.link} />
      <primitive object={ruler} />
    </group>
  );
};
