import { useState, useEffect } from 'react';
import type { CourtsData } from '../types';

const Courts = () => {
  const [courtsData, setCourtsData] = useState<CourtsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/picklemaster-tw/data/courts.json')
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">全台球場地圖</h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          尋找離你最近的匹克球場，開始你的匹克球之旅。
        </p>

        {/* 地圖區域 - 未來整合 Leaflet */}
        <div className="bg-gray-300 h-96 rounded-lg mb-8 flex items-center justify-center">
          <p className="text-gray-600">地圖功能開發中...</p>
        </div>

        {/* 球場列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courtsData?.courts.map((court) => (
            <div key={court.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{court.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{court.location.address}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">類型:</span>
                    <span className={court.type === 'indoor' ? 'text-blue-600' : 'text-green-600'}>
                      {court.type === 'indoor' ? '室內' : '戶外'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-semibold mr-2">收費:</span>
                    <span className={court.fee === 'free' ? 'text-green-600' : 'text-orange-600'}>
                      {court.price}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-semibold mr-2">球場數:</span>
                    <span>{court.courts_count} 面</span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-semibold mr-2">開放時間:</span>
                    <span>{court.opening_hours}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-semibold mr-2">聯絡電話:</span>
                    <span>{court.contact}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold mb-2">設施:</p>
                  <div className="flex flex-wrap gap-2">
                    {court.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courts;
