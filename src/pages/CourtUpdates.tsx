// 球場動態：/courts/updates
// 資料來自 src/data/courtUpdates.ts（預渲染腳本讀同一份）；球場名稱從 courts.json 取目前值，
// 改名後這頁自動跟著變。
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Court, CourtsData } from '../types';
import { courtSlug } from '../utils/slugify';
import { COURT_UPDATES, COURT_UPDATE_KIND_LABEL, type CourtUpdate, type CourtUpdateKind } from '../data/courtUpdates';
import SEOHead from '../components/common/SEOHead';

const KIND_STYLE: Record<CourtUpdateKind, { dot: string; pill: string }> = {
  added: { dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  corrected: { dot: 'bg-sky-500', pill: 'bg-sky-50 text-sky-700 border-sky-200' },
  removed: { dot: 'bg-neutral-400', pill: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  status: { dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
};

// 一次列太多球場會把時間軸撐爆，超過就收起來
const CHIP_LIMIT = 8;

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-');
  return `${y} 年 ${Number(m)} 月`;
};

const dayLabel = (date: string) => {
  const [, m, d] = date.split('-');
  return `${Number(m)}/${Number(d)}`;
};

const CourtChips = ({ ids, courts }: { ids: number[]; courts: Map<number, Court> }) => {
  const [expanded, setExpanded] = useState(false);
  const chip = (id: number) => {
    const c = courts.get(id);
    if (!c) return null;
    return (
      <Link
        key={id}
        to={`/courts/${courtSlug(id)}`}
        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-700 hover:border-teal-300 hover:text-teal-700 transition-colors"
      >
        <span className="font-medium">{c.name}</span>
        <span className="text-neutral-400 whitespace-nowrap shrink-0">{c.location.city.replace(/[市縣]$/, '')}</span>
      </Link>
    );
  };
  const overflow = ids.length - CHIP_LIMIT;
  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-1.5">{(expanded || overflow <= 0 ? ids : ids.slice(0, CHIP_LIMIT)).map(chip)}</div>
      {overflow > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          className="mt-2 text-xs font-medium text-teal-700 hover:underline"
        >
          {expanded ? '收起' : `再看 ${overflow} 座 ↓`}
        </button>
      )}
    </div>
  );
};

