import { hashPassword } from '../../lib/password.ts';
import { hashToken } from '../../lib/tokens.ts';
import { validatePassword } from '../../lib/validation.ts';
import { sendPasswordChangedEmail } from '../../lib/email.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  let body: { token?: unknown; password?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return json({ error: 'Nieprawidlowe dane wejsciowe' }, 400, cors);
  }

  if (typeof body.token !== 'string' || !body.token) {
    return json({ error: 'Brak tokenu resetu' }, 400, cors);
  }

  if (typeof body.password !== 'string') {
    return json({ error: 'Nowe haslo jest wymagane' }, 400, cors);
  }

  const passwordValidation = validatePassword(body.password);
  if (!passwordValidation.valid) {
    return json({ error: passwordValidation.error }, 400, cors);
  }

  const tokenHash = await hashToken(body.token);
  const now = new Date().toISOString();

  const record = await env.DB.prepare(`
    SELECT et.id, et.user_id, et.expires_at, et.used_at,
           u.email, u.display_name
    FROM email_tokens et
    JOIN users u ON u.id = et.user_id
    WHERE et.token_hash = ? AND et.type = 'reset_password' AND u.deleted_at IS NULL
  `).bind(tokenHash).first<{
    id: number;
    user_id: string;
    expires_at: string;
    used_at: string | null;
    email: string;
    display_name: string | null;
  }>();

  if (!record) {
    return json({ error: 'Nieprawidlowy lub wygasly link resetu hasla' }, 400, cors);
  }

  if (record.used_at) {
    return json({ error: 'Ten link zostal juz uzyty' }, 400, cors);
  }

  if (new Date(record.expires_at) < new Date()) {
    return json({ error: 'Link resetu wygasl. Wyslij nowy.' }, 400, cors);
  }

  const newHash = await hashPassword(body.password);

  await Promise.all([
    // Zaktualizuj haslo
    env.DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
    ).bind(newHash, now, record.user_id).run(),

    // Oznacz token jako uzyty
    env.DB.prepare(
      'UPDATE email_tokens SET used_at = ? WHERE id = ?'
    ).bind(now, record.id).run(),

    // Uniewaznij WSZYSTKIE sesje (bezpieczenstwo)
    env.DB.prepare(
      'DELETE FROM refresh_tokens WHERE user_id = ?'
    ).bind(record.user_id).run(),

    // Audit log
    env.DB.prepare(`
      INSERT INTO auth_audit_log (user_id, action, ip_address, created_at)
      VALUES (?, 'password_reset_completed', ?, ?)
    `).bind(record.user_id, request.headers.get('CF-Connecting-IP') ?? 'unknown', now).run(),
  ]);

  // Wyslij potwierdzenie zmiany hasla
  if (env.RESEND_API_KEY) {
    await sendPasswordChangedEmail(env.RESEND_API_KEY, record.email, record.display_name);
  }

  return json(
    { message: 'Haslo zostalo zmienione. Zaloguj sie nowym haslem.' },
    200,
    cors
  );
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
};
