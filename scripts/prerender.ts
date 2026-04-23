/**
 * prerender.ts
 * Generuje statyczne pliki HTML dla każdego miasta i województwa.
 * Uruchamiany po `vite build`. Wstrzykuje unikalne meta tagi i treść SEO
 * widoczną dla botów Google bez uruchamiania JavaScript.
 */

import fs from "fs";
import path from "path";
import { buildCityTitle, buildCityDescription } from "../src/utils/cityTitle";

const DIST = path.resolve("dist");
const DATA = path.resolve("public/data");

const LEVEL_LABELS: Record<string, string> = {
  none: "brak",
  low: "niskie",
  medium: "średnie",
  high: "wysokie",
  very_high: "bardzo wysokie",
};

const LEVEL_COLORS: Record<string, string> = {
  none: "#9ca3af",
  low: "#4ade80",
  medium: "#facc15",
  high: "#f97316",
  very_high: "#ef4444",
};

interface PlantRecord {
  id: number;
  slug: string;
  name_pl: string;
  name_latin: string;
  category: string;
  icon: string;
  month_start: number;
  month_end: number;
  peak_months: string;
}

interface City {
  id: number;
  name: string;
  slug: string;
  lat: number;
  lon: number;
  population: number;
  seo_description: string;
  voivodeship_slug: string;
  voivodeship_name: string;
}

interface Voivodeship {
  id: number;
  name: string;
  slug: string;
  lat: number;
  lon: number;
}

interface PollenEntry {
  plant_slug?: string;
  plant_name: string;
  name_latin: string;
  icon: string;
  concentration: number;
  level: string;
}

interface CityData {
  pollen: PollenEntry[];
}

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

// Wczytaj szablon z dist/index.html
const templatePath = path.join(DIST, "index.html");
if (!fs.existsSync(templatePath)) {
  console.error("❌ Brak dist/index.html — uruchom najpierw npm run build");
  process.exit(1);
}
const template = fs.readFileSync(templatePath, "utf-8");

