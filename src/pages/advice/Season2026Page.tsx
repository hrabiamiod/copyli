import { Link } from "react-router-dom";
import SEOHead from "../../components/SEOHead";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--forest)", margin: "36px 0 12px", letterSpacing: "-0.02em" }}>
      {children}
    </h2>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 12 }}>{children}</p>;
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Sezon pyłkowy 2026 w Polsce — kiedy zaczyna się i ile trwa",
  description: "Kiedy zaczyna się sezon pyłkowy 2026? Harmonogram pylenia drzew, traw i chwastów w Polsce. Prognoza sezonu dla alergików.",
  url: "https://copyli.pl/porady/sezon-pylkowy-2026",
  datePublished: "2026-01-15",
  dateModified: "2026-04-22",
  author: { "@type": "Organization", name: "Zespół CoPyli.pl" },
  publisher: { "@type": "Organization", name: "CoPyli.pl", url: "https://copyli.pl" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
      { "@type": "ListItem", position: 2, name: "Sezon pyłkowy 2026", item: "https://copyli.pl/porady/sezon-pylkowy-2026" },
    ],
  },
};

const PHASES = [
  {
    period: "Luty – marzec",
    title: "Wczesna wiosna — drzewa liściaste",
    plants: [
      { name: "Leszczyna", slug: "hazel", months: "luty–marzec", note: "Pierwsza w sezonie, pyli nawet przy 5°C" },
      { name: "Olcha", slug: "alder", months: "luty–kwiecień", note: "Silny alergen, często myli się z przeziębieniem" },
      { name: "Topola", slug: "poplar", months: "marzec–kwiecień", note: "Puch NIE jest alergenem — pyli pyłkiem" },
    ],
    color: "rgba(82,183,136,0.15)",
    border: "rgba(82,183,136,0.3)",
  },
  {
    period: "Kwiecień – maj",
    title: "Wiosna — szczyt sezonu drzew",
    plants: [
      { name: "Brzoza", slug: "birch", months: "kwiecień–maj", note: "Główna przyczyna alergii wiosennej w Polsce" },
      { name: "Jesion", slug: "ash", months: "kwiecień–maj", note: "Reaktywność krzyżowa z oliwką i ligustrem" },
      { name: "Dąb", slug: "oak", months: "kwiecień–maj", note: "Nakłada się z sezonem brzozy" },
    ],
    color: "rgba(244,162,97,0.15)",
    border: "rgba(244,162,97,0.3)",
  },
  {
    period: "Maj – wrzesień",
    title: "Lato — trawy",
    plants: [
      { name: "Tymotka", slug: "timothy", months: "czerwiec–sierpień", note: "Dominujący alergen letni w Polsce" },
      { name: "Życica", slug: "ryegrass", months: "maj–sierpień", note: "Najsilniejszy alergen wśród traw" },
      { name: "Trawy (ogółem)", slug: "grass", months: "maj–wrzesień", note: "Najczęstsza przyczyna alergii w Polsce" },
    ],
    color: "rgba(99,102,241,0.1)",
    border: "rgba(99,102,241,0.2)",
  },
  {
    period: "Lipiec – październik",
    title: "Późne lato i jesień — chwasty",
    plants: [
      { name: "Bylica", slug: "mugwort", months: "lipiec–wrzesień", note: "Reaktywność krzyżowa z selerem i marchewką" },
      { name: "Ambrozja", slug: "ragweed", months: "sierpień–październik", note: "Inwazyjna, bardzo silnie alergizująca" },
      { name: "Babka lancetowata", slug: "plantain", months: "maj–wrzesień", note: "Często pomijana, szeroko rozpowszechniona" },
    ],
    color: "rgba(231,111,81,0.1)",
    border: "rgba(231,111,81,0.25)",
  },
];

