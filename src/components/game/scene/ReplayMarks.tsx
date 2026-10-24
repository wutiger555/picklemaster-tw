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

  useFrame((_, dt) => {
    clock.current += dt;
    const rp = engine.replay;
    if (!rp) {
      trail.visible = false;
      landing.visible = false;
      people.me.visible = people.stand.visible = people.link.visible = false;
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
    landing.visible = !!L && k > 0.15;
    if (L) {
      const c = LANDING_COLOR[L.kind];
      landing.position.set(L.x, L.kind === 'net' ? 0.5 : 0, L.z);
      for (const ch of [landing.children[0], landing.children[2]]) ((ch as THREE.Mesh).material as THREE.MeshBasicMaterial).color.set(c);
      landing.scale.setScalar(1 + Math.sin(clock.current * 7) * 0.12);
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
    </group>
  );
};
