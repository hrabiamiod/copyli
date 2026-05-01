import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import CitySearch from "./CitySearch";
import UserMenu from "./UserMenu";
import MobileDrawer from "./MobileDrawer";
import { useAuth } from "../context/AuthContext";
import { useSavedCity } from "../hooks/useSavedCity";

const NAV_LINKS = [
  { to: "/", label: "Mapa" },
  { to: "/pylek/rosliny", label: "Rośliny" },
  { to: "/kalendarz-pylenia", label: "Kalendarz" },
  { to: "/porady", label: "Porady" },
] as const;

const LogoIcon = () => (
  <svg width="15" height="14" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="var(--forest)" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" />
  </svg>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { savedCity } = useSavedCity();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>

      <header
        className="sticky top-0"
        style={{
          zIndex: 900,
          height: 52,
          background: scrolled ? "rgba(247,242,235,0.88)" : "rgba(247,242,235,0.96)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderBottom: scrolled ? "1px solid rgba(24,24,15,0.10)" : "1px solid rgba(24,24,15,0.06)",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1.5 shrink-0 select-none"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 17,
              color: "var(--forest)",
              textDecoration: "none",
              letterSpacing: "-0.02em",
            }}
          >
            <LogoIcon />
            <span>
              CoPyli
              <span style={{ color: "var(--ink-3)", fontWeight: 400, fontFamily: "var(--font-body)" }}>.pl</span>
            </span>
          </Link>

          {/* Search — ukryte na stronie głównej (tam jest w hero panelu) */}
          {!isHome && (
            <div style={{ flex: 1, maxWidth: 280 }}>
              <CitySearch compact />
            </div>
          )}

          {/* Nav */}
          <nav className="hidden md:flex items-center" style={{ gap: 2 }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="transition-all"
                style={{
                  padding: "5px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--ink-2)",
                  textDecoration: "none",
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
          </nav>

          {/* Saved city chip */}
          {savedCity && (
            <Link
              to={`/pylek/${savedCity.slug}`}
              className="hidden md:flex items-center"
              style={{
                fontSize: 12, fontWeight: 500, padding: "4px 10px",
                borderRadius: 20, background: "var(--forest-soft)",
                color: "var(--forest)", textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              📍 {savedCity.name}
            </Link>
          )}

          {/* User menu / login button */}
          <UserMenu />

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center"
            aria-label="Otwórz menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen(v => !v)}
            style={{
              background: "transparent", border: "none", padding: 8,
              cursor: "pointer", borderRadius: 10,
              color: "var(--ink-2)", flexShrink: 0,
            }}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
              <path d="M0 1H20M0 7H20M0 13H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {user?.badges.some(b => b.id === 'pioneer') && (
        <div style={{
          background: 'linear-gradient(90deg, #fffbeb, #fef3c7, #fffbeb)',
          borderBottom: '1px solid rgba(245,158,11,0.3)',
          padding: '6px 16px',
          textAlign: 'center', fontSize: 12, color: '#92400e',
          fontWeight: 500, letterSpacing: '0.01em',
        }}>
          ✦ Jesteś pierwszą zarejestrowaną osobą na CoPyli.pl — witamy i dziękujemy!
        </div>
      )}

      <main style={{ flex: 1 }}>{children}</main>

      <footer
        style={{
          background: "var(--surface)",
          borderTop: "1px solid rgba(24,24,15,0.07)",
          marginTop: 48,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-7">

            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--forest)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <LogoIcon /> CoPyli.pl
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.65, color: "var(--ink-2)" }}>
                Interaktywna mapa pyłkowa Polski dla alergików.
              </p>
              <p style={{ fontSize: 11, marginTop: 6, color: "var(--ink-3)" }}>
                Dane aktualizowane co 2 godziny.
              </p>
            </div>

            {[
              {
                title: "Województwa",
                links: [["Mazowieckie","mazowieckie"],["Małopolskie","malopolskie"],["Śląskie","slaskie"],["Wielkopolskie","wielkopolskie"]] as [string,string][],
                prefix: "/pylek/woj/",
              },
              {
                title: "Popularne miasta",
                links: [["Warszawa","warszawa"],["Kraków","krakow"],["Wrocław","wroclaw"],["Poznań","poznan"],["Gdańsk","gdansk"]] as [string,string][],
                prefix: "/pylek/",
              },
              {
                title: "Porady",
                links: [["Wszystkie porady","porady"],["Alergia na pyłki","porady/alergia-na-pylek"],["Sezon pyłkowy 2026","porady/sezon-pylkowy-2026"],["Reaktywność krzyżowa","porady/reaktywnosc-krzyzowa"],["Kalendarz pylenia","kalendarz-pylenia"],["Rośliny pylące","pylek/rosliny"]] as [string,string][],
                prefix: "/",
              },
              {
                title: "Informacje",
                links: [["Jak działa","jak-dziala"],["Regulamin","regulamin"],["Polityka prywatności","polityka-prywatnosci"],["Kontakt","mailto:kontakt@copyli.pl"]] as [string,string][],
                prefix: "/",
              },
            ].map(({ title, links, prefix }) => (
              <div key={title}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 10, letterSpacing: "0.03em" }}>
                  {title}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {links.map(([name, slug]) => {
                    const href = slug.startsWith("mailto:") ? slug : `${prefix}${slug}`;
                    const isExternal = slug.startsWith("mailto:");
                    return isExternal ? (
                      <a key={slug} href={href}
                        style={{ fontSize: 12, color: "var(--ink-2)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--forest-mid)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-2)")}
                      >{name}</a>
                    ) : (
                      <Link key={slug} to={href}
                        style={{ fontSize: 12, color: "var(--ink-2)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--forest-mid)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-2)")}
                      >{name}</Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(24,24,15,0.07)", textAlign: "center", fontSize: 11, color: "var(--ink-3)" }}>
            © {new Date().getFullYear()} CoPyli.pl — Dane z{" "}
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--ink-2)", textDecoration: "underline" }}>
              Open-Meteo
            </a>
            . Nie zastępuje porady lekarskiej.
            <span style={{ marginLeft: 12, opacity: 0.5 }}>
              build {__BUILD_HASH__} · {__BUILD_DATE__}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
