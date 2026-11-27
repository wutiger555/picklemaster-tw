import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PADDLES } from './engine/paddles';
import { characterById } from './characters';
import { VENUES } from './venues';
import { nextTitle, titlesOf, topTitle } from './titles';
import { canvasToFile, copyText, download, drawPlayerCard, playerCardText } from './share';
import { track } from '../../utils/analytics';
import { AnimatePresence, motion } from 'framer-motion';
import PaddleAvatar from '../play/PaddleAvatar';
import {
  type ArcadeBoard,
  type ArcadeLeaderboard,
  type ArcadePlayerCard,
  type ArcadeStats,
  type Me,
  claimPlayerCode,
  ensurePlayer,
  getArcadePlayer,
  getCachedMe,
  issuePlayerCode,
} from '../../utils/playApi';
import { cachedBoard as cached, lastSynced, loadBoard, pull, signedIn } from './cloud';

/** 底部滑出的面板（和比賽設定同一套樣式） */
const Sheet = ({ open, onClose, title, sub, children }: { open: boolean; onClose: () => void; title: string; sub?: string; children: ReactNode }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        key={title}
        className="absolute inset-0 z-50 flex items-end justify-center bg-slate-950/60 md:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40 }}
          animate={{ y: 0 }}
          exit={{ y: 40 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[min(88dvh,100%)] w-full max-w-lg flex-col rounded-t-3xl border border-white/10 bg-slate-900 md:rounded-3xl"
        >
          <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-4">
            <div>
              <div className="text-base font-black text-white">{title}</div>
              {sub && <div className="text-xs text-white/50">{sub}</div>}
            </div>
            <button type="button" onClick={onClose} aria-label="關閉" className="rounded-full bg-white/10 px-2.5 py-1 text-sm text-white/70 hover:bg-white/20">
              ✕
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const errText = (e: unknown) => (e instanceof Error ? e.message : '發生錯誤，請稍後再試');

// ───────────────────────────── 球友身分 ─────────────────────────────

/**
 * 球友身分（和揪團約打同一個）：取暱稱就能雲端存檔、上排行榜；換手機用球友碼接回。
 * onChanged：身分或存檔有變，遊戲要重新讀本機存檔。
 */
export const AccountSheet = ({ open, onClose, onChanged }: { open: boolean; onClose: () => void; onChanged: () => void }) => {
  const [me, setMe] = useState<Me | null>(() => (signedIn() ? getCachedMe() : null));
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [myCode, setMyCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setMe(signedIn() ? getCachedMe() : null);
      setError(null);
      setMyCode(null);
    }
  }, [open]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  };
  const create = () =>
    run(async () => {
      const name = nickname.trim();
      if (!name) throw new Error('先取個暱稱吧');
      const p = await ensurePlayer({ nickname: name, avatarSeed: Math.floor(Math.random() * 1_000_000), level: null });
      setMe(p);
      await pull();
      onChanged();
    });
  const claim = () =>
    run(async () => {
      const c = code.replace(/\s/g, '').toUpperCase();
      if (c.length < 8) throw new Error('球友碼長得像 PK-XXXX-XXXX，再確認一下');
      setMe(await claimPlayerCode(c));
      await pull();
      onChanged();
    });
  const getCode = () =>
    run(async () => {
      setMyCode((await issuePlayerCode()).code);
    });
  const synced = lastSynced();

  return (
    <Sheet open={open} onClose={onClose} title="我的球友身分" sub="和揪團約打同一個身分，不用密碼、不用 email">
      {me ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <PaddleAvatar name={me.nickname} seed={me.avatarSeed} size={48} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-black text-white">{me.nickname}</div>
              <div className="text-xs text-emerald-300">
                ☁️ 進度已存在雲端{synced ? `・${new Date(synced).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 同步` : ''}
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="text-sm font-bold text-white">換手機、換瀏覽器</div>
            <p className="mt-0.5 text-xs leading-relaxed text-white/60">拿一組球友碼，到新手機的遊戲裡輸入，就能接回同一個身分與進度。球友碼只能用一次。</p>
            {myCode ? (
              <div className="mt-2 rounded-xl bg-slate-950 py-2.5 text-center font-mono text-2xl font-black tracking-[0.3em] text-amber-300">{myCode}</div>
            ) : (
              <button type="button" disabled={busy} onClick={getCode} className="mt-2 w-full rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white hover:bg-white/20 disabled:opacity-50">
                取得球友碼
              </button>
            )}
          </div>
          <a href="/play/?me" className="block text-center text-xs font-semibold text-white/50 underline-offset-2 hover:text-white hover:underline">
            同一個身分也能揪團約打 →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-white/75">
            取個暱稱，戰績和踢館進度就會存到雲端：換手機不會不見，也能上<b className="text-amber-300">歷史排行榜</b>、有自己的球友卡。
          </p>
          <div className="flex gap-2">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 12))}
              placeholder="暱稱（最多 12 字）"
              className="min-w-0 flex-1 rounded-xl bg-slate-950 px-3 py-2.5 text-white ring-1 ring-white/15 placeholder:text-white/30 focus:outline-none focus:ring-emerald-400"
            />
            <button type="button" disabled={busy} onClick={create} className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 font-black text-emerald-950 disabled:opacity-50">
              開始存檔
            </button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            已經有球友碼？
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.slice(0, 16))}
              placeholder="球友碼 PK-XXXX-XXXX"
              className="min-w-0 flex-1 rounded-xl bg-slate-950 px-3 py-2.5 font-mono uppercase tracking-widest text-white ring-1 ring-white/15 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-white/30 focus:outline-none focus:ring-amber-300"
            />
            <button type="button" disabled={busy} onClick={claim} className="shrink-0 rounded-xl bg-white/10 px-4 font-bold text-white hover:bg-white/20 disabled:opacity-50">
              接回進度
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-white/40">暱稱會公開顯示在排行榜上。不需要密碼或 email；揪團約打用的也是同一個身分。</p>
        </div>
      )}
      {error && <p className="mt-3 rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</p>}
    </Sheet>
  );
};

