import { requireAuth, AuthError } from '../../lib/auth.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

const VALID_SEVERITIES = ['mild', 'medium', 'severe'] as const;
type Severity = typeof VALID_SEVERITIES[number];

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  const { results } = await env.DB.prepare(`
    SELECT ua.plant_id, ua.severity, p.name_pl, p.slug, p.category, p.icon, p.color
    FROM user_allergens ua
    JOIN plants p ON p.id = ua.plant_id
    WHERE ua.user_id = ?
    ORDER BY p.category, p.name_pl
  `).bind(authUser.sub).all();

  return json({ allergens: results ?? [] }, 200, cors);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  let body: { plant_id?: unknown; severity?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane wejściowe' }, 400, cors); }

  const { plant_id, severity = 'medium' } = body;

  if (typeof plant_id !== 'number' || !Number.isInteger(plant_id) || plant_id <= 0) {
    return json({ error: 'Nieprawidłowe plant_id' }, 400, cors);
  }
  if (!VALID_SEVERITIES.includes(severity as Severity)) {
    return json({ error: 'severity musi być: mild, medium lub severe' }, 400, cors);
  }

  // Sprawdź czy roślina istnieje
  const plant = await env.DB.prepare('SELECT id FROM plants WHERE id = ?').bind(plant_id).first();
  if (!plant) return json({ error: 'Nie znaleziono rośliny' }, 404, cors);

  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO user_allergens (user_id, plant_id, severity, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, plant_id) DO UPDATE SET severity = excluded.severity
  `).bind(authUser.sub, plant_id, severity, now).run();

  return json({ message: 'Alergen dodany' }, 200, cors);
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  let body: { plant_id?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane wejściowe' }, 400, cors); }

  const { plant_id } = body;
  if (typeof plant_id !== 'number' || !Number.isInteger(plant_id) || plant_id <= 0) {
    return json({ error: 'Nieprawidłowe plant_id' }, 400, cors);
  }

  await env.DB.prepare(
    'DELETE FROM user_allergens WHERE user_id = ? AND plant_id = ?'
  ).bind(authUser.sub, plant_id).run();

  return json({ message: 'Alergen usunięty' }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
