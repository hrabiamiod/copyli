// Tymczasowy endpoint diagnostyczny — USUN PO DEBUGOWANIU
import type { Env } from '../../lib/types.ts';

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const results: Record<string, unknown> = {
    has_db: !!env.DB,
    has_kv: !!env.KV,
    has_jwt: !!env.JWT_SECRET,
    jwt_length: env.JWT_SECRET?.length ?? 0,
  };

  // Test 1: czy tabela users istnieje
  try {
    await env.DB.prepare('SELECT COUNT(*) as n FROM users').first();
    results.table_users = 'OK';
  } catch (e) {
    results.table_users = String(e);
  }

  // Test 2: crypto PBKDF2
  try {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode('test'), 'PBKDF2', false, ['deriveBits']
    );
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: new Uint8Array(16), iterations: 1000, hash: 'SHA-256' },
      key, 256
    );
    results.crypto_pbkdf2 = 'OK';
  } catch (e) {
    results.crypto_pbkdf2 = String(e);
  }

  // Test 3: JWT signing
  try {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(env.JWT_SECRET ?? 'test'),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('test'));
    results.crypto_hmac = 'OK';
  } catch (e) {
    results.crypto_hmac = String(e);
  }

  // Test 4: INSERT do users (rollback)
  try {
    const id = 'debug-test-' + Date.now();
    await env.DB.prepare(
      `INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))`
    ).bind(id, `debug-${Date.now()}@test.com`).run();
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    results.db_insert = 'OK';
  } catch (e) {
    results.db_insert = String(e);
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
