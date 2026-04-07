import { requireAuth, AuthError } from '../../lib/auth.ts';
import { verifyPassword, hashPassword } from '../../lib/password.ts';
import { validatePassword } from '../../lib/validation.ts';
import { sendPasswordChangedEmail } from '../../lib/email.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  let body: { current_password?: unknown; new_password?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane wejściowe' }, 400, cors); }

  if (typeof body.current_password !== 'string' || typeof body.new_password !== 'string') {
    return json({ error: 'current_password i new_password są wymagane' }, 400, cors);
  }

  const validation = validatePassword(body.new_password);
  if (!validation.valid) return json({ error: validation.error }, 400, cors);

  if (body.current_password === body.new_password) {
    return json({ error: 'Nowe hasło musi różnić się od obecnego' }, 400, cors);
  }

  const user = await env.DB.prepare(
    'SELECT password_hash, email, display_name FROM users WHERE id = ? AND deleted_at IS NULL'
  ).bind(authUser.sub).first<{ password_hash: string | null; email: string; display_name: string | null }>();

  if (!user?.password_hash) {
    return json({ error: 'Konto nie ma ustawionego hasła (zaloguj się przez Google)' }, 400, cors);
  }

  const valid = await verifyPassword(body.current_password, user.password_hash);
  if (!valid) return json({ error: 'Obecne hasło jest nieprawidłowe' }, 401, cors);

  const newHash = await hashPassword(body.new_password);
  const now = new Date().toISOString();

  await Promise.all([
    env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .bind(newHash, now, authUser.sub).run(),
    // Unieważnij wszystkie inne sesje (bezpieczeństwo)
    env.DB.prepare('DELETE FROM refresh_tokens WHERE user_id = ?')
      .bind(authUser.sub).run(),
    env.DB.prepare(
      `INSERT INTO auth_audit_log (user_id, action, ip_address, created_at)
       VALUES (?, 'password_changed', ?, ?)`
    ).bind(authUser.sub, request.headers.get('CF-Connecting-IP') ?? 'unknown', now).run(),
  ]);

  if (env.RESEND_API_KEY) {
    await sendPasswordChangedEmail(env.RESEND_API_KEY, user.email, user.display_name);
  }

  return json({ message: 'Hasło zostało zmienione. Zaloguj się ponownie.' }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
