import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/common/SEOHead';

// DUPR 簡化演算法（近似）
// 實際 DUPR 使用複雜的動態貝葉斯更新，但核心原理為「Elo-like」機制：
// - 贏較高評分對手 → 分數增加較多
// - 輸給較低評分對手 → 分數下降較多
// - 分數差距（score differential）也會影響
// 此處採用簡化 Elo 公式以供球友學習與預估
const K_FACTOR = 0.16; // 新手高 K、老手低 K 簡化
const SCORE_DIFF_MULTIPLIER = 0.01;

interface MatchResult {
  myScore: number;
  oppScore: number;
  won: boolean;
  ratingDelta: number;
}

const DuprSimulator = () => {
  const [myRating, setMyRating] = useState(3.5);
  const [oppRating, setOppRating] = useState(3.8);
  const [myScore, setMyScore] = useState(11);
  const [oppScore, setOppScore] = useState(7);

  const result: MatchResult = useMemo(() => {
    const won = myScore > oppScore;
    // Elo expected win probability
    const expected = 1 / (1 + Math.pow(10, (oppRating - myRating) / 1.0));
    const actual = won ? 1 : 0;
    // 基礎變動
    let delta = K_FACTOR * (actual - expected);
    // 比分差距影響
    const scoreDiff = Math.abs(myScore - oppScore);
    delta *= 1 + scoreDiff * SCORE_DIFF_MULTIPLIER;
    return {
      myScore,
      oppScore,
      won,
      ratingDelta: Math.round(delta * 1000) / 1000,
    };
  }, [myRating, oppRating, myScore, oppScore]);

  const newRating = Math.round((myRating + result.ratingDelta) * 1000) / 1000;

  return (
    <>
      <SEOHead page="tool-dupr" />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        <section className="pt-16 pb-8 md:pt-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-emerald-600 mb-6">
              ← 返回工具
            </Link>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
              Tool · DUPR Simulator
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-3 tracking-tight">
              DUPR 評分模擬器
            </h1>
            <p className="text-neutral-600 text-base md:text-lg max-w-2xl">
              輸入你和對手的 DUPR 評分與比賽結果，預估下一場對你評分的影響。幫助你規劃挑戰對手、評估風險。
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-4xl pb-20">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Inputs */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 space-y-5">
              <h2 className="text-xl font-bold text-neutral-900">比賽設定</h2>

              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-2 block">
                  你的 DUPR: <span className="text-emerald-600 font-black">{myRating.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.01"
                  value={myRating}
                  onChange={e => setMyRating(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-2 block">
                  對手 DUPR: <span className="text-blue-600 font-black">{oppRating.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.01"
                  value={oppRating}
                  onChange={e => setOppRating(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">你的得分</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={myScore}
                    onChange={e => setMyScore(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none font-bold text-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">對手得分</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={oppScore}
                    onChange={e => setOppScore(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none font-bold text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 md:p-8">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3">模擬結果</div>
              <div className={`text-2xl font-bold mb-6 ${result.won ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.won ? '✓ 你贏了' : '✗ 你輸了'} · {result.myScore} : {result.oppScore}
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-xs text-neutral-400 mb-1">目前 DUPR</div>
                  <div className="text-3xl font-black">{myRating.toFixed(2)}</div>
                </div>

                <div className="text-center">
                  <div className={`text-4xl font-black ${result.ratingDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.ratingDelta > 0 ? '+' : ''}{result.ratingDelta.toFixed(3)}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">預估變動</div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <div className="text-xs text-emerald-300 mb-1">預估新 DUPR</div>
                  <div className="text-3xl font-black text-emerald-400">{newRating.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
            <div className="font-bold mb-1">⚠️ 使用說明</div>
            此模擬器採用簡化版 Elo 演算法，實際 DUPR 使用複雜的動態貝葉斯模型，會納入更多歷史比賽、雙方搭檔、時間衰減等因素。結果僅供參考，請以
            <a href="https://mydupr.com/" target="_blank" rel="noopener" className="underline font-semibold mx-1">DUPR 官方</a>
            實際計算為準。
          </div>
        </div>
      </div>
    </>
  );
};

export default DuprSimulator;
