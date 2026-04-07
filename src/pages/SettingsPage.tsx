import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import SEOHead from '../components/SEOHead';

interface NotificationSettings {
  email_alerts: boolean;
  alert_threshold: 'medium' | 'high' | 'very_high';
  alert_time: string;
}

interface MeData {
  name: string | null;
  email: string;
  has_password: boolean;
  google_connected: boolean;
  email_verified: boolean;
}

const THRESHOLD_LABELS: Record<string, string> = {
  medium: 'Średnie i wyższe',
  high: 'Wysokie i wyższe',
  very_high: 'Tylko bardzo wysokie',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--s-card)', overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid rgba(24,24,15,0.07)' }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{title}</h2>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
      <span style={{ fontSize: 13, color: 'var(--ink-2)', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, maxWidth: 320, textAlign: 'right' }}>{children}</div>
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--r-pill)',
      background: ok ? 'rgba(82,183,136,0.15)' : 'rgba(201,144,58,0.12)',
      color: ok ? '#2D6A4F' : '#C9903A',
    }}>{label}</span>
  );
}

export default function SettingsPage() {
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [me, setMe] = useState<MeData | null>(null);
  const [notif, setNotif] = useState<NotificationSettings>({ email_alerts: false, alert_threshold: 'high', alert_time: '07:00' });
  const [loading, setLoading] = useState(true);

  // Weryfikacja email
  const [resendingVerif, setResendingVerif] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // Zmiana nazwy
  const [name, setName] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  // Zmiana hasła
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Powiadomienia
  const [notifSaving, setNotifSaving] = useState(false);

  // Usunięcie konta
  const [deletePhase, setDeletePhase] = useState<'idle' | 'confirm'>('idle');
  const [deletePwd, setDeletePwd] = useState('');
  const [deleteErr, setDeleteErr] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/auth/me').then(r => r.json()) as Promise<MeData>,
      apiFetch('/api/user/notifications').then(r => r.json()) as Promise<NotificationSettings>,
    ]).then(([meData, notifData]) => {
      setMe(meData);
      setName(meData.name ?? '');
      setNotif(notifData);
    }).finally(() => setLoading(false));
  }, []);

  const resendVerification = async () => {
    setResendingVerif(true); setResendMsg('');
    try {
      const res = await apiFetch('/api/auth/resend-verification', { method: 'POST' });
      const data = await res.json() as { message?: string; error?: string };
      if (!res.ok) {
        setResendMsg(data.error ?? `Błąd ${res.status}`);
      } else {
        setResendMsg('Wysłano! Sprawdź skrzynkę.');
      }
    } catch (e: unknown) {
      setResendMsg((e as Error).message ?? 'Błąd wysyłki');
    } finally { setResendingVerif(false); }
  };

  const saveName = async () => {
    setNameSaving(true); setNameMsg('');
    try {
      await apiFetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      updateUser({ name: name || null });
      setNameMsg('Zapisano');
    } catch { setNameMsg('Błąd zapisu'); }
    finally { setNameSaving(false); }
  };

  const savePassword = async () => {
    setPwdSaving(true); setPwdMsg(null);
    try {
      await apiFetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: curPwd, new_password: newPwd }),
      });
      setPwdMsg({ text: 'Hasło zmienione. Zaloguj się ponownie.', ok: true });
      setCurPwd(''); setNewPwd('');
      setTimeout(() => { logout().then(() => navigate('/logowanie')); }, 2000);
    } catch (e: unknown) {
      setPwdMsg({ text: (e as Error).message, ok: false });
    } finally { setPwdSaving(false); }
  };

  const saveNotif = async (patch: Partial<NotificationSettings>) => {
    const updated = { ...notif, ...patch };
    setNotif(updated); setNotifSaving(true);
    try {
      await apiFetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    } finally { setNotifSaving(false); }
  };

  const deleteAccount = async () => {
    setDeleteLoading(true); setDeleteErr('');
    try {
      const body: Record<string, string> = { confirm: 'USUN_KONTO' };
      if (me?.has_password) body.password = deletePwd;
      const res = await apiFetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setDeleteErr(d.error ?? 'Błąd');
        return;
      }
      await logout();
      navigate('/');
    } finally { setDeleteLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Ładowanie ustawień…</p>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)',
    border: '1.5px solid rgba(24,24,15,0.12)', background: 'var(--cream)',
    fontSize: 13, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
  };

  const btnStyle = (variant: 'primary' | 'danger' | 'ghost'): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 'var(--r-pill)', fontSize: 13, fontWeight: 600,
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
    background: variant === 'primary' ? 'var(--forest)' : variant === 'danger' ? '#C1121F' : 'rgba(24,24,15,0.08)',
    color: variant === 'ghost' ? 'var(--ink-2)' : '#fff',
  });

  return (
    <>
      <SEOHead title="Ustawienia — CoPyli.PL" description="Zarządzaj kontem, hasłem i powiadomieniami." canonical="/ustawienia" />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px 72px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,30px)', color: 'var(--forest)', margin: '0 0 24px' }}>
          Ustawienia
        </h1>

        {/* ─── KONTO ─── */}
        <Section title="Konto">
          <Field label="Email">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--ink)' }}>{me?.email}</span>
              <StatusBadge ok={!!me?.email_verified} label={me?.email_verified ? 'Zweryfikowany' : 'Niezweryfikowany'} />
              {!me?.email_verified && (
                <button
                  onClick={resendVerification}
                  disabled={resendingVerif}
                  style={{ fontSize: 12, fontWeight: 600, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  {resendingVerif ? 'Wysyłanie…' : 'Wyślij ponownie'}
                </button>
              )}
            </div>
            {resendMsg && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--forest)', textAlign: 'right' }}>{resendMsg}</p>}
          </Field>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>Wyświetlana nazwa</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text" value={name} maxLength={100}
                onChange={e => { setName(e.target.value); setNameMsg(''); }}
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Twoje imię lub pseudonim"
              />
              <button onClick={saveName} disabled={nameSaving} style={btnStyle('primary')}>
                {nameSaving ? '…' : 'Zapisz'}
              </button>
            </div>
            {nameMsg && <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--forest)' }}>✓ {nameMsg}</p>}
          </div>

          <Field label="Konto Google">
            <StatusBadge ok={!!me?.google_connected} label={me?.google_connected ? 'Powiązane' : 'Niepowiązane'} />
          </Field>

          <Field label="Hasło">
            <StatusBadge ok={!!me?.has_password} label={me?.has_password ? 'Ustawione' : 'Brak (tylko Google)'} />
          </Field>
        </Section>

        {/* ─── ZMIANA HASŁA ─── */}
        {me?.has_password && (
          <Section title="Zmiana hasła">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 5 }}>Obecne hasło</label>
                <input type="password" value={curPwd} onChange={e => { setCurPwd(e.target.value); setPwdMsg(null); }} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 5 }}>Nowe hasło</label>
                <input type="password" value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdMsg(null); }} style={inputStyle} placeholder="Min. 8 znaków, litera i cyfra" />
              </div>
              {pwdMsg && (
                <p style={{ margin: 0, fontSize: 12, color: pwdMsg.ok ? 'var(--forest)' : '#C1121F', fontWeight: 600 }}>
                  {pwdMsg.ok ? '✓ ' : '✗ '}{pwdMsg.text}
                </p>
              )}
              <button onClick={savePassword} disabled={pwdSaving || !curPwd || !newPwd} style={{ ...btnStyle('primary'), alignSelf: 'flex-start' }}>
                {pwdSaving ? 'Zapisywanie…' : 'Zmień hasło'}
              </button>
            </div>
          </Section>
        )}

        {/* ─── POWIADOMIENIA ─── */}
        <Section title="Powiadomienia email">
          <Field label="Alerty pyłkowe">
            <button
              onClick={() => saveNotif({ email_alerts: !notif.email_alerts })}
              disabled={notifSaving}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: notif.email_alerts ? 'var(--forest)' : 'rgba(24,24,15,0.15)',
                transition: 'background 0.2s', position: 'relative',
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: notif.email_alerts ? 22 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', display: 'block',
              }} />
            </button>
          </Field>

          {notif.email_alerts && (
            <>
              <Field label="Próg alertu">
                <select
                  value={notif.alert_threshold}
                  onChange={e => saveNotif({ alert_threshold: e.target.value as NotificationSettings['alert_threshold'] })}
                  disabled={notifSaving}
                  style={{ ...inputStyle, cursor: 'pointer', width: 'auto' }}
                >
                  {Object.entries(THRESHOLD_LABELS).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </Field>
              <Field label="Godzina alertu">
                <input
                  type="time" value={notif.alert_time}
                  onChange={e => saveNotif({ alert_time: e.target.value })}
                  disabled={notifSaving}
                  style={{ ...inputStyle, width: 'auto' }}
                />
              </Field>
            </>
          )}
          {!me?.email_verified && (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--gold)' }}>
              ⚠ Zweryfikuj email, żeby otrzymywać alerty.
            </p>
          )}
        </Section>

        {/* ─── USUNIĘCIE KONTA ─── */}
        <Section title="Strefa niebezpieczna">
          {deletePhase === 'idle' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Usuń konto</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)' }}>Trwałe — dane zostaną zanonimizowane.</p>
              </div>
              <button onClick={() => setDeletePhase('confirm')} style={btnStyle('danger')}>Usuń konto</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#C1121F', fontWeight: 600 }}>
                ⚠ Tej operacji nie można cofnąć.
              </p>
              {me?.has_password && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 5 }}>Potwierdź hasłem</label>
                  <input type="password" value={deletePwd} onChange={e => setDeletePwd(e.target.value)} style={inputStyle} placeholder="Twoje hasło" />
                </div>
              )}
              {deleteErr && <p style={{ margin: 0, fontSize: 12, color: '#C1121F' }}>✗ {deleteErr}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={deleteAccount} disabled={deleteLoading || (!!me?.has_password && !deletePwd)} style={btnStyle('danger')}>
                  {deleteLoading ? 'Usuwanie…' : 'Tak, usuń moje konto'}
                </button>
                <button onClick={() => { setDeletePhase('idle'); setDeleteErr(''); setDeletePwd(''); }} style={btnStyle('ghost')}>
                  Anuluj
                </button>
              </div>
            </div>
          )}
        </Section>
      </div>
    </>
  );
}
