# Plan: SEO Traffic Growth — Artykuły, Hub i Linkowanie Wewnętrzne

## Summary

copyli.pl ma doskonałe SEO techniczne (pre-rendering, structured data, sitemap 6000+ URL, OG images),
ale cierpi na **cienkie pokrycie contentowe**: tylko 3 artykuły poradnikowe przy dziesiątkach
niezagospodarowanych fraz long-tail. Plan dodaje 5 targetowanych artykułów, stronę-hub `/porady/`,
naprawia brak stron porównania w sitemapie i wzmacnia linkowanie wewnętrzne.

## User Story

As a właściciel copyli.pl,
I want więcej artykułów poradnikowych z silnym dopasowaniem do fraz kluczowych,
So that Google rankuje copyli.pl na frazy "alergia na trawy", "leki na alergię pyłkową" itp.
i ruch organiczny rośnie o 30-60% w ciągu 8 tygodni.

## Problem → Solution

Tylko 3 artykuły (`/porady/alergia-na-pylek`, `/porady/sezon-pylkowy-2026`,
`/porady/reaktywnosc-krzyzowa`) pokrywają wąski zakres fraz.
Strony porównania (21 par miast) istnieją jako HTML ale NIE MA ICH w sitemapie → Google ich nie widzi.
Brak hub-strony `/porady/` utrudnia dystrybucję link equity do artykułów.

→ 5 nowych artykułów + hub `/porady/` + compare w sitemapie + linki wewnętrzne z PlantPage.

## Metadata

- **Complexity**: Large
- **Source PRD**: N/A
- **PRD Phase**: N/A
- **Estimated Files**: 12 (6 nowych, 6 modyfikowanych)

---

## UX Design

### Before

```
/porady/  ← NIE ISTNIEJE (404)
  alergia-na-pylek       ← artykuł 1
  sezon-pylkowy-2026     ← artykuł 2
  reaktywnosc-krzyzowa   ← artykuł 3

sitemap.xml: brak /porownaj/* URL
PlantPage: zero linków do /porady/*
```

### After

```
/porady/               ← HUB — karta każdego artykułu z opisem
  alergia-na-pylek
  sezon-pylkowy-2026
  reaktywnosc-krzyzowa
  alergia-na-trawy      ← NOWY
  pylenie-brzozy        ← NOWY
  jak-chronic-sie-przed-pylkami  ← NOWY
  leki-na-alergie-pylkowa       ← NOWY
  alergia-na-ambrozje           ← NOWY

sitemap.xml: +5 artykułów, +/porady/, +21 par porównania
PlantPage grass:   link → /porady/alergia-na-trawy
PlantPage birch:   link → /porady/pylenie-brzozy
PlantPage ragweed: link → /porady/alergia-na-ambrozje
```

### Interaction Changes

