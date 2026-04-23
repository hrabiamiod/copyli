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

export function buildCityDescription(
  cityName: string,
  voivodeshipName: string,
  pollen: PollenEntry[],
  levelLabels: Record<string, string>,
): string {
  const high = pollen.filter(p => p.level === "high" || p.level === "very_high");
  if (high.length > 0) {
    const names = high.map(p => `${p.plant_name} (${levelLabels[p.level]?.toLowerCase() ?? p.level})`).join(", ");
    return `Aktualne stężenie pyłków w ${cityName}. Dziś: ${names}. Prognoza 5-dniowa, Indeks Spacerowy i kalendarz pylenia.`;
  }
  return `Aktualne stężenie pyłków w ${cityName} (${voivodeshipName}). Sprawdź co pyli, prognozę 5-dniową i Indeks Spacerowy. Dane dla alergików aktualizowane co 2 godziny.`;
}
