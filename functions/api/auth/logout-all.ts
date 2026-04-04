import { requireAuth, AuthError } from '../../lib/auth.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  let authUser;
  try {
    authUser = await requireAuth(request, env);
  } catch (e) {
    if (e instanceof AuthError) return json({ error: e.message }, e.status, cors);
    throw e;
  }

  const result = await env.DB.prepare(
    'DELETE FROM refresh_tokens WHERE user_id = ?'
  ).bind(authUser.sub).run();

  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO auth_audit_log (user_id, action, ip_address, metadata, created_at)
    VALUES (?, 'logout_all', ?, ?, ?)
  `).bind(
    authUser.sub,
    request.headers.get('CF-Connecting-IP') ?? 'unknown',
    JSON.stringify({ deleted_count: result.meta?.changes ?? 0 }),
    now
  ).run();

  return json(
    { message: 'Wylogowano ze wszystkich urzadzen' },
    200,
    {
      ...cors,
      'Set-Cookie':
        'refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=0',
    }
  );
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
};