| Touchpoint | Before | After | Notes |
|---|---|---|---|
| `/porady/` | 404 | Lista 8 artykułów z kartami | Hub z krótkim opisem każdego |
| PlantPage (grass) | brak linku do porady | "Dowiedz się więcej: Alergia na trawy →" | Pod tabelą sezonowości |
| PlantPage (birch) | brak linku do porady | "Dowiedz się więcej: Pylenie brzozy →" | Pod tabelą sezonowości |
| PlantPage (ragweed) | brak linku do porady | "Dowiedz się więcej: Ambrozja →" | Pod tabelą sezonowości |
| sitemap.xml | brak /porownaj/* | 21 nowych URL | Istniejące pre-rendered HTML |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `src/pages/advice/AllergyGuidePage.tsx` | all | Wzorzec artykułu: H2/H3/P helpers, SEOHead, structuredData, layout |
| P0 | `src/pages/advice/CrossReactivityPage.tsx` | all | Drugi wzorzec — tabele i listy |
| P0 | `scripts/prerender.ts` | 519–590 | ADVICE_PAGES array + generateAdvicePages() pattern |
| P1 | `scripts/generate-sitemap.ts` | all | Jak dodać nowe URL do sitemapy |
| P1 | `src/App.tsx` | 1–70 | Wzorzec importu i Route |
| P1 | `src/pages/PlantPage.tsx` | 75–100, 185–220 | Gdzie wstawić link do artykułu |
| P2 | `src/index.css` | szukaj `--forest`, `--ink`, `--r-md` | CSS variables używane w artykułach |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Schema.org Article | https://schema.org/Article | Używaj `datePublished`, `dateModified`, `author`, `publisher` |
| No external research needed | — | Wszystkie wzorce są w istniejącym kodzie |

---

## Patterns to Mirror

### ADVICE_PAGE_STRUCTURE
```tsx
// SOURCE: src/pages/advice/AllergyGuidePage.tsx:1-60

import { Link } from "react-router-dom";
import SEOHead from "../../components/SEOHead";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
      color: "var(--forest)", margin: "36px 0 12px", letterSpacing: "-0.02em" }}>
      {children}
    </h2>
  );
}
function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
      color: "var(--ink)", margin: "24px 0 8px" }}>
      {children}
    </h3>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 12 }}>{children}</p>;
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "...",
  description: "...",
  url: "https://copyli.pl/porady/...",
  datePublished: "2026-04-29",
  dateModified: "2026-04-29",
  author: { "@type": "Organization", name: "Zespół CoPyli.pl" },
  publisher: { "@type": "Organization", name: "CoPyli.pl", url: "https://copyli.pl" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
      { "@type": "ListItem", position: 2, name: "Porady", item: "https://copyli.pl/porady/" },
      { "@type": "ListItem", position: 3, name: "...", item: "https://copyli.pl/porady/..." },
    ],
  },
};

export default function XxxPage() {
  return (
    <>
      <SEOHead
        title="... | CoPyli.pl"
        description="..."
        canonical="https://copyli.pl/porady/..."
        structuredData={structuredData}
      />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 72px" }}>

        {/* Breadcrumb — NOWY WZORZEC: zawiera "Porady" pośrodku */}
        <nav className="breadcrumb anim-fade-in" style={{ marginBottom: 24 }}>
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <Link to="/porady/">Porady</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Tytuł artykułu</span>
        </nav>

        {/* Chip "Poradnik" + H1 + data */}
        <div className="anim-fade-up">
          <span style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
            color: "var(--forest)", background: "rgba(27,67,50,0.08)", borderRadius: 6,
            padding: "2px 8px", marginBottom: 12, display: "inline-block",
          }}>Poradnik</span>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)", margin: "8px 0 6px",
          }}>Tytuł H1</h1>
          <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 28 }}>
            Ostatnia aktualizacja: 29 kwietnia 2026 · Zespół CoPyli.pl
          </p>
        </div>

        {/* Disclaimer medyczny */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12,
          background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.4)",
          borderRadius: "var(--r-md)", padding: "14px 18px", marginBottom: 20 }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚕️</span>
          <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: "var(--ink)" }}>Ważne:</strong> Treści mają charakter wyłącznie
            informacyjny i <strong>nie zastępują wizyty u lekarza ani porady medycznej.</strong>
          </p>
        </div>

        {/* Lead box */}
        <div style={{ background: "rgba(27,67,50,0.06)", border: "1px solid rgba(27,67,50,0.12)",
          borderRadius: "var(--r-md)", padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
            Wstęp artykułu z kluczowymi informacjami i liczbami.
          </p>
        </div>

        {/* treść: H2, H3, P */}

        {/* CTA box */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--cream-dark)",
          borderRadius: "var(--r-md)", padding: "20px 24px", marginTop: 40 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 8 }}>
            Monitoruj pyłki w swoim mieście
          </p>
          <Link to="/" style={{
            display: "inline-block", padding: "9px 22px", borderRadius: 999, fontSize: 13,
            fontWeight: 600, color: "white", background: "var(--forest)", textDecoration: "none",
          }}>Sprawdź stężenie →</Link>
        </div>

        {/* Linki do powiązanych artykułów */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--cream-dark)",
          display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link to="/porady/alergia-na-pylek" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Alergia na pyłki →
          </Link>
          {/* ... inne powiązane linki */}
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 24, lineHeight: 1.6 }}>
          Ten artykuł ma charakter informacyjny i nie zastępuje porady lekarskiej.
        </p>
      </div>
    </>
  );
}
```

### PRERENDER_ADVICE_ENTRY
```ts
// SOURCE: scripts/prerender.ts:519-548
const ADVICE_PAGES = [
  {
    slug: "alergia-na-pylek",
    title: "...",
    description: "...",
    h1: "...",
    intro: "...",
    datePublished: "2026-04-01",
  },
  // Nowe wpisy w identycznym formacie
];
```

### SITEMAP_URL_ENTRY
```ts
// SOURCE: scripts/generate-sitemap.ts:13-20
function url(loc: string, priority: string, changefreq: string): string {
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}
// Artykuły:     priority "0.7", changefreq "yearly"
// Hub /porady/: priority "0.7", changefreq "monthly"
// Compare:      priority "0.5", changefreq "hourly"
```

### APP_ROUTE_PATTERN
```tsx
// SOURCE: src/App.tsx:27-64
import XxxPage from "./pages/advice/XxxPage";
// ...
<Route path="/porady/xxx-slug" element={<XxxPage />} />
```

### PLANT_PAGE_ADVICE_LINK
```tsx
// Wzorzec do zastosowania w src/pages/PlantPage.tsx
// Zdefiniuj POZA komponentem (stała mapa, nie w render):
const PLANT_ARTICLE: Record<string, { href: string; label: string }> = {
  grass:   { href: "/porady/alergia-na-trawy",    label: "Alergia na trawy — objawy i leczenie" },
  birch:   { href: "/porady/pylenie-brzozy",      label: "Pylenie brzozy — sezon i ochrona" },
  ragweed: { href: "/porady/alergia-na-ambrozje", label: "Ambrozja — alergia i sezon pylenia" },
};

