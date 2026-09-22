// 資料查證方法頁 /data-method
//
// 為什麼要有這一頁：本站最難被取代的不是「收了幾座球場」，而是每一筆都經過人工查證、
// 而且標示查證日期。這件事原本只散落在各球場頁的一行小字，對讀者與搜尋引擎都不明顯。
// 頁面上所有數字都從 courts.json 即時計算，不寫死 —— 寫死的數字遲早會變成謊話。
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Court, CourtsData } from '../types';
import SEOHead from '../components/common/SEOHead';

const daysSince = (iso?: string) => {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
};

const STEPS = [
  {
    n: '01',
    title: '收錄：先確認場地真的存在',
    body: '新場地來自匹克球協會名錄、運動部 iPlay 場館資訊網、場館社群公告與讀者回報。每一筆都要能對到具體地址與座標才會收錄，不會只憑一則貼文就上架。',
  },
  {
    n: '02',
    title: '查證：逐座確認並記錄日期',
    body: '確認地址、球場面數、室內或戶外、收費方式、開放時間。每座球場都記下查證日期，並顯示在該球場頁上 —— 你看得到這筆資料是什麼時候確認的，而不是只能猜。',
  },
  {
    n: '03',
    title: '機械巡檢：每次更新都跑一遍',
    body: '自動檢查外部連結是否失效、哪些場地超過 120 天沒查證、資料是否有缺漏或格式錯誤，以及已標記關閉的場地是否該回頭複查。',
  },
  {
    n: '04',
    title: '歇業複查：機器查不出來的部分人工看',
    body: '網站回 HTTP 200 不代表場館還在營業 —— 實際遇過官網正常、粉專已刪、Google 地圖標示永久歇業的case。所以營業狀態一律人工查 Google 地圖確認，確認歇業的場地會直接在標題標示【已歇業】而不是悄悄刪掉。',
  },
];

const DataMethod = () => {
  const [courts, setCourts] = useState<Court[] | null>(null);

  useEffect(() => {
    fetch('/data/courts.json')
      .then(r => r.json())
      .then((data: CourtsData) => setCourts(data.courts))
      .catch(() => setCourts([]));
  }, []);

  const stats = useMemo(() => {
    if (!courts || courts.length === 0) return null;
    const ages = courts.map(c => daysSince(c.last_updated)).filter((d): d is number => d !== null).sort((a, b) => a - b);
    if (ages.length === 0) return null;
    return {
      total: courts.length,
      verified: ages.length,
      median: ages[Math.floor(ages.length / 2)],
      within90: ages.filter(d => d <= 90).length,
      newest: ages[0],
      cities: new Set(courts.map(c => c.location.city)).size,
      surfaces: courts.reduce((n, c) => n + (c.courts_count || 0), 0),
    };
  }, [courts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-orange-50/30">
      <SEOHead
        page="about"
        customTitle="球場資料怎麼來、怎麼查證｜Picklemaster 資料方法"
        customDescription={
          stats
            ? `本站 ${stats.total} 座匹克球場全部人工查證並標示查證日期，中位查證時距 ${stats.median} 天、${Math.round((stats.within90 / stats.verified) * 100)}% 在 90 天內確認過。說明資料來源、查證流程、歇業複查方式與錯誤回報管道。`
            : '本站匹克球場資料的來源、查證流程、歇業複查方式與錯誤回報管道。每座球場都標示最後查證日期。'
        }
      />

      <header className="container mx-auto px-4 py-10 md:py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-5" aria-label="breadcrumb">
            <Link to="/" className="hover:text-teal-600 transition-colors">首頁</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-800 font-medium">資料方法</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            球場資料怎麼來、怎麼查證
          </h1>
          <p className="text-neutral-600 leading-relaxed max-w-2xl">
            場館會搬家、會漲價、會歇業，而過期的球場資訊比沒有資訊更糟 —— 你會白跑一趟。
            所以本站每一座球場都人工查證過，並且把查證日期直接標在球場頁上。這頁說明整個流程。
          </p>
        </motion.div>
      </header>

      {stats && (
        <section className="container mx-auto px-4 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '收錄球場', value: `${stats.total} 座`, sub: `${stats.cities} 個縣市・合計 ${stats.surfaces} 面` },
              { label: '標示查證日期', value: `${stats.verified} / ${stats.total}`, sub: '每座球場頁都看得到' },
              { label: '查證時距中位數', value: `${stats.median} 天`, sub: `最近一次 ${stats.newest} 天前` },
              { label: '90 天內查證', value: `${Math.round((stats.within90 / stats.verified) * 100)}%`, sub: `${stats.within90} 座` },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-neutral-200 p-5">
                <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-neutral-900 mb-1">{s.value}</p>
                <p className="text-xs text-neutral-500 leading-snug">{s.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-400 mt-3">數字依 courts.json 即時計算，不是寫死的。</p>
        </section>
      )}

      <section className="container mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">查證流程</h2>
        <div className="space-y-4 max-w-3xl">
          {STEPS.map(s => (
            <div key={s.n} className="bg-white rounded-2xl border border-neutral-200 p-6 flex gap-5">
              <span className="text-2xl font-bold text-teal-600 shrink-0">{s.n}</span>
              <div>
                <h3 className="font-bold text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12 max-w-3xl">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">資料來源與授權</h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-3">
          部分場館的位置、聯絡方式、大眾運輸與實景照片來自
          <a href="https://iplay.sports.gov.tw/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">運動部全國運動場館資訊網 iPlay</a>
          ，依政府網站資料開放宣告使用，並在各球場頁標註來源場館名稱。其餘資訊為本站自行查證整理。
        </p>
        <h2 className="text-2xl font-bold text-neutral-900 mb-4 mt-8">發現資料有誤？</h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
          查證再勤也追不上所有變動。發現地址、費用、時段與現場不符，或知道本站還沒收錄的場地，
          歡迎直接告訴我們 —— 更正會連同新的查證日期一起更新。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/contact" className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 transition-all">
            回報資料錯誤
          </Link>
          <Link to="/courts" className="px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:border-teal-300 transition-colors">
            全台球場地圖
          </Link>
          <Link to="/about" className="px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:border-teal-300 transition-colors">
            關於本站
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DataMethod;