function injectMeta(html: string, opts: {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  structuredData?: object;
  extraStructuredData?: object;
  bodyHtml?: string;
}): string {
  const { title, description, canonical, ogImage, structuredData, extraStructuredData, bodyHtml } = opts;
  const image = ogImage ?? "https://copyli.pl/og-default.png";

  const ldJson = [
    structuredData ? `\n  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : "",
    extraStructuredData ? `\n  <script type="application/ld+json">${JSON.stringify(extraStructuredData)}</script>` : "",
  ].join("");

  const ogTags = `
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pl_PL" />
  <meta property="og:site_name" content="CoPyli.pl" />
  <meta property="og:image" content="${esc(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(image)}" />
  <link rel="canonical" href="${esc(canonical)}" />${ldJson}`;

  // Usuń istniejące OG/Twitter/canonical z szablonu, żeby uniknąć duplikatów
  let result = html
    .replace(/<meta property="og:[^"]*"[^>]*>/g, "")
    .replace(/<meta name="twitter:[^"]*"[^>]*>/g, "")
    .replace(/<link rel="canonical"[^>]*>/g, "");

  result = result
    // Zamień tytuł
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    // Zamień description
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`)
    // Wstaw OG tagi przed </head>
    .replace("</head>", `${ogTags}\n</head>`);

  // Wstrzyknij statyczną treść przed <div id="root">
  if (bodyHtml) {
    result = result.replace(
      '<div id="root"></div>',
      `<div id="root"><div id="seo-content" style="display:contents">${bodyHtml}</div></div>`
    );
  }

  return result;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function levelBadge(level: string): string {
  const color = LEVEL_COLORS[level] ?? "#9ca3af";
  const label = LEVEL_LABELS[level] ?? level;
  return `<span style="background:${color};color:#fff;padding:2px 8px;border-radius:9999px;font-size:0.75rem;font-weight:600">${label}</span>`;
}

// ─── Generowanie stron miast ───────────────────────────────────────────────

async function generateCityPageAsync(city: City, allCities: City[]): Promise<void> {
  let cityData: CityData | null = null;
  try {
    const raw = await fs.promises.readFile(path.join(DATA, "cities", `${city.slug}.json`), "utf-8");
    cityData = JSON.parse(raw) as CityData;
  } catch { /* brak danych */ }

  const pollen = cityData?.pollen ?? [];
  const activePollen = pollen.filter(p => p.level !== "none");
  const highPollen = pollen.filter(p => p.level === "high" || p.level === "very_high");

  const title = buildCityTitle(city.name, city.slug, pollen);
  const description = buildCityDescription(city.name, city.voivodeship_name, pollen, LEVEL_LABELS);

  const canonical = `https://copyli.pl/pylek/${city.slug}`;
  const ogImage = `https://copyli.pl/og/cities/${city.slug}.png`;

  const pollenRows = activePollen.length > 0
    ? activePollen.map(p =>
        `<tr><td style="padding:6px 12px">${p.icon} ${p.plant_name}</td><td style="padding:6px 12px;font-style:italic;color:#6b7280">${p.name_latin}</td><td style="padding:6px 12px">${levelBadge(p.level)}</td></tr>`
      ).join("")
    : `<tr><td colspan="3" style="padding:8px 12px;color:#6b7280">Brak aktywnych alergenów</td></tr>`;

  // FAQ per miasto — dynamiczne pytania z danych pyłkowych
  const faqActiveList = activePollen.slice(0, 3).map(p => `${p.plant_name} (${LEVEL_LABELS[p.level]})`).join(", ");
  const faqPollenAnswer = activePollen.length > 0
    ? `Dziś w ${city.name} pylą: ${faqActiveList}. Dane są aktualizowane co 2 godziny.`
    : `Aktualnie stężenie pyłków w ${city.name} jest niskie lub nie ma aktywnych alergenów.`;
  const faqItems = [
    {
      q: `Co pyli dziś w ${city.name}?`,
      a: faqPollenAnswer,
    },
    {
      q: `Kiedy jest sezon pyłkowy w ${city.name}?`,
      a: `Sezon pyłkowy w ${city.name} (${city.voivodeship_name}) trwa od lutego do października. Najwcześniej pylą olcha i leszczyna (luty–marzec), następnie brzoza i jesion (kwiecień–maj), trawy (maj–wrzesień) oraz chwasty jak bylica i ambrozja (lipiec–październik).`,
    },
    {
      q: `Skąd pochodzą dane pyłkowe dla ${city.name}?`,
      a: `Dane pyłkowe dla ${city.name} (${city.voivodeship_name}) pochodzą z Open-Meteo Air Quality API i są aktualizowane co 2 godziny. Obejmują stężenia pyłków dla ponad 1000 polskich miast.`,
    },
  ];
  const faqHtml = faqItems.map(({ q, a }) => `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:8px">
      <h3 style="font-size:1rem;font-weight:600;color:#111827;margin:0 0 8px">${esc(q)}</h3>
      <p style="font-size:0.875rem;color:#4b5563;margin:0;line-height:1.6">${esc(a)}</p>
    </div>`).join("");
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  // Inne miasta w tym samym województwie (max 8 — wewnętrzne linkowanie)
  const siblingCities = allCities
    .filter(c => c.voivodeship_slug === city.voivodeship_slug && c.slug !== city.slug)
    .sort((a, b) => b.population - a.population)
    .slice(0, 8);
  const siblingLinks = siblingCities.map(c =>
    `<li style="display:inline"><a href="/pylek/${c.slug}" style="color:#15803d;text-decoration:none;font-size:0.875rem">${c.name}</a></li>`
  ).join("<li style='display:inline;color:#d1d5db'> · </li>");

  const bodyHtml = `
<main style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:24px 16px">
  <nav style="font-size:0.875rem;color:#6b7280;margin-bottom:16px">
    <a href="/" style="color:#15803d">Strona główna</a> &rsaquo;
    <a href="/pylek/woj/${city.voivodeship_slug}" style="color:#15803d">${city.voivodeship_name}</a> &rsaquo;
    ${city.name}
  </nav>
  <h1 style="font-size:1.875rem;font-weight:700;color:#111827;margin-bottom:8px">
    Stężenie pyłków w ${city.name} — aktualne dane
  </h1>
  <p style="color:#4b5563;margin-bottom:24px">${description}</p>
  <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:12px">Co pyli dziś w ${city.name}?</h2>
  <table style="border-collapse:collapse;width:100%;margin-bottom:24px;background:#f9fafb;border-radius:8px;overflow:hidden">
    <thead><tr style="background:#f3f4f6">
      <th style="padding:8px 12px;text-align:left">Roślina</th>
      <th style="padding:8px 12px;text-align:left">Nazwa łacińska</th>
      <th style="padding:8px 12px;text-align:left">Stężenie</th>
    </tr></thead>
    <tbody>${pollenRows}</tbody>
  </table>
  ${siblingLinks ? `<p style="color:#6b7280;font-size:0.875rem;margin-bottom:8px">Inne miasta w województwie ${city.voivodeship_name}:</p>
  <ul style="list-style:none;padding:0;margin-bottom:16px">${siblingLinks}</ul>` : ""}
  <section style="margin-top:32px">
    <h2 style="font-size:1.25rem;font-weight:600;color:#111827;margin-bottom:16px">Najczęstsze pytania — pyłki w ${city.name}</h2>
    ${faqHtml}
  </section>
  <p style="color:#6b7280;font-size:0.875rem;margin-top:24px">
    Dane pyłkowe dla ${city.name} (${city.voivodeship_name}) aktualizowane co 2 godziny na podstawie modelu Open-Meteo.
    Współrzędne: ${city.lat.toFixed(4)}°N, ${city.lon.toFixed(4)}°E.
  </p>
</main>`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Pyłki w ${city.name}`,
    description,
    url: canonical,
    about: {
      "@type": "Place",
      name: city.name,
      geo: { "@type": "GeoCoordinates", latitude: city.lat, longitude: city.lon },
      containedInPlace: { "@type": "AdministrativeArea", name: city.voivodeship_name },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
        { "@type": "ListItem", position: 2, name: city.voivodeship_name, item: `https://copyli.pl/pylek/woj/${city.voivodeship_slug}` },
        { "@type": "ListItem", position: 3, name: city.name, item: canonical },
      ],
    },
    dataset: activePollen.length > 0 ? {
      "@type": "Dataset",
      name: `Dane pyłkowe ${city.name}`,
      description: `Aktualne stężenie pyłków w ${city.name}`,
      temporalCoverage: new Date().toISOString().split("T")[0],
    } : undefined,
  };

  const html = injectMeta(template, { title, description, canonical, ogImage, structuredData, extraStructuredData: faqStructuredData, bodyHtml });
  const outDir = path.join(DIST, "pylek");
  await fs.promises.mkdir(outDir, { recursive: true });
  await fs.promises.writeFile(path.join(outDir, `${city.slug}.html`), html);
}