// W JSX, pod sekcją sezonowości, przed zamknięciem głównego div:
{articleLink && (
  <div style={{ background: "rgba(27,67,50,0.05)", border: "1px solid rgba(27,67,50,0.12)",
    borderRadius: "var(--r-md)", padding: "16px 20px", marginTop: 24 }}>
    <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 8 }}>Dowiedz się więcej:</p>
    <Link to={articleLink.href} style={{ fontSize: 14, fontWeight: 600, color: "var(--forest)" }}>
      {articleLink.label} →
    </Link>
  </div>
)}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `src/pages/advice/GrassAllergyPage.tsx` | CREATE | Artykuł o alergii na trawy (~2400/mo) |
| `src/pages/advice/BirchPollenPage.tsx` | CREATE | Artykuł o pyleniu brzozy (~2000/mo) |
| `src/pages/advice/PreventionPage.tsx` | CREATE | Artykuł: jak chronić się przed pyłkami (~880/mo) |
| `src/pages/advice/MedicationsPage.tsx` | CREATE | Artykuł: leki na alergię pyłkową (~1900/mo) |
| `src/pages/advice/AmbrosiaPage.tsx` | CREATE | Artykuł o ambrozji (~590/mo, spike VIII-X) |
| `src/pages/AdviceIndexPage.tsx` | CREATE | Hub /porady/ — lista 8 artykułów |
| `src/App.tsx` | UPDATE | 6 nowych Route + importy (po linii 29 i 64) |
| `scripts/prerender.ts` | UPDATE | 5 wpisów do ADVICE_PAGES + nowa funkcja generateAdviceHubPage() |
| `scripts/generate-sitemap.ts` | UPDATE | +nowe porady + /porady/ hub + 21 par /porownaj/* |
| `src/pages/PlantPage.tsx` | UPDATE | Linki do artykułów dla grass/birch/ragweed |

## NOT Building

- Artykuły zasilane dynamicznie z CMS lub bazy D1
- System komentarzy pod artykułami
- Rozszerzenie compare pairs (top 7→15) — oddzielny task, ryzyko build time
- Link building off-page (wymaga działań poza kodem)
- Nowe frazy dla stron miast
- Tłumaczenia na angielski
- Testy jednostkowe (czysto frontendowe komponenty statyczne — CLAUDE.md wyjątek)

---

## Step-by-Step Tasks

### Task 1: Utwórz GrassAllergyPage.tsx

- **ACTION**: CREATE `src/pages/advice/GrassAllergyPage.tsx`
- **IMPLEMENT**:
  - Target keyword: "alergia na trawy" (~2400/mo PL)
  - Slug: `alergia-na-trawy`
  - `title = "Alergia na trawy — objawy, sezon pylenia i leczenie | CoPyli.pl"`
  - `description = "Alergia na trawy dotyka 8% Polaków. Kiedy trawa pyli, jakie objawy daje i jak się leczyć? Sprawdź sezon pylenia traw w Polsce i aktualne stężenia."`
  - Sekcje H2: "Kiedy pylą trawy w Polsce" / "Objawy alergii na trawy" / "Diagnostyka" / "Leczenie" / "Jak sprawdzić stężenie traw na bieżąco"
  - Breadcrumb: Strona główna › Porady › Alergia na trawy (3 poziomy!)
  - Linki wewnętrzne: `/pylek/roslina/grass`, `/porady/alergia-na-pylek`, `/porady/jak-chronic-sie-przed-pylkami`, `/kalendarz-pylenia`
  - CTA box i sekcja linków na dole
- **MIRROR**: `ADVICE_PAGE_STRUCTURE`
- **IMPORTS**: `{ Link } from "react-router-dom"`, `SEOHead from "../../components/SEOHead"`
- **GOTCHA**: Breadcrumb musi mieć 3 poziomy (z `/porady/` pośrodku) — różni się od istniejących artykułów, które mają tylko 2 poziomy. Upewnij się że link do `/porady/` jest aktywny (Hub musi istnieć).
- **VALIDATE**: `grep "alergia-na-trawy\|GrassAllergy" src/pages/advice/GrassAllergyPage.tsx` → canonical URL i export

### Task 2: Utwórz BirchPollenPage.tsx

- **ACTION**: CREATE `src/pages/advice/BirchPollenPage.tsx`
- **IMPLEMENT**:
  - Target keyword: "pylenie brzozy" / "alergia na brzozę" (~2000/mo PL)
  - Slug: `pylenie-brzozy`
  - `title = "Pylenie brzozy — kiedy sezon, objawy alergii i co robić | CoPyli.pl"`
  - `description = "Brzoza pyli w Polsce głównie w marcu–maju i uczula ok. 20% alergików. Sprawdź aktualny sezon, objawy alergii na brzozę i metody ochrony."`
  - Sekcje H2: "Kiedy pyli brzoza w Polsce" / "Dlaczego brzoza jest tak uczulająca?" / "Objawy alergii na brzozę" / "Reaktywność krzyżowa brzozy z pokarmami" / "Leczenie"
  - Tabela miesięcy pylenia: Marzec ⭐⭐, Kwiecień ⭐⭐⭐⭐⭐, Maj ⭐⭐⭐⭐, Czerwiec ⭐
  - Linki wewnętrzne: `/pylek/roslina/birch`, `/porady/reaktywnosc-krzyzowa`, `/porady/alergia-na-pylek`
- **MIRROR**: `ADVICE_PAGE_STRUCTURE`
- **IMPORTS**: `{ Link } from "react-router-dom"`, `SEOHead from "../../components/SEOHead"`
- **GOTCHA**: Slug "pylenie-brzozy" (bez ę) — convention: ASCII-only slugs.
- **VALIDATE**: `grep "pylenie-brzozy" src/pages/advice/BirchPollenPage.tsx`

### Task 3: Utwórz PreventionPage.tsx

- **ACTION**: CREATE `src/pages/advice/PreventionPage.tsx`
- **IMPLEMENT**:
  - Target keyword: "jak chronić się przed pyłkami" (~880/mo PL)
  - Slug: `jak-chronic-sie-przed-pylkami`
  - `title = "Jak chronić się przed pyłkami — 10 sprawdzonych metod | CoPyli.pl"`
  - `description = "Skuteczna ochrona przed pyłkami: sprawdź stężenia, dobierz leki, zadbaj o dom. 10 praktycznych wskazówek dla alergika podczas sezonu pyłkowego."`
  - Sekcje H2: "Sprawdzaj stężenia zanim wyjdziesz" / "Kiedy nie wychodzić — najgorsze godziny" / "Ochrona w domu" / "Ubranie i higiena po powrocie" / "Planowanie podróży i wyjazdów"
  - Grid z 10 tipami (wzorzec z AllergyGuidePage: `gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))"`)
  - Tip #1 zawiera link do CoPyli.pl — "Sprawdzaj CoPyli.pl przed wyjściem"
- **MIRROR**: `ADVICE_PAGE_STRUCTURE`
- **IMPORTS**: `{ Link } from "react-router-dom"`, `SEOHead from "../../components/SEOHead"`
- **GOTCHA**: Slug "jak-chronic-sie-przed-pylkami" (bez ó, ę) — sprawdź czy route w App.tsx pasuje 1:1.
- **VALIDATE**: `grep "jak-chronic-sie-przed-pylkami" src/pages/advice/PreventionPage.tsx`

### Task 4: Utwórz MedicationsPage.tsx

- **ACTION**: CREATE `src/pages/advice/MedicationsPage.tsx`
- **IMPLEMENT**:
  - Target keyword: "leki na alergię pyłkową" (~1900/mo PL)
  - Slug: `leki-na-alergie-pylkowa`
  - `title = "Leki na alergię pyłkową — antyhistaminowe, steroidy, odczulanie | CoPyli.pl"`
  - `description = "Jakie leki na alergię pyłkową wybrać? Antyhistaminowe II generacji, kortykosteroidy donosowe i immunoterapia — jak działają i kiedy je stosować."`
  - Sekcje H2: "Leki antyhistaminowe II generacji" / "Kortykosteroidy donosowe" / "Leki na oczy" / "Immunoterapia alergenowa (odczulanie)" / "Kiedy iść do alergologa"
  - Tabela porównawcza: 3 kolumny (Typ leku | Mechanizm | Kiedy stosować) — TYLKO nazwy INN (loratadyna, cetyryzyna, feksofenadyna), bez nazw handlowych i dawkowania
  - Disclaimer: "Nie zalecamy konkretnych leków — kwalifikuje alergolog"
- **MIRROR**: `ADVICE_PAGE_STRUCTURE`
- **IMPORTS**: `{ Link } from "react-router-dom"`, `SEOHead from "../../components/SEOHead"`
- **GOTCHA**: Slug "leki-na-alergie-pylkowa" (bez ę). Używaj wyłącznie nazw INN — żadnych nazw handlowych (Claritine, Zyrtec itp.), to może być odczytane jako reklama leków.
- **VALIDATE**: `grep "leki-na-alergie-pylkowa" src/pages/advice/MedicationsPage.tsx`

### Task 5: Utwórz AmbrosiaPage.tsx

- **ACTION**: CREATE `src/pages/advice/AmbrosiaPage.tsx`
- **IMPLEMENT**:
  - Target keyword: "ambrozja alergia" / "pylenie ambrozji" (~590/mo, spike VIII-X)
  - Slug: `alergia-na-ambrozje`
  - `title = "Ambrozja — alergia, sezon pylenia (sierpień–październik) | CoPyli.pl"`
  - `description = "Ambrozja to jeden z najgroźniejszych alergenów sierpień–październik. Sprawdź sezon pylenia ambrozji w Polsce, objawy alergii i jak się chronić."`
  - Sekcje H2: "Czym jest ambrozja?" / "Kiedy pyli ambrozja w Polsce — mapa ekspansji" / "Dlaczego jest tak niebezpieczna?" / "Objawy alergii na ambrozję" / "Jak sprawdzić stężenie ambrozji"
  - Link do `/pylek/roslina/ragweed`
  - Info: inwazyjny chwast z Ameryki, ekspansja od lat 90., szczególnie południe Polski
- **MIRROR**: `ADVICE_PAGE_STRUCTURE`
- **IMPORTS**: `{ Link } from "react-router-dom"`, `SEOHead from "../../components/SEOHead"`
- **GOTCHA**: Slug "alergia-na-ambrozje" (bez ę) — ASCII tylko.
- **VALIDATE**: `grep "alergia-na-ambrozje" src/pages/advice/AmbrosiaPage.tsx`

### Task 6: Utwórz AdviceIndexPage.tsx (hub /porady/)

- **ACTION**: CREATE `src/pages/AdviceIndexPage.tsx`
- **IMPLEMENT**:
  - `title = "Porady dla alergików — poradniki o alergii pyłkowej | CoPyli.pl"`
  - `description = "Poradniki dla alergików: alergia na pyłki, trawy, brzozę, ambrozję. Leki, ochrona i aktualny sezon pyłkowy 2026."`
  - `canonical = "https://copyli.pl/porady/"` (z trailing slash — canonical URL hub-strony)
  - Schema.org `CollectionPage`
  - H1: "Porady dla alergików"
  - Intro akapit
  - Grid kart: `gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))"`, gap 16

  Dane kart — stała `ARTICLES` poza komponentem:
  ```ts
  const ARTICLES = [
    { slug: "alergia-na-pylek",               icon: "🌸", title: "Alergia na pyłki",              desc: "Objawy, diagnostyka i leczenie pyłkowicy. Kompleksowy przewodnik po alergii pyłkowej." },
    { slug: "sezon-pylkowy-2026",              icon: "📅", title: "Sezon pyłkowy 2026",             desc: "Harmonogram pylenia drzew, traw i chwastów w Polsce. Kiedy zaczyna się i ile trwa sezon?" },
    { slug: "reaktywnosc-krzyzowa",            icon: "🔗", title: "Reaktywność krzyżowa",           desc: "Kiedy alergia na pyłki wywołuje reakcję na pokarmy? Pełna lista par pyłek–pokarm." },
    { slug: "alergia-na-trawy",                icon: "🌾", title: "Alergia na trawy",               desc: "Sezon pylenia traw trwa maj–sierpień. Jakie gatunki są najgroźniejsze i jak się chronić?" },
    { slug: "pylenie-brzozy",                  icon: "🌳", title: "Pylenie brzozy",                 desc: "Brzoza uczula 20% alergików. Kiedy pyli, jakie objawy daje i co ma wspólnego z jabłkami?" },
    { slug: "jak-chronic-sie-przed-pylkami",   icon: "🛡️", title: "Jak chronić się przed pyłkami", desc: "10 sprawdzonych metod na przeżycie sezonu pyłkowego z mniejszymi objawami." },
    { slug: "leki-na-alergie-pylkowa",         icon: "💊", title: "Leki na alergię pyłkową",       desc: "Antyhistaminowe, steroidy, odczulanie — jak działają i kiedy je stosować." },
    { slug: "alergia-na-ambrozje",             icon: "🌿", title: "Ambrozja — alergia",             desc: "Najgroźniejszy alergen jesieni. Sezon sierpień–październik, ekspansja w Polsce." },
  ] as const;
  ```

  Layout karty artykułu (Link jako kontener):
  ```tsx
  <Link to={`/porady/${a.slug}`} style={{
    display: "block", background: "var(--surface)", border: "1px solid var(--cream-dark)",
    borderRadius: "var(--r-md)", padding: "20px 24px", textDecoration: "none",
  }}>
    <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
    <p style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 6 }}>{a.title}</p>
    <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 12 }}>{a.desc}</p>
    <span style={{ fontSize: 13, color: "var(--forest)", fontWeight: 600 }}>Czytaj dalej →</span>
  </Link>
  ```

- **MIRROR**: `ADVICE_PAGE_STRUCTURE` (SEOHead, breadcrumb, layout wrapper — ale breadcrumb ma 2 poziomy)
- **IMPORTS**: `{ Link } from "react-router-dom"`, `SEOHead from "../components/SEOHead"` (UWAGA: inna ścieżka niż artykuły!)
- **GOTCHA**: Import path SEOHead — artykuły w `advice/` używają `../../components/SEOHead`, ale `AdviceIndexPage.tsx` jest w `pages/` → `../components/SEOHead`. Pomyłka sprawi błąd TypeScript.
- **VALIDATE**: `grep -c "porady/" src/pages/AdviceIndexPage.tsx` → powinno być 8 linków do artykułów

### Task 7: Zaktualizuj App.tsx — 6 nowych Route

- **ACTION**: UPDATE `src/App.tsx`
- **IMPLEMENT**:

  Dodaj po linii 29 (po `import CrossReactivityPage`):
  ```tsx
  import GrassAllergyPage from "./pages/advice/GrassAllergyPage";
  import BirchPollenPage from "./pages/advice/BirchPollenPage";
  import PreventionPage from "./pages/advice/PreventionPage";
  import MedicationsPage from "./pages/advice/MedicationsPage";
  import AmbrosiaPage from "./pages/advice/AmbrosiaPage";
  import AdviceIndexPage from "./pages/AdviceIndexPage";
  ```

  Dodaj po Route z `/porady/reaktywnosc-krzyzowa` (ok. linia 64):
  ```tsx
  <Route path="/porady" element={<AdviceIndexPage />} />
  <Route path="/porady/alergia-na-trawy" element={<GrassAllergyPage />} />
  <Route path="/porady/pylenie-brzozy" element={<BirchPollenPage />} />
  <Route path="/porady/jak-chronic-sie-przed-pylkami" element={<PreventionPage />} />
  <Route path="/porady/leki-na-alergie-pylkowa" element={<MedicationsPage />} />
  <Route path="/porady/alergia-na-ambrozje" element={<AmbrosiaPage />} />
  ```

- **MIRROR**: `APP_ROUTE_PATTERN`
- **GOTCHA**: Route `/porady` (bez trailing slash) — React Router dopasuje `/porady` i `/porady/`. Nie dodawaj slash do `path`.
- **VALIDATE**: `grep "porady" src/App.tsx | wc -l` → powinno być ~12 linii (6 importów advice + 6 starych route + 6 nowych route)

### Task 8: Zaktualizuj prerender.ts — ADVICE_PAGES + hub

- **ACTION**: UPDATE `scripts/prerender.ts`
- **IMPLEMENT**:

  Dodaj 5 wpisów do `ADVICE_PAGES` (przed zamknięciem `];` ok. linia 548):
  ```ts
  {
    slug: "alergia-na-trawy",
    title: "Alergia na trawy — objawy, sezon pylenia i leczenie | CoPyli.pl",
    description: "Alergia na trawy dotyka 8% Polaków. Kiedy trawa pyli, jakie objawy daje i jak się leczyć? Sprawdź sezon pylenia traw w Polsce i aktualne stężenia.",
    h1: "Alergia na trawy — objawy, sezon i leczenie",
    intro: "Trawy (Poaceae) pylą w Polsce od maja do początku września — to jeden z najdłuższych sezonów pylenia. Graminozy (alergeny traw) uczulają szacunkowo 8% Polaków i są główną przyczyną alergii letnich.",
    datePublished: "2026-04-29",
  },
  {
    slug: "pylenie-brzozy",
    title: "Pylenie brzozy — kiedy sezon, objawy alergii i co robić | CoPyli.pl",
    description: "Brzoza pyli w Polsce głównie w marcu–maju i uczula ok. 20% alergików. Sprawdź aktualny sezon, objawy alergii na brzozę i metody ochrony.",
    h1: "Pylenie brzozy — sezon, objawy alergii i ochrona",
    intro: "Brzoza (Betula pendula) to jeden z najsilniejszych alergenów wiosennych w Polsce. Sezon pylenia trwa zwykle od marca do maja — w szczytowych dniach stężenia mogą przekraczać 1500 ziaren/m³.",
    datePublished: "2026-04-29",
  },
  {
    slug: "jak-chronic-sie-przed-pylkami",
    title: "Jak chronić się przed pyłkami — 10 sprawdzonych metod | CoPyli.pl",
    description: "Skuteczna ochrona przed pyłkami: sprawdź stężenia, dobierz leki, zadbaj o dom. 10 praktycznych wskazówek dla alergika podczas sezonu pyłkowego.",
    h1: "Jak chronić się przed pyłkami — 10 sprawdzonych metod",
    intro: "Całkowita eliminacja ekspozycji na pyłki jest niemożliwa, ale świadome zarządzanie ryzykiem znacząco ogranicza objawy. Poniższe metody pomogą Ci przeżyć sezon z mniejszym dyskomfortem.",
    datePublished: "2026-04-29",
  },
  {
    slug: "leki-na-alergie-pylkowa",
    title: "Leki na alergię pyłkową — antyhistaminowe, steroidy, odczulanie | CoPyli.pl",
    description: "Jakie leki na alergię pyłkową wybrać? Antyhistaminowe II generacji, kortykosteroidy donosowe i immunoterapia — jak działają i kiedy je stosować.",
    h1: "Leki na alergię pyłkową — rodzaje, działanie i skuteczność",
    intro: "Leczenie alergii pyłkowej opiera się na trzech filarach: leki antyhistaminowe (objawy doraźne), kortykosteroidy donosowe (codzienna kontrola) i immunoterapia alergenowa (jedyna metoda przyczynowa).",
    datePublished: "2026-04-29",
  },
  {
    slug: "alergia-na-ambrozje",
    title: "Ambrozja — alergia, sezon pylenia (sierpień–październik) | CoPyli.pl",
    description: "Ambrozja to jeden z najgroźniejszych alergenów sierpień–październik. Sprawdź sezon pylenia ambrozji w Polsce, objawy alergii i jak się chronić.",
    h1: "Ambrozja — alergia, sezon i ochrona",
    intro: "Ambrozja bylicolistna (Ambrosia artemisiifolia) to inwazyjny chwast z Ameryki Północnej, który stał się jednym z najgroźniejszych alergenów w Polsce. Pyli od sierpnia do października — kiedy większość innych roślin już zakończyła sezon.",
    datePublished: "2026-04-29",
  },
  ```

  Dodaj nową funkcję `generateAdviceHubPage()` PRZED funkcją `main()`:
  ```ts
  function generateAdviceHubPage(pages: typeof ADVICE_PAGES): void {
    const outDir = path.join(DIST, "porady");
    ensureDir(outDir);

    const ICONS: Record<string, string> = {
      "alergia-na-pylek":             "🌸",
      "sezon-pylkowy-2026":           "📅",
      "reaktywnosc-krzyzowa":         "🔗",
      "alergia-na-trawy":             "🌾",
      "pylenie-brzozy":               "🌳",
      "jak-chronic-sie-przed-pylkami":"🛡️",
      "leki-na-alergie-pylkowa":      "💊",
      "alergia-na-ambrozje":          "🌿",
    };

    const cards = pages.map(p =>
      `<a href="/porady/${p.slug}" style="display:block;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;text-decoration:none;">
        <div style="font-size:28px;margin-bottom:10px">${ICONS[p.slug] ?? "📄"}</div>
        <p style="font-weight:700;font-size:15px;color:#111827;margin:0 0 6px">${esc(p.h1.split(" —")[0])}</p>
        <p style="font-size:13px;color:#4b5563;line-height:1.6;margin:0 0 12px">${esc(p.intro.substring(0, 120))}...</p>
        <span style="font-size:13px;color:#15803d;font-weight:600">Czytaj dalej →</span>
      </a>`
    ).join("\n");

    const bodyHtml = `
  <main style="font-family:system-ui,sans-serif;max-width:860px;margin:0 auto;padding:24px 16px">
    <nav style="font-size:0.875rem;color:#6b7280;margin-bottom:16px">
      <a href="/" style="color:#15803d">Strona główna</a> &rsaquo; Porady dla alergików
    </nav>
    <h1 style="font-size:1.875rem;font-weight:800;color:#111827;margin-bottom:8px">Porady dla alergików</h1>
    <p style="color:#4b5563;margin-bottom:32px;line-height:1.7">
      Praktyczne przewodniki opracowane przez zespół CoPyli.pl — kiedy pylą rośliny,
      jak się chronić i co stosować podczas sezonu pyłkowego.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
      ${cards}
    </div>
  </main>`;

    const canonical = "https://copyli.pl/porady/";
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Porady dla alergików — CoPyli.pl",
      description: "Poradniki o alergii pyłkowej: objawy, leczenie, ochrona i aktualny sezon pyłkowy.",
      url: canonical,
    };

    const title = "Porady dla alergików — poradniki o alergii pyłkowej | CoPyli.pl";
    const description = "Poradniki dla alergików: alergia na pyłki, trawy, brzozę, ambrozję. Leki, ochrona i aktualny sezon pyłkowy 2026.";
    const html = injectMeta(template, { title, description, canonical, structuredData, bodyHtml });
    fs.writeFileSync(path.join(outDir, "index.html"), html);
  }
  ```

  Wywołaj `generateAdviceHubPage(ADVICE_PAGES)` w `main()`, po istniejącym `generateAdvicePages()`.

- **MIRROR**: `PRERENDER_ADVICE_ENTRY` + istniejący `generateAdvicePages()`
- **IMPORTS**: żadne nowe (fs, path, esc, ensureDir, injectMeta, template już zaimportowane)
- **GOTCHA**: `typeof ADVICE_PAGES` zadziała poprawnie bo `ADVICE_PAGES` jest tablicą obiektów zdefiniowaną przed funkcją. Jeśli TypeScript narzeka, użyj typu `{ slug: string; h1: string; intro: string }[]`.
- **VALIDATE**: Po `npm run build` sprawdź `ls dist/porady/` — powinno być `index.html` + 8 plików `.html`

### Task 9: Zaktualizuj generate-sitemap.ts — compare + nowe porady + hub

- **ACTION**: UPDATE `scripts/generate-sitemap.ts`
- **IMPLEMENT**:

  Rozszerz `adviceUrls` o hub i nowe artykuły:
  ```ts
  const adviceUrls = [
    url("/porady", "0.7", "monthly"),
    url("/porady/alergia-na-pylek", "0.7", "yearly"),
    url("/porady/sezon-pylkowy-2026", "0.7", "yearly"),
    url("/porady/reaktywnosc-krzyzowa", "0.7", "yearly"),
    url("/porady/alergia-na-trawy", "0.7", "yearly"),
    url("/porady/pylenie-brzozy", "0.7", "yearly"),
    url("/porady/jak-chronic-sie-przed-pylkami", "0.7", "yearly"),
    url("/porady/leki-na-alergie-pylkowa", "0.7", "yearly"),
    url("/porady/alergia-na-ambrozje", "0.7", "yearly"),
  ].join("\n");
  ```

  Rozszerz typ `cities` o `population`:
  ```ts
  const cities = JSON.parse(...) as Array<{ slug: string; population?: number }>;
  ```

  Dodaj generowanie compare pairs PO bloku `plantUrls`:
  ```ts
  const TOP_N = 7;
  const topCities = cities
    .filter(c => c.population != null)
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .slice(0, TOP_N);
  // Fallback jeśli brak population: weź pierwsze 7
  const pairCities = topCities.length >= TOP_N ? topCities : cities.slice(0, TOP_N);
  const comparePairs: string[] = [];
  for (let i = 0; i < pairCities.length; i++) {
    for (let j = i + 1; j < pairCities.length; j++) {
      comparePairs.push(url(`/porownaj/${pairCities[i].slug}/${pairCities[j].slug}`, "0.5", "hourly"));
    }
  }
  const compareUrls = comparePairs.join("\n");
  ```

  Dodaj `${compareUrls}` do sitemap string po `${plantUrls}`:
  ```ts
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${url("/", "1.0", "hourly")}
  ${url("/kalendarz-pylenia", "0.6", "monthly")}
  ${url("/pylek/rosliny", "0.7", "monthly")}
  ${adviceUrls}
  ${voivUrls}
  ${plantUrls}
  ${compareUrls}
  ${cityUrls}
  </urlset>`;
  ```

- **MIRROR**: `SITEMAP_URL_ENTRY`
- **GOTCHA**: Sprawdź przed implementacją: `jq '.[0]' public/data/cities.json | grep population` — jeśli pola nie ma, użyj tylko `cities.slice(0, 7)` jako `pairCities`.
- **VALIDATE**: `npx tsx scripts/generate-sitemap.ts && grep -c "porownaj\|/porady" public/sitemap.xml` → powinno być ~30 (21 compare + 9 porady)

### Task 10: Dodaj linki wewnętrzne w PlantPage.tsx

- **ACTION**: UPDATE `src/pages/PlantPage.tsx`
- **IMPLEMENT**:

  Przed `export default function PlantPage()` dodaj stałą mapę:
  ```tsx
  const PLANT_ARTICLE: Record<string, { href: string; label: string }> = {
    grass:   { href: "/porady/alergia-na-trawy",    label: "Alergia na trawy — objawy i leczenie" },
    birch:   { href: "/porady/pylenie-brzozy",      label: "Pylenie brzozy — sezon i ochrona" },
    ragweed: { href: "/porady/alergia-na-ambrozje", label: "Ambrozja — alergia i sezon pylenia" },
  };
  ```

  W treści komponentu, przed ostatnim `</div>` wrappera, dodaj:
  ```tsx
  const articleLink = plant ? PLANT_ARTICLE[plant.slug] : undefined;
  // ...
  {articleLink && (
    <div style={{
      background: "rgba(27,67,50,0.05)", border: "1px solid rgba(27,67,50,0.12)",
      borderRadius: "var(--r-md)", padding: "16px 20px", marginTop: 24,
    }}>
      <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 8, margin: "0 0 8px" }}>
        Dowiedz się więcej:
      </p>
      <Link to={articleLink.href} style={{ fontSize: 14, fontWeight: 600, color: "var(--forest)" }}>
        {articleLink.label} →
      </Link>
    </div>
  )}
  ```

- **MIRROR**: `PLANT_PAGE_ADVICE_LINK`
- **IMPORTS**: `Link` już importowany w PlantPage.tsx
- **GOTCHA**: PRZED implementacją sprawdź rzeczywiste slugi: `jq '.[].slug' public/data/plants.json` — slug może być "grass", "grasses", "timothy_grass" itp. Dostosuj klucze w `PLANT_ARTICLE` do rzeczywistych wartości.
- **VALIDATE**: Otwórz `/pylek/roslina/grass` w przeglądarce → box z linkiem do artykułu widoczny

---

## Testing Strategy

### Unit Tests

Brak — komponenty są czysto statyczne (TSX → pre-rendered HTML).
CLAUDE.md wyjątek: "jeśli testy wymagałyby więcej kodu niż sama funkcjonalność".

### Edge Cases Checklist

- [ ] PlantPage dla roślin bez artykułu (np. `alder`, `hazel`) — `articleLink` = undefined → brak box-a, bez błędu
- [ ] `/porady/` hub — wszystkie 8 kart mają poprawne linki
- [ ] `npm run build` — brak błędów TypeScript w nowych plikach
- [ ] Sitemap — 21 par compare bez duplikatów (każda para raz: i < j)
- [ ] Prerender — 9 plików w `dist/porady/` (8 artykułów + index.html)

---

## Validation Commands

### Static Analysis
```bash
cd /Users/michal/trunk/copyli
npx tsc --noEmit --force
```
EXPECT: Zero błędów TypeScript

### Full Test Suite
```bash
npm test
```
EXPECT: Wszystkie istniejące testy przechodzą, zero regresji

### Build
```bash
npm run build
```
EXPECT: Sukces, `dist/porady/index.html` istnieje

### Sitemap
```bash
npx tsx scripts/generate-sitemap.ts
grep -c "porownaj\|/porady" public/sitemap.xml
```
EXPECT: ~30

### Prerender
```bash
ls dist/porady/*.html | wc -l
```
EXPECT: 9

### Weryfikacja slugi roślin (PRZED Task 10)
```bash
jq '.[].slug' public/data/plants.json
```
EXPECT: Lista slugów — dostosuj klucze w PLANT_ARTICLE do rzeczywistych wartości

### Weryfikacja population w cities.json (PRZED Task 9)
```bash
jq '.[0]' public/data/cities.json
```
EXPECT: sprawdź czy pole `population` istnieje

### Manual Browser Validation
- [ ] `npm run dev` → `http://localhost:5173/porady/` → lista 8 artykułów widoczna
- [ ] Klik "Alergia na trawy" → artykuł z breadcrumb "Strona główna › Porady › Alergia na trawy"
- [ ] `http://localhost:5173/pylek/roslina/grass` → box z linkiem do artykułu widoczny
- [ ] `view-source:dist/porady/alergia-na-trawy.html` → `<title>` i `<meta description>` poprawne
- [ ] `cat public/sitemap.xml | grep porownaj | head -5` → URL par miast widoczne

---

## Acceptance Criteria

- [ ] 5 nowych artykułów pod poprawnymi URL (dostępne w przeglądarce)
- [ ] Hub `/porady/` wyświetla 8 kart artykułów
- [ ] Breadcrumb w nowych artykułach zawiera link do `/porady/`
- [ ] 3 rośliny (grass, birch, ragweed) linkują do swoich artykułów
- [ ] Sitemap zawiera 21 par compare i 9 wpisów /porady/*
- [ ] `tsc --noEmit --force` → zero błędów
- [ ] `npm test` → zero regresji
- [ ] `npm run build` → sukces, 9 plików w dist/porady/

## Completion Checklist

- [ ] Wzorzec H2/H3/P helpers spójny we wszystkich artykułach
- [ ] Każdy artykuł ma disclaimer medyczny (żółty box ⚕️)
- [ ] Każdy artykuł ma CTA box "Monitoruj pyłki" na dole
- [ ] Każdy artykuł ma sekcję linków do powiązanych artykułów
- [ ] Breadcrumb 3-poziomowy: Strona główna › Porady › Tytuł
- [ ] Daty `datePublished` i `dateModified` ustawione na "2026-04-29"
- [ ] Schema.org `Article` w 5 nowych artykułach
- [ ] Schema.org `CollectionPage` w hub-stronie
- [ ] Slugi: ASCII-only, bez polskich liter
- [ ] Import SEOHead w AdviceIndexPage: `../components/SEOHead` (nie `../../`)
- [ ] PLANT_ARTICLE używa rzeczywistych slugów z plants.json

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Slugi roślin różne od grass/birch/ragweed | Średnie | Niskie | `jq '.[].slug' public/data/plants.json` przed Task 10 |
| `cities.json` bez pola `population` | Niskie | Niskie | Fallback: `cities.slice(0, 7)` |
| TypeScript błędy w `typeof ADVICE_PAGES` | Niskie | Niskie | Użyj eksplicytnego typu `{ slug: string; h1: string; intro: string }[]` |
| Breadcrumb link do `/porady/` niedziałający przed wdrożeniem hub-strony | Brak przy prawidłowej kolejności | Średnie | Wdróż Task 6 (hub) PRZED Task 1-5 lub jednocześnie |

## Notes

### Priorytety wdrożenia (quick wins 4-8 tygodni)

1. **Task 9 (sitemap)** — natychmiastowy efekt: 21 stron porównania ISTNIEJE jako HTML, tylko brakuje w sitemapie. Po dodaniu Google je zaindeksuje bez zmian treści.
2. **Task 6+7 (hub /porady/)** — poprawa link equity dla istniejących 3 artykułów.
3. **Tasks 1-5 (artykuły)** — nowa treść na frazy 880–2400 wyszukań/miesiąc.
4. **Task 10 (PlantPage)** — wzmocnienie linkowania wewnętrznego.

### Keyword priority ranking

| Artykuł | Szacowany vol./mies. | Sezon ruchu |
|---|---|---|
| alergia-na-trawy | ~2400 | V-VIII |
| leki-na-alergie-pylkowa | ~1900 | III-VIII |
| pylenie-brzozy | ~2000 | III-V |
| jak-chronic-sie-przed-pylkami | ~880 | III-VIII |
| alergia-na-ambrozje | ~590 | VIII-X |

### Link building (off-code, po wdrożeniu)

Zgłoś artykuły do: Poradnik Zdrowie (poradnikzdrowie.pl), Medonet, ePorady24.pl,
fora alergiczne (alergia.org.pl), lokalne portale miejskie, Zdrowie.pap.pl.
Artykuł o lekach i o ochronie przed pyłkami mają najwyższy potencjał do
zdobycia linków zwrotnych (listy tipów, tabele porównawcze).

### Istniejące artykuły wymagają aktualizacji breadcrumbu

Istniejące 3 artykuły (`AllergyGuidePage`, `Season2026Page`, `CrossReactivityPage`) mają
2-poziomowy breadcrumb (brak "Porady" w środku). Po wdrożeniu hub-strony warto je zaktualizować
dla spójności, ale nie jest to wymagane do funkcjonowania planu.
