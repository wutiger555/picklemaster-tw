// 球場卡片 —— 由 CityCourts.tsx 抽出，供城市頁 (/courts/taipei) 與
// 屬性頁 (/courts/free 等) 共用，兩邊外觀保持一致。
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Court } from '../../types';
import { courtSlug } from '../../utils/slugify';
import { is24h } from '../../utils/courtAttributes';

const TYPE_STYLE: Record<string, { label: string; icon: string; chip: string; bar: string }> = {
  indoor: { label: '室內', icon: '🏠', chip: 'bg-emerald-50 text-emerald-700 border-emerald-100', bar: 'from-emerald-400 to-teal-500' },
  covered: { label: '風雨', icon: '☂️', chip: 'bg-violet-50 text-violet-700 border-violet-100', bar: 'from-violet-400 to-purple-500' },
  outdoor: { label: '戶外', icon: '☀️', chip: 'bg-sky-50 text-sky-700 border-sky-100', bar: 'from-sky-400 to-cyan-500' },
};

interface CourtCardProps {
  court: Court;
  /** 進場動畫的排序索引 */
  index?: number;
  /** 額外顯示的第二行資訊，例如屬性頁要標出所在縣市 */
  subline?: string;
}

const CourtCard = ({ court, index = 0, subline }: CourtCardProps) => {
  const t = TYPE_STYLE[court.type] || TYPE_STYLE.outdoor;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 transition-all"
    >
      {/* Type accent bar */}
      <div className={`h-1 bg-gradient-to-r ${t.bar}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={`/courts/${courtSlug(court.id)}`} className="font-bold text-neutral-900 leading-snug group-hover:text-teal-700 transition-colors">
            {court.name}
          </Link>
          {court.is_new && (
            <span className="shrink-0 px-2 py-0.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-xs font-bold rounded-full border border-orange-200">
              NEW
            </span>
          )}
        </div>
        {subline && <p className="text-xs text-teal-700 font-medium mb-1.5">{subline}</p>}
        <p className="text-sm text-neutral-500 mb-3 flex items-start gap-1">
          <svg className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{court.location.address}</span>
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${t.chip}`}>
            {t.icon} {t.label}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${court.fee === 'free' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-neutral-50 text-neutral-600 border-neutral-200'}`}>
            {court.fee === 'free' ? '免費' : '付費'}
          </span>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-50 text-neutral-600 border border-neutral-200">
            {court.courts_count} 面
          </span>
          {is24h(court.opening_hours) && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-violet-50 text-violet-700 border border-violet-100">24H</span>
          )}
        </div>
        {court.features && court.features.length > 0 && (
          <p className="text-xs text-teal-700/80 mb-4 line-clamp-1">
            ✓ {court.features.slice(0, 2).join('　✓ ')}
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <Link to={`/courts/${courtSlug(court.id)}`} className="text-sm text-teal-600 font-bold hover:text-teal-700 inline-flex items-center gap-1">
            詳細資訊
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" /></svg>
          </Link>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${court.location.lat},${court.location.lng}`}
            target="_blank" rel="noopener noreferrer"
            className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors inline-flex items-center gap-1"
          >
            🧭 導航
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default CourtCard;
