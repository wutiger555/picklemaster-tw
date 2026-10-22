import { type MutableRefObject, useRef, useState } from 'react';
import type { ShotButton } from './engine/shots';
import type { TouchInput } from './useGameInput';

const BUTTONS: { id: ShotButton; label: string; sub: string; className: string }[] = [
  { id: 'lob', label: '挑', sub: '高吊', className: 'from-sky-400 to-blue-600 shadow-blue-900/40' },
  { id: 'drive', label: '抽', sub: '抽／殺', className: 'from-orange-400 to-red-500 shadow-red-900/40' },
  { id: 'soft', label: '軟', sub: 'Dink', className: 'from-emerald-400 to-teal-600 shadow-teal-900/40' },
];

const RADIUS = 56;

interface SpecialButton {
  ready: boolean;
  armed: boolean;
  color: string;
  name: string;
}

/** 手機操作：左手虛擬搖桿移動（擊球瞬間的方向 = 瞄準），右手三顆擊球鍵＋必殺鍵 */
export const TouchControls = ({ touch, special }: { touch: MutableRefObject<TouchInput>; special: SpecialButton | null }) => {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState<ShotButton | null>(null);
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);

  const moveTo = (cx: number, cy: number) => {
    const o = origin.current;
    if (!o) return;
    let dx = cx - o.x;
    let dy = cy - o.y;
    const d = Math.hypot(dx, dy);
    if (d > RADIUS) {
      dx = (dx / d) * RADIUS;
      dy = (dy / d) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    // 小幅死區，避免手指輕微晃動就移動
    const nx = Math.abs(dx) < 8 ? 0 : dx / RADIUS;
    const ny = Math.abs(dy) < 8 ? 0 : -dy / RADIUS;
    touch.current.moveX = nx;
    touch.current.moveY = ny;
  };

  const release = () => {
    origin.current = null;
    setKnob({ x: 0, y: 0 });
    touch.current.moveX = 0;
    touch.current.moveY = 0;
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-4 pb-[max(1rem,env(safe-area-inset-bottom))] select-none">
      <div
        className="pointer-events-auto relative h-36 w-36 touch-none rounded-full border border-white/25 bg-white/10 backdrop-blur-sm"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          const r = e.currentTarget.getBoundingClientRect();
          origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2, id: e.pointerId };
          moveTo(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => origin.current?.id === e.pointerId && moveTo(e.clientX, e.clientY)}
        onPointerUp={release}
        onPointerCancel={release}
        aria-label="移動搖桿"
      >
        <div
          className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full bg-white/80 shadow-lg"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {special && (
          <button
            type="button"
            disabled={!special.ready || special.armed}
            onPointerDown={() => {
              touch.current.special = true;
            }}
            className={`touch-none rounded-full px-4 py-2 text-sm font-black text-white transition-all ${
              special.ready ? 'animate-pulse' : 'opacity-40'
            }`}
            style={{
              background: special.ready ? `linear-gradient(90deg, ${special.color}, #ffffff33)` : 'rgba(15,23,42,0.6)',
              boxShadow: special.ready ? `0 0 22px ${special.color}` : undefined,
            }}
          >
            {special.armed ? '蓄勢中！' : `必殺・${special.name}`}
          </button>
        )}
      <div className="grid grid-cols-2 gap-3">
        {BUTTONS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            className={`touch-none flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg transition-transform ${b.className} ${
              active === b.id ? 'scale-90 ring-4 ring-white/60' : ''
            } ${i === 0 ? 'col-span-2 justify-self-center' : ''}`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              touch.current.held = b.id;
              setActive(b.id);
            }}
            onPointerUp={() => {
              if (touch.current.held === b.id) touch.current.held = null;
              setActive(null);
            }}
            onPointerCancel={() => {
              if (touch.current.held === b.id) touch.current.held = null;
              setActive(null);
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <span className="text-2xl font-black leading-none">{b.label}</span>
            <span className="mt-0.5 text-[10px] font-semibold opacity-90">{b.sub}</span>
          </button>
        ))}
      </div>
      </div>
    </div>
  );
};
