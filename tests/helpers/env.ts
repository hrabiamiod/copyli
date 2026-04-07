import { createMockD1 } from './db.ts';
import { createMockKV } from './kv.ts';
import { createAccessToken, generateRefreshToken, hashToken } from '../../functions/lib/tokens.ts';

export const TEST_JWT_SECRET = 'test-secret-at-least-32-chars-long!';

/**
 * Tworzy świeże środowisko testowe (nowy DB + KV przy każdym wywołaniu).
 */
export function createTestEnv() {
  const DB = createMockD1();
  const KV = createMockKV();

  const env = {
    DB,
    KV,
    JWT_SECRET: TEST_JWT_SECRET,
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
    ENVIRONMENT: 'test',
    APP_URL: 'http://localhost',
  };

  return { env, DB, KV };
}

/**
 * Buduje Request jak Cloudflare Pages go widzi.
 */
export function makeRequest(
  method: string,
  body?: unknown,
  headers: Record<string, string> = {}
): Request {
  return new Request('http://localhost/api/auth/test', {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Copyli-Client': 'web',
      'CF-Connecting-IP': '127.0.0.1',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * Tworzy access token dla użytkownika testowego.
 */
export async function makeAccessToken(userId: string, email: string, name: string | null = null) {
  return createAccessToken({ sub: userId, email, name }, TEST_JWT_SECRET);
}

/**
 * Seeduje użytkownika w DB i zwraca access token + refresh token (już w DB).
 */
export async function seedUserWithTokens(
  env: ReturnType<typeof createTestEnv>['env'],
  overrides: { id?: string; email?: string; name?: string; passwordHash?: string } = {}
) {
  const id = overrides.id ?? 'test-user-id';
  const email = overrides.email ?? 'user@example.com';
  const name = overrides.name ?? 'Test User';
  const now = new Date().toISOString();

  env.DB._sqlite.prepare(
    `INSERT OR IGNORE INTO users (id, email, email_verified, display_name, password_hash, created_at, updated_at)
     VALUES (?, ?, 1, ?, ?, ?, ?)`
  ).run(id, email, name, overrides.passwordHash ?? null, now, now);

  const accessToken = await makeAccessToken(id, email, name);
  const refreshToken = generateRefreshToken();
  const refreshHash = await hashToken(refreshToken);
  const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  env.DB._sqlite.prepare(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at, last_used_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, refreshHash, refreshExpires, now, now);

  return { id, email, name, accessToken, refreshToken };
}

/**
 * Pomocnik — wywołuje handler Cloudflare Pages Function.
 * Zwraca Response i sparsowane body JSON.
 */
export async function callHandler<T = Record<string, unknown>>(
  handler: (ctx: { request: Request; env: ReturnType<typeof createTestEnv>['env'] }) => Promise<Response>,
  request: Request,
  env: ReturnType<typeof createTestEnv>['env']
): Promise<{ res: Response; body: T }> {
  const res = await handler({ request, env } as never);
  let body: T = {} as T;
  try {
    body = await res.json() as T;
  } catch { /* nie-JSON response */ }
  return { res, body };
}
