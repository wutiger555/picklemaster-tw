import { Link } from 'react-router-dom';
import SEOHead from '../../components/common/SEOHead';

const DIMENSIONS = [
  { label: '球場總長', value: '44 ft / 13.41 m', note: '含雙邊底線' },
  { label: '球場總寬', value: '20 ft / 6.10 m', note: '同雙打羽毛球場寬' },
  { label: '網高（中線）', value: '34 in / 0.864 m', note: '網中央較低' },
  { label: '網高（兩端）', value: '36 in / 0.914 m', note: '網柱較高' },
  { label: '廚房區深度（非截擊區）', value: '7 ft / 2.13 m', note: '兩側各 7 英尺' },
  { label: '發球區長度', value: '15 ft / 4.57 m', note: '廚房線到底線' },
  { label: '左右發球區寬度', value: '各 10 ft / 3.05 m', note: '由中線分半' },
  { label: '球場四周安全區', value: '10 ft / 3.05 m', note: '建議空間，含底線外' },
  { label: '線條寬度', value: '2 in / 5 cm', note: '標準白色或對比色' },
];

const CourtLinesGuide = () => {
  return (
    <>
      <SEOHead page="tool-court-lines" />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        <section className="pt-16 pb-8 md:pt-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-emerald-600 mb-6">← 返回工具</Link>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
              Tool · Court Lines Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-3 tracking-tight">
              匹克球場地劃線指南
            </h1>
            <p className="text-neutral-600 text-base md:text-lg max-w-2xl">
              完整標準尺寸、劃線步驟、羽球場改造說明。社區想新增匹克球場？這頁一次給你所有資料。
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-4xl pb-20">
          {/* Visual diagram */}
          <section className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-5">標準場地示意圖</h2>
            <div className="bg-emerald-50 rounded-xl p-6 md:p-8">
              <svg viewBox="0 0 440 200" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                {/* Outer court */}
                <rect x="20" y="20" width="400" height="160" fill="none" stroke="#1e3a8a" strokeWidth="2" />
                {/* NVZ lines */}
                <line x1="156" y1="20" x2="156" y2="180" stroke="#dc2626" strokeWidth="2" strokeDasharray="0" />
                <line x1="284" y1="20" x2="284" y2="180" stroke="#dc2626" strokeWidth="2" strokeDasharray="0" />
                {/* Center line (service boxes) */}
                <line x1="20" y1="100" x2="156" y2="100" stroke="#1e3a8a" strokeWidth="1.5" />
                <line x1="284" y1="100" x2="420" y2="100" stroke="#1e3a8a" strokeWidth="1.5" />
                {/* Net */}
                <line x1="220" y1="20" x2="220" y2="180" stroke="#111" strokeWidth="3" strokeDasharray="4,3" />

                {/* Labels */}
                <text x="220" y="14" textAnchor="middle" fontSize="10" fill="#111" fontWeight="bold">NET</text>
                <text x="88" y="110" textAnchor="middle" fontSize="8" fill="#1e3a8a">左發球區</text>
                <text x="88" y="60" textAnchor="middle" fontSize="8" fill="#1e3a8a">右發球區</text>
                <text x="352" y="110" textAnchor="middle" fontSize="8" fill="#1e3a8a">左發球區</text>
                <text x="352" y="60" textAnchor="middle" fontSize="8" fill="#1e3a8a">右發球區</text>
                <text x="188" y="105" textAnchor="middle" fontSize="8" fill="#dc2626">廚房</text>
                <text x="252" y="105" textAnchor="middle" fontSize="8" fill="#dc2626">廚房</text>

                {/* Dimensions */}
                <text x="220" y="195" textAnchor="middle" fontSize="9" fill="#555">44 ft / 13.41 m</text>
                <text x="10" y="100" textAnchor="middle" fontSize="9" fill="#555" transform="rotate(-90 10 100)">20 ft / 6.10 m</text>
              </svg>
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#1e3a8a]" /> 場地外框線</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#dc2626]" /> 廚房區線</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-black border-dashed" /> 球網</span>
              </div>
            </div>
          </section>

          {/* Dimensions table */}
          <section className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-5">標準尺寸規格</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-200">
                    <th className="py-2 pr-4">項目</th>
                    <th className="py-2 pr-4">尺寸</th>
                    <th className="py-2">備註</th>
                  </tr>
                </thead>
                <tbody>
                  {DIMENSIONS.map((d, i) => (
                    <tr key={i} className="border-b border-neutral-100 last:border-0">
                      <td className="py-3 pr-4 font-semibold text-neutral-900">{d.label}</td>
                      <td className="py-3 pr-4 text-emerald-700 font-bold font-mono">{d.value}</td>
                      <td className="py-3 text-neutral-500">{d.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Badminton → Pickleball */}
          <section className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6 md:p-8 mb-6 border border-emerald-100">
            <h2 className="text-xl font-bold text-neutral-900 mb-3">羽球場改匹克球場：超簡單方案</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              <strong>雙打羽球場（44×20 英尺）與匹克球標準場地完全相同尺寸！</strong>
              現有羽球場只要：
            </p>
            <ol className="space-y-3 text-sm md:text-base">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center">1</span>
                <span className="text-neutral-700">保留外框線不變</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center">2</span>
                <span className="text-neutral-700">在兩側各距球網 <strong>7 英尺（2.13m）</strong>處新增一條平行於網的線（廚房區）</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center">3</span>
                <span className="text-neutral-700">在兩側從底線到廚房線間畫一條中線，分出左右發球區</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center">4</span>
                <span className="text-neutral-700">調整球網中央高度至 <strong>34 英寸（86.4cm）</strong>，網柱高度 36 英寸</span>
              </li>
            </ol>
            <p className="text-xs text-neutral-500 mt-4">✅ 這就是全台許多免費戶外匹克球場的做法（青年公園、華中河濱等）。預算有限的社區可用膠帶貼線先試打。</p>
          </section>

          {/* Material recommendations */}
          <section className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">場地材質建議</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: '壓克力面層', desc: '國際賽事標準，球速與彈跳最佳', cost: '高' },
                { name: 'PU 彈性地墊', desc: '對膝蓋友善，適合長時間打球', cost: '中高' },
                { name: '水泥 / 柏油', desc: '最經濟，戶外公園常見', cost: '低' },
                { name: '木地板', desc: '室內館常見，球速較快', cost: '中' },
                { name: '塑膠拼接地墊', desc: '快閃場或改造球館適用', cost: '中' },
                { name: 'Sport Court', desc: '職業級專用塑膠地板', cost: '高' },
              ].map(m => (
                <div key={m.name} className="bg-neutral-50 rounded-xl p-4">
                  <div className="font-bold text-neutral-900 mb-1">{m.name}</div>
                  <div className="text-xs text-neutral-600 mb-2">{m.desc}</div>
                  <div className="text-xs text-emerald-600 font-semibold">成本：{m.cost}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-neutral-500 bg-amber-50 border border-amber-200 rounded-xl p-4">
            ⚠️ 以上尺寸依據 USA Pickleball 官方規則書 (2026)。如需舉辦 CTPF 認證賽事，請以
            <a href="https://www.ctpf.org.tw/" target="_blank" rel="noopener" className="underline mx-1 font-semibold">CTPF 官網公告</a>
            規範為準。
          </div>
        </div>
      </div>
    </>
  );
};

export default CourtLinesGuide;
