import { requireAdmin, AuthError } from '../../../../lib/auth.ts';
import { json, corsHeaders } from '../../../../lib/response.ts';
import type { Env } from '../../../../lib/types.ts';

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  let adminUser;
  try { adminUser = await requireAdmin(request, env); }
  catch (e) {
    if (e instanceof AuthError) return json({ error: e.message }, e.status, cors);
    throw e;
  }

  const userId = params.id as string;
  let body: { badge_id?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidlowe dane' }, 400, cors); }

  if (typeof body.badge_id !== 'string' || !body.badge_id) {
    return json({ error: 'badge_id jest wymagany' }, 400, cors);
  }

  const badge = await env.DB.prepare('SELECT id FROM badges WHERE id = ?').bind(body.badge_id).first();
  if (!badge) return json({ error: 'Nieznana odznaka' }, 404, cors);

  const user = await env.DB.prepare('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL').bind(userId).first();
  if (!user) return json({ error: 'Użytkownik nie istnieje' }, 404, cors);

  await env.DB.prepare(
    'INSERT OR IGNORE INTO user_badges (user_id, badge_id, granted_at, granted_by) VALUES (?, ?, ?, ?)'
  ).bind(userId, body.badge_id, new Date().toISOString(), adminUser.sub).run();

  return json({ ok: true }, 200, cors);
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  try { await requireAdmin(request, env); }
  catch (e) {
    if (e instanceof AuthError) return json({ error: e.message }, e.status, cors);
    throw e;
  }

  const userId = params.id as string;
  let body: { badge_id?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidlowe dane' }, 400, cors); }

  if (typeof body.badge_id !== 'string' || !body.badge_id) {
    return json({ error: 'badge_id jest wymagany' }, 400, cors);
  }

  await env.DB.prepare(
    'DELETE FROM user_badges WHERE user_id = ? AND badge_id = ?'
  ).bind(userId, body.badge_id).run();

  return json({ ok: true }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
