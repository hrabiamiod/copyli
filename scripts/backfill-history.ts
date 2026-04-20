/**
 * Jednorazowy backfill pollen_history — pobiera ostatnie 90 dni z Open-Meteo
 * i wypełnia tabelę pollen_history poprawnymi danymi.
 *
 * Użycie: npx tsx scripts/backfill-history.ts
 * Wymaga: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID
 */

const CF_API_BASE = "https://api.cloudflare.com/client/v4";
const OPEN_METEO_AIR_QUALITY = "https://air-quality-api.open-meteo.com/v1/air-quality";
const BATCH_SIZE = 20; // mniejszy batch — more API calls but safer
const PAST_DAYS = 90;

interface City { id: number; name: string; slug: string; lat: number; lon: number; }
interface Plant { id: number; slug: string; threshold_low: number; threshold_medium: number; threshold_high: number; }

const POLLEN_FIELD_MAP: Record<string, string> = {
  alder_pollen: "alder",
  birch_pollen: "birch",
  grass_pollen: "grass",
  mugwort_pollen: "mugwort",
  ragweed_pollen: "ragweed",
};

function getLevel(c: number, plant: Plant): string {
  if (c <= 0) return "none";
  if (c < plant.threshold_low) return "low";
  if (c < plant.threshold_medium) return "medium";
  if (c < plant.threshold_high) return "high";
  return "very_high";
}

function getDayAverage(values: (number | null)[], times: string[], dateStr: string): number {
  const dayVals = times
    .map((t, i) => ({ t, v: values[i] }))
    .filter(({ t }) => t.startsWith(dateStr))
    .map(({ v }) => v)
    .filter((v): v is number => v !== null && v !== undefined && v >= 0);
  if (dayVals.length === 0) return 0;
  return dayVals.reduce((a, b) => a + b, 0) / dayVals.length;
}

async function d1Query(sql: string): Promise<Record<string, unknown>[]> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.D1_DATABASE_ID;
  const res = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/d1/database/${dbId}/query`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    }
  );
  if (!res.ok) throw new Error(`D1 failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { result?: [{ results?: Record<string, unknown>[] }] };
  return data.result?.[0]?.results ?? [];
}

async function d1Insert(rows: string[]): Promise<void> {
  if (!rows.length) return;
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const sql = `INSERT OR REPLACE INTO pollen_history (city_id, plant_id, date, concentration, level) VALUES ${chunk.join(",")}`;
    await d1Query(sql);
  }
}

async function fetchHistory(lat: number, lon: number): Promise<{ hourly: { time: string[] } & Record<string, (number|null)[]> } | null> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: "alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,ragweed_pollen",
    past_days: PAST_DAYS.toString(),
    forecast_days: "1",
    timezone: "Europe/Warsaw",
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${OPEN_METEO_AIR_QUALITY}?${params}`, { signal: AbortSignal.timeout(12000) });
      if (res.ok) return (await res.json()) as { hourly: { time: string[] } & Record<string, (number|null)[]> };
      if (res.status === 429) { await new Promise(r => setTimeout(r, 2000)); continue; }
      return null;
    } catch { await new Promise(r => setTimeout(r, 1000)); }
  }
  return null;
}

async function main() {
  const required = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "D1_DATABASE_ID"];
  for (const env of required) {
    if (!process.env[env]) { console.error(`Brak: ${env}`); process.exit(1); }
  }

  console.log("Pobieranie listy miast...");
  const cities = (await d1Query("SELECT id, name, slug, lat, lon FROM cities ORDER BY population DESC")) as City[];
  console.log(`Znaleziono ${cities.length} miast`);

  console.log("Pobieranie listy roślin...");
  const plants = (await d1Query("SELECT id, slug, threshold_low, threshold_medium, threshold_high FROM plants")) as Plant[];
  console.log(`Znaleziono ${plants.length} roślin`);

  // Wyczyść stare zerowe dane (artefakty buga)
  console.log("Usuwanie zerowych danych historycznych (artefakty timezone-buga)...");
  await d1Query("DELETE FROM pollen_history WHERE level = 'none' AND concentration = 0");
  console.log("  Usunięto zera.");

  let totalInserted = 0;

  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE);
    const batchEnd = Math.min(i + BATCH_SIZE, cities.length);
    process.stdout.write(`\rPrzetwarzanie miast ${i + 1}-${batchEnd}/${cities.length}...`);

    const historyRows: string[] = [];
    await Promise.all(batch.map(async (city) => {
      const data = await fetchHistory(city.lat, city.lon);
      if (!data?.hourly) return;
      const times = data.hourly.time;

      // Zbierz unikalne daty historyczne
      const dates = new Set(times.map(t => t.substring(0, 10)));

      for (const [field, plantSlug] of Object.entries(POLLEN_FIELD_MAP)) {
        const plant = plants.find(p => p.slug === plantSlug);
        if (!plant) continue;
        const values = data.hourly[field] as (number | null)[] | undefined;
        if (!values) continue;

        for (const date of dates) {
          const avg = getDayAverage(values, times, date);
          const level = getLevel(avg, plant);
          // Zapisuj tylko jeśli jest aktywność lub jest to ostatnie 90 dni
          historyRows.push(`(${city.id}, ${plant.id}, '${date}', ${avg.toFixed(2)}, '${level}')`);
        }
      }
    }));

    if (historyRows.length > 0) {
      await d1Insert(historyRows);
      totalInserted += historyRows.length;
    }

    // Krótka przerwa między batchami żeby nie przeciążać D1
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n\nZakończono! Wstawionych wierszy: ${totalInserted}`);
}

main().catch(err => { console.error("Błąd:", err); process.exit(1); });
