/**
 * Jednorazowy skrypt naprawczy — koryguje błędne przypisania województw w cities.json
 * używając point-in-polygon z voivodeships.geojson zamiast bounding boxów.
 *
 * Użycie: npx tsx scripts/fix-voivodeships.ts
 */

import * as fs from "fs";
import * as path from "path";

const DATA = path.join(process.cwd(), "public/data");

interface GeoFeature {
  properties: { slug: string; name: string };
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: any };
}

// Ray-casting point-in-polygon.
// UWAGA: GeoJSON coordinates = [lon, lat] — odwrócona kolejność vs. city.lat/lon!
function pointInRing(lat: number, lon: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]; // xi=lon, yi=lat w GeoJSON
    const [xj, yj] = ring[j];
    if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi))
      inside = !inside;
  }
  return inside;
}

function pointInFeature(lat: number, lon: number, f: GeoFeature): boolean {
  const { type, coordinates } = f.geometry;
  if (type === "Polygon") {
    // coordinates[0] = exterior ring, coordinates[1..] = holes
    return pointInRing(lat, lon, coordinates[0]) &&
      !coordinates.slice(1).some((hole: [number, number][]) => pointInRing(lat, lon, hole));
  }
  if (type === "MultiPolygon") {
    return coordinates.some((poly: [number, number][][]) =>
      pointInRing(lat, lon, poly[0]) &&
      !poly.slice(1).some((hole: [number, number][]) => pointInRing(lat, lon, hole))
    );
  }
  return false;
}

const gj = JSON.parse(fs.readFileSync(path.join(DATA, "voivodeships.geojson"), "utf-8"));
const cities = JSON.parse(fs.readFileSync(path.join(DATA, "cities.json"), "utf-8"));

let fixed = 0;
let notFound = 0;

const result = cities.map((city: any) => {
  const found = gj.features.find((f: GeoFeature) => pointInFeature(city.lat, city.lon, f));
  if (!found) {
    // Miasto poza granicami (np. Gubin DE/PL) — zostaw bez zmian
    notFound++;
    return city;
  }
  const correctSlug = found.properties.slug;
  const rawName = found.properties.name as string;
  const correctName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  if (city.voivodeship_slug !== correctSlug) {
    console.log(`FIX: ${city.name}: ${city.voivodeship_name} → ${correctName}`);
    fixed++;
    return { ...city, voivodeship_slug: correctSlug, voivodeship_name: correctName };
  }
  return city;
});

fs.writeFileSync(path.join(DATA, "cities.json"), JSON.stringify(result, null, 2));
console.log(`\n✅ Fixed ${fixed} / ${cities.length} cities. ${notFound} poza granicami (bez zmian).`);
