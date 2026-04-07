import { requireAuth, AuthError } from '../../lib/auth.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

const VALID_SYMPTOMS = [
  'katar', 'lzawienie', 'kaszel', 'kichanie',
  'wysypka', 'dusznosc', 'bol_glowy', 'swedzenie',
] as const;

function isValidDate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d));
}

function validateBody(body: {
  date?: unknown;
  overall_score?: unknown;
  symptoms?: unknown;
  medication?: unknown;
  notes?: unknown;
  city_id?: unknown;
}): string | null {
  if (typeof body.date !== 'string' || !isValidDate(body.date)) {
    return 'date musi być w formacie YYYY-MM-DD';
  }
  // Nie pozwalaj na wpisy z przyszłości (max jutro — uwzględnia strefy czasowe)
  const entryDate = new Date(body.date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (entryDate > tomorrow) return 'Nie można dodać wpisu z przyszłości';

  if (body.overall_score !== undefined) {
    const s = Number(body.overall_score);
    if (!Number.isInteger(s) || s < 1 || s > 5) return 'overall_score musi być liczbą 1–5';
  }
  if (body.symptoms !== undefined) {
    if (!Array.isArray(body.symptoms)) return 'symptoms musi być tablicą';
    for (const sym of body.symptoms as unknown[]) {
      if (!VALID_SYMPTOMS.includes(sym as typeof VALID_SYMPTOMS[number])) {
        return `Nieznany objaw: ${String(sym)}`;
      }
    }
  }
  if (body.notes !== undefined && typeof body.notes !== 'string') return 'notes musi być tekstem';
  if (body.medication !== undefined && typeof body.medication !== 'string') return 'medication musi być tekstem';
  if (body.city_id !== undefined && body.city_id !== null) {
    if (typeof body.city_id !== 'number' || !Number.isInteger(body.city_id) || body.city_id <= 0) {
      return 'Nieprawidłowe city_id';
    }
  }
  return null;
}

/* ─── GET /api/user/diary?from=YYYY-MM-DD&to=YYYY-MM-DD ─── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  const url = new URL(request.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  // Domyślnie: ostatnie 30 dni
  const toDate = (to && isValidDate(to)) ? to : new Date().toISOString().slice(0, 10);
  const fromDate = (from && isValidDate(from))
    ? from
    : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { results } = await env.DB.prepare(`
    SELECT sd.id, sd.date, sd.overall_score, sd.symptoms, sd.medication, sd.notes,
           sd.city_id, c.name as city_name, c.slug as city_slug
    FROM symptom_diary sd
    LEFT JOIN cities c ON c.id = sd.city_id
    WHERE sd.user_id = ? AND sd.date BETWEEN ? AND ?
    ORDER BY sd.date DESC
    LIMIT 90
  `).bind(authUser.sub, fromDate, toDate).all();

  const entries = (results ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      ...row,
      symptoms: typeof row.symptoms === 'string' ? JSON.parse(row.symptoms) : [],
    };
  });

  return json({ entries, from: fromDate, to: toDate }, 200, cors);
};

/* ─── POST /api/user/diary — upsert wpisu ─── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  let body: {
    date?: unknown; overall_score?: unknown; symptoms?: unknown;
    medication?: unknown; notes?: unknown; city_id?: unknown;
  };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane wejściowe' }, 400, cors); }

  const err = validateBody(body);
  if (err) return json({ error: err }, 400, cors);

  const now = new Date().toISOString();
  const symptomsJson = JSON.stringify(body.symptoms ?? []);
  const notes = typeof body.notes === 'string' ? body.notes.slice(0, 1000) : null;
  const medication = typeof body.medication === 'string' ? body.medication.slice(0, 200) : null;
  const cityId = (typeof body.city_id === 'number') ? body.city_id : null;

  await env.DB.prepare(`
    INSERT INTO symptom_diary (user_id, date, overall_score, symptoms, medication, notes, city_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      overall_score = excluded.overall_score,
      symptoms      = excluded.symptoms,
      medication    = excluded.medication,
      notes         = excluded.notes,
      city_id       = excluded.city_id,
      updated_at    = excluded.updated_at
  `).bind(
    authUser.sub, body.date, body.overall_score ?? null,
    symptomsJson, medication, notes, cityId, now, now
  ).run();

  return json({ message: 'Wpis zapisany', date: body.date }, 200, cors);
};

/* ─── DELETE /api/user/diary ─── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  let body: { date?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane wejściowe' }, 400, cors); }

  if (typeof body.date !== 'string' || !isValidDate(body.date)) {
    return json({ error: 'date musi być w formacie YYYY-MM-DD' }, 400, cors);
  }

  await env.DB.prepare(
    'DELETE FROM symptom_diary WHERE user_id = ? AND date = ?'
  ).bind(authUser.sub, body.date).run();

  return json({ message: 'Wpis usunięty' }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
