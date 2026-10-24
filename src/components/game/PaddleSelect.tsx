import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { PADDLES, SPECIALS, type PaddleSpec } from './engine/paddles';
import { PaddleModel } from './scene/PaddleModel';

const SHAPE_LABEL: Record<PaddleSpec['shape'], string> = {
  elongated: '長拍型',
  standard: '標準拍型',
  widebody: '寬拍型',
  hybrid: '混合拍型',
};

const cm = (m: number) => (m * 100).toFixed(1);

/** 3D 特寫：可以拖曳旋轉看拍面、包邊與握把 */
const Preview = ({ spec }: { spec: PaddleSpec }) => (
  <Canvas dpr={[1, 2]} camera={{ position: [0, 0.12, 0.98], fov: 34 }} gl={{ antialias: true, alpha: true }}>
    <ambientLight intensity={0.5} />
    <directionalLight position={[1, 2, 2]} intensity={2.2} />
    <directionalLight position={[-2, 1, -1]} intensity={1} color="#cfe0ff" />
    <pointLight position={[-0.4, 0.3, 0.4]} intensity={3} distance={2} color={spec.look.primary} />
    <pointLight position={[0.4, -0.2, -0.4]} intensity={2.5} distance={2} color={spec.look.accent} />
    <Suspense fallback={null}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group rotation={[0.15, -0.5, -0.2]} position={[0, -0.06, 0]}>
          <PaddleModel spec={spec} glow={0.08} />
        </group>
      </Float>
    </Suspense>
    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2.2} target={[0, 0.1, 0]} />
  </Canvas>
);

const Stat = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex items-center gap-3">
    <span className="w-10 shrink-0 text-xs font-semibold text-white/60">{label}</span>
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}aa, ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: `${value * 10}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
    <span className="w-7 text-right text-xs font-bold tabular-nums text-white">{value.toFixed(1)}</span>
  </div>
);

interface Props {
  value: string;
  specials: boolean;
  onChange: (id: string) => void;
  onBack: () => void;
  onStart: () => void;
}

export const PaddleSelect = ({ value, specials, onChange, onBack, onStart }: Props) => {
  const spec = PADDLES.find((p) => p.id === value) ?? PADDLES[0];
  const sp = SPECIALS[spec.special];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 overflow-y-auto overscroll-contain bg-gradient-to-br from-slate-950/95 via-slate-950/90 to-slate-900/95 p-4 md:p-6"
    >
      <div className="mx-auto flex min-h-full max-w-4xl flex-col">
        <div className="text-center">
          <span className="text-[11px] font-bold tracking-[0.3em] text-emerald-300">CHOOSE YOUR WEAPON</span>
          <h2 className="mt-1 font-display text-2xl font-black text-white md:text-4xl">選擇你的球拍</h2>
          <p className="mt-1 text-xs text-white/60 md:text-sm">拍型、厚度與拍面材質決定力量、控球與旋轉，每支還有專屬必殺技</p>
        </div>

        <div className="mt-4 grid flex-1 gap-4 md:grid-cols-[1fr_1.1fr]">
          <div
            className="relative h-56 overflow-hidden rounded-3xl border border-white/10 md:h-auto md:min-h-[320px]"
            style={{ background: `radial-gradient(circle at 50% 45%, ${spec.look.primary}55, transparent 65%), #070a12` }}
          >
            <Preview spec={spec} />
            <div className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[10px] text-white/40">拖曳可旋轉</div>
          </div>

          <motion.div key={spec.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-black text-white">{spec.name}</span>
                <span className="text-sm font-semibold text-white/50">{spec.model}</span>
              </div>
              <p className="mt-0.5 text-sm text-white/70">{spec.tagline}</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
              <Stat label="力量" value={spec.rating.power} color="#f97316" />
              <Stat label="控球" value={spec.rating.control} color="#34d399" />
              <Stat label="旋轉" value={spec.rating.spin} color="#60a5fa" />
              <Stat label="觸及" value={spec.rating.reach} color="#c084fc" />
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                ['拍型', SHAPE_LABEL[spec.shape]],
                ['尺寸', `${cm(spec.length)}×${cm(spec.width)} cm`],
                ['厚度', `${spec.thickness} mm`],
                ['重量', `${spec.weightOz} oz`],
                ['拍面', spec.face],
                ['芯材', spec.core],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/5 px-2 py-1.5">
                  <dt className="text-[10px] text-white/45">{k}</dt>
                  <dd className="text-xs font-semibold text-white">{v}</dd>
                </div>
              ))}
            </dl>
            <div
              className={`rounded-2xl border p-3 ${specials ? '' : 'opacity-50'}`}
              style={{ borderColor: `${sp.color}88`, background: `linear-gradient(135deg, ${sp.color}33, transparent)` }}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold tracking-widest" style={{ color: sp.glow }}>
                  必殺技 · {sp.title}
                </span>
              </div>
              <div className="mt-0.5 font-display text-2xl font-black italic text-white" style={{ textShadow: `0 0 16px ${sp.color}` }}>
                {sp.name}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-white/75">{specials ? sp.desc : '寫實模式不會發動必殺技，球拍數值仍然有效。'}</p>
              {specials && (
                <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                  <span className="mr-1.5 font-bold" style={{ color: sp.glow }}>
                    破解法
                  </span>
                  {sp.counter}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
          {PADDLES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={`rounded-2xl border p-2 text-center transition-all ${
                p.id === spec.id ? 'border-white/70 bg-white/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
              style={p.id === spec.id ? { boxShadow: `0 0 20px ${p.look.primary}88` } : undefined}
            >
              <div
                className="mx-auto h-10 w-6 rounded-t-full rounded-b-md"
                style={{ background: `linear-gradient(160deg, ${p.look.primary}, ${p.look.base} 70%)` }}
              />
              <div className="mt-1 text-sm font-bold text-white">{p.name}</div>
              <div className="truncate text-[10px]" style={{ color: SPECIALS[p.special].glow }}>
                {SPECIALS[p.special].name}
              </div>
            </button>
          ))}
        </div>

        <div className="sticky -bottom-4 z-10 -mx-4 mt-6 grid grid-cols-[auto_1fr] gap-2 border-t border-white/10 bg-slate-950/90 px-4 pb-4 pt-3 backdrop-blur-md before:pointer-events-none before:absolute before:inset-x-0 before:-top-8 before:h-8 before:bg-gradient-to-t before:from-slate-950/90 before:to-transparent">
          <button type="button" onClick={onBack} className="rounded-2xl bg-white/10 px-5 py-3.5 font-bold text-white hover:bg-white/15">
            ← 返回
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="rounded-2xl py-3.5 text-lg font-black text-white shadow-xl"
            style={{ background: `linear-gradient(90deg, ${spec.look.primary}, ${sp.color})`, boxShadow: `0 10px 30px ${sp.color}55` }}
          >
            帶上「{spec.name}」上場
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
