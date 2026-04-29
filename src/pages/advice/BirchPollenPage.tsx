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
  headline: "Pylenie brzozy — kiedy sezon, objawy alergii i co robić",
  description: "Brzoza pyli w Polsce głównie w marcu–maju i uczula ok. 20% alergików. Sprawdź aktualny sezon, objawy alergii na brzozę i metody ochrony.",
  url: "https://copyli.pl/porady/pylenie-brzozy",
  datePublished: "2026-04-29",
  dateModified: "2026-04-29",
  author: { "@type": "Organization", name: "Zespół CoPyli.pl" },
  publisher: { "@type": "Organization", name: "CoPyli.pl", url: "https://copyli.pl" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
      { "@type": "ListItem", position: 2, name: "Porady", item: "https://copyli.pl/porady/" },
      { "@type": "ListItem", position: 3, name: "Pylenie brzozy", item: "https://copyli.pl/porady/pylenie-brzozy" },
    ],
  },
};

export default function BirchPollenPage() {
  return (
    <>
      <SEOHead
        title="Pylenie brzozy — kiedy sezon, objawy alergii i co robić | CoPyli.pl"
        description="Brzoza pyli w Polsce głównie w marcu–maju i uczula ok. 20% alergików. Sprawdź aktualny sezon, objawy alergii na brzozę i metody ochrony."
        canonical="https://copyli.pl/porady/pylenie-brzozy"
        structuredData={structuredData}
      />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 72px" }}>

        <nav className="breadcrumb anim-fade-in" style={{ marginBottom: 24 }}>
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <Link to="/porady/">Porady</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Pylenie brzozy</span>
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
          }}>Pylenie brzozy — sezon, objawy alergii i ochrona</h1>
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
            Brzoza (<em>Betula pendula</em>) to jeden z najsilniejszych alergenów wiosennych w Polsce.
            Sezon pylenia trwa zwykle od marca do maja — w szczytowych dniach stężenia mogą przekraczać{" "}
            <strong style={{ color: "var(--ink)" }}>1500 ziaren/m³</strong>. Uczula około{" "}
            <strong style={{ color: "var(--ink)" }}>20% polskich alergików</strong>.
          </p>
        </div>

        <H2>Kiedy pyli brzoza w Polsce</H2>
        <P>
          Termin pylenia brzozy zależy od temperatury zimy i wiosny. Ciepłe zimy przyspieszają
          sezon nawet o 2–3 tygodnie. Brzoza należy do drzew pylących w jednym z najwcześniejszych
          okien wiosennych — często już w marcu.
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
                { m: "Marzec", i: "⭐⭐", d: "Początek sezonu w ciepłe lata" },
                { m: "Kwiecień", i: "⭐⭐⭐⭐⭐", d: "Szczyt pylenia brzozy" },
                { m: "Maj", i: "⭐⭐⭐⭐", d: "Opadające, nadal wysokie stężenia" },
                { m: "Czerwiec", i: "⭐", d: "Koniec sezonu" },
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
          Sprawdź aktualne stężenie brzozy w swoim mieście:{" "}
          <Link to="/pylek/roslina/birch" style={{ color: "var(--forest)", fontWeight: 600 }}>
            Mapa stężeń brzozy →
          </Link>
        </P>

        <H2>Dlaczego brzoza jest tak uczulająca?</H2>
        <P>
          Kluczowy alergen brzozy to <strong>Bet v 1</strong> — białko należące do grupy PR-10,
          obecne też w wielu owocach i warzywach. Jego zdolność do wiązania z przeciwciałami IgE
          jest wyjątkowo silna. Jedno drzewo brzozowe może w ciągu sezonu uwolnić nawet 5 miliardów
          ziaren pyłku, które wędrują z wiatrem na odległość do 400 km.
        </P>

        <H2>Objawy alergii na brzozę</H2>
        <P>
          Objawy pojawiają się już przy stężeniu 20–50 ziaren/m³ (próg objawowy dla wrażliwych osób).
          Przy stężeniach powyżej 200 ziaren/m³ większość uczulonych odczuwa intensywne objawy.
        </P>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {[
            "Intensywny, wodnisty katar z towarzyszącym świądem i obrzękiem błony śluzowej",
            "Zapalenie spojówek — łzawienie, zaczerwienienie, pieczenie oczu",
            "Napadowe kichanie — często seryjne, wielokrotne",
            "Kaszel i duszność — u astmatyków może wymagać modyfikacji leczenia",
            "Objawy ze strony jamy ustnej przy reaktywności krzyżowej (zespół alergii jamy ustnej)",
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 6 }}>
              {item}
            </li>
          ))}
        </ul>

        <H2>Reaktywność krzyżowa brzozy z pokarmami</H2>
        <P>
          Alergen Bet v 1 brzozy jest strukturalnie podobny do białek wielu owoców i warzyw.
          Nawet 70% osób uczulonych na brzozę reaguje na surowe jabłka, czereśnie lub orzeszki
          ziemne — to tzw.{" "}
          <Link to="/porady/reaktywnosc-krzyzowa" style={{ color: "var(--forest)", fontWeight: 600 }}>
            reaktywność krzyżowa
          </Link>.
        </P>
        <div style={{ background: "rgba(27,67,50,0.04)", border: "1px solid rgba(27,67,50,0.10)",
          borderRadius: "var(--r-md)", padding: "14px 18px", marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
            Typowe pokarmy krzyżowe z brzozą:
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
            Jabłka, gruszki, brzoskwinie, morele, czereśnie, wiśnie, śliwki, kiwi, marchew,
            seler, pietruszka, orzeszki ziemne, migdały, orzechy laskowe.
            <br /><strong style={{ color: "var(--ink)" }}>Ważne:</strong> Gotowanie dezaktywuje Bet v 1 — owoce po obróbce termicznej są zazwyczaj dobrze tolerowane.
          </p>
        </div>

        <H3>Leczenie</H3>
        <P>
          Leki antyhistaminowe i kortykosteroidy donosowe łagodzą objawy, ale nie eliminują uczulenia.
          Immunoterapia alergenowa na brzozę — podskórna lub podjęzykowa — może trwale zmniejszyć
          nadwrażliwość, a u wielu pacjentów ogranicza też reaktywność krzyżową z pokarmami.
          Kwalifikuje alergolog.
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
          <Link to="/porady/reaktywnosc-krzyzowa" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Reaktywność krzyżowa →
          </Link>
          <Link to="/porady/alergia-na-pylek" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Alergia na pyłki →
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
