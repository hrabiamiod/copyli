/**
 * Generuje statyczne pliki JSON z danych D1 do katalogu public/data/.
 * Te pliki są używane przez pre-renderowane strony React.
 *
 * Użycie: npx tsx scripts/generate-static.ts
 * Wymaga: wrangler zalogowanego (wrangler login)
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const DATA_DIR = join(process.cwd(), "public", "data");
const DB_NAME = process.env.D1_DATABASE_NAME ?? "copyli-db";

function d1Query(sql: string): Record<string, unknown>[] {
  const escaped = sql.replace(/"/g, '\\"').replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  const cmd = `npx wrangler d1 execute ${DB_NAME} --remote --command="${escaped}" --json`;
  const out = execSync(cmd, { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 });
  // Wrangler może wypisać ANSI / warning lines przed JSON-em
  const jsonStart = out.indexOf("[");
  if (jsonStart === -1) throw new Error(`Brak JSON w odpowiedzi: ${out.slice(0, 200)}`);
  const parsed = JSON.parse(out.slice(jsonStart)) as Array<{ results?: Record<string, unknown>[] }>;
  return parsed[0]?.results ?? [];
}

function writeJSON(filename: string, data: unknown) {
  const path = join(DATA_DIR, filename);
  writeFileSync(path, JSON.stringify(data), "utf-8");
  console.log(`  Zapisano: ${filename} (${Array.isArray(data) ? (data as unknown[]).length + " rekordów" : ""})`);
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(join(DATA_DIR, "cities"), { recursive: true });
  mkdirSync(join(DATA_DIR, "history"), { recursive: true });

  // 1. Lista wszystkich miast
  console.log("Generowanie cities.json...");
  const cities = d1Query(`
    SELECT c.id, c.name, c.slug, c.lat, c.lon, c.population, c.seo_description,
           v.slug as voivodeship_slug, v.name as voivodeship_name
    FROM cities c
    JOIN voivodeships v ON c.voivodeship_id = v.id
    ORDER BY c.population DESC
  `) as Array<{ id: number; slug: string; name: string; lat: number; lon: number; population: number; seo_description: string; voivodeship_slug: string; voivodeship_name: string }>;
  writeJSON("cities.json", cities);

  // 2. Województwa
  console.log("Generowanie voivodeships.json...");
  const voivodeships = d1Query(`SELECT * FROM voivodeships ORDER BY name`);
  writeJSON("voivodeships.json", voivodeships);

  // 3. Rośliny
  console.log("Generowanie plants.json...");
  const plants = d1Query(`
    SELECT p.*, ps.month_start, ps.month_end, ps.peak_months
    FROM plants p
    LEFT JOIN plant_seasons ps ON ps.plant_id = p.id AND ps.region = 'polska'
    ORDER BY p.category, p.id
  `);
  writeJSON("plants.json", plants);

  // 4. Mapa pyłkowa (zagregowane per województwo)
  console.log("Generowanie map-data.json...");
  const mapData = d1Query(`
    SELECT
      v.slug as voivodeship_slug,
      v.name as voivodeship_name,
      p.slug as plant_slug,
      p.name_pl as plant_name,
      p.category,
      AVG(pc.concentration) as avg_concentration,
      MAX(pc.level) as max_level,
      COUNT(DISTINCT pc.city_id) as cities_count
    FROM pollen_current pc
    JOIN cities c ON pc.city_id = c.id
    JOIN voivodeships v ON c.voivodeship_id = v.id
    JOIN plants p ON pc.plant_id = p.id
    GROUP BY v.slug, p.slug
    ORDER BY v.slug, p.category, p.slug
  `);
  writeJSON("map-data.json", mapData);

  // 4b. Poziomy pyłków per miasto — do kolorowania markerów na mapie
  console.log("Generowanie city-levels.json...");
  const cityLevelsRaw = await d1Query(`
    SELECT c.slug as city_slug,
      CASE MAX(CASE pc.level
        WHEN 'none'      THEN 0
        WHEN 'low'       THEN 1
        WHEN 'medium'    THEN 2
        WHEN 'high'      THEN 3
        WHEN 'very_high' THEN 4
        ELSE 0 END)
      WHEN 0 THEN 'none'
      WHEN 1 THEN 'low'
      WHEN 2 THEN 'medium'
      WHEN 3 THEN 'high'
      WHEN 4 THEN 'very_high'
      END as max_level
    FROM pollen_current pc
    JOIN cities c ON pc.city_id = c.id
    GROUP BY c.id
  `) as Array<{ city_slug: string; max_level: string }>;
  // Kompaktowy obiekt {slug: level} — ok. 20KB
  const cityLevels: Record<string, string> = {};
  for (const row of cityLevelsRaw) cityLevels[row.city_slug] = row.max_level;
  writeJSON("city-levels.json", cityLevels);

  // 5. Wszystkie dane pyłkowe naraz (bulk, in-memory split per miasto)
  console.log("Pobieranie danych pyłkowych dla wszystkich miast...");
  const allPollen = d1Query(`
    SELECT
      c.slug as city_slug,
      p.slug as plant_slug,
      p.name_pl as plant_name,
      p.name_latin,
      p.category,
      p.icon,
      p.color,
      pc.concentration,
      pc.level,
      pc.measured_at
    FROM pollen_current pc
    JOIN plants p ON pc.plant_id = p.id
    JOIN cities c ON pc.city_id = c.id
    ORDER BY c.id, p.category, pc.concentration DESC
  `) as Array<{ city_slug: string } & Record<string, unknown>>;

  console.log("Pobieranie prognoz dla wszystkich miast...");
  const allForecast = d1Query(`
    SELECT
      c.slug as city_slug,
      pf.forecast_date,
      p.slug as plant_slug,
      p.name_pl as plant_name,
      p.category,
      pf.concentration,
      pf.level
    FROM pollen_forecast pf
    JOIN plants p ON pf.plant_id = p.id
    JOIN cities c ON pf.city_id = c.id
    WHERE pf.forecast_date >= date('now')
    ORDER BY c.id, pf.forecast_date, p.category
  `) as Array<{ city_slug: string } & Record<string, unknown>>;

  console.log("Pobieranie danych pogodowych i Walk Index...");
  const allWeather = d1Query(`
    SELECT c.slug as city_slug, wc.*, wi.score, wi.recommendation, wi.best_time, wi.reason
    FROM weather_current wc
    JOIN cities c ON wc.city_id = c.id
    LEFT JOIN walk_index wi ON wi.city_id = wc.city_id
  `) as Array<{ city_slug: string } & Record<string, unknown>>;

  // Grupowanie w pamięci
  const pollenByCity = new Map<string, typeof allPollen>();
  for (const row of allPollen) {
    const arr = pollenByCity.get(row.city_slug) ?? [];
    arr.push(row);
    pollenByCity.set(row.city_slug, arr);
  }
  const forecastByCity = new Map<string, typeof allForecast>();
  for (const row of allForecast) {
    const arr = forecastByCity.get(row.city_slug) ?? [];
    arr.push(row);
    forecastByCity.set(row.city_slug, arr);
  }
  const weatherByCity = new Map<string, (typeof allWeather)[0]>();
  for (const row of allWeather) {
    weatherByCity.set(row.city_slug, row);
  }

  // Zapis per miasto
  console.log(`Generowanie JSON dla ${cities.length} miast...`);
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    writeJSON(`cities/${city.slug}.json`, {
      pollen: pollenByCity.get(city.slug) ?? [],
      forecast: forecastByCity.get(city.slug) ?? [],
      weather: weatherByCity.get(city.slug) ?? null,
    });
    if ((i + 1) % 200 === 0) console.log(`  ${i + 1}/${cities.length}...`);
  }

  // 6. Historia pyłkowa (ostatnie 30 dni) — pobierana partiami per województwo
  console.log("Generowanie plików historii pyłkowej (partie per województwo)...");

  type HistoryRow = { date: string; concentration: number; level: string };
  type PlantMeta = { plant_slug: string; plant_name: string; category: string; icon: string; data: HistoryRow[] };

  let historyCount = 0;

  for (const voiv of voivodeships as Array<{ slug: string }>) {
    const batch = d1Query(`
      SELECT
        c.slug as city_slug,
        p.slug as plant_slug,
        p.name_pl as plant_name,
        p.category,
        p.icon,
        ph.date,
        ph.concentration,
        ph.level
      FROM pollen_history ph
      JOIN cities c ON ph.city_id = c.id
      JOIN voivodeships v ON c.voivodeship_id = v.id
      JOIN plants p ON ph.plant_id = p.id
      WHERE ph.date >= date('now', '-30 days')
        AND v.slug = '${voiv.slug}'
      ORDER BY c.id, p.id, ph.date
    `) as Array<{
      city_slug: string; plant_slug: string; plant_name: string;
      category: string; icon: string; date: string;
      concentration: number; level: string;
    }>;

    const byCity = new Map<string, Map<string, PlantMeta>>();
    for (const row of batch) {
      if (!byCity.has(row.city_slug)) byCity.set(row.city_slug, new Map());
      const pm = byCity.get(row.city_slug)!;
      if (!pm.has(row.plant_slug)) {
        pm.set(row.plant_slug, { plant_slug: row.plant_slug, plant_name: row.plant_name, category: row.category, icon: row.icon, data: [] });
      }
      pm.get(row.plant_slug)!.data.push({ date: row.date, concentration: row.concentration, level: row.level });
    }

    for (const [citySlug, plantMap] of byCity) {
      writeJSON(`history/${citySlug}.json`, Array.from(plantMap.values()));
      historyCount++;
    }
  }
  console.log(`  Zapisano historię dla ${historyCount} miast.`);

  // 7. Meta
  writeJSON("meta.json", {
    updated_at: new Date().toISOString(),
    cities_count: cities.length,
  });

  console.log(`\nGotowe! Wygenerowano dane dla ${cities.length} miast.`);
}

main().catch(err => {
  console.error("Błąd:", err);
  process.exit(1);
});
