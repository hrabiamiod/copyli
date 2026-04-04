import { requireAuth, AuthError } from '../../lib/auth.ts';
import { sanitizeString } from '../../lib/validation.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

const AVATAR_ALLOWED_DOMAINS = [
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
];

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  let authUser;
  try {
    authUser = await requireAuth(request, env);
  } catch (e) {
    if (e instanceof AuthError) return json({ error: e.message }, e.status, cors);
    throw e;
  }

  const user = await env.DB.prepare(`
    SELECT id, email, email_verified, display_name, avatar_url, password_hash, created_at
    FROM users WHERE id = ? AND deleted_at IS NULL
  `).bind(authUser.sub).first<{
    id: string;
    email: string;
    email_verified: number;
    display_name: string | null;
    avatar_url: string | null;
    password_hash: string | null;
    created_at: string;
  }>();

  if (!user) {
    return json({ error: 'Uzytkownik nie istnieje' }, 404, cors);
  }

  const [allergens, locations, googleAccount] = await Promise.all([
    env.DB.prepare(`
      SELECT ua.plant_id, ua.severity, p.name_pl, p.slug, p.category, p.icon
      FROM user_allergens ua
      JOIN plants p ON p.id = ua.plant_id
      WHERE ua.user_id = ?
      ORDER BY p.category, p.name_pl
    `).bind(user.id).all(),

    env.DB.prepare(`
      SELECT ul.city_id, ul.label, ul.is_primary, c.name, c.slug,
             v.name as voivodeship_name
      FROM user_locations ul
      JOIN cities c ON c.id = ul.city_id
      JOIN voivodeships v ON v.id = c.voivodeship_id
      WHERE ul.user_id = ?
      ORDER BY ul.is_primary DESC, ul.created_at ASC
    `).bind(user.id).all(),

    env.DB.prepare(
      'SELECT id FROM oauth_accounts WHERE user_id = ? AND provider = ?'
    ).bind(user.id, 'google').first(),
  ]);

  return json(
    {
      id: user.id,
      email: user.email,
      email_verified: !!user.email_verified,
      name: user.display_name,
      avatar: user.avatar_url,
      created_at: user.created_at,
      has_password: !!user.password_hash,
      google_connected: !!googleAccount,
      allergens: allergens.results ?? [],
      locations: locations.results ?? [],
    },
    200,
    cors
  );
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  let authUser;
  try {
    authUser = await requireAuth(request, env);
  } catch (e) {
    if (e instanceof AuthError) return json({ error: e.message }, e.status, cors);
    throw e;
  }

  let body: { name?: unknown; avatar_url?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return json({ error: 'Nieprawidlowe dane wejsciowe' }, 400, cors);
  }

  const updates: string[] = [];
  const values: (string | null)[] = [];

  if (body.name !== undefined) {
    updates.push('display_name = ?');
    values.push(typeof body.name === 'string' && body.name.trim() ? sanitizeString(body.name, 100) : null);
  }

  if (body.avatar_url !== undefined) {
    if (body.avatar_url !== null) {
      const avatarStr = String(body.avatar_url);
      const isAllowed = AVATAR_ALLOWED_DOMAINS.some((d) => avatarStr.includes(d));
      if (!isAllowed) {
        return json({ error: 'Niedozwolone zrodlo avatara' }, 400, cors);
      }
      updates.push('avatar_url = ?');
      values.push(avatarStr);
    } else {
      updates.push('avatar_url = ?');
      values.push(null);
    }
  }

  if (updates.length === 0) {
    return json({ error: 'Brak pol do aktualizacji' }, 400, cors);
  }

  const now = new Date().toISOString();
  updates.push('updated_at = ?');
  values.push(now);
  values.push(authUser.sub);

  await env.DB.prepare(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  return json({ message: 'Profil zaktualizowany' }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
};
