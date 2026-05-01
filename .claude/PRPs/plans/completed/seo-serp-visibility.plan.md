# Plan: SEO — Wyróżnienie wyniku wyszukiwania (SERP Visibility)

## Summary
Strony miast copyli.pl wyświetlają się w Google jako zwykły niebieski link. Celem jest uruchomienie rich snippets (breadcrumby, FAQ drops, emoji w opisach, freshness signal), które wizualnie wyróżniają wynik i zwiększają CTR. Wszystkie mechanizmy opierają się na Schema.org i meta tagach — żadnych zmian backendowych.

## User Story
As a alergik szukający „co pyli w Łodzi", I want to see current pollen levels directly in Google search results, so that I click copyli.pl immediately without comparing with other results.

## Problem → Solution
Obecny wynik: „Co teraz pyli w Łodzi? Brzoza, Trawy | CoPyli.pl" — niewyróżniony niebieskim linkiem z generycznym opisem.

Docelowy wynik:
```
CoPyli.pl › Łódzkie › Łódź
Co teraz pyli w Łodzi? Brzoza, Trawy | CoPyli.pl
🌿 Dziś: 🟢 Brzoza niskie · 🟡 Trawy średnie. Prognoza ↗ pią: Średnie...
▾ Co pyli dziś w Łodzi?      ▾ Kiedy jest sezon pyłkowy?
```
Rich snippet FAQ drops + emoji w opisie + breadcrumby inline.

## Metadata
- **Complexity**: Small
- **Source PRD**: N/A
- **PRD Phase**: N/A
- **Estimated Files**: 4 (`seo.ts`, `cityTitle.ts`, `prerender.ts`, `HomePage.tsx`)

---

## UX Design

### Before
```
[ copyli.pl/pylek/lodz ]
Co teraz pyli w Łodzi? Brzoza, Trawy | CoPyli.pl
Aktualne stężenie pyłków w Łódź (Łódzkie). Sprawdź co pyli,
prognozę 5-dniową i Indeks Spacerowy. Dane dla alergików...
```

