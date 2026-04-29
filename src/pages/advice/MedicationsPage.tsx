import { Link } from "react-router-dom";
import SEOHead from "../../components/SEOHead";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--forest)", margin: "36px 0 12px", letterSpacing: "-0.02em" }}>
      {children}
    </h2>
  );
}
function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: "24px 0 8px" }}>
      {children}
    </h3>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 12 }}>{children}</p>;
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Leki na alergię pyłkową — antyhistaminowe, steroidy, odczulanie",
  description: "Jakie leki na alergię pyłkową wybrać? Antyhistaminowe II generacji, kortykosteroidy donosowe i immunoterapia — jak działają i kiedy je stosować.",
  url: "https://copyli.pl/porady/leki-na-alergie-pylkowa",
  datePublished: "2026-04-29",
  dateModified: "2026-04-29",
  author: { "@type": "Organization", name: "Zespół CoPyli.pl" },
  publisher: { "@type": "Organization", name: "CoPyli.pl", url: "https://copyli.pl" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
      { "@type": "ListItem", position: 2, name: "Porady", item: "https://copyli.pl/porady/" },
      { "@type": "ListItem", position: 3, name: "Leki na alergię pyłkową", item: "https://copyli.pl/porady/leki-na-alergie-pylkowa" },
    ],
  },
};

