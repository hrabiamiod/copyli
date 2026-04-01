import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CitySearch from "./CitySearch";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>

      <header
        className="sticky top-0 z-50"
        style={{
          height: 52,
          background: scrolled ? "rgba(247,242,235,0.88)" : "rgba(247,242,235,0.96)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderBottom: scrolled ? "1px solid rgba(24,24,15,0.10)" : "1px solid rgba(24,24,15,0.06)",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        <div
          className="max-w-7xl mx-auto px-4 h-full flex items-center gap-3"
        >
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
            <span style={{ fontSize: 18, lineHeight: 1 }}>🌸</span>
            <span>
              CoPyli
              <span style={{ color: "var(--ink-3)", fontWeight: 400, fontFamily: "var(--font-body)" }}>.pl</span>
            </span>
          </Link>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 280 }}>
            <CitySearch compact />
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center ml-auto" style={{ gap: 2 }}>
            {[{ to: "/", label: "Mapa" }, { to: "/kalendarz-pylenia", label: "Kalendarz" }].map(({ to, label }) => (
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
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <footer
        style={{
          background: "var(--surface)",
          borderTop: "1px solid rgba(24,24,15,0.07)",
          marginTop: 48,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-7">

            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--forest)", marginBottom: 10 }}>
                🌸 CoPyli.pl
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
                title: "Informacje",
                links: [["Kalendarz pylenia","kalendarz-pylenia"],["Kontakt","mailto:kontakt@copyli.pl"]] as [string,string][],
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
          </div>
        </div>
      </footer>
    </div>
  );
}
