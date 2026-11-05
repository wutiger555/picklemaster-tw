import { AI_PROFILES, type Difficulty } from './engine/ai';
import type { GameEvent, TeamStats } from './engine/game';
import { paddleById, PADDLES, SPECIALS } from './engine/paddles';
import { CHARACTERS, type CharacterDef } from './characters';

/**
 * 戰績分享與挑戰連結。全部在前端完成，不需要後端：
 * 挑戰內容直接編在網址 /game?vs=難度.我方分數.對手分數.角色.球拍
 */

/** 一場比賽中玩家的亮點數據（引擎的 TeamStats 沒有的部分，從擊球事件累計） */
export interface Highlights {
  /** 最快球速（km/h） */
  topKmh: number;
  /** 放出必殺技次數 */
  specials: number;
  /** 放出角色絕招次數 */
  skills: number;
  smashes: number;
  dinks: number;
  /** 網前截擊：推擋、卸力擋、突擊 */
  netPlays: number;
}

export const emptyHighlights = (): Highlights => ({ topKmh: 0, specials: 0, skills: 0, smashes: 0, dinks: 0, netPlays: 0 });

/** 累計玩家擊球（只算 team 0） */
export const trackHit = (h: Highlights, e: Extract<GameEvent, { type: 'hit' }>) => {
  if (e.team !== 0) return;
  h.topKmh = Math.max(h.topKmh, Math.round(e.speed * 3.6));
  if (e.special) h.specials += 1;
  if (e.skill) h.skills += 1;
  if (e.kind === 'smash') h.smashes += 1;
  else if (e.kind === 'dink') h.dinks += 1;
  else if (e.kind === 'punch' || e.kind === 'block' || e.kind === 'speedup') h.netPlays += 1;
};

export interface Challenge {
  difficulty: Difficulty;
  /** 挑戰者的比分：[挑戰者, AI] */
  score: [number, number];
  character: string;
  paddle: string;
}

const DIFF_CODE: Record<Difficulty, string> = { rookie: 'r', club: 'c', pro: 'p' };

export const encodeChallenge = (c: Challenge) => [DIFF_CODE[c.difficulty], c.score[0], c.score[1], c.character, c.paddle].join('.');

/** 解不出來或內容不合法就回傳 null（網址可能被截斷或亂改） */
export const decodeChallenge = (raw: string | null): Challenge | null => {
  if (!raw) return null;
  const [d, a, b, character, paddle] = raw.split('.');
  const difficulty = (Object.keys(DIFF_CODE) as Difficulty[]).find((k) => DIFF_CODE[k] === d);
  const s0 = Number(a);
  const s1 = Number(b);
  const okScore = (n: number) => Number.isInteger(n) && n >= 0 && n <= 40;
  if (!difficulty || !okScore(s0) || !okScore(s1) || s0 === s1) return null;
  if (!CHARACTERS.some((c) => c.id === character) || !PADDLES.some((p) => p.id === paddle)) return null;
  return { difficulty, score: [s0, s1], character, paddle };
};

export const challengeUrl = (c: Challenge) => `${window.location.origin}/game/?vs=${encodeChallenge(c)}`;
/** 踢館之旅的分享連結：直接打開地圖 */
export const tourUrl = () => `${window.location.origin}/game/?tour=1`;

/** 輸 3 分以內叫「惜敗」，輸更多就只說「挑戰」，不硬說差一點 */
const lossVerb = (score: [number, number]) => (score[1] - score[0] <= 3 ? '惜敗' : '挑戰');

/** 淨勝分比較：正數 = 你比挑戰者多贏幾分 */
export const compareToChallenge = (c: Challenge, score: [number, number]) => score[0] - score[1] - (c.score[0] - c.score[1]);

/** 挑戰卡標題，分兩行：「阿灰 用 11:3」「打贏高手 AI」 */
export const challengeHeadline = (c: Challenge, name: string): [string, string] => {
  const ai = AI_PROFILES[c.difficulty].label;
  return c.score[0] > c.score[1] ? [`${name} 用 ${c.score[0]}:${c.score[1]}`, `打贏${ai} AI`] : [`${name} 以 ${c.score[0]}:${c.score[1]}`, `${lossVerb(c.score)}${ai} AI`];
};

