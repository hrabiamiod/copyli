// Tymczasowy test CPU — USUN PO DIAGNOZIE
import type { Env } from '../../lib/types.ts';

export const onRequestGet: PagesFunction<Env> = async () => {
  const t0 = Date.now();
  try {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode('testpassword'), 'PBKDF2', false, ['deriveBits']
    );
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: new Uint8Array(16), iterations: 310_000, hash: 'SHA-256' },
      key, 256
    );
    return new Response(JSON.stringify({ ok: true, ms: Date.now() - t0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e), ms: Date.now() - t0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
