import { motion } from 'framer-motion';
import PaddleGuide from '../components/equipment/PaddleGuide';
import ProPlayerPaddles from '../components/equipment/ProPlayerPaddles';
import PaddleRecommender from '../components/equipment/PaddleRecommender';
import PaddleComparison from '../components/equipment/PaddleComparison';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';

const Equipment = () => {
  usePageTitle('匹克球裝備指南');

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEOHead page="equipment" />

      {/* Hero Section - Commercial Style */}
      <section className="relative h-[80vh] bg-neutral-950 flex items-center overflow-hidden">
        {/* Background Media Placeholder */}
        <div className="absolute inset-0 bg-neutral-900">
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/80 to-transparent z-10"></div>
          {/* Mocking a high-quality product shot background */}
          <div className="absolute right-0 top-0 w-2/3 h-full bg-neutral-800 opacity-20 bg-[url('https://images.unsplash.com/photo-1599474924187-334a405be655?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay grayscale"></div>
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="max-w-2xl"
          >
            <span className="text-emerald-500 font-bold tracking-widest uppercase mb-4 block text-sm">PickleMaster Gear</span>
            <h1 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-[0.9]">
              FIND YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">EDGE.</span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-lg font-medium leading-relaxed mb-10">
              裝備不只是工具，它是你戰術的延伸。
              <br />從新手入門到職業競技，找到屬於你的勝利方程式。
            </p>
            <a href="#recommender" className="inline-block px-10 py-5 bg-white text-black font-bold text-lg hover:bg-emerald-500 hover:text-white transition-colors duration-300">
              開始智能挑選
            </a>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24 space-y-40">

        {/* 1. Feature: Recommender - Sleek Dark Mode */}
        <section id="recommender" className="scroll-mt-24">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12 bg-neutral-100 rounded-none md:rounded-[3rem] overflow-hidden p-0 md:p-12">
              <div className="w-full md:w-1/3 p-10">
                <h2 className="text-4xl font-black text-neutral-950 mb-6">TOO MANY <br />CHOICES?</h2>
                <p className="text-neutral-600 mb-8 font-medium">
                  市面上有數百種球拍，但只有一種適合你。
                  讓我們的 AI 算法幫你過濾掉行銷話術，直接找到真愛。
                </p>
                <div className="h-1 w-20 bg-neutral-950"></div>
              </div>
              <div className="w-full md:w-2/3">
                <PaddleRecommender />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Visual Grid: Specs & Guide */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <h2 className="text-5xl font-black text-neutral-950 tracking-tighter">DEEP DIVE</h2>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">Technical Specifications</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Material */}
            <div className="bg-neutral-950 text-white p-12 min-h-[500px] flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute inset-0 bg-neutral-900 transition-transform duration-700 group-hover:scale-105"></div>
              <div className="relative z-10">
                <span className="text-emerald-500 font-mono text-xs mb-2 block">01 / MATERIALS</span>
                <h3 className="text-3xl font-bold mb-4">Core & Surface</h3>
                <p className="text-neutral-400 max-w-sm">蜂巢核 vs 複合材料。了解材質如何影響擊球的甜蜜點與聲音。</p>
              </div>
              <div className="relative z-10 mt-10">
                <PaddleGuide />
              </div>
            </div>

            {/* Card 2: Stats */}
            <div className="bg-neutral-100 p-12 min-h-[500px] flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-neutral-500 font-mono text-xs mb-2 block">02 / SPECS</span>
                <h3 className="text-3xl font-bold text-neutral-950 mb-4">Compare Stats</h3>
                <p className="text-neutral-600 max-w-sm">數據不會說謊。直接比較各款球拍的重量、握把長度與核心厚度。</p>
              </div>
              <div className="relative z-10 mt-10 overflow-x-auto">
                <PaddleComparison />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Pro Section (Carousel Style) */}
        <section id="pro-paddles" className="border-t border-neutral-200 pt-24">
          <div className="text-center mb-20">
            <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm block mb-4">The Professionals</span>
            <h2 className="text-5xl md:text-7xl font-black text-neutral-950 tracking-tighter uppercase">Champions'<br />Choice</h2>
          </div>
          <ProPlayerPaddles />
        </section>
      </div>
    </div>
  );
};

export default Equipment;
