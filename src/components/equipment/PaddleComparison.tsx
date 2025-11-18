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
  {
    id: '1',
    name: 'Selkirk Vanguard Power Air',
    brand: 'Selkirk',
    price: 'NT$ 8,500',
    specs: {
      weight: '8.0 oz (227g)',
      gripSize: '4.25"',
      coreType: 'Polymer',
      surfaceMaterial: 'Carbon Fiber',
      thickness: '16mm',
      handleLength: '5.25"',
    },
    performance: {
      power: 9,
      control: 7,
      spin: 8,
      durability: 9,
    },
    description: '進攻型選手的首選，碳纖維面板提供出色的力量傳遞',
    pros: ['強大的擊球力量', '優秀的耐用性', '高級碳纖維材質'],
    cons: ['價格較高', '需要一定技術基礎'],
    bestFor: ['進階選手', '進攻型打法', '比賽使用'],
  },
  {
    id: '2',
    name: 'JOOLA Ben Johns Hyperion',
    brand: 'JOOLA',
    price: 'NT$ 9,200',
    specs: {
      weight: '8.3 oz (235g)',
      gripSize: '4.5"',
      coreType: 'Reactive Polymer',
      surfaceMaterial: 'Carbon Fiber + Fiberglass',
      thickness: '14mm',
      handleLength: '5.5"',
    },
    performance: {
      power: 8,
      control: 9,
      spin: 9,
      durability: 8,
    },
    description: '職業選手 Ben Johns 簽名款，極致的控球性能',
    pros: ['頂級控球表現', '優秀的旋轉能力', '專業級設計'],
    cons: ['價格昂貴', '較重不適合初學者'],
    bestFor: ['職業選手', '技術型打法', '錦標賽使用'],
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

  // 性能指標顏色
  const getPerformanceColor = (value: number): string => {
    if (value >= 8) return 'bg-primary-500';
    if (value >= 6) return 'bg-secondary-500';
    if (value >= 4) return 'bg-accent-500';
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
          className={`text-sm font-mono ${
            isDifferent ? 'text-primary-600 font-bold' : 'text-neutral-600'
          }`}
        >
          {value1}
        </div>
        <div
          className={`text-sm font-mono ${
            isDifferent ? 'text-secondary-600 font-bold' : 'text-neutral-600'
          }`}
        >
          {value2}
        </div>
      </div>
    );
  };

  const paddle1 = paddles[selectedPaddles[0]];
  const paddle2 = paddles[selectedPaddles[1]];

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
        <p className="text-body-lg text-neutral-600">
          並排比較兩款球拍的詳細規格與性能表現
        </p>
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
              className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all font-semibold"
            >
              {paddles.map((paddle, i) => (
                <option key={paddle.id} value={i}>
                  {paddle.brand} - {paddle.name}
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
                <div className="text-sm font-semibold text-primary-700 mb-1">
                  {paddle1.brand}
                </div>
                <h3 className="text-heading-xl font-display font-bold text-neutral-900 mb-2">
                  {paddle1.name}
                </h3>
                <div className="text-display-sm font-display font-black text-primary-600">
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
                  <h4 className="text-sm font-bold text-primary-600 mb-2">✓ 優點</h4>
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
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-caption-lg font-semibold"
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
                <div className="text-sm font-semibold text-secondary-700 mb-1">
                  {paddle2.brand}
                </div>
                <h3 className="text-heading-xl font-display font-bold text-neutral-900 mb-2">
                  {paddle2.name}
                </h3>
                <div className="text-display-sm font-display font-black text-secondary-600">
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
                  <h4 className="text-sm font-bold text-secondary-600 mb-2">✓ 優點</h4>
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
                      className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-caption-lg font-semibold"
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
