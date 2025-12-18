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
        <div className="min-h-screen bg-neutral-50 overflow-hidden" ref={containerRef}>
            <SEOHead page="newcomer" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 mb-10 overflow-hidden">
                <div className="absolute inset-0 bg-white">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>
                </div>

                <motion.div style={{ y }} className="container mx-auto max-w-5xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-bold text-sm mb-6"
                    >
                        🔰 台灣新手的最佳起點
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-neutral-900 mb-6 tracking-tight"
                    >
                        第一次打匹克球<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">就上手</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        不用擔心規則太難，也別怕裝備太貴。我們為台灣玩家整理了最完整的入門指南，幫你省去爬文的時間。
                    </motion.p>
                </motion.div>
            </section>

            <div className="container mx-auto px-4 max-w-4xl pb-32 space-y-24">

                {/* 1. Am I Ready? (Interactive Checklist) */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-neutral-900 mb-4">我適合打匹克球嗎？</h2>
                        <p className="text-neutral-600">如果你符合以下任一點，這項運動就是為你量身打造的！</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { icon: '🏸', title: '有羽球/網球基礎', desc: '上手速度快 50%，戰術觀念通通能用' },
                            { icon: '👨‍👩‍👧‍👦', title: '想找全家人的活動', desc: '6 歲到 90 歲都能同樂，阿公也能電孫子' },
                            { icon: '🦵', title: '想運動但怕受傷', desc: '場地小、跑動少，對膝蓋負擔比網球低很多' },
                            { icon: '🤝', title: '喜歡交朋友', desc: '雙打為主，講求配合，打一場球就交一個朋友' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-start space-x-4 hover:shadow-md transition-shadow"
                            >
                                <div className="text-4xl bg-neutral-50 p-3 rounded-xl">{item.icon}</div>
                                <div>
                                    <h3 className="font-bold text-lg text-neutral-900 mb-1">{item.title}</h3>
                                    <p className="text-neutral-600 text-sm">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 2. Transition Guide (SportComparison Reuse but contextualized) */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-neutral-900 mb-4">從其他運動轉過來？</h2>
                        <p className="text-neutral-600">別讓舊習慣成為你的絆腳石，看看有哪些不同點。</p>
                    </div>
                    {/* We reuse the excellent SportComparison component here as it fits perfectly */}
                    <SportComparison />
                </section>

                {/* 3. Cost Calculator */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-neutral-900 mb-4">真的不會很貴嗎？</h2>
                        <p className="text-neutral-600">透明的預算分析，打破「球拍運動都很貴」的迷思。</p>
                    </div>
                    <CostCalculator />
                </section>

                {/* 4. Next Step Call to Action */}
                <section className="bg-neutral-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">準備好拿球拍了嗎？</h2>
                        <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
                            現在就去看看我們精選的球拍推薦，或是直接搜尋離你最近的球場！
                        </p>
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <a href="/equipment" className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-400 transition-colors">
                                挑選第一支球拍
                            </a>
                            <a href={ROUTES.COURTS} className="bg-white text-neutral-900 px-8 py-4 rounded-xl font-bold hover:bg-neutral-100 transition-colors">
                                搜尋附近球場
                            </a>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default NewcomerGuide;
