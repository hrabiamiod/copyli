import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [password.length >= 8, /[a-zA-Z]/.test(password), /\d/.test(password), password.length >= 12];
  const score = checks.filter(Boolean).length;
  const colors = ['', '#ef4444', '#f97316', '#22c55e', '#16a34a'];
  const labels = ['', 'Słabe', 'Słabe', 'Dobre', 'Silne'];
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? colors[score] : 'rgba(24,24,15,0.1)', transition: 'background 0.2s' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 40 }}>⚠️</p>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest)' }}>Nieprawidłowy link</h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 14 }}>Wygeneruj nowy link resetu hasła.</p>
          <Link to="/zapomnialem-hasla" style={{ color: 'var(--forest)', fontWeight: 600 }}>Resetuj hasło</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Hasło musi mieć co najmniej 8 znaków'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Copyli-Client': 'web' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? 'Błąd resetu hasła'); return; }
      setDone(true);
      setTimeout(() => navigate('/logowanie'), 3000);
    } catch {
      setError('Błąd sieci. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🔒</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--forest)', margin: 0 }}>
            Nowe hasło
          </h1>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 20, boxShadow: 'var(--s-card)', border: '1px solid rgba(24,24,15,0.07)', padding: 28 }}>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>✅</p>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest)', margin: '0 0 8px' }}>Hasło zmienione!</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>Za chwilę przekierujemy Cię do logowania.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '9px 12px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>
                  {error}
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="password" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 5, letterSpacing: '0.03em' }}>
                  NOWE HASŁO
                </label>
                <input
                  id="password" type="password" autoComplete="new-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="min. 8 znaków, litera + cyfra"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid rgba(24,24,15,0.15)', background: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(24,24,15,0.15)'; }}
                />
                <PasswordStrength password={password} />
              </div>
              <button
                type="submit" disabled={loading}
                style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'var(--forest)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Zapisuję…' : 'Ustaw nowe hasło'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
