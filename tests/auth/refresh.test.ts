import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestPost } from '../../functions/api/auth/refresh.ts';
import { createTestEnv, makeRequest, callHandler, seedUserWithTokens } from '../helpers/env.ts';

type RefreshResponse = { access_token?: string; refresh_token?: string; error?: string };

describe('POST /api/auth/refresh', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => {
    ({ env } = createTestEnv());
  });

  it('wydaje nowy access_token i rotuje refresh cookie (web)', async () => {
    const { refreshToken } = await seedUserWithTokens(env);

    const req = makeRequest('POST', {}, {
      Cookie: `refresh_token=${refreshToken}`,
    });
    const { res, body } = await callHandler<RefreshResponse>(onRequestPost, req, env);

    expect(res.status).toBe(200);
    expect(body.access_token).toBeTruthy();
    expect(res.headers.get('Set-Cookie')).toContain('refresh_token=');
    // stary token powinien zniknąć z DB
    const old = env.DB._sqlite
      .prepare('SELECT id FROM refresh_tokens WHERE token_hash IS NOT NULL')
      .all();
    expect(old).toHaveLength(1); // jest nowy, starego nie ma
  });

  it('wydaje refresh_token w body dla klienta mobile', async () => {
    const { refreshToken } = await seedUserWithTokens(env);

    const req = makeRequest('POST', { refresh_token: refreshToken }, {
      'X-Copyli-Client': 'mobile',
    });
    const { res, body } = await callHandler<RefreshResponse>(onRequestPost, req, env);

    expect(res.status).toBe(200);
    expect(body.access_token).toBeTruthy();
    expect(body.refresh_token).toBeTruthy();
    expect(res.headers.get('Set-Cookie')).toBeNull();
  });

  it('zwraca 401 dla nieistniejącego tokenu', async () => {
    await seedUserWithTokens(env);
    const req = makeRequest('POST', {}, { Cookie: 'refresh_token=nieistniejacy-token' });
    const { res } = await callHandler<RefreshResponse>(onRequestPost, req, env);
    expect(res.status).toBe(401);
  });

  it('zwraca 401 gdy brak tokenu', async () => {
    const req = makeRequest('POST', {});
    const { res } = await callHandler<RefreshResponse>(onRequestPost, req, env);
    expect(res.status).toBe(401);
  });

  it('zwraca 400 gdy brak nagłówka X-Copyli-Client', async () => {
    const { refreshToken } = await seedUserWithTokens(env);
    const req = new Request('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: { Cookie: `refresh_token=${refreshToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const { res } = await callHandler<RefreshResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 401 dla wygasłego refresh tokenu', async () => {
    const { id } = await seedUserWithTokens(env);
    // Nadpisz expires_at na przeszłość
    const { generateRefreshToken, hashToken } = await import('../../functions/lib/tokens.ts');
    const expiredToken = generateRefreshToken();
    const expiredHash = await hashToken(expiredToken);
    const past = new Date(Date.now() - 1000).toISOString();
    const now = new Date().toISOString();
    env.DB._sqlite.prepare(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at, last_used_at) VALUES (?,?,?,?,?)'
    ).run(id, expiredHash, past, now, now);

    const req = makeRequest('POST', {}, { Cookie: `refresh_token=${expiredToken}` });
    const { res } = await callHandler<RefreshResponse>(onRequestPost, req, env);
    expect(res.status).toBe(401);
  });
});
