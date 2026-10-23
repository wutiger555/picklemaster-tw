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
  /** 能量 0–100；沒給就只看 ready */
  energy?: number;
}

/** 圓形招式鍵：外圈是能量環，集滿發光；手機上取代左上角的能量條，省畫面 */
const MoveButton = ({ b, label, onPress }: { b: SpecialButton; label: string; onPress: () => void }) => {
  const pct = b.ready ? 100 : Math.min(99, Math.floor(b.energy ?? 0));
  return (
    <button
      type="button"
      disabled={!b.ready || b.armed}
      onPointerDown={onPress}
      aria-label={`${label}・${b.name}`}
      className={`touch-none relative grid h-16 w-16 place-items-center rounded-full p-[3px] transition-transform ${b.ready && !b.armed ? 'animate-pulse' : ''} ${
        b.armed ? 'scale-110' : ''
      }`}
      style={{
        background: `conic-gradient(${b.color} ${pct}%, rgba(255,255,255,0.14) 0)`,
        boxShadow: b.ready ? `0 0 ${b.armed ? 28 : 18}px ${b.color}` : undefined,
      }}
    >
      <span
        className="flex h-full w-full flex-col items-center justify-center rounded-full text-white"
        style={{ background: b.ready ? `radial-gradient(circle at 50% 35%, ${b.color}, #0f172ae6 75%)` : 'rgba(15,23,42,0.85)' }}
      >
        <span className={`text-sm font-black leading-none ${b.ready ? '' : 'opacity-60'}`}>{label}</span>
        <span className="mt-0.5 text-[9px] font-bold leading-none opacity-80">
          {b.armed ? '就緒！' : b.ready ? '按我' : b.energy !== undefined ? `${pct}%` : '充能中'}
        </span>
      </span>
    </button>
  );
};

/** 手機操作：左手虛擬搖桿移動（擊球瞬間的方向 = 瞄準），右手三顆擊球鍵＋必殺鍵＋絕招鍵 */
export const TouchControls = ({
  touch,
  special,
  skill,
}: {
  touch: MutableRefObject<TouchInput>;
  special: SpecialButton | null;
  skill: SpecialButton | null;
}) => {
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
        {(special || skill) && (
          <div className="flex gap-3">
            {skill && <MoveButton b={skill} label="絕招" onPress={() => void (touch.current.skill = true)} />}
            {special && <MoveButton b={special} label="必殺" onPress={() => void (touch.current.special = true)} />}
          </div>
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
