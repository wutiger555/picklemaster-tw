import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { CourtsData, Court } from '../types';
import CourtMap from '../components/map/CourtMap';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';
import { ROUTES } from '../utils/constants';

// 地區分類
const REGIONS = [
  { id: 'all', name: '全部地區', icon: '🗺️' },
  { id: 'north', name: '北部', icon: '🏙️', cities: ['台北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣'] },
  { id: 'central', name: '中部', icon: '🌄', cities: ['台中市', '苗栗縣', '彰化縣', '南投縣', '雲林縣'] },
  { id: 'south', name: '南部', icon: '🌴', cities: ['高雄市', '台南市', '嘉義市', '嘉義縣', '屏東縣'] },
  { id: 'east', name: '東部', icon: '🏔️', cities: ['宜蘭縣', '花蓮縣', '台東縣'] },
];

// 計算兩點之間的距離（Haversine 公式）
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // 地球半徑（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Courts = () => {
  usePageTitle('全台匹克球場地圖');
  const [courtsData, setCourtsData] = useState<CourtsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [activeRegion, setActiveRegion] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [filterFee, setFilterFee] = useState<'all' | 'free' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(true);

  // 定位相關狀態
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearestCourt, setNearestCourt] = useState<{ court: Court; distance: number } | null>(null);

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

  // 取得使用者位置
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('您的瀏覽器不支援定位功能');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('請允許網站存取您的位置');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('無法取得您的位置資訊');
            break;
          case error.TIMEOUT:
            setLocationError('定位請求超時');
            break;
          default:
            setLocationError('定位時發生錯誤');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // 計算最近球場
  useEffect(() => {
    if (userLocation && courtsData?.courts) {
      let nearest: { court: Court; distance: number } | null = null;

      courtsData.courts.forEach(court => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          court.location.lat,
          court.location.lng
        );

        if (!nearest || distance < nearest.distance) {
          nearest = { court, distance };
        }
      });

      setNearestCourt(nearest);
    }
  }, [userLocation, courtsData]);

  // 根據地區篩選
  const getRegionCities = (regionId: string) => {
    const region = REGIONS.find(r => r.id === regionId);
    return region?.cities || [];
  };

  // 篩選球場（含距離排序）
  const filteredCourts = useMemo(() => {
    let courts = courtsData?.courts.filter(court => {
      // 地區篩選
      if (activeRegion !== 'all') {
        const cities = getRegionCities(activeRegion);
        if (!cities.some(city => court.location.address.includes(city.substring(0, 2)))) {
          return false;
        }
      }
      if (filterType !== 'all' && court.type !== filterType) return false;
      if (filterFee !== 'all' && court.fee !== filterFee) return false;
      if (searchQuery && !court.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !court.location.address.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    }) || [];

    // 如果有用戶位置，按距離排序
    if (userLocation) {
      courts = courts.map(court => ({
        ...court,
        distance: calculateDistance(userLocation.lat, userLocation.lng, court.location.lat, court.location.lng)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return courts;
  }, [courtsData, activeRegion, filterType, filterFee, searchQuery, userLocation]);

  // 統計資料
  const stats = useMemo(() => ({
    total: courtsData?.courts.length || 0,
    indoor: courtsData?.courts.filter(c => c.type === 'indoor').length || 0,
    outdoor: courtsData?.courts.filter(c => c.type === 'outdoor').length || 0,
    free: courtsData?.courts.filter(c => c.fee === 'free').length || 0,
  }), [courtsData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <span className="absolute inset-0 flex items-center justify-center text-3xl">📍</span>
          </div>
          <p className="font-semibold text-neutral-700">載入球場資料中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <SEOHead page="courts" />

      {/* Hero Section - 現代化設計 */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          {/* 麵包屑導航 */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link to={ROUTES.HOME} className="hover:text-white transition-colors">首頁</Link>
            <span>›</span>
            <span className="text-white">球場地圖</span>
          </nav>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-4"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              即時更新 · 資料來源：官方資訊
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-4"
            >
              全台匹克球場
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">地圖</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl"
            >
              收錄台北、新北、台中、高雄、台南等全台 <strong className="text-white">{stats.total}</strong> 個匹克球場，
              提供地址、開放時間、收費資訊，幫你快速找到最近的球場！
            </motion.p>

            {/* 快速統計 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
            >
              {[
                { icon: '📍', label: '總球場數', value: stats.total, color: 'bg-white/10' },
                { icon: '🏢', label: '室內球場', value: stats.indoor, color: 'bg-blue-500/20' },
                { icon: '🌳', label: '戶外球場', value: stats.outdoor, color: 'bg-green-500/20' },
                { icon: '✨', label: '免費球場', value: stats.free, color: 'bg-amber-500/20' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`${stat.color} backdrop-blur-sm rounded-xl p-4 text-center`}
                >
                  <span className="text-2xl mb-1 block">{stat.icon}</span>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* 搜尋框 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative max-w-xl"
            >
              <input
                type="text"
                placeholder="搜尋球場名稱或地址..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 pl-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.div>

            {/* 定位按鈕 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4"
            >
              <button
                onClick={getUserLocation}
                disabled={locationLoading}
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-colors"
              >
                {locationLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    定位中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    📍 找離我最近的球場
                  </>
                )}
              </button>

              {locationError && (
                <p className="mt-2 text-red-300 text-sm">⚠️ {locationError}</p>
              )}
            </motion.div>

            {/* 最近球場提示 */}
            <AnimatePresence>
              {nearestCourt && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-md rounded-2xl border border-white/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎯</div>
                    <div className="flex-1">
                      <p className="text-emerald-100 text-sm mb-1">離你最近的球場</p>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {nearestCourt.court.name}
                      </h3>
                      <p className="text-emerald-100 text-sm mb-2">
                        📍 {nearestCourt.court.location.address}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                          🚗 {nearestCourt.distance.toFixed(1)} 公里
                        </span>
                        <span className="text-emerald-100 text-sm">
                          {nearestCourt.court.type === 'indoor' ? '🏢 室內' : '🌳 戶外'} ·
                          {nearestCourt.court.fee === 'free' ? ' ✨ 免費' : ` 💰 ${nearestCourt.court.price}`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCourt(nearestCourt.court)}
                      className="px-4 py-2 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      查看詳情
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 波浪裝飾 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto">
            <path fill="#fafafa" d="M0,40L60,44C120,48,240,56,360,52C480,48,600,32,720,28C840,24,960,32,1080,36C1200,40,1320,40,1380,40L1440,40L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z" />
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 篩選區 - 重新設計 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-100 p-6 mb-8 sticky top-20 z-30"
        >
          {/* 地區切換 */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setActiveRegion(region.id)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeRegion === region.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                >
                  <span className="mr-1.5">{region.icon}</span>
                  {region.name}
                </button>
              ))}
            </div>
          </div>

          {/* 篩選器與視圖切換 */}
          <div className="flex flex-wrap items-center gap-4">
            {/* 類型篩選 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">類型：</span>
              <div className="flex bg-neutral-100 rounded-lg p-1">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'indoor', label: '室內 🏢' },
                  { value: 'outdoor', label: '戶外 🌳' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value as any)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === option.value ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 收費篩選 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">收費：</span>
              <div className="flex bg-neutral-100 rounded-lg p-1">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'free', label: '免費 ✨' },
                  { value: 'paid', label: '付費' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterFee(option.value as any)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterFee === option.value ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 地圖/列表切換 */}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${showMap ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600'
                  }`}
              >
                {showMap ? '🗺️ 隱藏地圖' : '🗺️ 顯示地圖'}
              </button>
            </div>
          </div>

          {/* 篩選結果 */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
            <p className="text-sm text-neutral-600">
              找到 <span className="font-bold text-blue-600">{filteredCourts.length}</span> 個球場
              {activeRegion !== 'all' && (
                <span className="ml-2 text-neutral-400">
                  · {REGIONS.find(r => r.id === activeRegion)?.name}
                </span>
              )}
            </p>
            {(filterType !== 'all' || filterFee !== 'all' || searchQuery || activeRegion !== 'all') && (
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterFee('all');
                  setSearchQuery('');
                  setActiveRegion('all');
                  setSelectedCourt(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                清除所有篩選
              </button>
            )}
          </div>
        </motion.div>

        {/* 地圖 */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <CourtMap
                courts={filteredCourts}
                selectedCourt={selectedCourt}
                onCourtSelect={setSelectedCourt}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 球場列表 - 現代化卡片設計 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">
              球場列表
            </h2>
            <Link to={ROUTES.FAQ} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              如何預約球場？
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {filteredCourts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-100">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-bold text-xl text-neutral-900 mb-2">找不到符合條件的球場</h3>
              <p className="text-neutral-500 mb-6">請嘗試調整篩選條件或搜尋關鍵字</p>
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterFee('all');
                  setSearchQuery('');
                  setActiveRegion('all');
                }}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                清除篩選條件
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourts.map((court, index) => (
                <motion.div
                  key={court.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelectedCourt(court)}
                  className={`group bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 hover:shadow-xl ${selectedCourt?.id === court.id
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-neutral-100 hover:border-blue-200'
                    }`}
                >
                  {/* 標題與標籤 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${court.type === 'indoor' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                        {court.type === 'indoor' ? '🏢' : '🌳'}
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                          {court.name}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${court.fee === 'free'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                          }`}>
                          {court.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 地址 */}
                  <p className="text-sm text-neutral-500 mb-3 flex items-start gap-2">
                    <span className="shrink-0">📍</span>
                    <span className="line-clamp-1">{court.location.address}</span>
                  </p>

                  {/* 詳細資訊 */}
                  <div className="flex flex-wrap gap-3 text-xs text-neutral-500 mb-4">
                    {userLocation && (court as any).distance && (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <span>🚗</span> {((court as any).distance as number).toFixed(1)} km
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span>🎾</span> {court.courts_count} 面場地
                    </span>
                    <span className="flex items-center gap-1">
                      <span>⏰</span> {court.opening_hours}
                    </span>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex gap-2">
                    {court.booking_url && (
                      <a
                        href={court.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl text-center hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                      >
                        線上預約
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.location.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 text-sm font-semibold rounded-xl text-center hover:bg-neutral-200 transition-colors"
                    >
                      開啟導航
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* SEO 內容區塊 - 相關資源 */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              找到球場後，下一步是什麼？
            </h2>
            <p className="text-neutral-600 mb-8 max-w-2xl">
              不論您在台北、新北、台中、高雄或台南，找到匹克球場只是第一步！
              準備好裝備、了解規則，讓您第一次上場就能自信打球。
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to={ROUTES.RULES}
                className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-3">📖</div>
                <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
                  學習匹克球規則
                </h3>
                <p className="text-sm text-neutral-500">
                  雙彈跳、廚房區、發球規則，10分鐘完整掌握
                </p>
              </Link>

              <Link
                to={ROUTES.EQUIPMENT}
                className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-3">🏓</div>
                <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
                  選購球拍指南
                </h3>
                <p className="text-sm text-neutral-500">
                  新手球拍推薦、材質比較、預算建議
                </p>
              </Link>

              <Link
                to={ROUTES.LEARNING}
                className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
                  技巧教學影片
                </h3>
                <p className="text-sm text-neutral-500">
                  發球、接發球、正反手、Dink 技術指導
                </p>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* FAQ 微型區塊 */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl border border-neutral-100 p-8 mb-8"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            關於匹克球場的常見問題
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: '匹克球場和羽球場有什麼不同？',
                a: '匹克球場尺寸接近羽球雙打場地（13.4m x 6.1m），但有獨特的「廚房區」（非截擊區）設計。許多羽球場經過改造後也可以打匹克球。'
              },
              {
                q: '室內和戶外球場該怎麼選？',
                a: '室內球場不受天氣影響，球速相對穩定；戶外球場通常場地更多、費用較低，但需注意風向影響球路。'
              },
              {
                q: '新手需要預約球場嗎？',
                a: '建議先預約！熱門時段（週末、晚間）常客滿。可透過各球場官網或電話預約。免費公園球場則先到先用。'
              },
              {
                q: '第一次去球場需要帶什麼？',
                a: '球拍（可當場租借）、室內運動鞋（避免黑底）、運動服裝、毛巾、飲用水。部分球場會提供匹克球。'
              },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-neutral-50 rounded-xl">
                <h3 className="font-semibold text-neutral-900 mb-2">{item.q}</h3>
                <p className="text-sm text-neutral-600">{item.a}</p>
              </div>
            ))}
          </div>
          <Link
            to={ROUTES.FAQ}
            className="inline-flex items-center gap-2 mt-6 text-blue-600 font-medium hover:gap-3 transition-all"
          >
            查看更多常見問題
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.section>
      </div>
    </div>
  );
};

export default Courts;
