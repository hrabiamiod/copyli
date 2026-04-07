import { requireAuth, AuthError } from '../../lib/auth.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

const VALID_LABELS = ['dom', 'praca', 'inne'] as const;
type Label = typeof VALID_LABELS[number];
const MAX_LOCATIONS = 5;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  const { results } = await env.DB.prepare(`
    SELECT ul.id, ul.city_id, ul.label, ul.is_primary, c.name, c.slug,
           v.name as voivodeship_name
    FROM user_locations ul
    JOIN cities c ON c.id = ul.city_id
    JOIN voivodeships v ON v.id = c.voivodeship_id
    WHERE ul.user_id = ?
    ORDER BY ul.is_primary DESC, ul.created_at ASC
  `).bind(authUser.sub).all();

  return json({ locations: results ?? [] }, 200, cors);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  let body: { city_id?: unknown; label?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane wejściowe' }, 400, cors); }

  const { city_id, label = 'inne' } = body;

  if (typeof city_id !== 'number' || !Number.isInteger(city_id) || city_id <= 0) {
    return json({ error: 'Nieprawidłowe city_id' }, 400, cors);
  }
  if (!VALID_LABELS.includes(label as Label)) {
    return json({ error: 'label musi być: dom, praca lub inne' }, 400, cors);
  }

  // Sprawdź czy miasto istnieje
  const city = await env.DB.prepare('SELECT id FROM cities WHERE id = ?').bind(city_id).first();
  if (!city) return json({ error: 'Nie znaleziono miasta' }, 404, cors);

  // Limit lokalizacji per użytkownik
  const count = await env.DB.prepare(
    'SELECT COUNT(*) as cnt FROM user_locations WHERE user_id = ?'
  ).bind(authUser.sub).first<{ cnt: number }>();
  if ((count?.cnt ?? 0) >= MAX_LOCATIONS) {
    return json({ error: `Możesz zapisać maksymalnie ${MAX_LOCATIONS} lokalizacji` }, 422, cors);
  }

  const now = new Date().toISOString();

  // Pierwsza lokalizacja → domyślnie primary
  const isFirst = (count?.cnt ?? 0) === 0;

  await env.DB.prepare(`
    INSERT INTO user_locations (user_id, city_id, label, is_primary, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, city_id) DO UPDATE SET label = excluded.label
  `).bind(authUser.sub, city_id, label, isFirst ? 1 : 0, now).run();

  return json({ message: 'Lokalizacja zapisana' }, 200, cors);
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  let body: { city_id?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane wejściowe' }, 400, cors); }

  const { city_id } = body;
  if (typeof city_id !== 'number' || !Number.isInteger(city_id) || city_id <= 0) {
    return json({ error: 'Nieprawidłowe city_id' }, 400, cors);
  }

  await env.DB.prepare(
    'DELETE FROM user_locations WHERE user_id = ? AND city_id = ?'
  ).bind(authUser.sub, city_id).run();

  return json({ message: 'Lokalizacja usunięta' }, 200, cors);
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  let body: { city_id?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane wejściowe' }, 400, cors); }

  const { city_id } = body;
  if (typeof city_id !== 'number' || !Number.isInteger(city_id) || city_id <= 0) {
    return json({ error: 'Nieprawidłowe city_id' }, 400, cors);
  }

  const now = new Date().toISOString();
  // Zdejmij primary ze wszystkich, ustaw na wybranym
  await env.DB.prepare(
    'UPDATE user_locations SET is_primary = 0 WHERE user_id = ?'
  ).bind(authUser.sub).run();
  await env.DB.prepare(
    'UPDATE user_locations SET is_primary = 1 WHERE user_id = ? AND city_id = ?'
  ).bind(authUser.sub, city_id).run();

  // Audit nie jest potrzebny, ale updated_at warto zaktualizować
  void now;

  return json({ message: 'Lokalizacja główna zaktualizowana' }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
