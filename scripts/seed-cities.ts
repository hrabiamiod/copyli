/**
 * Pobiera listę polskich miast z Overpass API (OpenStreetMap)
 * i generuje plik SQL seed do Cloudflare D1.
 *
 * Użycie: npx tsx scripts/seed-cities.ts
 */

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    place?: string;
    population?: string;
    "addr:postcode"?: string;
    [key: string]: string | undefined;
  };
}

interface City {
  name: string;
  slug: string;
  lat: number;
  lon: number;
  population: number;
  voivodeshipSlug: string;
}

const VOIVODESHIPS: Array<{ id: number; name: string; slug: string; lat: number; lon: number }> = [
  { id: 1,  name: "Dolnośląskie",       slug: "dolnoslaskie",       lat: 51.1079, lon: 17.0385 },
  { id: 2,  name: "Kujawsko-Pomorskie", slug: "kujawsko-pomorskie",  lat: 53.1235, lon: 18.0084 },
  { id: 3,  name: "Lubelskie",          slug: "lubelskie",           lat: 51.2465, lon: 22.5684 },
  { id: 4,  name: "Lubuskie",           slug: "lubuskie",            lat: 51.9355, lon: 15.5065 },
  { id: 5,  name: "Łódzkie",            slug: "lodzkie",             lat: 51.7592, lon: 19.4560 },
  { id: 6,  name: "Małopolskie",        slug: "malopolskie",         lat: 49.7229, lon: 20.2523 },
  { id: 7,  name: "Mazowieckie",        slug: "mazowieckie",         lat: 52.2297, lon: 21.0122 },
  { id: 8,  name: "Opolskie",           slug: "opolskie",            lat: 50.6751, lon: 17.9213 },
  { id: 9,  name: "Podkarpackie",       slug: "podkarpackie",        lat: 50.0412, lon: 22.0047 },
  { id: 10, name: "Podlaskie",          slug: "podlaskie",           lat: 53.1325, lon: 23.1688 },
  { id: 11, name: "Pomorskie",          slug: "pomorskie",           lat: 54.3520, lon: 18.6466 },
  { id: 12, name: "Śląskie",            slug: "slaskie",             lat: 50.2649, lon: 19.0238 },
  { id: 13, name: "Świętokrzyskie",     slug: "swietokrzyskie",      lat: 50.8661, lon: 20.6286 },
  { id: 14, name: "Warmińsko-Mazurskie",slug: "warminsko-mazurskie", lat: 53.8683, lon: 20.6938 },
  { id: 15, name: "Wielkopolskie",      slug: "wielkopolskie",       lat: 52.4082, lon: 16.9335 },
  { id: 16, name: "Zachodniopomorskie", slug: "zachodniopomorskie",  lat: 53.4285, lon: 14.5528 },
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
    .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function findVoivodeship(lat: number, lon: number): string {
  // Przypisanie na podstawie przybliżonych granic geograficznych
  // Uproszczone — dokładne byłoby wymagało GeoJSON intersection
  if (lat > 54.0) return "pomorskie";
  if (lat > 53.5 && lon < 16.5) return "zachodniopomorskie";
  if (lat > 53.5 && lon < 18.5) return "pomorskie";
  if (lat > 53.0 && lon < 16.0) return "zachodniopomorskie";
  if (lat > 53.0 && lon < 18.0) return "kujawsko-pomorskie";
  if (lat > 53.0 && lon > 22.0) return "podlaskie";
  if (lat > 53.0 && lon > 20.0) return "warminsko-mazurskie";
  if (lat > 52.5 && lon > 22.5) return "mazowieckie";
  if (lat > 52.0 && lon < 14.5) return "lubuskie";
  if (lat > 52.0 && lon < 16.0) return "lubuskie";
  if (lat > 52.0 && lon < 18.5) return "wielkopolskie";
  if (lat > 52.0 && lon < 21.0) return "mazowieckie";
  if (lat > 52.0 && lon > 21.0) return "mazowieckie";
  if (lat > 51.5 && lon < 16.5) return "dolnoslaskie";
  if (lat > 51.5 && lon < 18.0) return "wielkopolskie";
  if (lat > 51.0 && lon < 16.0) return "dolnoslaskie";
  if (lat > 51.0 && lon < 17.5) return "dolnoslaskie";
  if (lat > 51.0 && lon < 18.5) return "lodzkie";
  if (lat > 51.0 && lon < 21.5) return "lodzkie";
  if (lat > 51.0 && lon > 21.5) return "lubelskie";
  if (lat > 50.5 && lon < 16.5) return "dolnoslaskie";
  if (lat > 50.5 && lon < 18.5) return "opolskie";
  if (lat > 50.5 && lon < 20.0) return "slaskie";
  if (lat > 50.5 && lon < 22.5) return "swietokrzyskie";
  if (lat > 50.5 && lon > 22.5) return "lubelskie";
  if (lat > 50.0 && lon < 17.5) return "dolnoslaskie";
  if (lat > 50.0 && lon < 19.5) return "slaskie";
  if (lat > 50.0 && lon < 21.5) return "malopolskie";
  if (lat > 50.0 && lon > 21.5) return "podkarpackie";
  if (lon < 19.5) return "slaskie";
  if (lon < 21.5) return "malopolskie";
  return "podkarpackie";
}

async function fetchCitiesFromOverpass(): Promise<OverpassElement[]> {
  // Obszar administracyjny Polski (ISO 3166-1)
  const query = `
[out:json][timeout:90];
area["ISO3166-1:alpha2"="PL"][admin_level=2]->.poland;
(
  node["place"="city"]["name"](area.poland);
  node["place"="town"]["name"](area.poland);
);
out body 2000;
`;

  const MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  console.log("Pobieranie miast z Overpass API...");
  for (const mirror of MIRRORS) {
    try {
      const res = await fetch(mirror, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(100_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { elements: OverpassElement[] };
      console.log(`Sukces (${mirror})`);
      return data.elements;
    } catch (e) {
      console.warn(`Mirror ${mirror} failed: ${e}. Próba następnego...`);
    }
  }
  throw new Error("Wszystkie mirrory Overpass API niedostępne");
}

function generateSQL(cities: City[]): string {
  const voivLines = VOIVODESHIPS.map(v =>
    `(${v.id}, '${v.name.replace(/'/g, "''")}', '${v.slug}', ${v.lat}, ${v.lon})`
  ).join(",\n  ");

  const BATCH = 200;
  const cityBatches: string[] = [];
  for (let i = 0; i < cities.length; i += BATCH) {
    const batch = cities.slice(i, i + BATCH);
    const lines = batch.map((c, j) => {
      const idx = i + j + 1;
      const voivId = VOIVODESHIPS.find(v => v.slug === c.voivodeshipSlug)?.id ?? 7;
      const desc = `Sprawdź aktualne stężenie pyłków w ${c.name}. Prognoza pyłkowa, kalendarz pylenia i Indeks Spacerowy dla ${c.name}.`;
      return `(${idx}, '${c.name.replace(/'/g, "''")}', '${c.slug}', ${voivId}, ${c.lat}, ${c.lon}, ${c.population}, '${desc.replace(/'/g, "''")}')`;
    }).join(",\n  ");
    cityBatches.push(`INSERT OR REPLACE INTO cities (id, name, slug, voivodeship_id, lat, lon, population, seo_description) VALUES\n  ${lines};`);
  }

  return `-- Auto-generated by scripts/seed-cities.ts
-- Liczba miast: ${cities.length}

INSERT OR REPLACE INTO voivodeships (id, name, slug, lat, lon) VALUES
  ${voivLines};

${cityBatches.join("\n\n")}
`;
}

async function main() {
  try {
    const elements = await fetchCitiesFromOverpass();
    console.log(`Pobrano ${elements.length} elementów z Overpass API`);

    const seen = new Set<string>();
    const cities: City[] = [];

    for (const el of elements) {
      const name = el.tags?.name;
      if (!name) continue;

      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (!lat || !lon) continue;

      // Filtruj tylko lokalizacje w granicach Polski
      if (lat < 49.0 || lat > 54.9 || lon < 14.1 || lon > 24.2) continue;

      const slug = toSlug(name);
      if (seen.has(slug)) continue;
      seen.add(slug);

      const population = parseInt(el.tags?.population ?? "0", 10) || 0;
      const voivodeshipSlug = findVoivodeship(lat, lon);

      cities.push({ name, slug, lat, lon, population, voivodeshipSlug });
    }

    // Sortuj: najpierw największe miasta
    cities.sort((a, b) => b.population - a.population);

    console.log(`Przetworzono ${cities.length} unikalnych miast`);

    const sql = generateSQL(cities);
    const outputPath = new URL("../db/seed-cities.sql", import.meta.url).pathname;

    const { writeFileSync } = await import("fs");
    writeFileSync(outputPath, sql, "utf-8");
    console.log(`Zapisano seed do: ${outputPath}`);
    console.log("\nAby załadować do D1, uruchom:");
    console.log("  wrangler d1 execute copyli-db --file=db/schema.sql");
    console.log("  wrangler d1 execute copyli-db --file=db/seed-plants.sql");
    console.log("  wrangler d1 execute copyli-db --file=db/seed-cities.sql");
  } catch (err) {
    console.error("Błąd:", err);
    process.exit(1);
  }
}

main();
