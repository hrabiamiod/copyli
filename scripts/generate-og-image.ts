/**
 * Generuje public/og-default.png (1200×630) używając satori + sharp.
 * Czcionki Syne i DM Sans pobierane z Google Fonts (lub cache lokalny).
 * Użycie: npx tsx scripts/generate-og-image.ts
 */
import satori from "satori";
import sharp from "sharp";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const WIDTH = 1200;
const HEIGHT = 630;

// Czcionki z @fontsource.
// latin-ext jako OSOBNA rodzina (Syne2/DMSans2) — CSS font stack 'Syne, Syne2'
// zapewnia fallback do polskich znaków gdy satori nie znajdzie glifu w latin.
function woff(path: string): ArrayBuffer {
  return readFileSync(join(process.cwd(), path)).buffer as ArrayBuffer;
}
const F = "node_modules/@fontsource";
const syneBold700    = woff(`${F}/syne/files/syne-latin-700-normal.woff`);
const syneBold700ext = woff(`${F}/syne/files/syne-latin-ext-700-normal.woff`);
const dmSans400      = woff(`${F}/dm-sans/files/dm-sans-latin-400-normal.woff`);
const dmSans400ext   = woff(`${F}/dm-sans/files/dm-sans-latin-ext-400-normal.woff`);
const dmSans500      = woff(`${F}/dm-sans/files/dm-sans-latin-500-normal.woff`);
const dmSans500ext   = woff(`${F}/dm-sans/files/dm-sans-latin-ext-500-normal.woff`);

// Logo SVG (ikona błyskawicy z favicon.svg — ścieżka znormalizowana do 0 0 48 46)
const LOGO_PATH = "M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z";

// Kolory z design systemu copyli.pl
const C = {
  cream:     "#F7F2EB",
  creamDark: "#EDE6DA",
  forest:    "#1B4332",
  forestMid: "#2D6A4F",
  gold:      "#C9903A",
  ink:       "#18180F",
  ink2:      "#5A5A4A",
  ink3:      "#9A9A8A",
  pLow:      "#52B788",
  pMed:      "#F4A261",
  pHigh:     "#E76F51",
  pVHigh:    "#C1121F",
  surface:   "#FFFCF5",
  white:     "#ffffff",
};

const levels = [
  { label: "Niskie",         color: C.pLow   },
  { label: "Średnie",        color: C.pMed   },
  { label: "Wysokie",        color: C.pHigh  },
  { label: "Bardzo wysokie", color: C.pVHigh },
];

// Kalendarz pylenia 2026 — typowe miesiące dla Polski
// months: tablica 12 wartości 0=brak | 1=śladowe | 2=średnie | 3=wysokie
const calendar = [
  { name: "Leszczyna", months: [0,3,3,1,0,0,0,0,0,0,0,0] },
  { name: "Olcha",     months: [0,3,3,2,0,0,0,0,0,0,0,0] },
  { name: "Topola",    months: [0,0,3,2,0,0,0,0,0,0,0,0] },
  { name: "Brzoza",    months: [0,0,1,3,2,0,0,0,0,0,0,0] },
  { name: "Dąb",       months: [0,0,0,2,3,1,0,0,0,0,0,0] },
  { name: "Trawy",     months: [0,0,0,0,2,3,3,2,1,0,0,0] },
  { name: "Żyto",      months: [0,0,0,0,2,3,1,0,0,0,0,0] },
  { name: "Bylica",    months: [0,0,0,0,0,0,2,3,2,0,0,0] },
  { name: "Ambrozja",  months: [0,0,0,0,0,0,0,2,3,2,0,0] },
];
const MONTHS_SHORT = ["Sty","Lut","Mar","Kwi","Maj","Cze","Lip","Sie","Wrz","Paz","Lis","Gru"];
const CELL_COLORS = ["transparent", "#52B78850", C.pMed, C.pHigh] as const;

