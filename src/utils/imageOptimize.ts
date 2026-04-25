// Image optimization utilities
// Adds WebP/AVIF auto-format + size constraints to external image URLs
// Zero visual impact, smaller download size

interface OptimizeOptions {
  width?: number;
  quality?: number; // 0-100
}

/**
 * Optimize Unsplash image URL with auto-format (WebP when supported), quality, width.
 * Unsplash supports `?auto=format&q=80&w=800` params natively.
 */
export const optimizeUnsplash = (url: string, opts: OptimizeOptions = {}): string => {
  if (!url || !url.includes('unsplash.com')) return url;
  try {
    const u = new URL(url);
    const w = opts.width ?? 1200;
    const q = opts.quality ?? 75;
    // Strip existing size params, set our own
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    u.searchParams.set('q', String(q));
    u.searchParams.set('w', String(w));
    return u.toString();
  } catch {
    return url;
  }
};

/**
 * Generic image optimizer — adds appropriate params for known CDNs.
 */
export const optimizeImage = (url: string, opts: OptimizeOptions = {}): string => {
  if (!url) return url;
  if (url.includes('unsplash.com')) return optimizeUnsplash(url, opts);
  // Future: Cloudinary, ImageKit, etc.
  return url;
};

/**
 * Generate srcset for responsive images (Unsplash).
 * @param url base URL
 * @returns srcset string for use in <img srcset>
 */
export const unsplashSrcSet = (url: string, widths: number[] = [400, 800, 1200, 1600]): string => {
  if (!url || !url.includes('unsplash.com')) return '';
  return widths
    .map(w => `${optimizeUnsplash(url, { width: w })} ${w}w`)
    .join(', ');
};
