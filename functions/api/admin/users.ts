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

  const users = await env.DB.prepare(`
    SELECT id, email, display_name, created_at
    FROM users WHERE deleted_at IS NULL
    ORDER BY created_at ASC
  `).all<{ id: string; email: string; display_name: string | null; created_at: string }>();

  const userBadges = await env.DB.prepare(`
    SELECT ub.user_id, b.id, b.label_pl, b.icon, b.bg, b.color
    FROM user_badges ub
    JOIN badges b ON b.id = ub.badge_id
    ORDER BY ub.granted_at
  `).all<{ user_id: string; id: string; label_pl: string; icon: string; bg: string; color: string }>();

  const badgesByUser: Record<string, typeof userBadges.results> = {};
  for (const ub of userBadges.results ?? []) {
    if (!badgesByUser[ub.user_id]) badgesByUser[ub.user_id] = [];
    badgesByUser[ub.user_id].push(ub);
  }

  const result = (users.results ?? []).map(u => ({
    id: u.id,
    email: u.email,
    display_name: u.display_name,
    created_at: u.created_at,
    badges: (badgesByUser[u.id] ?? []).map(b => ({ id: b.id, label_pl: b.label_pl, icon: b.icon, bg: b.bg, color: b.color })),
  }));

  return json({ users: result }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
