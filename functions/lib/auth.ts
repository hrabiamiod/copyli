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
