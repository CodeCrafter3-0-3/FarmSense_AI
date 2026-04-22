// Weather API Service — OpenWeatherMap + GPS
import * as Location from 'expo-location';
import { db, ref, set } from './firebase';

const BACKEND_URL = 'https://farm-sense-ai.onrender.com/api';
const API_AUTH_TOKEN = 'farmsense_secret_token_2026';

const iconMap: Record<string, string> = {
  '01d': 'weather-sunny',
  '01n': 'weather-night',
  '02d': 'weather-partly-cloudy',
  '02n': 'weather-night-partly-cloudy',
  '03d': 'weather-cloudy',
  '03n': 'weather-cloudy',
  '04d': 'weather-cloudy',
  '04n': 'weather-cloudy',
  '09d': 'weather-rainy',
  '09n': 'weather-rainy',
  '10d': 'weather-pouring',
  '10n': 'weather-pouring',
  '11d': 'weather-lightning',
  '11n': 'weather-lightning',
  '13d': 'weather-snowy',
  '13n': 'weather-snowy',
  '50d': 'weather-fog',
  '50n': 'weather-fog',
};

function getWeatherIcon(iconCode: string): string {
  const code = iconCode.replace(/[dn]$/, ''); // Strip d/n for generic icons if needed
  return iconMap[iconCode] || iconMap[code + 'd'] || 'weather-cloudy';
}

// ─────────────────────────────────────────────
// Get device GPS location
// ─────────────────────────────────────────────
export async function getDeviceLocation(): Promise<{ lat: number; lng: number } | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied, using default Punjab coordinates');
      return { lat: 30.7333, lng: 76.7794 }; // Chandigarh, Punjab
    }
    const location = await Location.getCurrentPositionAsync({});
    return { lat: location.coords.latitude, lng: location.coords.longitude };
  } catch {
    return { lat: 30.7333, lng: 76.7794 }; // Fallback
  }
}

// ─────────────────────────────────────────────
// Fetch current weather + forecast from Backend
// ─────────────────────────────────────────────
export async function fetchAndCacheWeather(locationKey: string = 'current', userId: string = 'user_001') {
  try {
    const coords = await getDeviceLocation();
    if (!coords) return null;

    const { lat, lng } = coords;

    const response = await fetch(`${BACKEND_URL}/weather/${lat}/${lng}?userId=${userId}`, {
      headers: {
        'x-api-token': API_AUTH_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error('Backend weather fetch failed');
    }

    const result = await response.json();
    if (!result.success) return null;

    const { current, hourly, daily } = result.data;

    // Transform backend icons to MaterialCommunityIcons names
    const transformedCurrent = {
      ...current,
      icon: getWeatherIcon(current.icon),
    };

    const transformedHourly = (hourly || []).map((item: any) => ({
      ...item,
      icon: getWeatherIcon(item.icon),
    }));

    const transformedDaily = (daily || []).map((item: any) => ({
      ...item,
      icon: getWeatherIcon(item.icon),
    }));

    // Cache in Firebase for cross-platform availability
    await set(ref(db, `weather/${locationKey}`), { 
      current: transformedCurrent, 
      hourly: transformedHourly, 
      daily: transformedDaily 
    });

    console.log('✅ Weather data synchronized via Backend');
    return { current: transformedCurrent, hourly: transformedHourly, daily: transformedDaily };
  } catch (error) {
    console.error('Weather sync error:', error);
    return null;
  }
}

// ─────────────────────────────────────────────
// Auto-refresh weather every 10 minutes
// ─────────────────────────────────────────────
let weatherInterval: ReturnType<typeof setInterval> | null = null;

export function startWeatherAutoRefresh(locationKey: string = 'current', intervalMs: number = 600000) {
  fetchAndCacheWeather(locationKey);
  weatherInterval = setInterval(() => fetchAndCacheWeather(locationKey), intervalMs);
}

export function stopWeatherAutoRefresh() {
  if (weatherInterval) {
    clearInterval(weatherInterval);
    weatherInterval = null;
  }
}
