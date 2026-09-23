import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import type { Occurrence } from '../../utils/fixedSessions';
import { courtSlug } from '../../utils/slugify';
import { dayLabel, hm } from './playFormat';

interface Props {
  o: Occurrence;
  count: number;
  mine: boolean;
  busy?: boolean;
  onToggle: () => void;
  canHost: boolean;
  now: number;
}

// 固定球敘的一場：顯示下一段幾點開始、今天的全部時段，和「N 位球友說會去」。
// 人數是真的有人按了才會增加，沒有人按就老實顯示「還沒有人說會去」。
export default function SessionCard({ o, count, mine, busy, onToggle, canHost, now }: Props) {
  const reduce = useReducedMotion();
  const s = o.session;
  const live = o.startsAt <= now && now < o.endsAt;
  const soon = !live && o.startsAt - now < 3 * 3600_000;
  return (
    <article className={`rounded-2xl border bg-white p-4 shadow-sm ${live ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-neutral-100'}`}>
      <div className="flex items-center gap-2">
        {live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-black text-white">
            <span className="relative flex h-2 w-2">
              {!reduce && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            進行中
          </span>
        ) : (
          <span className={`rounded-full px-2.5 py-0.5 font-mono text-[12px] font-extrabold ${soon ? 'bg-orange-500 text-white' : 'bg-neutral-900 text-white'}`}>
            {dayLabel(o.startsAt, now)} {hm(o.startsAt)} 開始
          </span>
        )}
        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-600">固定球敘</span>
      </div>
      <h3 className="mt-2 text-[15px] font-black text-neutral-900">
        <Link to={`/courts/${courtSlug(s.courtId)}/`} className="hover:text-teal-700">{s.courtName}</Link>
      </h3>
      <p className="text-[13px] text-neutral-600">
        {o.times.map((t) => `${hm(t.startsAt)}–${hm(t.endsAt)}`).join('、')}
        <span className="text-neutral-400"> · {s.city}{s.district ?? ''}</span>
      </p>
      {s.organizer && <p className="mt-0.5 text-[12px] text-neutral-500">主辦／聯絡：{s.organizer}</p>}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          aria-pressed={mine}
          className={`h-10 flex-none rounded-xl px-4 text-sm font-black transition disabled:opacity-60 ${mine ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25' : 'bg-lime-300 text-lime-950 hover:bg-lime-400'}`}
        >
          {mine ? '✓ 你會去' : '我會去'}
        </button>
        <motion.span key={count} initial={reduce ? false : { y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[13px] text-neutral-600">
          {count > 0 ? <><b className="font-mono text-base text-neutral-900">{count}</b> 位球友說會去</> : '還沒有人說會去'}
        </motion.span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-neutral-100 pt-2.5">
        <span className="text-[11px] text-neutral-400">{s.verified ? `本站 ${s.verified} 查證` : '本站查證'}</span>
        {canHost && <Link to={`/play/?new&court=${s.courtId}`} className="whitespace-nowrap text-[12px] font-bold text-teal-700">我是主辦，開成線上團 →</Link>}
      </div>
    </article>
  );
}
