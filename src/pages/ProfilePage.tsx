import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import CitySearch from '../components/CitySearch';
import SEOHead from '../components/SEOHead';
import type { City } from '../types';

/* ─── typy ─── */
interface Plant {
  id: number;
  slug: string;
  name_pl: string;
  name_latin: string;
  category: 'tree' | 'grass' | 'weed';
  icon: string;
  color: string;
}

interface UserAllergen extends Plant {
  plant_id: number;
  severity: 'mild' | 'medium' | 'severe';
}

interface UserLocation {
  id: number;
  city_id: number;
  label: 'dom' | 'praca' | 'inne';
  is_primary: number;
  name: string;
  slug: string;
  voivodeship_name: string;
}

const SEVERITY_LABELS: Record<string, string> = {
  mild: 'Słaba',
  medium: 'Umiarkowana',
  severe: 'Silna',
};
const SEVERITY_COLORS: Record<string, string> = {
  mild: '#52B788',
  medium: '#F4A261',
  severe: '#C1121F',
};
const CATEGORY_LABELS: Record<string, string> = {
  tree: 'Drzewa',
  grass: 'Trawy',
  weed: 'Chwasty',
};
const LABEL_ICONS: Record<string, string> = { dom: '🏠', praca: '💼', inne: '📍' };

