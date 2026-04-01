/**
 * Pobiera aktualne dane pyłkowe z Open-Meteo dla wszystkich miast w D1
 * i zapisuje wyniki z powrotem do D1.
 *
 * Uruchamiany przez GitHub Actions co 1-2h.
 * Użycie: npx tsx scripts/fetch-pollen.ts
 *
 * Wymagane env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID
 */

const CF_API_BASE = "https://api.cloudflare.com/client/v4";
const OPEN_METEO_AIR_QUALITY = "https://air-quality-api.open-meteo.com/v1/air-quality";
const OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast";
const BATCH_SIZE = 50;
const FORECAST_DAYS = 5;

interface City {
  id: number;
  name: string;
  slug: string;
  lat: number;
  lon: number;
}

interface Plant {
  id: number;
  slug: string;
  name_pl: string;
  threshold_low: number;
  threshold_medium: number;
  threshold_high: number;
}

interface OpenMeteoAirQuality {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    alder_pollen?: number[];
    birch_pollen?: number[];
    grass_pollen?: number[];
    mugwort_pollen?: number[];
    olive_pollen?: number[];
    ragweed_pollen?: number[];
    european_aqi?: number[];
    pm10?: number[];
    pm2_5?: number[];
    wind_speed_10m?: number[];
    precipitation?: number[];
    relative_humidity_2m?: number[];
    temperature_2m?: number[];
  };
}

// Mapowanie Open-Meteo → slug rośliny w bazie
const POLLEN_FIELD_MAP: Record<string, string> = {
  alder_pollen:    "alder",
  birch_pollen:    "birch",
  grass_pollen:    "grass",
  mugwort_pollen:  "mugwort",
  ragweed_pollen:  "ragweed",
};

function getLevel(concentration: number | null, plant: Plant): string {
  if (!concentration || concentration <= 0) return "none";
  if (concentration < plant.threshold_low) return "low";
  if (concentration < plant.threshold_medium) return "medium";
  if (concentration < plant.threshold_high) return "high";
  return "very_high";
}

function getCurrentHourIndex(times: string[]): number {
  const now = new Date();
  const nowHour = now.toISOString().substring(0, 13); // "2024-04-15T14"
  const idx = times.findIndex(t => t.startsWith(nowHour));
  return idx >= 0 ? idx : Math.max(0, times.length - 1);
}

function getDayAverage(values: (number | null)[], times: string[], dateStr: string): number {
  const dayValues = times
    .map((t, i) => ({ t, v: values[i] }))
    .filter(({ t }) => t.startsWith(dateStr))
    .map(({ v }) => v)
    .filter((v): v is number => v !== null && v !== undefined && v >= 0);
  if (dayValues.length === 0) return 0;
  return dayValues.reduce((a, b) => a + b, 0) / dayValues.length;
}

// Cloudflare D1 REST API
async function d1Query(sql: string, params: (string | number | null)[] = []): Promise<{ results?: Record<string, unknown>[] }> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.D1_DATABASE_ID;

  const res = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/d1/database/${dbId}/query`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`D1 query failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { result?: [{ results?: Record<string, unknown>[] }] };
  return { results: data.result?.[0]?.results ?? [] };
}

// Wysyła wiele row VALUES w jednym INSERT — jeden HTTP request na tabelę per batch miast
async function d1MultiInsert(table: string, columns: string, valueRows: string[]): Promise<void> {
  if (!valueRows.length) return;
  // SQLite ma limit ~500 wierszy per INSERT — dzielimy na chunki
  const CHUNK = 200;
  for (let i = 0; i < valueRows.length; i += CHUNK) {
    const chunk = valueRows.slice(i, i + CHUNK);
    const sql = `INSERT OR REPLACE INTO ${table} (${columns}) VALUES ${chunk.join(",")}`;
    await d1Query(sql);
  }
}

async function fetchOpenMeteo(lat: number, lon: number): Promise<OpenMeteoAirQuality | null> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: [
      "alder_pollen", "birch_pollen", "grass_pollen",
      "mugwort_pollen", "ragweed_pollen",
      "european_aqi", "pm10", "pm2_5",
      "wind_speed_10m", "precipitation",
      "relative_humidity_2m", "temperature_2m"
    ].join(","),
    forecast_days: (FORECAST_DAYS + 1).toString(),
    timezone: "Europe/Warsaw",
  });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${OPEN_METEO_AIR_QUALITY}?${params}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return (await res.json()) as OpenMeteoAirQuality;
      if (res.status === 429 || res.status >= 500) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      return null;
    } catch {
      if (attempt < 1) await new Promise(r => setTimeout(r, 500));
    }
  }
  return null;
}