export interface MatchResult {
  won: boolean;
  score: [number, number];
  difficulty: Difficulty;
  stats: TeamStats;
  longestRally: number;
  highlights: Highlights;
  character: CharacterDef;
  paddle: string;
  /** 踢館之旅打倒 Boss 的戰績（有這欄就畫成踢館卡） */
  tour?: { stage: string; boss: string; stars: number; timeLeft: number };
}

export interface Title {
  name: string;
  line: string;
}

/** 依表現給稱號：由最罕見的成就往下找，第一個符合的就是 */
export const titleFor = (r: MatchResult): Title => {
  const h = r.highlights;
  if (r.tour) {
    const t = r.tour;
    if (t.stars >= 3) return { name: '颱風剋星', line: `剩 ${t.timeLeft} 秒就 K.O. ${t.boss}` };
    if (h.specials + h.skills >= 3) return { name: '逆風必殺王', line: `頂著強風放了 ${h.specials + h.skills} 次必殺` };
    return { name: '踢館成功', line: `在${t.stage}打倒${t.boss}` };
  }
  const diff = r.score[0] - r.score[1];
  if (r.won && r.score[1] === 0) return { name: '完封之王', line: '對手一分都沒拿到' };
  if (h.specials + h.skills >= 4) return { name: '必殺狂熱者', line: `一場放出 ${h.specials + h.skills} 次必殺與絕招` };
  if (h.smashes >= 5) return { name: '殺球機器', line: `整場殺球 ${h.smashes} 次` };
  if (h.netPlays >= 8) return { name: '網前牆壁', line: `網前截擊 ${h.netPlays} 次，什麼都擋回去` };
  if (h.dinks >= 15) return { name: '廚房主廚', line: `放了 ${h.dinks} 顆廚房小球` };
  if (r.longestRally >= 15) return { name: '來回馬拉松', line: `最長一分打了 ${r.longestRally} 拍` };
  if (r.stats.aces >= 3) return { name: '發球機', line: `發球直接得分 ${r.stats.aces} 次` };
  if (r.stats.shots >= 10 && r.stats.perfect / r.stats.shots >= 0.6) return { name: '完美主義者', line: '六成以上擊球打出完美' };
  if (r.won && diff >= 6) return { name: '場上主宰', line: `淨勝 ${diff} 分` };
  if (r.won) return { name: '勝利組', line: '拿下這一場' };
  if (diff >= -2) return { name: '惜敗英雄', line: '只差一口氣' };
  return { name: '越挫越勇', line: '下一場一定討回來' };
};

export const shareText = (r: MatchResult, url: string) => {
  const ai = AI_PROFILES[r.difficulty].label;
  const t = titleFor(r);
  if (r.tour) {
    const stars = '⭐'.repeat(r.tour.stars);
    return `我在 Pickle Master 踢館之旅打倒「${r.tour.boss}」${stars}\n剩 ${r.tour.timeLeft} 秒 K.O.，稱號「${t.name}」\n颱風天也要打球？你也來踢館 👉 ${url}\n#匹克球`;
  }
  const head = r.won
    ? `我在 Pickle Master 用 ${r.score[0]}:${r.score[1]} 打贏${ai} AI 🏆`
    : `我在 Pickle Master 以 ${r.score[0]}:${r.score[1]} ${lossVerb(r.score)}${ai} AI 😤`;
  return `${head}\n稱號「${t.name}」，最快球速 ${r.highlights.topKmh} km/h\n你敢挑戰嗎？👉 ${url}\n#匹克球`;
};

/* ───────────────────────── 分享卡（canvas 1080×1350） ───────────────────────── */

export const CARD_W = 1080;
export const CARD_H = 1350;

const CJK = '"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", "Heiti TC", sans-serif';
const NUM = `Inter, ${CJK}`;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

