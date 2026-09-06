/**
 * WMO weather codes (Open-Meteo) that mean precipitation is falling —
 * drizzle, rain, freezing rain, snow, showers and thunderstorms.
 * Fog (45/48) and cloud cover (0–3) are dry and therefore excluded.
 *
 * Shared by the court list's weather hook and the court detail weather card
 * so both agree on what counts as "unplayable outdoors".
 */
const WET_CODES = new Set([
  51, 53, 55, 56, 57,          // drizzle / freezing drizzle
  61, 63, 65, 66, 67,          // rain / freezing rain
  71, 73, 75, 77,              // snow / snow grains
  80, 81, 82,                  // rain showers
  85, 86,                      // snow showers
  95, 96, 99,                  // thunderstorm
]);

export function isWetCode(code: number): boolean {
  return WET_CODES.has(code);
}
