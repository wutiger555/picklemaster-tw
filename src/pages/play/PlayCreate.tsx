import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ProfileSheet, { type Profile } from '../../components/play/ProfileSheet';
import { Toast, type ToastMsg } from '../../components/play/Sheet';
import { useCourts } from '../../components/play/useCourts';
import { FORMAT_LABEL, levelDesc, needsNet, taipeiDayStart, tp, weekdayName } from '../../components/play/playFormat';
import { createGame, ensurePlayer, getCachedMe, type Format } from '../../utils/playApi';
import type { Court } from '../../types';

const TIMES: [string, string][] = [['06:30', '晨打'], ['08:00', '早上'], ['10:00', ''], ['14:00', '午後'], ['16:00', ''], ['18:30', '下班'], ['19:00', ''], ['20:00', '夜打']];
const TYPE = { indoor: '室內', outdoor: '戶外', covered: '風雨' } as const;

function FormatPic({ kind }: { kind: Format }) {
  const court = (x: number, w: number) => <><rect x={x} y="6" width={w} height="34" rx="4" fill="#2f6fd6" /><path d={`M${x + w / 2} 6v34`} stroke="#fff" strokeWidth="2" /></>;
  return (
    <svg viewBox="0 0 120 46" className="mb-1.5 h-11 w-full" aria-hidden>
      {kind === 'rotation' && <>{court(2, 54)}<g fill="#d9f23f"><circle cx="16" cy="16" r="4" /><circle cx="16" cy="30" r="4" /><circle cx="42" cy="16" r="4" /><circle cx="42" cy="30" r="4" /></g><path d="M62 23h16m-5-5 5 5-5 5" stroke="#9ca3af" strokeWidth="2" fill="none" /><g fill="#9ca3af" opacity=".6"><circle cx="90" cy="16" r="4" /><circle cx="102" cy="16" r="4" /><circle cx="90" cy="30" r="4" /><circle cx="102" cy="30" r="4" /></g></>}
      {kind === 'challenge' && <>{court(30, 60)}<g fill="#d9f23f"><circle cx="45" cy="16" r="4" /><circle cx="45" cy="30" r="4" /></g><g fill="#fff"><circle cx="75" cy="16" r="4" /><circle cx="75" cy="30" r="4" /></g><path d="M20 12l8 4M20 34l8-4" stroke="#9ca3af" strokeWidth="2" /><circle cx="12" cy="10" r="4" fill="#9ca3af" /><circle cx="12" cy="36" r="4" fill="#9ca3af" /></>}
      {kind === 'partners' && <>{court(20, 80)}<rect x="32" y="11" width="14" height="24" rx="7" fill="none" stroke="#d9f23f" strokeWidth="2" /><rect x="74" y="11" width="14" height="24" rx="7" fill="none" stroke="#fff" strokeWidth="2" /><g fill="#d9f23f"><circle cx="39" cy="17" r="3.5" /><circle cx="39" cy="29" r="3.5" /></g><g fill="#fff"><circle cx="81" cy="17" r="3.5" /><circle cx="81" cy="29" r="3.5" /></g></>}
      {kind === 'singles' && <>{court(30, 60)}<circle cx="45" cy="23" r="4" fill="#d9f23f" /><circle cx="75" cy="23" r="4" fill="#fff" /></>}
    </svg>
  );
}

