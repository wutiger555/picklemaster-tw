import { useCallback, useState } from 'react';

export interface UserLocation { lat: number; lng: number; }

// 使用者定位：提升到頁面層級共用（地圖標記、距離排序、卡片距離徽章）
export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback((onSuccess?: (loc: UserLocation) => void) => {
    if (!navigator.geolocation) {
      setError('您的瀏覽器不支援定位功能');
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setLocation(loc);
        setIsLocating(false);
        onSuccess?.(loc);
      },
      (err) => {
        setIsLocating(false);
        setError(err.code === 1 ? '請允許位置存取權限' : '無法取得位置');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { location, isLocating, error, locate };
}