export default function Season2026Page() {
  return (
    <>
      <SEOHead
        title="Sezon pyłkowy 2026 w Polsce — kiedy zaczyna się i ile trwa | CoPyli.pl"
        description="Kiedy zaczyna się sezon pyłkowy 2026? Harmonogram pylenia drzew, traw i chwastów w Polsce. Prognoza sezonu dla alergików — miesiąc po miesiącu."
        canonical="https://copyli.pl/porady/sezon-pylkowy-2026"
        structuredData={structuredData}
      />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 72px" }}>

        <nav className="breadcrumb anim-fade-in" style={{ marginBottom: 24 }}>
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Sezon pyłkowy 2026</span>
        </nav>

        <div className="anim-fade-up">
          <span style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
            color: "var(--forest)", background: "rgba(27,67,50,0.08)", borderRadius: 6, padding: "2px 8px", marginBottom: 12, display: "inline-block",
          }}>
            Sezon 2026
          </span>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)", margin: "8px 0 6px",
          }}>
            Sezon pyłkowy 2026 w Polsce — kiedy zaczyna się i ile trwa
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 28 }}>
            Ostatnia aktualizacja: 22 kwietnia 2026 · Zespół CoPyli.pl
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.4)", borderRadius: "var(--r-md)", padding: "14px 18px", marginBottom: 20 }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚕️</span>
          <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: "var(--ink)" }}>Ważne:</strong> Treści na tej stronie mają charakter wyłącznie informacyjny i <strong style={{ color: "var(--ink)" }}>nie zastępują wizyty u lekarza ani porady medycznej.</strong>{" "}
            W przypadku objawów alergicznych skonsultuj się z alergologiem lub lekarzem pierwszego kontaktu.
          </p>
        </div>

        <div style={{ background: "rgba(27,67,50,0.06)", border: "1px solid rgba(27,67,50,0.12)", borderRadius: "var(--r-md)", padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
            Sezon pyłkowy 2026 w Polsce trwa od <strong style={{ color: "var(--ink)" }}>lutego do października</strong> —
            łącznie około 9 miesięcy. Dla porównania, 30 lat temu kończył się w sierpniu.
            Ocieplenie klimatu wydłuża sezony pylenia i zwiększa stężenia pyłków.
          </p>
        </div>

        <H2>Cztery fazy sezonu pyłkowego 2026</H2>
        <P>
          Sezon pyłkowy nie jest jednorodny — składa się z kilku nakładających się faz pylenia różnych grup roślin.
          Alergicy uczuleni na wiele roślin mogą cierpieć przez większość roku.
        </P>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
          {PHASES.map(phase => (
            <div key={phase.period} style={{
              background: phase.color, border: `1px solid ${phase.border}`,
              borderRadius: "var(--r-md)", padding: "20px 22px",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                  color: "var(--ink-3)",
                }}>{phase.period}</span>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                  {phase.title}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {phase.plants.map(plant => (
                  <div key={plant.slug} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Link
                      to={`/pylek/roslina/${plant.slug}`}
                      style={{ fontSize: 13, fontWeight: 600, color: "var(--forest)", textDecoration: "none", flexShrink: 0, minWidth: 120 }}
                    >
                      {plant.name}
                    </Link>
                    <span style={{ fontSize: 12, color: "var(--ink-3)", flexShrink: 0 }}>{plant.months}</span>
                    <span style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>{plant.note}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <H2>Kiedy jest najgorszy moment sezonu?</H2>
        <P>
          Dla większości polskich alergików najtrudniejszy jest <strong>kwiecień–maj</strong> (szczyt pylenia brzozy)
          oraz <strong>czerwiec–lipiec</strong> (szczyt pylenia traw). Trawy to najczęstsza przyczyna alergii
          w Polsce — uczula na nie ok. 60% wszystkich alergików pyłkowych.
        </P>
        <P>
          Coraz większym problemem jest też <Link to="/pylek/roslina/ragweed" style={{ color: "var(--forest)", fontWeight: 600 }}>ambrozja</Link>{" "}
          (sierpień–październik). Choć pochodzi z Ameryki Północnej, zadomowiła się w Polsce i pyli
          bardzo intensywnie — jeden kwiat produkuje do miliarda ziaren pyłku dziennie.
        </P>

        <H2>Co pyli w Polsce miesiąc po miesiącu?</H2>
        <div style={{ overflowX: "auto", marginBottom: 24 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--surface-tint)" }}>
                {["Miesiąc", "Drzewa", "Trawy", "Chwasty"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "var(--ink-2)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--cream-dark)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { month: "Luty", tree: "Leszczyna, Olcha", grass: "—", weed: "—" },
                { month: "Marzec", tree: "Leszczyna, Olcha, Topola", grass: "—", weed: "—" },
                { month: "Kwiecień", tree: "Brzoza, Jesion, Dąb, Topola", grass: "—", weed: "—" },
                { month: "Maj", tree: "Dąb, Sosna", grass: "Życica, Babka", weed: "Pokrzywa, Babka" },
                { month: "Czerwiec", tree: "Sosna", grass: "Trawy, Tymotka", weed: "Pokrzywa" },
                { month: "Lipiec", tree: "—", grass: "Trawy, Tymotka", weed: "Bylica, Pokrzywa" },
                { month: "Sierpień", tree: "—", grass: "Trawy (schyłek)", weed: "Bylica, Ambrozja" },
                { month: "Wrzesień", tree: "—", grass: "—", weed: "Ambrozja, Bylica" },
                { month: "Październik", tree: "—", grass: "—", weed: "Ambrozja (schyłek)" },
              ].map((row, i) => (
                <tr key={row.month} style={{ borderBottom: "1px solid var(--cream-dark)", background: i % 2 === 0 ? "transparent" : "var(--surface-tint)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600, color: "var(--ink)" }}>{row.month}</td>
                  <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{row.tree}</td>
                  <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{row.grass}</td>
                  <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{row.weed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <H2>Jak przygotować się na sezon pyłkowy 2026?</H2>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            "Zrób testy alergologiczne przed sezonem — najlepiej jesienią lub zimą.",
            "Skonsultuj z alergologiem, jak przygotować się na bieżący sezon.",
            "Zainstaluj zakładkę CoPyli.pl — sprawdzaj stężenia przed wyjściem.",
          ].map((tip, i) => (
            <li key={i} style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 6 }}>
              {tip}
            </li>
          ))}
        </ul>

        <div style={{ background: "var(--surface)", border: "1px solid var(--cream-dark)", borderRadius: "var(--r-md)", padding: "20px 24px", marginTop: 40 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 8 }}>Aktualne dane pyłkowe 2026</p>
          <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 16, lineHeight: 1.6 }}>
            Śledź bieżące stężenia pyłków dla swojego miasta — aktualizowane co 2 godziny.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/" style={{
              display: "inline-block", padding: "9px 22px", borderRadius: 999, fontSize: 13,
              fontWeight: 600, color: "white", background: "var(--forest)", textDecoration: "none",
            }}>
              Mapa pyłkowa →
            </Link>
            <Link to="/kalendarz-pylenia" style={{
              display: "inline-block", padding: "9px 22px", borderRadius: 999, fontSize: 13,
              fontWeight: 600, color: "var(--forest)", background: "rgba(27,67,50,0.08)", textDecoration: "none",
            }}>
              Kalendarz pylenia →
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--cream-dark)", display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link to="/porady/alergia-na-pylek" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Alergia na pyłki — poradnik →
          </Link>
          <Link to="/porady/reaktywnosc-krzyzowa" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Reaktywność krzyżowa →
          </Link>
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 24, lineHeight: 1.6 }}>
          Ten artykuł ma charakter informacyjny. Daty pylenia są orientacyjne — mogą się różnić
          w zależności od regionu Polski i warunków pogodowych w danym roku.
        </p>
      </div>
    </>
  );
}
