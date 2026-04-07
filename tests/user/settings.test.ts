import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { onRequestPatch as patchPassword } from '../../functions/api/user/password.ts';
import { onRequestGet as getNotifications, onRequestPatch as patchNotifications } from '../../functions/api/user/notifications.ts';
import { onRequestDelete as deleteAccount } from '../../functions/api/user/account.ts';
import { createTestEnv, callHandler, seedUserWithTokens } from '../helpers/env.ts';
import { hashPassword } from '../../functions/lib/password.ts';

vi.mock('../../functions/lib/email.ts', () => ({
  sendPasswordChangedEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

function makeReq(method: string, path: string, accessToken: string, body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Copyli-Client': 'web', Authorization: `Bearer ${accessToken}` },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/* ─── ZMIANA HASŁA ─── */
describe('PATCH /api/user/password', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(async () => {
    ({ env } = createTestEnv());
  });
  afterEach(() => vi.clearAllMocks());

  it('zmienia hasło i unieważnia sesje', async () => {
    const hash = await hashPassword('StareHaslo1');
    const { id, accessToken } = await seedUserWithTokens(env, { passwordHash: hash });

    const { res } = await callHandler(patchPassword,
      makeReq('PATCH', '/api/user/password', accessToken, { current_password: 'StareHaslo1', new_password: 'NoweHaslo9' }), env);

    expect(res.status).toBe(200);
    const sessions = env.DB._sqlite.prepare('SELECT id FROM refresh_tokens WHERE user_id = ?').all(id);
    expect(sessions).toHaveLength(0); // sesje unieważnione

    // Nowy hash powinien być ustawiony
    const user = env.DB._sqlite.prepare('SELECT password_hash FROM users WHERE id = ?').get(id) as { password_hash: string };
    expect(user.password_hash).toMatch(/^pbkdf2:/);
    expect(user.password_hash).not.toBe(hash);
  });

  it('zwraca 401 gdy obecne hasło nieprawidłowe', async () => {
    const hash = await hashPassword('StareHaslo1');
    const { accessToken } = await seedUserWithTokens(env, { passwordHash: hash });
    const { res } = await callHandler(patchPassword,
      makeReq('PATCH', '/api/user/password', accessToken, { current_password: 'ZleHaslo9', new_password: 'NoweHaslo9' }), env);
    expect(res.status).toBe(401);
  });

  it('zwraca 400 gdy konto bez hasła (tylko OAuth)', async () => {
    const { accessToken } = await seedUserWithTokens(env); // passwordHash = null
    const { res } = await callHandler(patchPassword,
      makeReq('PATCH', '/api/user/password', accessToken, { current_password: 'cos', new_password: 'NoweHaslo9' }), env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 gdy nowe hasło = stare', async () => {
    const hash = await hashPassword('StareHaslo1');
    const { accessToken } = await seedUserWithTokens(env, { passwordHash: hash });
    const { res } = await callHandler(patchPassword,
      makeReq('PATCH', '/api/user/password', accessToken, { current_password: 'StareHaslo1', new_password: 'StareHaslo1' }), env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 dla słabego nowego hasła', async () => {
    const hash = await hashPassword('StareHaslo1');
    const { accessToken } = await seedUserWithTokens(env, { passwordHash: hash });
    const { res } = await callHandler(patchPassword,
      makeReq('PATCH', '/api/user/password', accessToken, { current_password: 'StareHaslo1', new_password: 'abc' }), env);
    expect(res.status).toBe(400);
  });
});

/* ─── POWIADOMIENIA ─── */
describe('GET + PATCH /api/user/notifications', () => {
  let env: ReturnType<typeof createTestEnv>['env'];
  beforeEach(() => { ({ env } = createTestEnv()); });

  it('GET zwraca domyślne ustawienia gdy brak wpisu w DB', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const { res, body } = await callHandler(getNotifications,
      makeReq('GET', '/api/user/notifications', accessToken), env);
    expect(res.status).toBe(200);
    expect(body).toMatchObject({ email_alerts: false, alert_threshold: 'high', alert_time: '07:00' });
  });

  it('PATCH zapisuje ustawienia (upsert)', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    await callHandler(patchNotifications,
      makeReq('PATCH', '/api/user/notifications', accessToken, { email_alerts: true, alert_threshold: 'very_high', alert_time: '08:30' }), env);

    const row = env.DB._sqlite
      .prepare('SELECT email_alerts, alert_threshold, alert_time FROM user_notification_settings WHERE user_id = ?')
      .get(id) as { email_alerts: number; alert_threshold: string; alert_time: string };
    expect(row.email_alerts).toBe(1);
    expect(row.alert_threshold).toBe('very_high');
    expect(row.alert_time).toBe('08:30');
  });

  it('zwraca 400 dla złego threshold', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const { res } = await callHandler(patchNotifications,
      makeReq('PATCH', '/api/user/notifications', accessToken, { alert_threshold: 'extreme' }), env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 dla złego formatu czasu', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const { res } = await callHandler(patchNotifications,
      makeReq('PATCH', '/api/user/notifications', accessToken, { alert_time: '25:00' }), env);
    expect(res.status).toBe(400);
  });
});

/* ─── USUNIĘCIE KONTA ─── */
describe('DELETE /api/user/account', () => {
  let env: ReturnType<typeof createTestEnv>['env'];
  beforeEach(() => { ({ env } = createTestEnv()); });

  it('usuwa konto z hasłem po potwierdzeniu', async () => {
    const hash = await hashPassword('Haslo123');
    const { id, accessToken } = await seedUserWithTokens(env, { passwordHash: hash });

    const { res, body } = await callHandler(deleteAccount,
      makeReq('DELETE', '/api/user/account', accessToken, { confirm: 'USUN_KONTO', password: 'Haslo123' }), env);

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ message: expect.stringMatching(/usuni/i) });

    const user = env.DB._sqlite
      .prepare('SELECT deleted_at, email, display_name FROM users WHERE id = ?')
      .get(id) as { deleted_at: string; email: string; display_name: string | null };
    expect(user.deleted_at).toBeTruthy();
    expect(user.email).toContain('@deleted.local');
    expect(user.display_name).toBeNull();

    // Sesje usunięte
    const sessions = env.DB._sqlite.prepare('SELECT id FROM refresh_tokens WHERE user_id = ?').all(id);
    expect(sessions).toHaveLength(0);
  });

  it('usuwa konto OAuth (bez hasła) bez podawania hasła', async () => {
    const { id, accessToken } = await seedUserWithTokens(env); // brak hasła
    const { res } = await callHandler(deleteAccount,
      makeReq('DELETE', '/api/user/account', accessToken, { confirm: 'USUN_KONTO' }), env);
    expect(res.status).toBe(200);
    const user = env.DB._sqlite.prepare('SELECT deleted_at FROM users WHERE id = ?').get(id) as { deleted_at: string };
    expect(user.deleted_at).toBeTruthy();
  });

  it('zwraca 400 gdy brak confirm lub złe słowo', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const { res } = await callHandler(deleteAccount,
      makeReq('DELETE', '/api/user/account', accessToken, { confirm: 'tak', password: 'Haslo123' }), env);
    expect(res.status).toBe(400);
  });

  it('zwraca 401 gdy podano złe hasło', async () => {
    const hash = await hashPassword('Haslo123');
    const { accessToken } = await seedUserWithTokens(env, { passwordHash: hash });
    const { res } = await callHandler(deleteAccount,
      makeReq('DELETE', '/api/user/account', accessToken, { confirm: 'USUN_KONTO', password: 'ZleHaslo9' }), env);
    expect(res.status).toBe(401);
  });

  it('zwraca 400 gdy konto z hasłem — nie podano hasła', async () => {
    const hash = await hashPassword('Haslo123');
    const { accessToken } = await seedUserWithTokens(env, { passwordHash: hash });
    const { res } = await callHandler(deleteAccount,
      makeReq('DELETE', '/api/user/account', accessToken, { confirm: 'USUN_KONTO' }), env);
    expect(res.status).toBe(400);
  });
});