function Stepper({ label, sub, value, onChange, min, max, step = 1, format }: { label: string; sub: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; format?: (v: number) => string }) {
  return (
    <div className="mb-2.5 flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
      <span><b className="block text-sm text-neutral-900">{label}</b><small className="text-xs text-neutral-500">{sub}</small></span>
      <span className="flex items-center gap-3">
        <button type="button" aria-label={`減少${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-100 text-xl font-bold disabled:opacity-40">−</button>
        <b className="min-w-[44px] text-center font-mono text-xl tabular-nums">{format ? format(value) : value}</b>
        <button type="button" aria-label={`增加${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-100 text-xl font-bold disabled:opacity-40">+</button>
      </span>
    </div>
  );
}

export default function PlayCreate() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const courts = useCourts();
  const [step, setStep] = useState(0);
  const [q, setQ] = useState('');
  const [court, setCourt] = useState<Court | null>(null);
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('19:00');
  const [hours, setHours] = useState(2);
  const [courtsBooked, setCourtsBooked] = useState(1);
  const [capacity, setCapacity] = useState(6);
  const [format, setFormat] = useState<Format>('rotation');
  const [lv, setLv] = useState<[number, number]>([2.5, 3.5]);
  const [anyLevel, setAnyLevel] = useState(false);
  const [beginner, setBeginner] = useState(true);
  const [fee, setFee] = useState(0);
  const [cancelHours, setCancelHours] = useState(6);
  const [recur, setRecur] = useState(false);
  const [title, setTitle] = useState('');
  const [community, setCommunity] = useState('');
  const [note, setNote] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMsg | null>(null);

  const pick = (c: Court) => {
    setCourt(c);
    const n = 1;
    setCourtsBooked(n);
    setCapacity(n * 4 + 2);
    setFee(c.fee === 'free' ? 0 : 700);
  };

  // 從固定球敘「開成線上團」過來的會帶 ?court=
  useEffect(() => {
    const id = Number(params.get('court'));
    if (!courts || !id || court) return;
    const c = courts.find((x) => x.id === id && !x.status);
    if (c) {
      pick(c);
      setRecur(true);
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courts]);

  const list = useMemo(() => {
    const open = (courts ?? []).filter((c) => !c.status);
    const s = q.trim();
    return s ? open.filter((c) => `${c.name}${c.location.city}${c.location.district ?? ''}`.includes(s)) : open;
  }, [courts, q]);

  const startsAt = useMemo(() => {
    const [hh, mm] = time.split(':').map(Number);
    return taipeiDayStart(day) + (hh * 60 + mm) * 60000;
  }, [day, time]);
  const t = tp(startsAt);
  const defaultTitle = court ? `${court.name.replace(/^(台北市|新北市|臺北市|台中市|臺中市|高雄市|台南市|臺南市|桃園市)/, '')} ${weekdayName(t.wd)}約打` : '';

  const canNext = step === 0 ? !!court : step === 1 ? startsAt > Date.now() + 15 * 60000 : true;

  const publish = async (profile?: Profile) => {
    if (!court) return;
    setBusy(true);
    setError(null);
    try {
      if (profile) await ensurePlayer(profile);
      const r = await createGame({
        courtId: court.id,
        title: (title.trim() || defaultTitle).slice(0, 40),
        startsAt,
        durationMin: hours * 60,
        courtsBooked,
        capacity,
        minPlayers: Math.min(4, capacity),
        levelMin: anyLevel ? null : lv[0],
        levelMax: anyLevel ? null : lv[1],
        format,
        scoring: 'side_out_11',
        feeTotal: fee,
        beginner,
        cancelHours,
        communityUrl: community.trim() || null,
        note: note.trim() || null,
        recurWeekly: recur,
      });
      navigate(`/play/?g=${r.game.id}&created`, { replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '開團失敗';
      if (profileOpen) setError(msg);
      else setToast({ title: '沒有開成功', sub: msg });
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (!canNext) return;
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    if (getCachedMe()) publish();
    else setProfileOpen(true);
  };

  const pct = (v: number) => ((v - 2) / 3) * 100;

  return (
    <div className="min-h-screen bg-neutral-50 pb-32">
      <div className="container mx-auto max-w-xl px-4 pt-6 md:pt-10">
        <div className="mb-3 flex items-center gap-3">
          {step === 0 ? (
            <Link to="/play/" className="rounded-xl bg-white px-3 py-2 text-sm font-bold shadow-sm">← 大廳</Link>
          ) : (
            <button type="button" onClick={() => setStep(step - 1)} className="rounded-xl bg-white px-3 py-2 text-sm font-bold shadow-sm">← 上一步</button>
          )}
          <h1 className="flex-1 text-lg font-black text-neutral-900">開一團</h1>
          <span className="font-mono text-xs text-neutral-500">{step + 1} / 4</span>
        </div>
        <div className="mb-6 flex gap-1.5" aria-hidden>
          {[0, 1, 2, 3].map((i) => <i key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-teal-500' : 'bg-neutral-200'}`} />)}
        </div>

        {step === 0 && (
          <section>
            <h2 className="text-xl font-black text-neutral-900">在哪座球場？</h2>
            <p className="mb-4 mt-1 text-[13px] text-neutral-500">只能選站上收錄的球場。面數、室內外、網子類型會自動帶入。找不到？<Link to="/contact/" className="text-teal-700 underline">告訴我們新增</Link></p>
            <label className="mb-3 flex h-12 items-center gap-2 rounded-2xl bg-white px-4 shadow-sm">
              <span aria-hidden className="text-neutral-400">⌕</span>
              <span className="sr-only">搜尋球場</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜尋球場或行政區，例如：北投、大安" className="h-full flex-1 bg-transparent text-base outline-none" />
            </label>
            <div className="grid gap-2">
              {courts === null && <div className="h-[60vh] animate-pulse rounded-2xl bg-white" />}
              {list.slice(0, 60).map((c) => (
                <button key={c.id} type="button" onClick={() => pick(c)} aria-pressed={court?.id === c.id}
                  className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-3 text-left shadow-sm ${court?.id === c.id ? 'border-teal-500' : 'border-transparent'}`}>
                  <span className={`grid h-11 w-11 flex-none place-items-center rounded-xl text-sm font-black text-white ${c.type === 'indoor' ? 'bg-emerald-500' : 'bg-[#2f6fd6]'}`}>{c.courts_count}面</span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-sm text-neutral-900">{c.name}</b>
                    <small className="text-xs text-neutral-500">{c.location.city}{c.location.district ?? ''} · {TYPE[c.type]} · {c.fee === 'free' ? '免費' : '收費'}{needsNet(c.net_type) ? ' · 要帶網' : ''}</small>
                  </span>
                </button>
              ))}
              {courts && !list.length && <p className="rounded-2xl bg-white p-4 text-sm text-neutral-600">找不到符合「{q}」的球場。</p>}
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <h2 className="text-xl font-black text-neutral-900">什麼時候打？</h2>
            <p className="mb-4 mt-1 text-[13px] text-neutral-500">{court?.name}</p>
            <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              {Array.from({ length: 14 }, (_, i) => {
                const d = tp(taipeiDayStart(i));
                return (
                  <button key={i} type="button" aria-pressed={day === i} onClick={() => setDay(i)}
                    className={`grid w-[54px] flex-none justify-items-center rounded-2xl py-2 shadow-sm ${day === i ? 'bg-neutral-900 text-white' : 'bg-white'}`}>
                    <small className="text-[11px] opacity-70">{i === 0 ? '今天' : i === 1 ? '明天' : weekdayName(d.wd)}</small>
                    <b className="font-mono text-lg font-extrabold">{d.d}</b>
                  </button>
                );
              })}
            </div>
            <div className="mb-3 grid grid-cols-4 gap-1.5">
              {TIMES.map(([v, tag]) => (
                <button key={v} type="button" aria-pressed={time === v} onClick={() => setTime(v)}
                  className={`h-12 rounded-xl font-mono font-bold shadow-sm ${time === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800'}`}>
                  {v}<span className="block font-sans text-[10px] font-medium opacity-70">{tag || ' '}</span>
                </button>
              ))}
            </div>
            <label className="mb-5 flex items-center gap-2 text-sm text-neutral-600">
              其他時間
              <input type="time" value={time} step={900} onChange={(e) => e.target.value && setTime(e.target.value)} className="rounded-lg border border-neutral-200 bg-white px-2 py-1 font-mono text-base" />
            </label>
            <p className="mb-1.5 text-xs font-bold text-neutral-500">打多久</p>
            <div className="flex gap-1.5">
              {[1.5, 2, 3].map((h) => (
                <button key={h} type="button" aria-pressed={hours === h} onClick={() => setHours(h)}
                  className={`rounded-xl border-[1.5px] px-4 py-2 text-sm font-bold ${hours === h ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-transparent bg-white'}`}>{h} 小時</button>
              ))}
            </div>
            {!canNext && <p className="mt-3 text-sm text-red-600">開打時間至少要在 15 分鐘之後，請換一個時間。</p>}
          </section>
        )}

        {step === 2 && court && (
          <section>
            <h2 className="text-xl font-black text-neutral-900">幾面場、幾個人？</h2>
            <p className="mb-4 mt-1 text-[13px] text-neutral-500">人數上限預設「面數 × 4 ＋ 2」，多出來的人在休息區輪替。額滿後自動轉候補。</p>
            <Stepper label="訂了幾面場" sub={`這座球場共 ${court.courts_count} 面`} value={courtsBooked} min={1} max={Math.max(1, Math.min(court.courts_count, 12))}
              onChange={(v) => { setCourtsBooked(v); setCapacity(v * 4 + 2); }} />
            <Stepper label="人數上限" sub="包含你自己" value={capacity} min={2} max={courtsBooked * 8} onChange={setCapacity} />
            <p className="mb-2 mt-5 text-xs font-bold text-neutral-500">賽制</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FORMAT_LABEL) as Format[]).map((k) => (
                <button key={k} type="button" aria-pressed={format === k} onClick={() => setFormat(k)}
                  className={`rounded-2xl border-2 bg-white p-2.5 text-left shadow-sm ${format === k ? 'border-teal-500' : 'border-transparent'}`}>
                  <FormatPic kind={k} />
                  <b className="block text-[13px] text-neutral-900">{FORMAT_LABEL[k].name}</b>
                  <small className="text-[11px] leading-snug text-neutral-500">{FORMAT_LABEL[k].desc}</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && court && (
          <section>
            <h2 className="text-xl font-black text-neutral-900">程度和費用</h2>
            <p className="mb-4 mt-1 text-[13px] text-neutral-500">程度只用來幫大家配對，不做排名。</p>
            <div className={anyLevel ? 'opacity-40' : ''}>
              <div className="relative mx-1 h-11">
                <div className="absolute inset-x-0 top-[18px] h-2 rounded-full bg-gradient-to-r from-emerald-200 via-emerald-400 to-violet-500" />
                <div className="absolute top-[14px] h-4 rounded-full border-[3px] border-neutral-900" style={{ left: `${pct(lv[0])}%`, width: `${pct(lv[1]) - pct(lv[0])}%` }} />
                {[0, 1].map((i) => (
                  <input key={i} type="range" min={2} max={5} step={0.5} value={lv[i]} disabled={anyLevel} aria-label={i === 0 ? '最低程度' : '最高程度'}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setLv(i === 0 ? [Math.min(v, lv[1]), lv[1]] : [lv[0], Math.max(v, lv[0])]);
                    }}
                    className="play-range pointer-events-none absolute -inset-x-1 top-2.5 h-6 w-[calc(100%+8px)] appearance-none bg-transparent" />
                ))}
              </div>
              <div className="mx-0.5 mb-2 flex justify-between font-mono text-[11px] text-neutral-500">{['2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0'].map((x) => <span key={x}>{x}</span>)}</div>
              <p className="mb-2 rounded-2xl bg-teal-50 px-3 py-2.5 text-[13px] text-teal-800"><b className="font-mono text-lg">{lv[0].toFixed(1)}–{lv[1].toFixed(1)}</b>　{levelDesc(lv[0])}</p>
            </div>
            <label className="mb-4 flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" checked={anyLevel} onChange={(e) => setAnyLevel(e.target.checked)} className="h-4 w-4 accent-teal-600" />程度不限</label>

            {[
              { v: beginner, set: setBeginner, t: '新手友善', s: '會出現在新手篩選裡，提醒大家放慢節奏' },
              { v: recur, set: setRecur, t: '每週固定團', s: '這一場開打後，自動開好下週同一時間' },
            ].map((o) => (
              <button key={o.t} type="button" aria-pressed={o.v} onClick={() => o.set(!o.v)} className="mb-2.5 flex w-full items-center justify-between rounded-2xl bg-white p-3 text-left shadow-sm">
                <span><b className="block text-sm text-neutral-900">{o.t}</b><small className="text-xs text-neutral-500">{o.s}</small></span>
                <span className={`relative h-7 w-12 flex-none rounded-full transition ${o.v ? 'bg-teal-500' : 'bg-neutral-200'}`}><span className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition ${o.v ? 'left-[23px]' : 'left-[3px]'}`} /></span>
              </button>
            ))}

            <Stepper label="場租總額" sub={fee ? `滿額時每人約 $${Math.ceil(fee / capacity)}，現場付給你` : '免費場地'} value={fee} min={0} max={20000} step={100} onChange={setFee} format={(v) => (v ? `$${v}` : '免費')} />

            <p className="mb-1.5 mt-4 text-xs font-bold text-neutral-500">取消截止（開打前）</p>
            <div className="mb-5 flex gap-1.5">
              {[2, 6, 12, 24].map((h) => (
                <button key={h} type="button" aria-pressed={cancelHours === h} onClick={() => setCancelHours(h)}
                  className={`rounded-xl border-[1.5px] px-3.5 py-2 text-sm font-bold ${cancelHours === h ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-transparent bg-white'}`}>{h} 小時</button>
              ))}
            </div>

            <label className="mb-1 block text-xs font-bold text-neutral-500" htmlFor="play-title">團名</label>
            <input id="play-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} placeholder={defaultTitle} className="mb-3 h-12 w-full rounded-2xl border-[1.5px] border-neutral-200 bg-white px-4 text-base outline-none focus:border-teal-500" />
            <label className="mb-1 block text-xs font-bold text-neutral-500" htmlFor="play-community">你的 LINE 社群連結（選填）</label>
            <input id="play-community" value={community} onChange={(e) => setCommunity(e.target.value)} inputMode="url" placeholder="https://line.me/ti/g2/…" className="mb-3 h-12 w-full rounded-2xl border-[1.5px] border-neutral-200 bg-white px-4 text-base outline-none focus:border-teal-500" />
            <label className="mb-1 block text-xs font-bold text-neutral-500" htmlFor="play-note">備註（選填）</label>
            <textarea id="play-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} rows={3} placeholder="例如：自備球拍、場地在 B1、會帶兩顆室內球" className="w-full rounded-2xl border-[1.5px] border-neutral-200 bg-white px-4 py-3 text-base outline-none focus:border-teal-500" />
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-neutral-50 via-neutral-50/95 to-transparent px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-6">
        <div className="mx-auto max-w-xl">
          <button type="button" onClick={next} disabled={!canNext || busy}
            className={`h-[52px] w-full rounded-2xl text-base font-black shadow-lg transition ${canNext ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/25' : 'bg-neutral-200 text-neutral-500 shadow-none'}`}>
            {busy ? '開團中…' : step === 3 ? '發布，開始揪人' : step === 0 && !court ? '先選一座球場' : '下一步'}
          </button>
        </div>
      </div>

      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} title="最後一步：你的球友名片" confirmLabel="發布這一團" busy={busy} error={error} onConfirm={(p) => publish(p)} />
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}
