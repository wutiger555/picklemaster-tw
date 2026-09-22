// 屬性型球場清單頁：/courts/free、/courts/indoor、/courts/outdoor、/courts/24h
// 屬性定義與文案來自 src/utils/courtAttributes.ts（預渲染腳本讀同一份）。
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Court, CourtsData } from '../types';
import { courtSlug } from '../utils/slugify';
import { CITY_INFO } from '../utils/cityData';
import { COURT_ATTRIBUTES, getAttributeBySlug } from '../utils/courtAttributes';
import CourtCard from '../components/court/CourtCard';
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

const citySlugOf = (city: string) => CITY_INFO.find(c => c.city === city)?.slug;

const AttributeCourts = () => {
  const { slug } = useParams<{ slug: string }>();
  const attr = getAttributeBySlug(slug);
  const [courts, setCourts] = useState<Court[] | null>(null);

  useEffect(() => {
    fetch('/data/courts.json')
      .then(r => r.json())
      .then((data: CourtsData) => setCourts(data.courts))
      .catch(() => setCourts([]));
  }, []);

  const matched = useMemo(
    () => (courts && attr ? courts.filter(attr.match) : []),
    [courts, attr]
  );

  // 依縣市分組：球場數多的縣市排前面，同時產生往城市頁的內部連結
  const byCity = useMemo(() => {
    const m = new Map<string, Court[]>();
    matched.forEach(c => {
      const list = m.get(c.location.city) || [];
      list.push(c);
      m.set(c.location.city, list);
    });
    return [...m.entries()]
      .map(([city, list]) => ({
        city,
        slug: citySlugOf(city),
        list: list.sort((a, b) => b.courts_count - a.courts_count),
      }))
      .sort((a, b) => b.list.length - a.list.length);
  }, [matched]);

  const totalCourtSurfaces = useMemo(
    () => matched.reduce((n, c) => n + (c.courts_count || 0), 0),
    [matched]
  );

  const faqs = useMemo(() => {
    if (!attr || matched.length === 0) return [];
    const top = byCity.slice(0, 5);
    return [
      {
        q: `全台有幾座${attr.label}匹克球場？`,
        a: `本站目前收錄 ${matched.length} 座${attr.label}匹克球場，分布於 ${byCity.length} 個縣市，合計 ${totalCourtSurfaces} 面球場。每座都標示本站最後查證日期。`,
      },
      {
        q: `哪個縣市的${attr.label}匹克球場最多？`,
        a: `${top.map(c => `${c.city} ${c.list.length} 座`).join('、')}。`,
      },
    ];
  }, [attr, matched, byCity, totalCourtSurfaces]);

  // JSON-LD：ItemList + FAQPage + BreadcrumbList
  useEffect(() => {
    if (!attr || matched.length === 0) return;
    const base = 'https://picklemastertw.com';
    const canonical = `${base}/courts/${attr.slug}/`;
    const data = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ItemList',
          name: attr.h1,
          numberOfItems: matched.length,
          itemListElement: matched.map((c, i) => ({
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
            url: `${base}/courts/${courtSlug(c.id)}/`,
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
            { '@type': 'ListItem', position: 2, name: '球場地圖', item: `${base}/courts/` },
            { '@type': 'ListItem', position: 3, name: attr.h1, item: canonical },
          ],
        },
      ],
    };
    const old = document.querySelector('script[data-structured="attribute-courts"]');
    if (old) old.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured', 'attribute-courts');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [attr, matched, faqs]);

  if (!attr) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-gradient-to-br from-teal-50/50 via-white to-orange-50/30">
        <PickleballIcon className="w-16 h-16 text-neutral-300" />
        <p className="text-neutral-500 text-lg">找不到這個球場分類</p>
        <Link to="/courts" className="text-emerald-600 font-medium hover:underline">← 回全台球場地圖</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-orange-50/30">
      <SEOHead
        page="courts"
        customTitle={`${attr.h1} 2026｜${matched.length || ''} 座完整名單、地址與開放時間`}
        customDescription={`${attr.intro}本站收錄 ${matched.length} 座，分布 ${byCity.length} 個縣市，每座標示最後查證日期。`}
      />

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
              <span className="text-neutral-800 font-medium">{attr.label}</span>
            </nav>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">
              {attr.h1}
              {matched.length > 0 && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">｜{matched.length} 座</span>
              )}
            </h1>
            <p className="text-neutral-600 leading-relaxed max-w-2xl mb-6">{attr.intro}</p>

            {matched.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-teal-100 rounded-full text-sm text-neutral-700 shadow-sm">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  {byCity.length} 個縣市
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-teal-100 rounded-full text-sm text-neutral-700 shadow-sm">
                  <span className="w-2 h-2 bg-sky-500 rounded-full" />
                  合計 {totalCourtSurfaces} 面
                </span>
              </div>
            )}

            {/* 其他分類交叉連結 */}
            <div className="flex flex-wrap gap-2">
              {COURT_ATTRIBUTES.filter(a => a.slug !== attr.slug).map(a => (
                <Link
                  key={a.slug}
                  to={`/courts/${a.slug}`}
                  className="px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600 hover:border-teal-300 hover:text-teal-700 transition-colors"
                >
                  {a.label}球場
                </Link>
              ))}
              <Link
                to="/courts"
                className="px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600 hover:border-teal-300 hover:text-teal-700 transition-colors"
              >
                全部球場
              </Link>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-12">
        {courts === null ? (
          <div className="text-center py-16 text-neutral-400">
            <PickleballIcon className="w-10 h-10 mx-auto mb-3 animate-spin text-teal-300" />
            載入中…
          </div>
        ) : matched.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-neutral-200">
            <PickleballIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">目前沒有符合這個條件的球場</p>
          </div>
        ) : (
          byCity.map(group => (
            <section key={group.city} className="mb-10">
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-xl font-bold text-neutral-900">
                  {group.slug ? (
                    <Link to={`/courts/${group.slug}`} className="hover:text-teal-700 transition-colors">{group.city}</Link>
                  ) : group.city}
                </h2>
                <span className="text-sm text-neutral-500">{group.list.length} 座</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.list.map((court, i) => (
                  <CourtCard key={court.id} court={court} index={i} />
                ))}
              </div>
            </section>
          ))
        )}

        {faqs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">💬</span>
              <h2 className="text-xl font-bold text-neutral-900">常見問題</h2>
            </div>
            <div className="space-y-3">
              {faqs.map(f => (
                <div key={f.q} className="bg-white rounded-xl border border-neutral-200 p-5">
                  <h3 className="font-bold text-neutral-900 mb-2">{f.q}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default AttributeCourts;
