import { describe, it, expect, beforeEach } from 'vitest';
import {
  onRequestGet,
  onRequestPost,
  onRequestDelete,
} from '../../functions/api/user/allergens.ts';
import { createTestEnv, callHandler, seedUserWithTokens } from '../helpers/env.ts';

type AllergensResponse = { allergens?: unknown[]; message?: string; error?: string };

function makeAuthRequest(method: string, accessToken: string, body?: unknown) {
  return new Request('http://localhost/api/user/allergens', {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Copyli-Client': 'web',
      Authorization: `Bearer ${accessToken}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/** Seeduje roślinę w DB i zwraca jej id */
function seedPlant(env: ReturnType<typeof createTestEnv>['env'], id = 1, slug = 'birch') {
  env.DB._sqlite.prepare(
    `INSERT OR IGNORE INTO plants (id, slug, name_pl, name_latin, category) VALUES (?, ?, 'Brzoza', 'Betula', 'tree')`
  ).run(id, slug);
  return id;
}

describe('GET /api/user/allergens', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => { ({ env } = createTestEnv()); });

  it('zwraca pustą listę dla nowego użytkownika', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeAuthRequest('GET', accessToken);
    const { res, body } = await callHandler<AllergensResponse>(onRequestGet, req, env);
    expect(res.status).toBe(200);
    expect(body.allergens).toEqual([]);
  });

  it('zwraca 401 bez tokenu', async () => {
    const req = new Request('http://localhost/api/user/allergens', { method: 'GET' });
    const { res } = await callHandler<AllergensResponse>(onRequestGet, req, env);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/user/allergens', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => { ({ env } = createTestEnv()); });

  it('dodaje alergen z domyślnym severity=medium', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const plantId = seedPlant(env);

    const req = makeAuthRequest('POST', accessToken, { plant_id: plantId });
    const { res, body } = await callHandler<AllergensResponse>(onRequestPost, req, env);

    expect(res.status).toBe(200);
    expect(body.message).toMatch(/dodany/i);

    const row = env.DB._sqlite
      .prepare('SELECT severity FROM user_allergens WHERE user_id = ? AND plant_id = ?')
      .get(id, plantId) as { severity: string } | undefined;
    expect(row?.severity).toBe('medium');
  });

  it('aktualizuje severity gdy alergen już istnieje (upsert)', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const plantId = seedPlant(env);

    await callHandler(onRequestPost, makeAuthRequest('POST', accessToken, { plant_id: plantId, severity: 'mild' }), env);
    await callHandler(onRequestPost, makeAuthRequest('POST', accessToken, { plant_id: plantId, severity: 'severe' }), env);

    const row = env.DB._sqlite
      .prepare('SELECT severity FROM user_allergens WHERE user_id = ? AND plant_id = ?')
      .get(id, plantId) as { severity: string };
    expect(row.severity).toBe('severe');
  });

  it('zwraca 404 dla nieistniejącej rośliny', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeAuthRequest('POST', accessToken, { plant_id: 9999 });
    const { res } = await callHandler<AllergensResponse>(onRequestPost, req, env);
    expect(res.status).toBe(404);
  });

  it('zwraca 400 dla nieprawidłowego severity', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    seedPlant(env);
    const req = makeAuthRequest('POST', accessToken, { plant_id: 1, severity: 'ultra' });
    const { res } = await callHandler<AllergensResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 gdy brak plant_id', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeAuthRequest('POST', accessToken, { severity: 'mild' });
    const { res } = await callHandler<AllergensResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 401 bez tokenu', async () => {
    const req = new Request('http://localhost/api/user/allergens', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plant_id: 1 }),
    });
    const { res } = await callHandler<AllergensResponse>(onRequestPost, req, env);
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/user/allergens', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => { ({ env } = createTestEnv()); });

  it('usuwa alergen', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const plantId = seedPlant(env);
    // Dodaj najpierw
    await callHandler(onRequestPost, makeAuthRequest('POST', accessToken, { plant_id: plantId }), env);

    const req = makeAuthRequest('DELETE', accessToken, { plant_id: plantId });
    const { res } = await callHandler<AllergensResponse>(onRequestDelete, req, env);
    expect(res.status).toBe(200);

    const row = env.DB._sqlite
      .prepare('SELECT id FROM user_allergens WHERE user_id = ? AND plant_id = ?')
      .get(id, plantId);
    expect(row).toBeUndefined();
  });

  it('idempotentne — usuwa nieistniejący alergen bez błędu', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeAuthRequest('DELETE', accessToken, { plant_id: 99 });
    const { res } = await callHandler<AllergensResponse>(onRequestDelete, req, env);
    expect(res.status).toBe(200);
  });

  it('zwraca 400 gdy brak plant_id', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeAuthRequest('DELETE', accessToken, {});
    const { res } = await callHandler<AllergensResponse>(onRequestDelete, req, env);
    expect(res.status).toBe(400);
  });
});
