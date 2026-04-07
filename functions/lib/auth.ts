import { verifyAccessToken } from './tokens.ts';
import type { Env, JWTPayload } from './types.ts';

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function requireAdmin(
  request: Request,
  env: Env
): Promise<JWTPayload> {
  const authUser = await requireAuth(request, env);

  const user = await env.DB.prepare(
    'SELECT is_admin FROM users WHERE id = ? AND deleted_at IS NULL'
  ).bind(authUser.sub).first<{ is_admin: number }>();

  if (!user?.is_admin) throw new AuthError('Brak dostępu', 403);

  if (!env.KV) throw new AuthError('KV niedostępne', 500);
  const mfaOk = await env.KV.get(`mfa:${authUser.sub}`);
  if (!mfaOk) throw new AuthError('mfa_required', 403);

  return authUser;
}

export async function requireAuth(request: Request, env: Env): Promise<JWTPayload> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Brak autoryzacji — zaloguj sie');
  }

  const token = authHeader.slice(7);
  const payload = await verifyAccessToken(token, env.JWT_SECRET);

  if (!payload) {
    throw new AuthError('Nieprawidlowy lub wygasly token');
  }

  return payload;
}
