import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** 版本說明：新版本加在最前面 */
const VERSIONS: { v: string; date: string; items: string[] }[] = [
  {
    v: '1.4',
    date: '2026-10-24',
    items: [
      '失分重播「看清落點」：落地瞬間定格、鏡頭拉近落點，標出出界幾公分與下一球怎麼改',
      '手機版畫面減法：提示改在分與分之間出現，打球時不再擋球場',
      '音效變安靜：拿掉喊聲與觀眾聲，留清脆擊球聲＋小聲背景音樂',
    ],
  },
  {
    v: '1.3',
    date: '2026-10-24',
    items: [
      '冒險模式「全台踢館之旅」第一站：海邊・颱風天',
      '精彩球自動慢動作重播，可存成影片分享到 Threads',
      '新手教學：1 分鐘學會擊球、殺球、撲救、必殺、絕招',
      '新球拍「疾風」「鎮岳」與專屬必殺',
      '角色絕招改成持續效果：關燈、嗆聲、淹水、分身、全民應援',
      '更多真實匹克球細節：分腿墊步、Erne、第三拍放小球、Reset、發球擦網照打',
    ],
  },
  {
    v: '1.2',
    date: '2026-10-23',
    items: [
      '飛身撲接：跑不到的球撲過去救',
      '連擊數、無雙覺醒、得分慶祝',
      '戰績分享卡與挑戰連結',
      '沉浸式全螢幕、手機版重新排版',
    ],
  },
  {
    v: '1.1',
    date: '2026-10-23',
    items: ['真人選手模型與自動揮拍', '新場地：新生公園白天戶外場', '電視輔助判決：壓線球可以申請挑戰', '正式命名「匹克硬邦幫」'],
  },
  {
    v: '1.0',
    date: '2026-10-22',
    items: ['全新 3D 真實物理匹克球，夜間體育館', '熱血必殺技、擊球導引與打擊回饋', '照片選手與選角畫面'],
  },
];

const SEEN_KEY = 'pm-game-changelog-seen';
const readSeen = () => {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
};

/** 選單最下方：「v1.4 更新了什麼」，有沒看過的新版本時亮小紅點 */
export const Changelog = () => {
  const latest = VERSIONS[0].v;
  const [open, setOpen] = useState(false);
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
  return (
    <div className="mt-4 border-t border-white/10 pt-3">
      <button type="button" onClick={toggle} className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-white/55 hover:text-white">
        {seen !== latest && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
        v{latest} 更新了什麼
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
      </button>
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
