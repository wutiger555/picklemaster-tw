import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Court, CourtsData } from '../types';
import { courtSlug } from '../utils/slugify';
import { CITY_INFO, getCityBySlug } from '../utils/cityData';
import SEOHead from '../components/common/SEOHead';

const PickleballIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <circle cx="8" cy="9" r="1.5" fill="currentColor" />
    <circle cx="16" cy="9" r="1.5" fill="currentColor" />
    <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    <circle cx="8" cy="15" r="1.5" fill="currentColor" />
    <circle cx="16" cy="15" r="1.5" fill="currentColor" />
  </svg>
);

const is24h = (c: Court) => /24\s*小時/.test(c.opening_hours || '');

const TYPE_STYLE: Record<string, { label: string; icon: string; chip: string; bar: string }> = {
  indoor: { label: '室內', icon: '🏠', chip: 'bg-emerald-50 text-emerald-700 border-emerald-100', bar: 'from-emerald-400 to-teal-500' },
  covered: { label: '風雨', icon: '☂️', chip: 'bg-violet-50 text-violet-700 border-violet-100', bar: 'from-violet-400 to-purple-500' },
  outdoor: { label: '戶外', icon: '☀️', chip: 'bg-sky-50 text-sky-700 border-sky-100', bar: 'from-sky-400 to-cyan-500' },
};

