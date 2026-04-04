import { hashToken } from '../../lib/tokens.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  let body: { token?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return json({ error: 'Nieprawidlowe dane wejsciowe' }, 400, cors);
  }

  if (typeof body.token !== 'string' || !body.token) {
    return json({ error: 'Brak tokenu weryfikacyjnego' }, 400, cors);
  }

  const tokenHash = await hashToken(body.token);
  const now = new Date().toISOString();

  const record = await env.DB.prepare(`
    SELECT et.id, et.user_id, et.expires_at, et.used_at
    FROM email_tokens et
    WHERE et.token_hash = ? AND et.type = 'verify_email'
  `).bind(tokenHash).first<{
    id: number;
    user_id: string;
    expires_at: string;
    used_at: string | null;
  }>();

  if (!record) {
    return json({ error: 'Nieprawidlowy lub wygasly link weryfikacyjny' }, 400, cors);
  }

  if (record.used_at) {
    return json({ error: 'Ten link weryfikacyjny zostal juz uzyty' }, 400, cors);
  }

  if (new Date(record.expires_at) < new Date()) {
    return json({ error: 'Link weryfikacyjny wygasl. Wyslij nowy.' }, 400, cors);
  }

  await Promise.all([
    env.DB.prepare(
      'UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?'
    ).bind(now, record.user_id).run(),

    env.DB.prepare(
      'UPDATE email_tokens SET used_at = ? WHERE id = ?'
    ).bind(now, record.id).run(),

    env.DB.prepare(`
      INSERT INTO auth_audit_log (user_id, action, created_at)
      VALUES (?, 'email_verified', ?)
    `).bind(record.user_id, now).run(),
  ]);

  return json({ message: 'Email zostal potwierdzony. Mozesz sie zalogowac.' }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
};
