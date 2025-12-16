import { Suspense, lazy } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { ROUTES } from '../utils/constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { useInView } from '../hooks/useInView';
import SEOHead from '../components/common/SEOHead';
import CourtSkeleton from '../components/hero/CourtSkeleton';

// Lazy load heavy sections including 3D components
const HeroCourtPreview = lazy(() => import('../components/hero/HeroCourtPreview'));
const NewsSection = lazy(() => import('../components/news/NewsSection'));

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
        {/* 英雄區塊 - 簡潔設計 */}
        <section className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white min-h-[75vh] flex items-center overflow-hidden">
          {/* 球場主題背景 */}
          <div className="absolute inset-0 overflow-hidden">
            {/* 球場紋理底層 */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
                backgroundSize: '60px 60px'
              }} />
            </div>

            {/* 球場線條裝飾 */}
            <svg className="absolute inset-0 w-full h-full opacity-8" viewBox="0 0 1000 800">
              <line x1="0" y1="400" x2="1000" y2="400" stroke="white" strokeWidth="3" />
              <line x1="500" y1="0" x2="500" y2="800" stroke="white" strokeWidth="2" strokeDasharray="15,10" />
              <rect x="200" y="300" width="250" height="120" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
              <rect x="550" y="380" width="250" height="120" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
            </svg>

            {/* 光暈效果 */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-green-950/40" />
          </div>

          <div className="container mx-auto px-4 relative z-10 py-12">
            <div className="max-w-5xl mx-auto">
              {/* 精緻標語 - 極簡設計 */}
              <m.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-6">
                  <span className="text-2xl">🏓</span>
                  <p className="text-lg md:text-xl text-white/95 font-semibold tracking-wide">
                    探索匹克球的無限可能
                  </p>
                </div>
              </m.div>

              {/* 3D 球場預覽 - 居中 */}
              <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-12"
              >
                <Suspense fallback={<CourtSkeleton />}>
                  <HeroCourtPreview />
                </Suspense>
                <p className="text-center text-white/70 text-sm mt-4">
                  ↻ 360° 旋轉檢視真實球場配置
                </p>
              </m.div>

              {/* CTA 按鈕組 - 簡潔版 */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
              >
                <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={ROUTES.RULES}
                    className="group bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center min-w-[160px] sm:min-w-[180px] justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    開始學習
                  </Link>
                </m.div>

                <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={ROUTES.COURTS}
                    className="group bg-white/10 backdrop-blur-md text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center min-w-[160px] sm:min-w-[180px] justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    找球場
                  </Link>
                </m.div>

                <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={ROUTES.SCORER}
                    className="group bg-accent-500 hover:bg-accent-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center min-w-[160px] sm:min-w-[180px] justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    計分器
                  </Link>
                </m.div>
              </m.div>

              {/* 簡潔統計 */}
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center justify-center gap-4 sm:gap-8 text-white/80 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg">🏟️</span>
                  <span className="font-semibold">55+ 球場</span>
                </div>
                <div className="w-px h-4 bg-white/30"></div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg">🎓</span>
                  <span className="font-semibold">互動教學</span>
                </div>
                <div className="w-px h-4 bg-white/30"></div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg">🎾</span>
                  <span className="font-semibold">裝備指南</span>
                </div>
              </m.div>
            </div>
          </div>

          {/* 波浪裝飾 */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" className="w-full h-auto">
              <path
                fill="#ffffff"
                d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              />
            </svg>
          </div>
        </section>


        {/* 新聞區塊 - 玻璃態 */}
        <LazySection className="bg-gradient-to-b from-white to-neutral-50/30">
          <NewsSection />
        </LazySection>

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
