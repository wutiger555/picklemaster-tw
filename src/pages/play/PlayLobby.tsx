import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import GameCard from '../../components/play/GameCard';
import PaddleAvatar from '../../components/play/PaddleAvatar';
import { useCourts } from '../../components/play/useCourts';
import SessionCard from '../../components/play/SessionCard';
import ProfileSheet, { type Profile } from '../../components/play/ProfileSheet';
import { Toast, type ToastMsg } from '../../components/play/Sheet';
import { dayLabel, dayOffset, taipeiDayStart, tp, weekdayName } from '../../components/play/playFormat';
import { getFixedSessions, taipeiDate, upcomingOccurrences, type Occurrence } from '../../utils/fixedSessions';
import { ensurePlayer, getCachedMe, listGames, listInterests, setInterest, type GameSummary } from '../../utils/playApi';

const ikey = (courtId: number, date: string) => `${courtId}|${date}`;

type Filter = 'beginner' | 'indoor' | 'free' | 'almost';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'beginner', label: '新手友善' },
  { key: 'indoor', label: '室內' },
  { key: 'free', label: '免費場' },
  { key: 'almost', label: '快滿了' },
];

export default function PlayLobby() {
  const courts = useCourts();
  const me = getCachedMe();
  const [games, setGames] = useState<GameSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState<number | 'all'>('all');
  const [filters, setFilters] = useState<Set<Filter>>(new Set());
  const [city, setCity] = useState<string>('全部');
  const [now, setNow] = useState(Date.now());
  const [interests, setInterests] = useState<Map<string, { count: number; mine: boolean }>>(new Map());
  const [pending, setPending] = useState<Occurrence | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [showAllDays, setShowAllDays] = useState(false);

  // 「進行中／幾點開始」每分鐘更新一次
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    listInterests(taipeiDate(Date.now()), taipeiDate(Date.now() + 6 * 86400_000))
      .then((list) => setInterests(new Map(list.map((i) => [ikey(i.courtId, i.date), { count: i.count, mine: i.mine }]))))
      .catch(() => undefined); // 讀不到就當作 0，不影響看球敘
  }, []);

  useEffect(() => {
    let alive = true;
    listGames({ days: 14 })
      .then((g) => alive && setGames(g))
      .catch((e: Error) => {
        if (!alive) return;
        setGames([]);
        setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, []);

  const courtById = useMemo(() => new Map((courts ?? []).map((c) => [c.id, c])), [courts]);
  const fixed = useMemo(() => (courts ? getFixedSessions(courts) : []), [courts]);

  const cities = useMemo(() => {
    const count = new Map<string, number>();
    for (const g of games ?? []) if (g.court.city) count.set(g.court.city, (count.get(g.court.city) ?? 0) + 1);
    for (const f of fixed) count.set(f.city, (count.get(f.city) ?? 0) + 1);
    return ['全部', ...[...count.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)];
  }, [games, fixed]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const start = taipeiDayStart(i);
    const t = tp(start);
    return { i, label: i === 0 ? '今天' : i === 1 ? '明天' : weekdayName(t.wd), date: t.d, wd: t.wd, has: (games ?? []).some((g) => dayOffset(g.startsAt) === i) };
  });

  const shown = (games ?? []).filter((g) => {
    if (day !== 'all' && dayOffset(g.startsAt) !== day) return false;
    if (city !== '全部' && g.court.city !== city) return false;
    if (filters.has('beginner') && !g.beginner) return false;
    if (filters.has('indoor') && g.court.type !== 'indoor') return false;
    if (filters.has('free') && g.feeTotal > 0) return false;
    if (filters.has('almost') && (g.capacity - (g.confirmedCount ?? 0) > 2 || g.capacity - (g.confirmedCount ?? 0) <= 0)) return false;
    return true;
  });

  const occurrences = useMemo(() => upcomingOccurrences(fixed, now, 7), [fixed, now]);
  const occShown = occurrences.filter((o) => (city === '全部' || o.session.city === city) && (day === 'all' || dayOffset(o.startsAt, now) === day));
  const byDay = useMemo(() => {
    const m = new Map<number, Occurrence[]>();
    for (const o of occShown) {
      const d = dayOffset(o.startsAt, now);
      m.set(d, [...(m.get(d) ?? []), o]);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [occShown, now]);
  const todayCount = occurrences.filter((o) => dayOffset(o.startsAt, now) === 0).length;
  const weekGoing = [...interests.values()].reduce((n, i) => n + i.count, 0);

  const toggleInterest = useCallback(async (o: Occurrence, profile?: Profile) => {
    const k = ikey(o.session.courtId, o.date);
    const cur = interests.get(k) ?? { count: 0, mine: false };
    setBusyKey(k);
    setSheetError(null);
    try {
      if (profile) await ensurePlayer(profile);
      const r = await setInterest(o.session.courtId, o.date, !cur.mine);
      setInterests((prev) => new Map(prev).set(k, { count: r.count, mine: r.mine }));
      setPending(null);
      if (r.mine) setToast({ title: '已標記「我會去」', sub: `${dayLabel(o.startsAt)} ${o.session.courtName}，到場直接找主辦就好` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '沒有成功';
      if (profile) setSheetError(msg);
      else setToast({ title: '沒有成功', sub: msg });
    } finally {
      setBusyKey(null);
    }
  }, [interests]);

  const onInterest = (o: Occurrence) => (getCachedMe() ? toggleInterest(o) : setPending(o));

  const toggle = (k: Filter) =>
    setFilters((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-orange-50/30">
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-teal-200/30 to-cyan-200/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-gradient-to-br from-lime-200/40 to-yellow-200/20 blur-3xl" />
        </div>
        <div className="container relative mx-auto max-w-5xl px-4 pb-6 pt-8 md:pt-12">
          <motion.div initial={{ y: 12 }} animate={{ y: 0 }} transition={{ duration: 0.4 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white/70 px-3 py-1 font-mono text-[11px] font-bold tracking-[.14em] text-teal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" /> PICKUP GAMES
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-neutral-900 md:text-5xl">揪團約打</h1>
            <p className="mt-2 max-w-xl text-[15px] text-neutral-600 md:text-lg">
              挑一團、取個暱稱就能報名，不用註冊也不用下載 App。額滿自動候補，有人取消自動遞補。
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link to="/play/?new" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 font-black text-white shadow-lg shadow-teal-500/25 transition hover:-translate-y-0.5">
                <span className="text-xl leading-none">＋</span> 開一團
              </Link>
              <Link to="/play/?me" className="inline-flex h-12 items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 font-bold text-neutral-800 shadow-sm">
                <PaddleAvatar name={me?.nickname ?? '球友'} seed={me?.avatarSeed ?? 0} size={22} />
                {me ? `${me.nickname} 的球拍` : '我的球拍'}
              </Link>
            </div>
            {/* 即時數字：全部是真的（球敘來自查證資料、團與人數來自資料庫） */}
            <div className="mt-5 flex flex-wrap gap-2 text-[13px]" aria-live="polite">
              {courts && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />今天 <b className="font-mono text-neutral-900">{todayCount}</b> 場球敘
                </span>
              )}
              {games && games.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#2f6fd6]" /><b className="font-mono text-neutral-900">{games.length}</b> 個線上可報名的團
                </span>
              )}
              {weekGoing > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-lime-400" />這週 <b className="font-mono text-neutral-900">{weekGoing}</b> 人次說會去
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-4 pb-24">
        {/* 日期條 */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="group" aria-label="日期">
          <button type="button" aria-pressed={day === 'all'} onClick={() => setDay('all')}
            className={`grid w-[58px] flex-none justify-items-center rounded-2xl py-2 shadow-sm ${day === 'all' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800'}`}>
            <small className="text-[11px] opacity-70">兩週</small><b className="font-mono text-lg font-extrabold leading-tight">全部</b><i className="h-1.5 w-1.5" />
          </button>
          {days.map((d) => (
            <button key={d.i} type="button" aria-pressed={day === d.i} onClick={() => setDay(d.i)}
              className={`grid w-[54px] flex-none justify-items-center rounded-2xl py-2 shadow-sm ${day === d.i ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800'}`}>
              <small className="text-[11px] opacity-70">{d.label}</small>
              <b className="font-mono text-lg font-extrabold leading-tight">{d.date}</b>
              <i className={`h-1.5 w-1.5 rounded-full ${d.has ? (day === d.i ? 'bg-lime-300' : 'bg-teal-500') : 'bg-transparent'}`} />
            </button>
          ))}
        </div>

        {/* 篩選 */}
        <div className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="group" aria-label="篩選">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" aria-pressed={filters.has(f.key)} onClick={() => toggle(f.key)}
              className={`flex-none whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] ${filters.has(f.key) ? 'border-teal-500 bg-teal-50 font-bold text-teal-700' : 'border-neutral-200 bg-white text-neutral-700'}`}>
              {f.label}
            </button>
          ))}
          <label className="sr-only" htmlFor="play-city">縣市</label>
          <select id="play-city" value={city} onChange={(e) => setCity(e.target.value)}
            className="flex-none rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[13px] text-neutral-700">
            {cities.map((c) => <option key={c} value={c}>{c === '全部' ? '全部縣市' : c}</option>)}
          </select>
        </div>

        {(() => {
          const gamesSection = (
            <section key="games" className="mt-7" aria-labelledby="play-open">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 id="play-open" className="text-lg font-black text-neutral-900">線上可報名的團</h2>
                <span className="text-xs text-neutral-500">{games ? `${shown.length} 團` : ''}</span>
              </div>
              {games === null ? (
                <div className="grid min-h-[40vh] content-start gap-3 md:grid-cols-2" aria-busy="true">
                  {[0, 1].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-white shadow-sm" />)}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <b className="block">暫時讀不到揪團資料</b>{error}。固定球敘不受影響，可以直接到場或聯絡主辦。
                </div>
              ) : shown.length ? (
                <div className="grid gap-3 md:grid-cols-2">{shown.map((g) => <GameCard key={g.id} g={g} />)}</div>
              ) : (
                <EmptyState compact={games.length === 0} />
              )}
            </section>
          );
          const sessionsSection = (
            <section key="sessions" className="mt-7" aria-labelledby="play-fixed">
              <div className="mb-1 flex items-baseline justify-between">
                <h2 id="play-fixed" className="text-lg font-black text-neutral-900">
                  {day === 'all' ? '近 7 天的固定球敘' : `${days[day].label}的固定球敘`}
                </h2>
                <span className="text-xs text-neutral-500">{courts ? `${occShown.length} 場` : ''}</span>
              </div>
              <p className="mb-3 text-[13px] text-neutral-500">各地球場公告的固定球敘，由本站逐筆查證。直接到場或聯絡主辦就能參加；按「我會去」讓其他球友知道有人要去。</p>
              {courts === null ? (
                <div className="grid min-h-[60vh] content-start gap-3 md:grid-cols-2" aria-busy="true">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-white shadow-sm" />)}
                </div>
              ) : !occShown.length ? (
                <p className="rounded-2xl bg-white p-4 text-sm text-neutral-600 shadow-sm">這個條件下沒有固定球敘，換一天或換個縣市看看。</p>
              ) : (
                <div className="space-y-5">
                  {(showAllDays || day !== 'all' ? byDay : byDay.slice(0, 2)).map(([d, list]) => (
                    <div key={d}>
                      {day === 'all' && (
                        <h3 className="mb-2 text-sm font-black text-neutral-700">
                          {d === 0 ? '今天' : d === 1 ? '明天' : weekdayName(tp(taipeiDayStart(d, now)).wd)}
                          <span className="ml-1.5 font-mono text-xs font-medium text-neutral-400">{tp(taipeiDayStart(d, now)).m}/{tp(taipeiDayStart(d, now)).d} · {list.length} 場</span>
                        </h3>
                      )}
                      <div className="grid gap-3 md:grid-cols-2">
                        {list.map((o) => {
                          const k = ikey(o.session.courtId, o.date);
                          const i = interests.get(k);
                          return (
                            <SessionCard key={k} o={o} now={now} count={i?.count ?? 0} mine={!!i?.mine} busy={busyKey === k}
                              onToggle={() => onInterest(o)} canHost={courtById.has(o.session.courtId)} />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {day === 'all' && !showAllDays && byDay.length > 2 && (
                    <button type="button" onClick={() => setShowAllDays(true)} className="h-11 w-full rounded-2xl border border-neutral-200 bg-white font-bold text-neutral-700">
                      顯示之後 {byDay.length - 2} 天的球敘（{byDay.slice(2).reduce((n, [, l]) => n + l.length, 0)} 場）
                    </button>
                  )}
                </div>
              )}
            </section>
          );
          // 還沒有線上的團時，先讓真的在發生的球敘出現在最上面
          return games && games.length === 0 ? [sessionsSection, gamesSection] : [gamesSection, sessionsSection];
        })()}
      </div>

      <ProfileSheet
        open={!!pending}
        onClose={() => setPending(null)}
        title="標記「我會去」"
        confirmLabel="我會去"
        note="只會顯示「幾位球友說會去」，不會列出你的暱稱。"
        busy={!!busyKey}
        error={sheetError}
        onConfirm={(p) => pending && toggleInterest(pending, p)}
      />
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function EmptyState({ compact }: { compact?: boolean }) {
  const reduce = useReducedMotion();
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-lime-300 text-lg" aria-hidden>🏓</span>
        <p className="flex-1 text-sm text-neutral-600"><b className="block text-neutral-900">還沒有線上可報名的團</b>你平常就在揪球的話，把它開在這裡，大家就能直接報名。</p>
        <Link to="/play/?new" className="flex-none rounded-xl bg-neutral-900 px-3 py-2 text-sm font-bold text-white">開一團</Link>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-white px-6 py-8 text-center shadow-sm">
      <svg viewBox="0 0 100 100" className="mx-auto mb-2 h-20 w-20" aria-hidden>
        <ellipse cx="50" cy="88" rx="24" ry="4" fill="#e5e7eb" />
        <motion.g animate={reduce ? undefined : { y: [0, -14, 0] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}>
          <circle cx="50" cy="46" r="20" fill="#d9f23f" />
          <g fill="#3b4a00" opacity=".35"><circle cx="43" cy="39" r="2.4" /><circle cx="55" cy="38" r="2.4" /><circle cx="50" cy="48" r="2.4" /><circle cx="41" cy="52" r="2.4" /><circle cx="59" cy="52" r="2.4" /></g>
        </motion.g>
      </svg>
      <b className="block text-neutral-900">這個條件下還沒有團</b>
      <p className="mt-1 text-sm text-neutral-500">當第一個開團的人吧，四個步驟就開好了。</p>
      <Link to="/play/?new" className="mt-4 inline-flex h-11 items-center rounded-2xl bg-neutral-900 px-5 font-bold text-white">開一團</Link>
    </div>
  );
}
