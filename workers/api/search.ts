/**
 * Cloudflare Worker: GET /api/search?q={query}
 * Przeszukuje bazę miast w D1 i zwraca do 10 wyników.
 */

interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim() ?? "";

    if (q.length < 3) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Szukaj w miastach i miejscowościach
    const stmt = env.DB.prepare(`
      SELECT c.id, c.name, c.slug, c.lat, c.lon, c.population,
             v.slug as voivodeship_slug, v.name as voivodeship_name
      FROM cities c
      JOIN voivodeships v ON c.voivodeship_id = v.id
      WHERE c.name LIKE ?1 || '%'
      ORDER BY c.population DESC
      LIMIT 10
    `);

    const { results } = await stmt.bind(q).all();

    // Jeśli mało wyników, szukaj też w places (anywhere)
    if ((results?.length ?? 0) < 5) {
      const stmt2 = env.DB.prepare(`
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
  }
};
