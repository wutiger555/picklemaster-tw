import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { CourtsData, Court } from '../types';
import CourtMap, { type MapViewBounds } from '../components/map/CourtMap';
import { usePageTitle } from '../hooks/usePageTitle';
import { useCourtsWeather, weatherKey } from '../hooks/useCourtsWeather';
import { useGeolocation } from '../hooks/useGeolocation';
import { distanceKm, formatDistance } from '../utils/geo';
import { courtSlug } from '../utils/slugify';
import { getCityByName } from '../utils/cityData';
import SEOHead from '../components/common/SEOHead';
import WeatherBadge from '../components/court/WeatherBadge';
import CourtQuickSheet from '../components/court/CourtQuickSheet';

// Pickleball Icon Component
const PickleballIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <circle cx="8" cy="9" r="1.5" fill="currentColor" />
    <circle cx="16" cy="9" r="1.5" fill="currentColor" />
    <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    <circle cx="8" cy="15" r="1.5" fill="currentColor" />
    <circle cx="16" cy="15" r="1.5" fill="currentColor" />
  </svg>
);

type SortBy = 'recommended' | 'distance';

// 從網址還原篩選狀態（可分享的篩選連結）— 在 state 初始化當下讀取，支援 SPA 導航
const readParam = (key: string) => new URLSearchParams(window.location.search).get(key);
const pick = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  const v = readParam(key);
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
};

