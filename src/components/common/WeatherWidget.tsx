import { useEffect, useState } from 'react';

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windspeed: number;
  precipitation: number;
  humidity: number;
  isDay: boolean;
}

interface Props {
  lat: number;
  lng: number;
}

// Open-Meteo WMO weather code to icon/label
const codeToLabel = (code: number): { label: string; icon: string } => {
  if (code === 0) return { label: '晴朗', icon: '☀️' };
  if ([1, 2].includes(code)) return { label: '大致晴朗', icon: '🌤️' };
  if (code === 3) return { label: '多雲', icon: '☁️' };
  if ([45, 48].includes(code)) return { label: '起霧', icon: '🌫️' };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: '毛毛雨', icon: '🌦️' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: '降雨', icon: '🌧️' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: '降雪', icon: '❄️' };
  if ([95, 96, 99].includes(code)) return { label: '雷暴', icon: '⛈️' };
  return { label: '未知', icon: '🌡️' };
};

const WeatherWidget = ({ lat, lng }: Props) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,is_day&timezone=Asia/Taipei`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('天氣資料無法載入');
        const data = await res.json();
        const c = data.current;
        setWeather({
          temperature: Math.round(c.temperature_2m),
          weatherCode: c.weather_code,
          windspeed: Math.round(c.wind_speed_10m),
          precipitation: c.precipitation,
          humidity: c.relative_humidity_2m,
          isDay: c.is_day === 1,
        });
      } catch (e) {
        setError('天氣資料暫時無法取得');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 border border-sky-100">
        <div className="animate-pulse">
          <div className="h-4 bg-sky-200/50 rounded w-24 mb-3" />
          <div className="h-8 bg-sky-200/50 rounded w-32" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
        <p className="text-sm text-neutral-500">{error || '天氣資料不可用'}</p>
      </div>
    );
  }

  const { label, icon } = codeToLabel(weather.weatherCode);
  const isPlayable = weather.precipitation < 0.5 && weather.windspeed < 30;

  return (
    <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-2xl p-5 border border-sky-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">現在天氣</span>
        <span className="text-xs text-neutral-400">Open-Meteo</span>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{icon}</div>
        <div>
          <div className="text-3xl font-black text-neutral-900">{weather.temperature}°C</div>
          <div className="text-sm text-neutral-600 font-medium">{label}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-white/60 rounded-lg p-2">
          <div className="text-neutral-400">濕度</div>
          <div className="font-bold text-neutral-900">{weather.humidity}%</div>
        </div>
        <div className="bg-white/60 rounded-lg p-2">
          <div className="text-neutral-400">風速</div>
          <div className="font-bold text-neutral-900">{weather.windspeed} km/h</div>
        </div>
        <div className="bg-white/60 rounded-lg p-2">
          <div className="text-neutral-400">降雨</div>
          <div className="font-bold text-neutral-900">{weather.precipitation.toFixed(1)} mm</div>
        </div>
      </div>
      <div className={`mt-3 text-center text-sm font-semibold px-3 py-2 rounded-lg ${isPlayable ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
        {isPlayable ? '✅ 適合打球' : '⚠️ 建議改期或改室內場'}
      </div>
    </div>
  );
};

export default WeatherWidget;
