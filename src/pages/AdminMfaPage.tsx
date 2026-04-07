import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function AdminMfaPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (code.length !== 6) return;
    setLoading(true); setError('');
    const res = await apiFetch('/api/admin/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json() as { message?: string; error?: string };
    if (!res.ok) {
      setError(data.error === 'setup_required' ? 'MFA nie jest skonfigurowane' : (data.error ?? 'Nieprawidłowy kod'));
      if (data.error === 'setup_required') navigate('/admin/mfa-setup', { replace: true });
      setLoading(false); return;
    }
    navigate('/admin', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--cream)', padding: 16,
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: '40px 36px',
        boxShadow: 'var(--s-popup)', maxWidth: 360, width: '100%', textAlign: 'center',
      }}>
        <p style={{ fontSize: 32, marginBottom: 4 }}>🔑</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--forest)', margin: '0 0 8px' }}>
          Weryfikacja MFA
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 24 }}>
          Wpisz 6-cyfrowy kod z aplikacji uwierzytelniającej
        </p>

        <input
          type="text" inputMode="numeric" maxLength={6} value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="000000" autoFocus
          style={{
            width: '100%', padding: '12px', borderRadius: 10, textAlign: 'center',
            border: `1.5px solid ${error ? '#C1121F' : 'rgba(24,24,15,0.15)'}`,
            background: 'var(--cream)', fontSize: 28, letterSpacing: '0.3em',
            fontFamily: 'monospace', color: 'var(--ink)', outline: 'none',
            boxSizing: 'border-box', marginBottom: 12, transition: 'border-color 0.15s',
          }}
        />

        {error && <p style={{ fontSize: 12, color: '#C1121F', marginBottom: 8 }}>{error}</p>}

        <button
          onClick={submit} disabled={loading || code.length !== 6}
          style={{
            width: '100%', padding: '11px', borderRadius: 10, border: 'none',
            background: 'var(--forest)', color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
            opacity: loading || code.length !== 6 ? 0.6 : 1,
          }}
        >
          {loading ? 'Weryfikacja…' : 'Zaloguj do panelu'}
        </button>
      </div>
    </div>
  );
}