// ─── Generowanie stron województw ─────────────────────────────────────────

function generateVoivodeshipPage(voiv: Voivodeship, cities: City[]): void {
  const voivCities = cities
    .filter(c => c.voivodeship_slug === voiv.slug)
    .sort((a, b) => b.population - a.population);

  const topCities = voivCities.slice(0, 5).map(c => c.name).join(", ");
  const title = `Pyłki w województwie ${voiv.name} — aktualna mapa pylenia | CoPyli.pl`;
  const description = `Aktualne stężenie pyłków w województwie ${voiv.name}. Dane dla ${voivCities.length} miast regionu, m.in.: ${topCities}. Mapa pylenia i prognoza dla alergików.`;
  const canonical = `https://copyli.pl/pylek/woj/${voiv.slug}`;

  const cityList = voivCities.map(c =>
    `<li><a href="/pylek/${c.slug}" style="color:#15803d;text-decoration:none">${c.name}</a></li>`
  ).join("");

  const bodyHtml = `
<main style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:24px 16px">
  <nav style="font-size:0.875rem;color:#6b7280;margin-bottom:16px">
    <a href="/" style="color:#15803d">Strona główna</a> &rsaquo; ${voiv.name}
  </nav>
  <h1 style="font-size:1.875rem;font-weight:700;color:#111827;margin-bottom:8px">
    Mapa pyłkowa województwa ${voiv.name}
  </h1>
  <p style="color:#4b5563;margin-bottom:24px">${description}</p>
  <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:12px">Miasta w województwie ${voiv.name}</h2>
  <ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;list-style:none;padding:0;margin-bottom:24px">
    ${cityList}
  </ul>
  <p style="color:#6b7280;font-size:0.875rem">
    Dane pyłkowe dla ${voivCities.length} miast województwa ${voiv.name} aktualizowane co 2 godziny.
  </p>
</main>`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Pyłki w województwie ${voiv.name}`,
    description,
    url: canonical,
    about: {
      "@type": "AdministrativeArea",
      name: `Województwo ${voiv.name}`,
      geo: { "@type": "GeoCoordinates", latitude: voiv.lat, longitude: voiv.lon },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
        { "@type": "ListItem", position: 2, name: voiv.name, item: canonical },
      ],
    },
  };

  const html = injectMeta(template, { title, description, canonical, structuredData, bodyHtml });
  const outDir = path.join(DIST, "pylek", "woj");
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, `${voiv.slug}.html`), html);
}

// ─── Generowanie stron roślin ──────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = { tree: "Drzewa", grass: "Trawy", weed: "Chwasty" };
const MONTHS_PL = ["Sty","Lut","Mar","Kwi","Maj","Cze","Lip","Sie","Wrz","Paź","Lis","Gru"];

function generatePlantPage(plant: PlantRecord, allPlants: PlantRecord[]): void {
  const title = `${plant.name_pl} — kiedy pyli, alergia i stężenie pyłków w Polsce | CoPyli.pl`;
  const description = `Kiedy pyli ${plant.name_pl} (${plant.name_latin}) w Polsce? Sezon pylenia, aktualne stężenia w województwach, reaktywność krzyżowa i wskazówki dla alergików uczulonych na pyłek ${plant.name_pl}.`;
  const canonical = `https://copyli.pl/pylek/roslina/${plant.slug}`;

  const peakMonths: number[] = plant.peak_months ? JSON.parse(plant.peak_months) : [];

  const monthBar = MONTHS_PL.map((m, i) => {
    const month = i + 1;
    const inRange = plant.month_start && plant.month_end
      ? (plant.month_start <= plant.month_end
        ? month >= plant.month_start && month <= plant.month_end
        : month >= plant.month_start || month <= plant.month_end)
      : false;
    const isPeak = peakMonths.includes(month);
    const bg = !inRange ? "#e5e7eb" : isPeak ? "#1B4332" : "rgba(27,67,50,0.3)";
    return `<span title="${m}" style="flex:1;height:20px;border-radius:3px;background:${bg};display:inline-block"></span>`;
  }).join("");

  const relatedSlugs = allPlants
    .filter(p => p.category === plant.category && p.slug !== plant.slug)
    .map(p => `<a href="/pylek/roslina/${p.slug}" style="color:#15803d;text-decoration:none;font-size:0.875rem">${p.icon} ${p.name_pl}</a>`)
    .join(" · ");

  const bodyHtml = `
<main style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:24px 16px">
  <nav style="font-size:0.875rem;color:#6b7280;margin-bottom:16px">
    <a href="/" style="color:#15803d">Strona główna</a> &rsaquo;
    <a href="/kalendarz-pylenia" style="color:#15803d">Kalendarz pylenia</a> &rsaquo;
    ${plant.name_pl}
  </nav>
  <h1 style="font-size:1.875rem;font-weight:700;color:#111827;margin-bottom:4px">
    ${plant.icon} ${plant.name_pl} — kiedy pyli i jak się chronić?
  </h1>
  <p style="color:#6b7280;font-style:italic;margin-bottom:16px">${plant.name_latin} · ${CATEGORY_LABELS[plant.category] ?? plant.category}</p>
  <p style="color:#4b5563;margin-bottom:20px">${description}</p>
  <h2 style="font-size:1.125rem;font-weight:600;margin-bottom:8px">Sezon pylenia ${plant.name_pl} w Polsce</h2>
  <div style="display:flex;gap:3px;margin-bottom:6px;height:20px">${monthBar}</div>
  <div style="display:flex;gap:10px;font-size:0.75rem;color:#6b7280;margin-bottom:20px">
    <span><span style="display:inline-block;width:12px;height:8px;background:#1B4332;border-radius:2px;margin-right:4px"></span>Szczyt pylenia</span>
    <span><span style="display:inline-block;width:12px;height:8px;background:rgba(27,67,50,0.3);border-radius:2px;margin-right:4px"></span>Pylenie</span>
  </div>
  ${relatedSlugs ? `<p style="color:#4b5563;font-size:0.875rem">Inne ${(CATEGORY_LABELS[plant.category] ?? "").toLowerCase()} pylące w Polsce: ${relatedSlugs}</p>` : ""}
</main>`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonical,
    about: { "@type": "Thing", name: plant.name_pl, alternateName: plant.name_latin },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
        { "@type": "ListItem", position: 2, name: "Kalendarz pylenia", item: "https://copyli.pl/kalendarz-pylenia" },
        { "@type": "ListItem", position: 3, name: plant.name_pl, item: canonical },
      ],
    },
  };

  const html = injectMeta(template, { title, description, canonical, structuredData, bodyHtml });
  const outDir = path.join(DIST, "pylek", "roslina");
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, `${plant.slug}.html`), html);
}

