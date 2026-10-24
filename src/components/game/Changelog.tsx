import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { readSeen, SEEN_KEY, VERSIONS } from './changelogData';

/** 選單最下方：「v1.4 更新了什麼」，有沒看過的新版本時亮小紅點 */
export const Changelog = ({ alwaysOpen = false }: { alwaysOpen?: boolean }) => {
  const latest = VERSIONS[0].v;
  const [open, setOpen] = useState(alwaysOpen);
  const [seen, setSeen] = useState(readSeen);
  const toggle = () => {
    setOpen(!open);
    if (seen !== latest) {
      setSeen(latest);
      try {
        localStorage.setItem(SEEN_KEY, latest);
      } catch {
        /* 存不了只影響紅點 */
      }
    }
  };
  // 直接攤開的版本（選單裡的「更新」面板）：打開就算看過
  useEffect(() => {
    if (!alwaysOpen) return;
    setSeen(latest);
    try {
      localStorage.setItem(SEEN_KEY, latest);
    } catch {
      /* 存不了只影響紅點 */
    }
  }, [alwaysOpen, latest]);
  return (
    <div className={alwaysOpen ? '' : 'mt-4 border-t border-white/10 pt-3'}>
      {!alwaysOpen && (
      <button type="button" onClick={toggle} className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-white/55 hover:text-white">
        {seen !== latest && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
        v{latest} 更新了什麼
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
      </button>
      )}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 space-y-4 text-left">
              {VERSIONS.map((r, i) => (
                <div key={r.v}>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm font-black ${i === 0 ? 'text-emerald-300' : 'text-white/80'}`}>v{r.v}</span>
                    <span className="text-[11px] text-white/40">{r.date}</span>
                    {i === 0 && <span className="rounded bg-emerald-400/15 px-1.5 text-[10px] font-bold text-emerald-300">最新</span>}
                  </div>
                  <ul className="mt-1 space-y-0.5 text-xs leading-relaxed text-white/65">
                    {r.items.map((t) => (
                      <li key={t} className="flex gap-1.5">
                        <span className="text-white/30">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
