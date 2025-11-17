import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { CourtsData, Court } from '../types';
import CourtMap from '../components/map/CourtMap';
import { usePageTitle } from '../hooks/usePageTitle';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sport-50 to-court-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sport-600 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">載入球場資料中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-sport-50">
      <div className="container mx-auto px-4 py-12">
        {/* 標題區 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sport-600 to-court-600">
            全台球場地圖
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            尋找離你最近的匹克球場，開始你的匹克球之旅 🏓
          </p>
          <div className="mt-4 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>📍 共 {courtsData?.courts.length} 個球場</span>
              <span>•</span>
              <span>🔍 {filteredCourts.length} 個符合篩選</span>
            </div>
            <div className="text-xs text-gray-400 flex items-center space-x-2">
              <span>📋 資料來源：</span>
              <a
                href="https://pickleball.org.tw/stadium/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sport-600 hover:text-sport-700 hover:underline"
              >
                中華民國匹克球協會
              </a>
              <span>•</span>
              <span>社群彙整</span>
            </div>
          </div>
        </motion.div>

        {/* 搜尋與篩選區 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜尋框 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔍 搜尋球場
              </label>
              <input
                type="text"
                placeholder="輸入球場名稱或地址..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-sport-500 focus:ring-2 focus:ring-sport-200 transition-all outline-none"
              />
            </div>

            {/* 類型篩選 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏢 球場類型
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-sport-500 focus:ring-2 focus:ring-sport-200 transition-all outline-none bg-white"
              >
                <option value="all">全部</option>
                <option value="indoor">室內</option>
                <option value="outdoor">戶外</option>
              </select>
            </div>

            {/* 收費篩選 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💰 收費方式
              </label>
              <select
                value={filterFee}
                onChange={(e) => setFilterFee(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-sport-500 focus:ring-2 focus:ring-sport-200 transition-all outline-none bg-white"
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
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-sm font-semibold transition-all"
              >
                🔄 清除所有篩選
              </button>
            </div>
          )}
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">📋</span>
            球場列表
          </h2>

          {filteredCourts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">找不到符合條件的球場</h3>
              <p className="text-gray-600">請嘗試調整篩選條件或搜尋關鍵字</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourts.map((court) => (
                <motion.div
                  key={court.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedCourt(court)}
                  className={`
                    bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300
                    ${selectedCourt?.id === court.id
                      ? 'ring-4 ring-sport-500 shadow-2xl'
                      : 'hover:shadow-xl'
                    }
                  `}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 flex-1">{court.name}</h3>
                      {selectedCourt?.id === court.id && (
                        <span className="text-2xl animate-bounce">📍</span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 flex items-start">
                      <span className="mr-1">📍</span>
                      {court.location.address}
                    </p>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">類型</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          court.type === 'indoor'
                            ? 'bg-sport-100 text-sport-700'
                            : 'bg-court-100 text-court-700'
                        }`}>
                          {court.type === 'indoor' ? '🏢 室內' : '🌳 戶外'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">收費</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          court.fee === 'free'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {court.price}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">球場數</span>
                        <span className="text-gray-800">{court.courts_count} 面</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">開放時間</span>
                        <span className="text-gray-800 text-xs">{court.opening_hours}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">聯絡電話</span>
                        <a
                          href={`tel:${court.contact}`}
                          className="text-sport-600 hover:text-sport-700 font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {court.contact}
                        </a>
                      </div>

                      {(court.booking_url || court.website) && (
                        <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                          {court.booking_url && (
                            <a
                              href={court.booking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-sport-500 to-court-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
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
                              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-semibold"
                              onClick={(e) => e.stopPropagation()}
                            >
                              🌐 官方網站
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2">🎯 設施</p>
                      <div className="flex flex-wrap gap-2">
                        {court.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-sport-50 to-court-50 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>

                    {court.reviews && (
                      <div className="pt-3 border-t border-gray-200 mt-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center">
                          <span className="mr-1">💬</span>
                          球場評價
                        </p>
                        <p className="text-xs text-gray-600 italic">{court.reviews}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Courts;
