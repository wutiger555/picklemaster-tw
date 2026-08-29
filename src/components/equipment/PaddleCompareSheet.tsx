/**
 * PaddleCompareSheet — Apple 風格的球拍規格比較體驗
 * - 彈簧滑入全螢幕 sheet，捲動時商品欄固定頂端、規格名稱固定左側
 * - 「只看差異」開關：隱藏所有球拍規格相同的列
 * - 性能雷達疊加圖 + 智慧洞察（綜合最高 / CP 指數最高 / 最低價）
 * - 開啟時鎖定背景捲動並暫停 Lenis，內部捲動不再被攔截
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getPurchaseChannels, CHANNEL_TYPE_META, type Paddle } from '../../data/paddleDatabase';
import PaddleVisual from './PaddleVisual';
import PaddleRadar from './PaddleRadar';

// 每欄一個代表色（雷達 / 評分條 / 商品欄頂線共用）
const SERIES_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

const avgRating = (p: Paddle) =>
  (p.rating.power + p.rating.control + p.rating.spin + p.rating.forgiveness) / 4;

/** 鎖定背景頁面捲動（含 Lenis 平滑捲動） */
const useScrollLock = () => {
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop?: () => void; start?: () => void } }).__lenis;
    lenis?.stop?.();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      lenis?.start?.();
    };
  }, []);
};

interface Props {
  paddles: Paddle[];
  onClose: () => void;
  onRemove: (slug: string) => void;
}

