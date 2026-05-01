import { CITY_LOCATIVE } from "./cityLocative";

interface PollenEntry {
  level: string;
  plant_name: string;
}

export function buildCityTitle(cityName: string, citySlug: string, pollen: PollenEntry[]): string {
  const activePollen = pollen.filter(p => p.level !== "none").slice(0, 2);
  const locative = CITY_LOCATIVE[citySlug];

  if (locative) {
    if (activePollen.length > 0) {
      const names = activePollen.map(p => p.plant_name).join(", ");
      return `Co teraz pyli w ${locative}? ${names} | CoPyli.pl`;
    }
    return `Co teraz pyli w ${locative}? Sprawdź stężenie pyłków | CoPyli.pl`;
  }

  if (activePollen.length > 0) {
    const names = activePollen.map(p => p.plant_name).join(", ");
    return `Pyłki w ${cityName} — ${names} | CoPyli.pl`;
  }
  return `Stężenie pyłków w ${cityName} dziś — aktualne dane | CoPyli.pl`;
}

const LEVEL_EMOJI: Record<string, string> = {
  none: "", low: "🟢", medium: "🟡", high: "🔴", very_high: "🔴",
};

export function buildCityDescription(
  cityName: string,
  voivodeshipName: string,
  pollen: PollenEntry[],
  levelLabels: Record<string, string>,
  citySlug?: string,
): string {
  const locative = (citySlug && CITY_LOCATIVE[citySlug]) ?? cityName;
  const active = pollen.filter(p => p.level !== "none").slice(0, 3);
  if (active.length > 0) {
    const parts = active
      .map(p => `${LEVEL_EMOJI[p.level] ?? ""} ${p.plant_name} ${levelLabels[p.level]?.toLowerCase() ?? p.level}`.trim())
      .join(" · ");
    return `🌿 Dziś w ${locative}: ${parts}. Prognoza 5-dniowa i Indeks Spacerowy dla alergików.`;
  }
  return `🌿 Stężenie pyłków w ${locative} (${voivodeshipName}) — niskie. Prognoza i Indeks Spacerowy. Dane co 2h.`;
}
