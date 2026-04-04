import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Podaj adres email'); return; }
    setError('');
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Copyli-Client': 'web' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
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
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🔑</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--forest)', margin: '0 0 6px' }}>
            Reset hasła
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
            Wyślemy link do ustawienia nowego hasła
          </p>
        </div>

        <div style={{
          background: 'var(--surface)', borderRadius: 20,
          boxShadow: 'var(--s-card)', border: '1px solid rgba(24,24,15,0.07)',
          padding: '28px',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>📬</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--forest)', margin: '0 0 10px' }}>
                Sprawdź skrzynkę
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                Jeśli konto z tym adresem istnieje, wyślemy instrukcje resetu hasła w ciągu kilku minut.
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8 }}>
                Sprawdź też folder spam.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '9px 12px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>
                  {error}
                </div>
              )}
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="email" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 5, letterSpacing: '0.03em' }}>
                  E-MAIL
                </label>
                <input
                  id="email" type="email" autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="twoj@email.pl"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1.5px solid rgba(24,24,15,0.15)', background: 'white',
                    fontSize: 14, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(24,24,15,0.15)'; }}
                />
              </div>
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '11px', borderRadius: 10,
                  background: 'var(--forest)', color: '#fff', fontSize: 15,
                  fontWeight: 700, fontFamily: 'var(--font-display)', border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Wysyłam…' : 'Wyślij link resetu'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-2)' }}>
          <Link to="/logowanie" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>
            ← Wróć do logowania
          </Link>
        </p>
      </div>
    </div>
  );
}
