import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { onRequestGet } from '../../functions/api/auth/google/callback.ts';
import { createTestEnv, callHandler } from '../helpers/env.ts';

const APP_URL = 'http://localhost';

const GOOGLE_USER = {
  id: 'google-uid-123',
  email: 'jan@example.com',
  verified_email: true,
  name: 'Jan Kowalski',
  picture: 'https://lh3.googleusercontent.com/photo.jpg',
};

const GOOGLE_TOKEN_RESPONSE = {
  access_token: 'ya29.fake-access-token',
  id_token: 'fake-id-token',
  expires_in: 3600,
  token_type: 'Bearer',
};

/** Mockuje fetch: tokenEndpoint → tokenRes, userInfoEndpoint → userInfoRes */
function mockGoogleFetch(
  tokenRes: { ok: boolean; body?: object } = { ok: true, body: GOOGLE_TOKEN_RESPONSE },
  userInfoRes: { ok: boolean; body?: object } = { ok: true, body: GOOGLE_USER }
) {
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
    if (url === 'https://oauth2.googleapis.com/token') {
      return Promise.resolve({
        ok: tokenRes.ok,
        json: () => Promise.resolve(tokenRes.body ?? {}),
      });
    }
    if (url === 'https://www.googleapis.com/oauth2/v2/userinfo') {
      return Promise.resolve({
        ok: userInfoRes.ok,
        json: () => Promise.resolve(userInfoRes.body ?? {}),
      });
    }
    return Promise.reject(new Error(`Niespodziewany fetch: ${url}`));
  }));
}

function makeCallbackRequest(params: {
  code?: string;
  state?: string;
  error?: string;
  cookieState?: string;
}) {
  const url = new URL(`${APP_URL}/api/auth/google/callback`);
  if (params.code) url.searchParams.set('code', params.code);
  if (params.state) url.searchParams.set('state', params.state);
  if (params.error) url.searchParams.set('error', params.error);

  const cookieState = params.cookieState ?? params.state;
  return new Request(url.toString(), {
    method: 'GET',
    headers: {
      Cookie: cookieState ? `oauth_state=${cookieState}` : '',
      'CF-Connecting-IP': '127.0.0.1',
    },
  });
}

describe('GET /api/auth/google/callback', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => {
    ({ env } = createTestEnv());
    (env as Record<string, unknown>).APP_URL = APP_URL;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('tworzy nowe konto i ustawia refresh cookie', async () => {
    mockGoogleFetch();
    const req = makeCallbackRequest({ code: 'auth-code', state: 'random-state' });
    const res = await callHandler(onRequestGet as never, req, env).then(r => r.res);

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(`${APP_URL}/profil?welcome=1`);
    expect(res.headers.get('Set-Cookie')).toContain('refresh_token=');

    const user = env.DB._sqlite
      .prepare('SELECT email, email_verified, display_name, avatar_url FROM users WHERE email = ?')
      .get('jan@example.com') as { email: string; email_verified: number; display_name: string; avatar_url: string };

    expect(user.email).toBe('jan@example.com');
    expect(user.email_verified).toBe(1);
    expect(user.display_name).toBe('Jan Kowalski');
    expect(user.avatar_url).toBe(GOOGLE_USER.picture);
  });

  it('loguje istniejącego użytkownika Google (brak welcome redirect)', async () => {
    mockGoogleFetch();
    // Pierwsze logowanie — tworzy konto
    const r1 = makeCallbackRequest({ code: 'code1', state: 'state1' });
    await callHandler(onRequestGet as never, r1, env).then(r => r.res);

    // Drugie logowanie — ten sam Google ID
    mockGoogleFetch();
    const r2 = makeCallbackRequest({ code: 'code2', state: 'state2' });
    const res = await callHandler(onRequestGet as never, r2, env).then(r => r.res);

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(`${APP_URL}/`);
    expect(res.headers.get('Set-Cookie')).toContain('refresh_token=');
  });

  it('łączy konto Google z istniejącym kontem email', async () => {
    // Seed: użytkownik zarejestrowany emailem
    const now = new Date().toISOString();
    env.DB._sqlite.prepare(
      `INSERT INTO users (id, email, email_verified, password_hash, created_at, updated_at)
       VALUES ('existing-id', 'jan@example.com', 0, 'hash', ?, ?)`
    ).run(now, now);

    mockGoogleFetch();
    const req = makeCallbackRequest({ code: 'code', state: 'state' });
    const res = await callHandler(onRequestGet as never, req, env).then(r => r.res);

    expect(res.status).toBe(302);

    // Konto OAuth powinno być powiązane
    const oauth = env.DB._sqlite
      .prepare(`SELECT user_id FROM oauth_accounts WHERE provider = 'google' AND provider_user_id = ?`)
      .get(GOOGLE_USER.id) as { user_id: string } | undefined;

    expect(oauth?.user_id).toBe('existing-id');

    // email_verified powinien być zaktualizowany
    const user = env.DB._sqlite
      .prepare('SELECT email_verified FROM users WHERE id = ?')
      .get('existing-id') as { email_verified: number };
    expect(user.email_verified).toBe(1);
  });

  it('zwraca redirect na error gdy brak code', async () => {
    const req = makeCallbackRequest({ state: 'state' }); // brak code
    const res = await callHandler(onRequestGet as never, req, env).then(r => r.res);

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('oauth=error');
  });

  it('zwraca redirect na error gdy state nie zgadza się z cookie', async () => {
    const req = makeCallbackRequest({ code: 'code', state: 'state-x', cookieState: 'state-y' });
    const res = await callHandler(onRequestGet as never, req, env).then(r => r.res);

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('oauth=error');
  });

  it('zwraca redirect na denied gdy użytkownik odmówił Google', async () => {
    const req = makeCallbackRequest({ error: 'access_denied', state: 'state' });
    const res = await callHandler(onRequestGet as never, req, env).then(r => r.res);

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('oauth=denied');
  });

  it('zwraca redirect na error gdy Google odmawia wymiany kodu', async () => {
    mockGoogleFetch({ ok: false });
    const req = makeCallbackRequest({ code: 'bad-code', state: 'state' });
    const res = await callHandler(onRequestGet as never, req, env).then(r => r.res);

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('oauth=error');
  });

  it('zwraca redirect na error gdy Google userinfo endpoint zwraca błąd', async () => {
    mockGoogleFetch({ ok: true, body: GOOGLE_TOKEN_RESPONSE }, { ok: false });
    const req = makeCallbackRequest({ code: 'code', state: 'state' });
    const res = await callHandler(onRequestGet as never, req, env).then(r => r.res);

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('oauth=error');
  });

  it('czyści oauth_state cookie po przekierowaniu', async () => {
    mockGoogleFetch();
    const req = makeCallbackRequest({ code: 'code', state: 'state' });
    const res = await callHandler(onRequestGet as never, req, env).then(r => r.res);

    const cookies = res.headers.getSetCookie?.() ?? [res.headers.get('Set-Cookie') ?? ''];
    const stateCookie = cookies.find(c => c.startsWith('oauth_state='));
    expect(stateCookie).toContain('Max-Age=0');
  });
});
