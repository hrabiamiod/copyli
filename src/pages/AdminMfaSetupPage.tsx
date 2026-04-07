import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import QRCode from 'qrcode';

export default function AdminMfaSetupPage() {
  const navigate = useNavigate();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/api/admin/mfa/setup').then(async r => {
      const data = await r.json() as { configured?: boolean; secret?: string; uri?: string; error?: string };
      if (!r.ok) { setError(data.error ?? 'Brak dostępu'); setLoading(false); return; }
      if (data.configured) { navigate('/admin', { replace: true }); return; }
      setSecret(data.secret ?? '');
      const url = await QRCode.toDataURL(data.uri ?? '', { width: 200, margin: 2 });
      setQrDataUrl(url);
      setLoading(false);
    }).catch(() => { setError('Błąd połączenia'); setLoading(false); });
  }, [navigate]);

  const submit = async () => {
    if (code.length !== 6) { setError('Kod musi mieć 6 cyfr'); return; }
    setSubmitting(true); setError('');
    const res = await apiFetch('/api/admin/mfa/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json() as { message?: string; error?: string };
    if (!res.ok) { setError(data.error ?? 'Błąd'); setSubmitting(false); return; }
    navigate('/admin', { replace: true });
  };

  const s: React.CSSProperties = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--cream)', padding: 16,
  };

  if (loading) return <div style={s}><p style={{ color: 'var(--ink-3)' }}>Ładowanie…</p></div>;
  if (error && !secret) return <div style={s}><p style={{ color: '#C1121F' }}>{error}</p></div>;

  return (
    <div style={s}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: '40px 36px',
        boxShadow: 'var(--s-popup)', maxWidth: 420, width: '100%', textAlign: 'center',
      }}>
        <p style={{ fontSize: 32, marginBottom: 4 }}>🔐</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--forest)', margin: '0 0 8px' }}>
          Konfiguracja MFA
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 24 }}>
          Zeskanuj QR kod w Google Authenticator lub Authy
        </p>

        {qrDataUrl && (
          <img src={qrDataUrl} alt="QR kod TOTP" style={{ borderRadius: 8, marginBottom: 16 }} />
        )}

        <details style={{ marginBottom: 20, textAlign: 'left' }}>
          <summary style={{ fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer', marginBottom: 6 }}>
            Wpisz ręcznie (nie masz aparatu?)
          </summary>
          <code style={{
            fontSize: 11, background: 'rgba(24,24,15,0.06)', padding: '6px 10px',
            borderRadius: 6, display: 'block', wordBreak: 'break-all', letterSpacing: '0.05em',
          }}>
            {secret}
          </code>
        </details>

        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 10 }}>
          Wpisz kod z aplikacji aby potwierdzić:
        </p>

        <input
          type="text" inputMode="numeric" maxLength={6} value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="000000"
          style={{
            width: '100%', padding: '12px', borderRadius: 10, textAlign: 'center',
            border: '1.5px solid rgba(24,24,15,0.15)', background: 'var(--cream)',
            fontSize: 24, letterSpacing: '0.3em', fontFamily: 'monospace',
            color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', marginBottom: 12,
          }}
        />

        {error && <p style={{ fontSize: 12, color: '#C1121F', marginBottom: 8 }}>{error}</p>}

        <button
          onClick={submit} disabled={submitting || code.length !== 6}
          style={{
            width: '100%', padding: '11px', borderRadius: 10, border: 'none',
            background: 'var(--forest)', color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: submitting || code.length !== 6 ? 'not-allowed' : 'pointer',
            opacity: submitting || code.length !== 6 ? 0.6 : 1,
          }}
        >
          {submitting ? 'Weryfikacja…' : 'Potwierdź i aktywuj MFA'}
        </button>
      </div>
    </div>
  );
}