async function fetchWeather(lat: number, lon: number): Promise<Record<string, (number | null)[]>> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation",
    forecast_days: "2",
    timezone: "Europe/Warsaw",
  });
  try {
    const res = await fetch(`${OPEN_METEO_FORECAST}?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return {};
    const d = (await res.json()) as { hourly?: Record<string, (number | null)[]> };
    return d.hourly ?? {};
  } catch {
    return {};
  }
}

async function processBatch(cities: City[], plants: Plant[]): Promise<void> {
  const now = new Date().toISOString();

  // Zbieramy VALUES z całego batchu — potem jeden INSERT per tabela
  const currentRows: string[] = [];
  const forecastRows: string[] = [];
  const weatherRows: string[] = [];

  const promises = cities.map(async (city) => {
    const [data, weather] = await Promise.all([
      fetchOpenMeteo(city.lat, city.lon),
      fetchWeather(city.lat, city.lon),
    ]);
    if (!data || !data.hourly) return;
    if (weather.temperature_2m) data.hourly.temperature_2m = weather.temperature_2m;
    if (weather.relative_humidity_2m) data.hourly.relative_humidity_2m = weather.relative_humidity_2m;
    if (weather.wind_speed_10m) data.hourly.wind_speed_10m = weather.wind_speed_10m;
    if (weather.precipitation) data.hourly.precipitation = weather.precipitation;

    const times = data.hourly.time;
    const currentIdx = getCurrentHourIndex(times);

    for (const [field, plantSlug] of Object.entries(POLLEN_FIELD_MAP)) {
      const plant = plants.find(p => p.slug === plantSlug);
      if (!plant) continue;

      const values = data.hourly[field as keyof typeof data.hourly] as (number | null)[] | undefined;
      if (!values) continue;

      const currentConc = values[currentIdx] ?? 0;
      const currentLevel = getLevel(currentConc, plant);
      const measuredAt = (times[currentIdx] ?? now).replace(/'/g, "''");

      currentRows.push(
        `(${city.id}, ${plant.id}, ${currentConc}, '${currentLevel}', 'open-meteo', '${measuredAt}', '${now}')`
      );

      for (let day = 1; day <= FORECAST_DAYS; day++) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + day);
        const dateStr = forecastDate.toISOString().substring(0, 10);
        const avgConc = getDayAverage(values, times, dateStr);
        const level = getLevel(avgConc, plant);
        forecastRows.push(
          `(${city.id}, ${plant.id}, '${dateStr}', ${avgConc.toFixed(2)}, '${level}', '${now}')`
        );
      }

      if (plantSlug === "grass") {
        const windSpeed = (data.hourly.wind_speed_10m as (number | null)[] | undefined)?.[currentIdx] ?? 0;
        const precipitation = (data.hourly.precipitation as (number | null)[] | undefined)?.[currentIdx] ?? 0;
        const humidity = (data.hourly.relative_humidity_2m as (number | null)[] | undefined)?.[currentIdx] ?? 0;
        const temperature = (data.hourly.temperature_2m as (number | null)[] | undefined)?.[currentIdx] ?? 0;
        const aqi = (data.hourly.european_aqi as (number | null)[] | undefined)?.[currentIdx] ?? 0;
        const aqiLabel = aqi <= 20 ? "dobra" : aqi <= 40 ? "umiarkowana" : aqi <= 60 ? "zła" : "bardzo zła";
        weatherRows.push(
          `(${city.id}, ${temperature}, ${windSpeed}, ${precipitation}, ${humidity}, ${aqi}, '${aqiLabel}', '${now}')`
        );
      }
    }
  });

  await Promise.all(promises);

  // 3 zapytania na cały batch miast zamiast ~310 pojedynczych
  await Promise.all([
    d1MultiInsert("weather_current", "city_id, temperature, wind_speed, precipitation, humidity, aqi, aqi_label, updated_at", weatherRows),
    d1MultiInsert("pollen_current", "city_id, plant_id, concentration, level, source, measured_at, updated_at", currentRows),
    d1MultiInsert("pollen_forecast", "city_id, plant_id, forecast_date, concentration, level, updated_at", forecastRows),
  ]);
}

async function main() {
  const requiredEnvs = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "D1_DATABASE_ID"];
  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      console.error(`Brak zmiennej środowiskowej: ${env}`);
      process.exit(1);
    }
  }

  const missingOnly = process.argv.includes("--missing-only");
  console.log("Pobieranie listy miast z D1...");
  const citiesSql = missingOnly
    ? "SELECT id, name, slug, lat, lon FROM cities WHERE id NOT IN (SELECT DISTINCT city_id FROM pollen_current) ORDER BY population DESC"
    : "SELECT id, name, slug, lat, lon FROM cities ORDER BY population DESC";
  const citiesResult = await d1Query(citiesSql);
  const cities = (citiesResult.results ?? []) as unknown as City[];
  console.log(`Znaleziono ${cities.length} miast`);

  console.log("Pobieranie listy roślin z D1...");
  const plantsResult = await d1Query("SELECT id, slug, name_pl, threshold_low, threshold_medium, threshold_high FROM plants");
  const plants = (plantsResult.results ?? []) as unknown as Plant[];
  console.log(`Znaleziono ${plants.length} roślin`);

  // Przetwarzaj w batchach
  let processed = 0;
  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE);
    console.log(`Przetwarzanie miast ${i + 1}-${Math.min(i + BATCH_SIZE, cities.length)}/${cities.length}...`);
    await processBatch(batch, plants);
    processed += batch.length;

    // Krótka przerwa między batchami
    if (i + BATCH_SIZE < cities.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log(`\nZakończono. Przetworzono ${processed} miast.`);
  console.log("Uruchamianie generowania danych statycznych...");
}

main().catch(err => {
  console.error("Błąd:", err);
  process.exit(1);
});