### After
```
[ CoPyli.pl › Łódzkie › Łódź ]   ← breadcrumb wyróżniony
Co teraz pyli w Łodzi? Brzoza, Trawy | CoPyli.pl
🌿 Dziś w Łodzi: 🟢 Brzoza niskie · 🟢 Trawy niskie. Prognoza...
▾ Co pyli dziś w Łodzi?
▾ Kiedy jest sezon pyłkowy w Łodzi?
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Meta description | Generyczny tekst | Emoji + aktualne poziomy | Emoji w opisach SERP działa na mobile |
| BreadcrumbList | Zagnieżdżony w WebPage | Osobny element w `@graph` | Google częściej renderuje breadcrumb gdy osobny |
| FAQ drops | FAQPage istnieje w prerender.ts | Dodanie FAQ do runtime CityPage schema | Zapewnia FAQ w runtime też |
| Sitelinks Search Box | Brak | WebSite + SearchAction na homepage | Google może pokazać pole wyszukiwania |
| Organization | Brak | Organization schema na homepage | Knowledge Panel / trust signal |
| Freshness | Brak `dateModified` | `dateModified` = data pomiaru pyłków | Google pokazuje „30 kwi" dla świeżych stron |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `src/utils/seo.ts` | 1-59 | `getStructuredDataCity` — tu dodajemy `@graph` + `dateModified` |
| P0 | `src/utils/cityTitle.ts` | 1-39 | `buildCityDescription` — tu dodajemy emoji do opisu |
| P0 | `scripts/prerender.ts` | 96-220 | `injectMeta` + `faqStructuredData` — tu przekazujemy `updatedAt` |
| P1 | `src/pages/CityPage.tsx` | 66-82 | Wywołuje `getStructuredDataCity(city)` — sprawdź dostępność `data` |
| P1 | `src/pages/HomePage.tsx` | 120-130 | Wywołuje `getStructuredDataFAQ()` — tu dodamy `getStructuredDataHomepage()` |
| P1 | `src/components/SEOHead.tsx` | 1-72 | Sprawdź czy obsługuje `extraStructuredData` — potrzebny drugi `<script>` |

---

## Patterns to Mirror

### STRUCTURED_DATA_FUNCTION
```typescript
// SOURCE: src/utils/seo.ts:30-58
export function getStructuredDataCity(city: City): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    // ...
  };
}
// PATTERN: czysta funkcja zwracająca plain object, bez importów zewnętrznych
```

### META_DESCRIPTION_DYNAMIC
```typescript
// SOURCE: src/utils/cityTitle.ts:27-39
export function buildCityDescription(
  cityName: string,
  voivodeshipName: string,
  pollen: PollenEntry[],
  levelLabels: Record<string, string>,
): string {
  const high = pollen.filter(p => p.level === "high" || p.level === "very_high");
  if (high.length > 0) { ... }
  return `Aktualne stężenie pyłków w ${cityName}...`;
}
// PATTERN: funkcja czysto obliczeniowa, pollen filtrowany po level
```

### PRERENDER_EXTRA_SCHEMA
```typescript
// SOURCE: scripts/prerender.ts:108-111
const ldJson = [
  structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : "",
  extraStructuredData ? `<script type="application/ld+json">${JSON.stringify(extraStructuredData)}</script>` : "",
].join("");
// PATTERN: dwa osobne script tagi — structuredData i extraStructuredData
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `src/utils/cityTitle.ts` | UPDATE | Emoji 🟢🟡🔴 w `buildCityDescription` |
| `src/utils/seo.ts` | UPDATE | `getStructuredDataCity`: `@graph` + `dateModified` + osobny BreadcrumbList; nowa `getStructuredDataHomepage` |
| `src/components/SEOHead.tsx` | UPDATE | Dodaj prop `extraStructuredData?: object` i drugi `<script>` |
| `src/pages/HomePage.tsx` | UPDATE | Przekaż `getStructuredDataHomepage()` + `getStructuredDataFAQ()` jako extra |
| `src/pages/CityPage.tsx` | UPDATE | Przekaż `data.pollen[0]?.measured_at` do `getStructuredDataCity` |
| `scripts/prerender.ts` | UPDATE | Przekaż `updatedAt` do `getStructuredDataCity` (lub rebuild lokalnie) |

## NOT Building
- Generowanie dynamicznych OG images (`/og/cities/{slug}.png`) — oddzielny projekt
- Zmiany w `robots.txt` / `sitemap.xml` — już istnieją i są poprawne
- Integracja Google Search Console — poza scope kodu
- Płatne rich snippets (Review stars, Product schema) — nie mają zastosowania
- Tłumaczenia na inne języki

---

## Step-by-Step Tasks

### Task 1: Emoji w meta description — buildCityDescription
- **ACTION**: Dodaj mapę emoji poziomów i użyj w opisie w `src/utils/cityTitle.ts`
- **IMPLEMENT**:
```typescript
const LEVEL_EMOJI: Record<string, string> = {
  none: "",
  low: "🟢",
  medium: "🟡",
  high: "🔴",
  very_high: "🔴",
};

export function buildCityDescription(
  cityName: string,
  voivodeshipName: string,
  pollen: PollenEntry[],
  levelLabels: Record<string, string>,
): string {
  const active = pollen.filter(p => p.level !== "none").slice(0, 3);
  if (active.length > 0) {
    const parts = active
      .map(p => `${LEVEL_EMOJI[p.level]} ${p.plant_name} ${levelLabels[p.level]?.toLowerCase() ?? p.level}`)
      .join(" · ");
    return `🌿 Dziś w ${cityName}: ${parts}. Prognoza 5-dniowa i Indeks Spacerowy dla alergików.`;
  }
  return `🌿 Stężenie pyłków w ${cityName} (${voivodeshipName}) — niskie. Prognoza i Indeks Spacerowy. Dane co 2h.`;
}
```
- **MIRROR**: META_DESCRIPTION_DYNAMIC
- **IMPORTS**: Brak nowych importów
- **GOTCHA**: `buildCityDescription` jest wywoływana zarówno z `src/utils/seo.ts` (runtime) jak i `scripts/prerender.ts` (build-time) — zmiana działa automatycznie w obu miejscach. Google czasem usuwa emoji z desktopowych SERPs, ale zachowuje je na mobile.
- **VALIDATE**: `npx tsc --noEmit`; ręcznie: `buildCityDescription("Łódź","Łódzkie",[{level:"low",plant_name:"Brzoza"}],{low:"Niskie"})` → zawiera "🟢 Brzoza niskie"

