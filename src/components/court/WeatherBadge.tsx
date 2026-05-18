import type { CourtWeather } from '../../hooks/useCourtsWeather';

interface Props {
  lat: number;
  lng: number;
  weather: CourtWeather | undefined;
}

function pickIcon(w: CourtWeather): { emoji: string; label: string; tone: 'rain' | 'cloudy' | 'clear' } {
  if (w.isRaining) return { emoji: '🌧', label: '雨中', tone: 'rain' };
  if (w.nextRainHours !== null && w.nextRainHours <= 3) return { emoji: '🌦', label: `${w.nextRainHours}h 後雨`, tone: 'rain' };
  if (w.weatherCode >= 2) return { emoji: '☁', label: '多雲', tone: 'cloudy' };
  return { emoji: '☀', label: '晴', tone: 'clear' };
}

export default function WeatherBadge({ weather }: Props) {
  if (!weather) {
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-50 text-neutral-400 border border-neutral-200/60">
        天氣…
      </span>
    );
  }
  const { emoji, label, tone } = pickIcon(weather);
  const toneClass = tone === 'rain'
    ? 'bg-sky-50 text-sky-700 border-sky-200/60'
    : tone === 'cloudy'
      ? 'bg-neutral-100 text-neutral-700 border-neutral-200/60'
      : 'bg-amber-50 text-amber-700 border-amber-200/60';
  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full border ${toneClass} inline-flex items-center gap-1`}
      title={`目前 ${Math.round(weather.temp)}°C · 未來 6 小時最高降雨機率 ${weather.rainChanceNext6h}%`}
    >
      <span aria-hidden>{emoji}</span>
      <span>{Math.round(weather.temp)}°C</span>
      <span className="opacity-70">·</span>
      <span>{label}</span>
    </span>
  );
}
