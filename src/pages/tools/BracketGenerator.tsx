import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/common/SEOHead';

type Format = 'single' | 'double' | 'round-robin';

const nextPowerOf2 = (n: number) => {
  let p = 1;
  while (p < n) p *= 2;
  return p;
};

interface BracketMatch {
  round: number;
  matchIndex: number;
  p1: string;
  p2: string;
}

function generateSingleElim(names: string[]): BracketMatch[][] {
  const size = nextPowerOf2(names.length);
  const filled = [...names];
  while (filled.length < size) filled.push('BYE');

  const rounds: BracketMatch[][] = [];
  const firstRound: BracketMatch[] = [];
  for (let i = 0; i < size; i += 2) {
    firstRound.push({ round: 1, matchIndex: i / 2, p1: filled[i], p2: filled[i + 1] });
  }
  rounds.push(firstRound);

  let currentSize = size / 2;
  let roundNum = 2;
  while (currentSize >= 1) {
    const matches: BracketMatch[] = [];
    for (let i = 0; i < currentSize; i++) {
      matches.push({ round: roundNum, matchIndex: i, p1: '—', p2: '—' });
    }
    rounds.push(matches);
    currentSize /= 2;
    roundNum++;
  }
  return rounds;
}

function generateRoundRobin(names: string[]): { round: number; matches: { p1: string; p2: string }[] }[] {
  const players = [...names];
  if (players.length % 2 !== 0) players.push('BYE');
  const n = players.length;
  const totalRounds = n - 1;
  const rounds: { round: number; matches: { p1: string; p2: string }[] }[] = [];

  const arr = [...players];
  for (let r = 0; r < totalRounds; r++) {
    const matches: { p1: string; p2: string }[] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a !== 'BYE' && b !== 'BYE') matches.push({ p1: a, p2: b });
    }
    rounds.push({ round: r + 1, matches });
    // Rotate: 第一位固定，其他往右輪轉
    const fixed = arr[0];
    const rotated = [arr[n - 1], ...arr.slice(1, n - 1)];
    arr.splice(0, arr.length, fixed, ...rotated);
  }
  return rounds;
}

const BracketGenerator = () => {
  const [format, setFormat] = useState<Format>('single');
  const [playerInput, setPlayerInput] = useState(
    '林俊傑\n周杰倫\n張學友\n蔡依林\n五月天\n伍佰\n張惠妹\n鄧紫棋'
  );

  const players = useMemo(
    () => playerInput.split('\n').map(s => s.trim()).filter(Boolean),
    [playerInput]
  );

  const singleElim = useMemo(() => format === 'single' ? generateSingleElim(players) : [], [players, format]);
  const roundRobin = useMemo(() => format === 'round-robin' ? generateRoundRobin(players) : [], [players, format]);

  const handlePrint = () => window.print();

  return (
    <>
      <SEOHead page="tool-bracket" />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        <section className="pt-16 pb-8 md:pt-24 print:hidden">
          <div className="container mx-auto px-4 max-w-5xl">
            <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-emerald-600 mb-6">← 返回工具</Link>
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
              Tool · Bracket Generator
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-3 tracking-tight">
              比賽籤表產生器
            </h1>
            <p className="text-neutral-600 text-base md:text-lg max-w-2xl">
              自動生成單淘汰、循環賽籤表，支援列印。辦球友聚會、社區小型賽事的必備工具。
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-5xl pb-20">
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6 print:hidden">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-2">賽制</label>
                <div className="flex gap-2">
                  {([{ k: 'single', l: '單淘汰' }, { k: 'round-robin', l: '循環賽' }] as const).map(opt => (
                    <button
                      key={opt.k}
                      onClick={() => setFormat(opt.k as Format)}
                      className={`flex-1 px-4 py-2 rounded-xl font-semibold text-sm ${
                        format === opt.k ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handlePrint}
                  className="mt-4 w-full bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-emerald-600"
                >
                  🖨️ 列印籤表
                </button>
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700 block mb-2">參賽者名單（每行一位）</label>
                <textarea
                  value={playerInput}
                  onChange={e => setPlayerInput(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-emerald-400 outline-none font-mono text-sm"
                />
                <div className="text-xs text-neutral-500 mt-1">共 {players.length} 位</div>
              </div>
            </div>
          </div>

          {/* Single Elimination Display */}
          {format === 'single' && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-5 md:p-8 overflow-x-auto">
              <h2 className="text-xl font-bold text-neutral-900 mb-5">單淘汰籤表 · {players.length} 位</h2>
              <div className="flex gap-6 min-w-max pb-4">
                {singleElim.map((round, ri) => (
                  <div key={ri} className="flex flex-col justify-around gap-3 min-w-[180px]">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      {ri === singleElim.length - 1 ? '冠軍' : ri === singleElim.length - 2 ? '決賽' : ri === singleElim.length - 3 ? '準決賽' : `第 ${ri + 1} 輪`}
                    </div>
                    {round.map((m, mi) => (
                      <div key={mi} className="bg-gradient-to-r from-emerald-50 to-transparent rounded-xl p-3 border border-emerald-100">
                        <div className={`text-sm font-semibold ${m.p1 === 'BYE' ? 'text-neutral-400' : 'text-neutral-900'}`}>{m.p1}</div>
                        <div className="h-px bg-neutral-200 my-1" />
                        <div className={`text-sm font-semibold ${m.p2 === 'BYE' ? 'text-neutral-400' : 'text-neutral-900'}`}>{m.p2}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Round Robin Display */}
          {format === 'round-robin' && (
            <div className="space-y-4">
              {roundRobin.map(r => (
                <div key={r.round} className="bg-white rounded-2xl border border-neutral-100 p-5 print:break-inside-avoid">
                  <h2 className="text-lg font-bold text-neutral-900 mb-3">第 {r.round} 輪</h2>
                  <div className="grid md:grid-cols-2 gap-2">
                    {r.matches.map((m, mi) => (
                      <div key={mi} className="bg-neutral-50 rounded-xl p-3 flex items-center justify-center gap-3">
                        <div className="font-semibold text-neutral-900">{m.p1}</div>
                        <div className="text-neutral-400 font-bold">VS</div>
                        <div className="font-semibold text-neutral-900">{m.p2}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="text-sm text-neutral-500 bg-blue-50 border border-blue-200 rounded-xl p-4">
                循環賽共 {roundRobin.length} 輪、總場次 {roundRobin.reduce((s, r) => s + r.matches.length, 0)} 場。每人對戰每個對手各一次。
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BracketGenerator;
