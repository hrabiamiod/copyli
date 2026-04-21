/**
 * Generuje public/og/cities/{slug}.png (1200×630) per miasto.
 * Używa satori + sharp. Czcionki ładowane raz, renderowanie w batchach.
 * Użycie: npx tsx scripts/generate-og-images-cities.ts
 */
import satori from "satori";
import sharp from "sharp";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const WIDTH = 1200;
const HEIGHT = 630;
const BATCH_SIZE = 20;

function woff(p: string): ArrayBuffer {
  return readFileSync(join(process.cwd(), p)).buffer as ArrayBuffer;
}

const F = "node_modules/@fontsource";
const syneBold700    = woff(`${F}/syne/files/syne-latin-700-normal.woff`);
const syneBold700ext = woff(`${F}/syne/files/syne-latin-ext-700-normal.woff`);
const dmSans400      = woff(`${F}/dm-sans/files/dm-sans-latin-400-normal.woff`);
const dmSans400ext   = woff(`${F}/dm-sans/files/dm-sans-latin-ext-400-normal.woff`);
const dmSans500      = woff(`${F}/dm-sans/files/dm-sans-latin-500-normal.woff`);
const dmSans500ext   = woff(`${F}/dm-sans/files/dm-sans-latin-ext-500-normal.woff`);

const FONTS = [
  { name: "Syne",      data: syneBold700,    weight: 700 as const, style: "normal" as const },
  { name: "SyneExt",   data: syneBold700ext, weight: 700 as const, style: "normal" as const },
  { name: "DMSans",    data: dmSans400,      weight: 400 as const, style: "normal" as const },
  { name: "DMSansExt", data: dmSans400ext,   weight: 400 as const, style: "normal" as const },
  { name: "DMSans",    data: dmSans500,      weight: 500 as const, style: "normal" as const },
  { name: "DMSansExt", data: dmSans500ext,   weight: 500 as const, style: "normal" as const },
];

const LOGO_PATH = "M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z";

const C = {
  cream:  "#F7F2EB",
  forest: "#1B4332",
  gold:   "#C9903A",
  ink:    "#18180F",
  ink2:   "#5A5A4A",
  ink3:   "#9A9A8A",
  pLow:   "#52B788",
  pMed:   "#F4A261",
  pHigh:  "#E76F51",
  pVHigh: "#C1121F",
  white:  "#ffffff",
};

const LEVEL_ORDER = ["very_high", "high", "medium", "low", "none"];
const LEVEL_LABEL: Record<string, string> = {
  none: "Brak", low: "Niskie", medium: "Średnie", high: "Wysokie", very_high: "Bardzo wysokie",
};
const LEVEL_COLOR: Record<string, string> = {
  none: C.ink3, low: C.pLow, medium: C.pMed, high: C.pHigh, very_high: C.pVHigh,
};

interface PollenEntry { plant_name: string; level: string; }
interface CityData    { pollen?: PollenEntry[]; }
interface City        { name: string; slug: string; voivodeship_name: string; }

