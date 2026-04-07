/**
 * Wysyła codzienne alerty pyłkowe do użytkowników z włączonymi powiadomieniami.
 * Filtruje wg. alert_time (hour) i deduplikuje (max 1 email/użytkownik/dzień).
 *
 * Uruchamiany przez GitHub Actions co godzinę 4–9 UTC.
 * Użycie: npx tsx scripts/send-alerts.ts
 *
 * Wymagane env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID, RESEND_API_KEY
 */

import { sendPollenAlertEmail, type AlertPlant } from '../functions/lib/email.ts';

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

const LEVEL_SCORE: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3, very_high: 4 };
const THRESHOLD_SCORE: Record<string, number> = { medium: 2, high: 3, very_high: 4 };

async function d1Query(
  sql: string,
  params: (string | number | null)[] = []
): Promise<{ results: Record<string, unknown>[] }> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.D1_DATABASE_ID;

  const res = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/d1/database/${dbId}/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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

async function main() {
  const requiredEnvs = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'D1_DATABASE_ID', 'RESEND_API_KEY'];
  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      console.error(`Brak zmiennej środowiskowej: ${env}`);
      process.exit(1);
    }
  }

  const resendKey = process.env.RESEND_API_KEY!;

  // Bieżąca godzina w strefie Warsaw
  const warsawTime = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    hour: '2-digit',
    hour12: false,
  }).format(new Date());
  const currentHour = parseInt(warsawTime, 10);
  const todayStr = new Date().toISOString().substring(0, 10);

  const force = process.argv.includes('--force');
  console.log(`Uruchamianie alertów. Godzina Warsaw: ${currentHour}:xx, data: ${todayStr}${force ? ' [--force]' : ''}`);

  // Pobierz użytkowników których pora alertu pasuje do bieżącej godziny
  // i którzy nie dostali jeszcze dzisiaj alertu
  const hourFilter = force ? '' : 'AND CAST(SUBSTR(uns.alert_time, 1, 2) AS INTEGER) = ?';
  const dedupFilter = force ? '' : `AND u.id NOT IN (
        SELECT user_id FROM auth_audit_log
        WHERE action = 'pollen_alert_sent'
          AND DATE(created_at) = ?
      )`;
  const queryParams = force ? [] : [currentHour, todayStr];

  const { results: users } = await d1Query(`
    SELECT u.id, u.email, u.display_name,
           uns.alert_threshold, uns.alert_time,
           ul.city_id
    FROM users u
    JOIN user_notification_settings uns ON uns.user_id = u.id AND uns.email_alerts = 1
    JOIN user_locations ul ON ul.user_id = u.id AND ul.is_primary = 1
    WHERE u.email_verified = 1 AND u.deleted_at IS NULL
      ${hourFilter}
      ${dedupFilter}
  `, queryParams);

  console.log(`Znaleziono ${users.length} użytkowników do potencjalnego alertu (godzina ${currentHour})`);

  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    const userId = user.id as string;
    const cityId = user.city_id as number;
    const threshold = user.alert_threshold as string;

    // Pobierz alergeny użytkownika
    const { results: allergens } = await d1Query(
      `SELECT p.slug FROM user_allergens ua
       JOIN plants p ON p.id = ua.plant_id
       WHERE ua.user_id = ?`,
      [userId]
    );
    if (!allergens.length) { skipped++; continue; }

    const slugList = allergens.map(a => `'${(a.slug as string).replace(/'/g, "''")}'`).join(',');

    // Pobierz aktualne stężenia pyłków dla alergenów użytkownika w jego mieście
    const { results: pollenRows } = await d1Query(
      `SELECT p.name_pl, p.icon, pc.level
       FROM pollen_current pc
       JOIN plants p ON p.id = pc.plant_id
       WHERE pc.city_id = ? AND p.slug IN (${slugList})`,
      [cityId]
    );

    // Filtruj wg. progu
    const thresholdScore = THRESHOLD_SCORE[threshold] ?? 2;
    const alertPlants: AlertPlant[] = pollenRows
      .filter(p => (LEVEL_SCORE[p.level as string] ?? 0) >= thresholdScore)
      .map(p => ({ name_pl: p.name_pl as string, icon: p.icon as string, level: p.level as string }));

    if (!alertPlants.length) { skipped++; continue; }

    // Pobierz nazwę miasta
    const { results: cityRows } = await d1Query(
      `SELECT name FROM cities WHERE id = ?`,
      [cityId]
    );
    const cityName = (cityRows[0]?.name as string) ?? 'Twoim mieście';

    // Wyślij email
    try {
      await sendPollenAlertEmail(
        resendKey,
        user.email as string,
        (user.display_name as string | null),
        cityName,
        alertPlants
      );
      // Zapisz w audit log (deduplication)
      await d1Query(
        `INSERT INTO auth_audit_log (user_id, action, ip_address, created_at)
         VALUES (?, 'pollen_alert_sent', 'github-actions', ?)`,
        [userId, new Date().toISOString()]
      );
      console.log(`✓ Alert → ${user.email} | ${cityName} | ${alertPlants.map(p => p.name_pl).join(', ')}`);
      sent++;
    } catch (e) {
      console.warn(`✗ Błąd wysyłki → ${user.email}: ${(e as Error).message}`);
    }
  }

  console.log(`\nZakończono. Wysłano: ${sent}, pominięto (brak alertu): ${skipped}.`);
}

main().catch(err => {
  console.error('Błąd:', err);
  process.exit(1);
});
