import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Court } from '../../types';
import type { UserLocation } from '../../hooks/useGeolocation';
import { distanceKm, formatDistance } from '../../utils/geo';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapViewBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface CourtMapProps {
  courts: Court[];
  selectedCourt: Court | null;
  onCourtSelect: (court: Court | null) => void;
  userLocation: UserLocation | null;
  isLocating: boolean;
  locationError: string | null;
  onLocate: () => void;
  /** 非地圖範圍類的篩選簽名：改變時地圖自動 flyTo 符合結果的範圍 */
  fitSignature: string;
  /** 網址帶篩選條件進來時，初次載入直接定位到篩選結果（不播動畫） */
  initialFit: boolean;
  boundsFilter: boolean;
  onBoundsFilterChange: (v: boolean) => void;
  onBoundsChange: (b: MapViewBounds) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const TYPE_COLORS: Record<string, { bg: string; ring: string; glow: string }> = {
  indoor: { bg: '#3B82F6', ring: '#60A5FA', glow: 'rgba(59, 130, 246, 0.3)' },
  outdoor: { bg: '#10B981', ring: '#34D399', glow: 'rgba(16, 185, 129, 0.3)' },
  covered: { bg: '#8B5CF6', ring: '#A78BFA', glow: 'rgba(139, 92, 246, 0.3)' },
};
const TYPE_LABELS: Record<string, string> = { indoor: '室內', outdoor: '戶外', covered: '風雨' };

// 台灣本島 + 離島的活動範圍，避免使用者把地圖拖到太平洋深處
const TAIWAN_BOUNDS = L.latLngBounds([20.0, 116.5], [27.0, 125.5]);
const CLUSTER_RADIUS_PX = 56;
const CLUSTER_MAX_ZOOM = 13; // 超過此縮放層級一律顯示個別球場

interface Cluster {
  lat: number;
  lng: number;
  items: Court[];
}

// 尊重 prefers-reduced-motion：改用即時跳轉取代飛行動畫（__pmNoAnim 供 E2E 測試強制關閉動畫）
const reduceMotion = () =>
  (window as unknown as { __pmNoAnim?: boolean }).__pmNoAnim === true ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const goTo = (map: L.Map, latlng: L.LatLngExpression, zoom: number) => {
  if (reduceMotion()) map.setView(latlng, zoom, { animate: false });
  else map.flyTo(latlng, zoom, { duration: 0.8 });
};

const goToBounds = (map: L.Map, bounds: L.LatLngBounds, maxZoom: number) => {
  if (reduceMotion()) map.fitBounds(bounds, { maxZoom, animate: false });
  else map.flyToBounds(bounds, { maxZoom, duration: 0.7 });
};

// 依當前 zoom 的投影像素距離做貪婪聚合：129 座球場的量級下 O(n²) 綽綽有餘
function buildClusters(map: L.Map, courts: Court[], zoom: number): Cluster[] {
  if (zoom > CLUSTER_MAX_ZOOM) {
    return courts.map(c => ({ lat: c.location.lat, lng: c.location.lng, items: [c] }));
  }
  const acc: { x: number; y: number; items: Court[] }[] = [];
  for (const c of courts) {
    const p = map.project([c.location.lat, c.location.lng], zoom);
    const hit = acc.find(a => Math.hypot(a.x - p.x, a.y - p.y) < CLUSTER_RADIUS_PX);
    if (hit) hit.items.push(c);
    else acc.push({ x: p.x, y: p.y, items: [c] });
  }
  return acc.map(a => ({
    lat: a.items.reduce((s, c) => s + c.location.lat, 0) / a.items.length,
    lng: a.items.reduce((s, c) => s + c.location.lng, 0) / a.items.length,
    items: a.items,
  }));
}

const CourtMap = ({
  courts,
  selectedCourt,
  onCourtSelect,
  userLocation,
  isLocating,
  locationError,
  onLocate,
  fitSignature,
  initialFit,
  boundsFilter,
  onBoundsFilterChange,
  onBoundsChange,
  isExpanded,
  onToggleExpand,
}: CourtMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const courtMarkersRef = useRef<{ [key: number]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const courtsRef = useRef<Court[]>(courts);
  courtsRef.current = courts;
  const [mapReady, setMapReady] = useState(false);
  const [zoom, setZoom] = useState(8);

  const nearestCourt = useMemo(() => {
    if (!userLocation || courts.length === 0) return null;
    let nearest = courts[0];
    let min = distanceKm(userLocation.lat, userLocation.lng, nearest.location.lat, nearest.location.lng);
    for (const c of courts) {
      const d = distanceKm(userLocation.lat, userLocation.lng, c.location.lat, c.location.lng);
      if (d < min) { min = d; nearest = c; }
    }
    return nearest;
  }, [courts, userLocation]);

  // 初始化地圖
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      maxBounds: TAIWAN_BOUNDS,
      maxBoundsViscosity: 0.6,
      minZoom: 7,
      zoomControl: true,
    }).setView([23.6, 121.0], 8);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on('zoomend', () => setZoom(map.getZoom()));

    mapRef.current = map;
    if (import.meta.env.DEV) (window as unknown as { __courtMap?: L.Map }).__courtMap = map;
    setMapReady(true);

    // 容器尺寸變化（全螢幕切換、視窗縮放、行動版轉向）時重算地圖尺寸
    // 直接同步呼叫：RO 本身已批次化，且 rAF 在背景分頁會被節流導致尺寸失準
    const ro = new ResizeObserver(() => {
      mapRef.current?.invalidateSize({ pan: false });
    });
    ro.observe(mapContainerRef.current);

    return () => {
      ro.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 對外回報目前地圖範圍（供「只看地圖範圍」同步列表）
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const emit = () => {
      const b = map.getBounds();
      onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    };
    emit();
    map.on('moveend', emit);
    return () => { map.off('moveend', emit); };
  }, [mapReady, onBoundsChange]);

  // 篩選條件改變 → 自動飛到符合結果的範圍（跳過初次載入，保留全台視野）
  const firstFitRef = useRef(true);
  const hasCourts = courts.length > 0;
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const list = courtsRef.current;
    if (list.length === 0) return; // 資料未載入前不消耗 first-fit
    const isFirst = firstFitRef.current;
    firstFitRef.current = false;
    if (isFirst && !initialFit) return;
    const b = L.latLngBounds(list.map(c => [c.location.lat, c.location.lng] as [number, number]));
    if (isFirst) mapRef.current.fitBounds(b.pad(0.2), { maxZoom: 13, animate: false });
    else goToBounds(mapRef.current, b.pad(0.2), 13);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitSignature, mapReady, hasCourts]);

  // 使用者位置標記
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

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 500 })
      .addTo(mapRef.current)
      .bindPopup('<div class="font-medium text-sm">您的位置</div>');

    // 定位成功 → 飛到使用者附近，直接看得到周邊球場
    goTo(mapRef.current, [userLocation.lat, userLocation.lng], Math.max(mapRef.current.getZoom(), 12));
  }, [userLocation, mapReady]);

  // 球場標記（含聚合）
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    courtMarkersRef.current = {};

    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

    // 被選取的球場一律獨立顯示，不被聚合吃掉
    const clusterable = selectedCourt ? courts.filter(c => c.id !== selectedCourt.id) : courts;
    const clusters = buildClusters(map, clusterable, zoom);
    if (selectedCourt && courts.some(c => c.id === selectedCourt.id)) {
      clusters.push({ lat: selectedCourt.location.lat, lng: selectedCourt.location.lng, items: [selectedCourt] });
    }

    const makeCourtIcon = (court: Court, isSelected: boolean) => {
      const { bg, ring, glow } = TYPE_COLORS[court.type] || TYPE_COLORS.outdoor;
      const size = isSelected ? 22 : 14;
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
            ${isSelected ? `box-shadow: 0 0 0 4px ${ring}, 0 6px 20px ${glow};` : ''}
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

    const makeClusterIcon = (cluster: Cluster) => {
      const n = cluster.items.length;
      const size = n >= 20 ? 48 : n >= 10 ? 42 : 36;
      const hasNew = cluster.items.some(c => c.is_new);
      return L.divIcon({
        className: 'court-marker',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #14B8A6, #06B6D4);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.25), 0 6px 16px rgba(20, 184, 166, 0.35);
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: ${n >= 100 ? 13 : 14}px;
            font-weight: 800;
            cursor: pointer;
          ">${n}</div>
          ${hasNew ? `
            <div style="
              position: absolute;
              top: -3px;
              right: -3px;
              width: 12px;
              height: 12px;
              background: linear-gradient(135deg, #F97316, #F59E0B);
              border-radius: 50%;
              border: 2px solid white;
              animation: pulse 2s infinite;
            "></div>
          ` : ''}
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    clusters.forEach(cluster => {
      // ── 聚合泡泡 ──
      if (cluster.items.length > 1) {
        const marker = L.marker([cluster.lat, cluster.lng], { icon: makeClusterIcon(cluster) });
        const cities = [...new Set(cluster.items.map(c => c.location.city).filter(Boolean))];
        const label = cities.length === 1 ? `${cities[0]} · ${cluster.items.length} 座球場` : `${cluster.items.length} 座球場`;
        marker.bindTooltip(`${label}（點擊放大）`, { direction: 'top', offset: [0, -12], opacity: 0.95 });
        marker.on('click', () => {
          const b = L.latLngBounds(cluster.items.map(c => [c.location.lat, c.location.lng] as [number, number]));
          goToBounds(map, b.pad(0.25), 15);
        });
        marker.addTo(map);
        markersRef.current.push(marker);
        return;
      }

      // ── 單一球場 ──
      const court = cluster.items[0];
      const isSelected = selectedCourt?.id === court.id;
      const marker = L.marker([court.location.lat, court.location.lng], {
        icon: makeCourtIcon(court, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      });

      const distance = userLocation
        ? distanceKm(userLocation.lat, userLocation.lng, court.location.lat, court.location.lng)
        : null;

      marker.bindTooltip(
        `${court.name} · ${court.courts_count} 面${distance !== null ? ` · ${formatDistance(distance)}` : ''}`,
        { direction: 'top', offset: [0, -10], opacity: 0.95 }
      );

      // 桌機：地圖 popup 呈現詳情；行動版：交給底部快覽面板，避免重複
      if (isDesktop) {
        const typeColor = (TYPE_COLORS[court.type] || TYPE_COLORS.outdoor).bg;
        const popupContent = `
          <div style="min-width: 230px; font-family: system-ui, -apple-system, sans-serif;">
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
                <span style="font-size: 13px; font-weight: 600; color: #0D9488;">距離 ${formatDistance(distance)}</span>
              </div>
            ` : ''}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
              <div>
                <span style="color: #9CA3AF; font-size: 11px;">類型</span>
                <p style="margin: 2px 0 0 0; font-weight: 600; color: ${typeColor};">
                  ${TYPE_LABELS[court.type] || '戶外'}
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
            <div style="display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #E5E7EB;">
              <a href="/courts/court-${court.id}" style="flex: 1; text-align: center; padding: 7px 10px; background: linear-gradient(135deg, #14B8A6, #06B6D4); color: white; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 8px;">
                詳細資訊
              </a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${court.location.lat},${court.location.lng}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; padding: 7px 10px; background: #F3F4F6; color: #374151; text-decoration: none; font-size: 12px; font-weight: 600; border-radius: 8px;">
                🧭 導航
              </a>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'modern-popup',
          closeButton: true,
          autoPan: false,
        });
      }

      marker.on('click', () => onCourtSelect(court));
      marker.addTo(map);
      markersRef.current.push(marker);
      courtMarkersRef.current[court.id] = marker;

      if (isSelected && isDesktop) {
        marker.openPopup();
      }
    });
  }, [courts, selectedCourt, mapReady, zoom, onCourtSelect, userLocation]);

  // 選取球場 → 飛過去（clustering 會在 zoomend 後自動散開）
  const lastFlownIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!mapRef.current || !selectedCourt) {
      lastFlownIdRef.current = null;
      return;
    }
    if (lastFlownIdRef.current === selectedCourt.id) return;
    lastFlownIdRef.current = selectedCourt.id;
    const map = mapRef.current;
    const targetZoom = Math.max(map.getZoom(), 15);
    goTo(map, [selectedCourt.location.lat, selectedCourt.location.lng], targetZoom);
  }, [selectedCourt]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 「只看地圖範圍」同步開關 — Google Maps 式 search-this-area */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[20]">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onBoundsFilterChange(!boundsFilter)}
          className={`flex items-center gap-1.5 pl-3 pr-3.5 py-2 rounded-full text-xs font-semibold shadow-lg shadow-black/10 border transition-colors whitespace-nowrap ${boundsFilter
            ? 'bg-teal-600 text-white border-teal-500'
            : 'bg-white/95 backdrop-blur-sm text-neutral-600 border-neutral-200 hover:text-teal-700'
            }`}
          title="開啟後，右側列表只顯示目前地圖可視範圍內的球場"
        >
          {boundsFilter ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          )}
          只看地圖範圍
        </motion.button>
      </div>

      {/* 右上控制群 */}
      <div className="absolute top-3 right-3 z-[20] flex flex-col gap-2 items-end">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleExpand}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-lg shadow-black/10 text-neutral-700 hover:text-teal-600 transition-colors border border-neutral-100"
          title={isExpanded ? '離開全螢幕' : '全螢幕地圖'}
          aria-label={isExpanded ? '離開全螢幕' : '全螢幕地圖'}
        >
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v5m0-5h5m6 0l5 5m0 0V4m0 5h-5m0 6l5 5m0 0v-5m0 5h-5M9 15l-5 5m0 0v-5m0 5h5" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onLocate}
          disabled={isLocating}
          className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl shadow-lg shadow-black/10 text-sm font-medium text-neutral-700 hover:text-teal-600 disabled:opacity-60 transition-colors border border-neutral-100"
        >
          {isLocating ? (
            <span className="w-4 h-4 border-2 border-neutral-200 border-t-teal-500 rounded-full animate-spin"></span>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          <span className="hidden sm:inline">我的位置</span>
        </motion.button>

        <AnimatePresence>
          {nearestCourt && userLocation && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCourtSelect(nearestCourt)}
              className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg shadow-teal-500/25 text-sm font-medium text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="hidden sm:inline">最近球場</span>
              <span className="sm:hidden">最近</span>
            </motion.button>
          )}
        </AnimatePresence>

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

      {/* 圖例 — 左下角，避開右下 attribution */}
      <div className="absolute bottom-3 left-3 z-[20] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg shadow-black/10 border border-neutral-100 px-3 py-2">
        <div className="flex items-center gap-3.5 text-[11px] font-medium text-neutral-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-blue-300"></span>
            <span>室內</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-emerald-300"></span>
            <span>戶外</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full ring-2 ring-purple-300"></span>
            <span>風雨</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2.5 border-l border-neutral-200">
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-[8px] font-bold ring-1 ring-teal-200">9</span>
            <span>聚合</span>
          </div>
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
        .leaflet-tooltip {
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 14px rgba(0,0,0,0.12);
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          padding: 5px 9px;
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
