// Krok 2 OAuth: Google wraca tutaj z code + state
// Wymieniamy code na tokeny, tworzymy/laczymy konto, przekierowujemy do frontendu
import { generateId, generateRefreshToken, hashToken, createAccessToken } from '../../../lib/tokens.ts';
import { sendVerificationEmail } from '../../../lib/email.ts';
import type { Env } from '../../../lib/types.ts';

const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  picture: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const appUrl = env.APP_URL ?? 'https://copyli.pl';
  const url = new URL(request.url);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Uzytkownik odmowil dostepu
  if (error) {
    return Response.redirect(`${appUrl}/logowanie?oauth=denied`, 302);
  }

  if (!code || !state) {
    return Response.redirect(`${appUrl}/logowanie?oauth=error`, 302);
  }

  // Weryfikacja state z cookie
  const cookie = request.headers.get('Cookie') ?? '';
  const storedState = /(?:^|;\s*)oauth_state=([^;]+)/.exec(cookie)?.[1];

  if (!storedState || storedState !== state) {
    return Response.redirect(`${appUrl}/logowanie?oauth=error&reason=state`, 302);
  }

  // Wymiana code na tokeny Google
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID ?? '',
      client_secret: env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: `${appUrl}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return Response.redirect(`${appUrl}/logowanie?oauth=error&reason=token`, 302);
  }

  const tokens = await tokenRes.json() as GoogleTokenResponse;

  // Pobierz dane uzytkownika z Google
  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userInfoRes.ok) {
    return Response.redirect(`${appUrl}/logowanie?oauth=error&reason=userinfo`, 302);
  }

  const googleUser = await userInfoRes.json() as GoogleUserInfo;
  const now = new Date().toISOString();
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  // Sprawdz czy istnieje konto OAuth dla tego Google ID
  const existingOAuth = await env.DB.prepare(`
    SELECT oa.user_id, u.email, u.display_name, u.deleted_at
    FROM oauth_accounts oa
    JOIN users u ON u.id = oa.user_id
    WHERE oa.provider = 'google' AND oa.provider_user_id = ?
  `).bind(googleUser.id).first<{
    user_id: string;
    email: string;
    display_name: string | null;
    deleted_at: string | null;
  }>();

  let userId: string;
  let isNewUser = false;

  if (existingOAuth) {
    if (existingOAuth.deleted_at) {
      return Response.redirect(`${appUrl}/logowanie?oauth=error&reason=deleted`, 302);
    }
    userId = existingOAuth.user_id;
  } else {
    // Sprawdz czy istnieje konto email z tym samym adresem
    const existingEmailUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL'
    ).bind(googleUser.email.toLowerCase()).first<{ id: string }>();

    if (existingEmailUser) {
      // Polacz konto Google z istniejacym kontem email
      userId = existingEmailUser.id;
      await env.DB.prepare(`
        INSERT OR IGNORE INTO oauth_accounts (user_id, provider, provider_user_id, provider_email, created_at)
        VALUES (?, 'google', ?, ?, ?)
      `).bind(userId, googleUser.id, googleUser.email, now).run();

      // Zaktualizuj avatar jesli nie ma
      await env.DB.prepare(`
        UPDATE users SET
          email_verified = 1,
          avatar_url = COALESCE(avatar_url, ?),
          updated_at = ?
        WHERE id = ?
      `).bind(googleUser.picture, now, userId).run();
    } else {
      // Nowe konto
      isNewUser = true;
      userId = generateId();

      await env.DB.prepare(`
        INSERT INTO users (id, email, email_verified, display_name, avatar_url, created_at, updated_at)
        VALUES (?, ?, 1, ?, ?, ?, ?)
      `).bind(userId, googleUser.email.toLowerCase(), googleUser.name, googleUser.picture, now, now).run();

      await env.DB.prepare(`
        INSERT INTO oauth_accounts (user_id, provider, provider_user_id, provider_email, created_at)
        VALUES (?, 'google', ?, ?, ?)
      `).bind(userId, googleUser.id, googleUser.email, now).run();

      // Domyslne zgody
      for (const type of ['terms', 'privacy']) {
        await env.DB.prepare(`
          INSERT INTO user_consents (user_id, consent_type, granted, ip_address, granted_at)
          VALUES (?, ?, 1, ?, ?)
        `).bind(userId, type, ip, now).run();
      }
    }
  }

  // Audit log
  await env.DB.prepare(`
    INSERT INTO auth_audit_log (user_id, action, ip_address, user_agent, metadata, created_at)
    VALUES (?, 'login', ?, ?, ?, ?)
  `).bind(
    userId,
    ip,
    request.headers.get('User-Agent') ?? '',
    JSON.stringify({ provider: 'google', new_user: isNewUser }),
    now
  ).run();

  // Generuj nasze tokeny
  const accessToken = await createAccessToken(
    { sub: userId, email: googleUser.email.toLowerCase(), name: googleUser.name },
    env.JWT_SECRET
  );

  const refreshToken = generateRefreshToken();
  const refreshHash = await hashToken(refreshToken);
  const refreshExpires = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000).toISOString();

  await env.DB.prepare(`
    INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at, created_at, last_used_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(userId, refreshHash, request.headers.get('User-Agent') ?? '', ip, refreshExpires, now, now).run();

  // Nie wysylaj maila weryfikacyjnego dla Google (email jest zweryfikowany przez Google)
  // Dla nowych uzytkownikow mozna wyslac mail powitalny (future feature)

  const redirectUrl = isNewUser
    ? `${appUrl}/profil?welcome=1`
    : `${appUrl}/`;

  // Ustaw refresh cookie + wyczysc oauth_state, przekieruj
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
      'Set-Cookie': [
        `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=${REFRESH_TTL_SECONDS}`,
        'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=0',
      ].join(', '),
    },
  });
};
