import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PADDLE_DATABASE, getPaddleBySlug, getPurchaseChannels, getAffiliateOffers,
  CHANNEL_TYPE_META, getArchetype, ARCHETYPE_INFO, getThicknessClass, getWeightClass,
  getFaceNote, getCoreNote, getSwingWeightBand, thicknessMm,
  type Paddle,
} from '../data/paddleDatabase';
import PaddleVisual from '../components/equipment/PaddleVisual';
import PaddleRadar from '../components/equipment/PaddleRadar';
import SEOHead from '../components/common/SEOHead';

const RATING_META: { key: keyof Paddle['rating']; label: string; color: string; what: string }[] = [
  { key: 'power', label: '力量', color: '#f97316', what: '同樣揮速下的出球速度。高力量代表殺球與底線抽球更具威脅。' },
  { key: 'control', label: '控球', color: '#10b981', what: '落點的可預測性與觸球停留感。高控球在網前小球纏鬥時優勢明顯。' },
  { key: 'spin', label: '旋轉', color: '#8b5cf6', what: '面板抓球能力。高旋轉能把球拉出弧線與角度，發球與第三拍下切更有效。' },
  { key: 'forgiveness', label: '容錯', color: '#0ea5e9', what: '非甜蜜點擊球時的表現落差。高容錯代表打歪了球還是過得去，新手期特別重要。' },
];

const avgRating = (p: Paddle) =>
  (p.rating.power + p.rating.control + p.rating.spin + p.rating.forgiveness) / 4;

/** 一列規格 */
const SpecRow = ({ label, value, note }: { label: string; value: string; note?: string }) => (
  <div className="py-3 border-b border-neutral-100 last:border-0">
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs font-bold text-neutral-400 shrink-0">{label}</span>
      <span className="text-sm font-bold text-neutral-900 text-right">{value}</span>
    </div>
    {note && <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{note}</p>}
  </div>
);

const PaddleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const paddle = slug ? getPaddleBySlug(slug) : undefined;

  // 相似球拍：同拍型定位、厚度接近、排除自己
  const similar = useMemo(() => {
    if (!paddle) return [];
    const arch = getArchetype(paddle);
    const mm = thicknessMm(paddle);
    return PADDLE_DATABASE
      .filter(p => p.slug !== paddle.slug && getArchetype(p) === arch)
      .sort((a, b) => Math.abs(thicknessMm(a) - mm) - Math.abs(thicknessMm(b) - mm))
      .slice(0, 3);
  }, [paddle]);

  if (!paddle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl">🏓</div>
        <h1 className="text-xl font-black text-neutral-900">找不到這支球拍</h1>
        <Link to="/paddles" className="text-emerald-600 font-bold hover:underline">← 回到球拍資料庫</Link>
      </div>
    );
  }

  const arch = getArchetype(paddle);
  const info = ARCHETYPE_INFO[arch];
  const thick = getThicknessClass(paddle);
  const wt = getWeightClass(paddle);
  const sw = getSwingWeightBand(paddle);
  const channels = getPurchaseChannels(paddle.brand);
  const offers = getAffiliateOffers(paddle);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/40 to-white">
      <SEOHead page="paddle-database" />

      <div className="container mx-auto px-4 max-w-6xl pt-20 md:pt-24 pb-24">
        {/* 麵包屑 */}
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-bold text-neutral-400 hover:text-emerald-600 transition mb-5"
        >
          ← 回球拍資料庫
        </button>

        {/* ===== 頂部：圖 + 名稱 + 定位 ===== */}
        <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-10">
          <div
            className="rounded-3xl p-6 flex items-center justify-center"
            style={{ background: `linear-gradient(160deg, ${paddle.colors.face}1a, ${paddle.colors.face}06 70%)` }}
          >
            <PaddleVisual paddle={paddle} className="w-full max-w-[210px] h-auto max-h-[330px] drop-shadow-xl" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{paddle.brand}</span>
              {paddle.origin && (
                <span className="text-[11px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                  {paddle.origin}品牌
                </span>
              )}
              <span className="text-[11px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-full">{paddle.year}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-neutral-900 leading-tight mb-3">{paddle.model}</h1>

            {paddle.endorser && (
              <p className="text-sm text-emerald-600 font-semibold mb-3">⭐ {paddle.endorser}</p>
            )}

            {/* 拍型定位 */}
            <div className="rounded-2xl border p-4 mb-4" style={{ borderColor: `${info.color}44`, backgroundColor: `${info.color}0d` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black tracking-widest uppercase text-neutral-400">拍型定位</span>
                <span className="text-sm font-black px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: info.color }}>
                  {arch}
                </span>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">{info.desc}</p>
              <p className="text-xs text-neutral-500 leading-relaxed mt-1.5">{info.play}</p>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
              <span className="text-3xl font-black text-emerald-600">NT$ {paddle.priceTWD.toLocaleString()}</span>
              {paddle.priceUSD && <span className="text-sm text-neutral-400">約 US${paddle.priceUSD}</span>}
              <span className="text-xs text-neutral-400">台灣行情參考價</span>
            </div>

            {/* 購買 */}
            {(channels.length > 0 || offers.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {channels.map(c => (
                  <a
                    key={c.url} href={c.url} target="_blank" rel="noopener noreferrer nofollow" title={c.note ?? c.label}
                    className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl border transition ${
                      c.type === 'tw-official' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : c.type === 'tw-store' ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100'}`}
                  >{CHANNEL_TYPE_META[c.type].icon} {c.label} ↗</a>
                ))}
                {offers.map(o => (
                  <a
                    key={o.url} href={o.url} target="_blank" rel="noopener noreferrer sponsored"
                    title={`${o.shop}${o.parallelImport ? '（水貨／平行輸入，無原廠保固）' : ''}`}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 transition"
                  >🛍️ {o.shop}{o.parallelImport && <span className="text-[9px] opacity-70">水貨</span>} ↗</a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== 系統化評比 ===== */}
        <section className="mb-10">
          <h2 className="text-lg font-black text-neutral-900 mb-1">系統化評比</h2>
          <p className="text-xs text-neutral-400 mb-4">
            四項評分為本站依公開規格、廠商資料與國外評測綜合判讀的相對值（滿分 100），用於同資料庫內互相比較，非實驗室量測數據。
          </p>

          <div className="grid md:grid-cols-[300px_1fr] gap-6 bg-white rounded-3xl border border-neutral-100 p-5">
            <div className="flex flex-col items-center justify-center">
              <PaddleRadar paddles={[paddle]} seriesColors={[info.color]} />
              <div className="mt-2 text-center">
                <div className="text-3xl font-black text-neutral-900">{Math.round(avgRating(paddle))}</div>
                <div className="text-[11px] text-neutral-400 font-semibold">綜合評分</div>
              </div>
            </div>

            <div className="space-y-3.5">
              {RATING_META.map(({ key, label, color, what }) => (
                <div key={key}>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-sm font-black text-neutral-800 w-8">{label}</span>
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full" style={{ backgroundColor: color }}
                        initial={{ width: 0 }} animate={{ width: `${paddle.rating[key]}%` }}
                        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                      />
                    </div>
                    <span className="text-sm font-black text-neutral-900 w-8 text-right tabular-nums">{paddle.rating[key]}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed pl-10">{what}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 規格與判讀 ===== */}
        <section className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-3xl border border-neutral-100 p-5">
            <h2 className="text-lg font-black text-neutral-900 mb-3">規格與判讀</h2>
            <SpecRow label="核心厚度" value={paddle.thickness} note={`${thick.label}｜${thick.note}`} />
            <SpecRow label="靜態重量" value={paddle.weight} note={`${wt.label}｜${wt.note}`} />
            <SpecRow label="揮重" value={sw.label} note={sw.note} />
            <SpecRow label="拍面材質" value={paddle.face} note={getFaceNote(paddle)} />
            <SpecRow label="核心材質" value={paddle.core} note={getCoreNote(paddle)} />
            <SpecRow
              label="拍形"
              value={paddle.shape}
              note={
                paddle.shape.includes('長型') ? '觸球範圍遠、適合單手反拍與伸展救球，但甜蜜點較窄'
                : paddle.shape.includes('寬型') ? '甜蜜點最大、容錯最好，代價是觸球距離較短'
                : '長型與寬型的折衷，兼顧觸球範圍與甜蜜點'
              }
            />
            <SpecRow label="握把長度" value={paddle.gripLength} note={parseFloat(paddle.gripLength) >= 5.5 ? '5.5" 以上適合雙手反拍' : '標準長度，單手反拍為主的球員足夠'} />
            <SpecRow label="握把粗細" value={paddle.gripSize} note={parseFloat(paddle.gripSize) <= 4.125 ? '偏細，適合手掌較小者；也可自行加纏帶加粗' : '標準粗細'} />
            <SpecRow label="USAP 認證" value={paddle.usapApproved ? '✓ 通過' : '未認證'} note={paddle.usapApproved ? '可用於 USAP 認證賽事。2026 年起 PBCoR 上限收緊為 .43' : undefined} />
          </div>

          <div className="space-y-6">
            {/* 實測數據 */}
            {paddle.lab && (paddle.lab.swingWeight || paddle.lab.twistWeight || paddle.lab.spinRPM || paddle.lab.pbcor) && (
              <div className="bg-white rounded-3xl border border-neutral-100 p-5">
                <h2 className="text-lg font-black text-neutral-900 mb-1">實測數據</h2>
                <p className="text-[11px] text-neutral-400 mb-3">{paddle.lab.source ?? '公開實測資料'}</p>
                <div className="grid grid-cols-2 gap-3">
                  {paddle.lab.swingWeight && (
                    <div className="bg-neutral-50 rounded-2xl p-3">
                      <div className="text-2xl font-black text-neutral-900">{paddle.lab.swingWeight}</div>
                      <div className="text-[11px] font-bold text-neutral-500">揮重 Swing Weight</div>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">新手 105-115、中階 112-118、進階 115-122</p>
                    </div>
                  )}
                  {paddle.lab.twistWeight && (
                    <div className="bg-neutral-50 rounded-2xl p-3">
                      <div className="text-2xl font-black text-neutral-900">{paddle.lab.twistWeight}</div>
                      <div className="text-[11px] font-bold text-neutral-500">扭轉慣量 Twist Weight</div>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">大於 6.5 屬高容錯</p>
                    </div>
                  )}
                  {paddle.lab.spinRPM && (
                    <div className="bg-neutral-50 rounded-2xl p-3">
                      <div className="text-2xl font-black text-neutral-900">{paddle.lab.spinRPM}</div>
                      <div className="text-[11px] font-bold text-neutral-500">旋轉 RPM</div>
                    </div>
                  )}
                  {paddle.lab.pbcor && (
                    <div className="bg-neutral-50 rounded-2xl p-3">
                      <div className="text-2xl font-black text-neutral-900">{paddle.lab.pbcor}</div>
                      <div className="text-[11px] font-bold text-neutral-500">PBCoR 彈性係數</div>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">USAP 2026 上限 .43</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 特殊之處 */}
            {paddle.specialty && (
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-3xl p-5">
                <h2 className="text-lg font-black mb-2">這支拍的特別之處</h2>
                <p className="text-sm leading-relaxed text-neutral-200">{paddle.specialty}</p>
              </div>
            )}

            {/* 亮點與注意 */}
            <div className="bg-white rounded-3xl border border-neutral-100 p-5">
              <h2 className="text-lg font-black text-neutral-900 mb-3">重點整理</h2>
              <ul className="space-y-1.5 mb-3">
                {paddle.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-700"><span className="text-emerald-500 shrink-0">✓</span>{h}</li>
                ))}
              </ul>
              <div className="text-sm text-neutral-600 mb-2"><strong className="text-neutral-800">適合：</strong>{paddle.bestFor}</div>
              {paddle.cons && (
                <div className="text-sm text-amber-800 bg-amber-50 rounded-xl px-3 py-2">⚠️ {paddle.cons}</div>
              )}
            </div>
          </div>
        </section>

        {/* ===== 相似球拍 ===== */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-neutral-900 mb-1">同為「{arch}」的其他選擇</h2>
            <p className="text-xs text-neutral-400 mb-4">依拍型定位相同、核心厚度接近排序</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {similar.map(p => (
                <Link
                  key={p.slug} to={`/paddles/${p.slug}`}
                  className="bg-white rounded-2xl border border-neutral-100 p-4 hover:shadow-lg hover:border-neutral-200 transition flex gap-3"
                >
                  <PaddleVisual paddle={p} className="w-12 h-20 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase truncate">{p.brand}</div>
                    <div className="text-sm font-black text-neutral-900 leading-tight line-clamp-2">{p.model}</div>
                    <div className="text-xs text-neutral-500 mt-1">{p.thickness} · {p.weight}</div>
                    <div className="text-sm font-black text-emerald-600 mt-1">NT$ {p.priceTWD.toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="text-[11px] text-neutral-400 leading-relaxed mt-10 bg-neutral-50 border border-neutral-100 rounded-2xl p-4">
          <strong className="text-neutral-600">評比方法說明：</strong>
          力量／控球／旋轉／容錯四項為本站依公開規格、原廠技術資料與國外評測綜合判讀的<strong className="text-neutral-600">相對分數</strong>，
          用於本資料庫內互相比較，並非實驗室量測值。標示「實測」者才是第三方公開量測數據。
          厚度、重量、材質判讀為依規格推導的通則，個人手感仍有差異，建議可行時試打再決定。
        </p>
      </div>
    </div>
  );
};

export default PaddleDetailPage;
