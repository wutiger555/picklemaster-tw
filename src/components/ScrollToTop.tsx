import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop 組件
 * 當路由變更時，自動捲動到頁面頂部
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 每次路由變更時，捲動到頂部
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