const CityCourts = () => {
  const { slug } = useParams<{ slug: string }>();
  const cityInfo = slug ? getCityBySlug(slug) : undefined;
  const [courts, setCourts] = useState<Court[] | null>(null);

  useEffect(() => {
    fetch('/data/courts.json')
      .then(r => r.json())
      .then((data: CourtsData) => setCourts(data.courts))
      .catch(() => setCourts([]));
  }, []);

  const cityCourts = useMemo(() => {
    if (!courts || !cityInfo) return [];
    return courts
      .filter(c => c.location.city === cityInfo.city)
      .sort((a, b) => {
        if (!!a.is_new !== !!b.is_new) return a.is_new ? -1 : 1;
        if ((a.fee === 'free') !== (b.fee === 'free')) return a.fee === 'free' ? -1 : 1;
        return b.courts_count - a.courts_count;
      });
  }, [courts, cityInfo]);

  const cityCounts = useMemo(() => {
    const m = new Map<string, number>();
    (courts || []).forEach(c => m.set(c.location.city, (m.get(c.location.city) || 0) + 1));
    return m;
  }, [courts]);

  const stats = useMemo(() => ({
    indoor: cityCourts.filter(c => c.type === 'indoor').length,
    outdoor: cityCourts.filter(c => c.type !== 'indoor').length,
    free: cityCourts.filter(c => c.fee === 'free').length,
    open24h: cityCourts.filter(is24h).length,
  }), [cityCourts]);

  const freeCourts = cityCourts.filter(c => c.fee === 'free');
  const indoorCourts = cityCourts.filter(c => c.type === 'indoor' || c.type === 'covered');

  // FAQ（同步渲染於頁面與 JSON-LD，符合 rich result 內容可見性要求）
  const faqs = useMemo(() => {
    if (!cityInfo || cityCourts.length === 0) return [];
    const list: { q: string; a: string }[] = [];
    list.push({
      q: `${cityInfo.shortName}有幾座匹克球場？`,
      a: `本站目前收錄${cityInfo.city} ${cityCourts.length} 座匹克球場（室內 ${stats.indoor} 座、戶外/風雨 ${stats.outdoor} 座），持續更新中。`,
    });
    if (freeCourts.length > 0) {
      list.push({
        q: `${cityInfo.shortName}哪裡可以免費打匹克球？`,
        a: `${cityInfo.city}有 ${freeCourts.length} 座免費球場：${freeCourts.slice(0, 5).map(c => c.name).join('、')}${freeCourts.length > 5 ? ' 等' : ''}。免費場通常先到先打，熱門時段需排隊輪場。`,
      });
    }
    if (indoorCourts.length > 0) {
      list.push({
        q: `${cityInfo.shortName}下雨天去哪打匹克球？`,
        a: `${cityInfo.city}有 ${indoorCourts.length} 座室內或風雨球場：${indoorCourts.slice(0, 5).map(c => c.name).join('、')}${indoorCourts.length > 5 ? ' 等' : ''}，不受天氣影響。`,
      });
    }
    return list;
  }, [cityInfo, cityCourts, stats, freeCourts, indoorCourts]);

  // JSON-LD：ItemList + FAQPage + BreadcrumbList
  useEffect(() => {
    if (!cityInfo || cityCourts.length === 0) return;
    const base = 'https://picklemastertw.com';
    const data = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ItemList',
          name: `${cityInfo.city}匹克球場完整列表`,
          numberOfItems: cityCourts.length,
          itemListElement: cityCourts.map((c, i) => ({
            '@type': 'SportsActivityLocation',
            position: i + 1,
            name: c.name,
            sport: 'Pickleball',
            address: {
              '@type': 'PostalAddress',
              streetAddress: c.location.address,
              addressLocality: c.location.district,
              addressRegion: c.location.city,
              addressCountry: 'TW',
            },
            isAccessibleForFree: c.fee === 'free',
            url: `${base}/courts/${courtSlug(c.id)}`,
          })),
        },
        {
          '@type': 'FAQPage',
          mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: base },
            { '@type': 'ListItem', position: 2, name: '球場地圖', item: `${base}/courts` },
            { '@type': 'ListItem', position: 3, name: `${cityInfo.city}匹克球場`, item: `${base}/courts/${cityInfo.slug}` },
          ],
        },
      ],
    };
    const old = document.querySelector('script[data-structured="city-courts"]');
    if (old) old.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured', 'city-courts');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [cityInfo, cityCourts, faqs]);

  if (!cityInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-gradient-to-br from-teal-50/50 via-white to-orange-50/30">
        <PickleballIcon className="w-16 h-16 text-neutral-300" />
        <p className="text-neutral-500 text-lg">找不到這個城市的球場頁</p>
        <Link to="/courts" className="text-emerald-600 font-medium hover:underline">← 回全台球場地圖</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-orange-50/30">
      <SEOHead
        page="courts"
        customTitle={`${cityInfo.city}匹克球場地圖 2026｜${cityCourts.length || ''} 座場地完整名單（免費/室內/收費）`}
        customDescription={`${cityInfo.city}匹克球場完整攻略：免費戶外場 ${stats.free} 座、室內場 ${stats.indoor} 座${stats.open24h ? `、24 小時場 ${stats.open24h} 座` : ''}。地址、開放時間、費用、特色一次看，附 GPS 導航。`}
      />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-cyan-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-gradient-to-br from-orange-200/30 to-yellow-200/20 rounded-full blur-3xl" />
          <div className="absolute top-10 right-10 opacity-5">
            <PickleballIcon className="w-32 h-32 text-teal-900" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-5" aria-label="breadcrumb">
              <Link to="/" className="hover:text-teal-600 transition-colors">首頁</Link>
              <span className="text-neutral-300">/</span>
              <Link to="/courts" className="hover:text-teal-600 transition-colors">球場地圖</Link>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-800 font-medium">{cityInfo.city}</span>
            </nav>

            <div className="flex items-center gap-3 mb-3">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg shadow-teal-500/25"
              >
                <PickleballIcon className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-teal-600 font-semibold text-sm tracking-wide uppercase">City Guide · {cityInfo.slug.replace('-', ' ')}</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">
              {cityInfo.city}匹克球場地圖
              {cityCourts.length > 0 && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">｜{cityCourts.length} 座</span>
              )}
            </h1>
            <p className="text-neutral-600 leading-relaxed max-w-2xl mb-6">{cityInfo.intro}</p>

            {/* Stats Pills */}
            {cityCourts.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-teal-100 rounded-full text-sm text-neutral-700 shadow-sm">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  {stats.indoor} 室內
                </motion.span>
                <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-teal-100 rounded-full text-sm text-neutral-700 shadow-sm">
                  <span className="w-2 h-2 bg-sky-500 rounded-full" />
                  {stats.outdoor} 戶外/風雨
                </motion.span>
                <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-teal-100 rounded-full text-sm text-neutral-700 shadow-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  {stats.free} 免費
                </motion.span>
                {stats.open24h > 0 && (
                  <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-full text-sm text-violet-700 font-medium shadow-sm">
                    <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                    {stats.open24h} 座 24 小時
                  </motion.span>
                )}
              </div>
            )}

            <Link
              to="/courts"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4M9 7l6-3" /></svg>
              互動地圖找{cityInfo.shortName}球場（含即時天氣）
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Court list */}
      <div className="container mx-auto px-4 pb-12">
        {courts === null ? (
          <div className="text-center py-16 text-neutral-400">
            <PickleballIcon className="w-10 h-10 mx-auto mb-3 animate-spin text-teal-300" />
            載入中…
          </div>
        ) : cityCourts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-neutral-200">
            <PickleballIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">此城市目前尚無收錄球場</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cityCourts.map((court, i) => {
              const t = TYPE_STYLE[court.type] || TYPE_STYLE.outdoor;
              return (
                <motion.div
                  key={court.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.35 }}
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
                      {is24h(court) && (
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
            })}
          </div>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-14 max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">💬</span>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900">{cityInfo.shortName}匹克球常見問題</h2>
            </div>
            <div className="space-y-3">
              {faqs.map(f => (
                <details key={f.q} className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200 open:border-teal-200 open:shadow-lg open:shadow-teal-900/5 transition-all">
                  <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none font-semibold text-neutral-800 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs font-black flex items-center justify-center shadow-sm">Q</span>
                      {f.q}
                    </span>
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <p className="px-5 pb-5 pl-[60px] text-sm text-neutral-600 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </motion.section>
        )}

        {/* Other cities */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🗺️</span>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900">探索其他縣市球場</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CITY_INFO.filter(c => c.slug !== cityInfo.slug && (cityCounts.get(c.city) || 0) > 0).map(c => (
              <Link
                key={c.slug}
                to={`/courts/${c.slug}`}
                className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 text-sm font-medium text-neutral-700 shadow-sm hover:border-teal-300 hover:text-teal-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {c.shortName}
                <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-xs group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                  {cityCounts.get(c.city)}
                </span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mt-14 overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 rounded-3xl p-7 md:p-10 text-white"
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">第一次打匹克球？🏓</h2>
            <p className="text-teal-50/90 mb-6 max-w-xl">從規則、裝備到參加球敘，我們幫你把入門功課做完了。挑一個離家近的場地，這週末就開打。</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/newcomer-guide" className="px-5 py-2.5 bg-white text-teal-700 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all">
                新手懶人包
              </Link>
              <Link to="/articles/first-open-play-guide" className="px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl text-sm font-bold hover:bg-white/25 transition-all">
                球敘參加指南
              </Link>
              <Link to="/articles/taiwan-pickleball-lessons-guide" className="px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl text-sm font-bold hover:bg-white/25 transition-all">
                課程與教練指南
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default CityCourts;
