import { AnimatePresence, motion } from 'framer-motion';
import { GameEngine, type HudState } from './engine/game';
import { type Difficulty, AI_PROFILES } from './engine/ai';
import { type AttackKind, type ShotKind, SHOT_LABEL } from './engine/shots';
import { SPECIALS } from './engine/paddles';
import { SKILLS } from './engine/skills';
import { CutIn, type CutInInfo } from './CutIn';
import { ReviewOverlay } from './ReviewOverlay';

export interface Toast {
  id: number;
  text: string;
  sub?: string;
  tone: 'perfect' | 'good' | 'off' | 'plain' | 'special';
  /** 連續完美擊球數 */
  streak?: number;
  /** 打出進攻球（殺球／推擋截擊／突擊）時才有，顯示大字戳章 */
  kind?: ShotKind;
  /** 飛身撲接救回來的 */
  dive?: boolean;
}

/** 機會球提示與進攻戳章的文字與配色 */
const ATTACK: Record<AttackKind, { cue: string; stamp: string; glow: string; text: string; chip: string }> = {
  smash: { cue: '殺球機會', stamp: 'SMASH!', glow: 'rgba(239,68,68,0.85)', text: 'text-amber-300', chip: 'from-amber-300 to-red-500' },
  punch: { cue: '截擊機會', stamp: '攔截！', glow: 'rgba(251,146,60,0.85)', text: 'text-orange-300', chip: 'from-orange-300 to-orange-500' },
  speedup: { cue: '突擊機會', stamp: '突擊！', glow: 'rgba(244,63,94,0.85)', text: 'text-rose-300', chip: 'from-rose-300 to-rose-500' },
};

const isAttack = (k: ShotKind | null | undefined): k is AttackKind => k === 'smash' || k === 'punch' || k === 'speedup';