// ─── Generowanie strony kalendarza ────────────────────────────────────────

function generateCalendarPage(): void {
  const title = "Kalendarz pylenia roślin w Polsce 2026 | CoPyli.pl";
  const description = "Kalendarz pylenia roślin alergicznych w Polsce. Sprawdź, kiedy pyli brzoza, tymotka, ambrozja i inne rośliny. Sezon pyłkowy 2026 — miesięczny harmonogram.";
  const canonical = "https://copyli.pl/kalendarz-pylenia";

  const bodyHtml = `
<main style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:24px 16px">
  <nav style="font-size:0.875rem;color:#6b7280;margin-bottom:16px">
    <a href="/" style="color:#15803d">Strona główna</a> &rsaquo; Kalendarz pylenia
  </nav>
  <h1 style="font-size:1.875rem;font-weight:700;color:#111827;margin-bottom:8px">
    Kalendarz pylenia roślin w Polsce 2026
  </h1>
  <p style="color:#4b5563;margin-bottom:24px">${description}</p>
</main>`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonical,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
        { "@type": "ListItem", position: 2, name: "Kalendarz pylenia", item: canonical },
      ],
    },
  };

  const html = injectMeta(template, { title, description, canonical, structuredData, bodyHtml });
  ensureDir(DIST);
  fs.writeFileSync(path.join(DIST, "kalendarz-pylenia.html"), html);
}

