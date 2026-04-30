import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Plant } from "../types";
import SEOHead from "../components/SEOHead";
import { CATEGORY_LABELS } from "../utils/pollen";

const CAT_ORDER = ["tree", "grass", "weed"] as const;

export default function PlantsIndexPage() {
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    fetch("/data/plants.json").then(r => r.json()).then(setPlants);
  }, []);

  const byCategory = CAT_ORDER.map(cat => ({
    cat,
    items: plants.filter(p => p.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <>
      <SEOHead
        title="Rośliny pylące w Polsce — alergeny, sezony i opisy | CoPyli.pl"
        description="Lista roślin pylących w Polsce: drzewa (brzoza, olcha, leszczyna), trawy i chwasty (ambrozja, bylica). Kiedy pylą, jak się chronić, reaktywność krzyżowa."
        canonical="https://copyli.pl/pylek/rosliny"
      />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px 56px" }}>

        <nav style={{ fontSize: 12, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <Link to="/" style={{ color: "var(--ink-3)", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--forest)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-3)")}
          >Strona główna</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Rośliny pylące</span>
        </nav>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--forest)", letterSpacing: "-0.5px", marginBottom: 8 }}>
          Rośliny pylące w Polsce
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-2)", marginBottom: 32, maxWidth: 580 }}>
          Przegląd alergenów pyłkowych — sezony pylenia, reaktywność krzyżowa i wskazówki dla alergików.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {byCategory.map(({ cat, items }) => (
            <section key={cat}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-2)", marginBottom: 12 }}>
                {CATEGORY_LABELS[cat]}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                {items.map(plant => (
                  <Link
                    key={plant.slug}
                    to={`/pylek/roslina/${plant.slug}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px",
                      background: "var(--surface)",
                      border: "1px solid var(--cream-dark)",
                      borderRadius: "var(--r-md)",
                      textDecoration: "none",
                      transition: "box-shadow 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "var(--s-card)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(27,67,50,0.25)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--cream-dark)";
                    }}
                  >
                    <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{plant.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", margin: 0, lineHeight: 1.3 }}>{plant.name_pl}</p>
                      <p style={{ fontSize: 11, color: "var(--ink-3)", margin: 0, fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{plant.name_latin}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section style={{ marginTop: 48, borderTop: "1px solid var(--cream-dark)", paddingTop: 32 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--forest)", marginBottom: 10 }}>
            Kiedy pylą rośliny w Polsce?
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75, marginBottom: 10 }}>
            Sezon pyłkowy w Polsce trwa od <strong style={{ color: "var(--ink)" }}>lutego</strong> (leszczyna, olcha) do <strong style={{ color: "var(--ink)" }}>września–października</strong> (ambrozja).
            Kliknij w dowolną roślinę, aby zobaczyć szczegółowy kalendarz pylenia i wskazówki.
          </p>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75 }}>
            Sprawdź <Link to="/kalendarz-pylenia" style={{ color: "var(--forest)", fontWeight: 600, textDecoration: "underline" }}>Kalendarz pylenia</Link>{" "}
            lub aktualne stężenia w <Link to="/" style={{ color: "var(--forest)", fontWeight: 600, textDecoration: "underline" }}>interaktywnej mapie</Link>.
          </p>
        </section>

      </div>
    </>
  );
}