// ───────────────────────────── 歷史排行榜 ─────────────────────────────

const BOARDS: { id: ArcadeBoard; label: string; unit: string; desc: string }[] = [
  { id: 'points', label: '積分', unit: '分', desc: '歷史累計：贏新手 1 分、球友 2 分、高手 4 分、今日挑戰 3 分' },
  { id: 'pro', label: '擊敗高手', unit: '勝', desc: '歷史累計贏了高手電腦幾場' },
  { id: 'dink', label: 'Dink', unit: '拍', desc: 'Dink 挑戰的最長連續拍數' },
  { id: 'survival', label: '生存賽', unit: '關', desc: '連勝生存賽最多過了幾關' },
];


const MEDAL = ['🥇', '🥈', '🥉'];
/** 前三名的框色：金、銀、銅；其餘上榜的綠 */
const RING: Record<number, string> = {
  1: 'ring-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.55)]',
  2: 'ring-slate-200 shadow-[0_0_14px_rgba(226,232,240,0.45)]',
  3: 'ring-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.45)]',
};
/** 有名次框與皇冠的頭像 */
export const RankAvatar = ({ name, seed, size, rank }: { name: string; seed: number; size: number; rank: number | null }) => (
  <span className="relative inline-block shrink-0" style={{ width: size, height: size * 1.25 }}>
    <span className={`absolute left-0 top-0 rounded-[32%] ring-2 ${rank && RING[rank] ? RING[rank] : rank ? 'ring-emerald-400/60' : 'ring-transparent'}`} style={{ width: size, height: size }} />
    <PaddleAvatar name={name} seed={seed} size={size} />
    {rank === 1 && (
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-base leading-none drop-shadow" style={{ fontSize: size * 0.42 }} aria-hidden>
        👑
      </span>
    )}
  </span>
);

