import { motion } from 'framer-motion';
import { type Difficulty, AI_PROFILES } from './engine/ai';
import type { Controls, GameMode, TeamStats } from './engine/game';
import type { Challenge, MatchResult } from './share';
import { ChallengeVerdict, ShareActions } from './ShareCard';

export interface Records {
  wins: Record<Difficulty, number>;
  plays: Record<Difficulty, number>;
  dinkBest: Record<Difficulty, number>;
}

/** 比賽場地 */
export type Venue = 'arena' | 'rosegarden';

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
}

const DIFFS: Difficulty[] = ['rookie', 'club', 'pro'];

/** 場地縮圖：用 SVG 畫，不必另外下載圖 */
const VenueThumb = ({ venue }: { venue: Venue }) =>
  venue === 'arena' ? (
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
  onChange: (s: Settings) => void;
  onNext: () => void;
}

export const MenuScreen = ({ settings, records, touch, onChange, onNext }: MenuProps) => (
  <Shell>
    <div className="w-full max-w-2xl py-4">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold tracking-[0.25em] text-emerald-300">
          PICKLEBALL GAME
        </span>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-white md:text-5xl">Pickle Master</h2>
        <p className="mt-1.5 text-sm text-white/70">真實物理、真實規則的匹克球對戰</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {(
          [
            { id: 'match', title: '單打比賽', desc: '11 分、換發球制，雙彈跳與廚房規則全都算', icon: '🏆' },
            { id: 'dink', title: 'Dink 挑戰', desc: '連續把球輕放進對方廚房，看你能撐幾拍', icon: '🎯' },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange({ ...settings, mode: m.id })}
            className={`rounded-2xl border p-3.5 text-left transition-all ${
              settings.mode === m.id
                ? 'border-emerald-300/70 bg-emerald-400/15 shadow-lg shadow-emerald-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="text-xl">{m.icon}</span>
              {m.title}
            </div>
            <div className="mt-1 text-xs leading-relaxed text-white/60">{m.desc}</div>
          </button>
        ))}
      </div>

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
            { on: true, title: '🔥 熱血模式', desc: '必殺技、能量條、特效全開' },
            { on: false, title: '📏 寫實模式', desc: '純真實物理，適合學規則' },
          ] as const
        ).map((m) => (
          <button
            key={m.title}
            type="button"
            onClick={() => onChange({ ...settings, specials: m.on })}
            className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
              settings.specials === m.on ? 'border-fuchsia-300/70 bg-fuchsia-400/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-sm font-bold text-white">{m.title}</div>
            <div className="text-[11px] text-white/55">{m.desc}</div>
          </button>
        ))}
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

      {/* 手機上設定很長，下一步按鈕黏在底部，不用捲到最下面找 */}
      <div className="sticky -bottom-4 z-10 -mx-1 mt-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent px-1 pb-4 pt-4 md:static md:bg-none md:p-0">
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 py-3.5 text-lg font-black text-emerald-950 shadow-xl shadow-emerald-500/25"
      >
        下一步：選擇選手 →
      </motion.button>
      </div>

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
  </Shell>
);

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
                最長來回 <b className="text-white">{p.longestRally}</b> 拍 · 完美擊球率 <b className="text-white">{accuracy}%</b>
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
