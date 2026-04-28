import type { PollenLevel, MapData } from "../types";

export const LEVEL_LABELS: Record<PollenLevel, string> = {
  none: "Brak",
  low: "Niskie",
  medium: "Średnie",
  high: "Wysokie",
  very_high: "Bardzo wysokie",
};

export const LEVEL_COLORS: Record<PollenLevel, string> = {
  none: "#E8F5E9",
  low: "#A5D6A7",
  medium: "#FFF176",
  high: "#FFB74D",
  very_high: "#EF5350",
};

export const LEVEL_BG: Record<PollenLevel, string> = {
  none: "bg-green-50 text-green-800",
  low: "bg-green-200 text-green-900",
  medium: "bg-yellow-200 text-yellow-900",
  high: "bg-orange-300 text-orange-900",
  very_high: "bg-red-400 text-white",
};

export const CATEGORY_LABELS: Record<string, string> = {
  tree: "Drzewa",
  grass: "Trawy",
  weed: "Chwasty",
};

export const CATEGORY_ICONS: Record<string, string> = {
  tree: "🌳",
  grass: "🌾",
  weed: "🌿",
};

// Zwraca dominujący poziom pylenia dla województwa
export function getVoivodeshipLevel(mapData: MapData[], voivSlug: string): PollenLevel {
  const rows = mapData.filter(d => d.voivodeship_slug === voivSlug);
  if (rows.length === 0) return "none";

  const order: PollenLevel[] = ["none", "low", "medium", "high", "very_high"];
  let max: PollenLevel = "none";
  for (const row of rows) {
    if (order.indexOf(row.max_level) > order.indexOf(max)) {
      max = row.max_level;
    }
  }
  return max;
}

// Osobna paleta dla nakładek mapy — mocniej nasycona niż LEVEL_COLORS używana w UI
export const LEVEL_MAP_COLORS: Record<PollenLevel, string> = {
  none:      "rgba(180,210,180,0.22)",
  low:       "rgba(34,197,94,0.42)",
  medium:    "rgba(234,179,8,0.52)",
  high:      "rgba(234,88,12,0.60)",
  very_high: "rgba(185,28,28,0.66)",
};

// Zwraca kolor wypełnienia województwa dla mapy
export function getVoivodeshipFillColor(level: PollenLevel): string {
  return LEVEL_MAP_COLORS[level];
}

// Formatuje datę po polsku
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pl-PL", { weekday: "short", month: "short", day: "numeric" });
}

// Zwraca skróconą nazwę dnia tygodnia
export function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];
  return days[date.getDay()];
}

// Sprawdza czy roślina jest aktualnie w sezonie pylenia
export function isInSeason(monthStart: number, monthEnd: number): boolean {
  const month = new Date().getMonth() + 1;
  if (monthStart <= monthEnd) return month >= monthStart && month <= monthEnd;
  return month >= monthStart || month <= monthEnd; // np. grudzień-luty
}
