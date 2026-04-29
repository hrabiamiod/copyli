# Plan: Rozwój CoPyli.pl — SEO, treści, nowe funkcje (2026 Q2)

## Summary
Plan kolejnych etapów rozwoju copyli.pl z priorytetem na wzmocnienie pozycji SEO i dostarczenie wartościowych funkcji użytkownikom. Projekt ma silne fundamenty (1021 stron miast, 16 województw, prerender, OG images), ale brakuje treści wokół roślin, FAQ per miasto, structured data dla roślin i contentu blogowego. SEO to główna dźwignia wzrostu ruchu organicznego.

## Stan aktualny i luki (DIAGNOSTYKA)

### Co działa dobrze
- 1021 prerendered stron miast z OG images 1200×630px ✅
- 16 stron województw z opisami regionalnymi ✅
- Strony roślin (PlantPage) dla 6 roślin z pełnymi opisami, 9 roślin bez treści ✅/❌
- Structured data: WebPage+GeoCoordinates na stronach miast, FAQPage na głównej, Dataset na województwach ✅
- sitemap.xml: 1021+16+15+2 = 1054 URL-i ✅
- ComparePage, DiaryPage, CalendarPage ✅

### Krytyczne luki SEO
1. **PlantPage — 9 roślin bez opisów** (`ash`, `oak`, `poplar`, `pine`, `plane`, `ryegrass`, `timothy`, `nettle`, `plantain`) — strony istnieją w sitemapie ale są cienkimi stronami bez treści tekstowej
2. **PlantPage — brak structured data** — `SEOHead` wywoływany bez `structuredData` prop w `src/pages/PlantPage.tsx:141` — Google nie widzi `Article`/`WebPage` z kontekstem botanicznym
3. **ComparePage — nie jest prerendered** — boty Google widzą pusty HTML, `/porownaj/warszawa/krakow` to potencjalny ruch na frazy lokalne bez pokrycia
4. **Brak treści blogowej / poradnikowej** — frazy "alergia pyłkowa leczenie", "sezon pyłkowy 2026", "co pyli w maju" bez pokrycia
5. **Brak FAQ per miasto** — FAQ ogólne tylko na stronie głównej; fraza "kiedy pyli brzoza w Warszawie" nie ma dedykowanej odpowiedzi na stronie Warszawy

### Co można zmodyfikować
- `PlantPage.tsx`: `PLANT_INFO` i `CROSS` hardkodowane w komponencie — wydzielić do `src/utils/plant-info.ts` dla łatwiejszego rozszerzania
- `CalendarPage.tsx`: brak structured data i breadcrumbs — strata linkjuice SEO
- `HomePage.tsx:71-74`: `setInterval(2000)` polling showcase mode — zbędny na produkcji, `StorageEvent` wystarczy

### Co usunąć
- **Showcase mode polling** — `setInterval` co 2s w `src/pages/HomePage.tsx:71-74`; zastąpić samym `StorageEvent` (który już jest w tym samym useEffect)

---

## PRIORYTETY — 4 Etapy

---

## Etap A: SEO Quick Wins (największy ROI, mały nakład)

### A.1 — Treści dla 9 brakujących roślin + structured data PlantPage

**Cel:** Uzupełnić `PLANT_INFO` i `CROSS` dla wszystkich 15 roślin + dodać `getStructuredDataPlant()` do seo.ts.

**Rośliny do uzupełnienia** (6 już ma opisy: birch, alder, hazel, grass, ragweed, mugwort):
- `ash` (Jesion) — kwiecień, reaktywność krzyżowa z oliwką, często mylony z brzozą
- `oak` (Dąb) — maj, nakłada się z sezonem brzozy, silny alergen
- `poplar` (Topola) — marzec-maj, puch NIE jest alergenem — edukacyjna pułapka!
- `pine` (Sosna) — mało alergenna ale masowy pyłek (edukacyjne)
- `plane` (Platan) — alergen miejski w parkach
- `ryegrass` (Życica) — najsilniejszy alergen trawiany
- `timothy` (Tymotka) — dominujący w Polsce latem
- `nettle` (Pokrzywa) — niedoceniana, maj–wrzesień
- `plantain` (Babka) — maj–wrzesień, często współwystępuje z trawami

