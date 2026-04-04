import { generateEmailToken, hashToken } from '../../lib/tokens.ts';
import { sendPasswordResetEmail } from '../../lib/email.ts';
import { checkRateLimit } from '../../lib/rate-limit.ts';
import { isValidEmail } from '../../lib/validation.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  // Rate limit: 3 prosby na godzine per IP — zawsze 200 (nie ujawniamy czy email istnieje)
  const rateLimit = await checkRateLimit(env.KV, `forgot-pwd:${ip}`, 3, 3600);
  if (!rateLimit.allowed) {
    return json({ message: 'Jesli konto istnieje, wyslemy instrukcje resetu hasla.' }, 200, cors);
  }

  let body: { email?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return json({ error: 'Nieprawidlowe dane wejsciowe' }, 400, cors);
  }

  if (typeof body.email !== 'string' || !isValidEmail(body.email)) {
    return json({ error: 'Nieprawidlowy format adresu email' }, 400, cors);
  }

  const normalizedEmail = body.email.toLowerCase().trim();

  // Znajdz uzytkownika (nie ujawniaj czy istnieje — zawsze 200)
  const user = await env.DB.prepare(
    'SELECT id, display_name FROM users WHERE email = ? AND deleted_at IS NULL AND password_hash IS NOT NULL'
  ).bind(normalizedEmail).first<{ id: string; display_name: string | null }>();

  if (user && env.RESEND_API_KEY) {
    const token = generateEmailToken();
    const tokenHash = await hashToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 godzina
    const now = new Date().toISOString();

    // Usun stare tokeny resetu
    await env.DB.prepare(
      `DELETE FROM email_tokens WHERE user_id = ? AND type = 'reset_password' AND used_at IS NULL`
    ).bind(user.id).run();

    await env.DB.prepare(`
      INSERT INTO email_tokens (user_id, token_hash, type, expires_at, created_at)
      VALUES (?, ?, 'reset_password', ?, ?)
    `).bind(user.id, tokenHash, expires, now).run();

    await env.DB.prepare(`
      INSERT INTO auth_audit_log (user_id, action, ip_address, created_at)
      VALUES (?, 'password_reset_requested', ?, ?)
    `).bind(user.id, ip, now).run();

    await sendPasswordResetEmail(
      env.RESEND_API_KEY,
      normalizedEmail,
      user.display_name,
      token,
      env.APP_URL ?? 'https://copyli.pl'
    );
  }

  // Zawsze 200 — nie ujawniamy czy email istnieje w bazie
  return json(
    { message: 'Jesli konto istnieje, wyslemy instrukcje resetu hasla na podany adres.' },
    200,
    cors
  );
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
};
