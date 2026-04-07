import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestGet, onRequestPost, onRequestDelete } from '../../functions/api/user/diary.ts';
import { createTestEnv, callHandler, seedUserWithTokens } from '../helpers/env.ts';

type DiaryResponse = {
  entries?: Array<{
    date: string;
    overall_score: number | null;
    symptoms: string[];
    medication: string | null;
    notes: string | null;
  }>;
  message?: string;
  date?: string;
  error?: string;
};

const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

function makeRequest(method: string, accessToken: string, body?: unknown, search = '') {
  return new Request(`http://localhost/api/user/diary${search}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Copyli-Client': 'web',
      Authorization: `Bearer ${accessToken}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe('POST /api/user/diary', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => { ({ env } = createTestEnv()); });

  it('zapisuje wpis na dziś', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const req = makeRequest('POST', accessToken, {
      date: TODAY,
      overall_score: 3,
      symptoms: ['katar', 'lzawienie'],
      notes: 'Ciężki poranek',
    });
    const { res, body } = await callHandler<DiaryResponse>(onRequestPost, req, env);

    expect(res.status).toBe(200);
    expect(body.date).toBe(TODAY);

    const row = env.DB._sqlite
      .prepare('SELECT overall_score, symptoms FROM symptom_diary WHERE user_id = ? AND date = ?')
      .get(id, TODAY) as { overall_score: number; symptoms: string };
    expect(row.overall_score).toBe(3);
    expect(JSON.parse(row.symptoms)).toEqual(['katar', 'lzawienie']);
  });

  it('nadpisuje istniejący wpis (upsert)', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);

    await callHandler(onRequestPost, makeRequest('POST', accessToken, {
      date: TODAY, overall_score: 2, symptoms: ['katar'],
    }), env);
    await callHandler(onRequestPost, makeRequest('POST', accessToken, {
      date: TODAY, overall_score: 4, symptoms: ['kaszel', 'kichanie'],
    }), env);

    const count = env.DB._sqlite
      .prepare('SELECT COUNT(*) as cnt FROM symptom_diary WHERE user_id = ?')
      .get(id) as { cnt: number };
    expect(count.cnt).toBe(1); // tylko jeden wpis na dzień

    const row = env.DB._sqlite
      .prepare('SELECT overall_score FROM symptom_diary WHERE user_id = ? AND date = ?')
      .get(id, TODAY) as { overall_score: number };
    expect(row.overall_score).toBe(4);
  });

  it('pozwala zapisać wpis bez score (tylko objawy)', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeRequest('POST', accessToken, {
      date: YESTERDAY, symptoms: ['wysypka'],
    });
    const { res } = await callHandler<DiaryResponse>(onRequestPost, req, env);
    expect(res.status).toBe(200);
  });

  it('zapisuje pusty wpis (brak objawów — dobry dzień)', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeRequest('POST', accessToken, {
      date: TODAY, overall_score: 5, symptoms: [],
    });
    const { res } = await callHandler<DiaryResponse>(onRequestPost, req, env);
    expect(res.status).toBe(200);
  });

  it('zwraca 400 dla złej daty', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeRequest('POST', accessToken, { date: '2024-13-01', overall_score: 3 });
    const { res } = await callHandler<DiaryResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 dla daty z dalekiej przyszłości', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const future = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
    const req = makeRequest('POST', accessToken, { date: future, overall_score: 3 });
    const { res } = await callHandler<DiaryResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 dla score poza zakresem', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeRequest('POST', accessToken, { date: TODAY, overall_score: 6 });
    const { res } = await callHandler<DiaryResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
  });

  it('zwraca 400 dla nieznanego objawu', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeRequest('POST', accessToken, { date: TODAY, symptoms: ['pieczenie_oczu'] });
    const { res, body } = await callHandler<DiaryResponse>(onRequestPost, req, env);
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/pieczenie_oczu/);
  });

  it('przycina notes do 1000 znaków', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    const longNote = 'x'.repeat(2000);
    await callHandler(onRequestPost, makeRequest('POST', accessToken, {
      date: TODAY, overall_score: 1, notes: longNote,
    }), env);

    const row = env.DB._sqlite
      .prepare('SELECT notes FROM symptom_diary WHERE user_id = ? AND date = ?')
      .get(id, TODAY) as { notes: string };
    expect(row.notes.length).toBe(1000);
  });

  it('zwraca 401 bez tokenu', async () => {
    const req = new Request('http://localhost/api/user/diary', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: TODAY }),
    });
    const { res } = await callHandler<DiaryResponse>(onRequestPost, req, env);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/user/diary', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => { ({ env } = createTestEnv()); });

  it('zwraca wpisy z ostatnich 30 dni (domyślny zakres)', async () => {
    const { accessToken } = await seedUserWithTokens(env);

    // Seed dwa wpisy
    await callHandler(onRequestPost, makeRequest('POST', accessToken, { date: TODAY, overall_score: 3, symptoms: ['katar'] }), env);
    await callHandler(onRequestPost, makeRequest('POST', accessToken, { date: YESTERDAY, overall_score: 4, symptoms: [] }), env);

    const req = makeRequest('GET', accessToken, undefined);
    const { res, body } = await callHandler<DiaryResponse>(onRequestGet, req, env);

    expect(res.status).toBe(200);
    expect(body.entries).toHaveLength(2);
    expect(body.entries![0].date).toBe(TODAY); // posortowane DESC
    expect(body.entries![0].symptoms).toEqual(['katar']);
  });

  it('filtruje po zakresie dat', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    await callHandler(onRequestPost, makeRequest('POST', accessToken, { date: TODAY, overall_score: 2, symptoms: [] }), env);
    await callHandler(onRequestPost, makeRequest('POST', accessToken, { date: YESTERDAY, overall_score: 4, symptoms: [] }), env);

    // Pobierz tylko wczorajszy
    const req = makeRequest('GET', accessToken, undefined, `?from=${YESTERDAY}&to=${YESTERDAY}`);
    const { body } = await callHandler<DiaryResponse>(onRequestGet, req, env);

    expect(body.entries).toHaveLength(1);
    expect(body.entries![0].date).toBe(YESTERDAY);
  });

  it('zwraca pustą listę gdy brak wpisów', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const req = makeRequest('GET', accessToken);
    const { res, body } = await callHandler<DiaryResponse>(onRequestGet, req, env);
    expect(res.status).toBe(200);
    expect(body.entries).toEqual([]);
  });

  it('nie zwraca wpisów innego użytkownika', async () => {
    const { accessToken: tok1 } = await seedUserWithTokens(env, { id: 'user-1', email: 'a@a.pl' });
    const { accessToken: tok2 } = await seedUserWithTokens(env, { id: 'user-2', email: 'b@b.pl' });

    await callHandler(onRequestPost, makeRequest('POST', tok1, { date: TODAY, overall_score: 1, symptoms: [] }), env);

    const req = makeRequest('GET', tok2);
    const { body } = await callHandler<DiaryResponse>(onRequestGet, req, env);
    expect(body.entries).toHaveLength(0);
  });
});