function buildElement(city: City, active: PollenEntry[]) {
  const fontSize = city.name.length > 14 ? 44 : city.name.length > 10 ? 52 : 60;

  const badgeNodes = active.length > 0
    ? active.slice(0, 4).map(p => ({
        type: "div",
        props: {
          style: {
            display: "flex", alignItems: "center", gap: 8,
            background: LEVEL_COLOR[p.level] + "28",
            border: `1.5px solid ${LEVEL_COLOR[p.level]}40`,
            borderRadius: 999, padding: "5px 13px 5px 9px",
          },
          children: [
            { type: "div", props: { style: { width: 9, height: 9, borderRadius: "50%", background: LEVEL_COLOR[p.level], flexShrink: 0 } } },
            { type: "span", props: { style: { fontSize: 13, fontWeight: 600, color: C.ink, letterSpacing: "0.1px", display: "flex" }, children: `${p.plant_name} · ${LEVEL_LABEL[p.level]}` } },
          ],
        },
      }))
    : [{
        type: "div",
        props: {
          style: {
            display: "flex", alignItems: "center", gap: 8,
            background: C.pLow + "28", border: `1.5px solid ${C.pLow}40`,
            borderRadius: 999, padding: "5px 13px 5px 9px",
          },
          children: [
            { type: "div", props: { style: { width: 9, height: 9, borderRadius: "50%", background: C.pLow, flexShrink: 0 } } },
            { type: "span", props: { style: { fontSize: 13, fontWeight: 600, color: C.ink, display: "flex" }, children: "Niskie stężenie pyłków" } },
          ],
        },
      }];

  return {
    type: "div",
    props: {
      style: {
        display: "flex", width: WIDTH, height: HEIGHT,
        fontFamily: "'DMSans', 'DMSansExt', sans-serif",
        background: C.cream, overflow: "hidden",
      },
      children: [
        // Subtle background circles
        {
          type: "div",
          props: {
            style: { position: "absolute", inset: 0, display: "flex" },
            children: [
              { type: "div", props: { style: { position: "absolute", width: 340, height: 340, borderRadius: "50%", background: C.gold, opacity: 0.06, top: 330, left: -80 } } },
              { type: "div", props: { style: { position: "absolute", width: 260, height: 260, borderRadius: "50%", background: C.forest, opacity: 0.05, top: -50, left: 440 } } },
            ],
          },
        },

        // Left — city info
        {
          type: "div",
          props: {
            style: {
              display: "flex", flexDirection: "column", justifyContent: "center",
              padding: "56px 56px", width: 620, height: HEIGHT,
            },
            children: [
              // Logo row
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 },
                  children: [
                    {
                      type: "svg",
                      props: {
                        xmlns: "http://www.w3.org/2000/svg",
                        width: "28", height: "27", viewBox: "0 0 48 46",
                        style: { display: "flex" },
                        children: [{ type: "path", props: { fill: C.forest, d: LOGO_PATH } }],
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", alignItems: "baseline" },
                        children: [
                          { type: "span", props: { style: { fontFamily: "'Syne','SyneExt',sans-serif", fontWeight: 700, fontSize: 22, color: C.forest, letterSpacing: "-0.5px", display: "flex" }, children: "CoPyli" } },
                          { type: "span", props: { style: { fontFamily: "'DMSans','DMSansExt',sans-serif", fontWeight: 400, fontSize: 22, color: C.ink3, letterSpacing: "-0.5px", display: "flex" }, children: ".pl" } },
                        ],
                      },
                    },
                  ],
                },
              },

              // Thin separator
              { type: "div", props: { style: { width: 280, height: 1.5, background: C.forest, opacity: 0.12, marginBottom: 24 } } },

              // "Pyłki w:" label
              { type: "div", props: { style: { fontSize: 15, color: C.ink3, fontWeight: 400, marginBottom: 8, display: "flex" }, children: "Aktualne stężenie pyłków w:" } },

              // City name
              { type: "div", props: { style: { fontFamily: "'Syne','SyneExt',sans-serif", fontWeight: 700, fontSize, color: C.forest, letterSpacing: "-2px", lineHeight: 1.0, marginBottom: 6, display: "flex" }, children: city.name } },

              // Voivodeship
              { type: "div", props: { style: { fontSize: 16, color: C.ink2, fontWeight: 400, marginBottom: 24, display: "flex" }, children: `woj. ${city.voivodeship_name}` } },

              // Gold accent bar
              { type: "div", props: { style: { width: 48, height: 3, borderRadius: 2, background: C.gold, marginBottom: 22 } } },

              // Pollen badges
              { type: "div", props: { style: { display: "flex", flexWrap: "wrap", gap: 8 }, children: badgeNodes } },
            ],
          },
        },

        // Vertical divider
        { type: "div", props: { style: { width: 1, background: C.forest, opacity: 0.1, alignSelf: "stretch" } } },

        // Right — forest panel
        {
          type: "div",
          props: {
            style: {
              display: "flex", flexDirection: "column", justifyContent: "center",
              flex: 1, background: C.forest,
              padding: "44px 40px", position: "relative", overflow: "hidden", gap: 16,
            },
            children: [
              { type: "div", props: { style: { position: "absolute", width: 260, height: 260, borderRadius: "50%", background: C.white, opacity: 0.03, bottom: -70, right: -70 } } },
              { type: "div", props: { style: { position: "absolute", width: 160, height: 160, borderRadius: "50%", background: C.gold, opacity: 0.06, top: -30, right: 50 } } },

              // Title
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column", gap: 2, marginBottom: 4 },
                  children: [
                    { type: "span", props: { style: { fontFamily: "'Syne','SyneExt',sans-serif", fontWeight: 700, fontSize: 22, color: C.white, letterSpacing: "-0.5px", display: "flex", opacity: 0.9 }, children: "Mapa pyłkowa" } },
                    { type: "span", props: { style: { fontFamily: "'Syne','SyneExt',sans-serif", fontWeight: 700, fontSize: 22, color: C.white, letterSpacing: "-0.5px", display: "flex", opacity: 0.9 }, children: "Polski" } },
                  ],
                },
              },

              { type: "div", props: { style: { width: "100%", height: 1, background: C.white, opacity: 0.1 } } },

              // Feature list
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column", gap: 12 },
                  children: [
                    ["🌸", "Prognoza 5-dniowa"],
                    ["📍", "1021 polskich miast"],
                    ["⚡", "Dane co 2 godziny"],
                    ["🚶", "Indeks Spacerowy"],
                  ].map(([icon, text]) => ({
                    type: "div",
                    props: {
                      style: { display: "flex", alignItems: "center", gap: 10 },
                      children: [
                        { type: "span", props: { style: { fontSize: 18, display: "flex" }, children: icon } },
                        { type: "span", props: { style: { fontFamily: "'DMSans','DMSansExt',sans-serif", fontSize: 15, color: C.white, opacity: 0.7, display: "flex" }, children: text } },
                      ],
                    },
                  })),
                },
              },

              // URL badge
              {
                type: "div",
                props: {
                  style: {
                    marginTop: 20, display: "flex", alignItems: "center",
                    padding: "8px 16px", background: "rgba(255,255,255,0.08)",
                    borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
                  },
                  children: [
                    { type: "span", props: { style: { fontFamily: "'DMSans','DMSansExt',sans-serif", fontSize: 14, color: C.white, opacity: 0.6, display: "flex" }, children: "copyli.pl" } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function renderCity(city: City, active: PollenEntry[], outDir: string): Promise<void> {
  const el = buildElement(city, active);
  const svg = await satori(el as Parameters<typeof satori>[0], { width: WIDTH, height: HEIGHT, fonts: FONTS });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(join(outDir, `${city.slug}.png`), png);
}

async function main() {
  const DATA    = join(process.cwd(), "public", "data");
  const OUT_DIR = join(process.cwd(), "public", "og", "cities");
  mkdirSync(OUT_DIR, { recursive: true });

  const cities: City[] = JSON.parse(readFileSync(join(DATA, "cities.json"), "utf-8"));
  console.log(`🖼️  Generowanie OG images dla ${cities.length} miast...`);

  let done = 0;
  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (city) => {
      let active: PollenEntry[] = [];
      const dataPath = join(DATA, "cities", `${city.slug}.json`);
      if (existsSync(dataPath)) {
        try {
          const d: CityData = JSON.parse(readFileSync(dataPath, "utf-8"));
          active = (d.pollen ?? [])
            .filter(p => p.level !== "none")
            .sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));
        } catch { /* skip */ }
      }
      await renderCity(city, active, OUT_DIR);
    }));
    done += batch.length;
    process.stdout.write(`  ${done}/${cities.length}\r`);
  }

  console.log(`\n✅ Wygenerowano ${cities.length} OG images → public/og/cities/`);
}

main().catch(console.error);
