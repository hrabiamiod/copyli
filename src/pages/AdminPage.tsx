import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import SEOHead from '../components/SEOHead';

interface AdminStats {
  users: { total: number; verified: number; last_7_days: number };
  allergens: number;
  locations: number;
  alerts_enabled: number;
  diary: { total: number; today: number };
  alerts_sent: { today: number; week: number };
  pollen: { last_updated: string; cities: number };
  recent_users: Array<{ id: string; email: string; email_verified: number; created_at: string; allergens_count: number; locations_count: number }>;
  top_allergens: Array<{ name_pl: string; icon: string; count: number }>;
  registrations_by_day: Array<{ date: string; count: number }>;
}

function StatCard({ label, value, sub, color = 'var(--forest)' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 12, padding: '18px 20px',
      boxShadow: 'var(--s-card)',
    }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{value}</p>
      {sub && <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--ink-3)' }}>{sub}</p>}
    </div>
  );
}

function MiniBar({ data }: { data: Array<{ date: string; count: number }> }) {
  if (!data.length) return <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>Brak danych</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
      {data.map(d => (
        <div key={d.date} title={`${d.date}: ${d.count}`} style={{
          flex: 1, background: 'var(--forest)', opacity: 0.7,
          height: `${Math.max(4, (d.count / max) * 100)}%`,
          borderRadius: '2px 2px 0 0', minWidth: 4,
          transition: 'opacity 0.1s',
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        />
      ))}
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/stats').then(async res => {
      if (res.status === 403) {
        const data = await res.json() as { error?: string };
        if (data.error === 'mfa_required') { navigate('/admin/mfa', { replace: true }); return; }
        if (data.error === 'setup_required') { navigate('/admin/mfa-setup', { replace: true }); return; }
        setError(data.error ?? 'Brak dostępu');
      } else if (res.ok) {
        setStats(await res.json() as AdminStats);
      } else {
        setError('Błąd serwera');
      }
      setLoading(false);
    }).catch(() => { setError('Błąd połączenia'); setLoading(false); });
  }, [navigate]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Ładowanie panelu…</p>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center', padding: '0 16px' }}>
      <p style={{ fontSize: 32 }}>🔒</p>
      <p style={{ color: '#C1121F', fontSize: 14 }}>{error}</p>
    </div>
  );

  if (!stats) return null;

  const s = stats;
  const pollenAge = s.pollen.last_updated
    ? new Date(s.pollen.last_updated).toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <>
      <SEOHead title="Panel Admina — CoPyli" description="" canonical="/admin" />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px 72px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,26px)', color: 'var(--forest)', margin: 0 }}>
            Panel Admina
          </h1>
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            Sesja MFA ważna 1h
          </span>
        </div>

        {/* Karty statystyk */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Użytkownicy" value={s.users.total} sub={`${s.users.verified} zweryfikowanych`} />
          <StatCard label="Nowi (7 dni)" value={s.users.last_7_days} color="var(--gold)" />
          <StatCard label="Z alergenami" value={s.allergens} sub="profili skonfigurowanych" />
          <StatCard label="Z lokalizacją" value={s.locations} />
          <StatCard label="Alerty aktywne" value={s.alerts_enabled} color="#2D6A4F" />
          <StatCard label="Alerty dziś" value={s.alerts_sent.today ?? 0} sub={`${s.alerts_sent.week ?? 0} w tym tygodniu`} />
          <StatCard label="Wpisy w dzienniku" value={s.diary.total ?? 0} sub={`${s.diary.today ?? 0} dziś`} />
          <StatCard label="Dane pyłkowe" value={s.pollen.cities ?? 0} sub={`miast · ${pollenAge}`} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Rejestracje 30 dni */}
          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '18px 20px', boxShadow: 'var(--s-card)' }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>Rejestracje — ostatnie 30 dni</p>
            <MiniBar data={s.registrations_by_day} />
          </div>

          {/* Top alergeny */}
          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '18px 20px', boxShadow: 'var(--s-card)' }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>Top alergeny użytkowników</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {s.top_allergens.map(a => (
                <div key={a.name_pl} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{a.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--ink)', flex: 1 }}>{a.name_pl}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--forest)' }}>{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ostatnie rejestracje */}
        <div style={{ background: 'var(--surface)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--s-card)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(24,24,15,0.07)' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Ostatnie rejestracje</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(24,24,15,0.03)' }}>
                  {['Email', 'Data', 'Zweryfikowany', 'Alergeny', 'Lokalizacje'].map(h => (
                    <th key={h} style={{ padding: '8px 16px', textAlign: 'left', color: 'var(--ink-3)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.recent_users.map((u, i) => (
                  <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid rgba(24,24,15,0.05)' : 'none' }}>
                    <td style={{ padding: '9px 16px', color: 'var(--ink)' }}>{u.email}</td>
                    <td style={{ padding: '9px 16px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                      {new Date(u.created_at).toLocaleDateString('pl-PL')}
                    </td>
                    <td style={{ padding: '9px 16px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                        background: u.email_verified ? 'rgba(82,183,136,0.15)' : 'rgba(201,144,58,0.15)',
                        color: u.email_verified ? '#2D6A4F' : '#7B4F1A',
                      }}>
                        {u.email_verified ? 'Tak' : 'Nie'}
                      </span>
                    </td>
                    <td style={{ padding: '9px 16px', color: 'var(--ink-2)', textAlign: 'center' }}>{u.allergens_count}</td>
                    <td style={{ padding: '9px 16px', color: 'var(--ink-2)', textAlign: 'center' }}>{u.locations_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
