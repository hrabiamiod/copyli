/**
 * Generuje sitemap.xml na podstawie statycznych plików JSON z public/data/.
 * Musi być uruchomiony po generate-static.ts.
 */

import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

const BASE_URL = "https://copyli.pl";
const TODAY = new Date().toISOString().substring(0, 10);
const DATA_DIR = join(process.cwd(), "public", "data");

function url(loc: string, priority: string, changefreq: string): string {
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function main() {
  const cities = JSON.parse(readFileSync(join(DATA_DIR, "cities.json"), "utf-8")) as Array<{ slug: string; population?: number }>;
  const voivodeships = JSON.parse(readFileSync(join(DATA_DIR, "voivodeships.json"), "utf-8")) as Array<{ slug: string }>;
  const plants = JSON.parse(readFileSync(join(DATA_DIR, "plants.json"), "utf-8")) as Array<{ slug: string }>;

  const cityUrls = cities.map(c => url(`/pylek/${c.slug}`, "0.8", "hourly")).join("\n");
  const voivUrls = voivodeships.map(v => url(`/pylek/woj/${v.slug}`, "0.7", "hourly")).join("\n");
  const plantUrls = plants.map(p => url(`/pylek/roslina/${p.slug}`, "0.6", "monthly")).join("\n");

  const adviceUrls = [
    url("/porady", "0.7", "monthly"),
    url("/porady/alergia-na-pylek", "0.7", "yearly"),
    url("/porady/sezon-pylkowy-2026", "0.7", "yearly"),
    url("/porady/reaktywnosc-krzyzowa", "0.7", "yearly"),
    url("/porady/alergia-na-trawy", "0.7", "yearly"),
    url("/porady/pylenie-brzozy", "0.7", "yearly"),
    url("/porady/jak-chronic-sie-przed-pylkami", "0.7", "yearly"),
    url("/porady/alergia-na-ambrozje", "0.7", "yearly"),
  ].join("\n");

  const TOP_N = 7;
  const topCities = cities
    .filter(c => c.population != null)
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .slice(0, TOP_N);
  const pairCities = topCities.length >= TOP_N ? topCities : cities.slice(0, TOP_N);
  const comparePairs: string[] = [];
  for (let i = 0; i < pairCities.length; i++) {
    for (let j = i + 1; j < pairCities.length; j++) {
      comparePairs.push(url(`/porownaj/${pairCities[i].slug}/${pairCities[j].slug}`, "0.5", "hourly"));
    }
  }
  const compareUrls = comparePairs.join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${url("/", "1.0", "hourly")}
${url("/kalendarz-pylenia", "0.6", "monthly")}
${url("/pylek/rosliny", "0.7", "monthly")}
${adviceUrls}
${voivUrls}
${plantUrls}
${compareUrls}
${cityUrls}
</urlset>`;

  const outPath = join(process.cwd(), "public", "sitemap.xml");
  writeFileSync(outPath, sitemap, "utf-8");
  console.log(`Sitemap wygenerowany: ${outPath}`);
  console.log(`Łącznie URL: ${2 + cities.length + voivodeships.length + plants.length + 9 + comparePairs.length}`);
}

main().catch(console.error);