const UpdateItem = ({ u, courts }: { u: CourtUpdate; courts: Map<number, Court> }) => {
  const style = KIND_STYLE[u.kind];
  return (
    <li className="relative pl-7">
      <span className={`absolute left-0 top-[22px] w-3 h-3 rounded-full ring-4 ring-white ${style.dot}`} aria-hidden />
      <article className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <time dateTime={u.date} className="text-sm font-semibold text-neutral-500 tabular-nums">{dayLabel(u.date)}</time>
          <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${style.pill}`}>
            {COURT_UPDATE_KIND_LABEL[u.kind]}
          </span>
        </div>
        <h3 className="text-lg font-bold text-neutral-900 leading-snug mb-1.5">{u.title}</h3>
        <p className="text-sm text-neutral-600 leading-relaxed">{u.detail}</p>
        {u.removedNames && u.removedNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {u.removedNames.map(n => (
              <span key={n} className="px-2.5 py-1 bg-neutral-50 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 line-through decoration-neutral-400">
                {n}
              </span>
            ))}
          </div>
        )}
        {u.courtIds && u.courtIds.length > 0 && <CourtChips ids={u.courtIds} courts={courts} />}
      </article>
    </li>
  );
};

const CourtUpdates = () => {
  const [courts, setCourts] = useState<Map<number, Court>>(new Map());
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    fetch('/data/courts.json')
      .then(r => r.json())
      .then((data: CourtsData) => {
        setCourts(new Map(data.courts.map(c => [c.id, c])));
        setTotal(data.courts.length);
      })
      .catch(() => setTotal(0));
  }, []);

  const byMonth = useMemo(() => {
    const m = new Map<string, CourtUpdate[]>();
    COURT_UPDATES.forEach(u => {
      const ym = u.date.slice(0, 7);
      m.set(ym, [...(m.get(ym) || []), u]);
    });
    return [...m.entries()];
  }, []);

  // 本月統計：新增幾座、修正幾座（以球場數計，不是以紀錄筆數計）
  const latestMonth = byMonth[0];
  const monthStats = useMemo(() => {
    if (!latestMonth) return null;
    const count = (k: CourtUpdateKind) =>
      latestMonth[1].filter(u => u.kind === k).reduce((n, u) => n + (u.courtIds?.length || 0), 0);
    return { month: latestMonth[0], added: count('added'), corrected: count('corrected') };
  }, [latestMonth]);

  const lastDate = COURT_UPDATES[0]?.date;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-orange-50/30">
      <SEOHead
        page="courts"
        customTitle="匹克球場動態 2026｜新開球場、位置修正與歇業紀錄"
        customDescription={`台灣匹克球場地變動很快。這裡按月記錄本站新增的球場、修正的位置與地址、以及確認歇業或重複而移除的資料，最近更新 ${lastDate}。`}
      />

      <header className="container mx-auto px-4 pt-10 md:pt-14 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-5" aria-label="breadcrumb">
            <Link to="/" className="hover:text-teal-600 transition-colors">首頁</Link>
            <span className="text-neutral-300">/</span>
            <Link to="/courts" className="hover:text-teal-600 transition-colors">球場地圖</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-800 font-medium">球場動態</span>
          </nav>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">球場動態</h1>
          <p className="text-neutral-600 leading-relaxed max-w-2xl mb-6">
            台灣的匹克球場一個月就能多出十幾座，舊資料也常有地址或位置對不上。這裡記錄本站每一次新增、修正與移除，每筆都經過查證才上線；資料寫「待查證」的地方，代表場館官方還沒公告。
          </p>

          <div className="flex flex-wrap gap-2">
            {total !== null && total > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-teal-100 rounded-full text-sm text-neutral-700 shadow-sm">
                <span className="w-2 h-2 bg-teal-500 rounded-full" />
                目前收錄 {total} 座
              </span>
            )}
            {monthStats && monthStats.added > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-emerald-100 rounded-full text-sm text-neutral-700 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                {Number(monthStats.month.slice(5))} 月新增 {monthStats.added} 座
              </span>
            )}
            {monthStats && monthStats.corrected > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-sky-100 rounded-full text-sm text-neutral-700 shadow-sm">
                <span className="w-2 h-2 bg-sky-500 rounded-full" />
                {Number(monthStats.month.slice(5))} 月修正 {monthStats.corrected} 座
              </span>
            )}
            <Link
              to="/data-method"
              className="inline-flex items-center px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600 hover:border-teal-300 hover:text-teal-700 transition-colors"
            >
              我們怎麼查證 →
            </Link>
          </div>
        </motion.div>
      </header>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl">
          {byMonth.map(([ym, list]) => (
            <section key={ym} className="mb-10">
              <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-baseline gap-3">
                {monthLabel(ym)}
                <span className="text-sm font-normal text-neutral-500">{list.length} 筆異動</span>
              </h2>
              <ol className="relative space-y-4 before:absolute before:left-[5px] before:top-3 before:bottom-3 before:w-px before:bg-neutral-200">
                {list.map(u => (
                  <UpdateItem key={`${u.date}-${u.title}`} u={u} courts={courts} />
                ))}
              </ol>
            </section>
          ))}

          <p className="text-sm text-neutral-500 leading-relaxed border-t border-neutral-200 pt-6">
            紀錄從 2026 年 7 月 30 日開始。知道哪裡有新球場，或發現資料有誤？歡迎透過<Link to="/contact" className="text-teal-700 hover:underline">聯絡頁</Link>告訴我們。
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourtUpdates;
