import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DRAWER_LINKS = [
  { to: "/", label: "Mapa" },
  { to: "/pylek/rosliny", label: "Rośliny" },
  { to: "/kalendarz-pylenia", label: "Kalendarz" },
  { to: "/porady", label: "Porady" },
  { to: "/porady/reaktywnosc-krzyzowa", label: "Reaktywność krzyżowa" },
  { to: "/porady/sezon-pylkowy-2026", label: "Sezon pyłkowy 2026" },
] as const;

export default function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const location = useLocation();

  useEffect(() => { onClose(); }, [location.pathname]);

  useEffect(() => {
    if (open) firstLinkRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!open) return null;

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1090,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
        }}
      />
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu nawigacyjne"
        style={{
          position: "fixed", top: 52, left: 0, right: 0,
          zIndex: 1100,
          background: "rgba(247,242,235,0.98)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderBottom: "1px solid rgba(24,24,15,0.10)",
          padding: "12px 16px 20px",
          animation: "drawerIn 0.18s ease",
        }}
      >
        <style>{`@keyframes drawerIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }`}</style>

        {DRAWER_LINKS.map(({ to, label }, i) => (
          <Link
            key={to}
            ref={i === 0 ? firstLinkRef : undefined}
            to={to}
            style={{
              display: "block", padding: "11px 12px",
              borderRadius: 10, fontSize: 15, fontWeight: 500,
              color: "var(--ink-2)", textDecoration: "none",
              transition: "background 0.12s, color 0.12s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--forest-soft)";
              (e.currentTarget as HTMLElement).style.color = "var(--forest)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "";
              (e.currentTarget as HTMLElement).style.color = "var(--ink-2)";
            }}
          >
            {label}
          </Link>
        ))}

        <div style={{ borderTop: "1px solid rgba(24,24,15,0.07)", marginTop: 8, paddingTop: 8 }}>
          {user ? (
            <Link
              to="/profil"
              style={{ display:"block", padding:"11px 12px", borderRadius:10, fontSize:14, fontWeight:500, color:"var(--ink-3)", textDecoration:"none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--forest)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink-3)"; }}
            >
              Mój profil
            </Link>
          ) : (
            <Link
              to="/logowanie"
              style={{ display:"block", padding:"11px 12px", borderRadius:10, fontSize:14, fontWeight:600, color:"var(--forest)", textDecoration:"none" }}
            >
              Zaloguj się →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
