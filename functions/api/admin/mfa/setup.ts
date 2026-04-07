import { requireAuth, AuthError } from '../../../lib/auth.ts';
import { generateTotpSecret, totpUri, verifyTotp } from '../../../lib/totp.ts';
import { json, corsHeaders } from '../../../lib/response.ts';
import type { Env } from '../../../lib/types.ts';

// GET — pobierz sekret i URI do QR kodu (lub info że już skonfigurowano)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  const user = await env.DB.prepare(
    'SELECT is_admin, email, display_name, totp_secret FROM users WHERE id = ? AND deleted_at IS NULL'
  ).bind(authUser.sub).first<{ is_admin: number; email: string; display_name: string | null; totp_secret: string | null }>();

  if (!user?.is_admin) return json({ error: 'Brak dostępu' }, 403, cors);

  // Jeśli już skonfigurowane — zwróć info bez sekretu
  if (user.totp_secret) return json({ configured: true }, 200, cors);

  // Generuj nowy sekret tymczasowy (zapisz dopiero po weryfikacji)
  const secret = generateTotpSecret();
  const uri = totpUri(secret, user.email);

  // Tymczasowo zapisz w KV (10 min) do weryfikacji
  await env.KV?.put(`mfa_setup:${authUser.sub}`, secret, { expirationTtl: 600 });

  return json({ configured: false, secret, uri }, 200, cors);
};

// POST — zweryfikuj kod i zapisz sekret w DB
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
  if (user.totp_secret) return json({ error: 'MFA jest już skonfigurowane' }, 400, cors);

  let body: { code?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane' }, 400, cors); }

  const code = String(body.code ?? '');

  const secret = await env.KV?.get(`mfa_setup:${authUser.sub}`);
  if (!secret) return json({ error: 'Sesja wygasła — odśwież stronę' }, 400, cors);

  const valid = await verifyTotp(secret, code);
  if (!valid) return json({ error: 'Nieprawidłowy kod' }, 401, cors);

  // Zapisz sekret w DB i usuń z KV
  await env.DB.prepare(
    'UPDATE users SET totp_secret = ?, updated_at = ? WHERE id = ?'
  ).bind(secret, new Date().toISOString(), authUser.sub).run();
  await env.KV?.delete(`mfa_setup:${authUser.sub}`);

  // Od razu utwórz sesję MFA (1h)
  await env.KV?.put(`mfa:${authUser.sub}`, '1', { expirationTtl: 3600 });

  return json({ message: 'MFA skonfigurowane pomyślnie' }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