/** 背景：深色夜場＋透視球場線 */
const drawBackground = (ctx: CanvasRenderingContext2D, won: boolean) => {
  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
  bg.addColorStop(0, '#020617');
  bg.addColorStop(0.55, '#06281f');
  bg.addColorStop(1, '#022c22');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // 兩盞場燈
  for (const [x, y, r] of [
    [140, -40, 520],
    [CARD_W - 120, -60, 560],
  ] as const) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, won ? 'rgba(52,211,153,0.28)' : 'rgba(251,146,60,0.22)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
  }

  // 透視球場（下半部）
  ctx.save();
  const top = 900;
  const bottom = CARD_H + 260;
  const court = ctx.createLinearGradient(0, top, 0, bottom);
  court.addColorStop(0, 'rgba(31,79,154,0)');
  court.addColorStop(1, 'rgba(31,79,154,0.35)');
  ctx.fillStyle = court;
  ctx.beginPath();
  ctx.moveTo(360, top);
  ctx.lineTo(720, top);
  ctx.lineTo(1080 + 200, bottom);
  ctx.lineTo(-200, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 3;
  ctx.stroke();
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  // 廚房線與中線
  for (const t of [0.32, 0.62]) {
    const y = lerp(top, bottom, t);
    ctx.beginPath();
    ctx.moveTo(lerp(360, -200, t), y);
    ctx.lineTo(lerp(720, 1280, t), y);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(540, lerp(top, bottom, 0.32));
  ctx.lineTo(540, bottom);
  ctx.stroke();
  ctx.restore();

  // 細網點質感
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let y = 12; y < CARD_H; y += 24) for (let x = 12; x < CARD_W; x += 24) ctx.fillRect(x, y, 2, 2);
};

/** 角色半身像：右側、底部與左緣淡出 */
const drawPortrait = async (ctx: CanvasRenderingContext2D, c: CharacterDef) => {
  const W = 640;
  const H = 670;
  const x = CARD_W - W + 30;
  const y = 170;
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const o = off.getContext('2d');
  if (!o) return;
  const img = c.portrait ? await loadImage(c.portrait) : null;
  if (img) {
    const s = Math.min(W / img.width, H / img.height);
    o.drawImage(img, (W - img.width * s) / 2, H - img.height * s, img.width * s, img.height * s);
  } else {
    // 沒有照片的預設選手：球衣色塊＋號碼
    const jx = W * 0.4;
    const jw = W * 0.5;
    const jg = o.createLinearGradient(0, H * 0.3, 0, H);
    jg.addColorStop(0, c.shirt);
    jg.addColorStop(1, `${c.shirt}66`);
    o.fillStyle = jg;
    o.beginPath();
    o.roundRect(jx, H * 0.3, jw, H * 0.75, [jw * 0.45, jw * 0.45, 0, 0]);
    o.fill();
    o.fillStyle = 'rgba(255,255,255,0.9)';
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.font = `800 30px ${NUM}`;
    o.letterSpacing = '6px';
    o.fillText(c.jersey, jx + jw / 2, H * 0.44);
    o.letterSpacing = '0px';
    o.font = `900 220px ${NUM}`;
    o.fillText(c.number, jx + jw / 2, H * 0.64);
  }
  // 橢圓淡出，藏掉去背照片轉正後的斜邊（比選角卡收得更緊，大圖上斜邊比較明顯）
  o.globalCompositeOperation = 'destination-in';
  const rx = W * 0.64;
  const ry = H * 0.7;
  o.save();
  o.translate(W * 0.5, H * 0.4);
  o.scale(1, ry / rx);
  const m = o.createRadialGradient(0, 0, 0, 0, 0, rx);
  m.addColorStop(0, 'rgba(0,0,0,1)');
  m.addColorStop(0.48, 'rgba(0,0,0,1)');
  m.addColorStop(1, 'rgba(0,0,0,0)');
  o.fillStyle = m;
  o.fillRect(-W, -H * 2, W * 2, H * 4);
  o.restore();
  // 下緣再淡出一次：有些照片轉正後的斜邊落在胸口以下
  const fade = o.createLinearGradient(0, H * 0.6, 0, H * 0.9);
  fade.addColorStop(0, 'rgba(0,0,0,1)');
  fade.addColorStop(1, 'rgba(0,0,0,0)');
  o.fillStyle = fade;
  o.fillRect(0, 0, W, H);
  ctx.drawImage(off, x, y);
};

