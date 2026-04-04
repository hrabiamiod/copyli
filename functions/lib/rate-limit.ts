export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

export async function checkRateLimit(
  kv: KVNamespace | undefined,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  // Jesli KV nie jest skonfigurowane — przepusc (rate limiting niedostepny)
  if (!kv) {
    return { allowed: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 };
  }

  const now = Date.now();
  const kvKey = `rl:${key}`;

  const raw = await kv.get(kvKey);
  let state: RateLimitState = raw
    ? (JSON.parse(raw) as RateLimitState)
    : { count: 0, resetAt: now + windowSeconds * 1000 };

  if (now > state.resetAt) {
    state = { count: 0, resetAt: now + windowSeconds * 1000 };
  }

  state.count++;

  const ttl = Math.max(1, Math.ceil((state.resetAt - now) / 1000));
  await kv.put(kvKey, JSON.stringify(state), { expirationTtl: ttl });

  return {
    allowed: state.count <= limit,
    remaining: Math.max(0, limit - state.count),
    resetAt: state.resetAt,
  };
}
