import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { CourtsData, Court } from '../types';
import CourtMap from '../components/map/CourtMap';
import GlassCard from '../components/common/GlassCard';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';

const Courts = () => {
  usePageTitle('全台匹克球場地圖');
  const [courtsData, setCourtsData] = useState<CourtsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [filterFee, setFilterFee] = useState<'all' | 'free' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  // 篩選球場
  const filteredCourts = courtsData?.courts.filter(court => {
    // 類型篩選
    if (filterType !== 'all' && court.type !== filterType) return false;

    // 收費篩選
    if (filterFee !== 'all' && court.fee !== filterFee) return false;

    // 搜尋篩選
    if (searchQuery && !court.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !court.location.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-white">
        <GlassCard variant="light" size="xl" className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mb-4"></div>
          <p className="font-display text-heading-lg font-bold text-neutral-900">載入球場資料中...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <SEOHead page="courts" />
      {/* 標題區 - 升級設計 */}
      <section className="relative bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 text-white py-20 md:py-24 overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="font-display text-display-lg md:text-display-xl font-black mb-4 drop-shadow-lg"
          >
            台灣匹克球球場地圖
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-body-lg md:text-body-xl text-white/90 max-w-2xl mx-auto mb-6"
          >
            55+ 匹克球球場完整資訊 | 台北、新北、台中、高雄、台南匹克球場推薦 🏓
          </motion.p>

          {/* 統計資訊 */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <motion.div variants={staggerItem}>
              <GlassCard variant="light" size="sm" hoverable className="inline-block">
                <div className="flex items-center gap-2 px-4 py-2">
                  <span className="text-2xl">📍</span>
                  <span className="font-mono text-heading-md font-bold text-neutral-900">
                    {courtsData?.courts.length}
                  </span>
                  <span className="text-body-md text-neutral-700">個球場</span>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <GlassCard variant="light" size="sm" hoverable className="inline-block">
                <div className="flex items-center gap-2 px-4 py-2">
                  <span className="text-2xl">🔍</span>
                  <span className="font-mono text-heading-md font-bold text-neutral-900">
                    {filteredCourts.length}
                  </span>
                  <span className="text-body-md text-neutral-700">個符合篩選</span>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* 資料來源 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-caption-lg text-white/70"
          >
            📋 資料來源：
            <a
              href="https://pickleball.org.tw/stadium/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white hover:underline mx-1"
            >
              中華民國匹克球協會
            </a>
            • 社群彙整
          </motion.div>
        </div>

        {/* 波浪裝飾 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#fafafa"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* 搜尋與篩選區 - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <GlassCard variant="light" size="lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 搜尋框 */}
              <div className="md:col-span-2">
                <label className="block text-body-sm font-semibold text-neutral-700 mb-2">
                  🔍 搜尋球場
                </label>
                <input
                  type="text"
                  placeholder="輸入球場名稱或地址..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-body-md"
                />
              </div>

              {/* 類型篩選 */}
              <div>
                <label className="block text-body-sm font-semibold text-neutral-700 mb-2">
                  🏢 球場類型
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-body-md"
                >
                  <option value="all">全部</option>
                  <option value="indoor">室內</option>
                  <option value="outdoor">戶外</option>
                </select>
              </div>

              {/* 收費篩選 */}
              <div>
                <label className="block text-body-sm font-semibold text-neutral-700 mb-2">
                  💰 收費方式
                </label>
                <select
                  value={filterFee}
                  onChange={(e) => setFilterFee(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-body-md"
                >
                  <option value="all">全部</option>
                  <option value="free">免費</option>
                  <option value="paid">付費</option>
                </select>
              </div>
            </div>

            {/* 清除篩選按鈕 */}
            {(filterType !== 'all' || filterFee !== 'all' || searchQuery) && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setFilterType('all');
                    setFilterFee('all');
                    setSearchQuery('');
                    setSelectedCourt(null);
                  }}
                  className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-body-sm font-semibold transition-all shadow-elevated-sm hover:shadow-elevated-md"
                >
                  🔄 清除所有篩選
                </button>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* 互動地圖 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <CourtMap
            courts={filteredCourts}
            selectedCourt={selectedCourt}
            onCourtSelect={setSelectedCourt}
          />
        </motion.div>

        {/* 球場列表 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard variant="light" size="md" className="mb-6">
            <h2 className="font-display text-display-sm font-black text-neutral-900 flex items-center">
              <span className="mr-2">📋</span>
              球場列表
            </h2>
          </GlassCard>

          {filteredCourts.length === 0 ? (
            <GlassCard variant="medium" size="xl">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-display text-heading-xl font-bold text-neutral-900 mb-2">
                  找不到符合條件的球場
                </h3>
                <p className="text-body-md text-neutral-600">請嘗試調整篩選條件或搜尋關鍵字</p>
              </div>
            </GlassCard>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCourts.map((court) => (
                <motion.div key={court.id} variants={staggerItem}>
                  <GlassCard
                    variant={selectedCourt?.id === court.id ? 'primary' : 'light'}
                    size="md"
                    hoverable
                    magnetic
                    clickable
                    onClick={() => setSelectedCourt(court)}
                    className="h-full"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-heading-lg font-bold text-neutral-900 flex-1">
                        {court.name}
                      </h3>
                      {selectedCourt?.id === court.id && (
                        <span className="text-2xl animate-bounce">📍</span>
                      )}
                    </div>

                    <p className="text-body-sm text-neutral-600 mb-4 flex items-start">
                      <span className="mr-1">📍</span>
                      {court.location.address}
                    </p>

                    <div className="space-y-2 text-body-sm mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">類型</span>
                        <span className={`px-3 py-1 rounded-full text-caption-lg font-bold ${court.type === 'indoor'
                            ? 'bg-secondary-100 text-secondary-700'
                            : 'bg-primary-100 text-primary-700'
                          }`}>
                          {court.type === 'indoor' ? '🏢 室內' : '🌳 戶外'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">收費</span>
                        <span className={`px-3 py-1 rounded-full text-caption-lg font-bold ${court.fee === 'free'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-accent-100 text-accent-700'
                          }`}>
                          {court.price}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">球場數</span>
                        <span className="font-mono text-neutral-900 font-bold">{court.courts_count} 面</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">開放時間</span>
                        <span className="text-neutral-800 text-caption-lg">{court.opening_hours}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">聯絡電話</span>
                        <a
                          href={`tel:${court.contact}`}
                          className="text-secondary-600 hover:text-secondary-700 font-mono font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {court.contact}
                        </a>
                      </div>

                      {court.booking_method && (
                        <div className="pt-3 border-t border-neutral-200">
                          <p className="text-caption-lg font-semibold text-neutral-700 mb-2 flex items-center">
                            <span className="mr-1">📅</span>
                            預約方式
                          </p>
                          <p className="text-caption-md text-neutral-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                            {court.booking_method}
                          </p>
                        </div>
                      )}

                      {(court.booking_url || court.website) && (
                        <div className="flex flex-col space-y-2 pt-2 border-t border-neutral-200">
                          {court.booking_url && (
                            <a
                              href={court.booking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-elevated-md transition-all text-body-sm font-semibold"
                              onClick={(e) => e.stopPropagation()}
                            >
                              📅 線上預約
                            </a>
                          )}
                          {court.website && (
                            <a
                              href={court.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-all text-body-sm font-semibold"
                              onClick={(e) => e.stopPropagation()}
                            >
                              🌐 官方網站
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-neutral-200">
                      <p className="text-caption-lg font-semibold text-neutral-600 mb-2">🎯 設施</p>
                      <div className="flex flex-wrap gap-2">
                        {court.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-caption-md font-medium"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>

                    {court.reviews && (
                      <div className="pt-3 border-t border-neutral-200 mt-3">
                        <p className="text-caption-lg font-semibold text-neutral-600 mb-1 flex items-center">
                          <span className="mr-1">💬</span>
                          球場評價
                        </p>
                        <p className="text-caption-md text-neutral-600 italic">{court.reviews}</p>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Courts;