describe('DELETE /api/user/diary', () => {
  let env: ReturnType<typeof createTestEnv>['env'];

  beforeEach(() => { ({ env } = createTestEnv()); });

  it('usuwa wpis po dacie', async () => {
    const { id, accessToken } = await seedUserWithTokens(env);
    await callHandler(onRequestPost, makeRequest('POST', accessToken, { date: TODAY, overall_score: 2, symptoms: [] }), env);

    const { res } = await callHandler<DiaryResponse>(
      onRequestDelete, makeRequest('DELETE', accessToken, { date: TODAY }), env
    );
    expect(res.status).toBe(200);

    const row = env.DB._sqlite
      .prepare('SELECT id FROM symptom_diary WHERE user_id = ? AND date = ?')
      .get(id, TODAY);
    expect(row).toBeUndefined();
  });

  it('idempotentne — usuwa nieistniejący wpis bez błędu', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const { res } = await callHandler<DiaryResponse>(
      onRequestDelete, makeRequest('DELETE', accessToken, { date: '2020-01-01' }), env
    );
    expect(res.status).toBe(200);
  });

  it('zwraca 400 dla złej daty', async () => {
    const { accessToken } = await seedUserWithTokens(env);
    const { res } = await callHandler<DiaryResponse>(
      onRequestDelete, makeRequest('DELETE', accessToken, { date: 'nie-data' }), env
    );
    expect(res.status).toBe(400);
  });
});
