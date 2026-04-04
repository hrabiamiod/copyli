import { hashPassword } from '../../lib/password.ts';
import { generateId, generateRefreshToken, hashToken, createAccessToken } from '../../lib/tokens.ts';
import { isValidEmail, validatePassword, sanitizeString } from '../../lib/validation.ts';
import { checkRateLimit } from '../../lib/rate-limit.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 dni

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  try {
  return await _handleRegister(request, env, cors);
  } catch (err) {
    console.error('[register] uncaught error:', err);
    return json({ error: 'Wewnętrzny błąd serwera. Spróbuj ponownie.' }, 500, cors);
  }
};

async function _handleRegister(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  // Rate limit — wlacz po zakonczeniu testow (odkomentuj ponizsze)
  // const rateLimit = await checkRateLimit(env.KV, `register:${ip}`, 10, 3600);
  // if (!rateLimit.allowed) {
  //   return json({ error: 'Zbyt wiele prob rejestracji. Sprobuj za godzine.' }, 429, cors);
  // }

  let body: { email?: unknown; password?: unknown; name?: unknown; consents?: Record<string, boolean> };
  try {
    body = await request.json() as typeof body;
  } catch {
    return json({ error: 'Nieprawidlowe dane wejsciowe' }, 400, cors);
  }

  const { email, password, name, consents = {} } = body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return json({ error: 'Email i haslo sa wymagane' }, 400, cors);
  }

  if (!isValidEmail(email)) {
    return json({ error: 'Nieprawidlowy format adresu email' }, 400, cors);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return json({ error: passwordValidation.error }, 400, cors);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const sanitizedName = typeof name === 'string' && name.trim() ? sanitizeString(name, 100) : null;

  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL'
  ).bind(normalizedEmail).first();

  if (existing) {
    return json({ error: 'Konto z tym adresem email juz istnieje' }, 409, cors);
  }

  const passwordHash = await hashPassword(password);
  const userId = generateId();
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO users (id, email, email_verified, password_hash, display_name, created_at, updated_at)
    VALUES (?, ?, 0, ?, ?, ?, ?)
  `).bind(userId, normalizedEmail, passwordHash, sanitizedName, now, now).run();

  // Zapisz zgody RODO
  for (const type of ['terms', 'privacy', 'marketing', 'analytics']) {
    const granted = type === 'terms' || type === 'privacy' ? 1 : (consents[type] ? 1 : 0);
    await env.DB.prepare(`
      INSERT INTO user_consents (user_id, consent_type, granted, ip_address, granted_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, type, granted, ip, now).run();
  }

  // Audit log
  await env.DB.prepare(`
    INSERT INTO auth_audit_log (user_id, action, ip_address, user_agent, created_at)
    VALUES (?, 'register', ?, ?, ?)
  `).bind(userId, ip, request.headers.get('User-Agent') ?? '', now).run();

  // Generuj tokeny
  const accessToken = await createAccessToken(
    { sub: userId, email: normalizedEmail, name: sanitizedName },
    env.JWT_SECRET
  );

  const refreshToken = generateRefreshToken();
  const refreshHash = await hashToken(refreshToken);
  const refreshExpires = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000).toISOString();

  await env.DB.prepare(`
    INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at, created_at, last_used_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(userId, refreshHash, request.headers.get('User-Agent') ?? '', ip, refreshExpires, now, now).run();

  const isMobile = request.headers.get('X-Copyli-Client') === 'mobile';
  const responseHeaders: Record<string, string> = { ...cors };

  if (!isMobile) {
    responseHeaders['Set-Cookie'] =
      `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=${REFRESH_TTL_SECONDS}`;
  }

  return json(
    {
      user: {
        id: userId,
        email: normalizedEmail,
        name: sanitizedName,
        email_verified: false,
      },
      access_token: accessToken,
      ...(isMobile ? { refresh_token: refreshToken } : {}),
      token_type: 'Bearer',
      expires_in: 900,
      message: 'Konto zostalo utworzone. Sprawdz email, aby potwierdzic adres.',
    },
    201,
    responseHeaders
  );
}

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
};
