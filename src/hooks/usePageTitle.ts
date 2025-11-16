import { useEffect } from 'react';

const BASE_TITLE = '匹克大師台灣 | Picklemaster Taiwan';

export const usePageTitle = (pageTitle?: string) => {
  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} - ${BASE_TITLE}`;
    } else {
      document.title = `${BASE_TITLE} - 台灣匹克球玩家社群與資源平台`;
    }
  }, [pageTitle]);
};