const PaddleCompareSheet = ({ paddles, onClose, onRemove }: Props) => {
  const [diffOnly, setDiffOnly] = useState(false);
  useScrollLock();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const insights = useMemo(() => {
    if (paddles.length < 2) return null;
    const byAvg = [...paddles].sort((a, b) => avgRating(b) - avgRating(a))[0];
    const byValue = [...paddles].sort((a, b) => avgRating(b) / b.priceTWD - avgRating(a) / a.priceTWD)[0];
    const byPrice = [...paddles].sort((a, b) => a.priceTWD - b.priceTWD)[0];
    return { byAvg, byValue, byPrice };
  }, [paddles]);

  /** 一列規格；diffOnly 時所有值相同的列自動隱藏 */
  const SpecRow = ({ label, values, alwaysShow = false }: { label: string; values: string[]; alwaysShow?: boolean }) => {
    const allSame = values.every(v => v === values[0]);
    if (diffOnly && allSame && !alwaysShow) return null;
    return (
      <tr className="border-b border-neutral-100 last:border-0">
        <th className="sticky left-0 z-10 bg-white text-left text-xs font-bold text-neutral-400 py-3.5 pr-3 pl-5 min-w-[92px] max-w-[92px] align-top">
          {label}
        </th>
        {values.map((v, i) => (
          <td
            key={i}
            className={`py-3.5 px-4 text-sm min-w-[168px] align-top leading-relaxed ${
              allSame ? 'text-neutral-400' : 'text-neutral-900 font-semibold'
            }`}
          >
            {v}
          </td>
        ))}
      </tr>
    );
  };

  const RatingRow = ({ label, values }: { label: string; values: number[] }) => {
    const max = Math.max(...values);
    const allSame = values.every(v => v === values[0]);
    if (diffOnly && allSame) return null;
    return (
      <tr className="border-b border-neutral-100 last:border-0">
        <th className="sticky left-0 z-10 bg-white text-left text-xs font-bold text-neutral-400 py-3.5 pr-3 pl-5 align-middle">
          {label}
        </th>
        {values.map((v, i) => (
          <td key={i} className="py-3.5 px-4 min-w-[168px]">
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: v === max && !allSame ? SERIES_COLORS[i % SERIES_COLORS.length] : '#d4d4d4' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${v}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                />
              </div>
              <span className={`text-sm font-black w-8 text-right tabular-nums ${v === max && !allSame ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {v}
              </span>
            </div>
          </td>
        ))}
      </tr>
    );
  };

  const SectionRow = ({ title }: { title: string }) => (
    <tr>
      <td colSpan={paddles.length + 1} className="pt-7 pb-2">
        <div className="sticky left-0 max-w-full pl-5">
          <span className="text-[11px] font-black tracking-[0.18em] uppercase text-neutral-400">{title}</span>
        </div>
      </td>
    </tr>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] bg-neutral-950/50 backdrop-blur-sm flex items-end md:items-center justify-center md:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '8%', opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: '10%', opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', damping: 32, stiffness: 340 }}
        className="bg-white w-full max-w-6xl h-[94dvh] md:h-[90vh] rounded-t-[28px] md:rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 頂部：把手 + 標題 + 只看差異 + 關閉 */}
        <div className="shrink-0 border-b border-neutral-100">
          <div className="md:hidden pt-2.5 flex justify-center">
            <div className="w-10 h-1 rounded-full bg-neutral-200" />
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-lg font-black text-neutral-900">比較球拍</h2>
              <p className="text-[11px] text-neutral-400 hidden sm:block">灰色 = 規格相同 · 彩色分數 = 該項領先</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-semibold text-neutral-600">只看差異</span>
              <button
                role="switch"
                aria-checked={diffOnly}
                onClick={() => setDiffOnly(v => !v)}
                className={`relative w-11 rounded-full transition-colors duration-200 ${diffOnly ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                style={{ height: 26 }}
              >
                <motion.span
                  className="absolute top-0.5 left-0.5 w-[22px] h-[22px] rounded-full bg-white shadow"
                  animate={{ x: diffOnly ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </label>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-90 text-neutral-500 font-bold transition"
              aria-label="關閉比較"
            >✕</button>
          </div>
        </div>

        {/* 可捲動內容：data-lenis-prevent 讓 Lenis 不攔截、overscroll-contain 防止捲到背景 */}
        <div data-lenis-prevent className="flex-1 overflow-auto overscroll-contain">
          <table className="w-full border-collapse">
            {/* 商品欄：垂直捲動時固定頂端 */}
            <thead className="sticky top-0 z-30">
              <tr className="bg-white/95 backdrop-blur border-b border-neutral-100 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
                <th className="sticky left-0 z-40 bg-white/95 backdrop-blur min-w-[92px] max-w-[92px]" />
                {paddles.map((p, i) => (
                  <th key={p.slug} className="min-w-[168px] px-4 pt-3 pb-2.5 align-top">
                    <div
                      className="h-[3px] rounded-full mb-2.5 mx-auto w-12"
                      style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
                    />
                    <div className="flex items-center justify-center gap-2.5">
                      <PaddleVisual paddle={p} className="w-9 h-14 shrink-0" />
                      <div className="text-left min-w-0">
                        <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider truncate">{p.brand}</div>
                        <div className="text-[13px] font-black text-neutral-900 leading-tight line-clamp-2">{p.model}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-black text-emerald-600 whitespace-nowrap">NT$ {p.priceTWD.toLocaleString()}</span>
                          <button
                            onClick={() => onRemove(p.slug)}
                            className="text-[10px] text-neutral-300 hover:text-red-500 transition font-semibold"
                          >移除</button>
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 智慧洞察 */}
              {insights && (
                <tr>
                  <td colSpan={paddles.length + 1} className="px-5 pt-5">
                    <div className="sticky left-0 max-w-full flex flex-wrap gap-2">
                      <span className="text-xs font-bold bg-neutral-900 text-white px-3 py-1.5 rounded-full">
                        🏆 綜合最高 · {insights.byAvg.model}（{Math.round(avgRating(insights.byAvg))} 分）
                      </span>
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full">
                        💎 CP 指數最高 · {insights.byValue.model}
                      </span>
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                        💰 最低價 · {insights.byPrice.model}（NT$ {insights.byPrice.priceTWD.toLocaleString()}）
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {/* 性能雷達 */}
              <tr>
                <td colSpan={paddles.length + 1} className="pt-5 pb-1">
                  <div className="sticky left-0 px-5" style={{ maxWidth: 'min(100%, 92vw)' }}>
                    <div className="bg-gradient-to-b from-neutral-50 to-white rounded-2xl border border-neutral-100 p-4">
                      <PaddleRadar paddles={paddles} seriesColors={SERIES_COLORS} />
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                        {paddles.map((p, i) => (
                          <span key={p.slug} className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                            {p.model}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>

              <SectionRow title="性能評分" />
              <RatingRow label="力量" values={paddles.map(p => p.rating.power)} />
              <RatingRow label="控球" values={paddles.map(p => p.rating.control)} />
              <RatingRow label="旋轉" values={paddles.map(p => p.rating.spin)} />
              <RatingRow label="容錯" values={paddles.map(p => p.rating.forgiveness)} />
              <RatingRow label="綜合" values={paddles.map(p => Math.round(avgRating(p)))} />

              <SectionRow title="基本規格" />
              <SpecRow label="等級" values={paddles.map(p => p.level)} />
              <SpecRow label="形狀" values={paddles.map(p => p.shape)} />
              <SpecRow label="重量" values={paddles.map(p => p.weight)} />
              <SpecRow label="厚度" values={paddles.map(p => p.thickness)} />
              <SpecRow label="年份" values={paddles.map(p => String(p.year))} />

              <SectionRow title="材質工藝" />
              <SpecRow label="核心" values={paddles.map(p => p.core)} />
              <SpecRow label="面板" values={paddles.map(p => p.face)} />

              <SectionRow title="握把" />
              <SpecRow label="握把長" values={paddles.map(p => p.gripLength)} />
              <SpecRow label="握把粗" values={paddles.map(p => p.gripSize)} />

              <SectionRow title="適合與注意" />
              <SpecRow label="代言" values={paddles.map(p => p.endorser ?? '—')} />
              <SpecRow label="適合" values={paddles.map(p => p.bestFor)} alwaysShow />
              <SpecRow label="注意" values={paddles.map(p => p.cons ?? '—')} />
              <SpecRow label="USAP" values={paddles.map(p => (p.usapApproved ? '✓ 認證' : '未認證'))} />

              {/* 正版購買管道 */}
              <tr>
                <th className="sticky left-0 z-10 bg-white text-left text-xs font-bold text-neutral-400 py-3.5 pr-3 pl-5 align-top">
                  正版購買
                </th>
                {paddles.map(p => {
                  const channels = getPurchaseChannels(p.brand);
                  return (
                    <td key={p.slug} className="py-3.5 px-4 min-w-[168px] align-top">
                      {channels.length === 0 ? (
                        <span className="text-sm text-neutral-400">—</span>
                      ) : (
                        <div className="flex flex-col items-start gap-1.5">
                          {channels.slice(0, 2).map(c => (
                            <a
                              key={c.url}
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              title={c.note ?? c.label}
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-full border transition ${
                                c.type === 'tw-agent'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : c.type === 'tw-store'
                                    ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                              }`}
                            >
                              {CHANNEL_TYPE_META[c.type].icon} {c.label} <span className="opacity-50">↗</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* 底部留白 */}
              <tr><td colSpan={paddles.length + 1} className="pb-10" /></tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaddleCompareSheet;
