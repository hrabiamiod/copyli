import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestGet as getBadges } from '../../functions/api/admin/badges.ts';
import { onRequestGet as getUsers } from '../../functions/api/admin/users.ts';
import { onRequestPost as assignBadge, onRequestDelete as revokeBadge } from '../../functions/api/admin/users/[id]/badges.ts';
import { createTestEnv, callHandler, seedUserWithTokens } from '../helpers/env.ts';

function makeReq(method: string, path: string, accessToken: string, body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Copyli-Client': 'web', Authorization: `Bearer ${accessToken}` },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function seedAdmin(env: ReturnType<typeof createTestEnv>['env']) {
  const { id, accessToken } = await seedUserWithTokens(env, { email: 'admin@test.com', name: 'Admin' });
  env.DB._sqlite.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(id);
  await env.KV.put(`mfa:${id}`, '1', { expirationTtl: 3600 });
  return { id, accessToken };
}

describe('GET /api/admin/badges', () => {
  let env: ReturnType<typeof createTestEnv>['env'];
  beforeEach(() => { ({ env } = createTestEnv()); });

  it('zwraca 403 dla zwykłego usera', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const { res } = await callHandler(getBadges, makeReq('GET', '/api/admin/badges', accessToken), env);
    expect(res.status).toBe(403);
  });

  it('zwraca listę odznak dla admina z MFA', async () => {
    const { accessToken } = await seedAdmin(env);
    const { res, body } = await callHandler(getBadges, makeReq('GET', '/api/admin/badges', accessToken), env);
    expect(res.status).toBe(200);
    const b = body as { badges: { id: string }[] };
    expect(Array.isArray(b.badges)).toBe(true);
    expect(b.badges.some(x => x.id === 'pioneer')).toBe(true);
  });
});

describe('GET /api/admin/users', () => {
  let env: ReturnType<typeof createTestEnv>['env'];
  beforeEach(() => { ({ env } = createTestEnv()); });

  it('zwraca listę użytkowników z odznakami', async () => {
    const { accessToken } = await seedAdmin(env);
    const { res, body } = await callHandler(getUsers, makeReq('GET', '/api/admin/users', accessToken), env);
    expect(res.status).toBe(200);
    const u = body as { users: { id: string; badges: unknown[] }[] };
    expect(Array.isArray(u.users)).toBe(true);
    expect(u.users[0].badges).toEqual([]);
  });
});

describe('POST/DELETE /api/admin/users/[id]/badges', () => {
  let env: ReturnType<typeof createTestEnv>['env'];
  beforeEach(() => { ({ env } = createTestEnv()); });

  async function callBadgeHandler(
    handler: (ctx: { request: Request; env: typeof env; params: Record<string, string> }) => Promise<Response>,
    userId: string,
    accessToken: string,
    method: string,
    body?: unknown
  ) {
    const req = new Request(`http://localhost/api/admin/users/${userId}/badges`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Copyli-Client': 'web', Authorization: `Bearer ${accessToken}` },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const res = await handler({ request: req, env, params: { id: userId } });
    let resBody: Record<string, unknown> = {};
    try { resBody = await res.json() as Record<string, unknown>; } catch { /* */ }
    return { res, body: resBody };
  }

  it('przypisuje odznakę użytkownikowi', async () => {
    const { accessToken } = await seedAdmin(env);
    const { id: targetId } = await seedUserWithTokens(env, { email: 'target@test.com', id: 'target-user-id' });

    const { res } = await callBadgeHandler(assignBadge as never, targetId, accessToken, 'POST', { badge_id: 'pioneer' });
    expect(res.status).toBe(200);

    const row = env.DB._sqlite.prepare('SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?').get(targetId, 'pioneer');
    expect(row).toBeTruthy();
  });

  it('usuwa odznakę użytkownikowi', async () => {
    const { id: adminId, accessToken } = await seedAdmin(env);
    const { id: targetId } = await seedUserWithTokens(env, { email: 'target2@test.com', id: 'target-user-id-2' });

    env.DB._sqlite.prepare(
      'INSERT INTO user_badges (user_id, badge_id, granted_at, granted_by) VALUES (?, ?, ?, ?)'
    ).run(targetId, 'pioneer', new Date().toISOString(), adminId);

    const { res } = await callBadgeHandler(revokeBadge as never, targetId, accessToken, 'DELETE', { badge_id: 'pioneer' });
    expect(res.status).toBe(200);

    const row = env.DB._sqlite.prepare('SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?').get(targetId, 'pioneer');
    expect(row).toBeFalsy();
  });

  it('zwraca 404 dla nieznanej odznaki', async () => {
    const { accessToken } = await seedAdmin(env);
    const { id: targetId } = await seedUserWithTokens(env, { email: 'target3@test.com', id: 'target-user-id-3' });

    const { res } = await callBadgeHandler(assignBadge as never, targetId, accessToken, 'POST', { badge_id: 'nieistnieje' });
    expect(res.status).toBe(404);
  });

  it('zwraca 403 dla zwykłego usera', async () => {
    const { accessToken } = await seedUserWithTokens(env, { email: 'normal@test.com', id: 'normal-id' });
    const { res } = await callBadgeHandler(assignBadge as never, 'some-id', accessToken, 'POST', { badge_id: 'pioneer' });
    expect(res.status).toBe(403);
  });
});
