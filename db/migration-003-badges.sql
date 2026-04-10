-- Tabela definicji odznak
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,          -- slug: 'pioneer', 'user_100', 'supporter'
  label_pl TEXT NOT NULL,       -- wyświetlana nazwa: 'Pionier #1'
  icon TEXT NOT NULL,           -- emoji lub symbol: '✦'
  bg TEXT NOT NULL DEFAULT '#f3f4f6',
  color TEXT NOT NULL DEFAULT '#374151',
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Startowe odznaki
INSERT OR IGNORE INTO badges (id, label_pl, icon, bg, color, description) VALUES
  ('pioneer',   'Pionier #1',    '✦',  '#fef3c7', '#92400e', 'Pierwszy zarejestrowany użytkownik CoPyli.pl'),
  ('user_100',  'User #100',     '💯', '#dbeafe', '#1e40af', 'Setny zarejestrowany użytkownik'),
  ('supporter', 'Wspierający',   '🌿', '#dcfce7', '#166534', 'Aktywnie wspiera rozwój CoPyli.pl');

-- Tabela przypisań odznak do użytkowników
CREATE TABLE IF NOT EXISTS user_badges (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id   TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  granted_at TEXT NOT NULL DEFAULT (datetime('now')),
  granted_by TEXT REFERENCES users(id),
  PRIMARY KEY (user_id, badge_id)
);