const Courts = () => {
  usePageTitle('全台匹克球場地圖');
  const [courtsData, setCourtsData] = useState<CourtsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'indoor' | 'outdoor' | 'covered'>(() => pick('type', ['all', 'indoor', 'outdoor', 'covered'] as const, 'all'));
  const [filterFee, setFilterFee] = useState<'all' | 'free' | 'paid'>(() => pick('fee', ['all', 'free', 'paid'] as const, 'all'));
  const [filterOwnership, setFilterOwnership] = useState<'all' | 'public' | 'private' | 'school' | 'community'>(() => pick('own', ['all', 'public', 'private', 'school', 'community'] as const, 'all'));
  const [filterCity, setFilterCity] = useState<string>(() => readParam('city') || 'all');
  const [showNewOnly, setShowNewOnly] = useState(() => readParam('new') === '1');
  const [searchQuery, setSearchQuery] = useState(() => readParam('q') || '');
  const [viewMode, setViewMode] = useState<'map' | 'list'>(() => pick('view', ['map', 'list'] as const, 'map'));
  const [showFilters, setShowFilters] = useState(false);
  const [collapsedCities, setCollapsedCities] = useState<Set<string>>(new Set());
  const [playableNow, setPlayableNow] = useState(() => readParam('now') === '1');
  // court 參數要在首次 render 就抓住：URL 同步 effect 會在資料載入前先清掉它
  const pendingCourtParam = useRef<string | null>(readParam('court'));
  const [sortBy, setSortBy] = useState<SortBy>('recommended');
  const [boundsFilter, setBoundsFilter] = useState(false);
  const [mapBounds, setMapBounds] = useState<MapViewBounds | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);

  const { location: userLocation, isLocating, error: locationError, locate } = useGeolocation();

  // 網址帶篩選（不含 court）進來 → 初次載入直接定位到篩選結果
  const initialFit = useRef(
    filterType !== 'all' || filterFee !== 'all' || filterOwnership !== 'all' ||
    filterCity !== 'all' || showNewOnly || !!searchQuery
  ).current;

  // 地圖範圍暫存在 ref：「只看地圖範圍」關閉時，拖動地圖不觸發整頁重繪
  const boundsRef = useRef<MapViewBounds | null>(null);
  const boundsFilterRef = useRef(boundsFilter);
  boundsFilterRef.current = boundsFilter;
  const handleBoundsChange = useCallback((b: MapViewBounds) => {
    boundsRef.current = b;
    if (boundsFilterRef.current) setMapBounds(b);
  }, []);
  const handleBoundsFilterChange = useCallback((v: boolean) => {
    setBoundsFilter(v);
    setMapBounds(v ? boundsRef.current : null);
  }, []);

  const toggleCity = (city: string) => {
    setCollapsedCities(prev => {
      const next = new Set(prev);
      if (next.has(city)) next.delete(city); else next.add(city);
      return next;
    });
  };

  // 縣市顯示順序：由北至南，讓總覽呈現地理直覺
  const CITY_ORDER = ['台北市', '新北市', '基隆市', '桃園市', '新竹縣', '新竹市', '苗栗縣', '台中市', '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '台南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣'];

  useEffect(() => {
    fetch('/data/courts.json')
      .then(res => res.json())
      .then(data => {
        setCourtsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load courts data:', err);
        setLoading(false);
      });
  }, []);

  // 分享連結帶 court 參數 → 資料載入後自動選取該球場
  useEffect(() => {
    if (!courtsData || !pendingCourtParam.current) return;
    const found = courtsData.courts.find((c: Court) => String(c.id) === pendingCourtParam.current);
    pendingCourtParam.current = null;
    if (found) setSelectedCourt(found);
  }, [courtsData]);

  // 篩選 / 選取狀態同步到網址（replaceState 不新增歷史紀錄）
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filterType !== 'all') params.set('type', filterType);
    if (filterFee !== 'all') params.set('fee', filterFee);
    if (filterOwnership !== 'all') params.set('own', filterOwnership);
    if (filterCity !== 'all') params.set('city', filterCity);
    if (showNewOnly) params.set('new', '1');
    if (playableNow) params.set('now', '1');
    if (viewMode !== 'map') params.set('view', viewMode);
    if (selectedCourt) params.set('court', String(selectedCourt.id));
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [searchQuery, filterType, filterFee, filterOwnership, filterCity, showNewOnly, playableNow, viewMode, selectedCourt]);

  // 全螢幕地圖時鎖住頁面捲動（含 Lenis）
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop?: () => void; start?: () => void } }).__lenis;
    if (mapExpanded) {
      lenis?.stop?.();
      document.documentElement.style.overflow = 'hidden';
    } else {
      lenis?.start?.();
      document.documentElement.style.overflow = '';
    }
    return () => {
      lenis?.start?.();
      document.documentElement.style.overflow = '';
    };
  }, [mapExpanded]);

  // Esc：先退出全螢幕，再取消選取
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (mapExpanded) setMapExpanded(false);
      else setSelectedCourt(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mapExpanded]);

  const cities = [...new Set(courtsData?.courts.map((c: Court) => c.location.city).filter(Boolean) || [])].sort();

  // 戶外 + 風雨球場座標 → 天氣（Open-Meteo 多座標單次請求，30 分鐘 localStorage 快取）
  const weatherCoords = useMemo(() => {
    return courtsData?.courts
      .filter((c: Court) => c.type === 'outdoor' || c.type === 'covered')
      .map((c: Court) => ({ lat: c.location.lat, lng: c.location.lng })) || [];
  }, [courtsData]);
  const weatherMap = useCourtsWeather(weatherCoords);

  const stats = {
    total: courtsData?.courts.length || 0,
    indoor: courtsData?.courts.filter((c: Court) => c.type === 'indoor').length || 0,
    outdoor: courtsData?.courts.filter((c: Court) => c.type === 'outdoor').length || 0,
    free: courtsData?.courts.filter((c: Court) => c.fee === 'free').length || 0,
    newCourts: courtsData?.courts.filter((c: Court) => c.is_new).length || 0,
  };

  // 非地圖範圍類篩選（地圖標記用這份，避免拖動地圖時標記自己消失）
  const filteredCourts = useMemo(() => (courtsData?.courts.filter((court: Court) => {
    if (filterType !== 'all' && court.type !== filterType) return false;
    if (filterFee !== 'all' && court.fee !== filterFee) return false;
    if (filterOwnership !== 'all' && court.ownership !== filterOwnership) return false;
    if (filterCity !== 'all' && court.location.city !== filterCity) return false;
    if (showNewOnly && !court.is_new) return false;
    if (playableNow) {
      // 室內 / 風雨永遠 OK；戶外要看天氣
      if (court.type === 'outdoor') {
        const w = weatherMap.get(weatherKey(court.location.lat, court.location.lng));
        // 沒天氣資料時保守不過濾掉（避免使用者看不到任何戶外場）
        if (w) {
          if (w.isRaining) return false;
          if (w.nextRainHours !== null && w.nextRainHours <= 2) return false;
        }
      }
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = court.name.toLowerCase().includes(query);
      const matchAddress = court.location.address.toLowerCase().includes(query);
      const matchCity = court.location.city?.toLowerCase().includes(query);
      const matchFeatures = court.features?.some((f: string) => f.toLowerCase().includes(query));
      if (!matchName && !matchAddress && !matchCity && !matchFeatures) return false;
    }
    return true;
  }) || []).slice().sort((a: Court, b: Court) => {
    // 1. is_new desc — 真正新加入的球場優先
    if (!!a.is_new !== !!b.is_new) return a.is_new ? -1 : 1;
    // 2. added_date desc — 較新的先
    const ad = (a as Court & { added_date?: string }).added_date || '';
    const bd = (b as Court & { added_date?: string }).added_date || '';
    if (ad !== bd) return bd.localeCompare(ad);
    // 3. id asc — 穩定排序
    return a.id - b.id;
  }), [courtsData, filterType, filterFee, filterOwnership, filterCity, showNewOnly, playableNow, searchQuery, weatherMap]);

  // 列表用：再套「只看地圖範圍」與排序
  const listCourts = useMemo(() => {
    let list = filteredCourts;
    if (boundsFilter && mapBounds) {
      list = list.filter((c: Court) =>
        c.location.lat <= mapBounds.north && c.location.lat >= mapBounds.south &&
        c.location.lng <= mapBounds.east && c.location.lng >= mapBounds.west
      );
    }
    if (sortBy === 'distance' && userLocation) {
      list = list.slice().sort((a, b) =>
        distanceKm(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng) -
        distanceKm(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng)
      );
    }
    return list;
  }, [filteredCourts, boundsFilter, mapBounds, sortBy, userLocation]);

  // 搜尋字 debounce 後才觸發地圖自動飛行，避免每個按鍵都飛一次
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 450);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const fitSignature = `${filterType}|${filterFee}|${filterOwnership}|${filterCity}|${showNewOnly}|${playableNow}|${debouncedQuery}`;

  const typeLabels: Record<string, string> = { indoor: '室內', outdoor: '戶外', covered: '風雨' };
  const ownershipLabels: Record<string, string> = { public: '公營', private: '民營', school: '學校', community: '社區' };

  const clearFilters = () => {
    setFilterType('all');
    setFilterFee('all');
    setFilterOwnership('all');
    setFilterCity('all');
    setShowNewOnly(false);
    setPlayableNow(false);
    setSearchQuery('');
    setSelectedCourt(null);
  };

  const handleSortDistance = () => {
    if (sortBy === 'distance') { setSortBy('recommended'); return; }
    if (userLocation) { setSortBy('distance'); return; }
    locate(() => setSortBy('distance'));
  };

  const courtDistance = (court: Court): number | null =>
    userLocation ? distanceKm(userLocation.lat, userLocation.lng, court.location.lat, court.location.lng) : null;

  const hasActiveFilters = filterType !== 'all' || filterFee !== 'all' || filterOwnership !== 'all' || filterCity !== 'all' || showNewOnly || playableNow || searchQuery;
  const activeFilterCount = [filterType !== 'all', filterFee !== 'all', filterOwnership !== 'all', filterCity !== 'all', showNewOnly, playableNow].filter(Boolean).length;

  // 側欄球場卡片（縣市分組模式與距離排序模式共用）
  const renderCourtCard = (court: Court) => {
    const dist = courtDistance(court);
    return (
      <div
        key={court.id}
        onClick={() => setSelectedCourt(court)}
        className={`p-4 border-b border-neutral-100 cursor-pointer transition-all hover:bg-teal-50/50 ${selectedCourt?.id === court.id
          ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-l-teal-500'
          : ''
          }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            to={`/courts/${courtSlug(court.id)}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-neutral-900 text-sm leading-tight hover:text-emerald-600 hover:underline"
          >
            {court.name}
          </Link>
          <div className="flex-shrink-0 flex items-center gap-1.5">
            {dist !== null && (
              <span className="px-1.5 py-0.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold rounded whitespace-nowrap">
                {formatDistance(dist)}
              </span>
            )}
            {court.is_new && (
              <span className="px-1.5 py-0.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-xs font-semibold rounded">
                NEW
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <p className="text-xs text-neutral-500 line-clamp-1 flex-1">
            {court.location.address}
          </p>
          <div className="flex-shrink-0 flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${court.location.lat},${court.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 hover:underline font-medium"
              title="開車導航（Google Maps）"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              導航
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${court.location.lat},${court.location.lng}&travelmode=transit`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 hover:underline font-medium"
              title="大眾運輸路線（含即時公車/捷運班次）"
            >
              <span aria-hidden>🚌</span>
              公車
            </a>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${court.type === 'indoor' ? 'bg-blue-50 text-blue-600' :
            court.type === 'covered' ? 'bg-purple-50 text-purple-600' :
              'bg-emerald-50 text-emerald-600'
            }`}>
            {typeLabels[court.type] || '戶外'}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${court.fee === 'free' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
            }`}>
            {court.fee === 'free' ? '免費' : '付費'}
          </span>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600">
            {court.courts_count}面
          </span>
          {court.type === 'outdoor' && (
            <WeatherBadge lat={court.location.lat} lng={court.location.lng} weather={weatherMap.get(weatherKey(court.location.lat, court.location.lng))} />
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-orange-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <PickleballIcon className="w-16 h-16 text-teal-500" />
          </motion.div>
          <p className="text-neutral-600 font-medium">探索全台球場中...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-orange-50/30">
      <SEOHead page="courts" />

      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-cyan-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-gradient-to-br from-orange-200/30 to-yellow-200/20 rounded-full blur-3xl" />
          {/* Pickleball pattern */}
          <div className="absolute top-10 right-10 opacity-5">
            <PickleballIcon className="w-32 h-32 text-teal-900" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg shadow-teal-500/25"
              >
                <PickleballIcon className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-teal-600 font-semibold text-sm tracking-wide uppercase">Court Finder</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">
              全台匹克球場地圖
            </h1>
            <p className="text-neutral-600 text-lg max-w-xl mb-6">
              收錄 {stats.total} 座球場，快速找到適合你的場地開始揮拍
            </p>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap gap-2">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-teal-100 rounded-full text-sm text-neutral-700 shadow-sm"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                {stats.indoor} 室內
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-teal-100 rounded-full text-sm text-neutral-700 shadow-sm"
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                {stats.outdoor} 戶外
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-teal-100 rounded-full text-sm text-neutral-700 shadow-sm"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                {stats.free} 免費
              </motion.span>
              {stats.newCourts > 0 && (
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-full text-sm text-orange-700 font-medium shadow-sm"
                >
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  {stats.newCourts} 新場地
                </motion.span>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="sticky top-[88px] z-30 bg-white border-b border-neutral-200/80 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative group">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜尋球場..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all text-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {/* Quick Filters */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {['all', 'indoor', 'outdoor'].map((type) => (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterType(type as typeof filterType)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${filterType === type
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/25'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                  >
                    {type === 'all' ? '全部' : typeLabels[type]}
                  </motion.button>
                ))}
              </div>

              <div className="w-px h-6 bg-neutral-200 flex-shrink-0" />

              {/* Playable Now — weather-aware filter for outdoor courts */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPlayableNow(v => !v)}
                title="篩掉戶外正在下雨或 2 小時內會下雨的球場（室內/風雨場一律保留）"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0 ${playableNow
                    ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/25'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
              >
                <span aria-hidden>{playableNow ? '✓' : '☔'}</span>
                現在能打
              </motion.button>

              {/* Distance sort — triggers geolocation on first use */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSortDistance}
                title="依你的位置由近到遠排序（首次使用會請求定位權限）"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0 ${sortBy === 'distance'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/25'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
              >
                {isLocating ? (
                  <span className="w-3.5 h-3.5 border-2 border-neutral-300 border-t-teal-500 rounded-full animate-spin" />
                ) : (
                  <span aria-hidden>📍</span>
                )}
                離我最近
              </motion.button>

              <div className="w-px h-6 bg-neutral-200 flex-shrink-0" />

              {/* Fee Toggle */}
              <div className="flex items-center bg-neutral-100 rounded-lg p-1 flex-shrink-0">
                {['all', 'free', 'paid'].map((fee) => (
                  <button
                    key={fee}
                    onClick={() => setFilterFee(fee as typeof filterFee)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterFee === fee
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                  >
                    {fee === 'all' ? '全部' : fee === 'free' ? '免費' : '付費'}
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-neutral-200 flex-shrink-0" />

              {/* More Filters */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${showFilters || activeFilterCount > 0
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                篩選
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-teal-500 text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </motion.button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-neutral-500 hover:text-neutral-700 text-sm font-medium transition-colors flex-shrink-0"
                >
                  清除
                </button>
              )}

              <div className="w-px h-6 bg-neutral-200 flex-shrink-0" />

              {/* View Toggle */}
              <div className="flex bg-neutral-100 rounded-lg p-1 flex-shrink-0">
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  title="地圖模式"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  title="列表模式"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Extended Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-100 mt-3">
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-teal-400 focus:ring-1 focus:ring-teal-100 focus:outline-none text-sm"
                  >
                    <option value="all">全部城市</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>

                  <select
                    value={filterOwnership}
                    onChange={(e) => setFilterOwnership(e.target.value as typeof filterOwnership)}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-teal-400 focus:ring-1 focus:ring-teal-100 focus:outline-none text-sm"
                  >
                    <option value="all">全部經營類型</option>
                    <option value="public">公營</option>
                    <option value="private">民營</option>
                    <option value="school">學校</option>
                    <option value="community">社區</option>
                  </select>

                  {stats.newCourts > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showNewOnly}
                          onChange={(e) => setShowNewOnly(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-9 h-5 rounded-full transition-colors ${showNewOnly ? 'bg-orange-500' : 'bg-neutral-300'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform absolute top-0.5 ${showNewOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${showNewOnly ? 'text-orange-600' : 'text-neutral-600'}`}>
                        只看新場地
                      </span>
                    </label>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-3 text-sm">
            <span className="text-neutral-500">
              找到 <span className="font-semibold text-neutral-900">{listCourts.length}</span> 座球場
              {boundsFilter && (
                <span className="ml-1.5 text-xs text-teal-600 font-medium">（限地圖範圍）</span>
              )}
              {sortBy === 'distance' && userLocation && (
                <span className="ml-1.5 text-xs text-teal-600 font-medium">· 由近到遠</span>
              )}
            </span>
            <a
              href="https://pickleball.org.tw/stadium/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-teal-600 transition-colors text-xs"
            >
              資料來源：中華民國匹克球協會
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Map — sticky on desktop so it stays visible while user scrolls the list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={mapExpanded
                ? 'fixed inset-0 z-[60]'
                : 'lg:col-span-3 xl:col-span-3 lg:sticky lg:top-[170px] lg:self-start isolate'}
            >
              <div className={mapExpanded
                ? 'w-full h-full bg-white'
                : 'bg-white rounded-2xl overflow-hidden shadow-lg shadow-neutral-900/5 border border-neutral-200/80 h-[55vh] min-h-[380px] max-h-[560px] supports-[height:1dvh]:h-[55dvh] lg:h-[calc(100vh-210px)] lg:supports-[height:1dvh]:h-[calc(100dvh-210px)] lg:min-h-[480px] lg:max-h-none'}
              >
                <CourtMap
                  courts={filteredCourts}
                  selectedCourt={selectedCourt}
                  onCourtSelect={setSelectedCourt}
                  userLocation={userLocation}
                  isLocating={isLocating}
                  locationError={locationError}
                  onLocate={() => locate()}
                  fitSignature={fitSignature}
                  initialFit={initialFit}
                  boundsFilter={boundsFilter}
                  onBoundsFilterChange={handleBoundsFilterChange}
                  onBoundsChange={handleBoundsChange}
                  isExpanded={mapExpanded}
                  onToggleExpand={() => setMapExpanded(v => !v)}
                />
              </div>
            </motion.div>

            {/* Court List Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-lg shadow-neutral-900/5 border border-neutral-200/80 overflow-hidden">
                <div className="p-4 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h2 className="font-semibold text-neutral-900">球場列表</h2>
                    <span className="text-xs text-neutral-500">
                      共 <span className="font-semibold text-neutral-700">{listCourts.length}</span> 座 · {sortBy === 'distance' && userLocation ? '依距離' : '依縣市'}
                    </span>
                  </div>
                  {sortBy !== 'distance' && (() => {
                    const allCities = [...new Set(listCourts.map((c: Court) => c.location.city || '其他'))];
                    const allCollapsed = allCities.length > 0 && allCities.every(c => collapsedCities.has(c));
                    return (
                      <div className="flex items-center gap-3 mb-3 text-xs">
                        <button
                          onClick={() => setCollapsedCities(allCollapsed ? new Set() : new Set(allCities))}
                          className="text-teal-600 hover:text-teal-700 font-medium"
                        >
                          {allCollapsed ? '展開全部' : '收合全部'}
                        </button>
                        <span className="text-neutral-400">·</span>
                        <span className="text-neutral-500">點縣市標題可摺疊／點 chip 跳到該區</span>
                      </div>
                    );
                  })()}
                  {/* 縣市數量總覽 chips */}
                  {sortBy !== 'distance' && (() => {
                    const counts: Record<string, number> = {};
                    listCourts.forEach((c: Court) => {
                      const k = c.location.city || '其他';
                      counts[k] = (counts[k] || 0) + 1;
                    });
                    const orderedCities = Object.keys(counts).sort((a, b) => {
                      const ai = CITY_ORDER.indexOf(a);
                      const bi = CITY_ORDER.indexOf(b);
                      if (ai === -1 && bi === -1) return a.localeCompare(b);
                      if (ai === -1) return 1;
                      if (bi === -1) return -1;
                      return ai - bi;
                    });
                    return (
                      <div className="flex flex-wrap gap-1.5">
                        {orderedCities.map(city => (
                          <button
                            key={city}
                            onClick={() => {
                              // 1. 展開該縣市（如果摺疊中）
                              setCollapsedCities(prev => {
                                if (!prev.has(city)) return prev;
                                const next = new Set(prev);
                                next.delete(city);
                                return next;
                              });
                              // 2. 等 React commit 後再跳轉，配合 Lenis 平滑捲動
                              setTimeout(() => {
                                const target = document.getElementById(`city-section-${city}`);
                                if (!target) return;
                                const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, opts?: { offset?: number; duration?: number }) => void } }).__lenis;
                                if (lenis?.scrollTo) {
                                  lenis.scrollTo(target, { offset: -180, duration: 1.0 });
                                } else {
                                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }, 50);
                            }}
                            className="px-2 py-0.5 text-xs font-medium rounded-full transition-colors bg-neutral-100 text-neutral-600 hover:bg-teal-50 hover:text-teal-700"
                          >
                            {city} <span className="opacity-70">{counts[city]}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  {listCourts.length === 0 ? (
                    <div className="p-8 text-center">
                      <PickleballIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-neutral-500 mb-3">
                        {boundsFilter ? '目前地圖範圍內沒有符合的球場' : '沒有符合條件的球場'}
                      </p>
                      {boundsFilter && (
                        <button
                          onClick={() => handleBoundsFilterChange(false)}
                          className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                        >
                          關閉「只看地圖範圍」
                        </button>
                      )}
                    </div>
                  ) : sortBy === 'distance' && userLocation ? (
                    /* 距離排序：攤平列表，由近到遠 */
                    <div>
                      <div className="px-4 py-2.5 bg-teal-50/60 border-b border-teal-100 text-xs font-semibold text-teal-700 flex items-center gap-1.5">
                        <span aria-hidden>📍</span> 依你的位置由近到遠
                      </div>
                      {listCourts.map((court: Court) => renderCourtCard(court))}
                    </div>
                  ) : (() => {
                    // 依縣市分組
                    const groups: Record<string, Court[]> = {};
                    listCourts.forEach((c: Court) => {
                      const k = c.location.city || '其他';
                      if (!groups[k]) groups[k] = [];
                      groups[k].push(c);
                    });
                    const orderedCities = Object.keys(groups).sort((a, b) => {
                      const ai = CITY_ORDER.indexOf(a);
                      const bi = CITY_ORDER.indexOf(b);
                      if (ai === -1 && bi === -1) return a.localeCompare(b);
                      if (ai === -1) return 1;
                      if (bi === -1) return -1;
                      return ai - bi;
                    });
                    return orderedCities.map(city => {
                      const cityCourts = groups[city];
                      const isCollapsed = collapsedCities.has(city);
                      return (
                        <div key={city} id={`city-section-${city}`} className="scroll-mt-[180px]">
                          <div className="flex items-center bg-neutral-50 border-b border-neutral-200">
                            <button
                              onClick={() => toggleCity(city)}
                              className="flex-1 flex items-center gap-2 px-4 py-2.5 hover:bg-neutral-100 transition-colors"
                            >
                              <svg
                                className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                                viewBox="0 0 20 20" fill="currentColor"
                              >
                                <path fillRule="evenodd" d="M6 4l8 6-8 6V4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-semibold text-sm text-neutral-800">{city}</span>
                              <span className="text-xs text-neutral-500">{cityCourts.length} 座</span>
                            </button>
                            {getCityByName(city) && (
                              <Link
                                to={`/courts/${getCityByName(city)!.slug}`}
                                className="px-3 py-2.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline whitespace-nowrap"
                              >
                                攻略 →
                              </Link>
                            )}
                          </div>
                          {!isCollapsed && cityCourts.map((court: Court) => renderCourtCard(court))}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* List View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {listCourts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
                <PickleballIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500 text-lg">沒有符合條件的球場</p>
                <button onClick={clearFilters} className="mt-4 text-teal-600 hover:text-teal-700 font-medium">
                  清除所有篩選
                </button>
              </div>
            ) : (
              listCourts.map((court: Court, index: number) => (
                <motion.div
                  key={court.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.5) }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-lg hover:shadow-neutral-900/5 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <Link to={`/courts/${courtSlug(court.id)}`} className="font-bold text-neutral-900 text-lg hover:text-emerald-600 hover:underline">
                          {court.name}
                        </Link>
                        {courtDistance(court) !== null && (
                          <span className="px-2 py-0.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold rounded whitespace-nowrap self-center">
                            📍 {formatDistance(courtDistance(court)!)}
                          </span>
                        )}
                        {court.is_new && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-xs font-bold rounded">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mb-4 flex items-center gap-1">
                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {court.location.address}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm mb-4">
                        <div>
                          <span className="text-neutral-400 text-xs">類型</span>
                          <p className="font-semibold text-neutral-800">{typeLabels[court.type] || '戶外'}</p>
                        </div>
                        <div>
                          <span className="text-neutral-400 text-xs">球場數</span>
                          <p className="font-semibold text-neutral-800">{court.courts_count} 面</p>
                        </div>
                        <div>
                          <span className="text-neutral-400 text-xs">經營</span>
                          <p className="font-semibold text-neutral-800">{ownershipLabels[court.ownership] || '公營'}</p>
                        </div>
                        <div>
                          <span className="text-neutral-400 text-xs">收費</span>
                          <p className={`font-semibold ${court.fee === 'free' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {court.fee === 'free' ? '免費' : court.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {court.opening_hours}
                      </div>

                      {court.features && court.features.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {court.features.map((feature: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2.5 md:items-end min-w-[160px]">
                      {court.contact && (
                        <a
                          href={`tel:${court.contact}`}
                          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-teal-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {court.contact}
                        </a>
                      )}
                      <div className="flex gap-2 flex-wrap md:flex-nowrap">
                        {court.booking_url && (
                          <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={court.booking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-500/25 transition-shadow"
                          >
                            預約場地
                          </motion.a>
                        )}
                        {court.website && (
                          <a
                            href={court.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            官網
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setSelectedCourt(court);
                            setViewMode('map');
                          }}
                          className="px-4 py-2 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-50 hover:border-teal-200 hover:text-teal-600 transition-colors"
                        >
                          地圖
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* 行動版底部快覽面板：桌面版由地圖 popup 呈現，lg 以上隱藏 */}
      <div className="lg:hidden">
        <CourtQuickSheet
          court={selectedCourt}
          weather={selectedCourt ? weatherMap.get(weatherKey(selectedCourt.location.lat, selectedCourt.location.lng)) : undefined}
          distanceLabel={selectedCourt && courtDistance(selectedCourt) !== null ? formatDistance(courtDistance(selectedCourt)!) : undefined}
          onClose={() => setSelectedCourt(null)}
        />
      </div>
    </div>
  );
};

export default Courts;
