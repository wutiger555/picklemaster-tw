import { Link } from 'react-router-dom';
import type { GameSummary } from '../../utils/playApi';
import { FORMAT_LABEL, dayLabel, hm, levelText, needsNet, perPerson, untilText } from './playFormat';

const TYPE = { indoor: '室內', outdoor: '戶外', covered: '風雨' } as const;

// 大廳的團卡片：一排點陣表示名額（藍＝已報名、黃＝候補），不用讀字就知道還剩幾位
export default function GameCard({ g }: { g: GameSummary }) {
  const filled = g.confirmedCount ?? 0;
  const waiting = g.waitlistCount ?? 0;
  const left = Math.max(g.capacity - filled, 0);
  const urgent = left > 0 && left <= 2 && g.startsAt - Date.now() < 24 * 3600_000;
  const per = perPerson(g, Math.max(filled, Math.min(g.capacity, g.minPlayers)));
  return (
    <Link
      to={`/play/?g=${g.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500"
    >
      {urgent && <span className="absolute right-0 top-0 rounded-bl-2xl bg-orange-500 px-3 py-1 text-[11px] font-black text-white">快滿了 · 剩 {left} 位</span>}
      <div className="mb-1 flex items-baseline gap-2">
        <span className="font-mono text-[15px] font-extrabold text-neutral-900">{dayLabel(g.startsAt)} {hm(g.startsAt)}</span>
        {!urgent && <span className="ml-auto whitespace-nowrap text-xs text-neutral-500">{untilText(g.startsAt)}</span>}
      </div>
      <h3 className="text-base font-black text-neutral-900">{g.title}</h3>
      <p className="mt-0.5 text-[13px] text-neutral-500">
        {g.court.name ?? '球場'}
        {g.court.type ? ` · ${TYPE[g.court.type]}` : ''} · {g.courtsBooked} 面
      </p>
      <div className="my-2.5 flex flex-wrap gap-1.5 text-[11px] font-bold">
        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-700">程度 {levelText(g)}</span>
        {g.beginner && <span className="rounded-full bg-lime-300 px-2 py-0.5 text-lime-900">新手友善</span>}
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600">{FORMAT_LABEL[g.format].name}</span>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600">{g.feeTotal ? `約 $${per}/人` : '免費'}</span>
        {needsNet(g.court.net) && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">要帶球網</span>}
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex flex-1 flex-wrap gap-[3px]" aria-hidden>
          {Array.from({ length: g.capacity }, (_, i) => (
            <i key={i} className={`h-3 w-3 rounded-[4px] ${i < filled ? 'bg-[#2f6fd6]' : 'border-[1.5px] border-dashed border-neutral-200 bg-neutral-50'}`} />
          ))}
          {Array.from({ length: Math.min(waiting, 12) }, (_, i) => <i key={`w${i}`} className="h-3 w-3 rounded-[4px] bg-lime-300" />)}
        </div>
        <span className="whitespace-nowrap font-mono text-[15px] font-extrabold tabular-nums text-neutral-900">
          {filled}<small className="font-sans text-[11px] font-medium text-neutral-500"> / {g.capacity}{waiting ? ` · 候補 ${waiting}` : ''}</small>
        </span>
      </div>
    </Link>
  );
}
