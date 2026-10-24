import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Changelog } from './Changelog';
import { venueById } from './venues';
import { readSeen, VERSIONS } from './changelogData';
import { characterById } from './characters';
import { paddleById } from './engine/paddles';
import { ComicTitle } from './ComicTitle';
import { lessonsFor } from './tutorial';
import { type Difficulty, AI_PROFILES } from './engine/ai';
import type { Controls, GameMode, TeamStats } from './engine/game';
import type { Challenge, MatchResult } from './share';
import { ChallengeVerdict, ShareActions } from './ShareCard';


export interface Records {
  wins: Record<Difficulty, number>;
  plays: Record<Difficulty, number>;
  dinkBest: Record<Difficulty, number>;
  /** 最長連擊（熱血與寫實都算） */
  comboBest: Record<Difficulty, number>;
}

/** 比賽場地（beach 是踢館之旅颱風站專用，不在選單裡） */
export type Venue = 'arena' | 'rosegarden' | 'xinyi' | 'riverside' | 'beach';

export interface Settings {
  mode: GameMode;
  difficulty: Difficulty;
  assist: boolean;
  /** 擊球操作（舊存檔沒有這欄，當作 auto） */
  controls?: Controls;
  /** 熱血模式：必殺技、能量、特效全開；關閉即為寫實模式 */
  specials: boolean;
  paddle: string;
  /** 選的角色 id（見 characters.ts） */
  character: string;
  /** 比賽場地（舊存檔沒有這欄，當作夜間體育館） */
  venue?: Venue;
  /** 雙打（你＋隊友 vs 兩個電腦） */
  doubles?: boolean;
  /** 雙打隊友的角色 id */
  partner?: string;
}

const DIFFS: Difficulty[] = ['rookie', 'club', 'pro'];

/** 主選單圖塊依序彈進來 */
const TILE = { hide: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 28 } } } as const;


/** 場地縮圖：用 SVG 畫，不必另外下載圖 */

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex min-w-[1.6rem] items-center justify-center rounded-md border border-white/25 bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
    {children}
  </kbd>
);

export const ControlsHelp = ({ touch, controls }: { touch: boolean; controls: Controls }) =>
  touch ? (
    <ul className="space-y-1.5 text-sm text-white/80">
      <li>左下搖桿移動，擊球瞬間推的方向就是瞄準方向</li>
      <li>
        右下 <b className="text-emerald-300">軟</b> 放小球／dink、<b className="text-orange-300">抽</b> 抽球／殺球、
        <b className="text-sky-300">挑</b> 高吊
      </li>
      <li>
        {controls === 'auto'
          ? '對手一出手就先按擊球鍵，球到身邊會自動揮拍；越早按蓄力越飽，「蓄滿」最穩最強'
          : '按住蓄力，球到身邊時放開；放得準就是「完美」'}
      </li>
      <li>能量滿了點「必殺」蓄勢，下一拍放出必殺技</li>
      <li>點「絕招」放出角色的招牌打法；用掉後打完 4 分再充好</li>
      <li>比賽中球落在線邊、判決對你不利時，可以點「申請判決」看電視輔助重播；每局 2 次，判決被推翻不扣次數</li>
      <li>同一顆鍵會看情況變招：站位圈<b className="text-amber-300">金色</b>＝殺球機會（按抽）；<b className="text-rose-300">紅色</b>＝網前推擋／突擊（按抽）；被重抽時按軟＝卸力擋，擋回廚房</li>
    </ul>
  ) : (
    <ul className="space-y-2 text-sm text-white/80">
      <li className="flex flex-wrap items-center gap-1.5">
        <Key>W</Key>
        <Key>A</Key>
        <Key>S</Key>
        <Key>D</Key>
        <span className="text-white/40">或方向鍵</span> 移動；擊球瞬間按住的方向 = 瞄準
      </li>
      <li className="flex flex-wrap items-center gap-1.5">
        <Key>J</Key> <span className="text-emerald-300">軟</span> dink／放小球
        <Key>K</Key> <span className="text-orange-300">抽</span> 抽球／殺球
        <Key>L</Key> <span className="text-sky-300">挑</span> 高吊
      </li>
      <li>
        {controls === 'auto'
          ? '地上的綠圈是建議站位；對手出手就先按好擊球鍵（可以再按別的鍵換球路），球上的圈變金色＝會是「蓄滿」'
          : '地上的綠圈是建議站位；球上的圈縮到最小、變金色時放開擊球鍵＝完美'}
      </li>
      <li>同一顆鍵會看情況變招：站位圈<b className="text-amber-300">金色</b>＝殺球機會（按抽）；<b className="text-rose-300">紅色</b>＝網前推擋／突擊（按抽）；被重抽時按軟＝卸力擋，擋回廚房</li>
      <li className="flex flex-wrap items-center gap-1.5">
        <Key>空白鍵</Key> 能量滿時蓄勢，下一拍放出必殺；接必殺球時抓到「完美」就能破解
      </li>
      <li className="flex flex-wrap items-center gap-1.5">
        <Key>Shift</Key> 飛身撲接：跑不到的球撲過去救，觸及很遠，但回球又軟又高，撲完要倒地爬起來
      </li>
      <li className="flex flex-wrap items-center gap-1.5">
        <Key>U</Key> 角色絕招（每人一招招牌打法），用掉後打完 4 分再充好
      </li>
      <li className="flex flex-wrap items-center gap-1.5">
        <Key>C</Key> 壓線球判決對你不利時申請電視輔助判決（<Key>Enter</Key> 接受原判）；每局 2 次，推翻不扣次數
      </li>
      <li className="flex items-center gap-1.5">
        <Key>Esc</Key> 暫停
      </li>
    </ul>
  );

