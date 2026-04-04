-- Migration 002: Modul uzytkownika — auth, profil alergika, dziennik
-- Uruchom: wrangler d1 execute copyli-db --file=db/migration-002-users.sql

-- Uzytkownicy
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER DEFAULT 0,
    password_hash TEXT,
    display_name TEXT,
    avatar_url TEXT,
    failed_login_count INTEGER DEFAULT 0,
    locked_until TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Konta OAuth (1 user moze miec wiele providerow)
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    provider_email TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_user ON oauth_accounts(user_id);

-- Refresh tokeny (przechowujemy tylko hash)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    device_info TEXT,
    ip_address TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_expires ON refresh_tokens(expires_at);

-- Tokeny email (weryfikacja adresu, reset hasla)
CREATE TABLE IF NOT EXISTS email_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('verify_email', 'reset_password')),
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens(user_id);

-- Profil alergika — wybrane alergeny z poziomem wrazliwosci
CREATE TABLE IF NOT EXISTS user_allergens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id INTEGER NOT NULL REFERENCES plants(id),
    severity TEXT DEFAULT 'medium' CHECK(severity IN ('mild', 'medium', 'severe')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, plant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_allergens ON user_allergens(user_id);

-- Zapisane lokalizacje (dom, praca, inne)
CREATE TABLE IF NOT EXISTS user_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    label TEXT DEFAULT 'dom' CHECK(label IN ('dom', 'praca', 'inne')),
    is_primary INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, city_id)
);

CREATE INDEX IF NOT EXISTS idx_user_locations ON user_locations(user_id);

-- Dziennik objawow (1 wpis na dzien)
CREATE TABLE IF NOT EXISTS symptom_diary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    overall_score INTEGER CHECK(overall_score BETWEEN 1 AND 5),
    symptoms TEXT,
    medication TEXT,
    notes TEXT,
    city_id INTEGER REFERENCES cities(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_diary_user_date ON symptom_diary(user_id, date);

-- Zgody RODO (historia zmian zgod)
CREATE TABLE IF NOT EXISTS user_consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    granted INTEGER NOT NULL DEFAULT 0,
    ip_address TEXT,
    granted_at TEXT NOT NULL DEFAULT (datetime('now')),
    revoked_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_consents_user ON user_consents(user_id);

-- Audit log bezpieczenstwa
CREATE TABLE IF NOT EXISTS auth_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON auth_audit_log(created_at);

-- Ustawienia powiadomien pylkowych
CREATE TABLE IF NOT EXISTS user_notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_alerts INTEGER DEFAULT 0,
    alert_threshold TEXT DEFAULT 'high' CHECK(alert_threshold IN ('medium', 'high', 'very_high')),
    alert_time TEXT DEFAULT '07:00',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
