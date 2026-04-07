import { requireAuth, AuthError } from '../../lib/auth.ts';
import { verifyPassword } from '../../lib/password.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  let body: { password?: unknown; confirm?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane wejściowe' }, 400, cors); }

  if (body.confirm !== 'USUN_KONTO') {
    return json({ error: 'Wymagane potwierdzenie: wpisz USUN_KONTO' }, 400, cors);
  }

  const user = await env.DB.prepare(
    'SELECT password_hash FROM users WHERE id = ? AND deleted_at IS NULL'
  ).bind(authUser.sub).first<{ password_hash: string | null }>();

  if (!user) return json({ error: 'Użytkownik nie istnieje' }, 404, cors);

  // Jeśli konto ma hasło — wymagaj jego podania
  if (user.password_hash) {
    if (typeof body.password !== 'string' || !body.password) {
      return json({ error: 'Podaj hasło aby potwierdzić usunięcie konta' }, 400, cors);
    }
    const valid = await verifyPassword(body.password, user.password_hash);
    if (!valid) return json({ error: 'Nieprawidłowe hasło' }, 401, cors);
  }

  const now = new Date().toISOString();

  await Promise.all([
    // Soft delete — anonimizuj dane osobowe
    env.DB.prepare(`
      UPDATE users SET
        deleted_at    = ?,
        email         = 'deleted_' || id || '@deleted.local',
        display_name  = NULL,
        avatar_url    = NULL,
        password_hash = NULL,
        updated_at    = ?
      WHERE id = ?
    `).bind(now, now, authUser.sub).run(),
    // Unieważnij wszystkie sesje
    env.DB.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').bind(authUser.sub).run(),
    // Audit log
    env.DB.prepare(
      `INSERT INTO auth_audit_log (user_id, action, ip_address, created_at)
       VALUES (?, 'account_deleted', ?, ?)`
    ).bind(authUser.sub, request.headers.get('CF-Connecting-IP') ?? 'unknown', now).run(),
  ]);

  return json(
    { message: 'Konto zostało usunięte.' },
    200,
    { ...cors, 'Set-Cookie': 'refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=0' }
  );
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
