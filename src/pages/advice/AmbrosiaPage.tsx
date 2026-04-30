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
  headline: "Ambrozja — alergia, sezon pylenia (sierpień–październik)",
  description: "Ambrozja to jeden z najgroźniejszych alergenów sierpień–październik. Sprawdź sezon pylenia ambrozji w Polsce, objawy alergii i jak się chronić.",
  url: "https://copyli.pl/porady/alergia-na-ambrozje",
  datePublished: "2026-04-29",
  dateModified: "2026-04-29",
  author: { "@type": "Organization", name: "Zespół CoPyli.pl" },
  publisher: { "@type": "Organization", name: "CoPyli.pl", url: "https://copyli.pl" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
      { "@type": "ListItem", position: 2, name: "Porady", item: "https://copyli.pl/porady/" },
      { "@type": "ListItem", position: 3, name: "Ambrozja — alergia", item: "https://copyli.pl/porady/alergia-na-ambrozje" },
    ],
  },
};

export default function AmbrosiaPage() {
  return (
    <>
      <SEOHead
        title="Ambrozja — alergia, sezon pylenia (sierpień–październik) | CoPyli.pl"
        description="Ambrozja to jeden z najgroźniejszych alergenów sierpień–październik. Sprawdź sezon pylenia ambrozji w Polsce, objawy alergii i jak się chronić."
        canonical="https://copyli.pl/porady/alergia-na-ambrozje"
        structuredData={structuredData}
      />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 72px" }}>

        <nav className="breadcrumb anim-fade-in" style={{ marginBottom: 24 }}>
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <Link to="/porady/">Porady</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Ambrozja — alergia</span>
        </nav>

        <div className="anim-fade-up">
          <span style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
            color: "var(--forest)", background: "rgba(27,67,50,0.08)", borderRadius: 6,
            padding: "2px 8px", marginBottom: 12, display: "inline-block",
          }}>Poradnik</span>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)", margin: "8px 0 6px",
          }}>Ambrozja — alergia, sezon i ochrona</h1>
          <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 28 }}>
            Ostatnia aktualizacja: 29 kwietnia 2026 · Zespół CoPyli.pl
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12,
          background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.4)",
          borderRadius: "var(--r-md)", padding: "14px 18px", marginBottom: 20 }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚕️</span>
          <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: "var(--ink)" }}>Ważne:</strong> Treści mają charakter wyłącznie
            informacyjny i <strong style={{ color: "var(--ink)" }}>nie zastępują wizyty u lekarza ani porady medycznej.</strong>
          </p>
        </div>

        <div style={{ background: "rgba(27,67,50,0.06)", border: "1px solid rgba(27,67,50,0.12)",
          borderRadius: "var(--r-md)", padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
            Ambrozja bylicolistna (<em>Ambrosia artemisiifolia</em>) to inwazyjny chwast z Ameryki Północnej,
            który stał się jednym z najgroźniejszych alergenów w Polsce. Pyli od{" "}
            <strong style={{ color: "var(--ink)" }}>sierpnia do października</strong> — kiedy większość
            innych roślin już zakończyła sezon.
          </p>
        </div>

        <H2>Czym jest ambrozja?</H2>
        <P>
          Ambrozja bylicolistna to jednoroczny chwast z rodziny astrowatych (Asteraceae), który
          przywędrował do Europy z Ameryki Północnej w XIX wieku. W Polsce pojawia się od lat 90.,
          a jej zasięg systematycznie rośnie — szczególnie na południu kraju (Dolny Śląsk,
          Opolszczyzna, okolice Krakowa).
        </P>
        <P>
          Jedna roślina ambrozji może wyprodukować nawet <strong>miliard ziaren pyłku</strong> w ciągu
          sezonu. Pyłek jest wyjątkowo lekki i przenosi się z wiatrem na setki kilometrów —
          stężenia mogą być wysokie nawet tam, gdzie ambrozja nie rośnie lokalnie.
        </P>

        <H2>Kiedy pyli ambrozja w Polsce — mapa ekspansji</H2>
        <P>
          Sezon pylenia ambrozji trwa od{" "}
          <strong>początku sierpnia do końca października</strong>, z szczytem w sierpniu i wrześniu.
          To sprawia, że ambrozja przedłuża sezon alergiczny do późnej jesieni, kiedy większość
          uczulonych liczy już na ulgę.
        </P>
        <div style={{ overflowX: "auto", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(27,67,50,0.06)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink)", fontWeight: 700 }}>Miesiąc</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink)", fontWeight: 700 }}>Intensywność</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink)", fontWeight: 700 }}>Opis</th>
              </tr>
            </thead>
            <tbody>
              {[
                { m: "Lipiec", i: "⭐", d: "Sporadyczne pierwsze ziarna" },
                { m: "Sierpień", i: "⭐⭐⭐⭐⭐", d: "Szczyt pylenia ambrozji" },
                { m: "Wrzesień", i: "⭐⭐⭐⭐", d: "Wysokie stężenia" },
                { m: "Październik", i: "⭐⭐", d: "Stopniowy koniec sezonu" },
              ].map(r => (
                <tr key={r.m} style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                  <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{r.m}</td>
                  <td style={{ padding: "8px 12px" }}>{r.i}</td>
                  <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{r.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Ambrozja intensywnie pyli na południu Polski — zwłaszcza na Dolnym Śląsku, w Małopolsce
          i na Podkarpaciu. W centralnej i północnej Polsce stężenia są zwykle niższe, ale
          pyłek transportowany przez wiatr może powodować objawy wszędzie.
        </P>
        <P>
          Sprawdź aktualne stężenie ambrozji:{" "}
          <Link to="/pylek/roslina/ragweed" style={{ color: "var(--forest)", fontWeight: 600 }}>
            Mapa stężeń ambrozji →
          </Link>
        </P>

        <H2>Dlaczego jest tak niebezpieczna?</H2>
        <P>
          Pyłek ambrozji zawiera główny alergen <strong>Amb a 1</strong> — jedno z najbardziej
          uczulających białek wśród pyłków chwastów. Uczula się na nią szybko: wystarczy kilka
          sezonów ekspozycji. Uczulenie na ambrozję często współistnieje z alergią na bylicę
          (Artemisia vulgaris) ze względu na podobieństwo alergenów.
        </P>
        <P>
          Dodatkowym zagrożeniem jest reaktywność krzyżowa z pokarmami: część osób uczulonych
          na ambrozję reaguje na melony, banana, cukinię, ogórka i słonecznik.
        </P>

        <H2>Objawy alergii na ambrozję</H2>
        <P>
          Objawy alergii na ambrozję są typowe dla pyłkowicy, ale często bardziej nasilone
          niż przy alergii na trawy czy drzewa — pyłek ambrozji jest wyjątkowo drażniący dla
          dróg oddechowych:
        </P>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            "Intensywny katar sienny z wodnistą wydzieliną i świądem nosa",
            "Alergiczne zapalenie spojówek — silne łzawienie i pieczenie oczu",
            "Napady kichania, często seryjne",
            "Kaszel i duszność — ambrozja jest silnym alergenem astmatycznym",
            "Świąd podniebienia i gardła",
            "Pokrzywka i egzema przy kontakcie skórnym z rośliną",
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 6 }}>
              {item}
            </li>
          ))}
        </ul>

        <H2>Jak sprawdzić stężenie ambrozji</H2>
        <P>
          CoPyli.pl monitoruje stężenia ambrozji w Polsce przez cały sezon pylenia (sierpień–październik).
          Sprawdź stężenie w swoim mieście i włącz powiadomienia, gdy stężenia przekroczą
          Twój próg tolerancji.
        </P>
        <P>
          W dniach o wysokim stężeniu ambrozji szczególnie ważne są zasady{" "}
          <Link to="/porady/jak-chronic-sie-przed-pylkami" style={{ color: "var(--forest)", fontWeight: 600 }}>
            ochrony przed pyłkami →
          </Link>
        </P>

        <div style={{ background: "var(--surface)", border: "1px solid var(--cream-dark)",
          borderRadius: "var(--r-md)", padding: "20px 24px", marginTop: 40 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 8 }}>
            Monitoruj pyłki w swoim mieście
          </p>
          <Link to="/" style={{
            display: "inline-block", padding: "9px 22px", borderRadius: 999, fontSize: 13,
            fontWeight: 600, color: "white", background: "var(--forest)", textDecoration: "none",
          }}>Sprawdź stężenie →</Link>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--cream-dark)",
          display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link to="/porady/alergia-na-pylek" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Alergia na pyłki →
          </Link>
          <Link to="/porady/jak-chronic-sie-przed-pylkami" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Jak chronić się przed pyłkami →
          </Link>
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 24, lineHeight: 1.6 }}>
          Ten artykuł ma charakter informacyjny i nie zastępuje porady lekarskiej.
        </p>
      </div>
    </>
  );
}
