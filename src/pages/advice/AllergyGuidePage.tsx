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
  headline: "Alergia na pyłki — objawy, leczenie i jak się chronić",
  description: "Kompleksowy przewodnik po alergii pyłkowej: objawy, diagnostyka, leczenie i codzienne sposoby na przeżycie sezonu pyłkowego bez cierpienia.",
  url: "https://copyli.pl/porady/alergia-na-pylek",
  datePublished: "2026-04-01",
  dateModified: "2026-04-22",
  author: { "@type": "Organization", name: "Zespół CoPyli.pl" },
  publisher: { "@type": "Organization", name: "CoPyli.pl", url: "https://copyli.pl" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
      { "@type": "ListItem", position: 2, name: "Alergia na pyłki", item: "https://copyli.pl/porady/alergia-na-pylek" },
    ],
  },
};

export default function AllergyGuidePage() {
  return (
    <>
      <SEOHead
        title="Alergia na pyłki — objawy, leczenie i jak się chronić | CoPyli.pl"
        description="Kompleksowy przewodnik po alergii pyłkowej: objawy, diagnostyka, leczenie i codzienne sposoby na przeżycie sezonu pyłkowego bez cierpienia."
        canonical="https://copyli.pl/porady/alergia-na-pylek"
        structuredData={structuredData}
      />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 72px" }}>

        <nav className="breadcrumb anim-fade-in" style={{ marginBottom: 24 }}>
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Alergia na pyłki</span>
        </nav>

        <div className="anim-fade-up">
          <span style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
            color: "var(--forest)", background: "rgba(27,67,50,0.08)", borderRadius: 6, padding: "2px 8px", marginBottom: 12, display: "inline-block",
          }}>
            Poradnik
          </span>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)", margin: "8px 0 6px",
          }}>
            Alergia na pyłki — objawy, leczenie i jak się chronić
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
            W Polsce na alergię pyłkową cierpi szacunkowo <strong style={{ color: "var(--ink)" }}>10–20% populacji</strong>.
            Sezon pyłkowy trwa od lutego do października. Ten przewodnik pomoże Ci zrozumieć mechanizm choroby,
            rozpoznać objawy i skutecznie ograniczyć ich wpływ na codzienne życie.
          </p>
        </div>

        <H2>Czym jest alergia pyłkowa (pyłkowica)?</H2>
        <P>
          Alergia pyłkowa, zwana też pyłkowicą lub katarem siennym (<em>rhinitis allergica</em>), to nadmierna
          reakcja układu odpornościowego na pyłki roślin. Układ immunologiczny traktuje niegroźne ziarna pyłku
          jak zagrożenie i uruchamia kaskadę reakcji zapalnych, wytwarzając przeciwciała IgE.
        </P>
        <P>
          Pyłki są wdychane wraz z powietrzem — jeden gram roślinności może uwalniać miliony ziaren pyłku.
          Najgroźniejsze są pyłki przenoszone przez wiatr:{" "}
          <Link to="/pylek/roslina/birch" style={{ color: "var(--forest)", fontWeight: 600 }}>brzozy</Link>,{" "}
          <Link to="/pylek/roslina/alder" style={{ color: "var(--forest)", fontWeight: 600 }}>olchy</Link>,{" "}
          <Link to="/pylek/roslina/grass" style={{ color: "var(--forest)", fontWeight: 600 }}>traw</Link> i{" "}
          <Link to="/pylek/roslina/ragweed" style={{ color: "var(--forest)", fontWeight: 600 }}>ambrozji</Link>.
        </P>

        <H2>Objawy alergii pyłkowej</H2>
        <P>Objawy pojawiają się w kontakcie z uczulającym pyłkiem i najczęściej obejmują:</P>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { icon: "👃", title: "Katar", desc: "Wodnisty, rzadki, obustronny — inny niż przy przeziębieniu" },
            { icon: "👁️", title: "Zapalenie spojówek", desc: "Łzawienie, pieczenie, zaczerwienienie oczu" },
            { icon: "🤧", title: "Kichanie", desc: "Napadowe, wielokrotne, często rano" },
            { icon: "😮‍💨", title: "Duszność", desc: "Kaszel, świszczący oddech — u części chorych astma" },
            { icon: "😴", title: "Zmęczenie", desc: "Przewlekły stan zapalny wyczerpuje organizm" },
            { icon: "🌡️", title: "Świąd", desc: "Nosa, oczu, gardła, podniebienia" },
          ].map(s => (
            <div key={s.title} style={{ background: "var(--surface)", border: "1px solid var(--cream-dark)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</p>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)", marginBottom: 4 }}>{s.title}</p>
              <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <H2>Diagnostyka — jak potwierdzić alergię?</H2>
        <P>
          Samodzielne rozpoznanie alergii pyłkowej jest trudne, bo objawy nakładają się z przeziębieniem.
          Kluczowa jest konsultacja z <strong>alergologiem</strong>, który może zlecić:
        </P>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          <li style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 6 }}>
            <strong>Testy skórne (prick tests)</strong> — naniesienie ekstraktów alergenów na skórę i ocena
            reakcji po 15–20 minutach. Szybkie, tanie, miarodajne.
          </li>
          <li style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 6 }}>
            <strong>Badania krwi (sIgE)</strong> — oznaczenie swoistych przeciwciał IgE dla konkretnych pyłków.
            Możliwe przy lekach antyhistaminowych, niezbędne u dzieci.
          </li>
          <li style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 6 }}>
            <strong>Molekularna diagnostyka (ISAC)</strong> — panel 112 alergenów z jednej próbki krwi.
            Wykrywa reaktywność krzyżową (np. brzoza i jabłko).
          </li>
        </ul>

        <H2>Leczenie alergii pyłkowej</H2>
        <H3>1. Leki doraźne</H3>
        <P>
          <strong>Leki antyhistaminowe</strong> II generacji (loratadyna, cetyryzyna, feksofenadyna) łagodzą
          objawy w ciągu 1–2 godzin. Dostępne bez recepty, można przyjmować profilaktycznie przed wyjściem
          na dwór w dni wysokiego stężenia pyłków.
        </P>
        <P>
          <strong>Kortykosteroidy donosowe</strong> (flutikazon, mometazon) — najskuteczniejsza forma leczenia
          objawowego kataru alergicznego. Wymagają regularnego stosowania (pełny efekt po 1–2 tygodniach).
        </P>
        <H3>2. Immunoterapia alergenowa (odczulanie)</H3>
        <P>
          Odczulanie to jedyna przyczynowa metoda leczenia alergii pyłkowej. Polega na regularnym podawaniu
          rosnących dawek alergenu przez 3–5 lat, co uczy układ odpornościowy tolerancji.
          Dostępne formy: zastrzyki podskórne (SCIT) i krople/tabletki podjęzykowe (SLIT).
        </P>
        <P>
          Odczulanie może trwale zmniejszyć objawy, zapobiec rozwojowi astmy i ograniczyć uczulenie na kolejne
          alergeny. Kwalifikuje alergolog.
        </P>

        <H2>Jak ograniczyć ekspozycję na pyłki?</H2>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            "Sprawdzaj aktualne stężenia pyłków na CoPyli.pl — wychodź przy niskim Indeksie Spacerowym.",
            "Unikaj wychodzenia między 10:00 a 14:00 — pyłki są wtedy najwyżej uniesione.",
            "Po powrocie do domu zmień ubranie i umyj twarz.",
            "Śpij przy zamkniętych oknach lub używaj oczyszczacza powietrza z filtrem HEPA.",
            "Noś okulary przeciwsłoneczne — ograniczają kontakt pyłków z oczami.",
            "Unikaj suszenia prania na zewnątrz w czasie szczytu pylenia.",
            "Po deszczu powietrze jest czystsze — to dobry moment na spacer.",
          ].map((tip, i) => (
            <li key={i} style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 6 }}>
              {tip}
            </li>
          ))}
        </ul>

        <H2>Reaktywność krzyżowa — pyłki a jedzenie</H2>
        <P>
          Wiele osób uczulonych na pyłki drzew reaguje też na surowe owoce i warzywa — to tzw.{" "}
          <Link to="/porady/reaktywnosc-krzyzowa" style={{ color: "var(--forest)", fontWeight: 600 }}>reaktywność krzyżowa</Link>.
          Klasyczny przykład: uczulenie na brzozę wywołuje reakcję na jabłka, czereśnie, brzoskwinie, gruszki.
          Gotowanie dezaktywuje alergeny — owoce po obróbce termicznej są zazwyczaj bezpieczne.
        </P>

        <div style={{ background: "var(--surface)", border: "1px solid var(--cream-dark)", borderRadius: "var(--r-md)", padding: "20px 24px", marginTop: 40 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 8 }}>Monitoruj pyłki w swoim mieście</p>
          <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 16, lineHeight: 1.6 }}>
            CoPyli.pl dostarcza aktualne dane pyłkowe dla ponad 1000 polskich miast — aktualizowane co 2 godziny.
          </p>
          <Link to="/" style={{
            display: "inline-block", padding: "9px 22px", borderRadius: 999, fontSize: 13,
            fontWeight: 600, color: "white", background: "var(--forest)", textDecoration: "none",
          }}>
            Sprawdź stężenie w swoim mieście →
          </Link>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--cream-dark)", display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link to="/porady/sezon-pylkowy-2026" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Sezon pyłkowy 2026 →
          </Link>
          <Link to="/porady/reaktywnosc-krzyzowa" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Reaktywność krzyżowa →
          </Link>
          <Link to="/kalendarz-pylenia" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Kalendarz pylenia →
          </Link>
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 24, lineHeight: 1.6 }}>
          Ten artykuł ma charakter informacyjny i nie zastępuje porady lekarskiej.
          W przypadku objawów alergicznych skonsultuj się z alergologiem.
        </p>
      </div>
    </>
  );
}
