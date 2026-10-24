import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Changelog } from './Changelog';
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

const VENUE_SHORT: Record<Exclude<Venue, 'beach'>, string> = { arena: '夜間體育館', rosegarden: '新生公園', xinyi: '信義頂樓', riverside: '大都會河濱' };

/** 場地縮圖：用 SVG 畫，不必另外下載圖 */
/** 新場地的縮圖 */
const VenueThumb = ({ venue }: { venue: Exclude<Venue, 'beach'> }) =>
  venue === 'xinyi' ? (
    <svg viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="160" height="64" fill="#9cc6ea" />
      {/* 台北 101 */}
      <g fill="#5d8c87">
        <rect x="96" y="44" width="16" height="12" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <polygon key={i} points={`${98},${44 - i * 6} ${110},${44 - i * 6} ${112},${38 - i * 6} ${96},${38 - i * 6}`} />
        ))}
        <rect x="101" y="4" width="6" height="4" />
        <rect x="103.4" y="0" width="1.2" height="4" />
      </g>
      <rect x="20" y="30" width="18" height="26" fill="#cfd5d9" />
      <rect x="122" y="26" width="22" height="30" fill="#dfe3e2" />
      <rect y="46" width="160" height="18" fill="#3b6550" />
      <polygon points="40,64 120,64 106,48 54,48" fill="#3f6b56" stroke="#f4f6f8" strokeWidth="1" />
      <line x1="80" y1="48" x2="80" y2="64" stroke="#f4f6f8" strokeWidth="0.8" />
      {/* 防護網鋼管 */}
      <g stroke="#2a2d31" strokeWidth="1.2" fill="none">
        <path d="M4 64 L18 8 L142 8 L156 64" />
        <path d="M18 8 L4 0 M142 8 L156 0 M60 8 L58 0 M100 8 L102 0" />
      </g>
    </svg>
  ) : venue === 'riverside' ? (
    <svg viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="160" height="64" fill="#a9cdf0" />
      <g fill="#b7c3cc">
        <rect x="8" y="14" width="10" height="16" />
        <rect x="22" y="10" width="8" height="20" />
        <rect x="120" y="12" width="12" height="18" />
        <rect x="138" y="16" width="9" height="14" />
      </g>
      <rect y="26" width="160" height="8" fill="#4b7a3b" />
      <rect y="32" width="160" height="32" fill="#3d7a4e" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <polygon points={`${8 + i * 38},64 ${40 + i * 38},64 ${36 + i * 38},40 ${14 + i * 38},40`} fill="#2f5fae" stroke="#f4f6f8" strokeWidth="0.8" />
          <polygon points={`${11 + i * 38},55 ${38 + i * 38},55 ${37 + i * 38},49 ${12 + i * 38},49`} fill="#4d9be0" />
        </g>
      ))}
      <g stroke="#c7cbcd" strokeWidth="1.2">
        <line x1="4" y1="64" x2="6" y2="14" />
        <line x1="156" y1="64" x2="154" y2="14" />
      </g>
    </svg>
  ) : venue === 'arena' ? (
    <svg viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="vt-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#02040c" />
          <stop offset="1" stopColor="#1d2f5c" />
        </linearGradient>
        <radialGradient id="vt-spot">
          <stop offset="0" stopColor="#fff4d6" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff4d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="160" height="64" fill="url(#vt-night)" />
      <circle cx="22" cy="10" r="16" fill="url(#vt-spot)" />
      <circle cx="138" cy="10" r="16" fill="url(#vt-spot)" />
      <rect x="0" y="30" width="160" height="10" fill="#1a2333" />
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={i} cx={4 + i * 6} cy={33 + (i % 3) * 2} r="1.6" fill={['#b91c1c', '#ca8a04', '#0e7490', '#e5e7eb'][i % 4]} />
      ))}
      <rect x="0" y="40" width="160" height="4" fill="#34d399" opacity="0.85" />
      <polygon points="44,44 116,44 140,64 20,64" fill="#24604a" />
      <polygon points="56,46 104,46 120,64 40,64" fill="#1f4f9a" stroke="#f7f9fc" strokeWidth="0.8" />
      <line x1="47" y1="54" x2="113" y2="54" stroke="#f7f9fc" strokeWidth="0.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="vt-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f6fc4" />
          <stop offset="1" stopColor="#d9e9f5" />
        </linearGradient>
      </defs>
      <rect width="160" height="64" fill="url(#vt-day)" />
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="40" cy="14" rx="16" ry="5" />
        <ellipse cx="50" cy="11" rx="9" ry="5" />
        <ellipse cx="118" cy="20" rx="18" ry="4.5" />
        <ellipse cx="126" cy="17" rx="8" ry="4" />
      </g>
      <rect x="6" y="26" width="30" height="16" fill="#eef0ee" />
      <rect x="10" y="22" width="9" height="20" rx="4" fill="#f5f6f3" />
      {[44, 52, 60].map((x) => (
        <g key={x}>
          <line x1={x} y1="42" x2={x} y2="14" stroke="#b8b4aa" strokeWidth="1.2" />
          <path d={`M${x - 7} 17 Q${x} 9 ${x + 7} 17 M${x - 6} 13 Q${x} 16 ${x + 6} 13`} stroke="#4f7d36" strokeWidth="2" fill="none" />
        </g>
      ))}
      <circle cx="132" cy="34" r="12" fill="#4a7a34" />
      <circle cx="146" cy="38" r="9" fill="#3f6a2e" />
      <rect x="0" y="40" width="160" height="24" fill="#6f9a45" />
      <rect x="76" y="20" width="3" height="22" fill="#f1f2ef" />
      <ellipse cx="77.5" cy="20" rx="11" ry="2.4" fill="#f1f2ef" />
      <rect x="0" y="42" width="160" height="3" fill="#4f7f35" />
      <polygon points="30,45 130,45 154,64 6,64" fill="#4f7a62" />
      <polygon points="56,46 104,46 120,64 40,64" fill="none" stroke="#f2c230" strokeWidth="0.9" />
      <line x1="47" y1="54" x2="113" y2="54" stroke="#f2c230" strokeWidth="0.9" />
      <line x1="12" y1="52" x2="148" y2="52" stroke="#f5f7f2" strokeWidth="0.5" opacity="0.8" />
    </svg>
  );

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
  onTutorial: () => void;
  /** 教學做完過了：入口縮成一行小字 */
  tutorialDone: boolean;
}

