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

      {/* Hero Section */}
      <section className="relative bg-neutral-900 text-white py-24 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
          >
            匹克球<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">裝備全攻略</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed"
          >
            從新手入門到職業競技，我們幫你解析球拍科技，<br className="hidden md:block" />
            用數據與 AI 幫你找到最適合的「神兵利器」。
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-32">

        {/* 1. Recommender - High Value Interaction */}
        <section id="recommender" className="scroll-mt-24">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
              AI 智能推薦
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
              不知道怎麼選？<br />
              <span className="text-emerald-600">30 秒</span> 找出你的命定球拍
            </h2>
          </div>
          <PaddleRecommender />
        </section>

        {/* 2. Comparison Table */}
        <section id="comparison" className="scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-neutral-900 mb-4">熱門球拍規格一覽</h2>
            <p className="text-neutral-600">一目了然的材質與性能差異，不再被專有名詞搞混。</p>
          </div>
          <PaddleComparison />
        </section>

        {/* 3. Detailed Guide (SEO Content) */}
        <section id="guide" className="scroll-mt-24">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-neutral-100">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-neutral-900 mb-4">球拍材質與規格深度解析</h2>
              <p className="text-neutral-600">什麼是蜂巢核？碳纖維跟玻璃纖維差在哪？這裡有詳細解答。</p>
            </div>
            <PaddleGuide />
          </div>
        </section>

        {/* 4. Pro Players */}
        <section id="pro-paddles" className="scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-neutral-900 mb-4">跟著世界冠軍選裝備</h2>
            <p className="text-neutral-600">看看職業選手都在用什麼球拍，以及他們的選擇理由。</p>
          </div>
          <ProPlayerPaddles />
        </section>

        {/* 5. Budget Guide */}
        <section id="budget" className="scroll-mt-24 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-neutral-900 mb-8">
              裝備預算參考
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100 relative overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="font-bold text-xl text-neutral-900 mb-6 flex items-center">
                  🏸 球拍價格區間
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                    <span className="font-medium text-neutral-600">入門級 (複合材質)</span>
                    <span className="text-emerald-600 font-bold">NT$ 1,500 - 3,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                    <span className="font-medium text-neutral-600">中階級 (玻璃纖維)</span>
                    <span className="text-emerald-600 font-bold">NT$ 3,000 - 6,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-neutral-600">高階級 (碳纖維)</span>
                    <span className="text-emerald-600 font-bold">NT$ 6,000+</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-6 bg-neutral-50 p-3 rounded-lg">
                  💡 提示：新手建議從中階球拍開始，重量 7.5-8.5 oz 最為泛用。
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100 relative overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="font-bold text-xl text-neutral-900 mb-6 flex items-center">
                  👟 其他必要裝備
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-blue-500 font-bold text-sm">1</div>
                    <div>
                      <p className="font-bold text-neutral-900">專用運動鞋</p>
                      <p className="text-sm text-neutral-500">建議網球鞋或羽球鞋，避免慢跑鞋（易翻船）</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-blue-500 font-bold text-sm">2</div>
                    <div>
                      <p className="font-bold text-neutral-900">排汗運動服</p>
                      <p className="text-sm text-neutral-500">選擇透氣材質，避免棉質衣物</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-blue-500 font-bold text-sm">3</div>
                    <div>
                      <p className="font-bold text-neutral-900">護目鏡 (推薦)</p>
                      <p className="text-sm text-neutral-500">保護眼睛，避免球速過快誤傷</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Equipment;
