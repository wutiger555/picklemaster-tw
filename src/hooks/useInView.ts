/**
 * useInView Hook
 * 使用 Intersection Observer API 檢測元素是否在視窗中
 * 用於實現滾動觸發動畫和 lazy loading
 */

import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions extends IntersectionObserverInit {
  /**
   * 只觸發一次（元素首次進入視窗）
   * @default true
   */
  once?: boolean;

  /**
   * 進入視窗時的回調
   */
  onEnter?: () => void;

  /**
   * 離開視窗時的回調
   */
  onLeave?: () => void;
}

/**
 * Hook 返回值
 */
interface UseInViewReturn<T extends HTMLElement = HTMLElement> {
  /**
   * 要觀察的元素 ref
   */
  ref: React.RefObject<T>;

  /**
   * 元素是否在視窗中
   */
  inView: boolean;

  /**
   * Intersection Observer Entry
   */
  entry?: IntersectionObserverEntry;
}

/**
 * 檢測元素是否在視窗中
 *
 * @example
 * ```tsx
 * const { ref, inView } = useInView({ threshold: 0.5, once: true });
 *
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial={{ opacity: 0 }}
 *     animate={inView ? { opacity: 1 } : { opacity: 0 }}
 *   >
 *     內容
 *   </motion.div>
 * );
 * ```
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  options: UseInViewOptions = {}
): UseInViewReturn<T> {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    once = true,
    onEnter,
    onLeave,
  } = options;

  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 如果已經觸發過且設定只觸發一次，則不再觀察
    if (once && inView) return;

    // 創建 Intersection Observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);

        const isIntersecting = entry.isIntersecting;
        setInView(isIntersecting);

        // 觸發回調
        if (isIntersecting) {
          onEnter?.();
          // 如果設定只觸發一次，則停止觀察
          if (once) {
            observerRef.current?.unobserve(element);
          }
        } else {
          onLeave?.();
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observerRef.current.observe(element);

    return () => {
      const observer = observerRef.current;
      if (observer && element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, root, rootMargin, once, onEnter, onLeave, inView]);

  return { ref: ref as React.RefObject<T>, inView, entry };
}

/**
 * 預設配置的 useInView 變體
 */

/**
 * 元素進入視窗 10% 時觸發（只觸發一次）
 */
export function useInViewOnce<T extends HTMLElement = HTMLElement>(options?: Partial<UseInViewOptions>) {
  return useInView<T>({ threshold: 0.1, once: true, ...options });
}

/**
 * 元素完全進入視窗時觸發
 */
export function useInViewFull<T extends HTMLElement = HTMLElement>() {
  return useInView<T>({ threshold: 1, once: true });
}

/**
 * 元素進入視窗 50% 時觸發
 */
export function useInViewHalf<T extends HTMLElement = HTMLElement>() {
  return useInView<T>({ threshold: 0.5, once: true });
}

/**
 * 可重複觸發的 useInView（進入和離開都會觸發）
 */
export function useInViewRepeat<T extends HTMLElement = HTMLElement>(
  threshold = 0.1
) {
  return useInView<T>({ threshold, once: false });
}

export default useInView;
