import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEOHead from '../components/common/SEOHead';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  AEPL_LEAGUE, AEPL_FORMAT, AEPL_TEAMS, AEPL_STATIONS,
  AEPL_PLAYERS_SPOTLIGHT, AEPL_PRESEASON_RESULTS, AEPL_INTEL, AEPL_SOURCES,
  AEPL_STATION1_REPORT,
} from '../data/aeplData';

const STATION_STATUS: Record<string, { label: string; cls: string }> = {
  live: { label: '● 進行中', cls: 'bg-red-500 text-white animate-pulse' },
  done: { label: '已完賽', cls: 'bg-neutral-200 text-neutral-600' },
  scheduled: { label: '已排定', cls: 'bg-emerald-100 text-emerald-700' },
  tba: { label: '待公布', cls: 'bg-amber-100 text-amber-700' },
};

const FAQS = [
  { q: 'AEPL 是什麼？', a: 'AEPL（亞洲菁英匹克球聯盟）是台灣第一個匹克球職業聯賽，由亞洲菁英匹克球股份有限公司於 2026 年 5 月成立，定位為「台灣匹克球賽事的最高殿堂」。創始賽季 6 支企業隊、全台 8 站巡迴、總獎金新台幣 100 萬元，藝人林志穎擔任賽事大使。' },
  { q: 'AEPL 的比賽怎麼進行？', a: '採企業隊際制：每隊編制 6-10 名選手，每個分站登錄 4 人出賽，8 月至 11 月巡迴全台 8 站，11 月舉行總決賽。分站刻意選在人潮聚集的公共場域（如台中火車站空中廊道、高雄駁二特區），讓路過民眾就能看到職業比賽。' },
  { q: '有哪些球隊？', a: '創始賽季共 6 隊：桃園永豐雲豹（TPBL 雲豹體系，首站冠軍）、台南旭日雷霆（尚騰汽車×寶嘉聯合，首站亞軍）、新竹 YANKEY ACE、新北蘆沐、Ahhh（台北場館品牌）、富瑞特科技。' },
  { q: '在哪裡可以看比賽？', a: '分站均在開放公共場域舉行，現場觀賽免費親民。開幕站已於台中火車站空中廊道完賽（冠軍桃園永豐雲豹），第 2 站 9 月 19、20 日在高雄駁二特區登場，後續站點遍及雙北、桃園、新竹、宜蘭、台南等地，日期公布後本站將即時更新。' },
];

