import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Avatar({ user }: { user: { name: string | null; avatar: string | null; email: string } }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name ?? user.email}
        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
        referrerPolicy="no-referrer"
      />
    );
  }
  const initials = (user.name ?? user.email).charAt(0).toUpperCase();
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: 'var(--forest)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
    }}>
      {initials}
    </div>
  );
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) {
    return (
      <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
        <Link
          to="/logowanie"
          style={{
            padding: '5px 12px', borderRadius: 10, fontSize: 13,
            fontWeight: 500, color: 'var(--ink-2)', textDecoration: 'none',
            border: '1px solid transparent',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--forest-soft)';
            (e.currentTarget as HTMLElement).style.color = 'var(--forest)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = '';
            (e.currentTarget as HTMLElement).style.color = 'var(--ink-2)';
          }}
        >
          Zaloguj się
        </Link>
        <Link
          to="/rejestracja"
          style={{
            padding: '5px 14px', borderRadius: 10, fontSize: 13,
            fontWeight: 600, color: '#fff', textDecoration: 'none',
            background: 'var(--forest)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--forest-mid)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--forest)'; }}
        >
          Rejestracja
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative', marginLeft: 'auto' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '3px 10px 3px 4px', borderRadius: 999,
          border: '1px solid rgba(27,67,50,0.15)',
          background: open ? 'var(--forest-soft)' : 'transparent',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.background = 'var(--forest-soft)'; }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <Avatar user={user} />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name ?? user.email.split('@')[0]}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          minWidth: 200, background: 'var(--surface)',
          borderRadius: 14, boxShadow: 'var(--s-popup)',
          border: '1px solid rgba(24,24,15,0.08)',
          padding: '6px 0', zIndex: 1000,
          animation: 'menuIn 0.15s ease',
        }}>
          <style>{`@keyframes menuIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }`}</style>

          {/* Header */}
          <div style={{ padding: '8px 14px 10px', borderBottom: '1px solid rgba(24,24,15,0.07)', marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
              {user.name ?? '—'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--ink-3)' }}>{user.email}</p>
            {!user.email_verified && (
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#C9903A', display: 'flex', alignItems: 'center', gap: 4 }}>
                ⚠ Email niezweryfikowany
              </p>
            )}
          </div>

          {[
            { to: '/profil', icon: '🌿', label: 'Mój profil' },
            { to: '/dziennik', icon: '📔', label: 'Dziennik objawów' },
            { to: '/ustawienia', icon: '⚙️', label: 'Ustawienia' },
          ].map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 14px', fontSize: 13, color: 'var(--ink)',
                textDecoration: 'none', transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--forest-soft)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <span style={{ fontSize: 14 }}>{icon}</span>
              {label}
            </Link>
          ))}

          <div style={{ borderTop: '1px solid rgba(24,24,15,0.07)', marginTop: 4, paddingTop: 4 }}>
            <button
              onClick={async () => {
                setOpen(false);
                await logout();
                navigate('/');
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 14px', fontSize: 13, color: '#b91c1c',
                background: 'none', border: 'none', cursor: 'pointer',
                width: '100%', textAlign: 'left', transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(185,28,28,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <span style={{ fontSize: 14 }}>↩</span>
              Wyloguj się
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
