import { describe, it, expect, beforeEach } from 'vitest';
import {
  onRequestGet,
  onRequestPost,
  onRequestDelete,
  onRequestPatch,
} from '../../functions/api/user/locations.ts';
import { createTestEnv, callHandler, seedUserWithTokens } from '../helpers/env.ts';

type LocationsResponse = { locations?: unknown[]; message?: string; error?: string };

function makeAuthRequest(method: string, accessToken: string, body?: unknown) {
  return new Request('http://localhost/api/user/locations', {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Copyli-Client': 'web',
      Authorization: `Bearer ${accessToken}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/** Seeduje województwo + miasto i zwraca city_id */
function seedCity(
  env: ReturnType<typeof createTestEnv>['env'],
  cityId = 1,
  slug = 'warszawa'
) {
  env.DB._sqlite.prepare(
    `INSERT OR IGNORE INTO voivodeships (id, name, slug, lat, lon) VALUES (1, 'Mazowieckie', 'mazowieckie', 52.2, 21.0)`
  ).run();
  env.DB._sqlite.prepare(
    `INSERT OR IGNORE INTO cities (id, name, slug, voivodeship_id, lat, lon) VALUES (?, ?, ?, 1, 52.2, 21.0)`
  ).run(cityId, slug === 'warszawa' ? 'Warszawa' : slug, slug);
  return cityId;
}

describe('GET /api/user/locations', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => { ({ env } = createTestEnv()); });

  it('zwraca pustą listę dla nowego użytkownika', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const { res, body } = await callHandler<LocationsResponse>(
      onRequestGet, makeAuthRequest('GET', accessToken), env
    );
    expect(res.status).toBe(200);
    expect(body.locations).toEqual([]);
  });

  it('zwraca 401 bez tokenu', async () => {
    const req = new Request('http://localhost/api/user/locations', { method: 'GET' });
    const { res } = await callHandler<LocationsResponse>(onRequestGet, req, env);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/user/locations', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => { ({ env } = createTestEnv()); });

  it('dodaje lokalizację — pierwsza staje się primary', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const cityId = seedCity(env);

    const { res, body } = await callHandler<LocationsResponse>(
      onRequestPost, makeAuthRequest('POST', accessToken, { city_id: cityId, label: 'dom' }), env
    );
    expect(res.status).toBe(200);
    expect(body.message).toMatch(/zapisana/i);

    const row = env.DB._sqlite
      .prepare('SELECT is_primary, label FROM user_locations WHERE user_id = ? AND city_id = ?')
      .get(id, cityId) as { is_primary: number; label: string };
    expect(row.is_primary).toBe(1);
    expect(row.label).toBe('dom');
  });

  it('druga lokalizacja nie jest primary', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const city1 = seedCity(env, 1, 'warszawa');
    const city2 = seedCity(env, 2, 'krakow');

    await callHandler(onRequestPost, makeAuthRequest('POST', accessToken, { city_id: city1, label: 'dom' }), env);
    await callHandler(onRequestPost, makeAuthRequest('POST', accessToken, { city_id: city2, label: 'praca' }), env);

    const row = env.DB._sqlite
      .prepare('SELECT is_primary FROM user_locations WHERE user_id = ? AND city_id = ?')
      .get(id, city2) as { is_primary: number };
    expect(row.is_primary).toBe(0);
  });

  it('zwraca 404 dla nieistniejącego miasta', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeAuthRequest('POST', accessToken, { city_id: 9999, label: 'dom' });
    const { res } = await callHandler<LocationsResponse>(onRequestPost, req, env);
    expect(res.status).toBe(404);
  });

  it('zwraca 400 dla nieprawidłowego label', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    seedCity(env);
    const req = makeAuthRequest('POST', accessToken, { city_id: 1, label: 'biuro' });
    const { res } = await callHandler<LocationsResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 422 po przekroczeniu limitu 5 lokalizacji', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    // Seed 5 miast i dodaj
    for (let i = 1; i <= 5; i++) {
      seedCity(env, i, `miasto-${i}`);
      await callHandler(onRequestPost, makeAuthRequest('POST', accessToken, { city_id: i, label: 'inne' }), env);
    }
    // Szósta powinna zwrócić 422
    seedCity(env, 6, 'miasto-6');
    const req = makeAuthRequest('POST', accessToken, { city_id: 6, label: 'inne' });
    const { res } = await callHandler<LocationsResponse>(onRequestPost, req, env);
    expect(res.status).toBe(422);
  });

  it('upsert — aktualizuje label gdy miasto już zapisane', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const cityId = seedCity(env);
    await callHandler(onRequestPost, makeAuthRequest('POST', accessToken, { city_id: cityId, label: 'dom' }), env);
    await callHandler(onRequestPost, makeAuthRequest('POST', accessToken, { city_id: cityId, label: 'praca' }), env);

    const row = env.DB._sqlite
      .prepare('SELECT label FROM user_locations WHERE user_id = ? AND city_id = ?')
      .get(id, cityId) as { label: string };
    expect(row.label).toBe('praca');
  });
});

describe('DELETE /api/user/locations', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => { ({ env } = createTestEnv()); });

  it('usuwa lokalizację', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const cityId = seedCity(env);
    await callHandler(onRequestPost, makeAuthRequest('POST', accessToken, { city_id: cityId, label: 'dom' }), env);

    const { res } = await callHandler<LocationsResponse>(
      onRequestDelete, makeAuthRequest('DELETE', accessToken, { city_id: cityId }), env
    );
    expect(res.status).toBe(200);

    const row = env.DB._sqlite
      .prepare('SELECT id FROM user_locations WHERE user_id = ? AND city_id = ?')
      .get(id, cityId);
    expect(row).toBeUndefined();
  });

  it('idempotentne — usuwa nieistniejącą lokalizację bez błędu', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const { res } = await callHandler<LocationsResponse>(
      onRequestDelete, makeAuthRequest('DELETE', accessToken, { city_id: 9999 }), env
    );
    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/user/locations (set primary)', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => { ({ env } = createTestEnv()); });

  it('zmienia primary lokalizację', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const city1 = seedCity(env, 1, 'warszawa');
    const city2 = seedCity(env, 2, 'krakow');
    await callHandler(onRequestPost, makeAuthRequest('POST', accessToken, { city_id: city1, label: 'dom' }), env);
    await callHandler(onRequestPost, makeAuthRequest('POST', accessToken, { city_id: city2, label: 'praca' }), env);

    const { res } = await callHandler<LocationsResponse>(
      onRequestPatch, makeAuthRequest('PATCH', accessToken, { city_id: city2 }), env
    );
    expect(res.status).toBe(200);

    const rows = env.DB._sqlite
      .prepare('SELECT city_id, is_primary FROM user_locations WHERE user_id = ? ORDER BY city_id')
      .all(id) as Array<{ city_id: number; is_primary: number }>;

    expect(rows.find(r => r.city_id === city1)?.is_primary).toBe(0);
    expect(rows.find(r => r.city_id === city2)?.is_primary).toBe(1);
  });
});
