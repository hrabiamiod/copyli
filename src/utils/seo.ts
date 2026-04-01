import type { City, PollenData } from "../types";
import { LEVEL_LABELS } from "./pollen";

export function getCityPageTitle(city: City, pollen: PollenData[]): string {
  const topPollen = pollen.filter(p => p.level !== "none").slice(0, 2);
  if (topPollen.length > 0) {
    const names = topPollen.map(p => p.plant_name).join(", ");
    return `Pyłki w ${city.name} — ${names} | CoPyli.pl`;
  }
  return `Stężenie pyłków w ${city.name} dziś — aktualne dane | CoPyli.pl`;
}

export function getCityPageDescription(city: City, pollen: PollenData[]): string {
  const high = pollen.filter(p => p.level === "high" || p.level === "very_high");
  if (high.length > 0) {
    const names = high.map(p => `${p.plant_name} (${LEVEL_LABELS[p.level].toLowerCase()})`).join(", ");
    return `Aktualne stężenie pyłków w ${city.name}. Dziś: ${names}. Prognoza 5-dniowa, Indeks Spacerowy i kalendarz pylenia dla alergików.`;
  }
  return `Aktualne stężenie pyłków w ${city.name} (${city.voivodeship_name}). Sprawdź co pyli, prognozę 5-dniową i Indeks Spacerowy. Dane dla alergików aktualizowane co 2 godziny.`;
}

export function getVoivodeshipPageTitle(name: string): string {
  return `Pyłki w województwie ${name} — aktualna mapa pylenia | CoPyli.pl`;
}

export function getVoivodeshipPageDescription(name: string): string {
  return `Aktualne stężenie pyłków w województwie ${name}. Mapa pylenia, prognoza i dane dla wszystkich miast regionu. Informacje dla alergików aktualizowane co 2 godziny.`;
}

export function getStructuredDataCity(city: City): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Pyłki w ${city.name}`,
    "description": city.seo_description,
    "url": `https://copyli.pl/pylek/${city.slug}`,
    "about": {
      "@type": "Place",
      "name": city.name,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": city.lat,
        "longitude": city.lon,
      },
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": city.voivodeship_name,
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Strona główna", "item": "https://copyli.pl" },
        { "@type": "ListItem", "position": 2, "name": "Mapa pyłkowa", "item": "https://copyli.pl/pylek" },
        { "@type": "ListItem", "position": 3, "name": city.name, "item": `https://copyli.pl/pylek/${city.slug}` },
      ]
    }
  };
}

export function getStructuredDataFAQ(): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Co to jest stężenie pyłków?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Stężenie pyłków to liczba ziaren pyłku roślin w jednym metrze sześciennym powietrza. Mierzone jest w ziarnach/m³. Wysokie stężenie może powodować objawy alergii u uczulonych osób."
        }
      },
      {
        "@type": "Question",
        "name": "Kiedy jest sezon pylenia brzozy w Polsce?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Brzoza pyli w Polsce głównie w kwietniu i maju. To jeden z najsilniejszych alergenów — uczula około 20% alergików."
        }
      },
      {
        "@type": "Question",
        "name": "Co to jest Indeks Spacerowy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Indeks Spacerowy to unikalny wskaźnik CoPyli.pl łączący aktualne stężenie pyłków z warunkami pogodowymi (deszcz, wiatr). Podpowiada alergikowi, kiedy najlepiej wyjść z domu i na co uważać."
        }
      },
      {
        "@type": "Question",
        "name": "Skąd pochodzą dane pyłkowe na CoPyli.pl?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dane pyłkowe pochodzą z Open-Meteo Air Quality API — bezpłatnej, dokładnej usługi pogodowej. Są aktualizowane co 2 godziny dla 954 polskich miast."
        }
      }
    ]
  };
}
