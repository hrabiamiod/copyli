import { requireAdmin, AuthError } from '../../lib/auth.ts';
import { json, corsHeaders } from '../../lib/response.ts';
import type { Env } from '../../lib/types.ts';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);
  let authUser;
  try { authUser = await requireAdmin(request, env); }
  catch (e) {
    if (e instanceof AuthError) return json({ error: e.message }, e.status, cors);
    return Promise.reject(e);
  }
  void authUser;

  const [
    usersRow,
    allergensRow,
    locationsRow,
    alertsRow,
    diaryRow,
    alertsSentRow,
    pollenRow,
    recentUsers,
    topAllergens,
    regByDay,
  ] = await env.DB.batch([
    env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(email_verified) as verified,
        SUM(CASE WHEN created_at > datetime('now','-7 days') THEN 1 ELSE 0 END) as last_7_days
      FROM users WHERE deleted_at IS NULL
    `),
    env.DB.prepare(`SELECT COUNT(DISTINCT user_id) as count FROM user_allergens`),
    env.DB.prepare(`SELECT COUNT(DISTINCT user_id) as count FROM user_locations`),
    env.DB.prepare(`SELECT COUNT(*) as count FROM user_notification_settings WHERE email_alerts = 1`),
    env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN date = date('now') THEN 1 ELSE 0 END) as today
      FROM symptom_diary
    `),
    env.DB.prepare(`
      SELECT
        SUM(CASE WHEN DATE(created_at)=DATE('now') THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN created_at > datetime('now','-7 days') THEN 1 ELSE 0 END) as week
      FROM auth_audit_log WHERE action = 'pollen_alert_sent'
    `),
    env.DB.prepare(`
      SELECT MAX(updated_at) as last_updated, COUNT(DISTINCT city_id) as cities
      FROM pollen_current
    `),
    env.DB.prepare(`
      SELECT id, email, email_verified, created_at,
        (SELECT COUNT(*) FROM user_allergens WHERE user_id = users.id) as allergens_count,
        (SELECT COUNT(*) FROM user_locations WHERE user_id = users.id) as locations_count
      FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 10
    `),
    env.DB.prepare(`
      SELECT p.name_pl, p.icon, COUNT(*) as count
      FROM user_allergens ua JOIN plants p ON p.id = ua.plant_id
      GROUP BY p.id ORDER BY count DESC LIMIT 6
    `),
    env.DB.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at > datetime('now','-30 days') AND deleted_at IS NULL
      GROUP BY DATE(created_at) ORDER BY date
    `),
  ]);

  return json({
    users: usersRow.results[0] ?? {},
    allergens: (allergensRow.results[0] as { count: number })?.count ?? 0,
    locations: (locationsRow.results[0] as { count: number })?.count ?? 0,
    alerts_enabled: (alertsRow.results[0] as { count: number })?.count ?? 0,
    diary: diaryRow.results[0] ?? {},
    alerts_sent: alertsSentRow.results[0] ?? {},
    pollen: pollenRow.results[0] ?? {},
    recent_users: recentUsers.results ?? [],
    top_allergens: topAllergens.results ?? [],
    registrations_by_day: regByDay.results ?? [],
  }, 200, cors);
};

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