// ─── Generowanie strony indeksu roślin ────────────────────────────────────

function generatePlantsIndexPage(plants: PlantRecord[]): void {
  const title = "Rośliny pylące w Polsce — alergeny, sezony i opisy | CoPyli.pl";
  const description = "Lista roślin pylących w Polsce: drzewa (brzoza, olcha, leszczyna), trawy i chwasty (ambrozja, bylica). Kiedy pylą, jak się chronić, reaktywność krzyżowa.";
  const canonical = "https://copyli.pl/pylek/rosliny";

  const cats: Record<string, string> = { tree: "Drzewa", grass: "Trawy", weed: "Chwasty" };
  const plantLinks = (["tree","grass","weed"] as const).map(cat => {
    const items = plants.filter(p => p.category === cat);
    if (!items.length) return "";
    const links = items.map(p =>
      `<a href="/pylek/roslina/${p.slug}" style="color:#15803d;text-decoration:none;font-size:0.875rem">${p.icon} ${p.name_pl}</a>`
    ).join(" · ");
    return `<p style="margin-bottom:6px"><strong>${cats[cat]}:</strong> ${links}</p>`;
  }).join("");

  const bodyHtml = `
<main style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:24px 16px">
  <nav style="font-size:0.875rem;color:#6b7280;margin-bottom:16px">
    <a href="/" style="color:#15803d">Strona główna</a> &rsaquo; Rośliny pylące
  </nav>
  <h1 style="font-size:1.875rem;font-weight:700;color:#111827;margin-bottom:8px">
    Rośliny pylące w Polsce
  </h1>
  <p style="color:#4b5563;margin-bottom:20px">${description}</p>
  ${plantLinks}
</main>`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonical,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
        { "@type": "ListItem", position: 2, name: "Rośliny pylące", item: canonical },
      ],
    },
  };

  const html = injectMeta(template, { title, description, canonical, structuredData, bodyHtml });
  const outDir = path.join(DIST, "pylek");
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, "rosliny.html"), html);
}

