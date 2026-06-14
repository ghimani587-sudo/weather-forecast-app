/**
 * Weather API client
 * Connects to the backend weather service
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  code: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  isDay: boolean;
  sunrise: string;
  sunset: string;
  hourly: { time: string; temp: number; code: number }[];
  daily: {
    date: string;
    max: number;
    min: number;
    code: number;
    precipitation: number;
  }[];
  aqi: number;
  aiSummary: string;
  outfit: string;
  travelScore: number;
  activity: string;
  healthAdvisory: string;
}

export async function fetchWeatherData(city: string): Promise<WeatherData> {
  const response = await fetch(
    `${API_BASE_URL}/api/weather?city=${encodeURIComponent(city)}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || `Failed to fetch weather data: ${response.statusText}`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch weather data");
  }

  return result.data;
}
