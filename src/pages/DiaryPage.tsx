import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import SEOHead from '../components/SEOHead';
import CitySearch from '../components/CitySearch';
import type { City } from '../types';

/* ─── typy ─── */
interface DiaryEntry {
  id: number;
  date: string;
  overall_score: number | null;
  symptoms: string[];
  medication: string | null;
  notes: string | null;
  city_id: number | null;
  city_name: string | null;
  city_slug: string | null;
}

const SYMPTOMS: { key: string; label: string; icon: string }[] = [
  { key: 'katar',     label: 'Katar',        icon: '🤧' },
  { key: 'lzawienie', label: 'Łzawienie',    icon: '👁️' },
  { key: 'kaszel',    label: 'Kaszel',        icon: '😮‍💨' },
  { key: 'kichanie',  label: 'Kichanie',      icon: '🤣' },
  { key: 'wysypka',   label: 'Wysypka',       icon: '🔴' },
  { key: 'dusznosc',  label: 'Duszność',      icon: '🫁' },
  { key: 'bol_glowy', label: 'Ból głowy',     icon: '🤕' },
  { key: 'swedzenie', label: 'Swędzenie',     icon: '✋' },
];

const SCORE_META: Record<number, { label: string; color: string; emoji: string }> = {
  1: { label: 'Bardzo źle', color: '#C1121F', emoji: '😰' },
  2: { label: 'Źle',         color: '#E76F51', emoji: '😔' },
  3: { label: 'Znośnie',     color: '#F4A261', emoji: '😐' },
  4: { label: 'Dobrze',      color: '#52B788', emoji: '🙂' },
  5: { label: 'Świetnie',    color: '#2D6A4F', emoji: '😊' },
};

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/* ─── komponent ─── */
export default function DiaryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'form' | 'history'>('form');

  // Stan formularza
  const [formDate, setFormDate] = useState(today());
  const [score, setScore] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<Set<string>>(new Set());
  const [medication, setMedication] = useState('');
  const [notes, setNotes] = useState('');
  const [city, setCity] = useState<City | null>(null);
  const [saved, setSaved] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/user/diary').then(r => r.json()) as { entries: DiaryEntry[] };
      setEntries(data.entries ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Gdy zmienia się data formularza — wczytaj istniejący wpis
  useEffect(() => {
    const existing = entries.find(e => e.date === formDate);
    if (existing) {
      setScore(existing.overall_score);
      setSymptoms(new Set(existing.symptoms));
      setMedication(existing.medication ?? '');
      setNotes(existing.notes ?? '');
    } else {
      setScore(null);
      setSymptoms(new Set());
      setMedication('');
      setNotes('');
      setCity(null);
    }
    setSaved(false);
  }, [formDate, entries]);

  const toggleSymptom = (key: string) => {
    setSymptoms(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch('/api/user/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formDate,
          overall_score: score,
          symptoms: [...symptoms],
          medication: medication || null,
          notes: notes || null,
          city_id: city?.id ?? null,
        }),
      });
      setSaved(true);
      await fetchEntries();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (date: string) => {
    if (!confirm(`Usunąć wpis z ${formatDate(date)}?`)) return;
    await apiFetch('/api/user/diary', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    setEntries(prev => prev.filter(e => e.date !== date));
    if (date === formDate) {
      setScore(null); setSymptoms(new Set()); setMedication(''); setNotes(''); setSaved(false);
    }
  };

  const existingForForm = entries.find(e => e.date === formDate);

  return (
    <>
      <SEOHead
        title="Dziennik objawów — CoPyli.PL"
        description="Śledź codzienne objawy alergiczne i koreluj je ze stężeniami pyłków."
        canonical="/dziennik"
      />

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 16px 72px' }}>
        {/* Nagłówek */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,30px)', color: 'var(--forest)', margin: '0 0 4px' }}>
            Dziennik objawów
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: 0 }}>
            Witaj, {user?.name ?? user?.email?.split('@')[0]} · {entries.length} wpisów
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--cream-dark)', borderRadius: 14, padding: 4 }}>
          {([
            { key: 'form',    label: '📝 Dzisiaj' },
            { key: 'history', label: '📅 Historia' },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setView(key)} style={{
              flex: 1, padding: '8px 12px', borderRadius: 11, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: view === key ? 'var(--surface)' : 'transparent',
              color: view === key ? 'var(--forest)' : 'var(--ink-2)',
              boxShadow: view === key ? 'var(--s-card)' : 'none',
            }}>{label}</button>
          ))}
        </div>

        {/* ─── TAB: FORMULARZ ─── */}
        {view === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Wybór daty */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>Data wpisu:</label>
              <input
                type="date"
                value={formDate}
                max={today()}
                onChange={e => setFormDate(e.target.value)}
                style={{
                  padding: '7px 12px', borderRadius: 'var(--r-sm)', fontSize: 13,
                  border: '1.5px solid rgba(24,24,15,0.12)', background: 'var(--cream)',
                  color: 'var(--ink)', outline: 'none', cursor: 'pointer',
                }}
              />
              {existingForForm && (
                <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>✎ edytujesz istniejący wpis</span>
              )}
            </div>

            {/* Ocena ogólna */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--s-card)', padding: '16px 20px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>Jak się dzisiaj czujesz?</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(n => {
                  const m = SCORE_META[n];
                  const selected = score === n;
                  return (
                    <button key={n} onClick={() => { setScore(selected ? null : n); setSaved(false); }} style={{
                      flex: 1, padding: '10px 4px', borderRadius: 'var(--r-sm)', border: 'none',
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                      background: selected ? m.color + '20' : 'var(--cream-dark)',
                      outline: selected ? `2px solid ${m.color}` : 'none',
                      outlineOffset: selected ? 1 : 0,
                    }}>
                      <div style={{ fontSize: 22 }}>{m.emoji}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: selected ? m.color : 'var(--ink-3)', marginTop: 3 }}>
                        {n}
                      </div>
                    </button>
                  );
                })}
              </div>
              {score && (
                <p style={{ margin: '10px 0 0', fontSize: 12, color: SCORE_META[score].color, fontWeight: 600, textAlign: 'center' }}>
                  {SCORE_META[score].emoji} {SCORE_META[score].label}
                </p>
              )}
            </div>

            {/* Objawy */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--s-card)', padding: '16px 20px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
                Objawy {symptoms.size > 0 && <span style={{ color: 'var(--forest)' }}>({symptoms.size})</span>}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                {SYMPTOMS.map(({ key, label, icon }) => {
                  const active = symptoms.has(key);
                  return (
                    <button key={key} onClick={() => toggleSymptom(key)} style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '9px 11px', borderRadius: 'var(--r-sm)', border: 'none',
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                      background: active ? 'rgba(231,111,81,0.12)' : 'var(--cream-dark)',
                      outline: active ? '1.5px solid rgba(231,111,81,0.5)' : 'none',
                    }}>
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: active ? '#E76F51' : 'var(--ink-2)' }}>{label}</span>
                      {active && <span style={{ marginLeft: 'auto', color: '#E76F51', fontSize: 13 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Leki i notatka */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--s-card)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>
                  💊 Przyjęte leki
                </label>
                <input
                  type="text"
                  value={medication}
                  onChange={e => { setMedication(e.target.value); setSaved(false); }}
                  placeholder="np. Zyrtec 10mg, Flixonase…"
                  maxLength={200}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)',
                    border: '1.5px solid rgba(24,24,15,0.12)', background: 'var(--cream)',
                    fontSize: 13, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>
                  📝 Notatka
                </label>
                <textarea
                  value={notes}
                  onChange={e => { setNotes(e.target.value); setSaved(false); }}
                  placeholder="Dodatkowe obserwacje…"
                  maxLength={1000}
                  rows={3}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)',
                    border: '1.5px solid rgba(24,24,15,0.12)', background: 'var(--cream)',
                    fontSize: 13, color: 'var(--ink)', outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>
                  📍 Miasto (opcjonalnie)
                </label>
                <CitySearch onSelect={c => { setCity(c); setSaved(false); }} compact />
                {city && <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--forest)' }}>✓ {city.name}</p>}
              </div>
            </div>

            {/* Przycisk zapisu */}
            <button
              onClick={handleSave}
              disabled={saving || (!score && symptoms.size === 0)}
              style={{
                padding: '13px 24px', borderRadius: 'var(--r-pill)', fontSize: 14, fontWeight: 700,
                border: 'none', cursor: (saving || (!score && symptoms.size === 0)) ? 'not-allowed' : 'pointer',
                background: saved ? '#52B788' : 'var(--forest)',
                color: '#fff', transition: 'all 0.2s', letterSpacing: '-0.01em',
                opacity: (!score && symptoms.size === 0) ? 0.5 : 1,
              }}
            >
              {saving ? 'Zapisywanie…' : saved ? '✓ Zapisano!' : existingForForm ? 'Zaktualizuj wpis' : 'Zapisz wpis'}
            </button>
          </div>
        )}

        {/* ─── TAB: HISTORIA ─── */}
        {view === 'history' && (
          <div>
            {loading && (
              <p style={{ color: 'var(--ink-3)', textAlign: 'center', padding: '40px 0' }}>Ładowanie…</p>
            )}
            {!loading && entries.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontSize: 36, margin: '0 0 12px' }}>📔</p>
                <p style={{ color: 'var(--ink-2)', fontSize: 14 }}>Brak wpisów. Zacznij od dzisiejszego dnia!</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entries.map(entry => {
                const m = entry.overall_score ? SCORE_META[entry.overall_score] : null;
                return (
                  <div key={entry.date} style={{
                    background: 'var(--surface)', borderRadius: 'var(--r-md)',
                    boxShadow: 'var(--s-card)', padding: '14px 16px',
                    borderLeft: m ? `4px solid ${m.color}` : '4px solid var(--cream-dark)',
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                  }}>
                    {/* Score emoji */}
                    <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>
                      {m?.emoji ?? '📔'}
                    </div>

                    {/* Treść */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                          {formatDate(entry.date)}
                        </span>
                        {m && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>
                            {m.label}
                          </span>
                        )}
                        {entry.city_name && (
                          <a href={`/pylek/${entry.city_slug}`} style={{ fontSize: 11, color: 'var(--ink-3)', textDecoration: 'none' }}>
                            📍 {entry.city_name}
                          </a>
                        )}
                      </div>

                      {entry.symptoms.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 5 }}>
                          {entry.symptoms.map(s => {
                            const sym = SYMPTOMS.find(x => x.key === s);
                            return sym ? (
                              <span key={s} style={{
                                fontSize: 11, background: 'rgba(231,111,81,0.1)',
                                color: '#C1440B', borderRadius: 'var(--r-pill)',
                                padding: '2px 8px', fontWeight: 600,
                              }}>
                                {sym.icon} {sym.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      {entry.medication && (
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--ink-2)' }}>
                          💊 {entry.medication}
                        </p>
                      )}
                      {entry.notes && (
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                          {entry.notes}
                        </p>
                      )}
                    </div>

                    {/* Akcje */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => { setFormDate(entry.date); setView('form'); }}
                        title="Edytuj"
                        style={{
                          background: 'var(--cream-dark)', border: 'none', borderRadius: 8,
                          padding: '5px 9px', fontSize: 13, cursor: 'pointer', color: 'var(--ink-2)',
                        }}
                      >✎</button>
                      <button
                        onClick={() => handleDelete(entry.date)}
                        title="Usuń"
                        style={{
                          background: 'rgba(193,18,31,0.07)', border: 'none', borderRadius: 8,
                          padding: '5px 9px', fontSize: 13, cursor: 'pointer', color: '#C1121F',
                        }}
                      >×</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