// ─── Generowanie stron poradnikowych ──────────────────────────────────────

const ADVICE_PAGES = [
  {
    slug: "alergia-na-pylek",
    title: "Alergia na pyłki — objawy, leczenie i jak się chronić | CoPyli.pl",
    description: "Kompleksowy przewodnik po alergii pyłkowej: objawy, diagnostyka, leczenie i codzienne sposoby na przeżycie sezonu pyłkowego bez cierpienia.",
    h1: "Alergia na pyłki — objawy, leczenie i jak się chronić",
    intro: "W Polsce na alergię pyłkową cierpi szacunkowo 10–20% populacji. Sezon pyłkowy trwa od lutego do października. Dowiedz się jak rozpoznać objawy, jakie leki stosować i jak ograniczyć ekspozycję na pyłki.",
    datePublished: "2026-04-01",
  },
  {
    slug: "sezon-pylkowy-2026",
    title: "Sezon pyłkowy 2026 w Polsce — kiedy zaczyna się i ile trwa | CoPyli.pl",
    description: "Kiedy zaczyna się sezon pyłkowy 2026? Harmonogram pylenia drzew, traw i chwastów w Polsce. Prognoza sezonu dla alergików — miesiąc po miesiącu.",
    h1: "Sezon pyłkowy 2026 w Polsce — kiedy zaczyna się i ile trwa",
    intro: "Sezon pyłkowy 2026 w Polsce trwa od lutego do października — łącznie około 9 miesięcy. Sprawdź harmonogram pylenia drzew (brzoza, olcha), traw i chwastów (ambrozja, bylica).",
    datePublished: "2026-01-15",
  },
  {
    slug: "reaktywnosc-krzyzowa",
    title: "Reaktywność krzyżowa pyłków — pełna lista alergenów i pokarmów | CoPyli.pl",
    description: "Reaktywność krzyżowa pyłków i pokarmów — kiedy alergia na brzozę powoduje reakcję na jabłka? Pełna lista: drzewa, trawy, chwasty i powiązane pokarmy.",
    h1: "Reaktywność krzyżowa pyłków — pełna lista",
    intro: "Reaktywność krzyżowa to zjawisko, w którym układ odpornościowy uczulony na pyłki reaguje też na podobne białka obecne w pokarmach. Dotyczy szacunkowo 50–75% osób uczulonych na pyłki drzew.",
    datePublished: "2026-04-01",
  },
];

function generateAdvicePages(): void {
  const outDir = path.join(DIST, "porady");
  ensureDir(outDir);

  for (const page of ADVICE_PAGES) {
    const canonical = `https://copyli.pl/porady/${page.slug}`;

    const bodyHtml = `
<main style="font-family:system-ui,sans-serif;max-width:760px;margin:0 auto;padding:24px 16px">
  <nav style="font-size:0.875rem;color:#6b7280;margin-bottom:16px">
    <a href="/" style="color:#15803d">Strona główna</a> &rsaquo; ${esc(page.h1.split(" —")[0])}
  </nav>
  <h1 style="font-size:1.875rem;font-weight:700;color:#111827;margin-bottom:8px">
    ${esc(page.h1)}
  </h1>
  <p style="color:#4b5563;margin-bottom:24px;line-height:1.7">${esc(page.intro)}</p>
  <p style="color:#6b7280;font-size:0.875rem">
    <a href="/kalendarz-pylenia" style="color:#15803d">Kalendarz pylenia roślin</a> ·
    <a href="/pylek/rosliny" style="color:#15803d">Rośliny pylące w Polsce</a>
  </p>
</main>`;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.h1,
      description: page.description,
      url: canonical,
      datePublished: page.datePublished,
      dateModified: "2026-04-22",
      author: { "@type": "Organization", name: "Zespół CoPyli.pl" },
      publisher: { "@type": "Organization", name: "CoPyli.pl", url: "https://copyli.pl" },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
          { "@type": "ListItem", position: 2, name: page.h1, item: canonical },
        ],
      },
    };

    const html = injectMeta(template, { title: page.title, description: page.description, canonical, structuredData, bodyHtml });
    fs.writeFileSync(path.join(outDir, `${page.slug}.html`), html);
  }
}

// ─── Generowanie stron porównania miast ───────────────────────────────────

