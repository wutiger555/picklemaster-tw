import { Suspense, lazy } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { ROUTES } from '../utils/constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { useInView } from '../hooks/useInView';
import SEOHead from '../components/common/SEOHead';
import CourtSkeleton from '../components/hero/CourtSkeleton';
import { getUpcomingTournaments, TAIWAN_PICKLEBALL_STATS_2026 } from '../data/tournamentsData';

// Lazy load heavy sections including 3D components
const HeroCourtPreview = lazy(() => import('../components/hero/HeroCourtPreview'));
const NewsSection = lazy(() => import('../components/news/NewsSection'));
const NewCourtsTicker = lazy(() => import('../components/home/NewCourtsTicker'));

// Lazy Section Wrapper to trigger load on scroll
const LazySection = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1, rootMargin: "100px", once: true });

  return (
    <div ref={ref} className={className}>
      {inView ? (
        <Suspense fallback={<div className="w-full h-96 animate-pulse bg-neutral-100/50 rounded-3xl" />}>
          {children}
        </Suspense>
      ) : (
        <div className="w-full h-24" /> // Minimal placeholder
      )}
    </div>
  );
};

const Home = () => {
  usePageTitle();

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen">
        <SEOHead page="home" />
        {/* Hero Section - High Energy Sports Style */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-white">
          {/* Dynamic Background */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Mesh Gradients */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-400/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 animate-pulse-slow"></div>

            {/* Animated Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-neutral-100 rounded-full animate-spin-slow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-neutral-100 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>

            {/* Grid Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 pt-20">
            <div className="max-w-6xl mx-auto text-center">

              {/* Badge */}
              <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-full mb-8 shadow-xl shadow-emerald-500/20 transform -rotate-2 hover:rotate-0 transition-transform cursor-default"
              >
                <span className="text-emerald-400 text-lg">⚡</span>
                <span className="font-bold text-sm tracking-wide">全台最大匹克球學習平台</span>
              </m.div>

              {/* Main Headline */}
              <m.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-6xl sm:text-7xl md:text-9xl font-black text-neutral-900 mb-6 tracking-tighter leading-[0.9]"
              >
                MASTER THE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 animate-gradient-x">GAME.</span>
              </m.h1>

              {/* Description */}
              <m.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-lg md:text-2xl text-neutral-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                探索台灣最完整的匹克球地圖與課程。
                <br className="hidden md:block" />從 <span className="text-emerald-600 font-bold">零基礎入門</span> 到 <span className="text-blue-600 font-bold">職業級戰術</span>，都在這裡。
              </m.p>

              {/* 3D Preview (Kept but styled better) */}
              <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative mb-12 max-w-4xl mx-auto"
              >
                {/* Glow behind 3D element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 blur-3xl rounded-full -z-10"></div>

                <Suspense fallback={<CourtSkeleton />}>
                  {/* Wrapping in a container that handles scale nicely */}
                  <div className="transform scale-90 md:scale-100 transition-transform hover:scale-[1.02] duration-500">
                    <HeroCourtPreview />
                  </div>
                </Suspense>
                <p className="text-center text-neutral-400 text-xs mt-4 tracking-widest uppercase font-bold">
                  ●  Interactive 3D Preview  ●
                </p>
              </m.div>

              {/* CTA Buttons */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
              >
                <Link
                  to={ROUTES.NEWCOMER_GUIDE}
                  className="group relative px-8 py-4 bg-neutral-900 text-white rounded-xl font-bold text-lg overflow-hidden shadow-2xl shadow-neutral-900/30 w-full sm:w-auto min-w-[200px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    我是新手 <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>

                <Link
                  to={ROUTES.COURTS}
                  className="group px-8 py-4 bg-white text-neutral-900 border-2 border-neutral-100 rounded-xl font-bold text-lg hover:border-emerald-200 hover:bg-emerald-50 transition-all w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  搜尋球場
                </Link>
              </m.div>

              {/* Stats 2026 - Enhanced */}
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto border-t border-neutral-100 pt-8"
              >
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-neutral-900">60+</div>
                  <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">球場</div>
                </div>
                <div className="text-center md:border-l border-neutral-100">
                  <div className="text-2xl md:text-3xl font-black text-neutral-900">120<span className="text-sm">萬</span></div>
                  <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">2026 球友</div>
                </div>
                <div className="text-center border-l border-neutral-100 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-2xl md:text-3xl font-black text-neutral-900">10+</div>
                  <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">年度賽事</div>
                </div>
                <div className="text-center border-l border-neutral-100 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-2xl md:text-3xl font-black text-neutral-900">100%</div>
                  <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1">免費</div>
                </div>
              </m.div>

            </div>
          </div>
        </section>


        {/* 新球場跑馬燈 */}
        <Suspense fallback={null}>
          <NewCourtsTicker />
        </Suspense>

        {/* 新聞區塊 - 玻璃態 */}
        <LazySection className="bg-gradient-to-b from-white to-neutral-50/30 pt-8">
          <NewsSection />
        </LazySection>

        {/* 2026 即將到來賽事 - Authority Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-neutral-50/30 via-white to-neutral-50/30">
          <div className="container mx-auto px-4 max-w-6xl">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4"
            >
              <div>
                <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-3">
                  2026 Season · CTPF Official
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                  即將開打的賽事
                </h2>
                <p className="text-neutral-500 mt-2">掌握全台重點錦標賽與國際積分賽</p>
              </div>
              <Link
                to={ROUTES.TOURNAMENTS}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:text-emerald-600 transition-colors whitespace-nowrap"
              >
                查看全部 {TAIWAN_PICKLEBALL_STATS_2026.tournamentsYear} 場賽事
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </m.div>

            <div className="grid md:grid-cols-3 gap-4">
              {getUpcomingTournaments(3).map((t, i) => (
                <m.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={ROUTES.TOURNAMENTS}
                    className="block bg-white rounded-2xl border border-neutral-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{t.level}</span>
                      {t.featured && <span className="text-xs">⭐</span>}
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 leading-tight mb-2 group-hover:text-emerald-600 transition-colors">
                      {t.name}
                    </h3>
                    <div className="text-sm text-neutral-600 space-y-1 mt-3">
                      <div>📅 {t.dateLabel}</div>
                      <div>📍 {t.venue}</div>
                    </div>
                  </Link>
                </m.div>
              ))}
            </div>
          </div>
        </section>

        {/* Authority Resources - Explore More */}
        <section className="py-12 bg-neutral-900 text-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { to: ROUTES.GLOSSARY, label: '術語字典', desc: '中英對照權威詞彙', icon: '📖' },
                { to: ROUTES.RATINGS, label: 'DUPR 評級', desc: '2026 全球評分系統', icon: '📊' },
                { to: ROUTES.COURTS, label: '球場地圖', desc: '60+ 場地一鍵搜尋', icon: '🗺️' },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group bg-white/5 hover:bg-white/10 rounded-2xl p-6 border border-white/10 hover:border-emerald-400/50 transition-all"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold group-hover:text-emerald-400 transition-colors">{item.label}</h3>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <p className="text-sm text-neutral-400">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 學習路徑 - 時間軸設計 */}
        <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-neutral-50/30 to-white relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-neutral-900">
                學習路徑
              </h2>
              <p className="text-base md:text-lg text-neutral-600 max-w-xl mx-auto">
                循序漸進，從新手到高手
              </p>
            </m.div>

            {/* Timeline Container */}
            <div className="max-w-4xl mx-auto relative">
              {/* Vertical Line - Refined Premium Look */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-8 w-px bg-gradient-to-b from-transparent via-neutral-300 to-transparent -translate-x-1/2 z-0"></div>

              {/* Timeline Items */}
              <div className="space-y-12 md:space-y-16 relative z-10">
                {[
                  {
                    level: '新手入門',
                    icon: '🌱',
                    desc: '從零開始學習',
                    details: '認識球場、基礎規則、握拍發球',
                    color: 'emerald',
                    gradient: 'from-emerald-500 to-teal-500',
                    position: 'left'
                  },
                  {
                    level: '中階進修',
                    icon: '⚡',
                    desc: '提升技術戰術',
                    details: '進階技巧、戰術運用、雙打配合',
                    color: 'blue',
                    gradient: 'from-blue-500 to-indigo-500',
                    position: 'right'
                  },
                  {
                    level: '高手養成',
                    icon: '🏆',
                    desc: '追求卓越表現',
                    details: '技術精進、心理素質、體能訓練',
                    color: 'purple',
                    gradient: 'from-purple-500 to-pink-500',
                    position: 'left'
                  },
                ].map((path, index) => (
                  <m.div
                    key={index}
                    initial={{ opacity: 0, x: path.position === 'left' ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    className={`relative flex items-center ${path.position === 'right' ? 'md:flex-row-reverse' : ''
                      }`}
                  >
                    {/* Style updates to timeline nodes for better layering */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
                      <m.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + 0.3, type: "spring", stiffness: 200 }}
                        className={`w-12 h-12 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-xl z-10 relative`}
                      >
                        {/* Colored Ring */}
                        <div className={`absolute inset-0 rounded-full border-2 border-${path.color}-500 opacity-20`}></div>
                        {path.icon}
                      </m.div>
                    </div>

                    {/* Content Card */}
                    <Link
                      to={ROUTES.LEARNING_PATHS}
                      className={`w-full md:w-[calc(50%-3rem)] group ${path.position === 'right' ? 'md:ml-auto' : 'md:mr-auto'
                        }`}
                    >
                      <div className={`relative bg-white rounded-2xl p-6 sm:p-8 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1`}>
                        {/* Mobile Icon */}
                        <div className="md:hidden w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-2xl mb-4">
                          {path.icon}
                        </div>

                        {/* Step Label - Cleaner Look */}
                        <div className={`absolute top-6 ${path.position === 'right' ? 'md:left-auto md:right-8' : 'right-8'} right-8 text-xs font-bold tracking-widest text-neutral-400 uppercase`}>
                          Step 0{index + 1}
                        </div>

                        {/* Content */}
                        <div className={`${path.position === 'right' ? 'md:text-right' : 'md:text-left'} text-left`}>
                          <h3 className="text-xl md:text-2xl font-bold text-neutral-800 mb-2">
                            {path.level}
                          </h3>
                          <p className="text-sm md:text-base text-neutral-600 font-medium mb-3">
                            {path.desc}
                          </p>
                          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                            {path.details}
                          </p>
                          <div className={`flex items-center ${path.position === 'right' ? 'md:justify-end' : 'md:justify-start'} justify-start text-neutral-900 font-bold text-sm group-hover:translate-x-1 transition-transform`}>
                            <span>開始學習</span>
                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </m.div>
                ))}
              </div>

              {/* End Badge - Premium Look */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="mt-16 flex justify-center relative z-10"
              >
                <div className="group bg-white pl-2 pr-6 py-2 rounded-full border border-neutral-200 shadow-2xl flex items-center gap-4 hover:scale-105 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Goal</p>
                    <p className="text-sm font-bold text-neutral-800">成為匹克球達人</p>
                  </div>
                </div>
              </m.div>
            </div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
};

export default Home;
