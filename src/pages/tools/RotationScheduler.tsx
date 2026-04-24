import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/common/SEOHead';

// Round-robin 雙打輪轉演算法
// 針對 N 人打雙打（每場 4 人），每人輪流作為搭檔與對手
function generateRotation(playerCount: number, rounds: number, courts: number): string[][][] {
  const players = Array.from({ length: playerCount }, (_, i) => `P${i + 1}`);
  const schedule: string[][][] = [];

  // 每人已配對過的對手集合 (避免重複)
  const partnered = new Set<string>();
  const opposed = new Map<string, number>();

  for (let r = 0; r < rounds; r++) {
    const roundMatches: string[][] = [];
    const used = new Set<string>();
    const available = [...players];
    // 洗牌（基於 round index 的確定性排列）
    for (let i = available.length - 1; i > 0; i--) {
      const j = (r * 7 + i * 3) % (i + 1);
      [available[i], available[j]] = [available[j], available[i]];
    }

    while (roundMatches.length < courts && available.length >= 4) {
      const p1 = available.shift()!;
      // 挑選還沒和 p1 配對過的夥伴
      let p2Index = available.findIndex(p => !partnered.has(`${p1}-${p}`) && !partnered.has(`${p}-${p1}`) && !used.has(p));
      if (p2Index === -1) p2Index = 0;
      const p2 = available.splice(p2Index, 1)[0];

      const p3 = available.shift()!;
      let p4Index = available.findIndex(p => !partnered.has(`${p3}-${p}`) && !partnered.has(`${p}-${p3}`) && !used.has(p));
      if (p4Index === -1) p4Index = 0;
      const p4 = available.splice(p4Index, 1)[0];

      partnered.add(`${p1}-${p2}`);
      partnered.add(`${p3}-${p4}`);
      opposed.set(`${p1}-${p3}`, (opposed.get(`${p1}-${p3}`) || 0) + 1);

      used.add(p1); used.add(p2); used.add(p3); used.add(p4);
      roundMatches.push([p1, p2, p3, p4]);
    }
    schedule.push(roundMatches);
  }
  return schedule;
}

const RotationScheduler = () => {
  const [playerCount, setPlayerCount] = useState(8);
  const [rounds, setRounds] = useState(6);
  const [courts, setCourts] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: 8 }, (_, i) => `球員 ${i + 1}`)
  );

  const schedule = useMemo(() => generateRotation(playerCount, rounds, courts), [playerCount, rounds, courts]);

  const updatePlayerCount = (n: number) => {
    setPlayerCount(n);
    setPlayerNames(Array.from({ length: n }, (_, i) => playerNames[i] || `球員 ${i + 1}`));
  };

  const playerLabel = (code: string) => {
    const idx = parseInt(code.replace('P', '')) - 1;
    return playerNames[idx] || code;
  };

  const handlePrint = () => window.print();

  return (
    <>
      <SEOHead page="tool-rotation" />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        <section className="pt-16 pb-8 md:pt-24 print:hidden">
          <div className="container mx-auto px-4 max-w-5xl">
            <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-emerald-600 mb-6">← 返回工具</Link>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
              Tool · Rotation Scheduler
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-3 tracking-tight">
              雙打輪轉排程器
            </h1>
            <p className="text-neutral-600 text-base md:text-lg max-w-2xl">
              5-16 人球友約球再也不用自己排！輸入人數、場數、場地數，自動產生避免重複配對的輪轉表，可列印帶去球場。
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-5xl pb-20">
          {/* Config */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-2">球員人數</label>
                <input
                  type="number"
                  min={4} max={16}
                  value={playerCount}
                  onChange={e => updatePlayerCount(Math.max(4, Math.min(16, parseInt(e.target.value) || 8)))}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-2">總場次（回合）</label>
                <input
                  type="number"
                  min={1} max={20}
                  value={rounds}
                  onChange={e => setRounds(Math.max(1, Math.min(20, parseInt(e.target.value) || 6)))}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-2">同時可用場地</label>
                <input
                  type="number"
                  min={1} max={8}
                  value={courts}
                  onChange={e => setCourts(Math.max(1, Math.min(8, parseInt(e.target.value) || 2)))}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none font-bold"
                />
              </div>
            </div>

            {/* Player names */}
            <details>
              <summary className="text-sm font-semibold text-neutral-700 cursor-pointer hover:text-emerald-600">自訂球員名字 →</summary>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                {playerNames.map((name, i) => (
                  <input
                    key={i}
                    type="text"
                    value={name}
                    onChange={e => {
                      const newNames = [...playerNames];
                      newNames[i] = e.target.value;
                      setPlayerNames(newNames);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:border-emerald-400 outline-none"
                    placeholder={`球員 ${i + 1}`}
                  />
                ))}
              </div>
            </details>

            <button
              onClick={handlePrint}
              className="mt-4 bg-neutral-900 text-white font-bold px-5 py-2 rounded-xl hover:bg-neutral-800"
            >
              🖨️ 列印輪轉表
            </button>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            {schedule.map((round, ri) => (
              <div key={ri} className="bg-white rounded-2xl border border-neutral-100 p-5 md:p-6 print:break-inside-avoid">
                <h2 className="text-lg font-bold text-neutral-900 mb-3">第 {ri + 1} 回合</h2>
                {round.length === 0 ? (
                  <div className="text-sm text-neutral-500">人數不足，無法排場</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {round.map((match, mi) => (
                      <div key={mi} className="bg-gradient-to-r from-emerald-50/50 to-blue-50/50 rounded-xl p-4">
                        <div className="text-xs text-neutral-500 font-semibold mb-2">場 {mi + 1}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-right flex-1">
                            <div className="font-bold text-emerald-700">{playerLabel(match[0])}</div>
                            <div className="text-sm text-neutral-500">&</div>
                            <div className="font-bold text-emerald-700">{playerLabel(match[1])}</div>
                          </div>
                          <div className="px-3 text-xl font-black text-neutral-300">VS</div>
                          <div className="text-left flex-1">
                            <div className="font-bold text-blue-700">{playerLabel(match[2])}</div>
                            <div className="text-sm text-neutral-500">&</div>
                            <div className="font-bold text-blue-700">{playerLabel(match[3])}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RotationScheduler;
