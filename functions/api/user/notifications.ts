import { requireAuth, AuthError } from '../../lib/auth.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

const VALID_THRESHOLDS = ['medium', 'high', 'very_high'] as const;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  const settings = await env.DB.prepare(
    'SELECT email_alerts, alert_threshold, alert_time FROM user_notification_settings WHERE user_id = ?'
  ).bind(authUser.sub).first<{ email_alerts: number; alert_threshold: string; alert_time: string }>();

  return json({
    email_alerts: !!settings?.email_alerts,
    alert_threshold: settings?.alert_threshold ?? 'high',
    alert_time: settings?.alert_time ?? '07:00',
  }, 200, cors);
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAuth(request, env); }
  catch (e) { return e instanceof AuthError ? json({ error: e.message }, e.status, cors) : Promise.reject(e); }

  let body: { email_alerts?: unknown; alert_threshold?: unknown; alert_time?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Nieprawidłowe dane wejściowe' }, 400, cors); }

  if (body.alert_threshold !== undefined &&
      !VALID_THRESHOLDS.includes(body.alert_threshold as typeof VALID_THRESHOLDS[number])) {
    return json({ error: 'alert_threshold musi być: medium, high lub very_high' }, 400, cors);
  }
  if (body.alert_time !== undefined &&
      (typeof body.alert_time !== 'string' || !TIME_RE.test(body.alert_time))) {
    return json({ error: 'alert_time musi być w formacie HH:MM' }, 400, cors);
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO user_notification_settings (user_id, email_alerts, alert_threshold, alert_time, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      email_alerts      = COALESCE(excluded.email_alerts, email_alerts),
      alert_threshold   = COALESCE(excluded.alert_threshold, alert_threshold),
      alert_time        = COALESCE(excluded.alert_time, alert_time),
      updated_at        = excluded.updated_at
  `).bind(
    authUser.sub,
    body.email_alerts !== undefined ? (body.email_alerts ? 1 : 0) : null,
    body.alert_threshold ?? null,
    body.alert_time ?? null,
    now
  ).run();

  return json({ message: 'Ustawienia powiadomień zaktualizowane' }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