### Task 2: @graph z BreadcrumbList + dateModified w getStructuredDataCity
- **ACTION**: Przepisz `getStructuredDataCity` w `src/utils/seo.ts` na `@graph`
- **IMPLEMENT**:
```typescript
export function getStructuredDataCity(city: City, dateModified?: string): object {
  const modified = dateModified ?? new Date().toISOString();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `https://copyli.pl/pylek/${city.slug}#webpage`,
        "name": `Pyłki w ${city.name}`,
        "description": city.seo_description,
        "url": `https://copyli.pl/pylek/${city.slug}`,
        "dateModified": modified,
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
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Strona główna", "item": "https://copyli.pl" },
          { "@type": "ListItem", "position": 2, "name": city.voivodeship_name, "item": `https://copyli.pl/pylek/woj/${city.voivodeship_slug}` },
          { "@type": "ListItem", "position": 3, "name": city.name, "item": `https://copyli.pl/pylek/${city.slug}` },
        ]
      }
    ]
  };
}
```
- **MIRROR**: STRUCTURED_DATA_FUNCTION
- **IMPORTS**: `City` już importowany — sprawdź czy ma pole `voivodeship_slug` (w prerender.ts jest, w `src/types.ts` — verify)
- **GOTCHA**: Sygnatura `(city, dateModified?)` — opcjonalny param, więc `getStructuredDataCity(city)` w `CityPage.tsx` nadal działa bez zmian. Zmiana `@type: WebPage` → `@graph` jest semantycznie równoważna.
- **VALIDATE**: Wklej output do https://validator.schema.org — oczekuj 0 błędów

### Task 3: getStructuredDataHomepage — WebSite + Organization + SearchAction
- **ACTION**: Dodaj nową funkcję `getStructuredDataHomepage` na końcu `src/utils/seo.ts`
- **IMPLEMENT**:
```typescript
export function getStructuredDataHomepage(): object {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://copyli.pl/#organization",
        "name": "CoPyli.pl",
        "url": "https://copyli.pl",
        "logo": {
          "@type": "ImageObject",
          "url": "https://copyli.pl/og-default.png",
        },
        "description": "Interaktywna mapa pyłkowa Polski — aktualne stężenia pyłków dla ponad 1000 miast.",
        "areaServed": { "@type": "Country", "name": "Polska" }
      },
      {
        "@type": "WebSite",
        "@id": "https://copyli.pl/#website",
        "name": "CoPyli.pl",
        "url": "https://copyli.pl",
        "publisher": { "@id": "https://copyli.pl/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://copyli.pl/pylek/{search_term_string}",
          },
          "query-input": "required name=search_term_string",
        }
      }
    ]
  };
}
```
- **MIRROR**: STRUCTURED_DATA_FUNCTION
- **IMPORTS**: Brak nowych importów
- **GOTCHA**: `urlTemplate` musi pasować do rzeczywistych slugów miast (`/pylek/warszawa`, `/pylek/lodz`). Google nie gwarantuje aktywacji Sitelinks Search Box — sam deploy schematu jest konieczny ale niewystarczający.
- **VALIDATE**: `npx tsc --noEmit`

### Task 4: Dodaj extraStructuredData prop do SEOHead
- **ACTION**: Rozszerz interfejs `SEOHeadProps` w `src/components/SEOHead.tsx`
- **IMPLEMENT**:
```typescript
interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  structuredData?: object;
  extraStructuredData?: object;   // ← nowe
  ogImage?: string;
}

