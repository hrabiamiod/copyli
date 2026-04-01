/**
 * Generuje public/og-default.png (1200×630) z szablonu SVG.
 * Użycie: npx tsx scripts/generate-og-image.ts
 */
import sharp from "sharp";
import { writeFileSync } from "fs";
import { join } from "path";

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#052e16"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Tło -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Dekoracyjne okręgi (pyłki) -->
  <circle cx="980" cy="120" r="180" fill="#16a34a" opacity="0.12"/>
  <circle cx="1100" cy="500" r="120" fill="#22c55e" opacity="0.08"/>
  <circle cx="220" cy="530" r="150" fill="#15803d" opacity="0.10"/>
  <circle cx="80" cy="80" r="80" fill="#4ade80" opacity="0.06"/>

  <!-- Siatka kropek -->
  ${Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 14 }, (_, col) =>
      `<circle cx="${col * 90 + 45}" cy="${row * 90 + 45}" r="1.5" fill="#4ade80" opacity="0.15"/>`
    ).join("")
  ).join("")}

  <!-- Karta centralna -->
  <rect x="60" y="60" width="780" height="510" rx="24" fill="url(#card)" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>

  <!-- Logo — błyskawica -->
  <g transform="translate(108, 130) scale(2.6)">
    <path fill="#4ade80" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
  </g>

  <!-- Nazwa -->
  <text x="108" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="82" font-weight="800" fill="#ffffff" letter-spacing="-2">CoPyli.pl</text>

  <!-- Tagline -->
  <text x="108" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="400" fill="#86efac" letter-spacing="0.5">Interaktywna mapa pyłkowa Polski</text>

  <!-- Separtor -->
  <rect x="108" y="430" width="60" height="3" rx="2" fill="#4ade80" opacity="0.6"/>

  <!-- Deskryptory -->
  <text x="108" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="#bbf7d0" opacity="0.8">954 miasta · Prognoza 5-dniowa · Aktualizacja co 2h</text>

  <!-- Poziomy pyłków — badge'e po prawej -->
  <g transform="translate(920, 200)">
    <rect width="200" height="52" rx="14" fill="#16a34a" opacity="0.3"/>
    <circle cx="24" cy="26" r="8" fill="#4ade80"/>
    <text x="44" y="31" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#dcfce7">Niskie</text>
  </g>
  <g transform="translate(920, 268)">
    <rect width="200" height="52" rx="14" fill="#ca8a04" opacity="0.3"/>
    <circle cx="24" cy="26" r="8" fill="#facc15"/>
    <text x="44" y="31" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#fef9c3">Średnie</text>
  </g>
  <g transform="translate(920, 336)">
    <rect width="200" height="52" rx="14" fill="#dc2626" opacity="0.3"/>
    <circle cx="24" cy="26" r="8" fill="#f87171"/>
    <text x="44" y="31" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#fee2e2">Wysokie</text>
  </g>
  <g transform="translate(920, 404)">
    <rect width="200" height="52" rx="14" fill="#7c3aed" opacity="0.3"/>
    <circle cx="24" cy="26" r="8" fill="#a78bfa"/>
    <text x="44" y="31" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#ede9fe">Bardzo wysokie</text>
  </g>

  <!-- URL -->
  <text x="600" y="590" font-family="system-ui, sans-serif" font-size="20" fill="#4ade80" opacity="0.5" text-anchor="middle">copyli.pl</text>
</svg>`;

const outPath = join(process.cwd(), "public", "og-default.png");

const buffer = await sharp(Buffer.from(svg))
  .png()
  .toBuffer();

writeFileSync(outPath, buffer);
console.log(`Zapisano: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
