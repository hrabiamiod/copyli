import type { City, Plant, PollenData } from "../types";
import { LEVEL_LABELS } from "./pollen";
import { buildCityTitle, buildCityDescription } from "./cityTitle";

export function getCityPageTitle(city: City, pollen: PollenData[]): string {
  return buildCityTitle(city.name, city.slug, pollen);
}

export function getCityPageDescription(city: City, pollen: PollenData[]): string {
  return buildCityDescription(city.name, city.voivodeship_name, pollen, LEVEL_LABELS);
}

export function getCityShareText(city: City, pollen: PollenData[]): string {
  const active = pollen.filter(p => p.level !== "none" && p.level !== "low");
  if (active.length > 0) {
    const parts = active.slice(0, 3).map(p => `${p.plant_name} (${LEVEL_LABELS[p.level].toLowerCase()})`).join(", ");
    return `Dziś w ${city.name}: ${parts}. Sprawdź pyłki w swoim mieście na CoPyli.pl`;
  }
  return `Aktualne stężenie pyłków w ${city.name} — sprawdź na CoPyli.pl`;
}

export function getVoivodeshipPageTitle(name: string): string {
  return `Pyłki w województwie ${name} — aktualna mapa pylenia | CoPyli.pl`;
}

export function getVoivodeshipPageDescription(name: string): string {
  return `Aktualne stężenie pyłków w województwie ${name}. Mapa pylenia, prognoza i dane dla wszystkich miast regionu. Informacje dla alergików aktualizowane co 2 godziny.`;
}

export function getStructuredDataCity(city: City, dateModified?: string): object {
  const now = dateModified ?? new Date().toISOString();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `https://copyli.pl/pylek/${city.slug}#webpage`,
        "name": `Pyłki w ${city.name}`,
        "description": city.seo_description,
        "url": `https://copyli.pl/pylek/${city.slug}`,
        "dateModified": now,
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
        "breadcrumb": { "@id": `https://copyli.pl/pylek/${city.slug}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://copyli.pl/pylek/${city.slug}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Strona główna", "item": "https://copyli.pl" },
          { "@type": "ListItem", "position": 2, "name": "Mapa pyłkowa", "item": "https://copyli.pl/pylek" },
          { "@type": "ListItem", "position": 3, "name": city.name, "item": `https://copyli.pl/pylek/${city.slug}` },
        ]
      }
    ]
  };
}

export function getStructuredDataVoivodeship(slug: string, name: string, cityCount: number): object {
  return {
    "@context": "https://schema.org",
    "@type": ["WebPage", "Dataset"],
    "name": `Pyłki w województwie ${name}`,
    "description": `Aktualne stężenia pyłków roślin w ${cityCount} miastach województwa ${name}. Dane aktualizowane co 2 godziny.`,
    "url": `https://copyli.pl/pylek/woj/${slug}`,
    "about": {
      "@type": "AdministrativeArea",
      "name": `Województwo ${name}`,
      "containedInPlace": {
        "@type": "Country",
        "name": "Polska",
        "sameAs": "https://www.wikidata.org/wiki/Q36",
      }
    },
    "creator": {
      "@type": "Organization",
      "name": "CoPyli.pl",
      "url": "https://copyli.pl",
    },
    "temporalCoverage": new Date().toISOString().split("T")[0],
    "spatialCoverage": {
      "@type": "AdministrativeArea",
      "name": `Województwo ${name}`,
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Strona główna", "item": "https://copyli.pl" },
        { "@type": "ListItem", "position": 2, "name": `Województwo ${name}`, "item": `https://copyli.pl/pylek/woj/${slug}` },
      ]
    }
  };
}

export function getStructuredDataPlant(plant: Plant): object {
  return {
    "@context": "https://schema.org",
    "@type": ["WebPage", "Article"],
    "name": `${plant.name_pl} — kiedy pyli, alergia i stężenie w Polsce`,
    "description": `Sezon pylenia ${plant.name_pl} (${plant.name_latin}) w Polsce. Aktualne stężenia w województwach, reaktywność krzyżowa i wskazówki dla alergików.`,
    "url": `https://copyli.pl/pylek/roslina/${plant.slug}`,
    "about": {
      "@type": "Thing",
      "name": plant.name_pl,
      "alternateName": plant.name_latin,
    },
    "publisher": {
      "@type": "Organization",
      "name": "CoPyli.pl",
      "url": "https://copyli.pl",
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Strona główna", "item": "https://copyli.pl" },
        { "@type": "ListItem", "position": 2, "name": "Kalendarz pylenia", "item": "https://copyli.pl/kalendarz-pylenia" },
        { "@type": "ListItem", "position": 3, "name": plant.name_pl, "item": `https://copyli.pl/pylek/roslina/${plant.slug}` },
      ],
    },
  };
}

export function getStructuredDataCalendar(year: number): object {
  return {
    "@context": "https://schema.org",
    "@type": ["WebPage", "Dataset"],
    "name": `Kalendarz pylenia roślin w Polsce ${year}`,
    "description": `Interaktywny kalendarz pylenia roślin w Polsce ${year}. Sezony pylenia drzew (brzoza, olcha, jesion), traw (tymotka, życica) i chwastów (ambrozja, bylica). Dane dla alergików.`,
    "url": "https://copyli.pl/kalendarz-pylenia",
    "temporalCoverage": `${year}`,
    "spatialCoverage": {
      "@type": "Country",
      "name": "Polska",
      "sameAs": "https://www.wikidata.org/wiki/Q36",
    },
    "creator": {
      "@type": "Organization",
      "name": "CoPyli.pl",
      "url": "https://copyli.pl",
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Strona główna", "item": "https://copyli.pl" },
        { "@type": "ListItem", "position": 2, "name": "Kalendarz pylenia", "item": "https://copyli.pl/kalendarz-pylenia" },
      ],
    },
  };
}

export function getStructuredDataHomepage(): object {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://copyli.pl/#website",
        "name": "CoPyli.pl",
        "url": "https://copyli.pl",
        "description": "Interaktywna mapa pyłkowa Polski — aktualne stężenia pyłków i prognoza dla alergików.",
        "inLanguage": "pl",
        "publisher": { "@id": "https://copyli.pl/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://copyli.pl/pylek/{search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://copyli.pl/#organization",
        "name": "CoPyli.pl",
        "url": "https://copyli.pl",
        "logo": {
          "@type": "ImageObject",
          "url": "https://copyli.pl/android-chrome-192x192.png",
          "width": 192,
          "height": 192,
        },
        "sameAs": [],
      },
    ],
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
          "text": "Dane pyłkowe pochodzą z Open-Meteo Air Quality API — bezpłatnej, dokładnej usługi pogodowej. Są aktualizowane co 2 godziny dla ponad 1000 polskich miast."
        }
      }
    ]
  };
}
