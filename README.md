# CoPyli.pl — Interaktywna mapa pyłkowa Polski

Aplikacja webowa dla alergików pokazująca aktualne i prognozowane stężenia pyłków w 954 polskich miastach.

## Stack technologiczny

- **Frontend**: React + Vite + Tailwind CSS v4
- **Hosting**: Cloudflare Pages (statyczne pliki)
- **API**: Cloudflare Workers (wyszukiwarka miast)
- **Baza danych**: Cloudflare D1 (SQLite)
- **Dane pyłkowe**: [Open-Meteo Air Quality API](https://open-meteo.com) (bezpłatne, bez klucza)
- **Aktualizacja**: GitHub Actions cron co 2 godziny

## Pierwsze uruchomienie

### 1. Wymagania

- Node.js 20+
- Konto Cloudflare (darmowy tier wystarczy)
- `wrangler` CLI: `npm install -g wrangler && wrangler login`

### 2. Instalacja

```bash
git clone https://github.com/twoj-user/copyli.git
cd copyli
npm install
cp .env.example .env
```

### 3. Utwórz bazę D1

```bash
wrangler d1 create copyli-db
# Skopiuj database_id do wrangler.toml (pole database_id)

wrangler d1 execute copyli-db --file=db/schema.sql
wrangler d1 execute copyli-db --file=db/seed-plants.sql
```

### 4. Załaduj miasta (954 polskich miast)

```bash
npm run seed:cities
# Generuje db/seed-cities.sql z danych OpenStreetMap

wrangler d1 execute copyli-db --file=db/seed-cities.sql
```

### 5. Pobierz pierwsze dane pyłkowe

```bash
export CLOUDFLARE_API_TOKEN=<twój_token>
export CLOUDFLARE_ACCOUNT_ID=<twój_account_id>
export D1_DATABASE_ID=<database_id_z_wrangler.toml>

npm run data:all
# Pobiera dane z Open-Meteo → D1 → generuje pliki JSON → sitemap.xml
```

### 6. Uruchom lokalnie

```bash
npm run dev
```

### 7. Deploy na Cloudflare Pages

```bash
npm run build
wrangler pages deploy dist --project-name=copyli
```

## GitHub Actions (automatyczne aktualizacje)

Dodaj sekrety do repozytorium GitHub (Settings → Secrets):

| Sekret | Wartość |
|--------|---------|
| `CF_API_TOKEN` | Token Cloudflare z prawami Pages i D1 |
| `CF_ACCOUNT_ID` | Twój Cloudflare Account ID |
| `D1_DATABASE_ID` | ID bazy D1 z wrangler.toml |

Pipeline uruchamia się co 2 godziny i:
1. Pobiera dane pyłkowe z Open-Meteo dla 954 miast
2. Oblicza Indeks Spacerowy (pyłki + pogoda)
3. Generuje statyczne JSON do `public/data/`
4. Generuje `public/sitemap.xml`
5. Buduje React app
6. Deployuje na Cloudflare Pages

## Zmienne środowiskowe

| Zmienna | Wymagana | Opis |
|---------|----------|------|
| `CLOUDFLARE_API_TOKEN` | Tak | Token CF z prawami D1 i Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Tak | Account ID Cloudflare |
| `D1_DATABASE_ID` | Tak | ID bazy D1 |
| `AMBEE_API_KEY` | Nie | Ambee Pollen API (opcjonalne) |
| `GOOGLE_POLLEN_API_KEY` | Nie | Google Pollen API (opcjonalne) |

## Architektura

```
GitHub Actions (cron co 2h)
    ↓
Open-Meteo API → D1 (pollen_current, pollen_forecast, weather_current)
    ↓
scripts/generate-static.ts → public/data/*.json
    ↓
npm run build → dist/
    ↓
wrangler pages deploy → Cloudflare Pages CDN
    ↑
Cloudflare Workers → /api/search (wyszukiwarka z D1)
```

## Funkcje v1.0

- 🗺️ Interaktywna mapa Polski z nakładkami pyłkowymi per województwo
- 🏙️ 954 dedykowane strony miast (`/pylek/{miasto}`) z pełnym SEO
- 🌡️ Aktualne stężenia 15 roślin (drzewa, trawy, chwasty)
- 📅 Prognoza pyłkowa 5 dni
- 🚶 **Indeks Spacerowy** — kiedy wyjść z domu? (pyłki + pogoda)
- 📊 **Kalendarz Krzyżowy Pylenia** — interaktywna heatmapa sezonów
- 🔍 Wyszukiwarka miast (od 3 liter, debounce)
- 📍 Geolokalizacja → najbliższe miasto
- ♻️ Automatyczne aktualizacje co 2h (GitHub Actions)
- 🎯 Pełne SEO: meta tagi, Schema.org, sitemap.xml, canonical URLs

## Planowane (v2.0)

- 📧 Alerty pyłkowe na email (double opt-in, bez rejestracji)
- 👤 Profil alergika z personalizowanymi alertami
- 📔 Dziennik objawów z korelacją danych pyłkowych
- 🔁 Porównywarka miast
