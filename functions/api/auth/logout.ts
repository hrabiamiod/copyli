import { hashToken } from '../../lib/tokens.ts';
import { requireAuth, AuthError } from '../../lib/auth.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  // Auth opcjonalny — wylogowanie dziala nawet z wygaslym access tokenem
  let userId: string | null = null;
  try {
    const authUser = await requireAuth(request, env);
    userId = authUser.sub;
  } catch (e) {
    if (!(e instanceof AuthError)) throw e;
  }

  // Znajdz refresh token (cookie lub body)
  let refreshToken: string | null = null;
  const cookie = request.headers.get('Cookie');
  if (cookie) {
    const match = /(?:^|;\s*)refresh_token=([^;]+)/.exec(cookie);
    if (match?.[1]) refreshToken = match[1];
  }
  if (!refreshToken) {
    try {
      const body = (await request.json()) as { refresh_token?: string };
      refreshToken = body.refresh_token ?? null;
    } catch { /* ignoruj */ }
  }

  if (refreshToken) {
    const tokenHash = await hashToken(refreshToken);
    await env.DB.prepare('DELETE FROM refresh_tokens WHERE token_hash = ?').bind(tokenHash).run();
  }

  if (userId) {
    const now = new Date().toISOString();
    await env.DB.prepare(`
      INSERT INTO auth_audit_log (user_id, action, ip_address, created_at)
      VALUES (?, 'logout', ?, ?)
    `).bind(userId, request.headers.get('CF-Connecting-IP') ?? 'unknown', now).run();
  }

  return json(
    { message: 'Wylogowano pomyslnie' },
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