**Structured data dla PlantPage — wzorzec:**
```typescript
// Dodać do src/utils/seo.ts
export function getStructuredDataPlant(plant: Plant): object {
  return {
    "@context": "https://schema.org",
    "@type": ["WebPage", "Article"],
    "name": `${plant.name_pl} — kiedy pyli, alergia i stężenie w Polsce`,
    "description": `Sezon pylenia ${plant.name_pl} (${plant.name_latin}) w Polsce.`,
    "url": `https://copyli.pl/pylek/roslina/${plant.slug}`,
    "about": { "@type": "Thing", "name": plant.name_pl },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Strona główna", "item": "https://copyli.pl" },
        { "@type": "ListItem", "position": 2, "name": "Kalendarz pylenia", "item": "https://copyli.pl/kalendarz-pylenia" },
        { "@type": "ListItem", "position": 3, "name": plant.name_pl, "item": `https://copyli.pl/pylek/roslina/${plant.slug}` },
      ]
    }
  };
}
```

**Pliki do zmiany:**
| Plik | Akcja |
|---|---|
| `src/utils/plant-info.ts` | NOWY — wydziel PLANT_INFO i CROSS z PlantPage |
| `src/utils/seo.ts` | DODAJ `getStructuredDataPlant(plant: Plant)` |
| `src/pages/PlantPage.tsx` | ZMIEŃ import PLANT_INFO/CROSS; dodaj structuredData prop do SEOHead |

**Walidacja:** `npx tsc -b --force && npm test`

---

### A.2 — FAQ per miasto na CityPage

**Cel:** Każda strona miasta dostaje sekcję FAQ z 3-4 dynamicznymi pytaniami. Daje Google `FAQPage` structured data z lokalnymi frazami kluczowymi.

**Logika FAQ (dynamiczna, bez fetch — tylko z już załadowanych danych):**
```typescript
// Q: "Co pyli dziś w [mieście]?"
// A: "Dziś w [mieście] pylą: [roślina] ([poziom])..." lub "Stężenie pyłków jest niskie."
// Q: "Kiedy jest sezon pylenia w [mieście]?"
// A: "Sezon pyłkowy w [mieście] trwa od lutego (olcha, leszczyna) do października (ambrozja)."
// Q: "Czy warto wyjść na spacer w [mieście] dziś?"
// A: (gdy walk score istnieje) "Indeks Spacerowy dla [miasto] wynosi X/100. [recommendation]."
```

**Funkcja do dodania w seo.ts:**
```typescript
export function getStructuredDataCityFAQ(city: City, pollen: PollenData[], walkScore?: number): object {
  const active = pollen.filter(p => p.level !== "none");
  // ... buduje FAQPage z 3 pytaniami
}
```

**Sekcja FAQ w CityPage** — dodać pod HistoryChart, przed mini mapą.

**Prerender** — `scripts/prerender.ts` musi wstrzyknąć FAQ HTML (tylko tekst, bez React) do prerendered output dla botów.

**Pliki do zmiany:**
| Plik | Akcja |
|---|---|
| `src/utils/seo.ts` | DODAJ `getStructuredDataCityFAQ(city, pollen, walkScore?)` |
| `src/pages/CityPage.tsx` | DODAJ sekcję FAQ + structured data prop |
| `scripts/prerender.ts` | DODAJ FAQ HTML do prerendered output |

**SEO impact:** 1021 unikalnych stron z `FAQPage` structured data → potencjalne rich snippets.

---

### A.3 — Structured data i breadcrumbs dla CalendarPage

**Cel:** `/kalendarz-pylenia` rankuje na "kalendarz pylenia polska 2026" — wzmocnić structured data.

**Dodać:**
- `"@type": "Dataset"` z temporalCoverage na bieżący rok
- `BreadcrumbList`
- Tytuł z rokiem: `Kalendarz pylenia w Polsce 2026 — kiedy co pyli | CoPyli.pl`

**Pliki do zmiany:**
| Plik | Akcja |
|---|---|
| `src/utils/seo.ts` | DODAJ `getStructuredDataCalendar(year: number)` |
| `src/pages/CalendarPage.tsx` | DODAJ structured data + breadcrumb nav |

---

### A.4 — Usuń showcase polling z HomePage

**Akcja:** `src/pages/HomePage.tsx:71-74` — usunąć `setInterval`. `StorageEvent` w linii 66-68 już obsługuje zmiany z innych kart. Dla tej samej karty admin po zmianie odświeży stronę.

```tsx
// PRZED:
const iv = setInterval(() => {
  setShowcaseMode(localStorage.getItem("copyli_showcase") === "1");
}, 2000);
return () => { window.removeEventListener("storage", onStorage); clearInterval(iv); };

