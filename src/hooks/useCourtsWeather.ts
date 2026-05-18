import { useEffect, useState } from 'react';

export interface CourtWeather {
  temp: number;          // °C
  weatherCode: number;   // WMO weather code
  precipitation: number; // current mm
  isRaining: boolean;
  nextRainHours: number | null; // hours until ≥50% precip probability, null if dry next 6h
  rainChanceNext6h: number;     // max precip probability over next 6h
}

interface CoordKey { lat: number; lng: number; }

const CACHE_KEY = 'pmtw_weather_v1';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// WMO codes: https://open-meteo.com/en/docs
const RAINY_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);

interface CacheShape { timestamp: number; data: Record<string, CourtWeather>; }

function loadCache(): CacheShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed;
  } catch { return null; }
}

function saveCache(data: Record<string, CourtWeather>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch { /* quota exceeded etc. — ignore */ }
}

/**
 * Fetches current weather + 6h precipitation forecast for multiple coordinates
 * via Open-Meteo's multi-location API. Free, no API key, 10k requests/day per IP.
 * Results cached in localStorage for 30 minutes.
 */
export function useCourtsWeather(coords: CoordKey[]): Map<string, CourtWeather> {
  const [weather, setWeather] = useState<Map<string, CourtWeather>>(() => {
    const cached = loadCache();
    if (cached) return new Map(Object.entries(cached.data));
    return new Map();
  });

  useEffect(() => {
    if (coords.length === 0) return;

    // De-duplicate by rounded coords (Open-Meteo's grid resolution ~0.1° anyway)
    const unique = new Map<string, CoordKey>();
    for (const c of coords) {
      const key = `${c.lat.toFixed(2)},${c.lng.toFixed(2)}`;
      if (!unique.has(key)) unique.set(key, { lat: parseFloat(c.lat.toFixed(2)), lng: parseFloat(c.lng.toFixed(2)) });
    }

    const cached = loadCache();
    // If cache covers all needed keys, skip fetch
    if (cached && Array.from(unique.keys()).every(k => k in cached.data)) {
      return;
    }

    const lats = Array.from(unique.values()).map(c => c.lat).join(',');
    const lngs = Array.from(unique.values()).map(c => c.lng).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,weather_code,precipitation&hourly=precipitation_probability&timezone=Asia%2FTaipei&forecast_hours=6`;

    let cancelled = false;
    fetch(url)
      .then(r => r.json())
      .then((json: unknown) => {
        if (cancelled) return;
        // Open-Meteo returns an array when multiple locations are requested, single object for one
        const results = Array.isArray(json) ? json : [json];
        const keys = Array.from(unique.keys());
        const next: Record<string, CourtWeather> = cached?.data ? { ...cached.data } : {};
        results.forEach((res: any, i: number) => {
          const key = keys[i];
          if (!key || !res?.current) return;
          const temp = res.current.temperature_2m ?? 0;
          const weatherCode = res.current.weather_code ?? 0;
          const precipitation = res.current.precipitation ?? 0;
          const probs: number[] = res.hourly?.precipitation_probability ?? [];
          const rainChanceNext6h = probs.slice(0, 6).reduce((m, p) => Math.max(m, p ?? 0), 0);
          const nextIdx = probs.findIndex(p => (p ?? 0) >= 50);
          next[key] = {
            temp,
            weatherCode,
            precipitation,
            isRaining: precipitation > 0 || RAINY_CODES.has(weatherCode),
            nextRainHours: nextIdx >= 0 ? nextIdx : null,
            rainChanceNext6h,
          };
        });
        saveCache(next);
        setWeather(new Map(Object.entries(next)));
      })
      .catch(() => { /* silent — weather is a nice-to-have, not critical */ });

    return () => { cancelled = true; };
  }, [coords]);

  return weather;
}

export function weatherKey(lat: number, lng: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}
