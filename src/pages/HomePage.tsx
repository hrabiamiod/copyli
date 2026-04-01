import { useState, useEffect, lazy, Suspense } from "react";
import type { City, MapData, MetaData, Plant } from "../types";
import SEOHead from "../components/SEOHead";
import CitySearch from "../components/CitySearch";
import { getStructuredDataFAQ } from "../utils/seo";

const PollenMap = lazy(() => import("../components/PollenMap"));

const VOIVODESHIPS = [
  ["Dolnośląskie","dolnoslaskie"], ["Kujawsko-Pomorskie","kujawsko-pomorskie"],
  ["Lubelskie","lubelskie"],       ["Lubuskie","lubuskie"],
  ["Łódzkie","lodzkie"],           ["Małopolskie","malopolskie"],
  ["Mazowieckie","mazowieckie"],   ["Opolskie","opolskie"],
  ["Podkarpackie","podkarpackie"], ["Podlaskie","podlaskie"],
  ["Pomorskie","pomorskie"],       ["Śląskie","slaskie"],
  ["Świętokrzyskie","swietokrzyskie"], ["Warmińsko-Mazurskie","warminsko-mazurskie"],
  ["Wielkopolskie","wielkopolskie"], ["Zachodniopomorskie","zachodniopomorskie"],
];

const FAQ = [
  {
    q: "Co to jest stężenie pyłków?",
    a: "Stężenie pyłków to liczba ziaren pyłku roślin w jednym metrze sześciennym powietrza (z/m³). Im wyższe, tym większe ryzyko reakcji alergicznej.",
  },
  {
    q: "Kiedy pyli brzoza w Polsce?",
    a: "Brzoza pyli w Polsce głównie w kwietniu i maju. Jest jednym z najsilniejszych alergenów — uczula ok. 20% alergików. Stężenia są najwyższe w słoneczne, wietrzne dni.",
  },
  {
    q: "Co to jest Indeks Spacerowy?",
    a: "Indeks Spacerowy to unikalny wskaźnik CoPyli.pl łączący dane pyłkowe z pogodą (deszcz zmywa pyłki, wiatr je unosi). Podpowiada kiedy najlepiej wyjść z domu.",
  },
  {
    q: "Skąd pochodzą dane pyłkowe?",
    a: "Dane pyłkowe pochodzą z Open-Meteo Air Quality API — bezpłatnej usługi z danymi dla całej Europy. Aktualizujemy je co 2 godziny dla ponad 1000 polskich miast.",
  },
];