// PO:
return () => window.removeEventListener("storage", onStorage);
```

---

## Etap B: Treści i linkowanie wewnętrzne

### B.1 — Artykuły / Poradniki SEO (statyczne strony poradnikowe)

**Cel:** 4 statycznych stron poradnikowych rankujących na frazy edukacyjne. Nie CMS — czyste TSX z wbudowaną treścią.

**Proponowane artykuły:**
| URL | H1 / Fraza kluczowa | SEO Impact |
|---|---|---|
| `/porady/alergia-na-pylek` | Alergia na pyłki — objawy, leczenie, co robić | Bardzo wysoki |
| `/porady/sezon-pylkowy-2026` | Sezon pyłkowy 2026 — kiedy zaczyna się i ile trwa | Wysoki |
| `/porady/reaktywnosc-krzyzowa` | Reaktywność krzyżowa pyłków — pełna lista | Wysoki |
| `/porady/co-pyli-w-maju` | Co pyli w Polsce w maju? | Średni |

**Implementacja:**
- `src/pages/advice/` — nowy folder z plikami TSX
- `Article` structured data z datą, autorem "Zespół CoPyli.pl"
- Linki wewnętrzne do roślin (`/pylek/roslina/brzoza`) i miast
- Dodać do sitemap.xml z priority `0.7`, changefreq `yearly`
- Prerender w `scripts/prerender.ts`

**Pliki do zmiany:**
| Plik | Akcja |
|---|---|
| `src/pages/advice/AllergyGuidePage.tsx` | NOWY |
| `src/pages/advice/Season2026Page.tsx` | NOWY |
| `src/pages/advice/CrossReactivityPage.tsx` | NOWY |
| `src/App.tsx` | DODAJ routes `/porady/:artykul` |
| `scripts/generate-sitemap.ts` | DODAJ /porady/ URLs |
| `scripts/prerender.ts` | DODAJ prerender dla /porady/ stron |

---

### B.2 — Linkowanie wewnętrzne: sekcja "Porównaj z" na CityPage

**Cel:** Każda strona miasta dostaje 3 linki do porównania z sąsiednimi miastami → Google crawler przemierza sieć stron, budując wewnętrzny PageRank.

```tsx
// W CityPage sidebar (nowy card):
<div className="card anim-slide-r delay-3" style={{ padding:"16px 18px" }}>
  <p className="label" style={{ marginBottom:10 }}>Porównaj pyłki z sąsiednimi miastami</p>
  {nearbyCities.slice(0,3).map(c => (
    <Link key={c.slug} to={`/porownaj/${city.slug}/${c.slug}`}>
      {city.name} vs {c.name} →
    </Link>
  ))}
</div>
```

**Plik do zmiany:** `src/pages/CityPage.tsx` — dodać nowy card w sidebarze.

---

### B.3 — ComparePage prerender dla popularnych par

**Cel:** Top-20 par miast prerendered = indeksowalne przez Google.

**Pary (wg populacji):** warszawa-krakow, warszawa-wroclaw, krakow-wroclaw, warszawa-gdansk, poznan-wroclaw, lodz-warszawa, katowice-krakow, lublin-rzeszow...

**Implementacja:**
- `scripts/prerender-compares.ts` — nowy skrypt; generuje `dist/porownaj/X/Y/index.html`
- Dodać do build chain w `package.json`

---

## Etap C: Nowe funkcje użytkowe

### C.1 — Web Push powiadomienia

**Cel:** Alergik zapisuje się na powiadomienia "Gdy brzoza osiągnie 'Wysokie' w Krakowie → powiadom". Buduje retencję.

**Implementacja:**
- `functions/api/push-subscribe.ts` — Pages Function przyjmuje subscription + alergen + miasto
- `scripts/send-alerts.ts` — rozszerzyć o web-push (biblioteka `web-push`)
- D1 tabela `push_subscriptions(endpoint, p256dh, auth, city_id, plant_slug, threshold)`
- `public/sw.js` — Service Worker
- `src/components/PushSubscribeButton.tsx` — SW registration + prompt użytkownika

### C.2 — Email alerty (istniejący scripts/send-alerts.ts)

**Akcja:** Przejrzeć `scripts/send-alerts.ts`, zidentyfikować zależności (Resend/SendGrid), podłączyć do cron w `update-pollen.yml` po kroku `calc-walk-index`.

---

## Rekomendowana kolejność implementacji

| # | Etap | Szacowany czas | SEO Impact | Trudność |
|---|---|---|---|---|
| 1 | **A.4** Usuń showcase polling | 10 min | brak/UX | Minimalny |
| 2 | **A.1** Plant info (9 roślin) + structured data | 3-4h | Wysoki | Niski |
| 3 | **A.3** CalendarPage structured data | 1h | Średni | Niski |
| 4 | **A.2** FAQ per miasto (1021 stron) | 4-5h | Bardzo wysoki | Średni |
| 5 | **B.2** Linkowanie wewnętrzne (porównania) | 1h | Średni | Niski |
| 6 | **B.1** 2 artykuły poradnikowe | 4-6h | Wysoki | Średni |
| 7 | **B.3** ComparePage prerender | 3h | Średni | Średni |
| 8 | **C.1** Web Push | 6-8h | Retencja | Wysoki |

---

## Patterns to Mirror

### NAMING_CONVENTION
```typescript
// SOURCE: src/utils/seo.ts:31-36
export function getVoivodeshipPageTitle(name: string): string { ... }
export function getStructuredDataVoivodeship(...): object { ... }
// Pattern: getXxxPageTitle, getStructuredDataXxx
```

### SEO_HEAD_USAGE
```tsx
// SOURCE: src/pages/CityPage.tsx:75-81
<SEOHead
  title={getCityPageTitle(city, data.pollen)}
  description={getCityPageDescription(city, data.pollen)}
  canonical={`https://copyli.pl/pylek/${city.slug}`}
  structuredData={getStructuredDataCity(city)}
  ogImage={`https://copyli.pl/og/cities/${city.slug}.png`}
