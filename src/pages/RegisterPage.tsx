import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid rgba(24,24,15,0.15)', background: 'var(--surface)',
  fontSize: 14, color: 'var(--ink)', outline: 'none', transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--ink-2)', marginBottom: 5, letterSpacing: '0.03em',
};

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[a-zA-Z]/.test(password),
    /\d/.test(password),
    password.length >= 12,
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Słabe', 'Słabe', 'Dobre', 'Silne'];
  const colors = ['', '#ef4444', '#f97316', '#22c55e', '#16a34a'];

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score ? colors[score] : 'rgba(24,24,15,0.1)',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/profil?welcome=1', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Podaj email i hasło'); return; }
    if (password.length < 8) { setError('Hasło musi mieć co najmniej 8 znaków'); return; }
    setError('');
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim(), { marketing, analytics: false });
      navigate('/profil?welcome=1', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd rejestracji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🌿</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--forest)', margin: '0 0 6px' }}>
            Dołącz do CoPyli
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
            Spersonalizowane alerty pylkowe i dziennik objawów
          </p>
        </div>

        <div style={{
          background: 'var(--surface)', borderRadius: 20,
          boxShadow: 'var(--s-card)', border: '1px solid rgba(24,24,15,0.07)',
          padding: '28px 28px',
        }}>

          {/* Google OAuth */}
          <a
            href="/api/auth/google"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 10, textDecoration: 'none',
              border: '1.5px solid rgba(24,24,15,0.15)', background: '#fff',
              fontSize: 14, fontWeight: 600, color: 'var(--ink)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--forest)'; (e.currentTarget as HTMLElement).style.background = 'var(--forest-soft)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(24,24,15,0.15)'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Zarejestruj przez Google
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(24,24,15,0.1)' }} />
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>lub e-mail</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(24,24,15,0.1)' }} />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '9px 12px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label htmlFor="name" style={labelStyle}>IMIĘ (opcjonalne)</label>
              <input
                id="name" type="text" autoComplete="given-name"
                value={name} onChange={e => setName(e.target.value)}
                style={inputStyle} placeholder="Jak mamy Cię nazywać?"
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(24,24,15,0.15)'; }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label htmlFor="email" style={labelStyle}>E-MAIL</label>
              <input
                id="email" type="email" autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle} placeholder="twoj@email.pl"
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(24,24,15,0.15)'; }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label htmlFor="password" style={labelStyle}>HASŁO</label>
              <input
                id="password" type="password" autoComplete="new-password"
                value={password} onChange={e => setPassword(e.target.value)}
                style={inputStyle} placeholder="min. 8 znaków"
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(24,24,15,0.15)'; }}
              />
              <PasswordStrength password={password} />
            </div>

            {/* Zgody */}
            <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={e => setMarketing(e.target.checked)}
                  style={{ marginTop: 2, accentColor: 'var(--forest)', flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  Chcę otrzymywać sezonowe alerty pylkowe i newsletter (opcjonalne)
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px', borderRadius: 10,
                background: loading ? 'var(--forest-mid)' : 'var(--forest)',
                color: '#fff', fontSize: 15, fontWeight: 700,
                fontFamily: 'var(--font-display)', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s', letterSpacing: '-0.01em',
              }}
            >
              {loading ? 'Tworzę konto…' : 'Utwórz konto'}
            </button>

            <p style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
              Rejestrując się, akceptujesz{' '}
              <Link to="/regulamin" style={{ color: 'var(--forest-mid)' }}>Regulamin</Link>
              {' '}i{' '}
              <Link to="/polityka-prywatnosci" style={{ color: 'var(--forest-mid)' }}>Politykę prywatności</Link>
            </p>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-2)' }}>
          Masz już konto?{' '}
          <Link to="/logowanie" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
