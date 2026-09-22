import { m, LazyMotion, domAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import { ROUTES } from '../utils/constants';
import { RATING_TIERS } from '../data/ratingsData';

const Ratings = () => {
  return (
    <LazyMotion features={domAnimation}>
      <SEOHead page="ratings" />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        <section className="pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-6">
              DUPR · 2026 全球評級標準
            </span>
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
            >
              匹克球<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">DUPR 評級</span>完整指南
            </m.h1>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              搞懂全球通用的 1.0-8.0 動態評級系統。了解自己的等級、設定進步目標，並準備報名國際賽事。
            </p>
          </div>
        </section>

        {/* DUPR 介紹 */}
        <section className="container mx-auto px-4 max-w-5xl pb-12">
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 md:p-10 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">什麼是 DUPR？</h2>
            <p className="text-neutral-200 leading-relaxed mb-6">
              <strong>DUPR (Dynamic Universal Pickleball Rating)</strong> 是由 MLP 創辦人 Steve Kuhn 推動的全球通用匹克球評級系統，
              採用動態演算法即時更新每位球員的實力分數（1.0 到 8.0）。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: '透明', desc: '所有比賽結果公開可查' },
                { label: '動態', desc: '每場比賽即時影響評分' },
                { label: '全球通用', desc: '跨國賽事統一標準' },
              ].map(item => (
                <div key={item.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-lg font-bold text-emerald-400">{item.label}</div>
                  <div className="text-sm text-neutral-300 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 評級表 */}
        <section className="container mx-auto px-4 max-w-5xl pb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">評級對照表</h2>
          <div className="space-y-4">
            {RATING_TIERS.map((tier, i) => (
              <m.div
                key={tier.range}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  <div className={`md:w-48 bg-gradient-to-br ${tier.gradient} p-6 text-white flex flex-col justify-center`}>
                    <div className="text-4xl font-black">{tier.range}</div>
                    <div className="text-lg font-bold mt-1">{tier.level}</div>
                    <div className="text-xs text-white/70 mt-1">{tier.levelEn}</div>
                  </div>
                  <div className="flex-1 p-6">
                    <p className="text-neutral-700 leading-relaxed mb-3">{tier.description}</p>
                    <div className="mb-3">
                      <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">技術重點</div>
                      <ul className="space-y-1">
                        {tier.skills.map(s => (
                          <li key={s} className="flex items-start gap-2 text-sm text-neutral-700">
                            <span className="text-emerald-500 mt-0.5">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2">
                      <span className="font-bold">典型球員：</span> {tier.typicalPlayer}
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </section>

        {/* 如何取得 */}
        <section className="container mx-auto px-4 max-w-5xl pb-20">
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">台灣選手如何取得 DUPR 評分？</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  num: '01',
                  title: '參加 CTPF 認證賽事',
                  desc: '中華民國匹克球協會主辦的全國與區域賽事，賽後由主辦單位上傳成績至 DUPR 系統。',
                  cta: { label: '查看 2026 賽程', to: ROUTES.TOURNAMENTS },
                },
                {
                  num: '02',
                  title: '參加私人球館 DUPR 賽',
                  desc: 'P.dang、DOPE 水獺綠洲等私人球館定期舉辦 DUPR 認證賽，門檻較低且頻率高。',
                  cta: { label: '找球館', to: ROUTES.COURTS },
                },
                {
                  num: '03',
                  title: 'Verified Match',
                  desc: '與已有 DUPR 評分的球友進行正式對戰，雙方於 App 中登錄比賽結果即可。',
                  cta: null,
                },
              ].map(step => (
                <div key={step.num} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="text-4xl font-black text-emerald-500 mb-2">{step.num}</div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-3">{step.desc}</p>
                  {step.cta && (
                    <Link to={step.cta.to} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                      {step.cta.label} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
};

export default Ratings;
