import { verifyPassword } from '../../lib/password.ts';
import { generateRefreshToken, hashToken, createAccessToken } from '../../lib/tokens.ts';
import { isValidEmail } from '../../lib/validation.ts';
import { checkRateLimit } from '../../lib/rate-limit.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env, AuthUser } from '../../lib/types.ts';

const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;
const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 15;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  try {
    return await _handleLogin(request, env, cors);
  } catch (err) {
    console.error('[login] uncaught error:', err);
    return json({ error: 'Wewnętrzny błąd serwera. Spróbuj ponownie.' }, 500, cors);
  }
};

async function _handleLogin(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  // Rate limit: 5 prob na 15 minut per IP
  const rateLimit = await checkRateLimit(env.KV, `login:${ip}`, 5, 900);
  if (!rateLimit.allowed) {
    return json({ error: 'Zbyt wiele prob logowania. Sprobuj za 15 minut.' }, 429, cors);
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return json({ error: 'Nieprawidlowe dane wejsciowe' }, 400, cors);
  }

  const { email, password } = body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return json({ error: 'Email i haslo sa wymagane' }, 400, cors);
  }

  if (!isValidEmail(email)) {
    return json({ error: 'Nieprawidlowy format adresu email' }, 400, cors);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date().toISOString();

  const user = await env.DB.prepare(`
    SELECT id, email, email_verified, password_hash, display_name, avatar_url,
           failed_login_count, locked_until
    FROM users
    WHERE email = ? AND deleted_at IS NULL
  `).bind(normalizedEmail).first<AuthUser>();

  // Sprawdz blokade konta
  if (user?.locked_until && new Date(user.locked_until) > new Date()) {
    return json({ error: 'Konto zostalo tymczasowo zablokowane. Sprobuj za 15 minut.' }, 423, cors);
  }

  // Weryfikacja hasla (lub false jesli user nie istnieje)
  const passwordValid =
    user?.password_hash ? await verifyPassword(password, user.password_hash) : false;

  if (!user || !passwordValid) {
    if (user) {
      const newCount = (user.failed_login_count ?? 0) + 1;
      const lockedUntil =
        newCount >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
          : null;

      await env.DB.prepare(
        'UPDATE users SET failed_login_count = ?, locked_until = ?, updated_at = ? WHERE id = ?'
      ).bind(newCount, lockedUntil, now, user.id).run();

      await env.DB.prepare(`
        INSERT INTO auth_audit_log (user_id, action, ip_address, user_agent, metadata, created_at)
        VALUES (?, 'login_failed', ?, ?, ?, ?)
      `).bind(user.id, ip, request.headers.get('User-Agent') ?? '', JSON.stringify({ attempt: newCount }), now).run();
    }

    return json({ error: 'Nieprawidlowy email lub haslo' }, 401, cors);
  }

  // Zresetuj licznik blednych prob po udanym logowaniu
  if ((user.failed_login_count ?? 0) > 0) {
    await env.DB.prepare(
      'UPDATE users SET failed_login_count = 0, locked_until = NULL, updated_at = ? WHERE id = ?'
    ).bind(now, user.id).run();
  }

  // Generuj tokeny
  const accessToken = await createAccessToken(
    { sub: user.id, email: user.email, name: user.display_name },
    env.JWT_SECRET
  );

  const refreshToken = generateRefreshToken();
  const refreshHash = await hashToken(refreshToken);
  const refreshExpires = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000).toISOString();

  await env.DB.prepare(`
    INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at, created_at, last_used_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(user.id, refreshHash, request.headers.get('User-Agent') ?? '', ip, refreshExpires, now, now).run();

  await env.DB.prepare(`
    INSERT INTO auth_audit_log (user_id, action, ip_address, user_agent, created_at)
    VALUES (?, 'login', ?, ?, ?)
  `).bind(user.id, ip, request.headers.get('User-Agent') ?? '', now).run();

  const isMobile = request.headers.get('X-Copyli-Client') === 'mobile';
  const responseHeaders: Record<string, string> = { ...cors };

  if (!isMobile) {
    responseHeaders['Set-Cookie'] =
      `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=${REFRESH_TTL_SECONDS}`;
  }

  return json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name,
        avatar: user.avatar_url,
        email_verified: !!user.email_verified,
      },
      access_token: accessToken,
      ...(isMobile ? { refresh_token: refreshToken } : {}),
      token_type: 'Bearer',
      expires_in: 900,
    },
    200,
    responseHeaders
  );
}

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
};