// W useEffect, po istniejącym bloku structured data:
if (extraStructuredData) {
  let sdEl2 = document.getElementById("structured-data-extra") as HTMLScriptElement | null;
  if (!sdEl2) {
    sdEl2 = document.createElement("script");
    sdEl2.id = "structured-data-extra";
    sdEl2.type = "application/ld+json";
    document.head.appendChild(sdEl2);
  }
  sdEl2.textContent = JSON.stringify(extraStructuredData);
}
```
- **MIRROR**: PRERENDER_EXTRA_SCHEMA
- **IMPORTS**: Brak nowych importów
- **GOTCHA**: Dodaj `extraStructuredData` do dependency array `useEffect`: `[title, description, canonical, structuredData, extraStructuredData, image]`
- **VALIDATE**: Na homepage — DevTools → `document.querySelectorAll('script[type="application/ld+json"]').length` === 2

### Task 5: Użyj nowych schematów w HomePage.tsx
- **ACTION**: Zaimportuj `getStructuredDataHomepage` i przekaż do SEOHead
- **IMPLEMENT**:
```tsx
// Zmień import:
import { getStructuredDataFAQ, getStructuredDataHomepage } from "../utils/seo";

// W SEOHead:
<SEOHead
  title="CoPyli.pl — Interaktywna mapa pyłkowa Polski dla alergików"
  description="Aktualne stężenie pyłków w Polsce..."
  canonical="https://copyli.pl"
  structuredData={getStructuredDataFAQ()}
  extraStructuredData={getStructuredDataHomepage()}
/>
```
- **MIRROR**: Wzorzec przekazywania props z `src/pages/CityPage.tsx:76-82`
- **IMPORTS**: `getStructuredDataHomepage` z `../utils/seo`
- **GOTCHA**: `structuredData` zostawia FAQPage (ważne dla rich results FAQ), `extraStructuredData` dodaje WebSite+Org
- **VALIDATE**: `npx tsc --noEmit`; DevTools na `/` — 2× `<script type="application/ld+json">`

### Task 6: Przekaż dateModified do getStructuredDataCity w CityPage.tsx
- **ACTION**: W `src/pages/CityPage.tsx` dodaj `measured_at` do wywołania schema
- **IMPLEMENT**:
```tsx
// Linia ~80 — zmień:
structuredData={getStructuredDataCity(city)}
// na:
structuredData={getStructuredDataCity(city, data.pollen[0]?.measured_at)}
```
- **MIRROR**: `src/pages/CityPage.tsx:66-82` — `data` jest dostępne w tym miejscu renderowania (guard `if (!city || !data) return` jest wcześniej)
- **IMPORTS**: Brak nowych importów — `getStructuredDataCity` już importowany
- **GOTCHA**: `data.pollen[0]?.measured_at` może być `undefined` (gdy brak danych) — parametr jest opcjonalny, domyślnie `new Date().toISOString()`
- **VALIDATE**: DevTools na `/pylek/lodz` → wyszukaj `dateModified` w source — powinna być data z danych pyłkowych

### Task 7: Przekaż updatedAt w prerender.ts
- **ACTION**: W `scripts/prerender.ts` przekaż `updatedAt` do struktury danych miasta
- **IMPLEMENT**:
```typescript
// Znajdź w generateCityPageAsync (linia ~164+) wywołanie injectMeta
// Przed injectMeta dodaj:
const updatedAt = cityData?.pollen?.[0]?.measured_at ?? new Date().toISOString();

