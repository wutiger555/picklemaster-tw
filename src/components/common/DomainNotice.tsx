import { useEffect, useState } from 'react';

// 網址由 picklemastertw.site 改為 picklemastertw.com。
// 舊網域的 301 轉址只到 2026-11-16（網域到期日），之後舊連結會失效，
// 所以在這之前提醒把書籤與分享出去的連結換成新網址。過期後此通知自動不再顯示。
const UNTIL = new Date('2026-11-17T00:00:00+08:00');
const KEY = 'pmtw-domain-notice-dismissed';

const DomainNotice = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (Date.now() >= UNTIL.getTime()) return;
    try {
      if (localStorage.getItem(KEY) === '1') return;
    } catch {
      // 私密瀏覽等情況讀不到 storage，照樣顯示
    }
    setShow(true);
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      // 寫不進去就算了，下次再提醒一次無妨
    }
  };

  if (!show) return null;

  return (
    <div className="bg-neutral-900 text-white text-sm">
      <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
        <p className="flex-1 leading-relaxed">
          <span className="font-bold">網址已更新為 picklemastertw.com</span>
          <span className="text-neutral-300 hidden sm:inline">
            {' '}— 舊網址 picklemastertw.site 的自動轉址將於 2026/11/16 停止，請更新書籤與分享出去的連結。
          </span>
          <span className="text-neutral-300 sm:hidden">
            {' '}— 舊網址 11/16 停止轉址
          </span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="關閉網址更新通知"
          className="shrink-0 px-2.5 py-1 rounded-md text-neutral-300 hover:text-white hover:bg-white/10 transition-colors font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default DomainNotice;
