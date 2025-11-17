/**
 * LazyImage 組件
 * 實現圖片懶加載，提升頁面載入效能
 */

import React, { useState, useEffect } from 'react';
import { useInView } from '../../hooks/useInView';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * 圖片 URL
   */
  src: string;

  /**
   * 替代文字
   */
  alt: string;

  /**
   * 佔位圖（可選）
   */
  placeholder?: string;

  /**
   * 載入時顯示的內容（可選）
   */
  loader?: React.ReactNode;

  /**
   * 圖片容器的類名
   */
  containerClassName?: string;

  /**
   * 是否使用淡入動畫
   * @default true
   */
  fadeIn?: boolean;

  /**
   * 載入失敗時的回調
   */
  onError?: () => void;

  /**
   * 載入成功時的回調
   */
  onLoad?: () => void;
}

/**
 * 懶加載圖片組件
 *
 * @example
 * ```tsx
 * <LazyImage
 *   src="/images/hero.jpg"
 *   alt="Hero Image"
 *   className="w-full h-auto"
 *   placeholder="/images/placeholder.jpg"
 * />
 * ```
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  loader,
  containerClassName = '',
  fadeIn = true,
  onError,
  onLoad,
  className = '',
  ...props
}) => {
  const { ref, inView } = useInView({ threshold: 0.1, once: true });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder || '');

  useEffect(() => {
    // 當元素進入視窗時才開始載入圖片
    if (inView && src && !isLoaded && !hasError) {
      const img = new Image();

      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };

      img.onerror = () => {
        setHasError(true);
        onError?.();
      };

      img.src = src;
    }
  }, [inView, src, isLoaded, hasError, onLoad, onError]);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`relative overflow-hidden ${containerClassName}`}>
      {/* 載入中狀態 */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          {loader || (
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* 圖片 */}
      {!hasError && (
        <img
          src={imageSrc}
          alt={alt}
          className={className}
          style={{
            opacity: fadeIn && !isLoaded ? 0 : 1,
            transition: fadeIn ? 'opacity 0.3s' : undefined,
          }}
          {...props}
        />
      )}

      {/* 載入失敗狀態 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-500">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">圖片載入失敗</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
