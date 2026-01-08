import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SEOHead from '../components/common/SEOHead';
import { usePageTitle } from '../hooks/usePageTitle';
import CostCalculator from '../components/learning/CostCalculator';
import SportComparison from '../components/rules/SportComparison';
import { ROUTES } from '../utils/constants';

const NewcomerGuide = () => {
    usePageTitle();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div className="min-h-screen bg-neutral-50 overflow-x-hidden" ref={containerRef}>
            <SEOHead page="newcomer" />

            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Hero Section - High Energy */}
            <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-20 px-4 overflow-hidden">
                {/* Abstract Sports Graphics */}
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute top-1/4 left-10 w-24 h-24 border-4 border-neutral-900 rounded-full"></div>
                    <div className="absolute bottom-1/4 right-10 w-32 h-32 border-4 border-emerald-500 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-neutral-200 rounded-full animate-spin-slow"></div>
                </div>

                <motion.div style={{ y }} className="container mx-auto max-w-6xl relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="inline-flex items-center space-x-2 bg-neutral-900 text-white px-6 py-3 rounded-full font-bold text-sm md:text-base mb-8 shadow-xl shadow-emerald-500/20 transform -rotate-2"
                    >
                        <span className="text-emerald-400">⚡</span>
                        <span>台灣 No.1 匹克球新手指南</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-7xl md:text-9xl font-black text-neutral-900 mb-8 tracking-tighter leading-[0.9]"
                    >
                        PICKLE<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 animate-gradient-x">MASTER</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-2xl text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed mb-12"
                    >
                        第一次打匹克球？這不是老年人運動，這是<span className="border-b-4 border-emerald-400 font-bold text-neutral-900">全美成長最快的潮流競技</span>。
                        <br />我們幫你整理好所有入門捷徑。
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <a href="#am-i-ready" className="group relative px-8 py-4 bg-emerald-500 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/30">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative font-bold text-white text-lg flex items-center justify-center gap-2">
                                🚀 開始旅程 <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            <div className="container mx-auto px-4 max-w-6xl pb-32 space-y-32 relative z-10">

                {/* 1. Bento Grid: Am I Ready? */}
                <section id="am-i-ready">
                    <div className="flex flex-col md:flex-row items-end gap-6 mb-12">
                        <h2 className="text-5xl md:text-7xl font-black text-neutral-900 leading-none">
                            WHO IS<br /><span className="text-emerald-500">IT FOR?</span>
                        </h2>
                        <p className="text-neutral-500 font-bold pb-2 text-lg">誰適合打匹克球？Check it out.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:grid-rows-2 h-auto md:h-[500px]">
                        {/* Box 1: Large Feature */}
                        <motion.div
                            whileHover={{ scale: 0.98 }}
                            className="md:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/30 transition-colors"></div>
                            <span className="text-6xl mb-4 block">🏸</span>
                            <div>
                                <h3 className="text-3xl font-bold mb-2">羽球/網球轉職玩家</h3>
                                <p className="text-neutral-400">如果你原本就會拿拍子，恭喜你！你的上手速度是別人的 <span className="text-emerald-400 font-bold">200%</span>。殺球、截擊觀念完全通用。</p>
                            </div>
                        </motion.div>

                        {/* Box 2: Social */}
                        <motion.div
                            whileHover={{ scale: 0.98 }}
                            className="bg-white border-2 border-neutral-100 rounded-3xl p-8 flex flex-col justify-center text-center shadow-sm hover:shadow-xl transition-shadow"
                        >
                            <span className="text-5xl mb-4">🤝</span>
                            <h3 className="text-xl font-black text-neutral-900 mb-2">社交屬性 MAX</h3>
                            <p className="text-neutral-500 text-sm">雙打是主流，打一場球＝認識 3 個新朋友。</p>
                        </motion.div>

                        {/* Box 3: Health */}
                        <motion.div
                            whileHover={{ scale: 0.98 }}
                            className="bg-emerald-50 rounded-3xl p-8 flex flex-col justify-center shadow-inner"
                        >
                            <span className="text-5xl mb-4">🦵</span>
                            <h3 className="text-xl font-black text-emerald-900 mb-2">膝蓋救星</h3>
                            <p className="text-emerald-700 text-sm">場地小、衝刺少。想流汗但不想受傷？選這個就對了。</p>
                        </motion.div>

                        {/* Box 4: Inclusive */}
                        <motion.div
                            whileHover={{ scale: 0.98 }}
                            className="md:col-span-2 bg-white border-2 border-neutral-100 rounded-3xl p-8 flex items-center space-x-6 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden"
                        >
                            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-emerald-50 to-transparent"></div>
                            <span className="text-5xl relative z-10">👨‍👩‍👧‍👦</span>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-neutral-900 mb-2">家庭日最佳解</h3>
                                <p className="text-neutral-500">6 歲到 90 歲都能同場競技。真正的全齡運動。</p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 2. Transition Guide - Modernized Container */}
                <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-neutral-200/50 border border-neutral-100 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    <div className="text-center mb-12">
                        <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-2 block">Comparison</span>
                        <h2 className="text-4xl md:text-5xl font-black text-neutral-900">
                            轉換跑道<span className="text-emerald-500">無痛上手</span>
                        </h2>
                    </div>
                    {/* Wrapped in a cleaner container */}
                    <div className="transform -rotate-1">
                        <SportComparison />
                    </div>
                </section>

                {/* 3. Cost Calculator - Dark Mode Contrast */}
                <section className="bg-neutral-900 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px]"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-black mb-6">
                                錢包君<span className="text-emerald-400">不用哭</span>
                            </h2>
                            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                                很多人以為球拍運動都很燒錢，其實匹克球是入門門檻最低的運動之一。
                                <br />我們做了一個透明的計算機，算給你看。
                            </p>
                        </div>
                        {/* Force Light Mode style for Calculator or Custom? 
                            Assuming Calculator handles its own style or is transparent.
                            If it has white bg card, it will pop against dark section.
                         */}
                        <div className="bg-white rounded-3xl p-2 shadow-2xl shadow-emerald-900/50">
                            <CostCalculator />
                        </div>
                    </div>
                </section>

                {/* 4. CTA */}
                <section className="relative py-20 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        className="inline-block relative"
                    >
                        <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-30 animate-pulse"></div>
                        <h2 className="relative text-6xl md:text-8xl font-black text-neutral-900 mb-8 tracking-tighter">
                            ARE YOU <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">READY?</span>
                        </h2>
                    </motion.div>

                    <div className="flex flex-col md:flex-row justify-center gap-6 mt-12">
                        <a href="/equipment" className="group relative w-64 h-16 bg-neutral-900 rounded-full flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-200">
                            <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <span className="relative text-white font-bold text-lg">挑選裝備 🏸</span>
                        </a>
                        <a href={ROUTES.COURTS} className="w-64 h-16 bg-white border-2 border-neutral-200 rounded-full flex items-center justify-center font-bold text-lg text-neutral-900 hover:bg-neutral-50 hover:border-emerald-200 transition-all">
                            搜尋球場 📍
                        </a>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default NewcomerGuide;
