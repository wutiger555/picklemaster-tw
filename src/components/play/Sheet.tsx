import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';

// 底部面板：沿用 CourtQuickSheet 的 framer-motion 拖曳關閉做法（vaul 已停止維護）
export function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-neutral-900/40 backdrop-blur-[2px]"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) onClose();
            }}
            data-lenis-prevent
            className="fixed inset-x-0 bottom-0 z-[75] mx-auto max-h-[88vh] max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3 shadow-[0_-8px_40px_rgba(0,0,0,0.15)]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-200" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export interface ToastMsg {
  title: string;
  sub?: string;
  action?: { label: string; onClick: () => void };
}

export function Toast({ msg, onDone }: { msg: ToastMsg | null; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3600);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  return (
    <div className="pointer-events-none fixed inset-x-3 top-[calc(env(safe-area-inset-top)+96px)] z-[80] mx-auto max-w-md" aria-live="polite">
      <AnimatePresence>
        {msg && (
          <motion.div
            role="status"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-neutral-900 px-4 py-3 text-white shadow-2xl"
          >
            <div className="flex-1 text-sm">
              <b className="block text-[15px]">{msg.title}</b>
              {msg.sub && <span className="text-neutral-300">{msg.sub}</span>}
            </div>
            {msg.action && (
              <button type="button" onClick={msg.action.onClick} className="whitespace-nowrap text-sm font-black text-lime-300">
                {msg.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
