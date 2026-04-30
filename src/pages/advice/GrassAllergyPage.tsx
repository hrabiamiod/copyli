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
  headline: "Alergia na trawy — objawy, sezon pylenia i leczenie",
  description: "Alergia na trawy dotyka 8% Polaków. Kiedy trawa pyli, jakie objawy daje i jak się leczyć? Sprawdź sezon pylenia traw w Polsce i aktualne stężenia.",
  url: "https://copyli.pl/porady/alergia-na-trawy",
  datePublished: "2026-04-29",
  dateModified: "2026-04-29",
  author: { "@type": "Organization", name: "Zespół CoPyli.pl" },
  publisher: { "@type": "Organization", name: "CoPyli.pl", url: "https://copyli.pl" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
      { "@type": "ListItem", position: 2, name: "Porady", item: "https://copyli.pl/porady/" },
      { "@type": "ListItem", position: 3, name: "Alergia na trawy", item: "https://copyli.pl/porady/alergia-na-trawy" },
    ],
  },
};

export default function GrassAllergyPage() {
  return (
    <>
      <SEOHead
        title="Alergia na trawy — objawy, sezon pylenia i leczenie | CoPyli.pl"
        description="Alergia na trawy dotyka 8% Polaków. Kiedy trawa pyli, jakie objawy daje i jak się leczyć? Sprawdź sezon pylenia traw w Polsce i aktualne stężenia."
        canonical="https://copyli.pl/porady/alergia-na-trawy"
        structuredData={structuredData}
      />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 72px" }}>

        <nav className="breadcrumb anim-fade-in" style={{ marginBottom: 24 }}>
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <Link to="/porady/">Porady</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Alergia na trawy</span>
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
          }}>Alergia na trawy — objawy, sezon i leczenie</h1>
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
            Trawy (Poaceae) pylą w Polsce od maja do początku września — to jeden z najdłuższych sezonów
            pylenia. Graminozy (alergeny traw) uczulają szacunkowo <strong style={{ color: "var(--ink)" }}>8% Polaków</strong> i
            są główną przyczyną alergii letnich.
          </p>
        </div>

        <H2>Kiedy pylą trawy w Polsce</H2>
        <P>
          Sezon pylenia traw w Polsce trwa zwykle od <strong>połowy maja do końca sierpnia</strong>, z szczytem
          w czerwcu i lipcu. Tymotka łąkowa, kupkówka pospolita i wiechlina łąkowa to gatunki o
          największym znaczeniu alergologicznym.
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
                { m: "Kwiecień", i: "⭐", d: "Pierwsze gatunki łąkowe" },
                { m: "Maj", i: "⭐⭐⭐", d: "Narastające stężenia" },
                { m: "Czerwiec", i: "⭐⭐⭐⭐⭐", d: "Szczyt sezonu traw" },
                { m: "Lipiec", i: "⭐⭐⭐⭐", d: "Wysokie stężenia" },
                { m: "Sierpień", i: "⭐⭐", d: "Opadające stężenia" },
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
          Sprawdź aktualne stężenie traw w swoim mieście:{" "}
          <Link to="/pylek/roslina/grass" style={{ color: "var(--forest)", fontWeight: 600 }}>
            Mapa stężeń traw →
          </Link>
        </P>

        <H2>Objawy alergii na trawy</H2>
        <P>
          Alergeny traw (głównie Phl p 1, Phl p 5 z tymotki) wywołują klasyczne objawy pyłkowicy,
          często intensywniejsze niż przy alergii na drzewa — sezon jest dłuższy i trudniejszy do uniknięcia.
        </P>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { icon: "👃", title: "Katar", desc: "Wodnisty, napadowy, z towarzyszącym świądem nosa" },
            { icon: "👁️", title: "Zapalenie spojówek", desc: "Łzawienie, zaczerwienienie, pieczenie oczu" },
            { icon: "🤧", title: "Kichanie", desc: "Napadowe, szczególnie rano i po wyjściu na zewnątrz" },
            { icon: "😮‍💨", title: "Kaszel/duszność", desc: "U części chorych — współistniejąca astma oskrzelowa" },
            { icon: "😴", title: "Zmęczenie", desc: "Przewlekły stan zapalny wyczerpuje organizm" },
            { icon: "🌡️", title: "Świąd skóry", desc: "Pokrzywka kontaktowa po kontakcie z trawą" },
          ].map(s => (
            <div key={s.title} style={{ background: "var(--surface)", border: "1px solid var(--cream-dark)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</p>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)", marginBottom: 4 }}>{s.title}</p>
              <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <P>
          Charakterystyczna dla alergii na trawy jest <strong>reaktywność krzyżowa z pokarmami</strong>:
          część chorych reaguje na pomidory, ziemniaki, kiwi i melony. Szczegóły:{" "}
          <Link to="/porady/reaktywnosc-krzyzowa" style={{ color: "var(--forest)", fontWeight: 600 }}>
            Reaktywność krzyżowa →
          </Link>
        </P>

        <H2>Diagnostyka</H2>
        <P>
          Potwierdzenie alergii na trawy wymaga wizyty u alergologa. Podstawowe badania to testy
          skórne (prick tests) z ekstraktami traw lub oznaczenie swoistych IgE w surowicy.
          W diagnostyce molekularnej kluczowe są alergeny Phl p 1 i Phl p 5 (tymotka) — ich
          obecność wskazuje na uczulenie pierwotne, nie krzyżowe.
        </P>

        <H2>Jak sprawdzić stężenie traw na bieżąco</H2>
        <P>
          CoPyli.pl dostarcza dane o stężeniu pyłków traw dla ponad 1000 polskich miast,
          aktualizowane co kilka godzin na podstawie modeli Open-Meteo. Przed wyjściem sprawdź
          Indeks Spacerowy — pomaga ocenić, czy dziś bezpieczniej zostać w domu.
        </P>
        <P>
          Sprawdź też{" "}
          <Link to="/kalendarz-pylenia" style={{ color: "var(--forest)", fontWeight: 600 }}>
            Kalendarz pylenia →
          </Link>{" "}
          by zobaczyć, kiedy trawy pylą najintensywniej w Twojej okolicy.
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
          <Link to="/porady/reaktywnosc-krzyzowa" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Reaktywność krzyżowa →
          </Link>
          <Link to="/kalendarz-pylenia" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Kalendarz pylenia →
          </Link>
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 24, lineHeight: 1.6 }}>
          Ten artykuł ma charakter informacyjny i nie zastępuje porady lekarskiej.
        </p>
      </div>
    </>
  );
}
