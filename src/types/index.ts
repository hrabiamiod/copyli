export interface Voivodeship {
  id: number;
  name: string;
  slug: string;
  lat: number;
  lon: number;
}

export interface City {
  id: number;
  name: string;
  slug: string;
  lat: number;
  lon: number;
  population: number;
  voivodeship_slug: string;
  voivodeship_name: string;
  seo_description?: string;
}

export interface Plant {
  id: number;
  slug: string;
  name_pl: string;
  name_latin: string;
  category: "tree" | "grass" | "weed";
  icon: string;
  color: string;
  description: string;
  threshold_low: number;
  threshold_medium: number;
  threshold_high: number;
  month_start: number;
  month_end: number;
  peak_months: string;
}

export type PollenLevel = "none" | "low" | "medium" | "high" | "very_high";

export interface PollenData {
  plant_slug: string;
  plant_name: string;
  name_latin: string;
  category: "tree" | "grass" | "weed";
  icon: string;
  color: string;
  concentration: number;
  level: PollenLevel;
  measured_at: string;
}

export interface ForecastData {
  forecast_date: string;
  plant_slug: string;
  plant_name: string;
  category: "tree" | "grass" | "weed";
  concentration: number;
  level: PollenLevel;
}

export interface WeatherData {
  temperature: number;
  wind_speed: number;
  precipitation: number;
  humidity: number;
  aqi: number;
  aqi_label: string;
  updated_at: string;
}

export interface WalkIndex {
  score: number;
  recommendation: string;
  best_time: string;
  reason: string;
}

export interface CityPageData {
  pollen: PollenData[];
  forecast: ForecastData[];
  weather: (WeatherData & WalkIndex) | null;
}

export interface MapData {
  voivodeship_slug: string;
  voivodeship_name: string;
  plant_slug: string;
  plant_name: string;
  category: string;
  avg_concentration: number;
  max_level: PollenLevel;
  cities_count: number;
}

export interface MetaData {
  updated_at: string;
  cities_count: number;
}
