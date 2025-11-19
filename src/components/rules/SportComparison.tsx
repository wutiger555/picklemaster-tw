import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';

interface SportFeature {
    name: string;
    pickleball: string | number;
    tennis: string | number;
    badminton: string | number;
    icon: string;
    unit?: string;
}

interface FAQ {
    question: string;
    answer: string;
    icon: string;
}

const SportComparison = () => {
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const features: SportFeature[] = [
        {
            name: '球場大小',
            pickleball: '13.4 x 6.1',
            tennis: '23.77 x 10.97',
            badminton: '13.4 x 6.1',
            icon: '📏',
            unit: '公尺',
        },
        {
            name: '球拍重量',
            pickleball: '200-250',
            tennis: '250-350',
            badminton: '70-100',
            icon: '⚖️',
            unit: '公克',
        },
        {
            name: '球的速度',
            pickleball: '中速',
            tennis: '快速',
            badminton: '極快',
            icon: '⚡',
        },
        {
            name: '體力消耗',
            pickleball: '中等',
            tennis: '高',
            badminton: '高',
            icon: '💪',
        },
        {
            name: '學習難度',
            pickleball: '容易',
            tennis: '困難',
            badminton: '中等',
            icon: '📚',
        },
        {
            name: '適合年齡',
            pickleball: '6-90歲',
            tennis: '8-70歲',
            badminton: '8-65歲',
            icon: '👥',
        },
        {
            name: '雙打流行度',
            pickleball: '極高',
            tennis: '中等',
            badminton: '高',
            icon: '🤝',
        },
        {
            name: '場地需求',
            pickleball: '小',
            tennis: '大',
            badminton: '小',
            icon: '🏟️',
        },
    ];

    const faqs: FAQ[] = [
        {
            question: '會打網球的人，學匹克球會比較快嗎？',
            answer: '會的！網球選手通常能快速上手匹克球，因為：\n\n✅ **擊球技巧相似**：正手、反手、截擊等基本動作都能轉移\n✅ **戰術思維**：對球路、落點、節奏的理解可以直接應用\n✅ **場地感覺**：對球場空間、站位的認知有幫助\n\n⚠️ **需要調整的地方**：\n• 匹克球拍更輕，需要調整力道\n• 廚房區規則是全新的概念\n• 球速較慢，需要更多耐心\n• 發球必須下手（網球可以上手）\n\n💡 **建議**：網球選手通常 2-3 次練習就能掌握基本技巧，但要精通匹克球的獨特戰術（特別是小球對拉）還需要時間。',
            icon: '🎾',
        },
        {
            question: '會打羽球的人，學匹克球會比較快嗎？',
            answer: '會的！羽球選手也有很多優勢：\n\n✅ **反應速度**：羽球訓練出的快速反應在匹克球很有用\n✅ **手腕控制**：羽球的手腕技巧可以幫助控制球的旋轉\n✅ **網前技術**：羽球的網前小球經驗對匹克球很有幫助\n✅ **步法靈活**：羽球的快速移動能力是優勢\n\n⚠️ **需要調整的地方**：\n• 匹克球拍比羽球拍重很多（3倍）\n• 球不能落地前擊球（羽球規則）\n• 力量控制要重新學習\n• 球場雖然大小相同，但戰術完全不同\n\n💡 **建議**：羽球選手的網前技巧在匹克球非常吃香，特別是在廚房區的小球對拉。通常 3-4 次練習就能適應。',
            icon: '🏸',
        },
        {
            question: '完全沒打過球拍運動的人，學匹克球會很難嗎？',
            answer: '完全不會！匹克球就是為初學者設計的：\n\n✅ **最容易上手的球拍運動**：\n• 球場小，不需要跑太多\n• 球速慢，有時間反應\n• 規則簡單，容易理解\n• 下手發球，不需要高難度動作\n\n✅ **第一次打球就能對打**：\n• 大部分人第一次就能打來回\n• 不需要特殊體能或技巧\n• 失誤率低，成就感高\n\n✅ **社交性強**：\n• 雙打為主，有隊友支援\n• 球友通常很友善，願意教學\n• 不同水平的人也能一起玩\n\n💡 **建議**：完全新手通常 1-2 次練習就能享受比賽樂趣，這是匹克球最大的優勢！',
            icon: '🌟',
        },
        {
            question: '匹克球和網球、羽球最大的差異是什麼？',
            answer: '匹克球有三個獨特之處：\n\n🏓 **1. 廚房區（Non-Volley Zone）**\n• 網前 2.13 公尺禁止截擊\n• 這是匹克球獨有的規則\n• 創造出獨特的「小球對拉」戰術\n• 讓比賽更注重技巧而非力量\n\n⚡ **2. 雙跳規則（Two-Bounce Rule）**\n• 發球和接發球都必須落地彈跳\n• 減少發球優勢\n• 讓回合更長、更精彩\n\n🎯 **3. 只有發球方能得分**\n• 接發球方不能得分\n• 增加戰術深度\n• 比賽節奏更緊湊\n\n💡 **結論**：這些獨特規則讓匹克球成為一項全新的運動，不只是「小網球」或「慢羽球」！',
            icon: '🎯',
        },
    ];

    return (
        <div className="space-y-12">
            {/* 匹克球優勢總覽 */}
            <GlassCard variant="light" size="lg">
                <div className="text-center mb-8">
                    <h3 className="text-3xl font-black text-neutral-900 mb-4">
                        為什麼選擇匹克球？
                    </h3>
                    <p className="text-neutral-600 max-w-2xl mx-auto">
                        匹克球結合了網球、羽球、桌球的優點，創造出一項全新的運動體驗
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200"
                    >
                        <div className="text-4xl mb-3">✅</div>
                        <h4 className="text-xl font-bold text-emerald-700 mb-2">最容易上手</h4>
                        <p className="text-sm text-neutral-700">
                            學習曲線平緩，第一次打就能享受對打樂趣，不需要特殊體能或技巧基礎
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200"
                    >
                        <div className="text-4xl mb-3">👥</div>
                        <h4 className="text-xl font-bold text-emerald-700 mb-2">適合所有人</h4>
                        <p className="text-sm text-neutral-700">
                            6-90 歲都能玩，體力消耗適中，受傷風險低，是最佳的全家運動
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200"
                    >
                        <div className="text-4xl mb-3">🏟️</div>
                        <h4 className="text-xl font-bold text-emerald-700 mb-2">場地好找</h4>
                        <p className="text-sm text-neutral-700">
                            球場只需網球場的 1/4，羽球場也能直接使用，在台灣已有 55+ 個場地
                        </p>
                    </motion.div>
                </div>
            </GlassCard>

            {/* 數據對比表 */}
            <GlassCard variant="light" size="lg">
                <h3 className="text-2xl font-black text-neutral-900 mb-6">
                    規格數據對比
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-neutral-200">
                                <th className="text-left py-4 px-4 font-bold text-neutral-700">項目</th>
                                <th className="text-center py-4 px-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl mb-1">🏓</span>
                                        <span className="font-bold text-emerald-600">匹克球</span>
                                    </div>
                                </th>
                                <th className="text-center py-4 px-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl mb-1">🎾</span>
                                        <span className="font-bold text-yellow-600">網球</span>
                                    </div>
                                </th>
                                <th className="text-center py-4 px-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl mb-1">🏸</span>
                                        <span className="font-bold text-blue-600">羽球</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((feature, index) => (
                                <motion.tr
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xl">{feature.icon}</span>
                                            <span className="font-semibold text-neutral-700">{feature.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="inline-block px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold">
                                            {feature.pickleball} {feature.unit || ''}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="inline-block px-4 py-2 rounded-lg text-neutral-600">
                                            {feature.tennis} {feature.unit || ''}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="inline-block px-4 py-2 rounded-lg text-neutral-600">
                                            {feature.badminton} {feature.unit || ''}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* 視覺化對比 - 改進版 */}
            <GlassCard variant="light" size="lg">
                <h3 className="text-2xl font-black text-neutral-900 mb-6">
                    球場大小視覺對比
                </h3>

                {/* 並排對比 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* 網球場 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-2">🎾</div>
                            <h4 className="text-xl font-bold text-yellow-600 mb-1">網球場</h4>
                            <p className="text-sm text-neutral-600">最大的球場</p>
                        </div>
                        <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-400">
                            {/* 球場示意圖 */}
                            <div className="aspect-[23.77/10.97] bg-yellow-500/20 border-4 border-yellow-500 rounded-lg relative">
                                {/* 中線 */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-yellow-600/50" />
                                {/* 發球線 */}
                                <div className="absolute top-1/4 left-0 right-0 h-1 bg-yellow-600/50" />
                                <div className="absolute bottom-1/4 left-0 right-0 h-1 bg-yellow-600/50" />
                            </div>
                            {/* 尺寸標註 */}
                            <div className="mt-4 space-y-2 text-center">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-600">長度：</span>
                                    <span className="font-bold text-yellow-700">23.77 公尺</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-600">寬度：</span>
                                    <span className="font-bold text-yellow-700">10.97 公尺</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-600">面積：</span>
                                    <span className="font-bold text-yellow-700">260.7 m²</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 匹克球場 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-2">🏓</div>
                            <h4 className="text-xl font-bold text-emerald-600 mb-1">匹克球場</h4>
                            <p className="text-sm text-neutral-600">約為網球場的 1/4</p>
                        </div>
                        <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-400 ring-4 ring-emerald-200">
                            {/* 球場示意圖 */}
                            <div className="aspect-[13.4/6.1] bg-emerald-500/20 border-4 border-emerald-500 rounded-lg relative">
                                {/* 中線 */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-emerald-600/50" />
                                {/* 廚房區（兩側） */}
                                <div className="absolute top-0 left-0 right-1/2 h-[30%] bg-emerald-600/30 border-b-2 border-emerald-600">
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-emerald-700">
                                        廚房區
                                    </span>
                                </div>
                                <div className="absolute top-0 left-1/2 right-0 h-[30%] bg-emerald-600/30 border-b-2 border-emerald-600">
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-emerald-700">
                                        廚房區
                                    </span>
                                </div>
                            </div>
                            {/* 尺寸標註 */}
                            <div className="mt-4 space-y-2 text-center">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-600">長度：</span>
                                    <span className="font-bold text-emerald-700">13.4 公尺</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-600">寬度：</span>
                                    <span className="font-bold text-emerald-700">6.1 公尺</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-600">面積：</span>
                                    <span className="font-bold text-emerald-700">81.7 m²</span>
                                </div>
                                <div className="pt-2 border-t border-emerald-200">
                                    <span className="text-xs text-emerald-600 font-semibold">
                                        ✨ 廚房區深度：2.13 公尺
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 羽球場 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-2">🏸</div>
                            <h4 className="text-xl font-bold text-blue-600 mb-1">羽球場</h4>
                            <p className="text-sm text-neutral-600">與匹克球相同</p>
                        </div>
                        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-400">
                            {/* 球場示意圖 */}
                            <div className="aspect-[13.4/6.1] bg-blue-500/20 border-4 border-blue-500 rounded-lg relative">
                                {/* 中線 */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-blue-600/50" />
                                {/* 發球線 */}
                                <div className="absolute top-[20%] left-0 right-0 h-1 bg-blue-600/50" />
                                <div className="absolute bottom-[20%] left-0 right-0 h-1 bg-blue-600/50" />
                                {/* 單打邊線 */}
                                <div className="absolute top-0 bottom-0 left-[15%] w-1 bg-blue-600/30" />
                                <div className="absolute top-0 bottom-0 right-[15%] w-1 bg-blue-600/30" />
                            </div>
                            {/* 尺寸標註 */}
                            <div className="mt-4 space-y-2 text-center">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-600">長度：</span>
                                    <span className="font-bold text-blue-700">13.4 公尺</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-600">寬度：</span>
                                    <span className="font-bold text-blue-700">6.1 公尺</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-600">面積：</span>
                                    <span className="font-bold text-blue-700">81.7 m²</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 比例對比圖 */}
                <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-8">
                    <h4 className="text-lg font-bold text-neutral-800 mb-6 text-center">
                        📐 面積比例對比
                    </h4>
                    <div className="flex items-end justify-center gap-8">
                        {/* 網球場 */}
                        <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex flex-col items-center origin-bottom"
                        >
                            <div className="w-24 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg shadow-lg" style={{ height: '260px' }}>
                                <div className="text-white font-bold text-sm text-center pt-2">100%</div>
                            </div>
                            <div className="mt-2 text-center">
                                <div className="text-sm font-bold text-yellow-600">網球</div>
                                <div className="text-xs text-neutral-600">260.7 m²</div>
                            </div>
                        </motion.div>

                        {/* 匹克球場 */}
                        <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-col items-center origin-bottom"
                        >
                            <div className="w-24 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg shadow-lg" style={{ height: '81px' }}>
                                <div className="text-white font-bold text-sm text-center pt-2">31%</div>
                            </div>
                            <div className="mt-2 text-center">
                                <div className="text-sm font-bold text-emerald-600">匹克球</div>
                                <div className="text-xs text-neutral-600">81.7 m²</div>
                            </div>
                        </motion.div>

                        {/* 羽球場 */}
                        <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="flex flex-col items-center origin-bottom"
                        >
                            <div className="w-24 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg shadow-lg" style={{ height: '81px' }}>
                                <div className="text-white font-bold text-sm text-center pt-2">31%</div>
                            </div>
                            <div className="mt-2 text-center">
                                <div className="text-sm font-bold text-blue-600">羽球</div>
                                <div className="text-xs text-neutral-600">81.7 m²</div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* 重點說明 */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                        <div className="text-2xl mb-2">✅</div>
                        <h5 className="font-bold text-emerald-700 mb-1">場地好找</h5>
                        <p className="text-sm text-neutral-600">
                            匹克球場只需網球場的 1/4 空間，羽球場也能直接使用
                        </p>
                    </div>
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                        <div className="text-2xl mb-2">⚡</div>
                        <h5 className="font-bold text-emerald-700 mb-1">移動距離短</h5>
                        <p className="text-sm text-neutral-600">
                            球場小代表跑動距離短，體力消耗較低，適合長時間遊戲
                        </p>
                    </div>
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                        <div className="text-2xl mb-2">🏓</div>
                        <h5 className="font-bold text-emerald-700 mb-1">獨特廚房區</h5>
                        <p className="text-sm text-neutral-600">
                            網前 2.13 公尺禁止截擊，增加戰術深度與趣味性
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* 常見問題 FAQ */}
            <GlassCard variant="light" size="lg">
                <h3 className="text-2xl font-black text-neutral-900 mb-6 text-center">
                    💬 常見問題
                </h3>
                <p className="text-center text-neutral-600 mb-8">
                    關於匹克球與其他球拍運動的關係
                </p>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <button
                                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                                className="w-full text-left bg-neutral-50 hover:bg-neutral-100 rounded-xl p-6 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <span className="text-3xl flex-shrink-0">{faq.icon}</span>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-neutral-900 mb-1">
                                                {faq.question}
                                            </h4>
                                            <AnimatePresence>
                                                {expandedFAQ === index && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="mt-4 text-sm text-neutral-700 leading-relaxed whitespace-pre-line"
                                                    >
                                                        {faq.answer}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-2xl text-neutral-400 flex-shrink-0 ml-4"
                                    >
                                        ▼
                                    </motion.div>
                                </div>
                            </button>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

export default SportComparison;