/* ─── komponent ─── */
export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [allergens, setAllergens] = useState<UserAllergen[]>([]);
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'allergens' | 'locations'>('allergens');

  const fetchProfile = useCallback(async () => {
    try {
      const [plantsData, meData] = await Promise.all([
        fetch('/data/plants.json').then(r => r.json()) as Promise<Plant[]>,
        apiFetch('/api/auth/me').then(r => r.json()) as Promise<{ allergens: UserAllergen[]; locations: UserLocation[] }>,
      ]);
      setPlants(plantsData);
      setAllergens(meData.allergens ?? []);
      setLocations(meData.locations ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* ─── alergeny ─── */
  const allergenSet = new Set(allergens.map(a => a.plant_id));

  const toggleAllergen = async (plant: Plant) => {
    if (saving) return;
    setSaving(true);
    try {
      if (allergenSet.has(plant.id)) {
        await apiFetch('/api/user/allergens', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plant_id: plant.id }),
        });
        setAllergens(prev => prev.filter(a => a.plant_id !== plant.id));
      } else {
        await apiFetch('/api/user/allergens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plant_id: plant.id, severity: 'medium' }),
        });
        setAllergens(prev => [...prev, { ...plant, plant_id: plant.id, severity: 'medium' }]);
      }
    } finally {
      setSaving(false);
    }
  };

  const changeSeverity = async (plantId: number, severity: 'mild' | 'medium' | 'severe') => {
    setSaving(true);
    try {
      await apiFetch('/api/user/allergens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plant_id: plantId, severity }),
      });
      setAllergens(prev => prev.map(a => a.plant_id === plantId ? { ...a, severity } : a));
    } finally {
      setSaving(false);
    }
  };

  /* ─── lokalizacje ─── */
  const addLocation = async (city: City, label: 'dom' | 'praca' | 'inne') => {
    setSaving(true);
    try {
      await apiFetch('/api/user/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city_id: city.id, label }),
      });
      await fetchProfile(); // odśwież żeby pokazać voivodeship_name
    } finally {
      setSaving(false);
    }
  };

  const removeLocation = async (cityId: number) => {
    setSaving(true);
    try {
      await apiFetch('/api/user/locations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city_id: cityId }),
      });
      setLocations(prev => prev.filter(l => l.city_id !== cityId));
    } finally {
      setSaving(false);
    }
  };

  const setPrimary = async (cityId: number) => {
    setSaving(true);
    try {
      await apiFetch('/api/user/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city_id: cityId }),
      });
      setLocations(prev => prev.map(l => ({ ...l, is_primary: l.city_id === cityId ? 1 : 0 })));
    } finally {
      setSaving(false);
    }
  };

  /* ─── grupy roślin ─── */
  const plantsByCategory = (['tree', 'grass', 'weed'] as const).map(cat => ({
    cat,
    label: CATEGORY_LABELS[cat],
    items: plants.filter(p => p.category === cat),
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>🌿</div>
          <p style={{ color: 'var(--ink-3)', marginTop: 12, fontFamily: 'var(--font-body)' }}>Ładowanie profilu…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Mój profil alergika — CoPyli.PL"
        description="Zarządzaj swoimi alergenami i zapisanymi lokalizacjami."
        canonical="/profil"
      />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 16px 60px' }}>
        {/* Nagłówek */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,30px)', color: 'var(--forest)', margin: 0 }}>
            Panel alergika
          </h1>
          <p style={{ color: 'var(--ink-2)', marginTop: 6, fontSize: 14 }}>
            Witaj, {user?.name ?? user?.email?.split('@')[0]}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--cream-dark)', borderRadius: 14, padding: 4 }}>
          {([
            { key: 'allergens', label: '🌱 Moje alergeny' },
            { key: 'locations', label: '📍 Lokalizacje' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 11, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: activeTab === key ? 'var(--surface)' : 'transparent',
                color: activeTab === key ? 'var(--forest)' : 'var(--ink-2)',
                boxShadow: activeTab === key ? 'var(--s-card)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ─── TAB: ALERGENY ─── */}
        {activeTab === 'allergens' && (
          <div>
            {allergens.length > 0 && (
              <div style={{
                background: 'var(--surface)', borderRadius: 'var(--r-md)',
                boxShadow: 'var(--s-card)', padding: '16px 20px', marginBottom: 24,
              }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Twoje alergeny ({allergens.length})
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {allergens.map(a => (
                    <div key={a.plant_id} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'var(--cream-dark)', borderRadius: 'var(--r-pill)',
                      padding: '5px 10px 5px 8px', border: `1.5px solid ${SEVERITY_COLORS[a.severity]}30`,
                    }}>
                      <span style={{ fontSize: 15 }}>{a.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{a.name_pl}</span>
                      <select
                        value={a.severity}
                        onChange={e => changeSeverity(a.plant_id, e.target.value as 'mild' | 'medium' | 'severe')}
                        disabled={saving}
                        style={{
                          fontSize: 11, color: SEVERITY_COLORS[a.severity], fontWeight: 700,
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          outline: 'none', padding: 0,
                        }}
                      >
                        {Object.entries(SEVERITY_LABELS).map(([val, lbl]) => (
                          <option key={val} value={val}>{lbl}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => toggleAllergen(a)}
                        disabled={saving}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--ink-3)', fontSize: 14, padding: '0 0 0 2px', lineHeight: 1,
                        }}
                        title="Usuń"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plantsByCategory.map(({ cat, label, items }) => (
              <div key={cat} style={{ marginBottom: 20 }}>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {label}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 8 }}>
                  {items.map(plant => {
                    const selected = allergenSet.has(plant.id);
                    return (
                      <button
                        key={plant.id}
                        onClick={() => toggleAllergen(plant)}
                        disabled={saving}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 12px', borderRadius: 'var(--r-sm)',
                          border: `1.5px solid ${selected ? plant.color + '60' : 'rgba(24,24,15,0.08)'}`,
                          background: selected ? plant.color + '14' : 'var(--surface)',
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                          boxShadow: selected ? `0 0 0 2px ${plant.color}30` : 'none',
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{plant.icon}</span>
                        <span>
                          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                            {plant.name_pl}
                          </span>
                          <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                            {plant.name_latin}
                          </span>
                        </span>
                        {selected && (
                          <span style={{ marginLeft: 'auto', color: plant.color, fontSize: 16 }}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {allergens.length === 0 && (
              <p style={{ color: 'var(--ink-3)', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                Kliknij roślinę żeby zaznaczyć ją jako swój alergen
              </p>
            )}
          </div>
        )}

        {/* ─── TAB: LOKALIZACJE ─── */}
        {activeTab === 'locations' && (
          <div>
            {locations.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                {locations.map(loc => (
                  <div key={loc.city_id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', marginBottom: 8,
                    background: 'var(--surface)', borderRadius: 'var(--r-sm)',
                    boxShadow: 'var(--s-card)',
                    border: loc.is_primary ? '1.5px solid var(--forest)' : '1.5px solid transparent',
                  }}>
                    <span style={{ fontSize: 20 }}>{LABEL_ICONS[loc.label]}</span>
                    <div style={{ flex: 1 }}>
                      <a
                        href={`/pylek/${loc.slug}`}
                        style={{ fontWeight: 600, fontSize: 14, color: 'var(--forest)', textDecoration: 'none' }}
                        onClick={() => navigate(`/pylek/${loc.slug}`)}
                      >
                        {loc.name}
                      </a>
                      <span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 6 }}>
                        {loc.voivodeship_name} · {loc.label}
                      </span>
                      {!!loc.is_primary && (
                        <span style={{
                          marginLeft: 8, fontSize: 10, fontWeight: 700,
                          color: 'var(--forest)', background: 'var(--forest-soft)',
                          padding: '1px 6px', borderRadius: 'var(--r-pill)',
                        }}>główna</span>
                      )}
                    </div>
                    {!loc.is_primary && (
                      <button
                        onClick={() => setPrimary(loc.city_id)}
                        disabled={saving}
                        title="Ustaw jako główną"
                        style={{
                          fontSize: 11, color: 'var(--ink-3)', background: 'none', border: '1px solid rgba(24,24,15,0.12)',
                          borderRadius: 'var(--r-pill)', padding: '3px 8px', cursor: 'pointer',
                        }}
                      >
                        ustaw główną
                      </button>
                    )}
                    <button
                      onClick={() => removeLocation(loc.city_id)}
                      disabled={saving}
                      title="Usuń"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--ink-3)', fontSize: 18, padding: '0 2px', lineHeight: 1,
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {locations.length < 5 && (
              <AddLocationForm onAdd={addLocation} disabled={saving} />
            )}

            {locations.length === 0 && (
              <p style={{ color: 'var(--ink-3)', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                Dodaj swoje miasto żeby szybko sprawdzać pyłki
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── formularz dodawania lokalizacji ─── */
function AddLocationForm({
  onAdd,
  disabled,
}: {
  onAdd: (city: City, label: 'dom' | 'praca' | 'inne') => void;
  disabled: boolean;
}) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [label, setLabel] = useState<'dom' | 'praca' | 'inne'>('dom');

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--r-md)',
      boxShadow: 'var(--s-card)', padding: '16px 20px',
    }}>
      <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
        Dodaj lokalizację
      </p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <CitySearch
            onSelect={city => setSelectedCity(city)}
            compact
          />
        </div>
        <select
          value={label}
          onChange={e => setLabel(e.target.value as 'dom' | 'praca' | 'inne')}
          style={{
            padding: '8px 12px', borderRadius: 'var(--r-sm)', fontSize: 13,
            border: '1.5px solid rgba(24,24,15,0.12)', background: 'var(--cream)',
            color: 'var(--ink)', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="dom">🏠 Dom</option>
          <option value="praca">💼 Praca</option>
          <option value="inne">📍 Inne</option>
        </select>
        <button
          onClick={() => {
            if (selectedCity) {
              onAdd(selectedCity, label);
              setSelectedCity(null);
            }
          }}
          disabled={!selectedCity || disabled}
          style={{
            padding: '8px 18px', borderRadius: 'var(--r-pill)', fontSize: 13,
            fontWeight: 600, background: selectedCity ? 'var(--forest)' : 'rgba(24,24,15,0.08)',
            color: selectedCity ? '#fff' : 'var(--ink-3)', border: 'none',
            cursor: selectedCity ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
          }}
        >
          Dodaj
        </button>
      </div>
      {selectedCity && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--forest)' }}>
          ✓ Wybrano: <strong>{selectedCity.name}</strong>
        </p>
      )}
    </div>
  );
}
