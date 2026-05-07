#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${1:-.}"
SITE="${SITE:-https://copyli.pl}"

echo "== locate seed-cities.ts and geo helpers =="
find "$REPO_ROOT" -type f \( \
  -name "seed-cities.ts" \
  -o -name "*point*polygon*.ts" \
  -o -name "*city*.json" \
  -o -name "*cities*.json" \
  -o -name "*geo*.ts" \
  -o -name "*voivodeship*.ts" \
  -o -name "*woj*.ts" \
\) 2>/dev/null | grep -v node_modules | sed -n '1,100p'

SEED_FILE="$(find "$REPO_ROOT" -type f -name "seed-cities.ts" 2>/dev/null | grep -v node_modules | head -n1 || true)"

if [[ -n "${SEED_FILE}" ]]; then
  echo
  echo "== inspect seed-cities.ts for bbox vs point-in-polygon =="
  grep -n "bounding\|bbox\|pointInPolygon\|booleanPointInPolygon\|polygon\|voivodeship\|wojew" "$SEED_FILE" || true
else
  echo "WARN: seed-cities.ts not found"
fi

echo
echo "== inspect geo-related code =="
grep -rn "bounding\|bbox\|pointInPolygon\|booleanPointInPolygon\|polygon\|voivodeship\|wojew\|wojewodztwo\|województwo" "$REPO_ROOT" \
  --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules || true

echo
echo "== inspect city inflection usage =="
grep -rn "city\.name\|cityName\|displayName\|locative\|genitive\|miejscownik\|dopełniacz\|Co pyli\|Dziś w\|Pyłki w\|Stężenie pyłków" "$REPO_ROOT" \
  --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules || true

echo
echo "== inspect localStorage / My City code =="
grep -rn "localStorage\|sessionStorage\|Moje miasto\|myCity\|savedCity\|selectedCity\|preferredCity\|copyli:" "$REPO_ROOT" \
  --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules || true

echo
echo "== raw HTML checks without JS =="
for PATHNAME in \
  "/pylek/lodz" \
  "/pylek/bydgoszcz" \
  "/pylek/biala-podlaska" \
  "/pylek/suraz" \
  "/pylek/plock" \
  "/pylek/bytom" \
  "/pylek/myszkow" \
  "/pylek/myslenice" \
  "/pylek/torun" \
  "/pylek/zlotow" \
  "/pylek/woj/dolnoslaskie" \
  "/kalendarz-pylenia" \
  "/porady/sezon-pylkowy-2026"
do
  echo
  echo "-- ${SITE}${PATHNAME}"
  curl -fsSL --max-time 10 "${SITE}${PATHNAME}" > /tmp/copyli-check.html 2>/dev/null || { echo "FAILED: curl error for ${PATHNAME}"; continue; }

  echo "Markers:"
  grep -o "Prognoza 5-dniowa\|Indeks Spacerowy\|Co pyli dziś\|Najczęstsze pytania\|Open-Meteo\|canonical\|województwie\|Kalendarz pylenia\|Sezon pyłkowy" /tmp/copyli-check.html | sort -u || echo "(none found)"

  echo "Potential bad inflection:"
  grep -o "w Płock \|w Myszków\|w Myślenice\|w Biała Podlaska\|w Toruń\|w Łódź\|w Pabianice\|w Żory\|w Łomża\|w Mława" /tmp/copyli-check.html || echo "(none — OK)"
done

echo
echo "== robots and sitemap =="
curl -fsSL --max-time 10 "${SITE}/robots.txt" > /tmp/copyli-robots.txt 2>/dev/null || true
grep -i "sitemap:" /tmp/copyli-robots.txt || echo "WARN: no sitemap in robots.txt"

curl -fsSL --max-time 15 "${SITE}/sitemap.xml" > /tmp/copyli-sitemap.xml 2>/dev/null || true

echo
echo "Sitemap sample (first 30 URLs):"
grep -o "<loc>[^<]*</loc>" /tmp/copyli-sitemap.xml | sed 's/<[^>]*>//g' | sed -n '1,30p' || echo "(empty)"

echo
echo "Important URLs in sitemap:"
grep -E "pylek/lodz|pylek/bydgoszcz|pylek/biala-podlaska|pylek/suraz|kalendarz-pylenia|sezon-pylkowy-2026" /tmp/copyli-sitemap.xml || echo "WARN: key URLs missing from sitemap"

echo
echo "== canonical checks =="
for PATHNAME in \
  "/pylek/lodz" \
  "/pylek/bydgoszcz" \
  "/pylek/biala-podlaska" \
  "/pylek/suraz" \
  "/pylek/woj/dolnoslaskie" \
  "/kalendarz-pylenia" \
  "/porady/sezon-pylkowy-2026"
do
  echo "-- ${SITE}${PATHNAME}"
  curl -fsSL --max-time 10 "${SITE}${PATHNAME}" 2>/dev/null | grep -o '<link[^>]*rel="canonical"[^>]*>' || echo "(no canonical found)"
done

echo
echo "Done."