const fitFont = (ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, family: string, maxW: number) => {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (s > 20 && ctx.measureText(text).width > maxW) {
    s -= 4;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
};

export const drawShareCard = async (r: MatchResult): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  try {
    await Promise.all([document.fonts.load(`900 200px Inter`), document.fonts.load(`800 40px Inter`)]);
  } catch {
    /* 字型載不到就用系統字 */
  }

  const accent = r.won ? '#34d399' : '#fb923c';
  const accentSoft = r.won ? '#a7f3d0' : '#fed7aa';
  const ai = AI_PROFILES[r.difficulty];
  const paddle = paddleById(r.paddle);
  const t = titleFor(r);
  const pad = 80;

  drawBackground(ctx, r.won);

  // 背景大字 WIN / LOSS
  ctx.save();
  ctx.font = `italic 900 400px ${NUM}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = r.won ? 'rgba(52,211,153,0.07)' : 'rgba(251,146,60,0.07)';
  ctx.fillText(r.won ? 'WIN' : 'LOSS', 30, 640);
  ctx.restore();

  await drawPortrait(ctx, r.character);

  // 頂部：品牌
  ctx.textBaseline = 'middle';
  roundRect(ctx, pad, 72, 330, 56, 28);
  ctx.fillStyle = 'rgba(52,211,153,0.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(110,231,183,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#6ee7b7';
  ctx.font = `800 24px ${NUM}`;
  ctx.letterSpacing = '6px';
  ctx.fillText('PICKLE MASTER', pad + 28, 101);
  ctx.letterSpacing = '0px';

  // 勝負
  ctx.fillStyle = accent;
  ctx.font = `800 30px ${NUM}`;
  ctx.letterSpacing = '8px';
  const tour = r.tour;
  ctx.fillText(tour ? 'K.O.!' : r.won ? 'VICTORY' : lossVerb(r.score) === '惜敗' ? 'SO CLOSE' : 'GAME OVER', pad, 210);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 72px ${CJK}`;
  if (tour) fitFont(ctx, `踢館成功：${tour.boss}`, 900, 72, CJK, 560);
  ctx.fillText(tour ? `踢館成功：${tour.boss}` : r.won ? `擊敗${ai.label} AI` : `${lossVerb(r.score)}${ai.label} AI`, pad, 290);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `600 30px ${tour ? CJK : NUM}`;
  ctx.fillText(tour ? `踢館之旅・${tour.stage}` : `對手程度 ${ai.rating}`, pad, 352);

  // 比分（踢館卡改畫三顆星＋剩餘秒數）
  // 兩位數對兩位數（11:10）會變很寬，縮字避免壓到選手的臉
  ctx.textBaseline = 'alphabetic';
  if (tour) {
    ctx.font = `900 150px ${CJK}`;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < tour.stars ? '#fbbf24' : 'rgba(255,255,255,0.14)';
      ctx.shadowColor = i < tour.stars ? 'rgba(251,191,36,0.6)' : 'transparent';
      ctx.shadowBlur = i < tour.stars ? 40 : 0;
      ctx.fillText('★', pad - 6 + i * 140, 560);
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 40px ${CJK}`;
    ctx.fillText(`剩 ${tour.timeLeft} 秒 K.O.`, pad, 630);
  }
  const s0 = String(r.score[0]);
  const s1 = String(r.score[1]);
  if (!tour) {
    const big = fitFont(ctx, `${s0}${s1}`, 900, 250, NUM, 420);
    const k = big / 250;
    const w0 = ctx.measureText(s0).width;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = r.won ? 'rgba(52,211,153,0.45)' : 'rgba(251,146,60,0.4)';
    ctx.shadowBlur = 60;
    ctx.fillText(s0, pad - 8, 620);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = `900 ${Math.round(150 * k)}px ${NUM}`;
    ctx.fillText(':', pad + w0 + 10 * k, 620 - 30 * k);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `900 ${big}px ${NUM}`;
    ctx.fillText(s1, pad + w0 + 80 * k, 620);
  }

  // 選手名牌
  ctx.textBaseline = 'middle';
  const nameY = 700;
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 50px ${CJK}`;
  ctx.fillText(r.character.name, pad, nameY);
  const nw = ctx.measureText(r.character.name).width;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `600 30px ${CJK}`;
  ctx.fillText(`${r.character.title}・${paddle.name}拍`, pad + nw + 20, nameY + 4);

  // 稱號
  const ty = 770;
  const th = 150;
  const tw = CARD_W - pad * 2;
  ctx.save();
  roundRect(ctx, pad, ty, tw, th, 32);
  const tg = ctx.createLinearGradient(pad, 0, pad + tw, 0);
  tg.addColorStop(0, r.won ? 'rgba(16,185,129,0.32)' : 'rgba(249,115,22,0.3)');
  tg.addColorStop(1, 'rgba(15,23,42,0.55)');
  ctx.fillStyle = tg;
  ctx.fill();
  ctx.strokeStyle = r.won ? 'rgba(110,231,183,0.45)' : 'rgba(253,186,116,0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = accentSoft;
  ctx.font = `800 24px ${NUM}`;
  ctx.letterSpacing = '6px';
  ctx.fillText('本場稱號', pad + 40, ty + 44);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = '#ffffff';
  const titleText = `「${t.name}」`;
  fitFont(ctx, titleText, 900, 60, CJK, 420);
  ctx.fillText(titleText, pad + 22, ty + 102);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  fitFont(ctx, t.line, 600, 30, CJK, tw - 520);
  ctx.textAlign = 'right';
  ctx.fillText(t.line, pad + tw - 40, ty + 102);
  ctx.textAlign = 'left';

  // 亮點數據
  const sp = r.highlights.specials + r.highlights.skills;
  const accuracy = r.stats.shots ? Math.round((r.stats.perfect / r.stats.shots) * 100) : 0;
  const cells: [string, string, string][] = [
    ['最快球速', String(r.highlights.topKmh), 'km/h'],
    ['最長來回', String(r.longestRally), '拍'],
    sp > 0 ? ['必殺・絕招', String(sp), '次'] : ['致勝球', String(r.stats.winners), '球'],
    ['完美擊球', String(accuracy), '%'],
  ];
  const cy = 950;
  const gap = 20;
  const cw = (tw - gap * 3) / 4;
  const ch = 170;
  // 數字統一字級：三位數球速（120 km/h）放不下時，四格一起縮
  const valueSize = Math.min(
    ...cells.map(([, value, unit]) => {
      ctx.font = `700 24px ${NUM}`;
      return fitFont(ctx, value, 900, 76, NUM, cw - 52 - ctx.measureText(unit).width);
    }),
  );
  cells.forEach(([label, value, unit], i) => {
    const x = pad + i * (cw + gap);
    roundRect(ctx, x, cy, cw, ch, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 26px ${CJK}`;
    ctx.fillText(label, x + 26, cy + 42);
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${valueSize}px ${NUM}`;
    ctx.fillText(value, x + 24, cy + 138);
    const vw = ctx.measureText(value).width;
    ctx.fillStyle = accentSoft;
    ctx.font = `700 24px ${NUM}`;
    ctx.fillText(unit, x + 34 + vw, cy + 136);
    ctx.textBaseline = 'middle';
  });

  // 底部：挑戰呼籲＋網址
  const fy = 1180;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, fy);
  ctx.lineTo(CARD_W - pad, fy);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 46px ${CJK}`;
  ctx.fillText(tour ? '你也來踢館？' : '你敢挑戰嗎？', pad, fy + 70);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `600 28px ${NUM}`;
  ctx.fillText('picklemastertw.com/game・免下載直接玩', pad, fy + 122);
  // #匹克球 標籤
  ctx.font = `900 34px ${CJK}`;
  const tag = '#匹克球';
  const tagW = ctx.measureText(tag).width + 56;
  roundRect(ctx, CARD_W - pad - tagW, fy + 62, tagW, 72, 36);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.fillStyle = r.won ? '#022c22' : '#431407';
  ctx.textAlign = 'center';
  ctx.fillText(tag, CARD_W - pad - tagW / 2, fy + 99);
  ctx.textAlign = 'left';

  // 必殺技名（有放過才顯示），放在名牌上方右側不擋臉的位置
  if (r.highlights.specials > 0) {
    const name = SPECIALS[paddle.special].name;
    ctx.font = `italic 900 30px ${CJK}`;
    const w = ctx.measureText(name).width + 44;
    roundRect(ctx, CARD_W - pad - w, 700 - 26, w, 52, 26);
    ctx.fillStyle = 'rgba(2,6,23,0.7)';
    ctx.fill();
    ctx.fillStyle = SPECIALS[paddle.special].color;
    ctx.textAlign = 'center';
    ctx.fillText(name, CARD_W - pad - w / 2, 701);
    ctx.textAlign = 'left';
  }

  return canvas;
};

export const canvasToFile = (canvas: HTMLCanvasElement) =>
  new Promise<File | null>((resolve) =>
    canvas.toBlob((b) => resolve(b ? new File([b], 'pickle-master-result.png', { type: 'image/png' }) : null), 'image/png'),
  );
