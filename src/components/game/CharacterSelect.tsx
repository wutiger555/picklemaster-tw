import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { GameEngine } from './engine/game';
import { AthleteModel } from './scene/AthleteModel';
import { lookFromCharacter } from './scene/characterData';
import { CHARACTERS, type CharacterDef } from './characters';

/** 去背半身像的四角與底部淡出：藏掉轉正後的斜邊與去背邊緣的小瑕疵 */
const FADE = {
  WebkitMaskImage: 'radial-gradient(ellipse 72% 78% at 50% 38%, #000 58%, transparent 100%)',
  maskImage: 'radial-gradient(ellipse 72% 78% at 50% 38%, #000 58%, transparent 100%)',
} as const;

/** 沒有照片的預設選手：用球衣色塊＋號碼代替 */
const Placeholder = ({ c, big }: { c: CharacterDef; big?: boolean }) => (
  <div className="flex h-full w-full items-end justify-center">
    <div
      className={`flex items-center justify-center rounded-t-[45%] font-display font-black text-white/90 ${big ? 'h-[70%] w-[62%] text-7xl' : 'h-[68%] w-[64%] text-3xl'}`}
      style={{ background: `linear-gradient(180deg, ${c.shirt}, ${c.shirt}cc)` }}
    >
      {c.number}
    </div>
  </div>
);

const Portrait = ({ c, big }: { c: CharacterDef; big?: boolean }) =>
  c.portrait ? (
    <img src={c.portrait} alt={c.name} className="h-full w-full object-contain object-bottom" style={FADE} draggable={false} />
  ) : (
    <Placeholder c={c} big={big} />
  );

/**
 * 3D 半身預覽：把選中角色的臉與配色套在真正的比賽模型上，可拖曳旋轉。
 * 用一個不推進的引擎當資料來源，選手就停在準備姿勢。
 */
const Preview3D = ({ c }: { c: CharacterDef }) => {
  const engine = useMemo(() => new GameEngine({ mode: 'match', difficulty: 'rookie', assist: false, specials: false }), []);
  const look = useMemo(() => lookFromCharacter(c), [c]);
  const p = engine.human.pos;
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [p.x + 0.2, 1.62, p.z - 1.05], fov: 30 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[p.x + 1, 3, p.z - 3]} intensity={2.4} />
      <directionalLight position={[p.x - 2, 2, p.z + 1]} intensity={1} color="#9ad8ff" />
      <Suspense fallback={null}>
        <AthleteModel key={c.id} engine={engine} index={0} look={look} trackTip={false} />
      </Suspense>
      <OrbitControls target={[p.x, 1.45, p.z]} enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.2} minPolarAngle={1.1} maxPolarAngle={1.9} />
    </Canvas>
  );
};

interface Props {
  value: string;
  onChange: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const CharacterSelect = ({ value, onChange, onBack, onNext }: Props) => {
  const sel = CHARACTERS.find((c) => c.id === value) ?? CHARACTERS[0];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 overflow-y-auto bg-gradient-to-br from-slate-950/95 via-slate-950/90 to-slate-900/95 p-4 md:p-6"
    >
      <div className="mx-auto flex min-h-full max-w-4xl flex-col">
        <div className="text-center">
          <span className="text-[11px] font-bold tracking-[0.3em] text-emerald-300">CHOOSE YOUR PLAYER</span>
          <h2 className="mt-1 font-display text-2xl font-black text-white md:text-4xl">選擇你的選手</h2>
          <p className="mt-1 text-xs text-white/60 md:text-sm">選好之後，臉和配色會套用到球場上的 3D 選手；對手會從其他人裡隨機登場</p>
        </div>

        <div className="mt-4 grid flex-1 gap-4 md:grid-cols-[0.9fr_1.1fr]">
          {/* 選中的選手大圖 */}
          <motion.div
            key={sel.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-64 overflow-hidden rounded-3xl border border-white/10 md:h-auto md:min-h-[340px]"
            style={{ background: `radial-gradient(circle at 50% 35%, ${sel.shirt}66, transparent 70%), #070a12` }}
          >
            <div className="absolute inset-x-0 bottom-0 top-6">
              <Portrait c={sel} big />
            </div>
            <div className="absolute right-3 top-3 h-36 w-28 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/60 backdrop-blur md:h-44 md:w-32">
              <Preview3D c={sel} />
              <div className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-[10px] text-white/50">3D 選手</div>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent px-5 pb-4 pt-12">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-black text-white">{sel.name}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold tabular-nums text-white/80">#{sel.number}</span>
              </div>
              <div className="text-sm font-semibold text-emerald-300">{sel.title}</div>
            </div>
          </motion.div>

          {/* 選手卡 */}
          <div className="grid grid-cols-3 gap-2 content-start">
            {CHARACTERS.map((c) => {
              const on = c.id === sel.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onChange(c.id)}
                  className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                    on ? 'border-emerald-300/80 bg-white/10' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                  }`}
                  style={on ? { boxShadow: '0 0 22px rgba(52,211,153,0.45)' } : undefined}
                >
                  <div
                    className="relative h-28 md:h-32"
                    style={{ background: `radial-gradient(circle at 50% 40%, ${c.shirt}55, transparent 72%)` }}
                  >
                    <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
                      <Portrait c={c} />
                    </div>
                  </div>
                  <div className="px-2.5 pb-2 pt-1">
                    <div className="text-sm font-bold text-white">{c.name}</div>
                    <div className="truncate text-[11px] text-white/55">{c.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[auto_1fr] gap-2 pb-2">
          <button type="button" onClick={onBack} className="rounded-2xl bg-white/10 px-5 py-3.5 font-bold text-white hover:bg-white/15">
            ← 返回
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 py-3.5 text-lg font-black text-emerald-950 shadow-xl shadow-emerald-500/25"
          >
            就決定是「{sel.name}」 → 挑選球拍
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
