import { Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { GameEngine } from './engine/game';
import { AthleteModel } from './scene/AthleteModel';
import { headHeights, lookFromCharacter } from './scene/characterData';
import { ARCHETYPE_COLOR, CHARACTERS, type CharacterDef, type Stats } from './characters';
import { BACKHAND_HINT, BACKHAND_LABEL, GRIP_HINT, GRIP_LABEL } from './engine/technique';
import { SKILLS } from './engine/skills';

/** 去背半身像的四角與底部淡出：藏掉轉正後的斜邊與去背邊緣的小瑕疵 */
const FADE = {
  WebkitMaskImage: 'radial-gradient(ellipse 72% 78% at 50% 38%, #000 58%, transparent 100%)',
  maskImage: 'radial-gradient(ellipse 72% 78% at 50% 38%, #000 58%, transparent 100%)',
} as const;

/** 沒有照片的預設選手：用球衣色塊＋號碼代替 */
const Placeholder = ({ c, big }: { c: CharacterDef; big?: boolean }) => (
  <div className="flex h-full w-full items-end justify-center">
    <div
      className={`flex items-center justify-center rounded-t-[45%] font-display font-black text-white/90 ${big ? 'h-[70%] w-[62%] text-7xl' : 'h-[68%] w-[64%] text-3xl'}`}
      style={{ background: `linear-gradient(180deg, ${c.shirt}, ${c.shirt}cc)` }}
    >
      {c.number}
    </div>
  </div>
);

const Portrait = ({ c, big }: { c: CharacterDef; big?: boolean }) =>
  c.portrait ? (
    <img src={c.portrait} alt={c.name} className="h-full w-full object-contain object-bottom" style={FADE} draggable={false} />
  ) : (
    <Placeholder c={c} big={big} />
  );

/** 選手的頭會看球：預覽時把「球」放在鏡頭位置，選手就一直看著你 */
const LookAtCamera = ({ engine, id }: { engine: GameEngine; id: string }) => {
  useFrame(({ camera, controls }) => {
    // 取景跟著角色身高：鏡頭和環繞中心都以頭骨高度為準（照片角色的頭骨約 1.6 m）
    const head = headHeights.get(id) ?? 1.6;
    const orbit = controls as unknown as { target: { y: number } } | null;
    if (orbit && Math.abs(orbit.target.y - (head - 0.24)) > 0.001) {
      camera.position.y += head - 0.24 - orbit.target.y;
      orbit.target.y = head - 0.24;
    }
    engine.ball.pos.x = camera.position.x;
    engine.ball.pos.y = camera.position.y;
    engine.ball.pos.z = camera.position.z;
  });
  return null;
};

/**
 * 3D 半身預覽：把選中角色的臉與配色套在真正的比賽模型上，可拖曳旋轉。
 * 用一個不推進的引擎當資料來源，選手就停在準備姿勢。
 */
const Preview3D = ({ c }: { c: CharacterDef }) => {
  const engine = useMemo(() => new GameEngine({ mode: 'match', difficulty: 'rookie', assist: false, specials: false }), []);
  const look = useMemo(() => lookFromCharacter(c), [c]);
  const p = engine.human.pos;
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [p.x + 0.15, 1.46, p.z - 1.15], fov: 30 }} gl={{ alpha: true, antialias: true }}>
      {/* 正面柔光＋側面輪廓光，臉要看得清楚 */}
      <hemisphereLight args={['#ffffff', '#4b5563', 1.9]} />
      <directionalLight position={[p.x + 0.6, 2.2, p.z - 2.5]} intensity={4.2} />
      <directionalLight position={[p.x - 1.5, 2, p.z - 1]} intensity={1.4} color="#ffe6cc" />
      <directionalLight position={[p.x - 1, 2.2, p.z + 2]} intensity={1.6} color="#9ad8ff" />
      <LookAtCamera engine={engine} id={c.id} />
      <Suspense fallback={null}>
        <AthleteModel key={c.id} engine={engine} index={0} look={look} trackTip={false} />
      </Suspense>
      <OrbitControls makeDefault target={[p.x, 1.36, p.z]} enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.2} minPolarAngle={1.1} maxPolarAngle={1.9} />
    </Canvas>
  );
};