export default function MedicationsPage() {
  return (
    <>
      <SEOHead
        title="Leki na alergię pyłkową — antyhistaminowe, steroidy, odczulanie | CoPyli.pl"
        description="Jakie leki na alergię pyłkową wybrać? Antyhistaminowe II generacji, kortykosteroidy donosowe i immunoterapia — jak działają i kiedy je stosować."
        canonical="https://copyli.pl/porady/leki-na-alergie-pylkowa"
        structuredData={structuredData}
      />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 72px" }}>

        <nav className="breadcrumb anim-fade-in" style={{ marginBottom: 24 }}>
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <Link to="/porady/">Porady</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Leki na alergię pyłkową</span>
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
          }}>Leki na alergię pyłkową — rodzaje, działanie i skuteczność</h1>
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
            informacyjny i <strong style={{ color: "var(--ink)" }}>nie zastępują wizyty u lekarza ani porady medycznej.</strong>{" "}
            Nie zalecamy konkretnych leków — wybór preparatu i dawkowanie kwalifikuje alergolog lub lekarz.
          </p>
        </div>

        <div style={{ background: "rgba(27,67,50,0.06)", border: "1px solid rgba(27,67,50,0.12)",
          borderRadius: "var(--r-md)", padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
            Leczenie alergii pyłkowej opiera się na trzech filarach:{" "}
            <strong style={{ color: "var(--ink)" }}>leki antyhistaminowe</strong> (objawy doraźne),{" "}
            <strong style={{ color: "var(--ink)" }}>kortykosteroidy donosowe</strong> (codzienna kontrola) i{" "}
            <strong style={{ color: "var(--ink)" }}>immunoterapia alergenowa</strong> (jedyna metoda przyczynowa).
          </p>
        </div>

        <H2>Leki antyhistaminowe II generacji</H2>
        <P>
          Antyhistaminiki blokują receptory H1 histaminy, ograniczając katar, świąd, kichanie
          i objawy oczne. Preparaty II generacji (loratadyna, cetyryzyna, feksofenadyna) są
          preferowane ze względu na znacznie mniejsze działanie uspokajające niż leki I generacji.
        </P>
        <P>
          Działają szybko — efekt pojawia się w ciągu 1–2 godzin. Można je przyjmować
          zarówno doraźnie (przy nasilonych objawach), jak i profilaktycznie — codziennie przez
          cały sezon. Wybór preparatu i dawkowanie ustala lekarz lub alergolog.
        </P>

        <H2>Kortykosteroidy donosowe</H2>
        <P>
          Kortykosteroidy donosowe (flutikazon, mometazon, budezonid, beklometazon) to
          <strong> najskuteczniejsza forma leczenia objawowego</strong> alergicznego nieżytu nosa.
          Działają miejscowo — hamują stan zapalny błony śluzowej nosa, ograniczając obrzęk,
          wydzielinę i świąd.
        </P>
        <P>
          Kluczowa zasada: pełny efekt wymaga regularnego stosowania przez 1–2 tygodnie.
          Optymalnie: rozpocznij stosowanie 2 tygodnie <em>przed</em> spodziewanym sezonem
          pylenia, nie czekaj na pierwsze objawy. Dawkowanie i czas stosowania określa lekarz.
        </P>

        <H2>Leki na oczy</H2>
        <P>
          Alergiczne zapalenie spojówek wymaga osobnego leczenia. Stosuje się krople do oczu
          zawierające leki antyhistaminowe (azelastyna, ketotifen) lub inhibitory degranulacji
          komórek tucznych (kromoglikan). Przy nasilonych objawach — krótkotrwałe krople
          glikokortykosteroidowe pod nadzorem okulisty.
        </P>

        <H2>Immunoterapia alergenowa (odczulanie)</H2>
        <P>
          Immunoterapia to jedyna metoda przyczynowa — nie tylko łagodzi objawy, lecz zmienia
          odpowiedź immunologiczną organizmu. Po zakończeniu kuracji (3–5 lat) efekt może
          utrzymywać się przez wiele lat.
        </P>
        <H3>Formy immunoterapii</H3>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          <li style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 8 }}>
            <strong>SCIT (iniekcje podskórne)</strong> — zastrzyki z rosnącymi dawkami alergenu,
            podawane w gabinecie alergologicznym. Najlepiej zbadana forma — skuteczność potwierdzona
            w badaniach klinicznych dla pyłków drzew i traw.
          </li>
          <li style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 8 }}>
            <strong>SLIT (podjęzykowa)</strong> — krople lub tabletki stosowane w domu.
            Wygodniejsza, ale wymaga codziennej dyscypliny przez lata.
          </li>
        </ul>

        <H2>Kiedy iść do alergologa</H2>
        <P>
          Wizyta u alergologa jest wskazana, gdy:
        </P>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            "Objawy utrzymują się mimo stosowania leków dostępnych bez recepty",
            "Pojawia się kaszel, duszność lub świszczący oddech (możliwa astma)",
            "Rozważasz immunoterapię — kwalifikuje wyłącznie alergolog",
            "Nie wiesz, na co konkretnie jesteś uczulony",
            "Chcesz wykonać testy alergiczne (prick tests lub sIgE z krwi)",
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 6 }}>
              {item}
            </li>
          ))}
        </ul>

        <div style={{ overflowX: "auto", marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(27,67,50,0.06)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink)", fontWeight: 700 }}>Typ leku</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink)", fontWeight: 700 }}>Mechanizm</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink)", fontWeight: 700 }}>Kiedy stosować</th>
              </tr>
            </thead>
            <tbody>
              {[
                { typ: "Antyhistaminiki II gen. (loratadyna, cetyryzyna, feksofenadyna)", mech: "Blokada receptorów H1 histaminy", kiedy: "Doraźnie lub codziennie w sezonie" },
                { typ: "Kortykosteroidy donosowe (flutikazon, mometazon, budezonid)", mech: "Hamowanie stanu zapalnego błony śluzowej nosa", kiedy: "Regularnie, od 2 tyg. przed sezonem" },
                { typ: "Leki do oczu (azelastyna, ketotifen, kromoglikan)", mech: "Miejscowe działanie antyhistaminowe lub stabilizujące", kiedy: "Przy objawach ocznych" },
                { typ: "Immunoterapia (SCIT/SLIT)", mech: "Indukcja tolerancji immunologicznej", kiedy: "Leczenie przyczynowe, 3–5 lat" },
              ].map(r => (
                <tr key={r.typ} style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                  <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{r.typ}</td>
                  <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{r.mech}</td>
                  <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{r.kiedy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
          <Link to="/porady/reaktywnosc-krzyzowa" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Reaktywność krzyżowa →
          </Link>
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 24, lineHeight: 1.6 }}>
          Ten artykuł ma charakter informacyjny i nie zastępuje porady lekarskiej.
          Nie zalecamy konkretnych leków — wybór preparatu kwalifikuje alergolog.
        </p>
      </div>
    </>
  );
}
