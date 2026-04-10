import { requireAdmin, AuthError } from '../../lib/auth.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  try { await requireAdmin(request, env); }
  catch (e) {
    if (e instanceof AuthError) return json({ error: e.message }, e.status, cors);
    throw e;
  }

  const badges = await env.DB.prepare(
    'SELECT id, label_pl, icon, bg, color, description FROM badges ORDER BY created_at'
  ).all<{ id: string; label_pl: string; icon: string; bg: string; color: string; description: string | null }>();

  return json({ badges: badges.results ?? [] }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
