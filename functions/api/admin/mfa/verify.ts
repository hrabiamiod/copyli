import { requireAuth, AuthError } from '../../../lib/auth.ts';
import { verifyTotp } from '../../../lib/totp.ts';
import { json, corsHeaders } from '../../../lib/response.ts';
import type { Env } from '../../../lib/types.ts';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  const user = await env.DB.prepare(
    'SELECT is_admin, totp_secret FROM users WHERE id = ? AND deleted_at IS NULL'
  ).bind(authUser.sub).first<{ is_admin: number; totp_secret: string | null }>();

  if (!user?.is_admin) return json({ error: 'Brak dostępu' }, 403, cors);
  if (!user.totp_secret) return json({ error: 'setup_required' }, 403, cors);

  let body: { code?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane' }, 400, cors); }

  const code = String(body.code ?? '');
  const valid = await verifyTotp(user.totp_secret, code);
  if (!valid) return json({ error: 'Nieprawidłowy kod' }, 401, cors);

  // Sesja MFA ważna 1h
  await env.KV?.put(`mfa:${authUser.sub}`, '1', { expirationTtl: 3600 });

  return json({ message: 'ok' }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
