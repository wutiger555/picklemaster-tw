import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Court } from '../../types';

// 修復 Leaflet 預設圖標問題
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CourtMapProps {
  courts: Court[];
  selectedCourt: Court | null;
  onCourtSelect: (court: Court | null) => void;
}

const CourtMap = ({ courts, selectedCourt, onCourtSelect }: CourtMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});
  const [mapReady, setMapReady] = useState(false);

  // 初始化地圖
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // 台灣中心座標
    const taiwanCenter: [number, number] = [23.5, 121.0];

    // 創建地圖
    const map = L.map(mapContainerRef.current).setView(taiwanCenter, 8);

    // 加入 OpenStreetMap 圖層
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 加入球場標記
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;

    // 清除舊標記
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // 創建自定義圖標
    const createCustomIcon = (type: string, isSelected: boolean) => {
      const color = type === 'indoor' ? '#3b82f6' : '#22c55e';
      const size = isSelected ? 35 : 25;

      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            ${isSelected ? 'animation: pulse 1.5s infinite;' : ''}
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: ${isSelected ? '18px' : '14px'};
              font-weight: bold;
            ">🏓</span>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
      });
    };

    // 為每個球場加入標記
    courts.forEach(court => {
      const isSelected = selectedCourt?.id === court.id;
      const marker = L.marker(
        [court.location.lat, court.location.lng],
        { icon: createCustomIcon(court.type, isSelected) }
      );

      // 建立彈出視窗內容
      const popupContent = `
        <div style="min-width: 250px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">
            ${court.name}
          </h3>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">
            ${court.location.address}
          </div>
          <div style="display: grid; gap: 6px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600;">類型：</span>
              <span style="color: ${court.type === 'indoor' ? '#3b82f6' : '#22c55e'};">
                ${court.type === 'indoor' ? '室內' : '戶外'}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600;">收費：</span>
              <span style="color: ${court.fee === 'free' ? '#22c55e' : '#f59e0b'};">
                ${court.price}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600;">球場數：</span>
              <span>${court.courts_count} 面</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600;">開放時間：</span>
              <span>${court.opening_hours}</span>
            </div>
          </div>
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <div style="font-weight: 600; font-size: 12px; margin-bottom: 6px;">設施：</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${court.facilities.map(f => `
                <span style="
                  background-color: #f3f4f6;
                  padding: 2px 8px;
                  border-radius: 9999px;
                  font-size: 11px;
                  color: #4b5563;
                ">${f}</span>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup',
      });

      // 點擊標記時
      marker.on('click', () => {
        onCourtSelect(court);
      });

      // 懸停效果
      marker.on('mouseover', (e) => {
        e.target.openPopup();
      });

      marker.addTo(map);
      markersRef.current[court.id] = marker;
    });
  }, [courts, selectedCourt, mapReady, onCourtSelect]);

  // 當選中球場改變時，移動地圖視角
  useEffect(() => {
    if (!mapRef.current || !selectedCourt) return;

    const marker = markersRef.current[selectedCourt.id];
    if (marker) {
      mapRef.current.setView(
        [selectedCourt.location.lat, selectedCourt.location.lng],
        14,
        { animate: true, duration: 0.5 }
      );
      marker.openPopup();
    }
  }, [selectedCourt]);

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        className="w-full h-[500px] rounded-2xl shadow-2xl overflow-hidden border-4 border-white"
      />

      {/* 地圖圖例 */}
      <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 z-[1000]">
        <h4 className="font-bold text-gray-800 mb-3 text-sm">圖例</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-sport-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-gray-700">室內球場</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-court-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-gray-700">戶外球場</span>
          </div>
        </div>
      </div>

      {/* 加入 CSS 動畫 */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.9;
          }
        }

        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }

        .custom-popup .leaflet-popup-content {
          margin: 12px;
        }

        .custom-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default CourtMap;