export const MenuScreen = ({ settings, records, touch, tourStars, onTour, onChange, onNext, onTutorial, tutorialDone }: MenuProps) => {
  // 標題畫面只放「選一個玩法就開打」；對手、場地、操作這些細項收進設定面板（像多數獨立遊戲的標題選單）
  const [sheet, setSheet] = useState(false);
  const start = (mode: GameMode, doubles = false) => {
    onChange({ ...settings, mode, doubles });
    onNext();
  };
  const diff = AI_PROFILES[settings.difficulty];
  const venue = VENUE_SHORT[(settings.venue ?? 'arena') as Exclude<Venue, 'beach'>];
  return (
    <>
    <Shell>
      <div className="flex w-full max-w-md flex-col py-2 [@media(max-height:500px)_and_(min-width:640px)]:max-w-3xl">
        <div className="text-center">
          <ComicTitle className="text-5xl md:text-7xl [@media(max-height:500px)_and_(min-width:640px)]:text-4xl" />
          <p className="mt-2 text-sm text-white/70 [@media(max-height:500px)_and_(min-width:640px)]:mt-1 [@media(max-height:500px)_and_(min-width:640px)]:text-xs">
            {settings.specials ? '真實物理 × 熱血必殺技的匹克球對戰' : '真實物理與正式規則的匹克球對戰'}
          </p>
        </div>

        {/* 兩種玩法分開：想要花招的玩熱血版，想要純粹比賽的玩正規版（踢館之旅、必殺、絕招、覺醒只在熱血版） */}
        <div role="radiogroup" aria-label="玩法" className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-950/60 p-1 ring-1 ring-white/10 [@media(max-height:500px)_and_(min-width:640px)]:mt-2">
          {(
            [
              { on: true, title: '🔥 熱血版', desc: '必殺技・絕招・踢館之旅' },
              { on: false, title: '🎾 正規版', desc: '純競技，像真的比賽' },
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
                className={`rounded-xl px-3 py-2 text-center transition-colors ${
                  sel ? (m.on ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg' : 'bg-sky-500 text-white shadow-lg') : 'text-white/60 hover:text-white'
                }`}
              >
                <span className="block text-sm font-black">{m.title}</span>
                <span className={`block text-[11px] ${sel ? 'text-white/85' : 'text-white/45'}`}>{m.desc}</span>
              </button>
            );
          })}
        </div>

        {/* 橫拿手機（矮螢幕）排成左右兩欄，一頁放得下 */}
        <div className="[@media(max-height:500px)_and_(min-width:640px)]:mt-3 [@media(max-height:500px)_and_(min-width:640px)]:grid [@media(max-height:500px)_and_(min-width:640px)]:grid-cols-2 [@media(max-height:500px)_and_(min-width:640px)]:gap-3">
        <div>
        {/* 主按鈕：單打、雙打直接開打 */}
        <div className="mt-3 grid grid-cols-2 gap-2.5 [@media(max-height:500px)_and_(min-width:640px)]:mt-0">
          {(
            [
              { doubles: false, icon: '🏆', title: '單打比賽', sub: `勝 ${records.wins[settings.difficulty]} / ${records.plays[settings.difficulty]}` },
              { doubles: true, icon: '🤝', title: '雙打比賽', sub: '你＋隊友 2 打 2' },
            ] as const
          ).map((m) => (
            <motion.button
              key={m.title}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => start('match', m.doubles)}
              className={`flex flex-col items-start gap-1 rounded-2xl bg-gradient-to-br px-4 py-3.5 text-left shadow-xl ${
                settings.specials ? 'from-emerald-400 to-teal-500 text-emerald-950 shadow-emerald-500/25' : 'from-sky-300 to-sky-500 text-sky-950 shadow-sky-500/25'
              }`}
            >
              <span className="flex w-full items-center justify-between">
                <span className="text-2xl">{m.icon}</span>
                <span className="text-lg font-black">▶</span>
              </span>
              <span className="block text-lg font-black leading-tight">{m.title}</span>
              <span className="block text-[11px] font-bold opacity-70">
                對手 {diff.label} · {m.sub}
              </span>
            </motion.button>
          ))}
        </div>

      {/* 冒險模式入口：漫畫風大橫幅（熱血版才有） */}
      {settings.specials && (
      <motion.button
        type="button"
        onClick={onTour}
        whileHover={{ y: -2, rotate: -0.4 }}
        whileTap={{ scale: 0.98 }}
        className="relative mt-3 flex w-full items-center gap-3 overflow-hidden rounded-2xl border-[3px] border-slate-950 bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 px-4 py-3 text-left text-slate-950 shadow-[5px_5px_0_#0b0b14]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(#7c2d12 1.2px, transparent 1.5px)', backgroundSize: '8px 8px' }}
        />
        <span className="relative text-3xl md:text-4xl">🗺️</span>
        <span className="relative min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-lg font-black md:text-xl">踢館之旅</span>
            <span className="rounded-md border-2 border-slate-950 bg-slate-950 px-1.5 text-[10px] font-black text-amber-300">NEW</span>
          </span>
          <span className="block text-xs font-bold text-slate-950/75">全台踢館！第一站：海邊・颱風天，打倒颱風黑框</span>
        </span>
        <span className="relative shrink-0 text-right">
          <span className="block text-sm font-black">★ {tourStars}</span>
          <span className="block text-xs font-black">出發 →</span>
        </span>
      </motion.button>
      )}

        </div>
        <div>
        <div className="mt-3 grid grid-cols-2 gap-3 [@media(max-height:500px)_and_(min-width:640px)]:mt-0">
          <button
            type="button"
            onClick={onTutorial}
            className={`relative rounded-2xl border p-3 text-left transition-colors ${
              tutorialDone ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-amber-300/60 bg-amber-400/15 hover:bg-amber-400/25'
            }`}
          >
            {!tutorialDone && <span className="absolute -top-2 right-2 rounded-full bg-amber-300 px-2 text-[10px] font-black text-amber-950">第一次玩</span>}
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="text-xl">🎓</span>新手教學
            </div>
            <div className="mt-0.5 text-[11px] text-white/60">1 分鐘學會 {lessonsFor(settings.specials).length} 招</div>
          </button>
          <button type="button" onClick={() => start('dink')} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:bg-white/10">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="text-xl">🎯</span>Dink 挑戰
            </div>
            <div className="mt-0.5 text-[11px] text-white/60">最佳 {records.dinkBest[settings.difficulty]} 拍</div>
          </button>
        </div>

        {/* 目前設定一行摘要，點開才調 */}
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="mt-3 flex w-full items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-slate-950/60"
        >
          <span>⚙️</span>
          <span className="min-w-0 flex-1 truncate">
            {diff.label} · {venue} · {(settings.controls ?? 'auto') === 'auto' ? '自動揮拍' : '抓時機'}
          </span>
          <span className="text-xs font-bold text-emerald-300">調整</span>
        </button>
        </div>
        </div>

        <Changelog />
      </div>
    </Shell>

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

          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold tracking-wider text-white/50">比賽場地</div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'arena', title: '夜間體育館', desc: '滿場觀眾、LED 看板與大螢幕' },
                  { id: 'rosegarden', title: '新生公園羽毛球場', desc: '台北玫瑰園旁的白天戶外硬地' },
                  { id: 'xinyi', title: '信義運動中心頂樓', desc: '防護網籠裡的屋頂球場，正對台北 101' },
                  { id: 'riverside', title: '新北大都會公園河濱', desc: '全台最大的河濱匹克球中心，8 面專用場' },
                ] as const
              ).map((v) => {
                const sel = (settings.venue ?? 'arena') === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onChange({ ...settings, venue: v.id })}
                    aria-pressed={sel}
                    className={`overflow-hidden rounded-xl border text-left transition-all ${
                      sel ? 'border-amber-300/70 bg-amber-400/15 shadow-lg shadow-amber-500/10' : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    <div className={`h-20 transition-opacity md:h-24 ${sel ? 'opacity-100' : 'opacity-70'}`}>
                      <VenueThumb venue={v.id} />
                    </div>
                    <div className="px-3 py-2">
                      <div className="text-sm font-bold text-white">{v.title}</div>
                      <div className="text-[11px] text-white/55">{v.desc}</div>
                    </div>
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