/>
```

### CARD_PATTERN
```tsx
// SOURCE: src/pages/CityPage.tsx:124
<div className="card anim-fade-up delay-1" style={{ padding:"20px 22px" }}>
  <h2 style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:700,
    color:"var(--ink)", margin:"0 0 16px", letterSpacing:"-0.02em" }}>
    Tytuł sekcji
  </h2>
</div>
```

### FAQ_PATTERN
```tsx
// SOURCE: src/pages/HomePage.tsx:427-435
<details className="faq-item anim-fade-up">
  <summary>
    {q}
    <span className="faq-chevron">▾</span>
  </summary>
  <div className="faq-body">{a}</div>
</details>
```

---

## Pliki kluczowe (Mandatory Reading przed implementacją)

| Priority | Plik | Dlaczego |
|---|---|---|
| P0 | `src/utils/seo.ts` | Wszystkie structured data — punkt wyjścia |
| P0 | `src/pages/PlantPage.tsx:23-77,130-145` | PLANT_INFO, CROSS, SEOHead bez structured data |
| P1 | `src/pages/CityPage.tsx:75-81,125-175` | SEOHead pattern, FAQ section target |
| P1 | `scripts/prerender.ts` | Bot-widoczna treść HTML — FAQ musi tu trafić |
| P2 | `src/pages/CalendarPage.tsx` | Structured data do dodania |
| P2 | `src/App.tsx` | Routing nowych stron /porady/ |
| P2 | `scripts/generate-sitemap.ts` | Nowe URL-e muszą trafić do sitemapę |

---

## Validation Commands

```bash
# Po każdej zmianie TypeScript
npx tsc -b --force

# Testy
npm test

# Sprawdź prerendered structured data
node -e "
const h = require('fs').readFileSync('dist/pylek/warszawa/index.html','utf8');
console.log('FAQPage:', h.includes('FAQPage') ? 'OK' : 'BRAK');
console.log('Article:', h.includes('Article') ? 'OK' : 'BRAK');
"
```

---

## Acceptance Criteria

- [ ] Wszystkie 15 roślin mają opisy (info + tips) w `src/utils/plant-info.ts`
- [ ] PlantPage używa `getStructuredDataPlant()` → widoczne w Google Rich Results Test
- [ ] CityPage zawiera sekcję FAQ z `FAQPage` structured data
- [ ] CalendarPage ma structured data + breadcrumb
- [ ] Przynajmniej 2 artykuły poradnikowe są prerendered i w sitemapie
- [ ] Showcase polling usunięty z HomePage
- [ ] `npx tsc -b --force && npm test` bez błędów

## Risks

| Ryzyko | Prawdop. | Impact | Mitygacja |
|---|---|---|---|
| FAQ na 1021 stronach wydłuża prerender | Niskie | Średni | FAQ generowane z szablonu, bez dodatkowego fetch |
| Artykuły wymagają ciągłej aktualizacji | Wysokie | Niski | Treść "evergreen"; rok w URL (nie w treści) |
| Nowe /porady/ routes nie prerendered → 404 | Niskie | Krytyczny | Sprawdzić `public/_redirects` SPA fallback |
| ComparePage prerender mnoży pliki dist/ | Niskie | Niski | 20 par = 20 plików, akceptowalne |

## Notes

- CF Pages SPA routing: `public/_redirects` z `/* /index.html 200` — weryfikować przed dodaniem nowych routes
- Structured data dla roślin: Wikipedia `sameAs` z łacińską nazwą to dobra praktyka SEO
- Artykuły poradnikowe NIE wymagają backendu — czyste TSX z wartościową treścią
- Showcase mode: StorageEvent wystarczy dla zmiany między kartami; admin po zmianie w tej samej karcie może odświeżyć
