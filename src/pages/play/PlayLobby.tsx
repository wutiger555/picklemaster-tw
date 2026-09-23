import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import GameCard from '../../components/play/GameCard';
import PaddleAvatar from '../../components/play/PaddleAvatar';
import { useCourts } from '../../components/play/useCourts';
import { dayOffset, taipeiDayStart, tp, weekdayName } from '../../components/play/playFormat';
import { getFixedSessions } from '../../utils/fixedSessions';
import { courtSlug } from '../../utils/slugify';
import { getCachedMe, listGames, type GameSummary } from '../../utils/playApi';

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

  const selectedWd = day === 'all' ? null : days[day].wd;
  const fixedShown = fixed.filter((f) => (city === '全部' || f.city === city) && (selectedWd === null || f.weekdays.includes(selectedWd)));

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

        {/* 可報名的團 */}
        <section className="mt-7" aria-labelledby="play-open">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="play-open" className="text-lg font-black text-neutral-900">可以報名的團</h2>
            <span className="text-xs text-neutral-500">{games ? `${shown.length} 團` : ''}</span>
          </div>
          {games === null ? (
            <div className="grid min-h-[70vh] content-start gap-3 md:grid-cols-2" aria-busy="true">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-white shadow-sm" />)}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <b className="block">暫時讀不到揪團資料</b>{error}。下面的固定球敘不受影響，可以直接聯絡主辦。
            </div>
          ) : shown.length ? (
            <div className="grid gap-3 md:grid-cols-2">{shown.map((g) => <GameCard key={g.id} g={g} />)}</div>
          ) : (
            <EmptyState />
          )}
        </section>

        {/* 固定球敘（本站查證的自有資料） */}
        <section className="mt-10" aria-labelledby="play-fixed">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 id="play-fixed" className="text-lg font-black text-neutral-900">
              {selectedWd === null ? '每週固定球敘' : `${weekdayName(selectedWd)}的固定球敘`}
            </h2>
            <span className="text-xs text-neutral-500">{fixedShown.length} 個</span>
          </div>
          <p className="mb-3 text-[13px] text-neutral-500">各地球場公告的球敘時段，由本站逐筆查證。直接到場或聯絡主辦即可參加；你是主辦的話，可以把它開成站上的團，讓大家線上報名。</p>
          <div className="grid gap-3 md:grid-cols-2">
            {fixedShown.map((f) => {
              const c = courtById.get(f.courtId);
              return (
                <article key={f.courtId} className="rounded-2xl border-[1.5px] border-dashed border-neutral-200 bg-white/80 p-4">
                  <span className="rounded-md bg-neutral-900 px-2 py-0.5 text-[11px] font-black text-white">固定球敘</span>
                  <h3 className="mt-2 text-[15px] font-black text-neutral-900">
                    <Link to={`/courts/${courtSlug(f.courtId)}/`} className="hover:text-teal-700">{f.courtName}</Link>
                  </h3>
                  <p className="text-[13px] text-neutral-600">{f.schedule}</p>
                  {f.organizer && <p className="mt-0.5 text-[12px] text-neutral-500">主辦／聯絡：{f.organizer}</p>}
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-neutral-400">{f.city}{f.district ? ` ${f.district}` : ''}{f.verified ? ` · ${f.verified} 查證` : ''}</span>
                    {c && <Link to={`/play/?new&court=${f.courtId}`} className="whitespace-nowrap text-[12px] font-bold text-teal-700">我是主辦，開成線上團 →</Link>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptyState() {
  const reduce = useReducedMotion();
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
