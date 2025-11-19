/**
 * PaddleComparison 組件
 * 裝備對比模式 - 並排比較兩款球拍規格
 * 使用 Glassmorphism 設計和進階動畫
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp } from '../../utils/animations';
import GlassCard from '../common/GlassCard';

interface PaddleSpec {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceRange: 'budget' | 'mid' | 'premium';
  image?: string;
  specs: {
    weight: string;
    gripSize: string;
    coreType: string;
    surfaceMaterial: string;
    thickness: string;
    handleLength: string;
  };
  performance: {
    power: number;        // 1-10
    control: number;      // 1-10
    spin: number;         // 1-10
    durability: number;   // 1-10
  };
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
}

const samplePaddles: PaddleSpec[] = [
  // === 入門款 (Budget: NT$ 2,000-3,500) ===
  {
    id: '1',
    name: 'Rally Tyro 2 Pro',
    brand: 'Gamma',
    price: 'NT$ 2,200',
    priceRange: 'budget',
    specs: {
      weight: '7.8 oz (221g)',
      gripSize: '4.25"',
      coreType: 'Nomex',
      surfaceMaterial: 'Fiberglass',
      thickness: '13mm',
      handleLength: '5"',
    },
    performance: {
      power: 7,
      control: 6,
      spin: 5,
      durability: 7,
    },
    description: '經典入門款，適合初學者建立基礎技術',
    pros: ['價格親民', '輕量好上手', '耐用度佳'],
    cons: ['旋轉能力較弱', '控球精準度一般'],
    bestFor: ['初學者', '休閒娛樂', '預算有限'],
  },
  {
    id: '2',
    name: 'Starter Pro',
    brand: 'Franklin',
    price: 'NT$ 2,500',
    priceRange: 'budget',
    specs: {
      weight: '7.5 oz (213g)',
      gripSize: '4"',
      coreType: 'Polymer',
      surfaceMaterial: 'Composite',
      thickness: '12mm',
      handleLength: '4.75"',
    },
    performance: {
      power: 6,
      control: 7,
      spin: 5,
      durability: 8,
    },
    description: '輕量化設計，適合女性與青少年使用',
    pros: ['超輕量', '容易控制', '價格實惠'],
    cons: ['力量較弱', '不適合進攻型打法'],
    bestFor: ['女性球員', '青少年', '控球型打法'],
  },
  {
    id: '3',
    name: 'Pickleball-X Recruit',
    brand: 'HEAD',
    price: 'NT$ 3,200',
    priceRange: 'budget',
    specs: {
      weight: '8.0 oz (227g)',
      gripSize: '4.25"',
      coreType: 'Polymer',
      surfaceMaterial: 'Fiberglass',
      thickness: '13mm',
      handleLength: '5"',
    },
    performance: {
      power: 7,
      control: 7,
      spin: 6,
      durability: 7,
    },
    description: 'HEAD 品牌入門款，平衡性能優異',
    pros: ['知名品牌', '平衡性佳', '適合進階學習'],
    cons: ['價格稍高', '重量偏重'],
    bestFor: ['進階初學者', '全方位打法', '品牌愛好者'],
  },

  // === 中階款 (Mid-range: NT$ 4,000-7,000) ===
  {
    id: '4',
    name: 'Tempest Wave Pro',
    brand: 'Paddletek',
    price: 'NT$ 4,500',
    priceRange: 'mid',
    specs: {
      weight: '7.9 oz (224g)',
      gripSize: '4.25"',
      coreType: 'Polymer',
      surfaceMaterial: 'Graphite',
      thickness: '13mm',
      handleLength: '5"',
    },
    performance: {
      power: 8,
      control: 8,
      spin: 7,
      durability: 8,
    },
    description: '石墨面板提供優秀的觸球感與控制力',
    pros: ['石墨材質', '觸球感佳', '控球精準'],
    cons: ['需要一定技術', '價格中等'],
    bestFor: ['中階選手', '技術型打法', '雙打選手'],
  },
  {
    id: '5',
    name: 'Encore Pro',
    brand: 'Engage',
    price: 'NT$ 5,200',
    priceRange: 'mid',
    specs: {
      weight: '8.2 oz (232g)',
      gripSize: '4.5"',
      coreType: 'Polymer',
      surfaceMaterial: 'Raw Carbon Fiber',
      thickness: '16mm',
      handleLength: '5.25"',
    },
    performance: {
      power: 7,
      control: 9,
      spin: 9,
      durability: 8,
    },
    description: '原始碳纖維表面，旋轉能力極佳',
    pros: ['超強旋轉', '控球精準', '厚核心穩定'],
    cons: ['力量稍弱', '重量較重'],
    bestFor: ['旋轉型打法', '網前選手', '雙打專家'],
  },
  {
    id: '6',
    name: 'Kinetic Pro',
    brand: 'ProKennex',
    price: 'NT$ 5,800',
    priceRange: 'mid',
    specs: {
      weight: '8.1 oz (230g)',
      gripSize: '4.25"',
      coreType: 'Kinetic System',
      surfaceMaterial: 'Carbon Fiber',
      thickness: '14mm',
      handleLength: '5.25"',
    },
    performance: {
      power: 8,
      control: 8,
      spin: 8,
      durability: 9,
    },
    description: '獨家動能系統減震技術，保護手腕',
    pros: ['減震技術', '手感舒適', '全方位性能'],
    cons: ['價格較高', '需要適應期'],
    bestFor: ['手腕保護', '長時間打球', '全方位選手'],
  },
  {
    id: '7',
    name: 'Bantam EX-L',
    brand: 'Paddletek',
    price: 'NT$ 6,200',
    priceRange: 'mid',
    specs: {
      weight: '7.6 oz (215g)',
      gripSize: '4.25"',
      coreType: 'Polymer',
      surfaceMaterial: 'Graphite',
      thickness: '13mm',
      handleLength: '5.5"',
    },
    performance: {
      power: 7,
      control: 9,
      spin: 8,
      durability: 8,
    },
    description: '加長握把設計，適合雙手反拍',
    pros: ['加長握把', '控球極佳', '輕量化'],
    cons: ['力量不足', '不適合單手打法'],
    bestFor: ['雙手反拍', '防守型打法', '女性選手'],
  },
  {
    id: '8',
    name: 'Radical Pro',
    brand: 'HEAD',
    price: 'NT$ 6,800',
    priceRange: 'mid',
    specs: {
      weight: '8.3 oz (235g)',
      gripSize: '4.5"',
      coreType: 'Polymer',
      surfaceMaterial: 'Graphite + Fiberglass',
      thickness: '14mm',
      handleLength: '5.25"',
    },
    performance: {
      power: 8,
      control: 8,
      spin: 7,
      durability: 9,
    },
    description: 'HEAD 經典款，力量與控制完美平衡',
    pros: ['品牌信賴', '平衡性佳', '耐用度高'],
    cons: ['較重', '價格中高'],
    bestFor: ['進階選手', '全方位打法', '比賽使用'],
  },

  // === 高階款 (Premium: NT$ 7,000-10,000+) ===
  {
    id: '9',
    name: 'Vanguard Power Air',
    brand: 'Selkirk',
    price: 'NT$ 8,500',
    priceRange: 'premium',
    specs: {
      weight: '8.0 oz (227g)',
      gripSize: '4.25"',
      coreType: 'X5 Polymer',
      surfaceMaterial: 'Carbon Fiber T700',
      thickness: '16mm',
      handleLength: '5.25"',
    },
    performance: {
      power: 9,
      control: 7,
      spin: 8,
      durability: 9,
    },
    description: '進攻型選手的首選，T700 碳纖維提供爆發力',
    pros: ['強大力量', 'T700 碳纖維', '頂級材質'],
    cons: ['價格高', '需要技術基礎'],
    bestFor: ['進階選手', '進攻型打法', '比賽使用'],
  },
  {
    id: '10',
    name: 'Ben Johns Hyperion CFS 16',
    brand: 'JOOLA',
    price: 'NT$ 9,200',
    priceRange: 'premium',
    specs: {
      weight: '8.3 oz (235g)',
      gripSize: '4.5"',
      coreType: 'Reactive Polymer',
      surfaceMaterial: 'Carbon Friction Surface',
      thickness: '16mm',
      handleLength: '5.5"',
    },
    performance: {
      power: 8,
      control: 10,
      spin: 10,
      durability: 8,
    },
    description: '職業選手 Ben Johns 簽名款，極致控球與旋轉',
    pros: ['頂級控球', '超強旋轉', '職業級設計'],
    cons: ['價格昂貴', '較重'],
    bestFor: ['職業選手', '技術型打法', '錦標賽'],
  },
  {
    id: '11',
    name: 'Amped S7',
    brand: 'Selkirk',
    price: 'NT$ 8,800',
    priceRange: 'premium',
    specs: {
      weight: '7.8 oz (221g)',
      gripSize: '4.25"',
      coreType: 'Polymer',
      surfaceMaterial: 'FiberFlex',
      thickness: '13mm',
      handleLength: '5"',
    },
    performance: {
      power: 9,
      control: 8,
      spin: 8,
      durability: 9,
    },
    description: '輕量化高階款，力量與速度兼具',
    pros: ['輕量高階', '力量強大', '靈活快速'],
    cons: ['價格高', '薄核心需適應'],
    bestFor: ['快速打法', '進攻選手', '單打專家'],
  },
  {
    id: '12',
    name: 'Perseus CFS 16',
    brand: 'JOOLA',
    price: 'NT$ 8,200',
    priceRange: 'premium',
    specs: {
      weight: '8.4 oz (238g)',
      gripSize: '4.5"',
      coreType: 'Reactive Polymer',
      surfaceMaterial: 'Carbon Friction Surface',
      thickness: '16mm',
      handleLength: '5.25"',
    },
    performance: {
      power: 9,
      control: 9,
      spin: 9,
      durability: 8,
    },
    description: 'JOOLA 旗艦款，全方位頂級性能',
    pros: ['全方位頂級', '穩定性佳', '專業材質'],
    cons: ['價格昂貴', '重量最重'],
    bestFor: ['職業選手', '全方位打法', '高水平比賽'],
  },
  {
    id: '13',
    name: 'Vanguard Control Air Invikta',
    brand: 'Selkirk',
    price: 'NT$ 9,500',
    priceRange: 'premium',
    specs: {
      weight: '8.1 oz (230g)',
      gripSize: '4.25"',
      coreType: 'X5 Polymer',
      surfaceMaterial: 'Carbon Fiber T700',
      thickness: '16mm',
      handleLength: '5.75"',
    },
    performance: {
      power: 8,
      control: 10,
      spin: 9,
      durability: 9,
    },
    description: '加長型控球款，Selkirk 最高階產品',
    pros: ['極致控球', '加長握把', '頂級材質'],
    cons: ['價格最高', '需要高技術'],
    bestFor: ['職業選手', '控球型打法', '雙手反拍'],
  },
  {
    id: '14',
    name: 'Scorpius CFS 16',
    brand: 'JOOLA',
    price: 'NT$ 7,800',
    priceRange: 'premium',
    specs: {
      weight: '7.9 oz (224g)',
      gripSize: '4.25"',
      coreType: 'Reactive Polymer',
      surfaceMaterial: 'Carbon Friction Surface',
      thickness: '16mm',
      handleLength: '5"',
    },
    performance: {
      power: 8,
      control: 9,
      spin: 9,
      durability: 8,
    },
    description: 'JOOLA 輕量高階款，靈活性與控制兼具',
    pros: ['輕量高階', '旋轉優秀', '靈活快速'],
    cons: ['價格高', '力量稍弱'],
    bestFor: ['快速打法', '旋轉型選手', '女性職業選手'],
  },
  {
    id: '15',
    name: 'Electrum Pro',
    brand: 'Engage',
    price: 'NT$ 7,500',
    priceRange: 'premium',
    specs: {
      weight: '8.2 oz (232g)',
      gripSize: '4.5"',
      coreType: 'Polymer',
      surfaceMaterial: 'Raw Carbon Fiber',
      thickness: '16mm',
      handleLength: '5.25"',
    },
    performance: {
      power: 7,
      control: 10,
      spin: 10,
      durability: 8,
    },
    description: 'Engage 旗艦款，旋轉能力業界第一',
    pros: ['旋轉最強', '控球極佳', '原始碳纖維'],
    cons: ['力量較弱', '價格高'],
    bestFor: ['旋轉專家', '網前高手', '技術型選手'],
  },
  {
    id: '16',
    name: 'Extreme Tour',
    brand: 'Wilson',
    price: 'NT$ 7,200',
    priceRange: 'premium',
    specs: {
      weight: '8.3 oz (235g)',
      gripSize: '4.5"',
      coreType: 'Polymer',
      surfaceMaterial: 'Carbon Fiber',
      thickness: '14mm',
      handleLength: '5.25"',
    },
    performance: {
      power: 9,
      control: 8,
      spin: 7,
      durability: 9,
    },
    description: 'Wilson 進入匹克球市場的旗艦款',
    pros: ['品牌信賴', '力量強大', '耐用度高'],
    cons: ['旋轉一般', '價格中高'],
    bestFor: ['網球轉型選手', '力量型打法', '品牌愛好者'],
  },
];

interface PaddleComparisonProps {
  /**
   * 自訂球拍數據（可選）
   */
  paddles?: PaddleSpec[];
}

