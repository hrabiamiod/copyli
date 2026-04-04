// Endpoint diagnostyczny — test czy Pages Functions działa
import { json } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return json({
    ok: true,
    time: new Date().toISOString(),
    has_db: !!env.DB,
    has_kv: !!env.KV,
    has_jwt: !!env.JWT_SECRET,
    env: env.ENVIRONMENT ?? 'unknown',
  });
};
