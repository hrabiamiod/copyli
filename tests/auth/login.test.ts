import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestPost } from '../../functions/api/auth/login.ts';
import { onRequestPost as registerPost } from '../../functions/api/auth/register.ts';
import { createTestEnv, makeRequest, callHandler } from '../helpers/env.ts';

type LoginResponse = {
  user?: { id: string; email: string; name: string | null; email_verified: boolean };
  access_token?: string;
  error?: string;
};

const TEST_EMAIL = 'user@example.com';
const TEST_PASSWORD = 'Haslo123';

/** Rejestruje użytkownika testowego w danym env */
async function seedUser(env: ReturnType<typeof createTestEnv>['env'], email = TEST_EMAIL, password = TEST_PASSWORD) {
  const req = makeRequest('POST', { email, password });
  await callHandler(registerPost, req, env);
}

describe('POST /api/auth/login', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(async () => {
    ({ env } = createTestEnv());
    await seedUser(env);
  });

  it('loguje użytkownika i zwraca access_token + cookie', async () => {
    const req = makeRequest('POST', { email: TEST_EMAIL, password: TEST_PASSWORD });
    const { res, body } = await callHandler<LoginResponse>(onRequestPost, req, env);

    expect(res.status).toBe(200);
    expect(body.user?.email).toBe(TEST_EMAIL);
    expect(body.access_token).toBeTruthy();
    expect(res.headers.get('Set-Cookie')).toContain('refresh_token=');
  });

  it('zwraca 401 przy złym haśle', async () => {
    const req = makeRequest('POST', { email: TEST_EMAIL, password: 'ZleHaslo9' });
    const { res, body } = await callHandler<LoginResponse>(onRequestPost, req, env);

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/email lub haslo/i);
  });

  it('zwraca 401 gdy user nie istnieje', async () => {
    const req = makeRequest('POST', { email: 'kto@example.com', password: TEST_PASSWORD });
    const { res, body } = await callHandler<LoginResponse>(onRequestPost, req, env);

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/email lub haslo/i);
  });

  it('zwraca 400 dla nieprawidłowego emaila', async () => {
    const req = makeRequest('POST', { email: 'nie-email', password: TEST_PASSWORD });
    const { res } = await callHandler<LoginResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwiększa failed_login_count przy błędnym haśle', async () => {
    const req = makeRequest('POST', { email: TEST_EMAIL, password: 'ZleHaslo9' });
    await callHandler<LoginResponse>(onRequestPost, req, env);

    const user = env.DB._sqlite
      .prepare('SELECT failed_login_count FROM users WHERE email = ?')
      .get(TEST_EMAIL) as { failed_login_count: number };

    expect(user.failed_login_count).toBe(1);
  });

  it('resetuje failed_login_count po udanym logowaniu', async () => {
    // Zepsuj kilka razy
    for (let i = 0; i < 3; i++) {
      const r = makeRequest('POST', { email: TEST_EMAIL, password: 'Zle1' });
      await callHandler<LoginResponse>(onRequestPost, r, env);
    }

    // Zaloguj poprawnie
    const req = makeRequest('POST', { email: TEST_EMAIL, password: TEST_PASSWORD });
    const { res } = await callHandler<LoginResponse>(onRequestPost, req, env);
    expect(res.status).toBe(200);

    const user = env.DB._sqlite
      .prepare('SELECT failed_login_count FROM users WHERE email = ?')
      .get(TEST_EMAIL) as { failed_login_count: number };

    expect(user.failed_login_count).toBe(0);
  });

  it('blokuje konto po 10 nieudanych próbach', async () => {
    // KV=undefined żeby wyłączyć rate limiting IP — testujemy tylko blokadę konta
    const envNoKV = { ...env, KV: undefined };

    // 10 złych prób
    for (let i = 0; i < 10; i++) {
      const r = makeRequest('POST', { email: TEST_EMAIL, password: `Zle${i}` });
      await callHandler<LoginResponse>(onRequestPost, r, envNoKV as never);
    }

    // Następna próba — nawet z dobrym hasłem — powinna zwrócić 423
    const req = makeRequest('POST', { email: TEST_EMAIL, password: TEST_PASSWORD });
    const { res, body } = await callHandler<LoginResponse>(onRequestPost, req, envNoKV as never);

    expect(res.status).toBe(423);
    expect(body.error).toMatch(/zablokowane/i);
  });

  it('mobile client: zwraca refresh_token w body, bez cookie', async () => {
    const req = makeRequest('POST', { email: TEST_EMAIL, password: TEST_PASSWORD }, {
      'X-Copyli-Client': 'mobile',
    });
    const { res, body } = await callHandler<LoginResponse & { refresh_token?: string }>(
      onRequestPost, req, env
    );
    expect(res.status).toBe(200);
    expect((body as { refresh_token?: string }).refresh_token).toBeTruthy();
    expect(res.headers.get('Set-Cookie')).toBeNull();
  });

  it('rate limiting — przepuszcza gdy KV undefined', async () => {
    const envNoKV = { ...env, KV: undefined };
    const req = makeRequest('POST', { email: TEST_EMAIL, password: TEST_PASSWORD });
    const { res } = await callHandler<LoginResponse>(onRequestPost, req, envNoKV as never);
    expect(res.status).toBe(200);
  });
});
