import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Plant } from "../types";
import SEOHead from "../components/SEOHead";
import { CATEGORY_LABELS } from "../utils/pollen";
import { getStructuredDataCalendar } from "../utils/seo";
import StickyMobileCTA from "../components/StickyMobileCTA";

const MONTHS = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];

const CAT_COLORS: Record<string, { base: string; peak: string }> = {
  tree:  { base: "rgba(82,183,136,0.33)",  peak: "var(--forest)" },
  grass: { base: "rgba(244,162,97,0.33)",  peak: "var(--gold)" },
  weed:  { base: "rgba(231,111,81,0.33)",  peak: "var(--p-very-high)" },
};

export default function CalendarPage() {
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    fetch("/data/plants.json").then(r => r.json()).then(setPlants);
  }, []);

  const currentMonth = new Date().getMonth();
  const categories = ["tree", "grass", "weed"] as const;

  return (
    <>
      <SEOHead
        title={`Kalendarz pylenia roślin w Polsce ${new Date().getFullYear()} — kiedy co pyli? | CoPyli.pl`}
        description="Interaktywny kalendarz pylenia roślin w Polsce. Sprawdź kiedy pylą drzewa (brzoza, olcha), trawy i chwasty (ambrozja, bylica). Daty sezonów pyłkowych dla alergików."
        canonical="https://copyli.pl/kalendarz-pylenia"
        structuredData={getStructuredDataCalendar(new Date().getFullYear())}
      />

      <div className="pb-28 md:pb-12" style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 0" }}>

        <nav style={{ fontSize: 12, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <Link to="/" style={{ color: "var(--ink-3)", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--forest)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-3)")}
          >Strona główna</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Kalendarz pylenia</span>
        </nav>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--forest)", letterSpacing: "-0.5px", marginBottom: 8 }}>
          Kalendarz pylenia roślin w Polsce
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-2)", marginBottom: 28, maxWidth: 600 }}>
          Przegląd sezonów pyłkowych dla najważniejszych roślin uczulających w Polsce.
          Intensywny kolor = szczyt pylenia.
        </p>

        <div style={{
          background: "var(--surface)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--s-card)",
          border: "1px solid var(--cream-dark)",
          overflowX: "auto",
        }}>
          {/* Nagłówek miesięcy */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--cream-dark)" }}>
            <div style={{ width: 140, flexShrink: 0, padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Roślina
            </div>
            {MONTHS.map((m, i) => (
              <div key={m} style={{
                flex: 1, padding: "10px 4px", textAlign: "center", fontSize: 11, fontWeight: 600, minWidth: 36,
                color: i === currentMonth ? "var(--forest)" : "var(--ink-3)",
                background: i === currentMonth ? "var(--gold-soft)" : "transparent",
              }}>
                {m}
                {i === currentMonth && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", margin: "3px auto 0" }} />}
              </div>
            ))}
          </div>

          {categories.map(cat => {
            const catPlants = plants.filter(p => p.category === cat);
            if (catPlants.length === 0) return null;
            const { base, peak } = CAT_COLORS[cat];
            return (
              <div key={cat}>
                <div style={{ padding: "8px 16px", background: "var(--surface-tint)", borderBottom: "1px solid var(--cream-dark)", borderTop: "1px solid var(--cream-dark)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-2)" }}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                </div>

                {catPlants.map((plant, idx) => {
                  const peakMonths: number[] = plant.peak_months ? JSON.parse(plant.peak_months) : [];
                  return (
                    <div key={plant.slug}
                      style={{ display: "flex", borderBottom: idx < catPlants.length - 1 ? "1px solid var(--cream-dark)" : "none", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-tint)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ width: 140, flexShrink: 0, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>{plant.icon}</span>
                        <div>
                          <Link to={`/pylek/roslina/${plant.slug}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, margin: 0, textDecoration: "none", display: "block" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "var(--forest)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "var(--ink)")}
                          >{plant.name_pl}</Link>
                          <p style={{ fontSize: 10, color: "var(--ink-3)", fontStyle: "italic", lineHeight: 1.3, margin: 0 }}>{plant.name_latin}</p>
                        </div>
                      </div>

                      {MONTHS.map((_, monthIdx) => {
                        const month = monthIdx + 1;
                        const inRange = plant.month_start <= plant.month_end
                          ? month >= plant.month_start && month <= plant.month_end
                          : month >= plant.month_start || month <= plant.month_end;
                        const isPeak = peakMonths.includes(month);
                        const isCurrent = monthIdx === currentMonth;
                        return (
                          <div key={monthIdx} style={{
                            flex: 1, minWidth: 36, padding: "6px 2px", display: "flex", alignItems: "center", justifyContent: "center",
                            background: isCurrent ? "var(--gold-soft)" : "transparent",
                          }}>
                            {inRange && (
                              <div style={{ width: "100%", height: 22, borderRadius: 5, background: isPeak ? peak : base }}
                                title={`${plant.name_pl} — ${isPeak ? "szczyt pylenia" : "pylenie"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "var(--ink-2)" }}>
          {[
            { label: "Drzewa — szczyt",  color: CAT_COLORS.tree.peak },
            { label: "Trawy — szczyt",   color: CAT_COLORS.grass.peak },
            { label: "Chwasty — szczyt", color: CAT_COLORS.weed.peak },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 12, borderRadius: 4, background: color, flexShrink: 0 }} />
              <span>{label}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 12, borderRadius: 4, background: "var(--gold-soft)", border: "1px solid var(--gold)", flexShrink: 0 }} />
            <span>Bieżący miesiąc</span>
          </div>
        </div>

        <section style={{ marginTop: 40, borderTop: "1px solid var(--cream-dark)", paddingTop: 32 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--forest)", marginBottom: 12 }}>
            Kiedy najgorzej dla alergika?
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75, marginBottom: 12 }}>
            W Polsce sezon pyłkowy zaczyna się już w <strong style={{ color: "var(--ink)" }}>lutym</strong>, gdy pylić zaczynają leszczyna i olcha —
            szczególnie w cieplejsze zimy. Najintensywniejszy okres to <strong style={{ color: "var(--ink)" }}>kwiecień–maj</strong> (brzoza, dąb, jesion)
            oraz <strong style={{ color: "var(--ink)" }}>czerwiec–lipiec</strong> (trawy — najczęstsza przyczyna alergii w Polsce).
          </p>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75, marginBottom: 12 }}>
            Alergicy uczuleni na ambrozję cierpią <strong style={{ color: "var(--ink)" }}>sierpień–wrzesień</strong>. Ambrozja to roślina inwazyjna,
            bardzo silnie alergizująca, której obszar w Polsce wciąż się powiększa.
          </p>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75 }}>
            Sprawdź aktualne stężenia pyłków w{" "}
            <Link to="/" style={{ color: "var(--forest)", fontWeight: 600, textDecoration: "underline" }}>interaktywnej mapie</Link>{" "}
            lub wybierz swoje miasto.
          </p>
        </section>

      </div>
      <StickyMobileCTA />
    </>
  );
}