/** 機會球提示：告訴玩家「現在按抽球鍵就是殺球／截擊／突擊」；已經按著就顯示就緒 */
const ChanceCue = ({ kind, ready, touch }: { kind: AttackKind; ready: boolean; touch: boolean }) => (
  <motion.div
    initial={{ opacity: 0, scale: 1.5 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ type: 'spring', stiffness: 520, damping: 20 }}
    className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1.5 font-black text-slate-950 shadow-lg md:px-4 ${ATTACK[kind].chip} ${ready ? '' : 'animate-pulse'}`}
    style={{ boxShadow: `0 0 22px ${ATTACK[kind].glow}` }}
  >
    <span className="text-sm italic md:text-lg">{ATTACK[kind].cue}！</span>
    <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-xs text-white">
      {ready ? '就緒 · 自動出手' : touch ? '按「抽」' : '按 K'}
    </span>
  </motion.div>
);

/** 撲接提示：跑不到了，但撲得到 */
const DiveCue = ({ touch }: { touch: boolean }) => (
  <motion.div
    initial={{ opacity: 0, scale: 1.5, x: -12 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ type: 'spring', stiffness: 560, damping: 20 }}
    className="flex animate-pulse items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-200 to-sky-500 px-3 py-1.5 font-black text-slate-950 shadow-lg md:px-4"
    style={{ boxShadow: '0 0 22px rgba(34,211,238,0.85)' }}
  >
    <span className="text-sm italic md:text-lg">跑不到！撲過去</span>
    <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-xs text-white">{touch ? '點「撲」' : '按 Shift'}</span>
  </motion.div>
);

export interface PointCard {
  id: number;
  won: boolean;
  title: string;
  lesson: string | null;
  headline: string;
  call: string;
}

const TONE: Record<Toast['tone'], string> = {
  perfect: 'from-amber-300 to-yellow-500 text-amber-950',
  good: 'from-emerald-300 to-teal-500 text-emerald-950',
  off: 'from-orange-300 to-orange-500 text-orange-950',
  plain: 'from-white to-slate-200 text-slate-800',
  special: 'from-fuchsia-400 via-rose-500 to-orange-400 text-white',
};

const ServeDot = ({ on }: { on: boolean }) => (
  <span
    className={`inline-block h-2.5 w-2.5 rounded-full transition-colors ${on ? 'bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.9)]' : 'bg-white/15'}`}
    aria-hidden
  />
);

const Scoreboard = ({ hud, difficulty, best, oppName }: { hud: HudState; difficulty: Difficulty; best: number; oppName: string }) => {
  if (hud.mode === 'dink') {
    return (
      <div className="rounded-2xl border border-white/15 bg-slate-950/70 px-5 py-2.5 text-center text-white shadow-xl backdrop-blur-md">
        <div className="text-[11px] font-semibold tracking-[0.2em] text-emerald-300">DINK 挑戰</div>
        <div className="flex items-baseline justify-center gap-3">
          <motion.span key={hud.dinkStreak} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-3xl font-black tabular-nums">
            {hud.dinkStreak}
          </motion.span>
          <span className="text-xs text-white/60">最佳 {best}</span>
        </div>
      </div>
    );
  }
  const opp = hud.energy[1];
  return (
    <div className="rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-2 text-white shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ServeDot on={hud.serving === 0} />
          <span className="text-xs font-semibold text-emerald-300">你</span>
          <motion.span key={`p${hud.score[0]}`} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-7 text-center text-3xl font-black tabular-nums">
            {hud.score[0]}
          </motion.span>
        </div>
        <span className="text-white/30">:</span>
        <div className="flex items-center gap-2">
          <motion.span key={`o${hud.score[1]}`} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-7 text-center text-3xl font-black tabular-nums">
            {hud.score[1]}
          </motion.span>
          <span className="text-xs font-semibold text-orange-300">
            {oppName}
            <span className="ml-1 text-[10px] font-normal text-white/50">{AI_PROFILES[difficulty].label}</span>
          </span>
          <ServeDot on={hud.serving === 1} />
        </div>
      </div>
      <div className="mt-0.5 text-center text-[11px] text-white/60">
        報分 <span className="font-bold text-white tabular-nums">{hud.call}</span> · {hud.fromRight ? '右區' : '左區'}發球
        {hud.phase === 'rally' && hud.rallyHits > 2 && <span className="ml-1.5 text-lime-300">· 第 {hud.rallyHits} 拍</span>}
      </div>
      {hud.specials && (
        <div className="mt-1.5 flex items-center gap-2" title="對手的必殺能量">
          <span className="text-[10px] font-bold" style={{ color: SPECIALS[hud.oppSpecial].color }}>
            對手必殺
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${opp >= 100 ? 'animate-pulse' : ''}`}
              style={{ width: `${opp}%`, background: SPECIALS[hud.oppSpecial].color }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/** 必殺能量條：滿了發光提示，蓄勢後整條燃燒 */
const EnergyBar = ({ hud, touch }: { hud: HudState; touch: boolean }) => {
  const sp = SPECIALS[hud.special];
  const e = hud.energy[0];
  const full = e >= 100;
  return (
    <div
      className={`w-56 rounded-2xl border px-3 py-2 backdrop-blur-md transition-shadow ${
        hud.armed ? 'border-white/60 bg-slate-950/80' : full ? 'border-white/30 bg-slate-950/70' : 'border-white/10 bg-slate-950/60'
      }`}
      style={full ? { boxShadow: `0 0 ${hud.armed ? 34 : 18}px ${sp.color}` } : undefined}
    >
      <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
        <span style={{ color: full ? sp.glow : 'rgba(255,255,255,0.7)' }}>{hud.armed ? `蓄勢！${sp.name}` : `必殺・${sp.name}`}</span>
        <span className="tabular-nums text-white/60">{Math.floor(e)}%</span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ${full ? 'animate-pulse' : ''}`}
          style={{ width: `${e}%`, background: `linear-gradient(90deg, ${sp.glow}, ${sp.color})` }}
        />
        {[25, 50, 75].map((x) => (
          <div key={x} className="absolute inset-y-0 w-px bg-slate-950/70" style={{ left: `${x}%` }} />
        ))}
      </div>
      {full && (
        <div className="mt-1 text-[11px] font-semibold text-white/85">
          {hud.armed ? '下一拍放出必殺！' : touch ? '點「必殺」蓄勢' : '按 空白鍵 蓄勢'}
        </div>
      )}
    </div>
  );
};

/** 角色絕招：可用／就緒／充能中（打完 4 分再充好） */
const SkillChip = ({ hud, touch }: { hud: HudState; touch: boolean }) => {
  if (!hud.skill) return null;
  const sk = SKILLS[hud.skill];
  const on = hud.skillReady;
  return (
    <div
      className={`mt-2 w-56 rounded-2xl border px-3 py-1.5 text-[11px] font-bold backdrop-blur-md transition-shadow ${
        hud.skillArmed ? 'border-white/60 bg-slate-950/80' : on ? 'border-white/25 bg-slate-950/65' : 'border-white/10 bg-slate-950/50'
      }`}
      style={on ? { boxShadow: `0 0 ${hud.skillArmed ? 30 : 12}px ${sk.color}` } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate" style={{ color: on ? sk.glow : 'rgba(255,255,255,0.45)' }}>
          絕招・{sk.name}
        </span>
        <span className="shrink-0 text-white/60">{hud.skillArmed ? '就緒！' : on ? (touch ? '點「絕招」' : '按 U') : '充能中'}</span>
      </div>
    </div>
  );
};

/** 發球力道條：綠色區間內才會進，越接近上緣越深 */
const ServeMeter = ({ power }: { power: number }) => {
  const win = GameEngine.serveWindow();
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[11px] font-bold tracking-wider text-white/80">力道</span>
      <div className="relative h-44 w-5 overflow-hidden rounded-full border border-white/25 bg-slate-950/70">
        <div className="absolute inset-x-0 bg-emerald-400/45" style={{ bottom: `${win.lo * 100}%`, top: `${(1 - win.hi) * 100}%` }} />
        <div className="absolute inset-x-0 bg-lime-300/70" style={{ bottom: `${(win.hi - 0.14) * 100}%`, top: `${(1 - win.hi) * 100}%` }} />
        <div className="absolute inset-x-0 h-1.5 -translate-y-1/2 bg-white shadow-[0_0_8px_white]" style={{ bottom: `${power * 100}%` }} />
      </div>
      <span className="text-[10px] text-white/60">深＝好</span>
    </div>
  );
};

const ChargeBar = ({ charge, kind }: { charge: number; kind: HudState['aimKind'] }) => (
  <div className="flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1.5 backdrop-blur-md">
    <span className="text-xs font-bold text-white">{kind ? SHOT_LABEL[kind] : '蓄力'}</span>
    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/15">
      <div className="h-full rounded-full bg-gradient-to-r from-sky-300 via-amber-300 to-red-500" style={{ width: `${charge * 100}%` }} />
    </div>
  </div>
);

interface HudProps {
  hud: HudState;
  difficulty: Difficulty;
  best: number;
  toasts: Toast[];
  aiToast: Toast | null;
  banner: { id: number; text: string } | null;
  card: PointCard | null;
  cutIn: CutInInfo | null;
  oppName: string;
  touch: boolean;
  onChallenge: () => void;
  onAccept: () => void;
}

export const GameHud = ({ hud, difficulty, best, toasts, aiToast, banner, card, cutIn, touch, oppName, onChallenge, onAccept }: HudProps) => {
  const humanServing = hud.phase === 'serve' && hud.serving === 0 && hud.mode === 'match';
  // 判決重播時收起比分和能量條，畫面留給轉播
  const replay = hud.review?.state === 'reviewing' ? 'opacity-0' : '';
  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      <div className={`absolute inset-x-0 top-3 flex justify-center transition-opacity max-md:justify-start max-md:pl-3 ${replay}`}>
        <Scoreboard hud={hud} difficulty={difficulty} best={best} oppName={oppName} />
      </div>

      {/* 手機上能量改顯示在招式鍵的外圈，不再佔左上角；判決剩餘次數在申請時的提示裡也看得到 */}
      {hud.specials && !touch && (
        <div className={`absolute bottom-4 left-3 transition-opacity ${replay}`}>
          <EnergyBar hud={hud} touch={touch} />
          <SkillChip hud={hud} touch={touch} />
          {hud.mode === 'match' && (
            <div className="mt-1.5 flex w-56 items-center justify-between rounded-xl bg-slate-950/50 px-3 py-1 text-[11px] font-bold text-white/70 backdrop-blur-md">
              <span>電視輔助判決</span>
              <span className="tracking-widest text-amber-300">
                {'●'.repeat(hud.challenges[0])}
                <span className="text-white/25">{'●'.repeat(Math.max(0, 2 - hud.challenges[0]))}</span>
              </span>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {aiToast && (
          <motion.div
            key={aiToast.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute right-3 top-20 rounded-lg bg-slate-950/60 px-2.5 py-1 text-xs text-orange-200 backdrop-blur-md max-md:top-44"
          >
            {aiToast.text}
            {aiToast.sub && <span className="ml-1.5 text-white/50">{aiToast.sub}</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 玩家擊球回饋 */}
      <div className="absolute inset-x-0 top-[38%] flex justify-center">
        <AnimatePresence>
          {toasts.slice(-1).map((t) =>
            t.dive ? (
              // 飛身撲接救回來：漫畫風大字
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 2.8, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 4 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{ type: 'spring', stiffness: 540, damping: 15 }}
                className="flex flex-col items-center"
              >
                <span
                  className="font-display text-5xl font-black italic tracking-tight text-cyan-200 md:text-6xl"
                  style={{ textShadow: '0 0 22px rgba(34,211,238,0.9), 3px 3px 0 #000, -1px -1px 0 #000' }}
                >
                  神救球！
                </span>
                <span className="mt-0.5 rounded-full bg-black/55 px-3 py-0.5 text-xs font-bold text-cyan-50">
                  {t.text}
                  <span className="ml-2 opacity-70">快爬起來！</span>
                </span>
              </motion.div>
            ) : isAttack(t.kind) ? (
              // 進攻球：大字戳章（殺球最大）
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 2.6, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: -5 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{ type: 'spring', stiffness: 560, damping: 16 }}
                className="flex flex-col items-center"
              >
                <span
                  className={`font-display font-black italic tracking-tight ${ATTACK[t.kind].text} ${t.kind === 'smash' ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'}`}
                  style={{ textShadow: `0 0 20px ${ATTACK[t.kind].glow}, 3px 3px 0 #000` }}
                >
                  {ATTACK[t.kind].stamp}
                </span>
                <span className="mt-0.5 rounded-full bg-black/55 px-3 py-0.5 text-xs font-bold text-white">
                  {t.text}
                  {t.sub && <span className="ml-2 opacity-70">{t.sub}</span>}
                </span>
              </motion.div>
            ) : t.tone === 'perfect' ? (
              // 完美擊球：金色大字戳章，帶連擊數
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 2.2, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -4 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                className="flex flex-col items-center"
              >
                <span
                  className="font-display text-3xl font-black italic tracking-tight text-amber-300 md:text-4xl"
                  style={{ textShadow: '0 0 18px rgba(251,191,36,0.85), 3px 3px 0 #000' }}
                >
                  PERFECT!
                </span>
                <span className="mt-0.5 rounded-full bg-black/55 px-3 py-0.5 text-xs font-bold text-amber-100">
                  {t.text.replace('完美 ', '')}
                  {t.sub && <span className="ml-2 opacity-70">{t.sub}</span>}
                  {t.streak && t.streak >= 2 ? <span className="ml-2 text-amber-300">連續完美 ×{t.streak}</span> : null}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className={`rounded-full bg-gradient-to-r px-4 py-1.5 text-sm font-black shadow-lg ${TONE[t.tone]}`}
              >
                {t.text}
                {t.sub && <span className="ml-2 font-semibold opacity-70">{t.sub}</span>}
              </motion.div>
            ),
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {banner && (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, scale: 1.6, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            className="absolute inset-x-0 top-[22%] text-center"
          >
            <span className="font-display text-4xl font-black italic tracking-tight text-amber-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.9)] md:text-6xl">
              {banner.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 每一分結束的說明卡：失誤時告訴你是哪一條規則 */}
      <AnimatePresence>
        {card && (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-x-0 top-[30%] flex justify-center px-4"
          >
            <div
              className={`w-full max-w-sm rounded-2xl border px-5 py-4 text-center shadow-2xl backdrop-blur-xl ${
                card.won ? 'border-emerald-300/40 bg-emerald-950/75' : 'border-orange-300/40 bg-slate-950/80'
              }`}
            >
              <div className={`text-xs font-bold tracking-[0.2em] ${card.won ? 'text-emerald-300' : 'text-orange-300'}`}>{card.headline}</div>
              <div className="mt-1 text-2xl font-black text-white">{card.title}</div>
              {card.lesson && <p className="mt-2 text-sm leading-relaxed text-white/80">{card.lesson}</p>}
              {card.call && (
                <div className="mt-3 text-xs text-white/50">
                  報分 <span className="text-base font-bold text-white tabular-nums">{card.call}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 機會球提示：獨立一塊，手機版靠左放在搖桿上方，避開右側的必殺／絕招鍵 */}
      <div className={`absolute flex ${touch ? 'bottom-[17.5rem] left-3 landscape:bottom-[10.5rem]' : 'inset-x-0 bottom-[6.5rem] justify-center'}`}>
        <AnimatePresence>
          {hud.chance && hud.phase === 'rally' && (
            <ChanceCue key={hud.chance} kind={hud.chance} ready={hud.aimKind === hud.chance} touch={touch} />
          )}
          {!hud.chance && hud.dive && hud.phase === 'rally' && <DiveCue key="dive" touch={touch} />}
        </AnimatePresence>
      </div>

      {/* 下方：發球提示、蓄力、廚房警示 */}
      <div className={`absolute inset-x-0 flex flex-col items-center gap-2 px-3 ${touch ? 'top-[7.5rem]' : 'bottom-5'}`}>
        {hud.inKitchen && hud.phase === 'rally' && (
          <div
            className={`rounded-full px-3 py-1 text-xs font-bold shadow-lg ${
              hud.kitchenLocked ? 'animate-pulse bg-red-500 text-white' : 'bg-amber-400/90 text-amber-950'
            }`}
          >
            {hud.kitchenLocked ? '剛截擊完！別踩進廚房' : '你在廚房內：只能打落地球'}
          </div>
        )}
        {hud.charge !== null && <ChargeBar charge={hud.charge} kind={hud.aimKind} />}
        {humanServing && hud.servePower === null && (
          <div className="rounded-full bg-slate-950/70 px-4 py-1.5 text-xs text-white/90 backdrop-blur-md">
            {touch ? '按住任一擊球鍵蓄力，在綠色區放開發球' : '按住 J／K／L 蓄力，在綠色區放開發球 · ←→ 調方向'}
          </div>
        )}
      </div>

      {hud.servePower !== null && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2">
          <ServeMeter power={hud.servePower} />
        </div>
      )}

      <AnimatePresence>
        {cutIn && <CutIn key={cutIn.id} spec={cutIn.spec} skill={cutIn.skill} mine={cutIn.mine} portrait={cutIn.portrait} name={cutIn.name} />}
        <ReviewOverlay review={hud.review} onChallenge={onChallenge} onAccept={onAccept} />
      </AnimatePresence>
    </div>
  );
};
