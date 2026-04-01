/**
 * Oblicza Indeks Spacerowy dla każdego miasta.
 * Łączy dane pyłkowe z warunkami pogodowymi.
 *
 * Algorytm:
 * - Baza: 100 pkt (idealne warunki)
 * - Odjęcia za pyłki: -5 (niskie) -15 (średnie) -30 (wysokie) -50 (bardzo wysokie)
 * - Deszcz (>0.5mm/h): +20 (zmywa pyłki)
 * - Silny wiatr (>20km/h): -15 (rozprasza pyłki)
 * - Rano (6-10): -15 (szczyt stężeń)
 * - Po deszczu (18-21): +10 (najlepszy czas)
 */

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

interface WeatherData {
  city_id: number;
  wind_speed: number;
  precipitation: number;
  humidity: number;
  temperature: number;
}

interface PollenSummary {
  city_id: number;
  max_level: string;
  high_count: number;
}

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

  if (!res.ok) throw new Error(`D1 error: ${res.status}`);
  const data = (await res.json()) as { result?: [{ results?: Record<string, unknown>[] }] };
  return { results: data.result?.[0]?.results ?? [] };
}

function calcScore(weather: WeatherData, pollen: PollenSummary): {
  score: number;
  recommendation: string;
  best_time: string;
  reason: string;
} {
  let score = 100;
  const reasons: string[] = [];

  // Kary za pyłki
  const levelPenalty: Record<string, number> = {
    none: 0, low: 5, medium: 15, high: 30, very_high: 50
  };
  const pollenPenalty = levelPenalty[pollen.max_level] ?? 0;
  score -= pollenPenalty;
  if (pollenPenalty > 0) reasons.push(`pylenie ${pollen.max_level}`);

  // Dodatkowa kara za wiele pylących roślin
  if (pollen.high_count >= 2) {
    score -= 10;
    reasons.push("wiele roślin pyli jednocześnie");
  }

  // Deszcz zmywa pyłki — bonus
  if (weather.precipitation > 0.5) {
    score += 20;
    reasons.push("deszcz zmywa pyłki");
  }

  // Silny wiatr — kara
  if (weather.wind_speed > 20) {
    score -= 15;
    reasons.push("silny wiatr unosi pyłki");
  }

  // Upewnij się, że score w zakresie 0-100
  score = Math.max(0, Math.min(100, score));

  // Godzina szczytu pyłkowego — rano (6-10)
  const hour = new Date().getHours();
  const isMorningPeak = hour >= 6 && hour <= 10;
  const isEveningGood = hour >= 17 && hour <= 20;

  let best_time = "po 17:00";
  if (weather.precipitation > 0.5) best_time = "teraz — deszcz czyści powietrze";
  else if (isMorningPeak && score < 60) best_time = "po 17:00 (rano jest szczyt pylenia)";
  else if (isEveningGood) best_time = "teraz — dobra pora";
  else if (score >= 75) best_time = "przez cały dzień";

  let recommendation: string;
  if (score >= 80) recommendation = "Wyjdź śmiało!";
  else if (score >= 60) recommendation = "Wyjdź, ale obserwuj objawy";
  else if (score >= 40) recommendation = "Ogranicz czas na zewnątrz";
  else recommendation = "Zostań w domu";

  const reason = reasons.length > 0 ? reasons.join(", ") : "normalne warunki";

  return { score, recommendation, best_time, reason };
}

async function main() {
  const now = new Date().toISOString();

  console.log("Pobieranie danych pogodowych...");
  const weatherRes = await d1Query(`
    SELECT city_id, wind_speed, precipitation, humidity, temperature
    FROM weather_current
  `);
  const weatherMap = new Map<number, WeatherData>();
  for (const r of (weatherRes.results ?? []) as unknown as WeatherData[]) {
    weatherMap.set(r.city_id, r);
  }

  console.log("Pobieranie podsumowania pyłkowego...");
  const pollenRes = await d1Query(`
    SELECT
      city_id,
      MAX(level) as max_level,
      COUNT(CASE WHEN level IN ('high', 'very_high') THEN 1 END) as high_count
    FROM pollen_current
    GROUP BY city_id
  `);
  const pollenMap = new Map<number, PollenSummary>();
  for (const r of (pollenRes.results ?? []) as unknown as PollenSummary[]) {
    pollenMap.set(r.city_id, r);
  }

  console.log("Obliczanie Indeksu Spacerowego...");
  const cityIds = [...new Set([...weatherMap.keys(), ...pollenMap.keys()])];

  for (const cityId of cityIds) {
    const weather = weatherMap.get(cityId) ?? {
      city_id: cityId, wind_speed: 10, precipitation: 0, humidity: 60, temperature: 15
    };
    const pollen = pollenMap.get(cityId) ?? {
      city_id: cityId, max_level: "none", high_count: 0
    };

    const { score, recommendation, best_time, reason } = calcScore(weather, pollen);

    await d1Query(
      `INSERT OR REPLACE INTO walk_index (city_id, score, recommendation, best_time, reason, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [cityId, score, recommendation, best_time, reason, now]
    );
  }

  console.log(`Obliczono Indeks Spacerowy dla ${cityIds.length} miast.`);
}

main().catch(err => {
  console.error("Błąd:", err);
  process.exit(1);
});
