import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') ?? '/';
  const oauthResult = params.get('oauth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(redirect, { replace: true });
  }, [isAuthenticated, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Podaj email i hasło'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🌿</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--forest)', margin: '0 0 6px' }}>
            Zaloguj się
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
            Twoje dane pyłkowe i dziennik objawów w jednym miejscu
          </p>
        </div>

        {/* OAuth result messages */}
        {oauthResult === 'denied' && (
          <div style={{ background: '#fef3c7', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
            Logowanie przez Google zostało anulowane.
          </div>
        )}
        {oauthResult === 'error' && (
          <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991b1b' }}>
            Wystąpił błąd podczas logowania przez Google. Spróbuj ponownie.
          </div>
        )}

        {/* Card */}
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
              fontSize: 14, fontWeight: 600, color: 'var(--ink)',
              transition: 'all 0.15s',
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
            Kontynuuj z Google
          </a>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(24,24,15,0.1)' }} />
            <span style={{ fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>lub e-mail</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(24,24,15,0.1)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '9px 12px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label htmlFor="email" style={labelStyle}>E-MAIL</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="twoj@email.pl"
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(24,24,15,0.15)'; }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>HASŁO</label>
                <Link to="/zapomnialem-hasla" style={{ fontSize: 12, color: 'var(--forest-mid)', textDecoration: 'none' }}>
                  Nie pamiętasz?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="••••••••"
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(24,24,15,0.15)'; }}
              />
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
              {loading ? 'Logowanie…' : 'Zaloguj się'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-2)' }}>
          Nie masz konta?{' '}
          <Link to="/rejestracja" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}
