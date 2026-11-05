export interface V3 {
  x: number;
  y: number;
  z: number;
}

export const v3 = (x = 0, y = 0, z = 0): V3 => ({ x, y, z });
export const clone = (a: V3): V3 => ({ x: a.x, y: a.y, z: a.z });
export const copyInto = (out: V3, a: V3) => {
  out.x = a.x;
  out.y = a.y;
  out.z = a.z;
  return out;
};
export const len = (a: V3) => Math.hypot(a.x, a.y, a.z);
export const cross = (a: V3, b: V3): V3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
export const hypot2 = (x: number, z: number) => Math.hypot(x, z);
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Box–Muller 常態分布，用來產生擊球誤差 */
export const gauss = (rand: () => number = Math.random) => {
  const u = Math.max(1e-9, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