// satori przyjmuje obiekty JSX-like (VNode)
const element = {
  type: "div",
  props: {
    style: {
      display: "flex",
      width: WIDTH,
      height: HEIGHT,
      fontFamily: "'DMSans', 'DMSansExt', sans-serif",
      background: C.cream,
      position: "relative",
      overflow: "hidden",
    },
    children: [
      // ─── TŁO — subtelne kółka ──────────────────────────────
      {
        type: "div",
        props: {
          style: {
            position: "absolute", inset: 0,
            display: "flex",
          },
          children: [
            { type: "div", props: { style: { position: "absolute", width: 360, height: 360, borderRadius: "50%", background: C.gold, opacity: 0.06, top: 340, left: -80 } } },
            { type: "div", props: { style: { position: "absolute", width: 280, height: 280, borderRadius: "50%", background: C.forest, opacity: 0.05, top: -60, left: 480 } } },
          ],
        },
      },

      // ─── LEWA STRONA — treść ───────────────────────────────
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 56px",
            width: 620,
            height: HEIGHT,
            gap: 0,
          },
          children: [
            // Logo
            {
              type: "div",
              props: {
                style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 32 },
                children: [
                  // Ikona — SVG z favicon
                  {
                    type: "svg",
                    props: {
                      xmlns: "http://www.w3.org/2000/svg",
                      width: "36",
                      height: "34",
                      viewBox: "0 0 48 46",
                      style: { display: "flex" },
                      children: [
                        { type: "path", props: { fill: C.forest, d: LOGO_PATH } },
                      ],
                    },
                  },
                  // Tekst CoPyli.pl
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", alignItems: "baseline", gap: 0 },
                      children: [
                        {
                          type: "span",
                          props: {
                            style: {
                              fontFamily: "'Syne', 'SyneExt', sans-serif",
                              fontWeight: 700,
                              fontSize: 28,
                              color: C.forest,
                              letterSpacing: "-0.5px",
                            },
                            children: "CoPyli",
                          },
                        },
                        {
                          type: "span",
                          props: {
                            style: {
                              fontFamily: "'DMSans', 'DMSansExt', sans-serif",
                              fontWeight: 400,
                              fontSize: 28,
                              color: C.ink3,
                              letterSpacing: "-0.5px",
                            },
                            children: ".pl",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },

            // Separator pod logo
            { type: "div", props: { style: { width: 280, height: 1.5, background: C.forest, opacity: 0.12, marginBottom: 32 } } },

            // Główny tytuł
            {
              type: "div",
              props: {
                style: {
                  fontFamily: "'Syne', 'SyneExt', sans-serif",
                  fontWeight: 700,
                  fontSize: 62,
                  color: C.forest,
                  letterSpacing: "-2px",
                  lineHeight: 1.08,
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: 20,
                },
                children: [
                  { type: "span", props: { children: "Mapa pyłkowa" } },
                  { type: "span", props: { children: "Polski" } },
                ],
              },
            },

            // Tagline
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  marginBottom: 36,
                },
                children: [
                  { type: "span", props: { style: { fontSize: 20, color: C.ink2, fontWeight: 400 }, children: "Aktualne dane pyłkowe dla alergików." } },
                  { type: "span", props: { style: { fontSize: 20, color: C.ink2, fontWeight: 400 }, children: "Prognoza 5-dniowa · 954 polskie miasta." } },
                ],
              },
            },

            // Złoty separator
            { type: "div", props: { style: { width: 48, height: 3, borderRadius: 2, background: C.gold, marginBottom: 28 } } },

            // Chipsy poziomów
            {
              type: "div",
              props: {
                style: { display: "flex", flexWrap: "wrap", gap: 10 },
                children: levels.map(({ label, color }) => ({
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: color + "28",
                      border: `1.5px solid ${color}40`,
                      borderRadius: 999,
                      padding: "6px 14px 6px 10px",
                    },
                    children: [
                      { type: "div", props: { style: { width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 } } },
                      { type: "span", props: { style: { fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: "0.1px" }, children: label } },
                    ],
                  },
                })),
              },
            },
          ],
        },
      },

      // ─── SEPARATOR PIONOWY ─────────────────────────────────
      { type: "div", props: { style: { width: 1, background: C.forest, opacity: 0.1, alignSelf: "stretch" } } },

      // ─── PRAWA STRONA — forest panel ──────────────────────
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            background: C.forest,
            padding: "44px 36px 40px 40px",
            position: "relative",
            overflow: "hidden",
          },
          children: [
            // Dekoracja tła
            { type: "div", props: { style: { position: "absolute", width: 260, height: 260, borderRadius: "50%", background: "#fff", opacity: 0.03, bottom: -70, right: -70 } } },

            // Nagłówek
            {
              type: "div",
              props: {
                style: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 },
                children: [
                  { type: "span", props: { style: { fontFamily: "'Syne', 'SyneExt', sans-serif", fontWeight: 700, fontSize: 22, color: C.white, letterSpacing: "-0.5px", display: "flex" }, children: "Kalendarz pylenia" } },
                  { type: "span", props: { style: { fontFamily: "'DMSans', 'DMSansExt', sans-serif", fontSize: 15, color: C.white, opacity: 0.4, display: "flex" }, children: "2026" } },
                ],
              },
            },

            // Grid — miesięczne nagłówki + wiersze roślin
            {
              type: "div",
              props: {
                style: { display: "flex", flexDirection: "column", flex: 1 },
                children: [
                  // Nagłówki miesięcy
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", paddingLeft: 82, marginBottom: 6 },
                      children: MONTHS_SHORT.map(m => ({
                        type: "div",
                        props: {
                          style: { flex: 1, fontSize: 10, fontWeight: 600, color: C.white, opacity: 0.35, fontFamily: "'DMSans', 'DMSansExt', sans-serif", display: "flex", justifyContent: "center" },
                          children: m,
                        },
                      })),
                    },
                  },
                  // Wiersze roślin
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", flexDirection: "column", gap: 7 },
                      children: calendar.map(({ name, months }) => ({
                        type: "div",
                        props: {
                          style: { display: "flex", alignItems: "center" },
                          children: [
                            { type: "div", props: { style: { width: 82, flexShrink: 0, fontSize: 13, fontWeight: 500, color: C.white, opacity: 0.8, fontFamily: "'DMSans', 'DMSansExt', sans-serif", display: "flex" }, children: name } },
                            ...months.map((intensity, i) => {
                              const prev = months[i - 1] ?? 0;
                              const next = months[i + 1] ?? 0;
                              const isStart = intensity > 0 && prev === 0;
                              const isEnd   = intensity > 0 && next === 0;
                              const r = isStart && isEnd ? "5px"
                                : isStart ? "5px 0 0 5px"
                                : isEnd   ? "0 5px 5px 0"
                                : "0";
                              return {
                                type: "div",
                                props: { style: { flex: 1, height: 36, background: CELL_COLORS[intensity], borderRadius: r } },
                              };
                            }),
                          ],
                        },
                      })),
                    },
                  },
                ],
              },
            },

            // Legenda
            {
              type: "div",
              props: {
                style: { display: "flex", gap: 18, paddingLeft: 82, marginTop: 14 },
                children: [
                  { label: "Niskie",   color: C.pLow  },
                  { label: "Średnie",  color: C.pMed  },
                  { label: "Wysokie",  color: C.pHigh },
                ].map(({ label, color }) => ({
                  type: "div",
                  props: {
                    style: { display: "flex", alignItems: "center", gap: 6 },
                    children: [
                      { type: "div", props: { style: { width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 } } },
                      { type: "span", props: { style: { fontSize: 12, color: C.white, opacity: 0.5, fontFamily: "'DMSans', 'DMSansExt', sans-serif", display: "flex" }, children: label } },
                    ],
                  },
                })),
              },
            },
          ],
        },
      },
    ],
  },
};

const svgStr = await satori(element as any, {
  width: WIDTH,
  height: HEIGHT,
  fonts: [
    { name: "Syne",     data: syneBold700,    weight: 700, style: "normal" },
    { name: "SyneExt",  data: syneBold700ext, weight: 700, style: "normal" },
    { name: "DMSans",   data: dmSans400,      weight: 400, style: "normal" },
    { name: "DMSansExt",data: dmSans400ext,   weight: 400, style: "normal" },
    { name: "DMSans",   data: dmSans500,      weight: 500, style: "normal" },
    { name: "DMSansExt",data: dmSans500ext,   weight: 500, style: "normal" },
  ],
});

const outPath = join(process.cwd(), "public", "og-default.png");
const pngBuf = await sharp(Buffer.from(svgStr)).png().toBuffer();
writeFileSync(outPath, pngBuf);
console.log(`Zapisano: ${outPath} (${(pngBuf.length / 1024).toFixed(1)} KB)`);