interface Props {
  value: string;
  /** 雙打挑隊友：標題與按鈕文字不同，自己選的那位不能再選 */
  partner?: boolean;
  exclude?: string;
  onChange: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const STAT_ROWS: { key: keyof Stats; label: string; color: string }[] = [
  { key: 'speed', label: '速度', color: '#38bdf8' },
  { key: 'power', label: '力量', color: '#f97316' },
  { key: 'control', label: '控球', color: '#34d399' },
  { key: 'reach', label: '觸及', color: '#c084fc' },
];

/** 素質條：五格，像格鬥遊戲的能力值 */
const StatBars = ({ stats, compact = false }: { stats: Stats; compact?: boolean }) => (
  <div className={`grid gap-x-3 ${compact ? 'grid-cols-2 gap-y-1' : 'grid-cols-1 gap-y-1.5'}`}>
    {STAT_ROWS.map((r) => (
      <div key={r.key} className="flex items-center gap-2">
        <span className="w-7 shrink-0 text-[11px] font-bold text-white/70">{r.label}</span>
        <div className="flex flex-1 gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.span
              key={n}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: n * 0.03 }}
              className="h-2 flex-1 origin-left -skew-x-12 rounded-[1px]"
              style={{ background: n <= stats[r.key] ? r.color : 'rgba(255,255,255,0.12)' }}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

/** 一句話講這個角色的打法（由素質推出來） */
const playstyle = (st: Stats) => {
  const top = STAT_ROWS.reduce((a, b) => (st[b.key] > st[a.key] ? b : a));
  const low = STAT_ROWS.reduce((a, b) => (st[b.key] < st[a.key] ? b : a));
  if (st[top.key] === st[low.key]) return '樣樣都有，沒有明顯弱點';
  const good: Record<keyof Stats, string> = { speed: '跑得快、救得到', power: '球速快、殺球狠', control: '失誤少、落點準', reach: '手長、網前攔得到' };
  const bad: Record<keyof Stats, string> = { speed: '移動比較慢', power: '殺球沒那麼重', control: '容易打出界', reach: '要靠腳步補位' };
  return `${good[top.key]}，但${bad[low.key]}`;
};

/** 下方的選手欄位（大亂鬥那種）：大名字、類型、素質條、絕招 */
const PlayerSlot = ({ c, tag, tagColor, locked = false }: { c: CharacterDef; tag: string; tagColor: string; locked?: boolean }) => {
  const color = ARCHETYPE_COLOR[c.archetype];
  return (
    <motion.div
      key={c.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="relative flex min-h-[10.5rem] overflow-hidden rounded-2xl border-2 bg-slate-950/80"
      style={{ borderColor: `${color}aa`, background: `linear-gradient(115deg, ${c.shirt}55 0%, #070a12 55%)` }}
    >
      {/* 半身像：靠左、溢出底部，像格鬥遊戲的選手卡 */}
      <div className="relative w-[38%] shrink-0">
        <div className="absolute inset-x-0 -bottom-2 top-1">
          <Portrait c={c} big />
        </div>
        <span className="absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[11px] font-black text-white shadow" style={{ background: tagColor }}>
          {tag}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-3 pr-3">
        <div className="flex items-center gap-1.5">
          <span className="rounded px-1.5 py-0.5 text-[10px] font-black text-slate-950" style={{ background: color }}>
            {c.archetype}
          </span>
          {/* 技術風格：握拍與反手 */}
          <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-white" title={GRIP_HINT[c.grip]}>
            {GRIP_LABEL[c.grip]}握拍
          </span>
          <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-white" title={BACKHAND_HINT[c.backhand]}>
            {BACKHAND_LABEL[c.backhand]}
          </span>
          {locked && <span className="text-[10px] font-bold text-white/50">已選</span>}
        </div>
        <div className="truncate font-display text-3xl font-black italic leading-none text-white md:text-4xl" style={{ textShadow: `3px 3px 0 ${color}66` }}>
          {c.name}
        </div>
        <div className="truncate text-[11px] font-semibold text-white/60">{playstyle(c.stats)}</div>
        <div className="truncate text-[10px] text-white/50">
          {GRIP_HINT[c.grip]}；{BACKHAND_HINT[c.backhand]}
        </div>
        <StatBars stats={c.stats} />
        {c.skill && (
          <div className="truncate text-[11px] font-bold" style={{ color: SKILLS[c.skill].color }}>
            絕招・{SKILLS[c.skill].name}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const CharacterSelect = ({ value, partner = false, exclude, onChange, onBack, onNext }: Props) => {
  const sel = CHARACTERS.find((c) => c.id === value && c.id !== exclude) ?? CHARACTERS.find((c) => c.id !== exclude) ?? CHARACTERS[0];
  const mine = exclude ? CHARACTERS.find((c) => c.id === exclude) : undefined;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 overflow-y-auto overscroll-contain bg-slate-950 p-3 md:p-6"
    >
      {/* 背景：斜向光帶 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `repeating-linear-gradient(115deg, transparent 0 46px, rgba(255,255,255,0.025) 46px 92px), radial-gradient(circle at 20% 110%, ${sel.shirt}55, transparent 55%), radial-gradient(circle at 90% -10%, #1e3a8a66, transparent 50%)`,
        }}
      />
      <div className="relative mx-auto flex min-h-full max-w-4xl flex-col">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] font-black italic tracking-[0.3em] text-emerald-300">{partner ? 'CHOOSE YOUR PARTNER' : 'CHOOSE YOUR PLAYER'}</div>
            <h2 className="font-display text-2xl font-black italic text-white md:text-4xl">{partner ? '選擇你的隊友' : '選擇你的選手'}</h2>
          </div>
          <div className="hidden text-right text-[11px] text-white/50 md:block">每位素質總和一樣，只是分配不同</div>
        </div>

        {/* 角色格子（大亂鬥風）：方格頭像、底部名字、依類型上色 */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 md:grid-cols-6 md:gap-2">
          {CHARACTERS.map((c, i) => {
            const on = c.id === sel.id;
            const taken = c.id === exclude;
            const color = ARCHETYPE_COLOR[c.archetype];
            return (
              <motion.button
                key={c.id}
                type="button"
                disabled={taken}
                onClick={() => onChange(c.id)}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: on ? 1.04 : 1 }}
                transition={{ delay: i * 0.02, type: 'spring', stiffness: 500, damping: 30 }}
                whileTap={{ scale: 0.95 }}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg border-2 text-left disabled:cursor-not-allowed"
                style={{
                  borderColor: on ? '#ef4444' : taken ? '#64748b' : `${color}66`,
                  background: `linear-gradient(160deg, ${c.shirt}66, #0b1020 70%)`,
                  boxShadow: on ? '0 0 0 2px #fff inset, 0 0 18px rgba(239,68,68,0.6)' : undefined,
                }}
              >
                <div className={`absolute inset-x-0 bottom-4 top-0 transition-transform duration-300 group-hover:scale-110 ${taken ? 'grayscale' : ''}`}>
                  <Portrait c={c} />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex h-5 items-center justify-center text-[11px] font-black text-white" style={{ background: `${color}cc` }}>
                  <span className="truncate px-1 drop-shadow">{c.name}</span>
                </div>
                {/* 游標標記：1P（你）／CPU（隊友） */}
                {on && (
                  <motion.span
                    layoutId="cursor"
                    className="absolute right-1 top-1 rounded-full px-1.5 text-[10px] font-black text-white shadow"
                    style={{ background: partner ? '#3b82f6' : '#ef4444' }}
                  >
                    {partner ? 'CPU' : '1P'}
                  </motion.span>
                )}
                {taken && <span className="absolute right-1 top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">1P</span>}
              </motion.button>
            );
          })}
        </div>

        {/* 選手欄位 */}
        <div className={`mt-3 grid gap-2 ${mine ? 'md:grid-cols-2' : ''}`}>
          {mine && <PlayerSlot c={mine} tag="1P 你" tagColor="#ef4444" locked />}
          <div className="relative">
            <PlayerSlot c={sel} tag={partner ? 'CPU 隊友' : '1P 你'} tagColor={partner ? '#3b82f6' : '#ef4444'} />
            {!mine && (
              <div className="absolute bottom-2 right-2 hidden h-28 w-24 overflow-hidden rounded-xl border border-white/15 bg-slate-950/60 md:block">
                <Preview3D c={sel} />
              </div>
            )}
          </div>
        </div>

        <div className="sticky -bottom-3 z-10 -mx-3 mt-auto grid grid-cols-[auto_1fr] gap-2 border-t border-white/10 bg-slate-950/95 px-3 pb-3 pt-3 backdrop-blur-md md:-bottom-6 md:-mx-6 md:px-6">
          <button type="button" onClick={onBack} className="rounded-2xl bg-white/10 px-5 py-3.5 font-bold text-white hover:bg-white/15">
            ← 返回
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 py-3.5 text-lg font-black italic text-white shadow-xl shadow-red-500/30"
          >
            {partner ? `和「${sel.name}」搭檔 → 挑球拍` : `就決定是「${sel.name}」 → 挑球拍`}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
