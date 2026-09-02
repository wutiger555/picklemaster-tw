import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Court } from '../../types';
import type { CourtWeather } from '../../hooks/useCourtsWeather';
import { courtSlug } from '../../utils/slugify';
import WeatherBadge from './WeatherBadge';
import OpenNowBadge from './OpenNowBadge';

interface Props {
  court: Court | null;
  weather?: CourtWeather;
  /** 使用者已定位時傳入，例如「2.3 km」 */
  distanceLabel?: string;
  onClose: () => void;
}

const TYPE_LABEL: Record<string, { text: string; cls: string }> = {
  indoor: { text: '🏠 室內', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  covered: { text: '☂️ 風雨', cls: 'bg-violet-50 text-violet-700 border-violet-100' },
  outdoor: { text: '☀️ 戶外', cls: 'bg-sky-50 text-sky-700 border-sky-100' },
};

// 行動版底部快覽面板：點列表 / 地圖標記即時顯示球場摘要
export default function CourtQuickSheet({ court, weather, distanceLabel, onClose }: Props) {
  const t = court ? (TYPE_LABEL[court.type] || TYPE_LABEL.outdoor) : TYPE_LABEL.outdoor;

  return (
    <AnimatePresence>
      {court && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-neutral-900/30 backdrop-blur-[2px]"
            aria-hidden
          />
          {/* Sheet — 支援下滑手勢關閉，z 高於全螢幕地圖(z-60) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-[75] bg-white rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[75vh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
            role="dialog"
            aria-label={`${court.name} 快覽`}
          >
            {/* Drag handle + close */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm pt-3 pb-2 px-5 rounded-t-3xl">
              <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto mb-3" onClick={onClose} />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-neutral-900 text-lg leading-snug">{court.name}</h3>
                    {court.is_new && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-xs font-bold rounded-full border border-orange-200">NEW</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">{court.location.address}</p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="關閉"
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="px-5 pb-6">
              {/* Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {distanceLabel && (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full border bg-teal-50 text-teal-700 border-teal-200">
                    📍 {distanceLabel}
                  </span>
                )}
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${t.cls}`}>{t.text}</span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${court.fee === 'free' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-neutral-50 text-neutral-600 border-neutral-200'}`}>
                  {court.fee === 'free' ? '免費' : '付費'}
                </span>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-50 text-neutral-600 border border-neutral-200">{court.courts_count} 面</span>
                <OpenNowBadge openingHours={court.opening_hours} size="md" />
                {/24\s*小時/.test(court.opening_hours || '') && (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-violet-50 text-violet-700 border border-violet-100">24H</span>
                )}
                {court.type !== 'indoor' && (
                  <WeatherBadge lat={court.location.lat} lng={court.location.lng} weather={weather} />
                )}
              </div>

              {/* Info rows */}
              <dl className="space-y-2.5 text-sm mb-4">
                <div className="flex gap-3">
                  <dt className="shrink-0 w-16 text-neutral-400">開放時間</dt>
                  <dd className="text-neutral-700">{court.opening_hours || '依現場公告'}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="shrink-0 w-16 text-neutral-400">費用</dt>
                  <dd className="text-neutral-700">{court.price || (court.fee === 'free' ? '免費' : '付費')}</dd>
                </div>
                {court.contact && (
                  <div className="flex gap-3">
                    <dt className="shrink-0 w-16 text-neutral-400">聯絡</dt>
                    <dd className="text-neutral-700">{court.contact}</dd>
                  </div>
                )}
              </dl>

              {/* Features */}
              {court.features && court.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {court.features.slice(0, 3).map(f => (
                    <span key={f} className="px-2 py-0.5 text-xs rounded-md bg-teal-50/80 text-teal-700">✓ {f}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <Link
                  to={`/courts/${courtSlug(court.id)}`}
                  className="col-span-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-500/20 active:scale-[0.98] transition-transform"
                >
                  詳細資訊
                </Link>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${court.location.lat},${court.location.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="col-span-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
                >
                  🧭 導航
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${court.location.lat},${court.location.lng}&travelmode=transit`}
                  target="_blank" rel="noopener noreferrer"
                  className="col-span-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
                >
                  🚌 大眾運輸
                </a>
              </div>

              {/* 預約管道（線上預約 / LINE / 電話）*/}
              {(court.booking_url || court.contact_details?.line || court.contact) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {court.booking_url && (
                    <a href={court.booking_url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 min-w-[110px] flex items-center justify-center gap-1 px-3 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-transform">
                      📝 線上預約
                    </a>
                  )}
                  {court.contact_details?.line && (
                    <a
                      href={court.contact_details.line.startsWith('http') ? court.contact_details.line : `https://line.me/R/ti/p/${encodeURIComponent(court.contact_details.line)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 min-w-[110px] flex items-center justify-center gap-1 px-3 py-2.5 bg-[#06C755] text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-transform">
                      LINE 預約
                    </a>
                  )}
                  {!court.booking_url && !court.contact_details?.line && court.contact && /^[0-9()+\-\s]{7,}$/.test(court.contact) && (
                    <a href={`tel:${court.contact.replace(/\s/g, '')}`}
                      className="flex-1 min-w-[110px] flex items-center justify-center gap-1 px-3 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform">
                      📞 撥打電話
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