export default function HomePage() {
  const [cities, setCities] = useState<City[]>([]);
  const [mapData, setMapData] = useState<MapData[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [cityLevels, setCityLevels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/cities.json").then(r => r.json()),
      fetch("/data/map-data.json").then(r => r.json()),
      fetch("/data/plants.json").then(r => r.json()),
      fetch("/data/meta.json").then(r => r.json()),
      fetch("/data/city-levels.json").then(r => r.json()).catch(() => ({})),
    ]).then(([c, m, p, mt, cl]) => {
      setCities(c); setMapData(m); setPlants(p); setMeta(mt); setCityLevels(cl);
      setLoading(false);
    });
  }, []);

  const updatedAt = meta?.updated_at
    ? new Date(meta.updated_at).toLocaleString("pl-PL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  const currentMonth = new Date().getMonth() + 1;
  const inSeason = plants.filter(p => p.month_start <= currentMonth && currentMonth <= p.month_end);

  return (
    <>
      <SEOHead
        title="CoPyli.pl — Interaktywna mapa pyłkowa Polski dla alergików"
        description="Aktualne stężenie pyłków w Polsce. Interaktywna mapa pylenia dla alergików — sprawdź co pyli w Twoim mieście, prognoza 5-dniowa i Indeks Spacerowy. Dane aktualizowane co 2 godziny."
        canonical="https://copyli.pl"
        structuredData={getStructuredDataFAQ()}
      />

      {/* ══════════════════════════════════════════════════════
          HERO — Map fills full viewport height
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          height: "75svh",
          minHeight: 420,
          overflow: "hidden",
        }}
      >
        {/* Map layer */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Suspense
            fallback={
              <div style={{
                width: "100%", height: "100%",
                background: "linear-gradient(135deg, #c8d8c8 0%, #e8ead8 50%, #d8c8b8 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 12,
              }}>
                <div style={{
                  width: 48, height: 48, border: "3px solid var(--forest)", borderTopColor: "transparent",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                }} />
                <p style={{ fontSize: 13, color: "var(--forest-mid)", fontWeight: 500 }}>Ładowanie mapy…</p>
              </div>
            }
          >
            {!loading && <PollenMap cities={cities} mapData={mapData} cityLevels={cityLevels} />}
          </Suspense>
        </div>

        {/* ── Glass hero panel — top-right ── */}
        <div
          className="anim-slide-r"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 800,
            width: "min(340px, calc(100vw - 28px))",
            borderRadius: 24,
            padding: "22px 24px 20px",
            background: "rgba(247,242,235,0.82)",
            backdropFilter: "blur(28px) saturate(1.8)",
            WebkitBackdropFilter: "blur(28px) saturate(1.8)",
            border: "1px solid rgba(255,255,255,0.65)",
            boxShadow: "0 16px 56px rgba(24,24,15,0.15), 0 4px 16px rgba(24,24,15,0.09)",
          }}
        >
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
            <span style={{ fontSize: 13 }}>🌿</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--forest-mid)" }}>
              Mapa pylenia · Polska
            </span>
            {updatedAt && (
              <span style={{
                marginLeft: "auto", fontSize: 10, color: "var(--ink-3)",
                background: "rgba(24,24,15,0.06)", borderRadius: 6, padding: "2px 7px",
                whiteSpace: "nowrap",
              }}>
                ↻ {updatedAt}
              </span>
            )}
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(26px, 4vw, 32px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--ink)",
              margin: "0 0 16px",
            }}
          >
            Co pyli<br />
            <span style={{ color: "var(--forest)" }}>dziś</span> w Polsce?
          </h1>

          {/* Search */}
          <CitySearch />

          {/* Hint */}
          <p style={{ marginTop: 10, fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5 }}>
            Wpisz miasto · kliknij na mapę · lub użyj 📍
          </p>
        </div>

        {/* ── Season strip — bottom glass bar ── */}
        {inSeason.length > 0 && (
          <div
            className="anim-fade-up delay-3"
            style={{
              position: "absolute",
              bottom: 14,
              left: 170,   /* right of the legend (~150px wide) */
              right: 60,   /* left of geolocate button */
              zIndex: 800,
              borderRadius: 16,
              padding: "10px 16px",
              background: "rgba(247,242,235,0.80)",
              backdropFilter: "blur(20px) saturate(1.6)",
              WebkitBackdropFilter: "blur(20px) saturate(1.6)",
              border: "1px solid rgba(255,255,255,0.55)",
              boxShadow: "0 8px 28px rgba(24,24,15,0.10)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--ink-3)", whiteSpace: "nowrap" }}>
              W sezonie
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "nowrap", overflow: "hidden" }}>
              {inSeason.slice(0, 8).map((p, i) => (
                <span
                  key={p.slug}
                  className="anim-fade-up"
                  style={{
                    animationDelay: `${0.3 + i * 0.05}s`,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    background: "rgba(255,255,255,0.70)",
                    border: "1px solid rgba(201,144,58,0.20)",
                    color: "var(--ink)",
                  }}
                >
                  {p.icon} {p.name_pl}
                </span>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* Pasek aktualizacji + scroll hint */}
      <div style={{
        background: "var(--surface)",
        borderBottom: "1px solid rgba(24,24,15,0.06)",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <p style={{ fontSize: 11, color: "var(--ink-3)", margin: 0 }}>
          {updatedAt
            ? <><span style={{ fontWeight: 600, color: "var(--ink-2)" }}>Ostatnia aktualizacja:</span> {updatedAt}</>
            : "Ładowanie danych…"
          }
        </p>
        <p style={{ fontSize: 11, color: "var(--ink-3)", margin: 0, whiteSpace: "nowrap" }}>
          Dane z Open-Meteo · co 2h
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          CONTENT BELOW MAP
      ══════════════════════════════════════════════════════ */}

      {/* Season overview strip (below map on mobile — desktop version is on map) */}
      {inSeason.length > 0 && (
        <section
          className="md:hidden"
          style={{
            padding: "16px",
            background: "var(--surface)",
            borderBottom: "1px solid rgba(24,24,15,0.06)",
          }}
        >
          <p className="label" style={{ marginBottom: 10 }}>Aktualnie w sezonie pylenia</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {inSeason.map((p, i) => (
              <span
                key={p.slug}
                className="anim-fade-up"
                style={{
                  animationDelay: `${i * 0.04}s`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 11px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500,
                  background: "rgba(201,144,58,0.10)",
                  border: "1px solid rgba(201,144,58,0.22)",
                  color: "var(--ink)",
                }}
              >
                {p.icon} {p.name_pl}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section style={{ padding: "56px 16px 40px" }}>
        <div className="max-w-3xl mx-auto">
          <div style={{ marginBottom: 28 }}>
            <p className="label" style={{ marginBottom: 6 }}>Wiedza o pyleniu</p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Najczęstsze pytania alergików
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQ.map(({ q, a }, i) => (
              <details
                key={q}
                className={`faq-item anim-fade-up`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <summary>
                  {q}
                  <span className="faq-chevron">▾</span>
                </summary>
                <div className="faq-body">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Voivodeships */}
      <section
        style={{
          padding: "0 16px 64px",
          background: "var(--cream)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div style={{ marginBottom: 20 }}>
            <p className="label" style={{ marginBottom: 6 }}>Przeglądaj regionalnie</p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(18px,2.5vw,22px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Mapa pyłkowa województw
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {VOIVODESHIPS.map(([name, slug], i) => (
              <a
                key={slug}
                href={`/pylek/woj/${slug}`}
                className={`anim-fade-up card card-lift`}
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--ink)",
                  animationDelay: `${i * 0.03}s`,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--forest)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink)")}
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