/**
 * 球拍對比組件
 */
export const PaddleComparison: React.FC<PaddleComparisonProps> = ({
  paddles = samplePaddles,
}) => {
  const [selectedPaddles, setSelectedPaddles] = useState<[number, number]>([0, 1]);
  const [priceFilter, setPriceFilter] = useState<'all' | 'budget' | 'mid' | 'premium'>('all');

  // 過濾球拍
  const filteredPaddles = priceFilter === 'all'
    ? paddles
    : paddles.filter(p => p.priceRange === priceFilter);

  // 性能指標顏色
  const getPerformanceColor = (value: number): string => {
    if (value >= 8) return 'bg-emerald-500';
    if (value >= 6) return 'bg-blue-500';
    if (value >= 4) return 'bg-yellow-500';
    return 'bg-neutral-400';
  };

  // 性能條
  const PerformanceBar: React.FC<{ label: string; value1: number; value2: number }> = ({
    label,
    value1,
    value2,
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-neutral-700">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getPerformanceColor(value1)}`}
              initial={{ width: 0 }}
              animate={{ width: `${value1 * 10}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-mono text-neutral-600">{value1}/10</span>
        </div>
        <div className="space-y-1">
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getPerformanceColor(value2)}`}
              initial={{ width: 0 }}
              animate={{ width: `${value2 * 10}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-mono text-neutral-600">{value2}/10</span>
        </div>
      </div>
    </div>
  );

  // 規格行
  const SpecRow: React.FC<{ label: string; value1: string; value2: string }> = ({
    label,
    value1,
    value2,
  }) => {
    const isDifferent = value1 !== value2;
    return (
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-neutral-200">
        <div className="text-sm font-semibold text-neutral-700">{label}</div>
        <div
          className={`text-sm font-mono ${isDifferent ? 'text-emerald-600 font-bold' : 'text-neutral-600'
            }`}
        >
          {value1}
        </div>
        <div
          className={`text-sm font-mono ${isDifferent ? 'text-blue-600 font-bold' : 'text-neutral-600'
            }`}
        >
          {value2}
        </div>
      </div>
    );
  };

  const paddle1 = filteredPaddles[selectedPaddles[0]] || paddles[0];
  const paddle2 = filteredPaddles[selectedPaddles[1]] || paddles[1];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 標題 */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center mb-12"
      >
        <h2 className="text-display-md font-display font-black text-neutral-900 mb-4">
          球拍規格對比
        </h2>
        <p className="text-body-lg text-neutral-600 mb-6">
          並排比較兩款球拍的詳細規格與性能表現 · 共 {paddles.length} 款球拍
        </p>

        {/* 價格區間篩選 */}
        <div className="flex justify-center gap-3 flex-wrap">
          {[
            { id: 'all', label: '全部', count: paddles.length },
            { id: 'budget', label: '入門款 ($2-3.5K)', count: paddles.filter(p => p.priceRange === 'budget').length },
            { id: 'mid', label: '中階款 ($4-7K)', count: paddles.filter(p => p.priceRange === 'mid').length },
            { id: 'premium', label: '高階款 ($7K+)', count: paddles.filter(p => p.priceRange === 'premium').length },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                setPriceFilter(filter.id as typeof priceFilter);
                setSelectedPaddles([0, 1]);
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${priceFilter === filter.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </motion.div>

      {/* 球拍選擇器 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[0, 1].map((index) => (
          <GlassCard key={index} variant="light" size="sm">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              選擇球拍 {index + 1}
            </label>
            <select
              value={selectedPaddles[index]}
              onChange={(e) => {
                const newSelection: [number, number] = [...selectedPaddles] as [number, number];
                newSelection[index] = parseInt(e.target.value);
                setSelectedPaddles(newSelection);
              }}
              className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-semibold"
            >
              {filteredPaddles.map((paddle, i) => (
                <option key={paddle.id} value={i}>
                  {paddle.brand} - {paddle.name} ({paddle.price})
                </option>
              ))}
            </select>
          </GlassCard>
        ))}
      </div>

      {/* 對比內容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedPaddles[0]}-${selectedPaddles[1]}`}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* 左側球拍 */}
          <GlassCard variant="primary" size="lg" magnetic>
            <div className="space-y-6">
              {/* 球拍資訊 */}
              <div>
                <div className="text-sm font-semibold text-emerald-700 mb-1">
                  {paddle1.brand}
                </div>
                <h3 className="text-heading-xl font-display font-bold text-neutral-900 mb-2">
                  {paddle1.name}
                </h3>
                <div className="text-display-sm font-display font-black text-emerald-600">
                  {paddle1.price}
                </div>
              </div>

              {/* 描述 */}
              <p className="text-body-md text-neutral-700 leading-relaxed">
                {paddle1.description}
              </p>

              {/* 優缺點 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-600 mb-2">✓ 優點</h4>
                  <ul className="space-y-1">
                    {paddle1.pros.map((pro, i) => (
                      <li key={i} className="text-caption-lg text-neutral-600">
                        • {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-600 mb-2">✗ 缺點</h4>
                  <ul className="space-y-1">
                    {paddle1.cons.map((con, i) => (
                      <li key={i} className="text-caption-lg text-neutral-600">
                        • {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 適合對象 */}
              <div>
                <h4 className="text-sm font-bold text-neutral-700 mb-2">適合</h4>
                <div className="flex flex-wrap gap-2">
                  {paddle1.bestFor.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-caption-lg font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 右側球拍 */}
          <GlassCard variant="secondary" size="lg" magnetic>
            <div className="space-y-6">
              {/* 球拍資訊 */}
              <div>
                <div className="text-sm font-semibold text-blue-700 mb-1">
                  {paddle2.brand}
                </div>
                <h3 className="text-heading-xl font-display font-bold text-neutral-900 mb-2">
                  {paddle2.name}
                </h3>
                <div className="text-display-sm font-display font-black text-blue-600">
                  {paddle2.price}
                </div>
              </div>

              {/* 描述 */}
              <p className="text-body-md text-neutral-700 leading-relaxed">
                {paddle2.description}
              </p>

              {/* 優缺點 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-blue-600 mb-2">✓ 優點</h4>
                  <ul className="space-y-1">
                    {paddle2.pros.map((pro, i) => (
                      <li key={i} className="text-caption-lg text-neutral-600">
                        • {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-600 mb-2">✗ 缺點</h4>
                  <ul className="space-y-1">
                    {paddle2.cons.map((con, i) => (
                      <li key={i} className="text-caption-lg text-neutral-600">
                        • {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 適合對象 */}
              <div>
                <h4 className="text-sm font-bold text-neutral-700 mb-2">適合</h4>
                <div className="flex flex-wrap gap-2">
                  {paddle2.bestFor.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-caption-lg font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* 詳細規格對比表 */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="mt-12"
      >
        <GlassCard variant="light" size="lg">
          <h3 className="text-heading-lg font-display font-bold text-neutral-900 mb-6">
            詳細規格對比
          </h3>

          {/* 規格表 */}
          <div className="space-y-0">
            <SpecRow
              label="重量"
              value1={paddle1.specs.weight}
              value2={paddle2.specs.weight}
            />
            <SpecRow
              label="握把尺寸"
              value1={paddle1.specs.gripSize}
              value2={paddle2.specs.gripSize}
            />
            <SpecRow
              label="核心類型"
              value1={paddle1.specs.coreType}
              value2={paddle2.specs.coreType}
            />
            <SpecRow
              label="表面材質"
              value1={paddle1.specs.surfaceMaterial}
              value2={paddle2.specs.surfaceMaterial}
            />
            <SpecRow
              label="厚度"
              value1={paddle1.specs.thickness}
              value2={paddle2.specs.thickness}
            />
            <SpecRow
              label="握把長度"
              value1={paddle1.specs.handleLength}
              value2={paddle2.specs.handleLength}
            />
          </div>

          {/* 性能對比 */}
          <div className="mt-8 pt-8 border-t-2 border-neutral-200">
            <h4 className="text-heading-md font-display font-bold text-neutral-900 mb-6">
              性能表現
            </h4>
            <div className="space-y-4">
              <PerformanceBar
                label="力量 Power"
                value1={paddle1.performance.power}
                value2={paddle2.performance.power}
              />
              <PerformanceBar
                label="控球 Control"
                value1={paddle1.performance.control}
                value2={paddle2.performance.control}
              />
              <PerformanceBar
                label="旋轉 Spin"
                value1={paddle1.performance.spin}
                value2={paddle2.performance.spin}
              />
              <PerformanceBar
                label="耐用度 Durability"
                value1={paddle1.performance.durability}
                value2={paddle2.performance.durability}
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default PaddleComparison;
