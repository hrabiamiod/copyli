import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestPost } from '../../functions/api/auth/register.ts';
import { createTestEnv, makeRequest, callHandler } from '../helpers/env.ts';

type RegisterResponse = {
  user?: { id: string; email: string; name: string | null; email_verified: boolean };
  access_token?: string;
  error?: string;
  message?: string;
};

describe('POST /api/auth/register', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => {
    ({ env } = createTestEnv());
  });

  it('tworzy konto i zwraca access_token + cookie', async () => {
    const req = makeRequest('POST', {
      email: 'test@example.com',
      password: 'Haslo123',
      name: 'Jan Kowalski',
    });

    const { res, body } = await callHandler<RegisterResponse>(onRequestPost, req, env);

    expect(res.status).toBe(201);
    expect(body.user?.email).toBe('test@example.com');
    expect(body.user?.name).toBe('Jan Kowalski');
    expect(body.user?.email_verified).toBe(false);
    expect(body.access_token).toBeTruthy();
    expect(res.headers.get('Set-Cookie')).toContain('refresh_token=');
  });

  it('zwraca 409 gdy email już istnieje', async () => {
    const payload = { email: 'dup@example.com', password: 'Haslo123' };
    const r1 = makeRequest('POST', payload);
    await callHandler<RegisterResponse>(onRequestPost, r1, env);

    const r2 = makeRequest('POST', payload);
    const { res, body } = await callHandler<RegisterResponse>(onRequestPost, r2, env);

    expect(res.status).toBe(409);
    expect(body.error).toMatch(/istnieje/i);
  });

  it('zwraca 400 dla nieprawidłowego emaila', async () => {
    const req = makeRequest('POST', { email: 'nie-email', password: 'Haslo123' });
    const { res } = await callHandler<RegisterResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 gdy hasło jest za krótkie', async () => {
    const req = makeRequest('POST', { email: 'x@x.pl', password: 'abc' });
    const { res, body } = await callHandler<RegisterResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/8 znak/i);
  });

  it('zwraca 400 gdy hasło nie ma cyfry', async () => {
    const req = makeRequest('POST', { email: 'x@x.pl', password: 'HasloHaslo' });
    const { res, body } = await callHandler<RegisterResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/cyfr/i);
  });

  it('zwraca 400 gdy hasło nie ma litery', async () => {
    const req = makeRequest('POST', { email: 'x@x.pl', password: '12345678' });
    const { res, body } = await callHandler<RegisterResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/liter/i);
  });

  it('zwraca 400 gdy brak body', async () => {
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Copyli-Client': 'web' },
      body: 'invalid json',
    });
    const { res } = await callHandler<RegisterResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zapisuje zgody RODO w bazie', async () => {
    const req = makeRequest('POST', {
      email: 'rodo@example.com',
      password: 'Haslo123',
      consents: { marketing: true, analytics: false },
    });
    await callHandler<RegisterResponse>(onRequestPost, req, env);

    const consents = env.DB._sqlite
      .prepare(`SELECT consent_type, granted FROM user_consents WHERE user_id IN (SELECT id FROM users WHERE email = 'rodo@example.com')`)
      .all() as Array<{ consent_type: string; granted: number }>;

    expect(consents.find(c => c.consent_type === 'terms')?.granted).toBe(1);
    expect(consents.find(c => c.consent_type === 'privacy')?.granted).toBe(1);
    expect(consents.find(c => c.consent_type === 'marketing')?.granted).toBe(1);
    expect(consents.find(c => c.consent_type === 'analytics')?.granted).toBe(0);
  });

  it('mobile client: zwraca refresh_token w body, bez cookie', async () => {
    const req = makeRequest('POST', { email: 'mob@example.com', password: 'Haslo123' }, {
      'X-Copyli-Client': 'mobile',
    });
    const { res, body } = await callHandler<RegisterResponse & { refresh_token?: string }>(
      onRequestPost, req, env
    );
    expect(res.status).toBe(201);
    expect(body.refresh_token).toBeTruthy();
    expect(res.headers.get('Set-Cookie')).toBeNull();
  });
});
