import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestPost } from '../../functions/api/auth/logout.ts';
import { createTestEnv, makeRequest, callHandler, seedUserWithTokens } from '../helpers/env.ts';

type LogoutResponse = { message?: string };

describe('POST /api/auth/logout', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => {
    ({ env } = createTestEnv());
  });

  it('usuwa refresh token z DB i czyści cookie', async () => {
    const { accessToken, refreshToken } = await seedUserWithTokens(env);

    const req = makeRequest('POST', {}, {
      Authorization: `Bearer ${accessToken}`,
      Cookie: `refresh_token=${refreshToken}`,
    });
    const { res, body } = await callHandler<LogoutResponse>(onRequestPost, req, env);

    expect(res.status).toBe(200);
    expect(body.message).toMatch(/wylogowano/i);
    expect(res.headers.get('Set-Cookie')).toContain('Max-Age=0');

    const tokens = env.DB._sqlite.prepare('SELECT id FROM refresh_tokens').all();
    expect(tokens).toHaveLength(0);
  });

  it('działa bez access tokenu (wygasły JWT — też wylogowuje)', async () => {
    const { refreshToken } = await seedUserWithTokens(env);

    const req = makeRequest('POST', {}, {
      Cookie: `refresh_token=${refreshToken}`,
    });
    const { res } = await callHandler<LogoutResponse>(onRequestPost, req, env);

    expect(res.status).toBe(200);
    const tokens = env.DB._sqlite.prepare('SELECT id FROM refresh_tokens').all();
    expect(tokens).toHaveLength(0);
  });

  it('działa nawet gdy brak tokenu w cookie (idempotentne)', async () => {
    const req = makeRequest('POST', {});
    const { res } = await callHandler<LogoutResponse>(onRequestPost, req, env);
    expect(res.status).toBe(200);
  });

  it('mobile: usuwa refresh token z body', async () => {
    const { refreshToken } = await seedUserWithTokens(env);

    const req = makeRequest('POST', { refresh_token: refreshToken }, {
      'X-Copyli-Client': 'mobile',
    });
    const { res } = await callHandler<LogoutResponse>(onRequestPost, req, env);

    expect(res.status).toBe(200);
    const tokens = env.DB._sqlite.prepare('SELECT id FROM refresh_tokens').all();
    expect(tokens).toHaveLength(0);
  });
});
