import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import type { Court, CourtsData } from '../types';
import { parseCourtSlug, courtSlug } from '../utils/slugify';
import { getCityByName } from '../utils/cityData';
import WeatherWidget from '../components/common/WeatherWidget';
import SEOHead from '../components/common/SEOHead';

const TYPE_LABEL = (t: Court['type']) => (t === 'indoor' ? '室內' : t === 'covered' ? '風雨' : '戶外');
const PRICE_TIERS = [
  { key: 'weekday' as const, label: '平日', tone: 'border-neutral-200 bg-neutral-50 text-neutral-800' },
  { key: 'weekend' as const, label: '假日', tone: 'border-amber-200 bg-amber-50 text-amber-900' },
  { key: 'offpeak' as const, label: '離峰', tone: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  { key: 'peak' as const, label: '尖峰', tone: 'border-rose-200 bg-rose-50 text-rose-900' },
  { key: 'rental' as const, label: '球具租借', tone: 'border-sky-200 bg-sky-50 text-sky-900' },
  { key: 'membership' as const, label: '會員', tone: 'border-violet-200 bg-violet-50 text-violet-900' },
];

const OWN_LABEL: Record<string, string> = { public: '公營', private: '民營', school: '學校', community: '社區' };
const is24h = (h?: string) => /24\s*小時/.test(h || '');

// 球場專屬 FAQ（同步呈現於頁面與 JSON-LD，對齊使用者搜尋情境與 AI Overview）
function buildCourtFaqs(court: Court): { q: string; a: string }[] {
  const city = court.location.city || '';
  const district = court.location.district || '';
  const typeLabel = TYPE_LABEL(court.type);
  const faqs: { q: string; a: string }[] = [
    {
      q: `${court.name}在哪裡？怎麼前往？`,
      a: `${court.name}位於${court.location.address}（${city}${district}）。可用 Google 地圖開車導航，或查詢公車／捷運等大眾運輸即時路線前往。`,
    },
    {
      q: `${court.name}要收費嗎？`,
      a: court.fee === 'free'
        ? `${court.name}為免費開放的匹克球場，通常先到先打，熱門時段可能需要排隊輪場。`
        : `${court.name}為收費球場，費用為${court.price || '依現場公告'}。建議事先確認時段與預約方式。`,
    },
    {
      q: `${court.name}的開放時間是？`,
      a: `${court.name}的開放時間為${court.opening_hours || '依現場公告'}。${is24h(court.opening_hours) ? '為 24 小時開放場地，深夜也能打球。' : ''}`.trim(),
    },
    {
      q: `${court.name}有幾面球場？是室內還是戶外？`,
      a: `${court.name}共有 ${court.courts_count} 面球場，屬於${typeLabel}場地${court.surface ? `，場地材質為${court.surface}` : ''}。`,
    },
  ];
  if (court.facilities && court.facilities.length) {
    faqs.push({
      q: `${court.name}有哪些設施？`,
      a: `${court.name}提供的設施包含：${court.facilities.join('、')}。`,
    });
  }
  return faqs;
}

const CourtDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [court, setCourt] = useState<Court | null | 'not-found'>(null);
  const [allCourts, setAllCourts] = useState<Court[]>([]);

  useEffect(() => {
    const id = slug ? parseCourtSlug(slug) : null;
    if (!id) {
      setCourt('not-found');
      return;
    }
    fetch('/data/courts.json')
      .then(r => r.json())
      .then((data: CourtsData) => {
        setAllCourts(data.courts);
        const found = data.courts.find(c => c.id === id);
        setCourt(found || 'not-found');
      })
      .catch(() => setCourt('not-found'));
  }, [slug]);

  // 同城其他球場（內部連結 + 使用者延伸探索）
  const siblings = useMemo(() => {
    if (!court || court === 'not-found') return [];
    return allCourts
      .filter(c => c.location.city === court.location.city && c.id !== court.id)
      .sort((a, b) => {
        if (!!a.is_new !== !!b.is_new) return a.is_new ? -1 : 1;
        return b.courts_count - a.courts_count;
      })
      .slice(0, 6);
  }, [court, allCourts]);

  const faqs = useMemo(() => (court && court !== 'not-found' ? buildCourtFaqs(court) : []), [court]);
  const cityInfo = court && court !== 'not-found' ? getCityByName(court.location.city) : undefined;

  // Structured data: @graph（SportsActivityLocation + BreadcrumbList + FAQPage）
  useEffect(() => {
    if (!court || court === 'not-found') return;
    const base = 'https://picklemastertw.site';
    const canonical = `${base}/courts/${courtSlug(court.id)}`;
    const citySlug = cityInfo?.slug;
    const typeLabel = TYPE_LABEL(court.type);
    const crumbs: Array<Record<string, unknown>> = [
      { '@type': 'ListItem', position: 1, name: '首頁', item: base + '/' },
      { '@type': 'ListItem', position: 2, name: '球場地圖', item: base + '/courts' },
    ];
    if (citySlug) crumbs.push({ '@type': 'ListItem', position: 3, name: `${court.location.city}匹克球場`, item: `${base}/courts/${citySlug}` });
    crumbs.push({ '@type': 'ListItem', position: crumbs.length + 1, name: court.name, item: canonical });

    const data = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SportsActivityLocation',
          '@id': `${canonical}#place`,
          name: court.name,
          sport: 'Pickleball',
          description: `${court.name}是位於${court.location.city}${court.location.district || ''}的${typeLabel}匹克球場，共 ${court.courts_count} 面球場，${court.fee === 'free' ? '免費開放' : '收費'}。`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: court.location.address,
            addressLocality: court.location.district,
            addressRegion: court.location.city,
            addressCountry: 'TW',
          },
          geo: { '@type': 'GeoCoordinates', latitude: court.location.lat, longitude: court.location.lng },
          openingHours: court.opening_hours,
          isAccessibleForFree: court.fee === 'free',
          priceRange: court.fee === 'free' ? '免費' : (court.price || '付費'),
          url: canonical,
          hasMap: `https://www.google.com/maps/search/?api=1&query=${court.location.lat},${court.location.lng}`,
          ...(court.contact ? { telephone: court.contact } : {}),
          ...(court.facilities && court.facilities.length ? { amenityFeature: court.facilities.map(f => ({ '@type': 'LocationFeatureSpecification', name: f, value: true })) } : {}),
        },
        { '@type': 'BreadcrumbList', itemListElement: crumbs },
        { '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      ],
    };
    const old = document.querySelector('script[data-structured="court-detail"]');
    if (old) old.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured', 'court-detail');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [court, faqs, cityInfo]);

  if (court === 'not-found') return <Navigate to="/courts" replace />;
  if (!court) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">載入中...</div>
      </div>
    );
  }

  const isOutdoor = court.type === 'outdoor' || court.type === 'covered';
  const typeLabel = TYPE_LABEL(court.type);
  const feeLabel = court.fee === 'free' ? '免費' : '收費';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${court.location.lat},${court.location.lng}`;
  const navigateUrl = `https://www.google.com/maps/dir/?api=1&destination=${court.location.lat},${court.location.lng}`;
  const transitUrl = `https://www.google.com/maps/dir/?api=1&destination=${court.location.lat},${court.location.lng}&travelmode=transit`;

  return (
    <LazyMotion features={domAnimation}>
      <SEOHead
        customTitle={`${court.name}｜${court.location.city}${court.location.district || ''}匹克球場・${typeLabel}${court.courts_count}面${feeLabel} | 地址、開放時間、導航`}
        customDescription={`${court.name}位於${court.location.address}，為${typeLabel}${feeLabel}匹克球場，共 ${court.courts_count} 面。開放時間：${court.opening_hours || '依現場公告'}。${court.fee !== 'free' && court.price ? `費用：${court.price}。` : ''}提供 GPS 開車導航與大眾運輸路線，${court.location.city}打匹克球的完整場地資訊。`}
      />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        <section className="pt-8 pb-8 md:pt-12">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Breadcrumb */}
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500 mb-5" aria-label="breadcrumb">
              <Link to="/" className="hover:text-emerald-600 transition-colors">首頁</Link>
              <span className="text-neutral-300">/</span>
              <Link to="/courts" className="hover:text-emerald-600 transition-colors">球場地圖</Link>
              {cityInfo && (
                <>
                  <span className="text-neutral-300">/</span>
                  <Link to={`/courts/${cityInfo.slug}`} className="hover:text-emerald-600 transition-colors">{court.location.city}</Link>
                </>
              )}
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-800 font-medium line-clamp-1">{court.name}</span>
            </nav>

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
              {is24h(court.opening_hours) && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">24 小時</span>
              )}
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
                        {OWN_LABEL[court.ownership] || court.ownership}
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

              {/* 分時價格（本站深度資料：多數平台只給單一價格區間） */}
              {court.price_details && Object.values(court.price_details).some(Boolean) && (
                <section className="bg-white rounded-2xl border border-neutral-100 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-1">收費細節</h2>
                  <p className="text-xs text-neutral-500 mb-4">依時段分級，實際價格以場館公告為準</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {PRICE_TIERS.map(({ key, label, tone }) => {
                      const val = court.price_details?.[key];
                      if (!val) return null;
                      return (
                        <div key={key} className={`rounded-xl border p-4 ${tone}`}>
                          <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">{label}</div>
                          <div className="text-sm font-semibold leading-relaxed">{val}</div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 預約與聯絡管道（台灣球館多靠 LINE／IG 預約） */}
              {(court.booking_url || court.website || (court.contact_details && Object.values(court.contact_details).some(Boolean))) && (
                <section className="bg-white rounded-2xl border border-neutral-100 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">預約與聯絡管道</h2>
                  <div className="flex flex-wrap gap-2">
                    {court.booking_url && (
                      <a href={court.booking_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-colors">
                        📝 線上預約
                      </a>
                    )}
                    {court.contact_details?.line && (
                      <a href={court.contact_details.line.startsWith('http') ? court.contact_details.line : `https://line.me/R/ti/p/${encodeURIComponent(court.contact_details.line)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#06C755] text-white text-sm font-bold hover:brightness-95 transition-all">
                        LINE {court.contact_details.line.startsWith('@') ? court.contact_details.line : '社群'}
                      </a>
                    )}
                    {court.contact_details?.instagram && (
                      <a href={court.contact_details.instagram} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-orange-400 text-white text-sm font-bold hover:brightness-95 transition-all">
                        📷 Instagram
                      </a>
                    )}
                    {court.contact_details?.facebook && (
                      <a href={court.contact_details.facebook} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1877F2] text-white text-sm font-bold hover:brightness-95 transition-all">
                        Facebook
                      </a>
                    )}
                    {court.website && (
                      <a href={court.website} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-neutral-200 text-neutral-700 text-sm font-bold hover:border-emerald-300 transition-colors">
                        🌐 官網
                      </a>
                    )}
                  </div>
                </section>
              )}

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

              {/* FAQ — 對齊搜尋情境與 AI Overview */}
              {faqs.length > 0 && (
                <section className="bg-white rounded-2xl border border-neutral-100 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">關於{court.name}的常見問題</h2>
                  <div className="space-y-3">
                    {faqs.map(f => (
                      <details key={f.q} className="group border border-neutral-100 rounded-xl open:border-emerald-200 open:bg-emerald-50/30 transition-colors">
                        <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none font-semibold text-neutral-800 text-sm [&::-webkit-details-marker]:hidden">
                          {f.q}
                          <svg className="w-4 h-4 text-neutral-400 group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </summary>
                        <p className="px-4 pb-4 text-sm text-neutral-600 leading-relaxed">{f.a}</p>
                      </details>
                    ))}
                  </div>
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
                    🧭 開車導航
                  </a>
                  <a
                    href={transitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold px-4 py-3 rounded-xl hover:shadow-lg transition-shadow"
                    title="開啟 Google Maps 大眾運輸路線，自動帶入即時公車/捷運班次"
                  >
                    🚌 大眾運輸路線
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

          {/* 同城其他球場（內部連結） */}
          {siblings.length > 0 && (
            <section className="mt-8">
              <div className="flex items-baseline justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-neutral-900">{court.location.city}其他匹克球場</h2>
                {cityInfo && (
                  <Link to={`/courts/${cityInfo.slug}`} className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 whitespace-nowrap">
                    看全部 →
                  </Link>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {siblings.map(s => (
                  <Link
                    key={s.id}
                    to={`/courts/${courtSlug(s.id)}`}
                    className="group bg-white rounded-2xl border border-neutral-100 p-4 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-bold text-neutral-900 text-sm leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">{s.name}</span>
                      {s.is_new && <span className="shrink-0 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded">NEW</span>}
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-1 mb-2">{s.location.district || s.location.city}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{TYPE_LABEL(s.type)}</span>
                      <span className={`px-1.5 py-0.5 rounded-full ${s.fee === 'free' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{s.fee === 'free' ? '免費' : '付費'}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{s.courts_count} 面</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </LazyMotion>
  );
};

export default CourtDetail;
