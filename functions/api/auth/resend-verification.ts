import { requireAuth, AuthError } from '../../lib/auth.ts';
import { generateEmailToken, hashToken } from '../../lib/tokens.ts';
import { sendVerificationEmail } from '../../lib/email.ts';
import { checkRateLimit } from '../../lib/rate-limit.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  let authUser;
  try {
    authUser = await requireAuth(request, env);
  } catch (e) {
    if (e instanceof AuthError) return json({ error: e.message }, e.status, cors);
    throw e;
  }

  // Rate limit: 1 wyslanie na minute per user
  const rateLimit = await checkRateLimit(env.KV, `resend-verify:${authUser.sub}`, 1, 60);
  if (!rateLimit.allowed) {
    return json({ error: 'Mozesz wyslac ponownie po 1 minucie' }, 429, cors);
  }

  const user = await env.DB.prepare(
    'SELECT id, email, email_verified, display_name FROM users WHERE id = ? AND deleted_at IS NULL'
  ).bind(authUser.sub).first<{
    id: string;
    email: string;
    email_verified: number;
    display_name: string | null;
  }>();

  if (!user) return json({ error: 'Uzytkownik nie istnieje' }, 404, cors);

  if (user.email_verified) {
    return json({ error: 'Email jest juz potwierdzony' }, 400, cors);
  }

  const token = generateEmailToken();
  const tokenHash = await hashToken(token);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  // Usun stare niewykorzystane tokeny
  await env.DB.prepare(
    `DELETE FROM email_tokens WHERE user_id = ? AND type = 'verify_email' AND used_at IS NULL`
  ).bind(user.id).run();

  await env.DB.prepare(`
    INSERT INTO email_tokens (user_id, token_hash, type, expires_at, created_at)
    VALUES (?, ?, 'verify_email', ?, ?)
  `).bind(user.id, tokenHash, expires, now).run();

  if (env.RESEND_API_KEY) {
    await sendVerificationEmail(
      env.RESEND_API_KEY,
      user.email,
      user.display_name,
      token,
      env.APP_URL ?? 'https://copyli.pl'
    );
  }

  return json({ message: 'Email weryfikacyjny zostal wyslany' }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
};
