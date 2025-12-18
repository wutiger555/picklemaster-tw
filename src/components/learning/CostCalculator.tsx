import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';

type BudgetTier = 'budget' | 'standard' | 'premium';

const TIER_DATA = {
    budget: {
        name: '小資入門',
        paddleCost: 1500,
        ballCost: 300,
        courtCost: 0,
        desc: '適合學生或想先體驗的休閒玩家。使用入門木質或複合材質球拍，主打免費公有球場。'
    },
    standard: {
        name: '進階愛好',
        paddleCost: 4000,
        ballCost: 600,
        courtCost: 200,
        desc: '適合每週打球的規律玩家。使用碳纖維球拍，偶爾租借室內場地。'
    },
    premium: {
        name: '專業競技',
        paddleCost: 7500,
        ballCost: 1000,
        courtCost: 500,
        desc: '適合追求極致表現的比賽選手。使用頂級職業球拍，頻繁參加付費俱樂部與賽事。'
    }
};

const CostCalculator = () => {
    const [tier, setTier] = useState<BudgetTier>('standard');
    const [playsPerWeek, setPlaysPerWeek] = useState(2);

    const data = TIER_DATA[tier];

    // Calculate Monthly Estimate (Amortize paddle over 12 months for simplicity in specific view, or just show upfront)
    // Let's show: Upfront Cost (Paddle) + Monthly Recurring (Balls + Courts)
    const upfrontCost = data.paddleCost;
    const monthlyRecurring = data.ballCost + (data.courtCost * 4 * playsPerWeek); // 4 weeks

    return (
        <GlassCard variant="light" size="lg" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-black text-neutral-900 mb-2">💰 匹克球預算試算</h3>
                    <p className="text-neutral-600">想入坑？幫你算算看需要準備多少銀彈！</p>
                </div>

                {/* Tier Selection */}
                <div className="flex justify-center gap-4 mb-8">
                    {(Object.keys(TIER_DATA) as BudgetTier[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTier(t)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${tier === t
                                ? 'bg-emerald-500 text-white shadow-lg scale-105'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                                }`}
                        >
                            {TIER_DATA[t].name}
                        </button>
                    ))}
                </div>

                {/* Description */}
                <motion.div
                    key={tier}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-50 p-4 rounded-xl text-center text-neutral-700 mb-8 border border-neutral-100"
                >
                    {data.desc}
                </motion.div>

                {/* Sliders / Inputs */}
                <div className="mb-8 px-4">
                    <label className="block text-sm font-bold text-neutral-700 mb-3 flex justify-between">
                        <span>每週打球頻率</span>
                        <span className="text-emerald-600">{playsPerWeek} 次</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="7"
                        value={playsPerWeek}
                        onChange={(e) => setPlaysPerWeek(parseInt(e.target.value))}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-neutral-400 mt-2">
                        <span>1次 (假日戰士)</span>
                        <span>7次 (匹克瘋)</span>
                    </div>
                </div>

                {/* Result Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col items-center justify-center">
                        <div className="text-sm text-neutral-500 font-bold uppercase tracking-wider mb-2">入坑首發 (裝備費)</div>
                        <motion.div
                            key={`upfront-${tier}`}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-4xl font-black text-neutral-900"
                        >
                            NT$ {upfrontCost.toLocaleString()}
                        </motion.div>
                        <div className="text-xs text-neutral-400 mt-2">一支好球拍的價格</div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center justify-center">
                        <div className="text-sm text-emerald-600 font-bold uppercase tracking-wider mb-2">每月預估開銷</div>
                        <motion.div
                            key={`monthly-${tier}-${playsPerWeek}`}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-4xl font-black text-emerald-600"
                        >
                            NT$ {monthlyRecurring.toLocaleString()}
                        </motion.div>
                        <div className="text-xs text-emerald-800/60 mt-2">耗材 (球) + 場地費</div>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default CostCalculator;
