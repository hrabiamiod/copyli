import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { onRequestPost } from '../../functions/api/auth/reset-password.ts';
import { createTestEnv, makeRequest, callHandler, seedUserWithTokens } from '../helpers/env.ts';
import { generateEmailToken, hashToken } from '../../functions/lib/tokens.ts';

vi.mock('../../functions/lib/email.ts', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordChangedEmail: vi.fn().mockResolvedValue(undefined),
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

type ResetResponse = { message?: string; error?: string };

/** Seeduje token resetu hasła w DB i zwraca surowy token */
async function seedResetToken(
  env: ReturnType<typeof createTestEnv>['env'],
  userId: string,
  options: { expired?: boolean; used?: boolean } = {}
) {
  const token = generateEmailToken();
  const tokenHash = await hashToken(token);
  const now = new Date().toISOString();
  const expires = options.expired
    ? new Date(Date.now() - 1000).toISOString()
    : new Date(Date.now() + 60 * 60 * 1000).toISOString();

  env.DB._sqlite.prepare(
    `INSERT INTO email_tokens (user_id, token_hash, type, expires_at, used_at, created_at)
     VALUES (?, ?, 'reset_password', ?, ?, ?)`
  ).run(userId, tokenHash, expires, options.used ? now : null, now);

  return token;
}

describe('POST /api/auth/reset-password', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => {
    ({ env } = createTestEnv());
    (env as Record<string, unknown>).RESEND_API_KEY = 'test-resend-key';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('zmienia hasło i unieważnia wszystkie sesje', async () => {
    const { id } = await seedUserWithTokens(env, { passwordHash: 'pbkdf2:100000:old:hash' });
    const token = await seedResetToken(env, id);

    const req = makeRequest('POST', { token, password: 'NoweHaslo1' });
    const { res, body } = await callHandler<ResetResponse>(onRequestPost, req, env);

    expect(res.status).toBe(200);
    expect(body.message).toMatch(/zmienione/i);

    // Hasło powinno się zmienić
    const user = env.DB._sqlite
      .prepare('SELECT password_hash FROM users WHERE id = ?')
      .get(id) as { password_hash: string };
    expect(user.password_hash).not.toBe('pbkdf2:100000:old:hash');
    expect(user.password_hash).toMatch(/^pbkdf2:/);

    // Wszystkie refresh tokeny powinny być usunięte
    const sessions = env.DB._sqlite.prepare('SELECT id FROM refresh_tokens WHERE user_id = ?').all(id);
    expect(sessions).toHaveLength(0);

    // Token powinien być oznaczony jako użyty
    const emailToken = env.DB._sqlite
      .prepare('SELECT used_at FROM email_tokens WHERE user_id = ?')
      .get(id) as { used_at: string | null };
    expect(emailToken.used_at).toBeTruthy();
  });

  it('zwraca 400 dla nieistniejącego tokenu', async () => {
    const req = makeRequest('POST', { token: 'nieistniejacy-token', password: 'NoweHaslo1' });
    const { res } = await callHandler<ResetResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 dla wygasłego tokenu', async () => {
    const { id } = await seedUserWithTokens(env);
    const token = await seedResetToken(env, id, { expired: true });

    const req = makeRequest('POST', { token, password: 'NoweHaslo1' });
    const { res, body } = await callHandler<ResetResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/wygasl/i);
  });

  it('zwraca 400 gdy token już był użyty', async () => {
    const { id } = await seedUserWithTokens(env);
    const token = await seedResetToken(env, id, { used: true });

    const req = makeRequest('POST', { token, password: 'NoweHaslo1' });
    const { res, body } = await callHandler<ResetResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/uzyty/i);
  });

  it('zwraca 400 gdy hasło za krótkie', async () => {
    const { id } = await seedUserWithTokens(env);
    const token = await seedResetToken(env, id);

    const req = makeRequest('POST', { token, password: 'abc' });
    const { res } = await callHandler<ResetResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 gdy brak tokenu', async () => {
    const req = makeRequest('POST', { password: 'NoweHaslo1' });
    const { res } = await callHandler<ResetResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 gdy brak nowego hasła', async () => {
    const { id } = await seedUserWithTokens(env);
    const token = await seedResetToken(env, id);

    const req = makeRequest('POST', { token });
    const { res } = await callHandler<ResetResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });
});
