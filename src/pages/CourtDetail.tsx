import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import type { Court, CourtsData } from '../types';
import { parseCourtSlug } from '../utils/slugify';
import WeatherWidget from '../components/common/WeatherWidget';
import SEOHead from '../components/common/SEOHead';

const CourtDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [court, setCourt] = useState<Court | null | 'not-found'>(null);

  useEffect(() => {
    const id = slug ? parseCourtSlug(slug) : null;
    if (!id) {
      setCourt('not-found');
      return;
    }
    fetch('/data/courts.json')
      .then(r => r.json())
      .then((data: CourtsData) => {
        const found = data.courts.find(c => c.id === id);
        setCourt(found || 'not-found');
      })
      .catch(() => setCourt('not-found'));
  }, [slug]);

  // Structured data for SportsActivityLocation
  useEffect(() => {
    if (!court || court === 'not-found') return;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'SportsActivityLocation',
      name: court.name,
      sport: 'Pickleball',
      address: {
        '@type': 'PostalAddress',
        streetAddress: court.location.address,
        addressLocality: court.location.district,
        addressRegion: court.location.city,
        addressCountry: 'TW',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: court.location.lat,
        longitude: court.location.lng,
      },
      openingHours: court.opening_hours,
      isAccessibleForFree: court.fee === 'free',
      priceRange: court.fee === 'free' ? '免費' : court.price,
    };
    const old = document.querySelector('script[data-structured="court-detail"]');
    if (old) old.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured', 'court-detail');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [court]);

  if (court === 'not-found') return <Navigate to="/courts" replace />;
  if (!court) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">載入中...</div>
      </div>
    );
  }

  const isOutdoor = court.type === 'outdoor' || court.type === 'covered';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${court.location.lat},${court.location.lng}`;
  const navigateUrl = `https://www.google.com/maps/dir/?api=1&destination=${court.location.lat},${court.location.lng}`;

  return (
    <LazyMotion features={domAnimation}>
      <SEOHead
        customTitle={`${court.name} | ${court.location.city}${court.location.district || ''}匹克球場 | 地圖、費用、開放時間`}
        customDescription={`${court.name}位於${court.location.address}，${court.type === 'indoor' ? '室內' : '戶外'}場、${court.courts_count}面球場、${court.fee === 'free' ? '免費' : court.price}。開放時間：${court.opening_hours}。`}
      />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        <section className="pt-16 pb-8 md:pt-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <Link to="/courts" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-emerald-600 mb-6">
              ← 返回球場地圖
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                {court.type === 'indoor' ? '室內' : court.type === 'covered' ? '風雨球場' : '戶外'}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${court.fee === 'free' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {court.fee === 'free' ? '免費' : '付費'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                {court.courts_count} 面球場
              </span>
              {court.is_new && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 text-white">
                  NEW
                </span>
              )}
            </div>

            <m.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-black text-neutral-900 mb-2 tracking-tight"
            >
              {court.name}
            </m.h1>
            <p className="text-neutral-600 text-base md:text-lg">
              📍 {court.location.address}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-5xl pb-20">
          <div className="grid md:grid-cols-3 gap-5">
            {/* Main info */}
            <div className="md:col-span-2 space-y-5">
              <section className="bg-white rounded-2xl border border-neutral-100 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">基本資訊</h2>
                <dl className="grid grid-cols-2 gap-y-3 text-sm">
                  <dt className="text-neutral-500">城市</dt>
                  <dd className="text-neutral-900 font-semibold">{court.location.city}{court.location.district && ` · ${court.location.district}`}</dd>

                  <dt className="text-neutral-500">開放時間</dt>
                  <dd className="text-neutral-900 font-semibold">{court.opening_hours}</dd>

                  <dt className="text-neutral-500">費用</dt>
                  <dd className="text-neutral-900 font-semibold">{court.price || (court.fee === 'free' ? '免費' : '付費')}</dd>

                  <dt className="text-neutral-500">球場數</dt>
                  <dd className="text-neutral-900 font-semibold">{court.courts_count} 面</dd>

                  {court.surface && (
                    <>
                      <dt className="text-neutral-500">場地材質</dt>
                      <dd className="text-neutral-900 font-semibold">{court.surface}</dd>
                    </>
                  )}

                  {court.ownership && (
                    <>
                      <dt className="text-neutral-500">經營類型</dt>
                      <dd className="text-neutral-900 font-semibold">
                        {{ public: '公營', private: '民營', school: '學校', community: '社區' }[court.ownership] || court.ownership}
                      </dd>
                    </>
                  )}

                  {court.contact && (
                    <>
                      <dt className="text-neutral-500">聯絡方式</dt>
                      <dd className="text-neutral-900 font-semibold">{court.contact}</dd>
                    </>
                  )}

                  {court.last_updated && (
                    <>
                      <dt className="text-neutral-500">資料更新</dt>
                      <dd className="text-neutral-500 text-xs">{court.last_updated}</dd>
                    </>
                  )}
                </dl>
              </section>

              {court.features && court.features.length > 0 && (
                <section className="bg-white rounded-2xl border border-neutral-100 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">場地特色</h2>
                  <ul className="space-y-2">
                    {court.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {court.facilities && court.facilities.length > 0 && (
                <section className="bg-white rounded-2xl border border-neutral-100 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">設施</h2>
                  <div className="flex flex-wrap gap-2">
                    {court.facilities.map((f, i) => (
                      <span key={i} className="text-sm bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                </section>
              )}

              {court.reviews && (
                <section className="bg-white rounded-2xl border border-neutral-100 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-3">場地說明</h2>
                  <p className="text-neutral-700 leading-relaxed">{court.reviews}</p>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              {isOutdoor && (
                <WeatherWidget lat={court.location.lat} lng={court.location.lng} />
              )}

              <div className="bg-white rounded-2xl border border-neutral-100 p-5">
                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">快速動作</h3>
                <div className="space-y-2">
                  <a
                    href={navigateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-4 py-3 rounded-xl hover:shadow-lg transition-shadow"
                  >
                    🧭 Google 導航
                  </a>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-white border-2 border-neutral-200 hover:border-emerald-300 text-neutral-900 font-bold px-4 py-3 rounded-xl transition-colors"
                  >
                    📍 Google 地圖檢視
                  </a>
                  {court.booking_url && (
                    <a
                      href={court.booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-neutral-900 text-white font-bold px-4 py-3 rounded-xl hover:bg-neutral-800"
                    >
                      📝 線上預約
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-100 p-5">
                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">地理位置</h3>
                <div className="text-xs text-neutral-500 space-y-1">
                  <div>緯度 {court.location.lat}</div>
                  <div>經度 {court.location.lng}</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
};

export default CourtDetail;