const Shell = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-30 flex overflow-y-auto overscroll-contain bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-emerald-950/80 p-4 backdrop-blur-[2px]"
  >
    {/* 內容比畫面高時從頂端開始捲（items-center 會把上半截切掉） */}
    <div className="m-auto flex w-full justify-center">{children}</div>
  </motion.div>
);

interface MenuProps {
  settings: Settings;
  records: Records;
  touch: boolean;
  /** 踢館之旅拿到的星星總數 */
  tourStars: number;
  onTour: () => void;
  onChange: (s: Settings) => void;
  onNext: () => void;
  /** 快速開打：沿用上次的選手、球拍、場地直接比賽 */
  onQuick: () => void;
  onTutorial: () => void;
  /** 教學做完過了：入口縮成一行小字 */
  tutorialDone: boolean;
}

export const MenuScreen = ({ settings, records, touch, tourStars, onTour, onChange, onNext, onQuick, onTutorial, tutorialDone }: MenuProps) => {
  // 標題畫面只放「選一個玩法就開打」；對手、場地、操作這些細項收進設定面板（像多數獨立遊戲的標題選單）
  const [sheet, setSheet] = useState(false);
  const [news, setNews] = useState(false);
  const me = characterById(settings.character);
  const paddle = paddleById(settings.paddle);
  const start = (mode: GameMode, doubles = false) => {
    onChange({ ...settings, mode, doubles });
    onNext();
  };
  const diff = AI_PROFILES[settings.difficulty];
  const venue = venueById(settings.venue).short;
  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 overflow-y-auto overscroll-contain"
    >
      {/* 讓 3D 示範對打透出來：直拿時下半部壓暗放選單、橫拿時左側壓暗 */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/0 landscape:bg-gradient-to-r landscape:from-slate-950/95 landscape:via-slate-950/55 landscape:to-transparent" />
      <div className="relative flex min-h-full w-full flex-col px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] landscape:max-w-md landscape:md:max-w-lg landscape:md:px-8 [@media(max-height:500px)]:landscape:max-w-2xl [@media(max-height:500px)]:pb-3 [@media(max-height:500px)]:pt-2">
        <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="text-center landscape:text-left">
          <ComicTitle className="text-4xl md:text-6xl [@media(max-height:500px)]:text-3xl" />
        </motion.div>

        {/* 熱血版／正規版：一顆小切換，不搶主按鈕的戲 */}
        <div role="radiogroup" aria-label="玩法" className="mt-3 inline-flex self-center rounded-full bg-slate-950/70 p-1 ring-1 ring-white/15 backdrop-blur-md landscape:self-start [@media(max-height:500px)]:mt-1.5">
          {(
            [
              { on: true, title: '🔥 熱血版' },
              { on: false, title: '🎾 正規版' },
            ] as const
          ).map((m) => {
            const sel = settings.specials === m.on;
            return (
              <button
                key={m.title}
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => onChange({ ...settings, specials: m.on })}
                className={`rounded-full px-4 py-1.5 text-sm font-black transition-colors ${
                  sel ? (m.on ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow' : 'bg-sky-500 text-white shadow') : 'text-white/60 hover:text-white'
                }`}
              >
                {m.title}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-center text-[11px] text-white/55 landscape:text-left [@media(max-height:500px)]:hidden">
          {settings.specials ? '必殺技、角色絕招、踢館之旅全開' : '純真實物理與正式規則，像真的比賽'}
        </p>

        {/* 直拿：中間留白給 3D 球場 */}
        <div className="min-h-[18vh] flex-1 landscape:min-h-4" />

        <motion.div
          initial="hide"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
          className="flex flex-col gap-2.5 [@media(max-height:500px)]:landscape:grid [@media(max-height:500px)]:landscape:grid-flow-col [@media(max-height:500px)]:landscape:grid-rows-2 [@media(max-height:500px)]:landscape:gap-2"
        >
          {/* 快速開打：上次的選手、球拍、場地，一鍵就比 */}
          <motion.button
            variants={TILE}
            type="button"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            onClick={onQuick}
            className={`relative flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r p-3 pr-4 text-left shadow-xl ${
              settings.specials ? 'from-emerald-400 to-teal-500 text-emerald-950 shadow-emerald-500/30' : 'from-sky-300 to-sky-500 text-sky-950 shadow-sky-500/30'
            }`}
          >
            <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-950/20 ring-2 ring-white/60">
              {me.portrait ? (
                <img src={me.portrait} alt="" className="h-full w-full object-cover object-top" />
              ) : (
                // 沒有照片的選手：球衣色塊＋背號（不要用 🏓，那是桌球拍）
                <span className="grid h-full w-full place-items-center font-display text-2xl font-black text-white" style={{ background: me.shirt }}>
                  {me.number}
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xl font-black leading-tight">快速開打</span>
              <span className="block truncate text-xs font-bold opacity-75">
                {me.name} · {paddle.name} · {venue} · {settings.doubles ? '雙打' : '單打'} {diff.label}
              </span>
            </span>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950/85 text-lg text-white">▶</span>
          </motion.button>

          <div className="grid grid-cols-2 gap-2.5">
            {(
              [
                { doubles: false, icon: '🏆', title: '單打', sub: `勝 ${records.wins[settings.difficulty]} / ${records.plays[settings.difficulty]}` },
                { doubles: true, icon: '🤝', title: '雙打', sub: '自己挑隊友' },
              ] as const
            ).map((m) => (
              <motion.button
                key={m.title}
                variants={TILE}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => start('match', m.doubles)}
                className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-900/70 p-3 text-left backdrop-blur-md transition-colors hover:bg-slate-800/80"
              >
                <span className="text-2xl">{m.icon}</span>
                <span>
                  <span className="block font-black text-white">{m.title}</span>
                  <span className="block text-[11px] text-white/55">{m.sub}</span>
                </span>
              </motion.button>
            ))}
          </div>

          {/* 冒險模式入口：漫畫風橫幅（熱血版才有） */}
          {settings.specials && (
            <motion.button
              variants={TILE}
              type="button"
              onClick={onTour}
              whileTap={{ scale: 0.98 }}
              className="relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border-[3px] border-slate-950 bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 px-4 py-2.5 text-left text-slate-950 shadow-[4px_4px_0_#0b0b14]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(#7c2d12 1.2px, transparent 1.5px)', backgroundSize: '8px 8px' }}
              />
              <span className="relative text-2xl">🗺️</span>
              <span className="relative min-w-0 flex-1">
                <span className="block font-black">踢館之旅</span>
                <span className="block truncate text-[11px] font-bold text-slate-950/75">全台踢館！第一站：海邊・颱風天</span>
              </span>
              <span className="relative shrink-0 text-sm font-black">★ {tourStars}</span>
            </motion.button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <motion.button
              variants={TILE}
              type="button"
              onClick={onTutorial}
              className={`relative flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left backdrop-blur-md transition-colors ${
                tutorialDone ? 'border-white/10 bg-slate-900/60 hover:bg-slate-800/70' : 'border-amber-300/60 bg-amber-400/20 hover:bg-amber-400/30'
              }`}
            >
              {!tutorialDone && <span className="absolute -top-2 right-2 rounded-full bg-amber-300 px-2 text-[10px] font-black text-amber-950">第一次玩</span>}
              <span className="text-lg">🎓</span>
              <span>
                <span className="block text-sm font-bold text-white">新手教學</span>
                <span className="block text-[10px] text-white/55">1 分鐘學會 {lessonsFor(settings.specials).length} 招</span>
              </span>
            </motion.button>
            <motion.button
              variants={TILE}
              type="button"
              onClick={() => start('dink')}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-left backdrop-blur-md transition-colors hover:bg-slate-800/70"
            >
              <span className="text-lg">🎯</span>
              <span>
                <span className="block text-sm font-bold text-white">Dink 挑戰</span>
                <span className="block text-[10px] text-white/55">最佳 {records.dinkBest[settings.difficulty]} 拍</span>
              </span>
            </motion.button>
          </div>

        </motion.div>
        {/* 底部小圖示列：設定、更新 */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-3 flex items-center justify-center gap-2 landscape:justify-start">
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="flex items-center gap-1.5 rounded-full bg-slate-900/70 px-3.5 py-2 text-xs font-bold text-white/80 ring-1 ring-white/10 backdrop-blur-md hover:text-white"
            >
              ⚙️ 比賽設定
            </button>
            <button
              type="button"
              onClick={() => setNews(true)}
              className="flex items-center gap-1.5 rounded-full bg-slate-900/70 px-3.5 py-2 text-xs font-bold text-white/80 ring-1 ring-white/10 backdrop-blur-md hover:text-white"
            >
              {readSeen() !== VERSIONS[0].v && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
              📜 v{VERSIONS[0].v} 更新
            </button>
          </motion.div>
      </div>
    </motion.div>

      {/* 設定面板放在 Shell 外面：Shell 的 backdrop-blur 會讓 fixed 定位跟著它走，底部按鈕被切掉 */}
      <AnimatePresence>
        {sheet && (
          <motion.div
            key="sheet"
            className="absolute inset-0 z-40 flex items-end justify-center bg-slate-950/60 md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSheet(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[88dvh] w-full max-w-2xl flex-col rounded-t-3xl border border-white/10 bg-slate-900 md:rounded-3xl"
            >
              <div className="flex items-center justify-between px-5 pb-2 pt-4">
                <span className="text-base font-black text-white">比賽設定</span>
                <span className="text-xs text-white/40">會記住，下次不用再調</span>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold tracking-wider text-white/50">對手程度</div>
            <div className="grid grid-cols-3 gap-2">
              {DIFFS.map((d) => {
                const p = AI_PROFILES[d];
                const sel = settings.difficulty === d;
                const rec = settings.mode === 'dink' ? `最佳 ${records.dinkBest[d]}` : `勝 ${records.wins[d]} / ${records.plays[d]}`;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onChange({ ...settings, difficulty: d })}
                    className={`rounded-xl border px-3 py-2.5 text-center transition-all ${
                      sel ? 'border-orange-300/70 bg-orange-400/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold text-white">{p.label}</div>
                    <div className="text-[11px] text-white/50">{p.rating}</div>
                    <div className="mt-1 text-[11px] tabular-nums text-white/70">{rec}</div>
                  </button>
                );
              })}
            </div>
          </div>



          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                { id: 'auto', title: '🎾 提早按・自動揮拍', desc: '對手出手就先按，球到了自動揮；越早按越飽' },
                { id: 'timing', title: '⏱️ 抓時機放開', desc: '進階：按住蓄力，自己抓擊球瞬間放開' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onChange({ ...settings, controls: m.id })}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                  (settings.controls ?? 'auto') === m.id ? 'border-sky-300/70 bg-sky-400/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-sm font-bold text-white">{m.title}</div>
                <div className="text-[11px] text-white/55">{m.desc}</div>
              </button>
            ))}
          </div>

          <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-white">擊球輔助</span>
              <span className="block text-xs text-white/55">
                {(settings.controls ?? 'auto') === 'auto'
                  ? '自動跑到站位、擊球範圍更大。關掉後自己跑位，跟著地上的站位圈'
                  : '自動跑到站位、按住擊球鍵自動抓時機。關掉後自己跑位，跟著地上的站位圈和球上的計時圈，抓到「完美」更穩更強'}
              </span>
            </span>
            <input
              type="checkbox"
              checked={settings.assist}
              onChange={(e) => onChange({ ...settings, assist: e.target.checked })}
              className="h-5 w-5 shrink-0 accent-emerald-400"
            />
          </label>
          <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-white/60">
            {touch ? (
              <>
                <span>左搖桿移動</span>
                <span>{(settings.controls ?? 'auto') === 'auto' ? '右側提早按擊球鍵，球到自動揮拍' : '右側按住蓄力、放開擊球'}</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <Key>WASD</Key> 移動
                </span>
                <span className="flex items-center gap-1">
                  <Key>J</Key> 軟 <Key>K</Key> 抽 <Key>L</Key> 挑
                </span>
                <span className="flex items-center gap-1">
                  <Key>空白鍵</Key> 必殺
                </span>
              </>
            )}
          </p>
              </div>
              <div className="border-t border-white/10 p-4">
                <button
                  type="button"
                  onClick={() => setSheet(false)}
                  className="w-full rounded-2xl bg-white py-3 text-base font-black text-slate-950"
                >
                  完成
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {news && (
          <motion.div
            key="news"
            className="absolute inset-0 z-40 flex items-end justify-center bg-slate-950/60 md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNews(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[80dvh] w-full max-w-lg flex-col rounded-t-3xl border border-white/10 bg-slate-900 md:rounded-3xl"
            >
              <div className="px-5 pb-2 pt-4 text-base font-black text-white">更新了什麼</div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
                <Changelog alwaysOpen />
              </div>
              <div className="border-t border-white/10 p-4">
                <button type="button" onClick={() => setNews(false)} className="w-full rounded-2xl bg-white py-3 text-base font-black text-slate-950">
                  知道了
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const PauseScreen = ({
  touch,
  controls,
  onResume,
  onRestart,
  onMenu,
}: {
  touch: boolean;
  controls: Controls;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}) => (
  <Shell>
    <div className="w-full max-w-md text-center">
      <h2 className="text-3xl font-black text-white">暫停</h2>
      <div className="mt-5 grid gap-2">
        <button type="button" onClick={onResume} className="rounded-xl bg-emerald-400 py-3 font-bold text-emerald-950">
          繼續
        </button>
        <button type="button" onClick={onRestart} className="rounded-xl bg-white/10 py-3 font-bold text-white hover:bg-white/15">
          重新開始
        </button>
        <button type="button" onClick={onMenu} className="rounded-xl bg-white/10 py-3 font-bold text-white hover:bg-white/15">
          回主選單
        </button>
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
        <ControlsHelp touch={touch} controls={controls} />
      </div>
    </div>
  </Shell>
);

interface OverProps {
  mode: GameMode;
  won: boolean;
  score: [number, number];
  dinkStreak: number;
  newRecord: boolean;
  stats: [TeamStats, TeamStats];
  longestRally: number;
  /** 這個難度的最長連擊紀錄（已含這一場） */
  comboBest: number;
  difficulty: Difficulty;
  /** 比賽模式才有：分享卡用的完整戰績 */
  result: MatchResult | null;
  /** 從挑戰連結進來、且打的是同一個難度時，顯示和挑戰者的比較 */
  challenge: Challenge | null;
  onAgain: () => void;
  onMenu: () => void;
}

export const GameOverScreen = (p: OverProps) => {
  const rows: [string, number, number][] = [
    ['致勝球', p.stats[0].winners, p.stats[1].winners],
    ['失誤', p.stats[0].errors, p.stats[1].errors],
    ['發球得分', p.stats[0].aces, p.stats[1].aces],
    ['廚房違例', p.stats[0].kitchenFaults, p.stats[1].kitchenFaults],
  ];
  const accuracy = p.stats[0].shots ? Math.round((p.stats[0].perfect / p.stats[0].shots) * 100) : 0;
  return (
    <Shell>
      {/* my-auto：內容比舞台高時（加了分享區塊）從頂端開始捲，不會被置中裁掉 */}
      <motion.div initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} className="my-auto w-full max-w-md text-center">
        {p.mode === 'dink' ? (
          <>
            <div className="text-xs font-bold tracking-[0.25em] text-emerald-300">DINK 挑戰結束</div>
            <div className="mt-2 text-6xl font-black tabular-nums text-white">{p.dinkStreak}</div>
            <div className="mt-1 text-white/70">連續成功 dink</div>
            {p.newRecord && <div className="mt-3 inline-block rounded-full bg-amber-400 px-3 py-1 text-sm font-black text-amber-950">新紀錄！</div>}
          </>
        ) : (
          <>
            <div className={`text-xs font-bold tracking-[0.25em] ${p.won ? 'text-emerald-300' : 'text-orange-300'}`}>
              {p.won ? 'YOU WIN' : 'GAME OVER'}
            </div>
            <div className="mt-2 text-4xl font-black text-white">{p.won ? '你贏了！' : '差一點！'}</div>
            <div className="mt-2 text-5xl font-black tabular-nums text-white">
              {p.score[0]} <span className="text-white/30">:</span> {p.score[1]}
            </div>
            <div className="mt-1 text-sm text-white/60">對手：{AI_PROFILES[p.difficulty].label}（{AI_PROFILES[p.difficulty].rating}）</div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-sm">
              <div className="grid grid-cols-3 border-b border-white/10 py-2 text-xs font-semibold text-white/50">
                <span className="text-emerald-300">你</span>
                <span />
                <span className="text-orange-300">對手</span>
              </div>
              {rows.map(([label, a, b]) => (
                <div key={label} className="grid grid-cols-3 py-1.5 tabular-nums text-white">
                  <span className="font-bold">{a}</span>
                  <span className="text-white/60">{label}</span>
                  <span className="font-bold">{b}</span>
                </div>
              ))}
              <div className="border-t border-white/10 py-2 text-xs text-white/60">
                最長連擊 <b className="text-white">{p.longestRally} HIT</b>
                {p.newRecord ? <b className="ml-1 text-amber-300">新紀錄！</b> : <span className="ml-1">（紀錄 {p.comboBest}）</span>} · 完美擊球率{' '}
                <b className="text-white">{accuracy}%</b>
              </div>
            </div>
            {p.challenge && <ChallengeVerdict challenge={p.challenge} score={p.score} />}
            {p.result && <ShareActions result={p.result} />}
          </>
        )}
        <div className={`${p.result ? 'mt-2' : 'mt-5'} grid grid-cols-2 gap-2`}>
          <button type="button" onClick={p.onAgain} className="rounded-xl bg-emerald-400 py-3 font-bold text-emerald-950">
            再來一場
          </button>
          <button type="button" onClick={p.onMenu} className="rounded-xl bg-white/10 py-3 font-bold text-white hover:bg-white/15">
            換模式／難度
          </button>
        </div>
      </motion.div>
    </Shell>
  );
};