const monthText = (at: number) => new Date(at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
const dayText = (at: number) => new Date(at).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
const pct = (w: number, p: number) => (p ? Math.round((w / p) * 100) : 0);
/** 排行榜每一行底下的一句話：讓人看得出這個人怎麼打 */
const rowSub = (r: ArcadeStats) => {
  const bits: string[] = [];
  if (r.plays) bits.push(`${r.wins} 勝 ${r.plays - r.wins} 敗`);
  if (r.longestRally) bits.push(`連擊 ${r.longestRally}`);
  if (r.dailies) bits.push(`挑戰 ${r.dailies} 次`);
  return bits.join('・');
};

/** 頒獎台：前三名站台，第一名在中間最高 */
const Podium = ({ rows, unit, onPick }: { rows: ArcadeLeaderboard['rows']; unit: string; onPick: (id: string) => void }) => {
  const top = [rows[1], rows[0], rows[2]];
  const H = [72, 104, 56];
  const COLOR = ['from-slate-300/40 to-slate-400/10', 'from-amber-300/60 to-amber-500/10', 'from-orange-400/40 to-orange-600/10'];
  return (
    <div className="relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 px-2 pt-3 ring-1 ring-amber-300/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(252,211,77,0.22),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:repeating-linear-gradient(90deg,transparent_0_26px,rgba(255,255,255,0.05)_26px_27px)]" />
      <div className="relative grid grid-cols-3 items-end gap-1.5">
        {top.map((r, i) =>
          r ? (
            <motion.button
              key={r.id}
              type="button"
              onClick={() => onPick(r.id)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i === 1 ? 0.05 : 0.2 + i * 0.08, type: 'spring', stiffness: 320, damping: 26 }}
              className="flex flex-col items-center text-center"
            >
              <RankAvatar name={r.nickname} seed={r.avatarSeed} size={i === 1 ? 60 : 44} rank={r.rank} />
              <span className={`mt-0.5 w-full truncate px-1 font-black text-white ${i === 1 ? 'text-base' : 'text-sm'}`}>{r.nickname}</span>
              {topTitle(r) && <span className="truncate text-[10px] text-amber-200/90">{topTitle(r)!.icon} {topTitle(r)!.name}</span>}
              <span className={`mt-1 flex w-full flex-col items-center justify-start rounded-t-2xl bg-gradient-to-b ${COLOR[i]} pt-2`} style={{ height: H[i] }}>
                <span className="text-xl leading-none">{MEDAL[r.rank - 1]}</span>
                <span className="mt-1 text-sm font-black tabular-nums text-white">
                  {r.value}
                  <span className="ml-0.5 text-[10px] text-white/60">{unit}</span>
                </span>
              </span>
            </motion.button>
          ) : (
            <div key={i} className="flex flex-col items-center justify-end">
              <span className="w-full rounded-t-2xl bg-white/5 pt-2 text-center text-xl" style={{ height: H[i] }}>
                {MEDAL[[2, 1, 3][i] - 1]}
                <span className="block text-[10px] text-white/35">虛位以待</span>
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export const LeaderboardSheet = ({ open, onClose, onSignIn }: { open: boolean; onClose: () => void; onSignIn: () => void }) => {
  const [board, setBoard] = useState<ArcadeBoard>('points');
  const [data, setData] = useState<ArcadeLeaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<{ id: string; isMe: boolean } | null>(null);
  useEffect(() => {
    if (!open) return;
    let alive = true;
    const hit = cached(board);
    setData(hit);
    setError(null);
    if (hit) return;
    loadBoard(board)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(errText(e)));
    return () => {
      alive = false;
    };
  }, [open, board]);
  const def = BOARDS.find((b) => b.id === board)!;
  const rest = data?.rows.slice(3) ?? [];

  return (
    <>
      <Sheet open={open} onClose={onClose} title="🏆 歷史排行榜" sub={data?.since ? `自 ${monthText(data.since)}起累計・點任何一位看球友卡` : '成績永久累計，不會歸零'}>
        <div className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-950/70 p-1 ring-1 ring-white/10">
          {BOARDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBoard(b.id)}
              className={`rounded-xl py-1.5 text-sm font-black transition-colors ${board === b.id ? 'bg-amber-300 text-amber-950' : 'text-white/65 hover:text-white'}`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-white/45">{def.desc}</p>

        {data && data.rows.length > 0 && <Podium rows={data.rows} unit={def.unit} onPick={(id) => setPlayer({ id, isMe: data.me?.id === id })} />}

        {/* 自己的名次 */}
        {signedIn() ? (
          data?.me && (
            <button
              type="button"
              onClick={() => data.me && setPlayer({ id: data.me.id, isMe: true })}
              className="mt-3 flex w-full items-center justify-between rounded-2xl bg-emerald-400/15 px-4 py-2.5 text-left ring-1 ring-emerald-300/40 hover:bg-emerald-400/20"
            >
              <span className="text-sm font-bold text-emerald-100">我的名次</span>
              <span className="text-sm font-black text-white">
                {data.me.rank ? `第 ${data.me.rank} 名・` : '還沒上榜・'}
                {data.me.value} {def.unit}
                <span className="ml-1.5 text-[11px] font-bold text-emerald-300">球友卡 ›</span>
              </span>
            </button>
          )
        ) : (
          <button type="button" onClick={onSignIn} className="mt-3 w-full rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 py-2.5 text-sm font-black text-amber-950">
            取個暱稱，戰績就會被記下來 →
          </button>
        )}

        <div className="mt-3 space-y-1.5">
          {error && <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</p>}
          {!data && !error && <p className="py-8 text-center text-sm text-white/40">載入中…</p>}
          {data && data.rows.length === 0 && <p className="py-8 text-center text-sm text-white/50">還沒有人上榜，現在打一場就是第一名！</p>}
          {rest.map((r) => {
            const t = topTitle(r);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setPlayer({ id: r.id, isMe: r.isMe })}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${r.isMe ? 'bg-emerald-400/15 ring-1 ring-emerald-300/50' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <span className="w-7 text-center text-sm font-black tabular-nums text-white/70">{r.rank}</span>
                <RankAvatar name={r.nickname} seed={r.avatarSeed} size={34} rank={r.rank <= 10 ? r.rank : null} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold text-white">{r.nickname}</span>
                    {t && (
                      <span className="shrink-0 rounded-full bg-amber-300/15 px-1.5 py-px text-[10px] font-bold text-amber-200">
                        {t.icon} {t.name}
                      </span>
                    )}
                    {r.isMe && <span className="shrink-0 text-[10px] text-emerald-300">（你）</span>}
                  </span>
                  <span className="block truncate text-[11px] text-white/45">{rowSub(r) || '剛加入'}</span>
                </span>
                <span className="text-sm font-black tabular-nums text-amber-300">
                  {r.value}
                  <span className="ml-0.5 text-[10px] text-white/50">{def.unit}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Sheet>
      <PlayerCardSheet id={player?.id ?? null} isMe={!!player?.isMe} onClose={() => setPlayer(null)} />
    </>
  );
};

// ───────────────────────────── 球友卡 ─────────────────────────────

const MODE_LABEL: Record<ArcadePlayerCard['recent'][number]['mode'], string> = { match: '對戰', daily: '今日挑戰', dink: 'Dink', survival: '生存賽' };
const DIFF_LABEL = { rookie: '新手', club: '球友', pro: '高手' } as const;
const venueName = (id: string) => VENUES.find((v) => v.id === id)?.short ?? id;
const paddleName = (id: string) => PADDLES.find((p) => p.id === id)?.name ?? id;

const Stat = ({ label, value, unit }: { label: string; value: number | string; unit?: string }) => (
  <div className="rounded-xl bg-white/5 px-2.5 py-2 ring-1 ring-white/10">
    <div className="text-[10px] text-white/45">{label}</div>
    <div className="text-base font-black tabular-nums text-white">
      {value}
      {unit && <span className="ml-0.5 text-[10px] font-bold text-white/45">{unit}</span>}
    </div>
  </div>
);

/** 自己的球友卡：畫成 1080×1350 的圖分享到 Threads／IG */
const ShareCardButton = ({ card }: { card: ArcadePlayerCard }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = playerCardText(card, titlesOf(card));
  useEffect(() => {
    let alive = true;
    let url: string | null = null;
    void drawPlayerCard(card, titlesOf(card))
      .then(canvasToFile)
      .then((f) => {
        if (!alive || !f) return;
        url = URL.createObjectURL(f);
        setFile(f);
        setPreview(url);
      });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [card]);
  const share = () => {
    track('share', { content: 'player_card', method: file && navigator.canShare?.({ files: [file] }) ? 'share_sheet' : 'download' });
    if (file && navigator.canShare?.({ files: [file] })) {
      void copyText(text);
      navigator.share({ files: [file], text }).catch((e: unknown) => {
        if ((e as DOMException)?.name !== 'AbortError') setOpen(true);
      });
      return;
    }
    if (preview) download(preview, 'pickle-master-card.png');
    void copyText(text).then((ok) => ok && setCopied(true));
    setOpen(true);
  };
  return (
    <>
      <button
        type="button"
        disabled={!file}
        onClick={share}
        className="w-full rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 py-3 font-black text-slate-950 shadow-lg shadow-orange-500/20 disabled:opacity-60"
      >
        {file ? '📣 分享我的球友卡' : '產生球友卡…'}
      </button>
      {createPortal(
        <AnimatePresence>
          {open && preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            >
              <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="flex max-h-full w-full max-w-sm flex-col items-center" onClick={(e) => e.stopPropagation()}>
                <img src={preview} alt="球友卡" className="max-h-[62svh] w-auto rounded-2xl shadow-2xl shadow-black/60" />
                <p className="mt-3 text-center text-xs text-white/60">在 Threads／IG 的內建瀏覽器裡，長按圖片即可儲存</p>
                <div className="mt-3 grid w-full grid-cols-2 gap-2">
                  <button type="button" onClick={() => download(preview, 'pickle-master-card.png')} className="rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white hover:bg-white/15">
                    下載圖片
                  </button>
                  <button type="button" onClick={() => void copyText(text).then((ok) => ok && setCopied(true))} className="rounded-xl bg-emerald-400 py-2.5 text-sm font-bold text-emerald-950">
                    {copied ? '已複製 ✓' : '複製分享文字'}
                  </button>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="mt-2 py-1.5 text-sm font-semibold text-white/55 hover:text-white">
                  關閉
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.fullscreenElement ?? document.body,
      )}
    </>
  );
};

/** 公開的球友卡：名次、稱號、勝率、分難度戰績、最愛、最近幾場；自己的可以分享成圖 */
export const PlayerCardSheet = ({ id, isMe, onClose }: { id: string | null; isMe?: boolean; onClose: () => void }) => {
  const [card, setCard] = useState<ArcadePlayerCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setCard(null);
    setError(null);
    if (!id) return;
    let alive = true;
    getArcadePlayer(id)
      .then((c) => alive && setCard(c))
      .catch((e) => alive && setError(errText(e)));
    return () => {
      alive = false;
    };
  }, [id]);
  const titles = card ? titlesOf(card) : [];
  const next = card ? nextTitle(card) : null;
  const diffs = card ? (['rookie', 'club', 'pro'] as const).map((d) => ({ d, ...(card.byDifficulty[d] ?? { wins: 0, plays: 0 }) })) : [];
  const top3 = !!card?.rank && card.rank <= 3;

  return (
    <Sheet open={!!id} onClose={onClose} title={card ? `${card.nickname} 的球友卡` : '球友卡'} sub={card ? `${dayText(card.joinedAt)} 加入` : undefined}>
      {error && <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</p>}
      {!card && !error && <p className="py-8 text-center text-sm text-white/40">載入中…</p>}
      {card && (
        <div className="space-y-3">
          <div
            className={`relative overflow-hidden rounded-2xl p-3 ring-1 ${
              top3 ? 'bg-gradient-to-br from-amber-300/25 via-orange-500/10 to-slate-900 ring-amber-300/50' : 'bg-gradient-to-br from-amber-300/15 to-orange-500/10 ring-amber-300/30'
            }`}
          >
            {top3 && <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/25 blur-3xl" />}
            <div className="relative flex items-center gap-3">
              <RankAvatar name={card.nickname} seed={card.avatarSeed} size={56} rank={card.rank} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-lg font-black text-white">{card.nickname}</div>
                {card.rank ? (
                  <div className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-px text-[11px] font-black ${top3 ? 'bg-amber-300 text-amber-950' : 'bg-white/10 text-amber-200'}`}>
                    {card.rank <= 3 ? MEDAL[card.rank - 1] : '🏆'} 歷史積分榜 第 {card.rank} 名
                  </div>
                ) : (
                  <div className="text-[11px] text-white/45">還沒有積分</div>
                )}
                <div className="mt-1 flex flex-wrap gap-1">
                  {titles.length ? (
                    titles.map((t) => (
                      <span key={t.name} title={t.how} className="rounded-full bg-amber-300/15 px-2 py-px text-[11px] font-bold text-amber-200">
                        {t.icon} {t.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-white/45">還沒有稱號</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isMe && <ShareCardButton card={card} />}

          <div className="grid grid-cols-3 gap-1.5">
            <Stat label="積分" value={card.points} unit="分" />
            <Stat label="勝率" value={card.plays ? `${pct(card.wins, card.plays)}%` : '—'} />
            <Stat label="出賽" value={card.plays} unit="場" />
            <Stat label="擊敗高手" value={card.proWins} unit="勝" />
            <Stat label="最長連擊" value={card.longestRally} unit="拍" />
            <Stat label="Dink 最長" value={card.dinkBest} unit="拍" />
            <Stat label="生存賽" value={card.survivalBest} unit="關" />
            <Stat label="今日挑戰" value={card.dailies} unit="次" />
            <Stat label="最愛球場" value={card.favVenue ? venueName(card.favVenue.value) : '—'} />
          </div>

          {card.plays > 0 && (
            <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="text-xs font-bold text-white/70">分難度戰績</div>
              <div className="mt-2 space-y-1.5">
                {diffs.map(({ d, wins, plays }) => (
                  <div key={d} className="flex items-center gap-2 text-[11px]">
                    <span className="w-8 text-white/60">{DIFF_LABEL[d]}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" style={{ width: `${pct(wins, plays)}%` }} />
                    </div>
                    <span className="w-20 text-right tabular-nums text-white/70">{plays ? `${wins} 勝 ${plays - wins} 敗` : '沒打過'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(card.favCharacter || card.favPaddle) && (
            <div className="flex gap-1.5 text-[11px]">
              {card.favCharacter && (
                <div className="flex-1 rounded-xl bg-white/5 px-2.5 py-2 ring-1 ring-white/10">
                  <div className="text-white/45">愛用選手</div>
                  <div className="font-bold text-white">{characterById(card.favCharacter.value).name}</div>
                </div>
              )}
              {card.favPaddle && (
                <div className="flex-1 rounded-xl bg-white/5 px-2.5 py-2 ring-1 ring-white/10">
                  <div className="text-white/45">愛用球拍</div>
                  <div className="font-bold text-white">{paddleName(card.favPaddle.value)}</div>
                </div>
              )}
            </div>
          )}

          {next && (
            <div className="rounded-xl bg-white/5 px-3 py-2 text-[11px] text-white/55 ring-1 ring-white/10">
              下一個稱號 <b className="text-amber-200">{next.icon} {next.name}</b>：{next.how}
            </div>
          )}

          {card.recent.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-bold text-white/70">最近幾場</div>
              <div className="space-y-1">
                {card.recent.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px]">
                    {r.mode === 'match' || r.mode === 'daily' ? (
                      <span className={`w-4 text-center font-black ${r.won ? 'text-emerald-300' : 'text-rose-300'}`}>{r.won ? '勝' : '敗'}</span>
                    ) : (
                      <span className="w-4 text-center text-white/35">◦</span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-white/80">
                      {MODE_LABEL[r.mode]}
                      {r.mode === 'match' || r.mode === 'daily' ? `・${DIFF_LABEL[r.difficulty]}` : ''}・{venueName(r.venue)}
                    </span>
                    <span className="tabular-nums text-white/60">
                      {r.mode === 'dink' ? `${r.rallies} 拍` : r.mode === 'survival' ? `${r.rallies} 關` : `${r.score[0]}：${r.score[1]}`}
                    </span>
                    <span className="w-9 text-right text-white/35">{dayText(r.at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
};
