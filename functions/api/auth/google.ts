// Krok 1 OAuth: wygeneruj state, zapisz w cookie, przekieruj do Google
import { corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: `${env.APP_URL ?? 'https://copyli.pl'}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  });

  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  // State w httpOnly cookie (wazny 5 minut)
  return new Response(null, {
    status: 302,
    headers: {
      Location: googleUrl,
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=300`,
    },
  });
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
};
