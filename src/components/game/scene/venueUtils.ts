import { useMemo } from 'react';

/** 新場地共用的非元件工具 */

/** 可重複的偽亂數：每次載入的佈置都一樣 */
export const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

export interface Inst {
  p: [number, number, number];
  r?: [number, number, number];
  s: [number, number, number] | number;
  c?: string;
}

/** 遠景大樓群：用同一張窗格貼圖、不同高度與色調 */
export const useSkyline = (seed: number, count: number, ring: { r0: number; r1: number; a0: number; a1: number; h0: number; h1: number }) =>
  useMemo(() => {
    const r = rng(seed);
    const out: Inst[] = [];
    const tones = ['#c9d3da', '#b7c3cc', '#dfe3e2', '#aeb9c2', '#e9e6dd', '#9fb0bd'];
    for (let i = 0; i < count; i++) {
      const a = ring.a0 + (ring.a1 - ring.a0) * r();
      const d = ring.r0 + (ring.r1 - ring.r0) * r();
      const h = ring.h0 + (ring.h1 - ring.h0) * r() * r();
      const w = 8 + r() * 14;
      out.push({ p: [Math.sin(a) * d, h / 2, -Math.cos(a) * d], r: [0, r() * Math.PI, 0], s: [w, h, 8 + r() * 12], c: tones[i % tones.length] });
    }
    return out;
  }, [seed, count, ring.r0, ring.r1, ring.a0, ring.a1, ring.h0, ring.h1]);