const TOP_COMPARE_CITIES = 7; // 7 miast = 21 par

async function generateComparePages(allCities: City[]): Promise<number> {
  const topCities = allCities
    .slice()
    .sort((a, b) => b.population - a.population)
    .slice(0, TOP_COMPARE_CITIES);

  const pairs: [City, City][] = [];
  for (let i = 0; i < topCities.length; i++) {
    for (let j = i + 1; j < topCities.length; j++) {
      pairs.push([topCities[i], topCities[j]]);
    }
  }

  let generated = 0;
  await Promise.all(pairs.map(async ([city1, city2]) => {
    let data1: CityData | null = null;
    let data2: CityData | null = null;
    try {
      const [raw1, raw2] = await Promise.all([
        fs.promises.readFile(path.join(DATA, "cities", `${city1.slug}.json`), "utf-8"),
        fs.promises.readFile(path.join(DATA, "cities", `${city2.slug}.json`), "utf-8"),
      ]);
      data1 = JSON.parse(raw1) as CityData;
      data2 = JSON.parse(raw2) as CityData;
    } catch { return; }

    const pollen1 = data1?.pollen ?? [];
    const pollen2 = data2?.pollen ?? [];

    const LEVEL_ORDER_LOCAL = ["none", "low", "medium", "high", "very_high"];
    const levelScore = (lvl: string) => LEVEL_ORDER_LOCAL.indexOf(lvl);

    const score1 = pollen1.reduce((s, p) => s + levelScore(p.level), 0);
    const score2 = pollen2.reduce((s, p) => s + levelScore(p.level), 0);
    const winner = score1 < score2 ? city1 : score2 < score1 ? city2 : null;
    const winnerText = winner
      ? `Ogólnie niższe stężenia pyłków ma dziś <strong>${winner.name}</strong>.`
      : "Stężenia pyłków w obu miastach są porównywalne.";

    const title = `Pyłki: ${city1.name} vs ${city2.name} — porównanie stężeń | CoPyli.pl`;
    const description = `Porównanie stężeń pyłków w ${city1.name} i ${city2.name}. Sprawdź gdzie jest lepiej dla alergika — prognoza 5-dniowa i aktualne dane.`;
    const canonical = `https://copyli.pl/porownaj/${city1.slug}/${city2.slug}`;

    // Tabela porównawcza — unikalne rośliny z obu miast
    const allSlugs = Array.from(new Set([
      ...pollen1.map(p => p.plant_slug ?? ""),
      ...pollen2.map(p => p.plant_slug ?? ""),
    ])).filter(Boolean);

    const rows = allSlugs
      .map(slug => {
        const p1 = pollen1.find(p => p.plant_slug === slug);
        const p2 = pollen2.find(p => p.plant_slug === slug);
        const lvl1 = p1?.level ?? "none";
        const lvl2 = p2?.level ?? "none";
        const name = p1?.plant_name ?? p2?.plant_name ?? slug;
        const icon = p1?.icon ?? p2?.icon ?? "🌿";
        const max = Math.max(levelScore(lvl1), levelScore(lvl2));
        return { name, icon, lvl1, lvl2, max };
      })
      .sort((a, b) => b.max - a.max);

    const tableRows = rows.map(r =>
      `<tr>
        <td style="padding:8px 12px">${r.icon} ${esc(r.name)}</td>
        <td style="padding:8px 12px">${levelBadge(r.lvl1)}</td>
        <td style="padding:8px 12px">${levelBadge(r.lvl2)}</td>
      </tr>`
    ).join("");

    const bodyHtml = `
<main style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:24px 16px">
  <nav style="font-size:0.875rem;color:#6b7280;margin-bottom:16px">
    <a href="/" style="color:#15803d">Strona główna</a> &rsaquo;
    <a href="/pylek/${city1.slug}" style="color:#15803d">${esc(city1.name)}</a> vs
    <a href="/pylek/${city2.slug}" style="color:#15803d">${esc(city2.name)}</a>
  </nav>
  <h1 style="font-size:1.875rem;font-weight:700;color:#111827;margin-bottom:8px">
    Pyłki: ${esc(city1.name)} vs ${esc(city2.name)}
  </h1>
  <p style="color:#4b5563;margin-bottom:16px">${description}</p>
  <p style="background:rgba(27,67,50,0.07);border:1px solid rgba(27,67,50,0.15);border-radius:8px;padding:12px 16px;color:#111827;margin-bottom:24px">
    ${winnerText}
  </p>
  <h2 style="font-size:1.125rem;font-weight:600;margin-bottom:12px">Porównanie stężeń pyłków</h2>
  <table style="border-collapse:collapse;width:100%;background:#f9fafb;border-radius:8px;overflow:hidden;margin-bottom:24px">
    <thead><tr style="background:#f3f4f6">
      <th style="padding:8px 12px;text-align:left">Roślina</th>
      <th style="padding:8px 12px;text-align:left">${esc(city1.name)}</th>
      <th style="padding:8px 12px;text-align:left">${esc(city2.name)}</th>
    </tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <p style="color:#6b7280;font-size:0.875rem">
    Dane pyłkowe aktualizowane co 2 godziny.
    <a href="/pylek/${city1.slug}" style="color:#15803d">Szczegóły dla ${esc(city1.name)}</a> ·
    <a href="/pylek/${city2.slug}" style="color:#15803d">Szczegóły dla ${esc(city2.name)}</a>
  </p>
</main>`;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: canonical,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
          { "@type": "ListItem", position: 2, name: `${city1.name} vs ${city2.name}`, item: canonical },
        ],
      },
    };

    const html = injectMeta(template, { title, description, canonical, structuredData, bodyHtml });
    const outDir = path.join(DIST, "porownaj", city1.slug);
    await fs.promises.mkdir(outDir, { recursive: true });
    await fs.promises.writeFile(path.join(outDir, `${city2.slug}.html`), html);
    generated++;
  }));

  return generated;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const cities = readJson<City[]>(path.join(DATA, "cities.json"));
  const voivodeships = readJson<Voivodeship[]>(path.join(DATA, "voivodeships.json"));

  if (!cities || !voivodeships) {
    console.error("❌ Brak plików public/data/cities.json lub voivodeships.json");
    process.exit(1);
  }

  console.log(`🌸 Pre-renderowanie ${cities.length} stron miast...`);
  const CITY_BATCH = 50;
  let done = 0;
  for (let i = 0; i < cities.length; i += CITY_BATCH) {
    await Promise.all(cities.slice(i, i + CITY_BATCH).map(city => generateCityPageAsync(city, cities)));
    done += Math.min(CITY_BATCH, cities.length - i);
    process.stdout.write(`  ${done}/${cities.length}\r`);
  }
  console.log(`  ✅ Wygenerowano ${cities.length} stron miast`);

  console.log(`🗺️  Pre-renderowanie ${voivodeships.length} stron województw...`);
  for (const voiv of voivodeships) {
    generateVoivodeshipPage(voiv, cities);
  }
  console.log(`  ✅ Wygenerowano ${voivodeships.length} stron województw`);

  console.log(`📅 Pre-renderowanie kalendarza pylenia...`);
  generateCalendarPage();
  console.log(`  ✅ Wygenerowano stronę kalendarza`);

  const plants = readJson<PlantRecord[]>(path.join(DATA, "plants.json"));
  if (plants && plants.length > 0) {
    console.log(`🌱 Pre-renderowanie ${plants.length} stron roślin + indeks...`);
    for (const plant of plants) {
      generatePlantPage(plant, plants);
    }
    generatePlantsIndexPage(plants);
    console.log(`  ✅ Wygenerowano ${plants.length} stron roślin + indeks`);
  }

  console.log(`📝 Pre-renderowanie stron poradnikowych...`);
  generateAdvicePages();
  console.log(`  ✅ Wygenerowano ${ADVICE_PAGES.length} stron poradnikowych`);

  console.log(`🏙️  Pre-renderowanie stron porównania miast...`);
  const compareCount = await generateComparePages(cities);
  console.log(`  ✅ Wygenerowano ${compareCount} stron porównania miast`);

  const plantCount = plants?.length ?? 0;
  const total = cities.length + voivodeships.length + 1 + plantCount + ADVICE_PAGES.length + compareCount;
  console.log(`\n✅ Pre-renderowanie zakończone. ${total} plików HTML gotowych.`);
}

main().catch(console.error);
