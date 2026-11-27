// 球拍頭像的顏色與紋路：依暱稱與種子產生，不需要上傳照片、也沒有肖像問題（頭像元件與分享卡共用）
const PALETTE: [string, string][] = [
  ['#10b981', '#047857'], ['#2f6fd6', '#1d4c9e'], ['#f97316', '#c2410c'], ['#e11d48', '#9f1239'],
  ['#8b5cf6', '#6d28d9'], ['#0ea5e9', '#0369a1'], ['#eab308', '#a16207'], ['#14b8a6', '#0f766e'],
];

function hash(s: string) {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const avatarColors = (name: string, seed = 0) => {
  const h = hash(`${name}|${seed}`);
  const [c1, c2] = PALETTE[h % PALETTE.length];
  return { c1, c2, pattern: (h >> 5) % 3, initial: Array.from(name.trim() || '?')[0] };
};
