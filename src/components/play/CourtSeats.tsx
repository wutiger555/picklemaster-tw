import { motion, useReducedMotion } from 'framer-motion';
import PaddleAvatar from './PaddleAvatar';
import type { PlayerPublic } from '../../utils/playApi';

// 場上座位圖：每面場畫成迷你球場（廚房區＋球網），4 個座位；超過的人坐「輪替休息」板凳
function Seat({ p, closed }: { p?: PlayerPublic; closed?: boolean }) {
  const reduce = useReducedMotion();
  if (closed) return <span className="h-2 w-2 rounded-full bg-white/30" aria-label="這個位子不開放" />;
  if (!p) {
    return <span className="w-9 h-9 rounded-full border-2 border-dashed border-white/60 text-white/85 font-black grid place-items-center" aria-label="空位">+</span>;
  }
  return (
    <motion.span
      layout
      initial={p.isMe && !reduce ? { scale: 0.3, y: 16 } : false}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className="relative grid place-items-center"
    >
      <PaddleAvatar name={p.nickname} seed={p.avatarSeed} size={28} title={p.isMe ? '你' : p.nickname} />
      <span className={`absolute -bottom-3 left-1/2 -translate-x-1/2 max-w-[64px] truncate rounded-md px-1.5 text-[10px] font-bold text-white ${p.isMe ? 'bg-orange-500' : 'bg-neutral-900/60'}`}>
        {p.isMe ? '你' : p.nickname}
      </span>
    </motion.span>
  );
}

export default function CourtSeats({ players, courts, capacity }: { players: PlayerPublic[]; courts: number; capacity: number }) {
  const onCourt = courts * 4;
  const benchSize = Math.max(capacity - onCourt, 0);
  return (
    <div>
      <div className={`grid gap-2.5 ${courts === 1 ? 'grid-cols-1 max-w-[200px]' : 'grid-cols-2'}`}>
        {Array.from({ length: courts }, (_, k) => (
          <div key={k} className="relative aspect-[1/1.3] rounded-xl bg-[#2e9e6b] p-2" aria-label={`第 ${k + 1} 面場`}>
            <div className="absolute inset-2 rounded-[3px] border-2 border-white bg-[#2f6fd6]">
              <div className="absolute inset-x-0 top-[34%] bottom-[34%] border-y-[1.5px] border-white bg-[#4f8ae8]" />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-[3px] border-white" />
            </div>
            <span className="absolute left-3 top-2.5 z-10 font-mono text-[10px] font-bold text-white/85">COURT {k + 1}</span>
            <div className="absolute inset-2 z-10 grid grid-cols-2 grid-rows-2 place-items-center">
              {[0, 1, 2, 3].map((s) => <Seat key={s} p={players[k * 4 + s]} closed={k * 4 + s >= capacity} />)}
            </div>
          </div>
        ))}
      </div>
      {benchSize > 0 && (
        <div className="mt-3 flex min-h-[62px] items-center gap-2 rounded-xl bg-neutral-100 px-2.5 py-2">
          <span className="border-r border-neutral-200 pr-1.5 text-[11px] tracking-[.2em] text-neutral-500 [writing-mode:vertical-rl]">輪替休息</span>
          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: benchSize }, (_, b) => {
              const p = players[onCourt + b];
              return p ? (
                <span key={b} className="relative grid w-10 place-items-center pb-2">
                  <PaddleAvatar name={p.nickname} seed={p.avatarSeed} size={26} title={p.isMe ? '你' : p.nickname} />
                  <span className={`absolute -bottom-1 max-w-[60px] truncate rounded-md px-1.5 text-[10px] font-bold text-white ${p.isMe ? 'bg-orange-500' : 'bg-neutral-800'}`}>{p.isMe ? '你' : p.nickname}</span>
                </span>
              ) : (
                <span key={b} className="grid h-9 w-9 place-items-center rounded-full border-2 border-dashed border-neutral-300 font-black text-neutral-400" aria-label="空位">+</span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 候補球拍架：排拍文化上畫面，額滿後的人掛上架子，有人取消就往前遞補
export function PaddleRack({ players }: { players: PlayerPublic[] }) {
  if (!players.length) {
    return <p className="text-sm text-neutral-500">球拍架上還沒有人。額滿後報名的人會掛在這裡，有人取消就自動遞補。</p>;
  }
  return (
    <div className="relative flex items-end gap-3 overflow-x-auto px-2 pb-4 pt-1">
      <div className="absolute inset-x-1 bottom-2 h-1.5 rounded-full bg-gradient-to-b from-neutral-400 to-neutral-700 opacity-60" aria-hidden />
      {players.map((p, i) => (
        <div key={`${p.nickname}-${i}`} className="relative z-10 grid flex-none justify-items-center">
          <PaddleAvatar name={p.nickname} seed={p.avatarSeed} size={26} title={p.nickname} />
          <small className={`font-mono text-[10px] font-extrabold ${p.isMe ? 'text-orange-600' : 'text-neutral-500'}`}>#{i + 1}{p.isMe ? ' 你' : ''}</small>
        </div>
      ))}
    </div>
  );
}
