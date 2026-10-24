/**
 * Google Analytics 4：沒填 GA_ID 或在開發環境時完全不載入、不送任何東西。
 * gtag.js 等瀏覽器閒下來才載入，不拖慢首屏；載入前送的事件先排在 dataLayer 裡。
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** GA4 評估 ID（G- 開頭）；空字串＝不追蹤 */
export const GA_ID = 'G-7P0QSNE2H3';

type Gtag = (...args: unknown[]) => void;
const w = window as unknown as { dataLayer?: unknown[]; gtag?: Gtag };
const enabled = () => !!GA_ID && !import.meta.env.DEV && typeof window !== 'undefined';

let started = false;
const start = () => {
  if (started || !enabled()) return;
  started = true;
  w.dataLayer = w.dataLayer ?? [];
  // gtag 的官方寫法：把 arguments 物件推進 dataLayer
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag('js', new Date());
  // SPA：自己送 page_view（換頁時），關掉自動的那一次避免重複
  w.gtag('config', GA_ID, { send_page_view: false });
  const load = () => {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
  };
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
  if (idle) idle(load);
  else window.setTimeout(load, 1500);
};

/** 送一個事件（名稱用 snake_case，GA 後台「事件」報表看得到） */
export const track = (name: string, params: Record<string, string | number | boolean> = {}) => {
  if (!enabled()) return;
  start();
  w.gtag?.('event', name, params);
};

/** 每次換頁送 page_view */
export const usePageViews = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // 等頁面把標題換好再送（SEOHead 在 render 後才改標題）
    const t = window.setTimeout(() => track('page_view', { page_path: pathname, page_location: window.location.href, page_title: document.title }), 400);
    return () => clearTimeout(t);
  }, [pathname]);
};

/** 放在 Router 裡面的空元件 */
export const PageViewTracker = () => {
  usePageViews();
  return null;
};
