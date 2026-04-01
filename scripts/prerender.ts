/**
 * prerender.ts
 * Generuje statyczne pliki HTML dla każdego miasta i województwa.
 * Uruchamiany po `vite build`. Wstrzykuje unikalne meta tagi i treść SEO
 * widoczną dla botów Google bez uruchamiania JavaScript.
 */

import fs from "fs";
import path from "path";

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
  structuredData?: object;
  bodyHtml?: string;
}): string {
  const { title, description, canonical, structuredData, bodyHtml } = opts;

  const ldJson = structuredData
    ? `\n  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>`
    : "";

  const ogTags = `
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pl_PL" />
  <meta property="og:site_name" content="CoPyli.pl" />
  <meta property="og:image" content="https://copyli.pl/og-default.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="https://copyli.pl/og-default.png" />
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

function generateCityPage(city: City, allCities: City[]): void {
  const cityData = readJson<CityData>(path.join(DATA, "cities", `${city.slug}.json`));
  const pollen = cityData?.pollen ?? [];
  const activePollen = pollen.filter(p => p.level !== "none");
  const highPollen = pollen.filter(p => p.level === "high" || p.level === "very_high");

  const title = highPollen.length > 0
    ? `Pyłki w ${city.name} — ${highPollen.map(p => p.plant_name).join(", ")} | CoPyli.pl`
    : `Stężenie pyłków w ${city.name} dziś — aktualne dane | CoPyli.pl`;

  const description = highPollen.length > 0
    ? `Aktualne stężenie pyłków w ${city.name}. Dziś: ${highPollen.map(p => `${p.plant_name} (${LEVEL_LABELS[p.level]})`).join(", ")}. Prognoza 5-dniowa, Indeks Spacerowy i kalendarz pylenia.`
    : `Aktualne stężenie pyłków w ${city.name} (${city.voivodeship_name}). Sprawdź co pyli, prognozę 5-dniową i Indeks Spacerowy. Dane dla alergików aktualizowane co 2 godziny.`;

  const canonical = `https://copyli.pl/pylek/${city.slug}`;

  const pollenRows = activePollen.length > 0
    ? activePollen.map(p =>
        `<tr><td style="padding:6px 12px">${p.icon} ${p.plant_name}</td><td style="padding:6px 12px;font-style:italic;color:#6b7280">${p.name_latin}</td><td style="padding:6px 12px">${levelBadge(p.level)}</td></tr>`
      ).join("")
    : `<tr><td colspan="3" style="padding:8px 12px;color:#6b7280">Brak aktywnych alergenów</td></tr>`;

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
  <p style="color:#6b7280;font-size:0.875rem">
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

  const html = injectMeta(template, { title, description, canonical, structuredData, bodyHtml });
  const outDir = path.join(DIST, "pylek");
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, `${city.slug}.html`), html);
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

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const cities = readJson<City[]>(path.join(DATA, "cities.json"));
  const voivodeships = readJson<Voivodeship[]>(path.join(DATA, "voivodeships.json"));

  if (!cities || !voivodeships) {
    console.error("❌ Brak plików public/data/cities.json lub voivodeships.json");
    process.exit(1);
  }

  console.log(`🌸 Pre-renderowanie ${cities.length} stron miast...`);
  let done = 0;
  for (const city of cities) {
    generateCityPage(city, cities);
    done++;
    if (done % 100 === 0) process.stdout.write(`  ${done}/${cities.length}\r`);
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

  // Zaktualizuj _redirects — nie rewrite'uj podstron, które istnieją jako pliki
  // Cloudflare Pages automatycznie preferuje pliki nad regułą /* /index.html 200
  // Więc nie trzeba nic zmieniać w _redirects — wystarczy że pliki istnieją.

  console.log(`\n✅ Pre-renderowanie zakończone. ${cities.length + voivodeships.length + 1} plików HTML gotowych.`);
}

main().catch(console.error);
