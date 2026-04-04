import { generateRefreshToken, hashToken, createAccessToken } from '../../lib/tokens.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

function getRefreshTokenFromRequest(request: Request, body: Record<string, unknown>): string | null {
  const cookie = request.headers.get('Cookie');
  if (cookie) {
    const match = /(?:^|;\s*)refresh_token=([^;]+)/.exec(cookie);
    if (match?.[1]) return match[1];
  }
  return typeof body.refresh_token === 'string' ? body.refresh_token : null;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  // Wymagany naglowek — zabezpieczenie przed CSRF
  const clientType = request.headers.get('X-Copyli-Client');
  if (!clientType) {
    return json({ error: 'Brakujacy naglowek X-Copyli-Client' }, 400, cors);
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch { /* cookie flow — body moze byc pusty */ }

  const refreshToken = getRefreshTokenFromRequest(request, body);
  if (!refreshToken) {
    return json({ error: 'Brak tokenu odswiezania' }, 401, cors);
  }

  const tokenHash = await hashToken(refreshToken);
  const now = new Date().toISOString();

  const stored = await env.DB.prepare(`
    SELECT rt.id, rt.user_id, rt.expires_at,
           u.email, u.display_name, u.email_verified, u.deleted_at
    FROM refresh_tokens rt
    JOIN users u ON u.id = rt.user_id
    WHERE rt.token_hash = ?
  `).bind(tokenHash).first<{
    id: number;
    user_id: string;
    expires_at: string;
    email: string;
    display_name: string | null;
    email_verified: number;
    deleted_at: string | null;
  }>();

  if (!stored) {
    return json({ error: 'Nieprawidlowy lub wygasly token — zaloguj sie ponownie' }, 401, cors);
  }

  if (stored.deleted_at) {
    return json({ error: 'Konto zostalo usuniete' }, 401, cors);
  }

  if (new Date(stored.expires_at) < new Date()) {
    await env.DB.prepare('DELETE FROM refresh_tokens WHERE id = ?').bind(stored.id).run();
    return json({ error: 'Token odswiezania wygasl. Zaloguj sie ponownie.' }, 401, cors);
  }

  // Rotacja: usun stary, wstaw nowy
  await env.DB.prepare('DELETE FROM refresh_tokens WHERE id = ?').bind(stored.id).run();

  const newRefreshToken = generateRefreshToken();
  const newRefreshHash = await hashToken(newRefreshToken);
  const refreshExpires = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000).toISOString();

  await env.DB.prepare(`
    INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at, created_at, last_used_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    stored.user_id,
    newRefreshHash,
    request.headers.get('User-Agent') ?? '',
    request.headers.get('CF-Connecting-IP') ?? '',
    refreshExpires,
    now,
    now
  ).run();

  const accessToken = await createAccessToken(
    { sub: stored.user_id, email: stored.email, name: stored.display_name },
    env.JWT_SECRET
  );

  const isMobile = clientType === 'mobile';
  const responseHeaders: Record<string, string> = { ...cors };

  if (!isMobile) {
    responseHeaders['Set-Cookie'] =
      `refresh_token=${newRefreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=${REFRESH_TTL_SECONDS}`;
  }

  return json(
    {
      access_token: accessToken,
      ...(isMobile ? { refresh_token: newRefreshToken } : {}),
      token_type: 'Bearer',
      expires_in: 900,
    },
    200,
    responseHeaders
  );
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
};
