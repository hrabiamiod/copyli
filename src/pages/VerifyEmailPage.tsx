import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { updateUser } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Brak tokenu weryfikacyjnego'); return; }

    (async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Copyli-Client': 'web' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json() as { message?: string; error?: string };
        if (res.ok) {
          setStatus('success');
          setMessage(data.message ?? 'Email potwierdzony');
          updateUser({ email_verified: true });
        } else {
          setStatus('error');
          setMessage(data.error ?? 'Błąd weryfikacji');
        }
      } catch {
        setStatus('error');
        setMessage('Błąd sieci. Spróbuj ponownie.');
      }
    })();
  }, [token, updateUser]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        {status === 'loading' && (
          <>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--forest-soft)', borderTopColor: 'var(--forest)', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'var(--ink-2)', fontSize: 15 }}>Weryfikuję email…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <p style={{ fontSize: 52, margin: '0 0 12px' }}>✅</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--forest)', margin: '0 0 8px' }}>
              Email potwierdzony!
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 24 }}>{message}</p>
            <Link
              to="/"
              style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 10, background: 'var(--forest)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
            >
              Przejdź do mapy
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <p style={{ fontSize: 52, margin: '0 0 12px' }}>❌</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#991b1b', margin: '0 0 8px' }}>
              Błąd weryfikacji
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 24 }}>{message}</p>
            <Link
              to="/logowanie"
              style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 10, background: 'var(--forest)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
            >
              Zaloguj się
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