// W wywołaniu injectMeta, zmień structuredData:
structuredData: {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      // ... istniejące pola ...
      "dateModified": updatedAt,
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Strona główna", "item": "https://copyli.pl" },
        { "@type": "ListItem", "position": 2, "name": city.voivodeship_name, "item": `https://copyli.pl/pylek/woj/${city.voivodeship_slug}` },
        { "@type": "ListItem", "position": 3, "name": city.name, "item": `https://copyli.pl/pylek/${city.slug}` },
      ]
    }
  ]
},
```
ALTERNATYWNIE: zaimportuj `getStructuredDataCity` z `../src/utils/seo` w prerender.ts i użyj jej bezpośrednio (eliminuje duplikację). Wymaga sprawdzenia że typy City są kompatybilne.
- **MIRROR**: PRERENDER_EXTRA_SCHEMA
- **GOTCHA**: `prerender.ts` ma lokalną implementację structured data (nie importuje z seo.ts). Obie opcje są poprawne; import z seo.ts jest czystszy ale wymaga weryfikacji typów.
- **VALIDATE**: `grep "dateModified" dist/pylek/lodz/index.html` → zwraca linię z datą ISO

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| `buildCityDescription` z active pollen | `[{level:"low",plant_name:"Brzoza"}]` | zawiera `"🟢 Brzoza niskie"` | N |
| `buildCityDescription` brak pollen | `[]` | zawiera `"🌿 Stężenie pyłków"` + `"niskie"` | N |
| `buildCityDescription` very_high pollen | `[{level:"very_high",plant_name:"Brzoza"}]` | zawiera `"🔴"` | Y |
| `getStructuredDataCity` z `dateModified` | `city, "2026-04-30T15:00:00Z"` | `@graph[0].dateModified == "2026-04-30T..."` | N |
| `getStructuredDataCity` bez `dateModified` | `city` | `@graph[0].dateModified` istnieje (domyślne) | Y |

### Edge Cases Checklist
- [ ] Miasto bez danych pyłkowych (`pollen = []`) → generyczny opis bez emoji poziomów
- [ ] Pollen z `level="none"` → nie pojawia się w opisie (filtr `!= "none"`)
- [ ] Więcej niż 3 aktywne alergeny → `.slice(0,3)` skraca do 3

---

## Validation Commands

### Static Analysis
```bash
npx tsc --noEmit
```
EXPECT: Zero błędów typów

### Build + Prerender
```bash
npm run build && npm run prerender
```
EXPECT: Generacja `dist/` bez błędów

### Sprawdź wygenerowany HTML
```bash
grep "dateModified" dist/pylek/lodz/index.html
grep "🌿" dist/pylek/lodz/index.html
grep "BreadcrumbList" dist/pylek/lodz/index.html
```
EXPECT: Każde grep zwraca trafienie

### Manual Validation
- [ ] `dist/pylek/lodz/index.html` zawiera `@graph` z `dateModified` w ISO 8601
- [ ] Meta description strony Łódź zaczyna się od `🌿`
- [ ] Homepage ma dwa `<script type="application/ld+json">`
- [ ] Po deployu: https://search.google.com/test/rich-results?url=https://copyli.pl/pylek/lodz → Breadcrumbs ✅, FAQ ✅

---

## Acceptance Criteria
- [ ] Meta description stron miast zawiera emoji poziomu (🟢/🟡/🔴) + aktualne rośliny
- [ ] `getStructuredDataCity` zwraca `@graph` z osobnym BreadcrumbList i `dateModified`
- [ ] Homepage ma WebSite + SearchAction + Organization w structured data
- [ ] `npx tsc --noEmit` — zero błędów
- [ ] `npm run build && npm run prerender` — sukces bez błędów

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Google ignoruje emoji w opisach | Średnie | Niski | Dopuszczalna technika — nie powoduje kary |
| Sitelinks Search Box się nie aktywuje | Wysokie | Niski | Schema jest warunkiem koniecznym ale niewystarczającym |
| `@graph` zamiast `@type: WebPage` zmienia Rich Results | Niskie | Średni | Waliduj schema.org/validator przed pushem |
| Import `seo.ts` w `prerender.ts` — niezgodność typów | Niskie | Niski | `seo.ts` to pure TypeScript bez browser APIs |

## Notes
- Emoji w meta descriptions to legalna technika — Google zachowuje je szczególnie na mobile SERP.
- `dateModified` przy danych co 2h to silny freshness signal — Google może pokazać timestamp przy wyniku.
- BreadcrumbList jako osobny element w `@graph` (nie zagnieżdżony w WebPage) jest oficjalną rekomendacją Google od 2023.
- Sitelinks Search Box wymaga authority — deploy schematu jest pierwszym krokiem.
