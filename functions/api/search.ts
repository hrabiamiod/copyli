/**
 * Cloudflare Pages Function: GET /api/search?q={query}
 * Przeszukuje bazę miast w D1 i zwraca do 10 wyników.
 */

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (q.length < 3) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  const stmt = context.env.DB.prepare(`
    SELECT c.id, c.name, c.slug, c.lat, c.lon, c.population,
           v.slug as voivodeship_slug, v.name as voivodeship_name
    FROM cities c
    JOIN voivodeships v ON c.voivodeship_id = v.id
    WHERE c.name LIKE ?1 || '%'
    ORDER BY c.population DESC
    LIMIT 10
  `);

  const { results } = await stmt.bind(q).all();

  if ((results?.length ?? 0) < 5) {
    const stmt2 = context.env.DB.prepare(`
      SELECT c.id, c.name, c.slug, c.lat, c.lon, c.population,
             v.slug as voivodeship_slug, v.name as voivodeship_name
      FROM cities c
      JOIN voivodeships v ON c.voivodeship_id = v.id
      WHERE c.name LIKE '%' || ?1 || '%'
        AND c.name NOT LIKE ?1 || '%'
      ORDER BY c.population DESC
      LIMIT 5
    `);
    const { results: extra } = await stmt2.bind(q).all();
    const combined = [...(results ?? []), ...(extra ?? [])];
    return new Response(JSON.stringify(combined), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  return new Response(JSON.stringify(results ?? []), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
};