const Aepl = () => {
  usePageTitle('AEPL 職業聯賽專區');

  useEffect(() => {
    const base = 'https://picklemastertw.com';
    const data = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SportsOrganization',
          name: AEPL_LEAGUE.name,
          alternateName: AEPL_LEAGUE.nameEn,
          sport: 'Pickleball',
          foundingDate: AEPL_LEAGUE.founded,
          areaServed: { '@type': 'Country', name: 'Taiwan' },
          url: `${base}/aepl`,
          description: '台灣第一個匹克球職業聯賽：6 支企業隊、全台 8 站巡迴、總獎金新台幣 100 萬元。',
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: base + '/' },
            { '@type': 'ListItem', position: 2, name: 'AEPL 職業聯賽', item: `${base}/aepl` },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
      ],
    };
    const old = document.querySelector('script[data-structured="aepl"]');
    if (old) old.remove();
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-structured', 'aepl');
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
    return () => { s.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SEOHead
        customTitle="AEPL 職業聯賽專區｜台灣匹克球職業聯盟 球隊・賽程・戰力分析"
        customDescription="台灣第一個匹克球職業聯賽 AEPL 完整追蹤：首站冠軍桃園永豐雲豹、6 隊戰力卡、8 站巡迴賽程（第 2 站 9/19-20 高雄駁二）、Dreambreaker 賽制解說、選手焦點與戰報分析。總獎金百萬的創始賽季一站掌握。"
      />

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="container mx-auto px-4 pt-14 pb-12 md:pt-20 md:pb-16 relative z-10 max-w-6xl">
          <nav className="flex items-center gap-1.5 text-sm text-neutral-400 mb-8" aria-label="breadcrumb">
            <Link to="/" className="hover:text-teal-300 transition-colors">首頁</Link>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-200 font-medium">AEPL 職業聯賽專區</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-neutral-900 text-xs font-black tracking-wide">🏆 首站冠軍：桃園永豐雲豹</span>
              <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-black tracking-wide animate-pulse">● 下一站 9/19-20 高雄駁二</span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-neutral-200">2026 創始賽季</span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-neutral-200">台灣首個匹克球職業聯賽</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
              AEPL <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-300">職業聯賽專區</span>
            </h1>
            <p className="text-neutral-300 text-lg max-w-2xl mb-8 leading-relaxed">
              亞洲菁英匹克球聯盟（{AEPL_LEAGUE.nameEn}）— 台灣匹克球的職業元年從這裡開始。
              球隊戰力、巡迴賽程、賽制解析與賽前情報，本站持續追蹤整季。
            </p>

            {/* 關鍵數字 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
              {[
                { n: '6', label: '企業球隊' },
                { n: '8', label: '全台分站' },
                { n: '100 萬', label: '總獎金（NTD）' },
                { n: '11 月', label: '年度總決賽' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 backdrop-blur-sm">
                  <div className="text-2xl md:text-3xl font-black text-teal-300">{s.n}</div>
                  <div className="text-xs text-neutral-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20 max-w-6xl space-y-16">

        {/* ===== 賽季進度 ===== */}
        <section>
          <div className="flex items-baseline justify-between gap-3 mb-6">
            <h2 className="text-2xl md:text-3xl font-black">🗓️ 賽季進度</h2>
            <span className="text-xs text-neutral-500">更新於 {AEPL_LEAGUE.lastUpdated}</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {AEPL_STATIONS.map(st => {
              const badge = STATION_STATUS[st.status];
              return (
                <div key={st.station} className={`rounded-2xl border p-5 ${st.status === 'live' ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-neutral-400 tracking-widest">STATION {String(st.station).padStart(2, '0')}{st.station === 3 ? '+' : ''}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.cls}`}>{badge.label}</span>
                  </div>
                  <div className="text-xl font-black mb-1">{st.city}</div>
                  <div className="text-sm text-neutral-300 mb-2">{st.venue}</div>
                  <div className="text-xs text-neutral-500">{st.dateLabel}{st.note ? `・${st.note}` : ''}</div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-neutral-500 mt-3">後續分站的日期與場地由聯盟陸續公布，本站將即時更新。執行長張智維：「我們接下來的比賽都會選人潮最多的地方。」</p>
        </section>

        {/* ===== 首站戰報 ===== */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black mb-2">📰 首站戰報：台中站</h2>
          <p className="text-neutral-400 text-sm mb-6">{AEPL_STATION1_REPORT.dateLabel}</p>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-3 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-red-500/5 p-6">
              <div className="text-[11px] font-bold text-amber-300 tracking-widest mb-2">FINAL・冠軍戰</div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="text-2xl font-black">🏆 {AEPL_STATION1_REPORT.champion}</span>
                <span className="text-neutral-500 font-bold">def.</span>
                <span className="text-lg font-bold text-neutral-300">{AEPL_STATION1_REPORT.runnerUp}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-black">3:2</span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed mb-4">{AEPL_STATION1_REPORT.final}</p>
              <div className="space-y-2">
                {AEPL_STATION1_REPORT.quotes.map(q => (
                  <div key={q.who} className="rounded-xl bg-black/30 border border-white/5 p-3 text-sm">
                    <span className="text-teal-300 font-bold">{q.who}</span>
                    <span className="text-neutral-400">：「{q.text}」</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-[11px] font-bold text-neutral-400 tracking-widest mb-3">SEMIFINALS・4 強戰</div>
              <ul className="space-y-3">
                {AEPL_STATION1_REPORT.semis.map((m, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-300 leading-relaxed">
                    <span className="text-teal-400 shrink-0">▸</span>{m}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-neutral-500">
                什麼是 Dreambreaker？前 4 回合戰成 2:2 時的第 5 回合單點決勝制——MLP 職業體系同款的最刺激收尾方式。
              </div>
            </div>
          </div>
        </section>

        {/* ===== 賽制解析 ===== */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black mb-2">📋 賽制怎麼打</h2>
          <p className="text-neutral-400 text-sm mb-6 max-w-2xl">與傳統「個人報名、單場淘汰」的錦標賽不同，AEPL 是整季經營的隊際聯賽——這是把匹克球「觀賞化」的關鍵設計。</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AEPL_FORMAT.map(f => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-teal-400/40 transition-colors">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 p-5">
            <h3 className="font-bold mb-2 text-teal-300">國際化路線圖</h3>
            <div className="flex flex-col md:flex-row gap-3">
              {AEPL_LEAGUE.roadmap.map((r, i) => (
                <div key={r.year} className="flex items-start gap-3 flex-1">
                  <span className="shrink-0 w-14 text-center py-1 rounded-lg bg-white/10 text-sm font-black">{r.year}</span>
                  <span className="text-sm text-neutral-300 leading-snug">{r.milestone}{i < AEPL_LEAGUE.roadmap.length - 1 ? '' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 六隊戰力卡 ===== */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black mb-2">🛡️ 球隊戰力卡</h2>
          <p className="text-neutral-400 text-sm mb-6 max-w-3xl">
            依公開報導整理的隊伍檔案與本站編輯部賽前觀察。
            <span className="text-neutral-500">（隊伍圖示與配色為本站編製的視覺識別，非官方隊徽；「待公布」欄位將於官方公布後更新）</span>
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {AEPL_TEAMS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.06, 0.3), duration: 0.4 }}
                className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/25 transition-colors"
              >
                <div className={`h-1.5 bg-gradient-to-r ${t.gradient}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                        {t.emoji}
                      </div>
                      <div>
                        <h3 className="text-xl font-black leading-tight">{t.name}</h3>
                        {t.nameEn && <div className="text-xs text-neutral-500 font-semibold tracking-wide">{t.nameEn}</div>}
                      </div>
                    </div>
                    {!t.confirmed && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">待證實</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] font-semibold">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">{t.industry}</span>
                    {t.homeBase && <span className="px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">📍 {t.homeBase}</span>}
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">{t.backer}</span>
                  </div>

                  {t.knownPlayers.length > 0 ? (
                    <div className="mb-4 space-y-2">
                      {t.knownPlayers.map(p => (
                        <div key={p.name} className="flex items-start gap-2 text-sm">
                          <span className="shrink-0 px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[11px] font-bold">{p.name}</span>
                          <span className="text-neutral-400 text-xs leading-relaxed">{p.note}</span>
                        </div>
                      ))}
                      {!t.rosterConfirmed && <div className="text-[11px] text-neutral-600">＋完整陣容待官方公布</div>}
                    </div>
                  ) : (
                    <div className="mb-4 text-xs text-neutral-500">陣容待官方公布</div>
                  )}

                  <ul className="mb-4 space-y-1.5">
                    {t.facts.map((f, fi) => (
                      <li key={fi} className="flex gap-2 text-xs text-neutral-400 leading-relaxed">
                        <span className="text-teal-400 shrink-0">▸</span>{f}
                      </li>
                    ))}
                  </ul>

                  <div className="rounded-xl bg-black/30 border border-white/5 p-4">
                    <div className="text-[11px] font-bold text-amber-300/90 tracking-widest mb-1.5">本站賽前觀察</div>
                    <p className="text-sm text-neutral-300 leading-relaxed">{t.analysis}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== 選手焦點 ===== */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black mb-6">⭐ 選手焦點</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {AEPL_PLAYERS_SPOTLIGHT.map(p => (
              <div key={p.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-4xl mb-3">{p.emoji}</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-xl font-black">{p.name}</h3>
                  <span className="text-xs text-teal-300 font-bold">{p.role}</span>
                </div>
                <div className="text-xs text-neutral-500 mb-3">{p.team}</div>
                <p className="text-sm text-neutral-400 leading-relaxed">{p.story}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 季前暖身賽 ===== */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black mb-2">🏅 季前暖身賽成績</h2>
          <p className="text-neutral-400 text-sm mb-6">{AEPL_PRESEASON_RESULTS.dateLabel} — 開季前唯一的公開賽場數據，這批名字值得記住。</p>
          <div className="grid md:grid-cols-2 gap-4">
            {AEPL_PRESEASON_RESULTS.events.map(ev => (
              <div key={ev.event} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-bold mb-3">{ev.event}</h3>
                <div className="space-y-2">
                  {ev.results.map((r, i) => (
                    <div key={r.name} className="flex items-center gap-3 text-sm">
                      <span className="text-lg">{['🥇', '🥈', '🥉'][i]}</span>
                      <span className="w-10 text-xs text-neutral-500">{r.place}</span>
                      <span className="font-bold">{r.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 情報看板 ===== */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black mb-2">📡 情報看板</h2>
          <p className="text-neutral-400 text-sm mb-6">創始賽季資訊逐步揭露中——本站只寫已查證的事實，「還不知道的」也誠實告訴你。</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
              <h3 className="font-bold text-emerald-300 mb-3 flex items-center gap-2">✅ 已證實</h3>
              <ul className="space-y-2">
                {AEPL_INTEL.confirmed.map((x, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-300"><span className="text-emerald-400 shrink-0">✓</span>{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
              <h3 className="font-bold text-amber-300 mb-3 flex items-center gap-2">⏳ 待官方公布（本站追蹤中）</h3>
              <ul className="space-y-2">
                {AEPL_INTEL.pending.map((x, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-300"><span className="text-amber-400 shrink-0">◌</span>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black mb-6">💬 常見問題</h2>
          <div className="space-y-3 max-w-3xl">
            {FAQS.map(f => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/5 open:border-teal-400/40 transition-colors">
                <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none font-bold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg className="w-4 h-4 text-neutral-500 group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <p className="px-5 pb-5 text-sm text-neutral-400 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ===== 深度閱讀 + 導流 ===== */}
        <section className="rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 p-7 md:p-10">
          <h2 className="text-2xl font-black mb-2">想看完整的產業分析？</h2>
          <p className="text-teal-50/90 mb-6 max-w-2xl">6 支企業隊背後的產業版圖、選手經濟學（每站 3 萬的出國成本結構）、2027 東南亞 → 2028 亞洲巡迴時程——都在本站深度專欄。</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/articles/taiwan-pro-pickleball-2026" className="px-5 py-2.5 bg-white text-teal-700 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all">
              閱讀〈台灣匹克球職業元年全解析〉
            </Link>
            <Link to="/tournaments" className="px-5 py-2.5 bg-white/15 border border-white/30 rounded-xl text-sm font-bold hover:bg-white/25 transition-all">
              2026 賽事總覽
            </Link>
            <Link to="/courts" className="px-5 py-2.5 bg-white/15 border border-white/30 rounded-xl text-sm font-bold hover:bg-white/25 transition-all">
              找場地開打
            </Link>
          </div>
        </section>

        {/* ===== 資料來源 ===== */}
        <section className="text-xs text-neutral-600">
          <h3 className="font-bold text-neutral-500 mb-2">資料來源</h3>
          <ul className="space-y-1">
            {AEPL_SOURCES.map(s => (
              <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">{s.title}</a></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Aepl;
