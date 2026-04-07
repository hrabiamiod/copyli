import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { onRequestPost } from '../../functions/api/auth/forgot-password.ts';
import { createTestEnv, makeRequest, callHandler, seedUserWithTokens } from '../helpers/env.ts';

// Mock wysyłania emaili — nie chcemy prawdziwych requestów HTTP
vi.mock('../../functions/lib/email.ts', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordChangedEmail: vi.fn().mockResolvedValue(undefined),
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

type ForgotResponse = { message?: string; error?: string };

describe('POST /api/auth/forgot-password', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => {
    ({ env } = createTestEnv());
    // Klucz Resend musi być ustawiony żeby endpoint próbował wysłać email
    (env as Record<string, unknown>).RESEND_API_KEY = 'test-resend-key';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('zawsze zwraca 200 (nie ujawnia czy email istnieje)', async () => {
    const req = makeRequest('POST', { email: 'nieistniejacy@example.com' });
    const { res, body } = await callHandler<ForgotResponse>(onRequestPost, req, env);

    expect(res.status).toBe(200);
    expect(body.message).toBeTruthy();
  });

  it('tworzy token resetu w DB dla istniejącego usera z hasłem', async () => {
    const { id } = await seedUserWithTokens(env, { passwordHash: 'pbkdf2:100000:abc:def' });

    const req = makeRequest('POST', { email: 'user@example.com' });
    const { res } = await callHandler<ForgotResponse>(onRequestPost, req, env);

    expect(res.status).toBe(200);

    const token = env.DB._sqlite
      .prepare(`SELECT id FROM email_tokens WHERE user_id = ? AND type = 'reset_password'`)
      .get(id);
    expect(token).toBeTruthy();
  });

  it('usuwa stary token przed wygenerowaniem nowego', async () => {
    const { id } = await seedUserWithTokens(env, { passwordHash: 'pbkdf2:100000:abc:def' });

    // Pierwsze żądanie
    const r1 = makeRequest('POST', { email: 'user@example.com' });
    await callHandler<ForgotResponse>(onRequestPost, r1, env);

    // Drugie żądanie — powinien być tylko 1 token
    const r2 = makeRequest('POST', { email: 'user@example.com' });
    await callHandler<ForgotResponse>(onRequestPost, r2, env);

    const tokens = env.DB._sqlite
      .prepare(`SELECT id FROM email_tokens WHERE user_id = ? AND type = 'reset_password'`)
      .all(id);
    expect(tokens).toHaveLength(1);
  });

  it('nie tworzy tokenu dla usera bez hasła (tylko OAuth)', async () => {
    const { id } = await seedUserWithTokens(env); // passwordHash = null

    const req = makeRequest('POST', { email: 'user@example.com' });
    await callHandler<ForgotResponse>(onRequestPost, req, env);

    const token = env.DB._sqlite
      .prepare(`SELECT id FROM email_tokens WHERE user_id = ?`)
      .get(id);
    expect(token).toBeFalsy();
  });

  it('zwraca 400 dla nieprawidłowego emaila', async () => {
    const req = makeRequest('POST', { email: 'nie-email' });
    const { res } = await callHandler<ForgotResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });
});
