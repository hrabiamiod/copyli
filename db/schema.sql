-- CoPyli.PL — schemat bazy Cloudflare D1
-- Uruchom: wrangler d1 execute copyli-db --file=db/schema.sql

-- Województwa (16)
CREATE TABLE IF NOT EXISTS voivodeships (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    lat REAL NOT NULL,
    lon REAL NOT NULL
);

-- Miasta (954 polskich miast)
CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    voivodeship_id INTEGER REFERENCES voivodeships(id),
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    population INTEGER DEFAULT 0,
    terc_code TEXT,
    seo_description TEXT  -- unikalne opisy dla SEO
);

CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_voivodeship ON cities(voivodeship_id);

-- Miejscowości (dla wyszukiwarki - kieruje do najbliższego miasta)
CREATE TABLE IF NOT EXISTS localities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    nearest_city_id INTEGER REFERENCES cities(id),
    lat REAL NOT NULL,
    lon REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_localities_name ON localities(name);

-- Rośliny pylące
CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name_pl TEXT NOT NULL,
    name_latin TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('tree', 'grass', 'weed')),
    icon TEXT,
    color TEXT,
    description TEXT,
    -- progi stężeń wg EAN (ziarna/m³)
    threshold_low REAL,
    threshold_medium REAL,
    threshold_high REAL
);

-- Sezony pylenia per roślina (statyczne dane historyczne)
CREATE TABLE IF NOT EXISTS plant_seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER REFERENCES plants(id),
    month_start INTEGER NOT NULL CHECK(month_start BETWEEN 1 AND 12),
    month_end INTEGER NOT NULL CHECK(month_end BETWEEN 1 AND 12),
    peak_months TEXT,  -- JSON array np. "[4,5]"
    region TEXT DEFAULT 'polska',
    UNIQUE(plant_id, region)
);

-- Aktualne dane pyłkowe (aktualizowane co 1-2h przez GitHub Actions)
CREATE TABLE IF NOT EXISTS pollen_current (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    plant_id INTEGER NOT NULL REFERENCES plants(id),
    concentration REAL,
    level TEXT CHECK(level IN ('none', 'low', 'medium', 'high', 'very_high')),
    source TEXT DEFAULT 'open-meteo',
    measured_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(city_id, plant_id)
);

CREATE INDEX IF NOT EXISTS idx_pollen_current_city ON pollen_current(city_id);
CREATE INDEX IF NOT EXISTS idx_pollen_current_updated ON pollen_current(updated_at);

-- Prognoza pyłkowa (5 dni)
CREATE TABLE IF NOT EXISTS pollen_forecast (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    plant_id INTEGER NOT NULL REFERENCES plants(id),
    forecast_date TEXT NOT NULL,
    concentration REAL,
    level TEXT CHECK(level IN ('none', 'low', 'medium', 'high', 'very_high')),
    updated_at TEXT NOT NULL,
    UNIQUE(city_id, plant_id, forecast_date)
);

CREATE INDEX IF NOT EXISTS idx_pollen_forecast_city_date ON pollen_forecast(city_id, forecast_date);

-- Historia pyłkowa (dla kalendarza pylenia - dane archiwalne)
CREATE TABLE IF NOT EXISTS pollen_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    plant_id INTEGER NOT NULL REFERENCES plants(id),
    date TEXT NOT NULL,
    concentration REAL,
    level TEXT,
    UNIQUE(city_id, plant_id, date)
);

CREATE INDEX IF NOT EXISTS idx_pollen_history_date ON pollen_history(date);
CREATE INDEX IF NOT EXISTS idx_pollen_history_plant ON pollen_history(plant_id, date);

-- Dane pogodowe (dla Indeksu Spacerowego)
CREATE TABLE IF NOT EXISTS weather_current (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL REFERENCES cities(id) UNIQUE,
    temperature REAL,
    wind_speed REAL,
    wind_direction REAL,
    precipitation REAL,
    humidity REAL,
    aqi INTEGER,
    aqi_label TEXT,
    updated_at TEXT NOT NULL
);

-- Indeks Spacerowy (generowany przez skrypt)
CREATE TABLE IF NOT EXISTS walk_index (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL REFERENCES cities(id) UNIQUE,
    score INTEGER CHECK(score BETWEEN 0 AND 100),
    recommendation TEXT,
    best_time TEXT,
    reason TEXT,
    updated_at TEXT NOT NULL
);
