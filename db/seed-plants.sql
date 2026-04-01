-- Seed: rośliny pylące z progami stężeń wg European Aeroallergen Network (EAN)
-- Kategoria: tree=drzewa, grass=trawy, weed=chwasty

INSERT OR REPLACE INTO plants (slug, name_pl, name_latin, category, icon, color, threshold_low, threshold_medium, threshold_high, description) VALUES
-- Drzewa
('alder',     'Olcha',    'Alnus',      'tree',  '🌿', '#8BC34A', 15,  75,  300,  'Jeden z pierwszych alergenów wiosennych, pylenie już od stycznia-lutego.'),
('birch',     'Brzoza',   'Betula',     'tree',  '🌳', '#4CAF50', 20,  90,  400,  'Najsilniejszy alergen drzewny, masowe pylenie w kwietniu-maju.'),
('hazel',     'Leszczyna','Corylus',    'tree',  '🌱', '#9CCC65', 10,  50,  200,  'Pylenie od lutego, często jednocześnie z olchą.'),
('ash',       'Jesion',   'Fraxinus',   'tree',  '🌲', '#66BB6A', 15,  80,  300,  'Pylenie w marcu-maju, wysoka alergenność.'),
('oak',       'Dąb',      'Quercus',    'tree',  '🍂', '#795548', 20,  100, 400,  'Pylenie w maju, często nakłada się z brzozą.'),
('poplar',    'Topola',   'Populus',    'tree',  '🌾', '#A5D6A7', 25,  150, 500,  'Pylenie w marcu-maju, charakterystyczny puch.'),
('pine',      'Sosna',    'Pinus',      'tree',  '🌲', '#2E7D32', 100, 500, 2000, 'Pyłek mało alergenny, ale masowy.'),
('plane',     'Platan',   'Platanus',   'tree',  '🍃', '#81C784', 10,  50,  200,  'Popularny w parkach miejskich, pylenie w maju.'),
-- Trawy
('grass',     'Trawy',    'Poaceae',    'grass', '🌿', '#FDD835', 20,  75,  200,  'Główny alergen letni, bylica i tymotka najczęściej uczulają.'),
('ryegrass',  'Życica',   'Lolium',     'grass', '🌾', '#F9A825', 20,  75,  200,  'Jeden z najsilniejszych alergenów trawiastych.'),
('timothy',   'Tymotka',  'Phleum',     'grass', '🌾', '#FBC02D', 20,  75,  200,  'Masowo uprawiana, silna alergenność.'),
-- Chwasty
('mugwort',   'Bylica',   'Artemisia',  'weed',  '🌿', '#FF7043', 10,  50,  200,  'Najważniejszy alergen późnoletnio-jesienny, sierpień-wrzesień.'),
('ragweed',   'Ambrozja', 'Ambrosia',   'weed',  '⚠️', '#F44336', 5,   25,  100,  'Inwazyjny, bardzo silny alergen, sezon sierpień-październik.'),
('nettle',    'Pokrzywa', 'Urtica',     'weed',  '🌿', '#FF8A65', 20,  100, 500,  'Pylenie od maja do września.'),
('plantain',  'Babka',    'Plantago',   'weed',  '🌱', '#FFAB76', 20,  100, 500,  'Pylenie od maja do września.');

-- Sezony pylenia (uproszczone, dla całej Polski)
INSERT OR REPLACE INTO plant_seasons (plant_id, month_start, month_end, peak_months, region) VALUES
((SELECT id FROM plants WHERE slug='hazel'),   1,  4,  '[2,3]',   'polska'),
((SELECT id FROM plants WHERE slug='alder'),   1,  4,  '[2,3]',   'polska'),
((SELECT id FROM plants WHERE slug='ash'),     3,  5,  '[4]',     'polska'),
((SELECT id FROM plants WHERE slug='poplar'),  3,  5,  '[4]',     'polska'),
((SELECT id FROM plants WHERE slug='birch'),   3,  5,  '[4,5]',   'polska'),
((SELECT id FROM plants WHERE slug='oak'),     4,  6,  '[5]',     'polska'),
((SELECT id FROM plants WHERE slug='pine'),    4,  6,  '[5]',     'polska'),
((SELECT id FROM plants WHERE slug='plane'),   4,  6,  '[5]',     'polska'),
((SELECT id FROM plants WHERE slug='grass'),   5,  9,  '[6,7]',   'polska'),
((SELECT id FROM plants WHERE slug='ryegrass'),5,  9,  '[6,7]',   'polska'),
((SELECT id FROM plants WHERE slug='timothy'), 5,  9,  '[6,7]',   'polska'),
((SELECT id FROM plants WHERE slug='nettle'),  5,  9,  '[6,7]',   'polska'),
((SELECT id FROM plants WHERE slug='plantain'),5,  9,  '[6,7]',   'polska'),
((SELECT id FROM plants WHERE slug='mugwort'), 7,  10, '[8,9]',   'polska'),
((SELECT id FROM plants WHERE slug='ragweed'), 8,  10, '[8,9]',   'polska');
