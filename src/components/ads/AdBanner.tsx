import { useEffect, useRef } from 'react';

interface AdBannerProps {
  /** 廣告位置ID，用於Google AdSense等廣告平台 */
  adSlot?: string;
  /** 廣告格式: 'horizontal' | 'vertical' | 'square' */
  format?: 'horizontal' | 'vertical' | 'square';
  /** 是否為測試模式（顯示佔位符） */
  testMode?: boolean;
  /** 自定義class名稱 */
  className?: string;
}

/**
 * 廣告橫幅組件
 * 支援 Google AdSense 集成
 *
 * 使用方式：
 * 1. 在 index.html 中添加 AdSense script
 * 2. 設置 adSlot 為您的廣告單元ID
 * 3. 在開發時使用 testMode={true} 來顯示佔位符
 */
const AdBanner = ({
  adSlot,
  format = 'horizontal',
  testMode = false, // 預設為生產模式
  className = '',
}: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!testMode && adSlot && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [testMode, adSlot]);

  const getAdStyles = () => {
    switch (format) {
      case 'horizontal':
        return 'w-full h-24 md:h-32';
      case 'vertical':
        return 'w-full md:w-64 h-96';
      case 'square':
        return 'w-64 h-64';
      default:
        return 'w-full h-24';
    }
  };

  if (testMode) {
    return (
      <div
        className={`${getAdStyles()} bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 ${className}`}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📢</div>
          <p className="text-sm font-semibold text-gray-600">廣告位置</p>
          <p className="text-xs text-gray-500 mt-1">
            {format === 'horizontal' && '橫幅廣告'}
            {format === 'vertical' && '側邊廣告'}
            {format === 'square' && '方形廣告'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`${getAdStyles()} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7062108661079564"
        data-ad-slot={adSlot}
        data-ad-format={format === 'horizontal' ? 'horizontal' : 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
};

// 類型擴展，讓 TypeScript 認識 window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default AdBanner;
