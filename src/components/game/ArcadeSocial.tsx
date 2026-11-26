import { type ReactNode, useEffect, useState } from 'react';
import { PADDLES } from './engine/paddles';
import { characterById } from './characters';
import { VENUES } from './venues';
import { nextTitle, titlesOf, topTitle } from './titles';
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
  getArcadeLeaderboard,
  getArcadePlayer,
  getCachedMe,
  issuePlayerCode,
} from '../../utils/playApi';
import { boardCacheKey as cacheKey, lastSynced, pull, signedIn } from './cloud';

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
          className="flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-3xl border border-white/10 bg-slate-900 md:rounded-3xl"
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

const CACHE_MS = 5 * 60_000;
const cached = (b: ArcadeBoard): ArcadeLeaderboard | null => {
  try {
    const raw = sessionStorage.getItem(cacheKey(b));
    if (!raw) return null;
    const v = JSON.parse(raw) as { at: number; data: ArcadeLeaderboard };
    return Date.now() - v.at < CACHE_MS ? v.data : null;
  } catch {
    return null;
  }
};

const MEDAL = ['🥇', '🥈', '🥉'];
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

export const LeaderboardSheet = ({ open, onClose, onSignIn }: { open: boolean; onClose: () => void; onSignIn: () => void }) => {
  const [board, setBoard] = useState<ArcadeBoard>('points');
  const [data, setData] = useState<ArcadeLeaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    let alive = true;
    const hit = cached(board);
    setData(hit);
    setError(null);
    if (hit) return;
    getArcadeLeaderboard(board)
      .then((d) => {
        if (!alive) return;
        setData(d);
        try {
          sessionStorage.setItem(cacheKey(board), JSON.stringify({ at: Date.now(), data: d }));
        } catch {
          /* 存不了 */
        }
      })
      .catch((e) => alive && setError(errText(e)));
    return () => {
      alive = false;
    };
  }, [open, board]);
  const def = BOARDS.find((b) => b.id === board)!;

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

        {/* 自己的名次 */}
        {signedIn() ? (
          data?.me && (
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-emerald-400/15 px-4 py-2.5 ring-1 ring-emerald-300/40">
              <span className="text-sm font-bold text-emerald-100">我的名次</span>
              <span className="text-sm font-black text-white">
                {data.me.rank ? `第 ${data.me.rank} 名・` : '還沒上榜・'}
                {data.me.value} {def.unit}
              </span>
            </div>
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
          {data?.rows.map((r) => {
            const t = topTitle(r);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setPlayer(r.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${r.isMe ? 'bg-emerald-400/15 ring-1 ring-emerald-300/50' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <span className="w-7 text-center text-sm font-black text-white/70">{MEDAL[r.rank - 1] ?? r.rank}</span>
                <PaddleAvatar name={r.nickname} seed={r.avatarSeed} size={34} />
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
      <PlayerCardSheet id={player} onClose={() => setPlayer(null)} />
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

/** 公開的球友卡：稱號、勝率、分難度戰績、最愛、最近幾場 */
export const PlayerCardSheet = ({ id, onClose }: { id: string | null; onClose: () => void }) => {
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

  return (
    <Sheet open={!!id} onClose={onClose} title={card ? `${card.nickname} 的球友卡` : '球友卡'} sub={card ? `${dayText(card.joinedAt)} 加入` : undefined}>
      {error && <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</p>}
      {!card && !error && <p className="py-8 text-center text-sm text-white/40">載入中…</p>}
      {card && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-amber-300/15 to-orange-500/10 p-3 ring-1 ring-amber-300/30">
            <PaddleAvatar name={card.nickname} seed={card.avatarSeed} size={56} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-black text-white">{card.nickname}</div>
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
