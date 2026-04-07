import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestGet, onRequestPatch } from '../../functions/api/auth/me.ts';
import { createTestEnv, callHandler, seedUserWithTokens } from '../helpers/env.ts';

type MeResponse = {
  id?: string;
  email?: string;
  email_verified?: boolean;
  name?: string | null;
  avatar?: string | null;
  has_password?: boolean;
  google_connected?: boolean;
  allergens?: unknown[];
  locations?: unknown[];
  error?: string;
  message?: string;
};

function makeAuthRequest(method: string, accessToken: string, body?: unknown) {
  return new Request('http://localhost/api/auth/me', {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Copyli-Client': 'web',
      Authorization: `Bearer ${accessToken}`,
      'CF-Connecting-IP': '127.0.0.1',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe('GET /api/auth/me', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => {
    ({ env } = createTestEnv());
  });

  it('zwraca profil zalogowanego użytkownika', async () => {
    const { accessToken, email, name } = await seedUserWithTokens(env);

    const req = makeAuthRequest('GET', accessToken);
    const { res, body } = await callHandler<MeResponse>(onRequestGet, req, env);

    expect(res.status).toBe(200);
    expect(body.email).toBe(email);
    expect(body.name).toBe(name);
    expect(body.email_verified).toBe(true);
    expect(body.allergens).toEqual([]);
    expect(body.locations).toEqual([]);
    expect(body.google_connected).toBe(false);
  });

  it('zwraca has_password=true gdy user ma hash hasła', async () => {
    const { accessToken } = await seedUserWithTokens(env, { passwordHash: 'pbkdf2:100000:abc:def' });
    const req = makeAuthRequest('GET', accessToken);
    const { body } = await callHandler<MeResponse>(onRequestGet, req, env);
    expect(body.has_password).toBe(true);
  });

  it('zwraca google_connected=true gdy konto OAuth istnieje', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const now = new Date().toISOString();
    env.DB._sqlite.prepare(
      'INSERT INTO oauth_accounts (user_id, provider, provider_user_id, created_at) VALUES (?,?,?,?)'
    ).run(id, 'google', 'google-uid-999', now);

    const req = makeAuthRequest('GET', accessToken);
    const { body } = await callHandler<MeResponse>(onRequestGet, req, env);
    expect(body.google_connected).toBe(true);
  });

  it('zwraca 401 bez tokenu', async () => {
    const req = new Request('http://localhost/api/auth/me', { method: 'GET' });
    const { res } = await callHandler<MeResponse>(onRequestGet, req, env);
    expect(res.status).toBe(401);
  });

  it('zwraca 401 dla nieprawidłowego tokenu', async () => {
    const req = makeAuthRequest('GET', 'invalid.token.here');
    const { res } = await callHandler<MeResponse>(onRequestGet, req, env);
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/auth/me', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => {
    ({ env } = createTestEnv());
  });

  it('aktualizuje display_name', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const req = makeAuthRequest('PATCH', accessToken, { name: 'Nowe Imię' });
    const { res } = await callHandler<MeResponse>(onRequestPatch, req, env);

    expect(res.status).toBe(200);
    const user = env.DB._sqlite.prepare('SELECT display_name FROM users WHERE id = ?').get(id) as { display_name: string };
    expect(user.display_name).toBe('Nowe Imię');
  });

  it('aktualizuje avatar z dozwolonej domeny Google', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const avatarUrl = 'https://lh3.googleusercontent.com/photo.jpg';
    const req = makeAuthRequest('PATCH', accessToken, { avatar_url: avatarUrl });
    const { res } = await callHandler<MeResponse>(onRequestPatch, req, env);

    expect(res.status).toBe(200);
    const user = env.DB._sqlite.prepare('SELECT avatar_url FROM users WHERE id = ?').get(id) as { avatar_url: string };
    expect(user.avatar_url).toBe(avatarUrl);
  });

  it('zwraca 400 dla avatara z niedozwolonej domeny', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeAuthRequest('PATCH', accessToken, { avatar_url: 'https://evil.com/photo.jpg' });
    const { res } = await callHandler<MeResponse>(onRequestPatch, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 gdy brak pól do aktualizacji', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeAuthRequest('PATCH', accessToken, {});
    const { res } = await callHandler<MeResponse>(onRequestPatch, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 401 bez tokenu', async () => {
    const req = new Request('http://localhost/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });
    const { res } = await callHandler<MeResponse>(onRequestPatch, req, env);
    expect(res.status).toBe(401);
  });
});
