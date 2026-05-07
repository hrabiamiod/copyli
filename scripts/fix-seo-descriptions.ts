import citiesRaw from "../public/data/cities.json";
import { CITY_LOCATIVE } from "../src/utils/cityLocative";
import * as fs from "fs";
import * as path from "path";

const cities = citiesRaw as Array<Record<string, unknown>>;

const fixed = cities.map((city) => {
  const slug = city.slug as string;
  const name = city.name as string;
  const loc = CITY_LOCATIVE[slug];
  const prep = loc ? `w ${loc}` : `w ${name}`;
  return {
    ...city,
    seo_description: `Sprawdź aktualne stężenie pyłków ${prep}. Prognoza pyłkowa, kalendarz pylenia i Indeks Spacerowy ${prep}.`,
  };
});

const outPath = path.join(process.cwd(), "public/data/cities.json");
fs.writeFileSync(outPath, JSON.stringify(fixed, null, 2));
console.log(`Fixed ${fixed.length} cities`);
