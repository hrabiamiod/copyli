import Database from 'better-sqlite3';

// Schemat tabel auth + minimalne tabele referencyjne (dla JOIN w me.ts)
const AUTH_SCHEMA = `
CREATE TABLE IF NOT EXISTS voivodeships (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    lat REAL NOT NULL,
    lon REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    voivodeship_id INTEGER REFERENCES voivodeships(id),
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    population INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name_pl TEXT NOT NULL,
    name_latin TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT,
    color TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER DEFAULT 0,
    password_hash TEXT,
    display_name TEXT,
    avatar_url TEXT,
    failed_login_count INTEGER DEFAULT 0,
    locked_until TEXT,
    is_admin INTEGER DEFAULT 0,
    totp_secret TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    provider_email TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(provider, provider_user_id)
);

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

CREATE TABLE IF NOT EXISTS email_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('verify_email', 'reset_password')),
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_allergens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id INTEGER NOT NULL REFERENCES plants(id),
    severity TEXT DEFAULT 'medium',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, plant_id)
);

CREATE TABLE IF NOT EXISTS user_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    label TEXT DEFAULT 'dom',
    is_primary INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, city_id)
);

CREATE TABLE IF NOT EXISTS user_consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    granted INTEGER NOT NULL DEFAULT 0,
    ip_address TEXT,
    granted_at TEXT NOT NULL DEFAULT (datetime('now')),
    revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS auth_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pollen_current (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL,
    plant_id INTEGER NOT NULL,
    concentration REAL,
    level TEXT,
    source TEXT,
    measured_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS user_notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_alerts INTEGER DEFAULT 0,
    alert_threshold TEXT DEFAULT 'high',
    alert_time TEXT DEFAULT '07:00',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  label_pl TEXT NOT NULL,
  icon TEXT NOT NULL,
  bg TEXT NOT NULL DEFAULT '#f3f4f6',
  color TEXT NOT NULL DEFAULT '#374151',
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO badges (id, label_pl, icon, bg, color, description) VALUES
  ('pioneer',   'Pionier #1',  '✦',  '#fef3c7', '#92400e', 'Pierwszy zarejestrowany użytkownik'),
  ('user_100',  'User #100',   '💯', '#dbeafe', '#1e40af', 'Setny zarejestrowany użytkownik'),
  ('supporter', 'Wspierający', '🌿', '#dcfce7', '#166534', 'Aktywnie wspiera rozwój CoPyli.pl');

CREATE TABLE IF NOT EXISTS user_badges (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id   TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  granted_at TEXT NOT NULL DEFAULT (datetime('now')),
  granted_by TEXT REFERENCES users(id),
  PRIMARY KEY (user_id, badge_id)
);

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
`;

export type MockD1 = ReturnType<typeof createMockD1>;

/**
 * Tworzy in-memory SQLite z prawdziwym schematem auth.
 * Interfejs jest zgodny z D1Database (Cloudflare Pages Functions).
 */
export function createMockD1() {
  const sqlite = new Database(':memory:');
  sqlite.exec(AUTH_SCHEMA);

  function makeBoundStatement(sql: string, args: unknown[]) {
    return {
      async first<T>(): Promise<T | null> {
        const stmt = sqlite.prepare(sql);
        return (stmt.get(...(args as Parameters<typeof stmt.get>)) as T) ?? null;
      },
      async run(): Promise<D1Result> {
        const stmt = sqlite.prepare(sql);
        const info = stmt.run(...(args as Parameters<typeof stmt.run>));
        return { success: true, meta: { changes: info.changes, last_row_id: Number(info.lastInsertRowid) }, results: [] };
      },
      async all<T>(): Promise<{ results: T[] }> {
        const stmt = sqlite.prepare(sql);
        return { results: stmt.all(...(args as Parameters<typeof stmt.all>)) as T[] };
      },
    };
  }

  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return makeBoundStatement(sql, args);
        },
        // bez .bind() — dla prostych zapytań
        ...makeBoundStatement(sql, []),
      };
    },
    async batch(statements: ReturnType<typeof makeBoundStatement>[]) {
      return Promise.all(statements.map(s => s.all()));
    },
    /** Bezpośredni dostęp do SQLite (do seedowania w testach) */
    _sqlite: sqlite,
  };

  return db as unknown as D1Database & { _sqlite: Database.Database };
}

// Pomocnicze typy zgodne z D1
interface D1Result {
  success: boolean;
  meta: { changes: number; last_row_id: number };
  results: unknown[];
}
