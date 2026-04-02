import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import type { City, CityPageData, PollenLevel } from "../types";
import SEOHead from "../components/SEOHead";
import PollenBadge from "../components/PollenBadge";
import CitySearch from "../components/CitySearch";
import { LEVEL_LABELS, LEVEL_COLORS } from "../utils/pollen";

const LEVEL_ORDER: PollenLevel[] = ["none", "low", "medium", "high", "very_high"];

function levelScore(level: PollenLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

export default function ComparePage() {
  const { miasto1, miasto2 } = useParams<{ miasto1: string; miasto2: string }>();
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [data1, setData1] = useState<CityPageData | null>(null);
  const [data2, setData2] = useState<CityPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!miasto1 || !miasto2) return;
    setLoading(true); setError(false);
    Promise.all([
      fetch("/data/cities.json").then(r => r.json()),
      fetch(`/data/cities/${miasto1}.json`).then(r => r.ok ? r.json() : null),
      fetch(`/data/cities/${miasto2}.json`).then(r => r.ok ? r.json() : null),
    ]).then(([c, d1, d2]) => {
      if (!d1 || !d2) { setError(true); setLoading(false); return; }
      setCities(c); setData1(d1); setData2(d2); setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  }, [miasto1, miasto2]);

  const city1 = cities.find(c => c.slug === miasto1);
  const city2 = cities.find(c => c.slug === miasto2);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Ładowanie danych porównania…</p>
    </div>
  );

  if (error || !city1 || !city2 || !data1 || !data2) return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "64px 16px", textAlign: "center" }}>
      <p style={{ fontSize: 36, marginBottom: 16 }}>🌿</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
        Nie znaleziono danych
      </h1>
      <Link to="/" style={{ color: "var(--forest)", fontWeight: 600, textDecoration: "underline" }}>
        Wróć do mapy →
      </Link>
    </div>
  );

  // Zbieramy wszystkie unikalne rośliny z obu miast
  const allPlantSlugs = Array.from(new Set([
    ...data1.pollen.map(p => p.plant_slug),
    ...data2.pollen.map(p => p.plant_slug),
  ]));

  const pollenRows = allPlantSlugs.map(slug => {
    const p1 = data1.pollen.find(p => p.plant_slug === slug);
    const p2 = data2.pollen.find(p => p.plant_slug === slug);
    const level1 = (p1?.level ?? "none") as PollenLevel;
    const level2 = (p2?.level ?? "none") as PollenLevel;
    const name = p1?.plant_name ?? p2?.plant_name ?? slug;
    const icon = p1?.icon ?? p2?.icon ?? "🌿";
    return { slug, name, icon, level1, level2 };
  }).sort((a, b) => {
    const maxA = Math.max(levelScore(a.level1), levelScore(a.level2));
    const maxB = Math.max(levelScore(b.level1), levelScore(b.level2));
    return maxB - maxA;
  });

  // Werdykt: które miasto ma niższe ogólne stężenia
  const score1 = data1.pollen.reduce((s, p) => s + levelScore(p.level as PollenLevel), 0);
  const score2 = data2.pollen.reduce((s, p) => s + levelScore(p.level as PollenLevel), 0);
  const winner = score1 < score2 ? city1 : score2 < score1 ? city2 : null;

  // Prognoza — zbieramy daty
  const forecastDates = Array.from(new Set([
    ...data1.forecast.map(f => f.forecast_date),
    ...data2.forecast.map(f => f.forecast_date),
  ])).sort().slice(0, 5);

  const getForecastLevel = (data: CityPageData, date: string): PollenLevel => {
    const rows = data.forecast.filter(f => f.forecast_date === date);
    if (!rows.length) return "none";
    return rows.reduce((max, row) => {
      return levelScore(row.level as PollenLevel) > levelScore(max) ? row.level as PollenLevel : max;
    }, "none" as PollenLevel);
  };

  const title = `Pyłki: ${city1.name} vs ${city2.name} — porównanie stężeń | CoPyli.pl`;
  const description = `Porównanie stężeń pyłków w ${city1.name} i ${city2.name}. Sprawdź gdzie jest lepiej dla alergika — prognoza 5-dniowa, aktualny Indeks Spacerowy.`;

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonical={`https://copyli.pl/porownaj/${miasto1}/${miasto2}`}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 56px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Breadcrumb */}
        <nav className="breadcrumb anim-fade-in">
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>
            {city1.name} vs {city2.name}
          </span>
        </nav>

        {/* Header */}
        <div className="anim-fade-up">
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(22px, 4vw, 30px)",
            fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)", margin: "0 0 6px",
          }}>
            <span style={{ color: "var(--forest)" }}>{city1.name}</span>
            {" "}vs{" "}
            <span style={{ color: "var(--forest)" }}>{city2.name}</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
            Porównanie stężeń pyłków · dane aktualizowane co 2 godziny
          </p>
        </div>

        {/* Werdykt */}
        <div
          className="anim-fade-up delay-1"
          style={{
            background: winner ? "rgba(27,67,50,0.07)" : "rgba(24,24,15,0.04)",
            border: `1px solid ${winner ? "rgba(27,67,50,0.15)" : "rgba(24,24,15,0.08)"}`,
            borderRadius: "var(--r-md)",
            padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 14,
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: winner ? "rgba(27,67,50,0.12)" : "rgba(24,24,15,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>
            {winner ? "✅" : "⚖️"}
          </div>
          <div>
            {winner ? (
              <>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: "var(--forest)" }}>
                  Dziś lepiej jechać do {winner.name}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--ink-2)" }}>
                  Ogólne stężenie pyłków jest tam niższe niż w {winner.slug === city1.slug ? city2.name : city1.name}
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                  Podobne warunki w obu miastach
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--ink-2)" }}>
                  Stężenie pyłków jest zbliżone w {city1.name} i {city2.name}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Tabela porównania pyłków */}
        <div className="anim-fade-up delay-1">
          <div style={{
            background: "var(--surface)", border: "1px solid var(--cream-dark)",
            borderRadius: "var(--r-lg)", overflow: "hidden",
          }}>
            {/* Nagłówek */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--cream-dark)" }}>
              <div style={{ flex: 2, padding: "12px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-3)" }}>
                Roślina
              </div>
              <div style={{ flex: 1, padding: "12px 8px", textAlign: "center" }}>
                <Link to={`/pylek/${miasto1}`} style={{ fontSize: 12, fontWeight: 700, color: "var(--forest)", textDecoration: "none" }}>
                  {city1.name}
                </Link>
              </div>
              <div style={{ flex: 1, padding: "12px 8px", textAlign: "center" }}>
                <Link to={`/pylek/${miasto2}`} style={{ fontSize: 12, fontWeight: 700, color: "var(--forest)", textDecoration: "none" }}>
                  {city2.name}
                </Link>
              </div>
            </div>

            {pollenRows.map((row, i) => (
              <div
                key={row.slug}
                style={{
                  display: "flex", alignItems: "center",
                  borderBottom: i < pollenRows.length - 1 ? "1px solid var(--cream-dark)" : "none",
                }}
              >
                <div style={{ flex: 2, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{row.icon}</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", margin: 0, lineHeight: 1.3 }}>
                      {row.name}
                    </p>
                    <Link
                      to={`/pylek/roslina/${row.slug}`}
                      style={{ fontSize: 10, color: "var(--ink-3)", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--forest)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-3)")}
                    >
                      szczegóły →
                    </Link>
                  </div>
                </div>
                <LevelCell level={row.level1} otherLevel={row.level2} />
                <LevelCell level={row.level2} otherLevel={row.level1} />
              </div>
            ))}
          </div>
        </div>

        {/* Prognoza 5-dniowa */}
        {forecastDates.length > 0 && (
          <div className="anim-fade-up delay-2">
            <p className="label" style={{ marginBottom: 12 }}>Prognoza 5-dniowa</p>
            <div style={{
              background: "var(--surface)", border: "1px solid var(--cream-dark)",
              borderRadius: "var(--r-lg)", overflow: "hidden",
            }}>
              <div style={{ display: "flex", borderBottom: "1px solid var(--cream-dark)" }}>
                <div style={{ width: 100, flexShrink: 0, padding: "10px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-3)" }}>
                  Dzień
                </div>
                {forecastDates.map(d => (
                  <div key={d} style={{ flex: 1, padding: "10px 4px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--ink-2)" }}>
                    {new Date(d).toLocaleDateString("pl-PL", { weekday: "short", day: "numeric" })}
                  </div>
                ))}
              </div>
              {[{ city: city1, data: data1 }, { city: city2, data: data2 }].map(({ city, data }) => (
                <div key={city.slug} style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--cream-dark)" }}>
                  <div style={{ width: 100, flexShrink: 0, padding: "10px 16px" }}>
                    <Link to={`/pylek/${city.slug}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--forest)", textDecoration: "none" }}>
                      {city.name}
                    </Link>
                  </div>
                  {forecastDates.map(d => {
                    const level = getForecastLevel(data, d);
                    return (
                      <div key={d} style={{ flex: 1, padding: "8px 4px", display: "flex", justifyContent: "center" }}>
                        <div style={{
                          width: "80%", height: 20, borderRadius: 4,
                          background: LEVEL_COLORS[level],
                          border: "1px solid rgba(0,0,0,0.06)",
                        }} title={LEVEL_LABELS[level]} />
                      </div>
                    );
                  })}
                </div>
              ))}
              {/* Legenda */}
              <div style={{ padding: "8px 16px", display: "flex", flexWrap: "wrap", gap: 12 }}>
                {(["none", "low", "medium", "high", "very_high"] as const).map(level => (
                  <div key={level} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 12, height: 8, borderRadius: 2, background: LEVEL_COLORS[level], border: "1px solid rgba(0,0,0,0.08)" }} />
                    <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{LEVEL_LABELS[level]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Walk index porównanie */}
        {(data1.weather?.score != null || data2.weather?.score != null) && (
          <div className="anim-fade-up delay-2">
            <p className="label" style={{ marginBottom: 12 }}>Indeks Spacerowy</p>
            <div className="grid grid-cols-2" style={{ gap: 8 }}>
              {[{ city: city1, data: data1 }, { city: city2, data: data2 }].map(({ city, data }) => (
                <div key={city.slug} className="card" style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--forest)", margin: "0 0 6px" }}>
                    {city.name}
                  </p>
                  {data.weather?.score != null ? (
                    <>
                      <p style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--ink)", margin: "0 0 4px" }}>
                        {data.weather.score}<span style={{ fontSize: 14, color: "var(--ink-3)" }}>/100</span>
                      </p>
                      <p style={{ fontSize: 12, color: "var(--ink-2)", margin: 0, lineHeight: 1.4 }}>
                        {data.weather.recommendation}
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: 12, color: "var(--ink-3)", margin: 0 }}>Brak danych</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zmiana miasta */}
        <div className="anim-fade-up delay-3" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p className="label">Zmień porównanie</p>
          <div className="grid grid-cols-2" style={{ gap: 8 }}>
            <div>
              <p style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 6 }}>Zamiast {city1.name}:</p>
              <CitySearch compact onSelect={c => navigate(`/porownaj/${c.slug}/${miasto2}`)} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 6 }}>Zamiast {city2.name}:</p>
              <CitySearch compact onSelect={c => navigate(`/porownaj/${miasto1}/${c.slug}`)} />
            </div>
          </div>
        </div>

        {/* Linki do stron miast */}
        <div className="anim-fade-up delay-3" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[city1, city2].map(city => (
            <Link
              key={city.slug}
              to={`/pylek/${city.slug}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 18px", borderRadius: 999,
                background: "var(--surface)", border: "1px solid var(--cream-dark)",
                fontSize: 13, fontWeight: 500, color: "var(--ink)", textDecoration: "none",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(27,67,50,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--cream-dark)")}
            >
              Szczegóły: {city.name} →
            </Link>
          ))}
        </div>

      </div>
    </>
  );
}

function LevelCell({ level, otherLevel }: { level: PollenLevel; otherLevel: PollenLevel }) {
  const isBetter = levelScore(level) < levelScore(otherLevel);
  const isWorse = levelScore(level) > levelScore(otherLevel);
  return (
    <div style={{
      flex: 1, padding: "10px 8px",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: isBetter ? "rgba(27,67,50,0.04)" : isWorse ? "rgba(239,83,80,0.04)" : "transparent",
    }}>
      <PollenBadge level={level} size="sm" />
    </div>
  );
}
