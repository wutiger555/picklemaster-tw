import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Court } from '../../types';

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
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [nearestCourt, setNearestCourt] = useState<Court | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const findNearestCourt = useCallback((userLat: number, userLng: number) => {
    if (courts.length === 0) return null;
    let nearest = courts[0];
    let minDistance = calculateDistance(userLat, userLng, nearest.location.lat, nearest.location.lng);
    courts.forEach(court => {
      const distance = calculateDistance(userLat, userLng, court.location.lat, court.location.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = court;
      }
    });
    return nearest;
  }, [courts, calculateDistance]);

  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('您的瀏覽器不支援定位功能');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
        const nearest = findNearestCourt(latitude, longitude);
        setNearestCourt(nearest);
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 13, { animate: true });
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === 1) {
          setLocationError('請允許位置存取權限');
        } else {
          setLocationError('無法取得位置');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [findNearestCourt]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current).setView([23.5, 121.0], 8);

    // Using CARTO Voyager - a nice balanced style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

  useEffect(() => {
    if (!mapReady || !mapRef.current || !userLocation) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();

    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="relative">
          <div class="absolute inset-0 bg-blue-500/30 rounded-full animate-ping"></div>
          <div class="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup(`
        <div class="font-medium text-sm">您的位置</div>
      `);
  }, [userLocation, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    const createMarkerIcon = (court: Court, isSelected: boolean) => {
      const colors: Record<string, { bg: string; ring: string; glow: string }> = {
        indoor: { bg: '#3B82F6', ring: '#60A5FA', glow: 'rgba(59, 130, 246, 0.3)' },
        outdoor: { bg: '#10B981', ring: '#34D399', glow: 'rgba(16, 185, 129, 0.3)' },
        covered: { bg: '#8B5CF6', ring: '#A78BFA', glow: 'rgba(139, 92, 246, 0.3)' },
      };
      const { bg, ring, glow } = colors[court.type] || colors.outdoor;
      const size = isSelected ? 20 : 14;

      return L.divIcon({
        className: 'court-marker',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${bg};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 2px ${ring}, 0 4px 12px ${glow};
            transition: transform 0.2s, box-shadow 0.2s;
            ${isSelected ? `
              transform: scale(1.2);
              box-shadow: 0 0 0 3px ${ring}, 0 6px 20px ${glow};
            ` : ''}
          "></div>
          ${court.is_new ? `
            <div style="
              position: absolute;
              top: -6px;
              right: -6px;
              width: 10px;
              height: 10px;
              background: linear-gradient(135deg, #F97316, #F59E0B);
              border-radius: 50%;
              border: 1.5px solid white;
              animation: pulse 2s infinite;
            "></div>
          ` : ''}
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    courts.forEach(court => {
      const isSelected = selectedCourt?.id === court.id;
      const marker = L.marker([court.location.lat, court.location.lng], {
        icon: createMarkerIcon(court, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      });

      const distance = userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, court.location.lat, court.location.lng)
        : null;

      const typeLabels: Record<string, string> = { indoor: '室內', outdoor: '戶外', covered: '風雨' };
      const typeColors: Record<string, string> = { indoor: '#3B82F6', outdoor: '#10B981', covered: '#8B5CF6' };

      const popupContent = `
        <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="display: flex; align-items: start; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
            <h3 style="font-size: 15px; font-weight: 700; color: #111; margin: 0; line-height: 1.3;">
              ${court.name}
            </h3>
            ${court.is_new ? `
              <span style="flex-shrink: 0; padding: 2px 6px; background: linear-gradient(135deg, #FED7AA, #FBBF24); color: #B45309; font-size: 10px; font-weight: 700; border-radius: 4px;">
                NEW
              </span>
            ` : ''}
          </div>
          <p style="font-size: 12px; color: #6B7280; margin: 0 0 12px 0;">
            ${court.location.address}
          </p>
          ${distance !== null ? `
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px; padding: 8px 10px; background: linear-gradient(135deg, #F0FDFA, #ECFEFF); border-radius: 8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" stroke-width="2">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span style="font-size: 13px; font-weight: 600; color: #0D9488;">距離 ${distance.toFixed(1)} 公里</span>
            </div>
          ` : ''}
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
            <div>
              <span style="color: #9CA3AF; font-size: 11px;">類型</span>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: ${typeColors[court.type] || typeColors.outdoor};">
                ${typeLabels[court.type] || '戶外'}
              </p>
            </div>
            <div>
              <span style="color: #9CA3AF; font-size: 11px;">球場數</span>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: #374151;">${court.courts_count} 面</p>
            </div>
            <div>
              <span style="color: #9CA3AF; font-size: 11px;">收費</span>
              <p style="margin: 2px 0 0 0; font-weight: 600; color: ${court.fee === 'free' ? '#10B981' : '#F59E0B'};">
                ${court.fee === 'free' ? '免費' : court.price}
              </p>
            </div>
            <div>
              <span style="color: #9CA3AF; font-size: 11px;">時間</span>
              <p style="margin: 2px 0 0 0; font-weight: 500; color: #6B7280; font-size: 11px;">${court.opening_hours}</p>
            </div>
          </div>
          ${court.contact ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E5E7EB;">
              <a href="tel:${court.contact}" style="display: flex; align-items: center; gap: 6px; color: #0D9488; text-decoration: none; font-size: 13px; font-weight: 500;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                ${court.contact}
              </a>
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'modern-popup',
        closeButton: true,
      });
      marker.on('click', () => onCourtSelect(court));
      marker.addTo(map);
      markersRef.current[court.id] = marker;
    });
  }, [courts, selectedCourt, mapReady, onCourtSelect, userLocation, calculateDistance]);

  useEffect(() => {
    if (!mapRef.current || !selectedCourt) return;
    const marker = markersRef.current[selectedCourt.id];
    if (marker) {
      mapRef.current.setView([selectedCourt.location.lat, selectedCourt.location.lng], 14, { animate: true });
      setTimeout(() => marker.openPopup(), 300);
    }
  }, [selectedCourt]);

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="w-full h-[520px]" />

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLocateUser}
          disabled={isLocating}
          className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg shadow-black/10 text-sm font-medium text-neutral-700 hover:text-teal-600 disabled:opacity-60 transition-all border border-neutral-100"
        >
          {isLocating ? (
            <span className="w-4 h-4 border-2 border-neutral-200 border-t-teal-500 rounded-full animate-spin"></span>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          <span>我的位置</span>
        </motion.button>

        {nearestCourt && userLocation && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCourtSelect(nearestCourt)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg shadow-teal-500/25 text-sm font-medium text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>最近球場</span>
          </motion.button>
        )}

        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600"
          >
            {locationError}
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg shadow-black/10 border border-neutral-100 px-4 py-3">
        <div className="flex items-center gap-5 text-xs font-medium text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full ring-2 ring-blue-300"></span>
            <span>室內</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-emerald-300"></span>
            <span>戶外</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full ring-2 ring-purple-300"></span>
            <span>風雨</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2 pl-3 border-l border-neutral-200">
              <span className="w-3 h-3 bg-blue-500 rounded-full ring-2 ring-blue-200 ring-offset-1"></span>
              <span>您的位置</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .modern-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          border: 1px solid rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .modern-popup .leaflet-popup-content {
          margin: 16px;
        }
        .modern-popup .leaflet-popup-tip-container {
          display: none;
        }
        .modern-popup .leaflet-popup-close-button {
          top: 8px !important;
          right: 8px !important;
          width: 24px !important;
          height: 24px !important;
          font-size: 18px !important;
          color: #9CA3AF !important;
          background: #F3F4F6 !important;
          border-radius: 6px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .modern-popup .leaflet-popup-close-button:hover {
          color: #374151 !important;
          background: #E5E7EB !important;
        }
        .court-marker, .user-location-marker {
          background: transparent !important;
          border: none !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        .leaflet-pane, .leaflet-tile-pane, .leaflet-overlay-pane,
        .leaflet-shadow-pane, .leaflet-marker-pane, .leaflet-tooltip-pane,
        .leaflet-popup-pane { z-index: 1 !important; }
        .leaflet-map-pane { z-index: 1 !important; }
        .leaflet-control { z-index: 2 !important; }
      `}</style>
    </div>
  );
};

export default CourtMap;
