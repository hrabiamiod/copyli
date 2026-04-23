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
  headline: "Reaktywność krzyżowa pyłków — pełna lista alergenów i pokarmów",
  description: "Reaktywność krzyżowa pyłków i pokarmów — kiedy alergia na brzozę powoduje reakcję na jabłka? Pełna lista: drzewa, trawy, chwasty i powiązane pokarmy.",
  url: "https://copyli.pl/porady/reaktywnosc-krzyzowa",
  datePublished: "2026-04-01",
  dateModified: "2026-04-22",
  author: { "@type": "Organization", name: "Zespół CoPyli.pl" },
  publisher: { "@type": "Organization", name: "CoPyli.pl", url: "https://copyli.pl" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
      { "@type": "ListItem", position: 2, name: "Reaktywność krzyżowa", item: "https://copyli.pl/porady/reaktywnosc-krzyzowa" },
    ],
  },
};

const CROSS_TABLE = [
  {
    pollen: "Brzoza",
    pollenSlug: "birch",
    foods: "Jabłko, gruszka, czereśnia, śliwka, brzoskwinia, morela, wiśnia, seler, marchew, ziemniak, kiwi, orzech laskowy",
    severity: "Wysoka",
  },
  {
    pollen: "Leszczyna",
    pollenSlug: "hazel",
    foods: "Orzech laskowy, jabłko, seler, marchew, ziemniak",
    severity: "Wysoka",
  },
  {
    pollen: "Olcha",
    pollenSlug: "alder",
    foods: "Jabłko, gruszka, brzoskwinia, seler, marchew, orzech laskowy",
    severity: "Średnia",
  },
  {
    pollen: "Jesion",
    pollenSlug: "ash",
    foods: "Oliwka, ligustr — głównie pyłki innych roślin oliwkowatych",
    severity: "Niska",
  },
  {
    pollen: "Trawy",
    pollenSlug: "grass",
    foods: "Pszenica, żyto, owies, kukurydza, ryż — u części chorych (rzadko)",
    severity: "Niska",
  },
  {
    pollen: "Bylica",
    pollenSlug: "mugwort",
    foods: "Seler, marchew, pietruszka, kolendra, anyż, kminek, koper, papryka, mango",
    severity: "Wysoka",
  },
  {
    pollen: "Ambrozja",
    pollenSlug: "ragweed",
    foods: "Melon, arbuz, ogórek, banan, rumianek (herbata)",
    severity: "Średnia",
  },
];

export default function CrossReactivityPage() {
  return (
    <>
      <SEOHead
        title="Reaktywność krzyżowa pyłków — pełna lista alergenów i pokarmów | CoPyli.pl"
        description="Reaktywność krzyżowa pyłków i pokarmów — kiedy alergia na brzozę powoduje reakcję na jabłka? Pełna lista: drzewa, trawy, chwasty i powiązane pokarmy."
        canonical="https://copyli.pl/porady/reaktywnosc-krzyzowa"
        structuredData={structuredData}
      />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 72px" }}>

        <nav className="breadcrumb anim-fade-in" style={{ marginBottom: 24 }}>
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Reaktywność krzyżowa</span>
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
            Reaktywność krzyżowa pyłków — pełna lista
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 28 }}>
            Ostatnia aktualizacja: 22 kwietnia 2026 · Zespół CoPyli.pl
          </p>
        </div>

        <div style={{ background: "rgba(201,144,58,0.07)", border: "1px solid rgba(201,144,58,0.2)", borderRadius: "var(--r-md)", padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: "var(--ink)" }}>Reaktywność krzyżowa</strong> to zjawisko, w którym
            układ odpornościowy uczulony na pyłki reaguje też na podobne białka obecne w pokarmach.
            Dotyczy szacunkowo <strong style={{ color: "var(--ink)" }}>50–75% osób</strong> uczulonych na pyłki drzew.
          </p>
        </div>

        <H2>Na czym polega reaktywność krzyżowa?</H2>
        <P>
          Białka alergenne w pyłkach są strukturalnie podobne do białek w niektórych owocach, warzywach
          i orzechach. Układ immunologiczny, rozpoznając znajomy kształt cząsteczki, uruchamia reakcję
          alergiczną — nawet jeśli wcześniej dany pokarm był tolerowany.
        </P>
        <P>
          Objawy są zazwyczaj łagodniejsze niż przy alergii pokarmowej — najczęściej{" "}
          <strong>Oral Allergy Syndrome (OAS)</strong>: swędzenie i mrowienie warg, języka, podniebienia i gardła
          kilka sekund po zjedzeniu surowego produktu. Gotowanie, pieczenie lub blanszowanie
          dezaktywuje odpowiedzialne białka — większość chorych toleruje produkty po obróbce termicznej.
        </P>

        <H2>Pełna tabela reaktywności krzyżowej</H2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {CROSS_TABLE.map(row => (
            <div key={row.pollenSlug} style={{
              background: "var(--surface)", border: "1px solid var(--cream-dark)",
              borderRadius: "var(--r-md)", padding: "16px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <Link
                  to={`/pylek/roslina/${row.pollenSlug}`}
                  style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--forest)", textDecoration: "none" }}
                >
                  Pyłek: {row.pollen}
                </Link>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                  background: row.severity === "Wysoka" ? "rgba(239,68,68,0.1)" : row.severity === "Średnia" ? "rgba(249,115,22,0.1)" : "rgba(74,222,128,0.1)",
                  color: row.severity === "Wysoka" ? "#dc2626" : row.severity === "Średnia" ? "#ea580c" : "#15803d",
                }}>
                  Reaktywność: {row.severity}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: "var(--ink)" }}>Pokarmy:</strong> {row.foods}
              </p>
            </div>
          ))}
        </div>

        <H2>Brzoza i jabłko — najważniejsza para</H2>
        <P>
          Uczulenie na <Link to="/pylek/roslina/birch" style={{ color: "var(--forest)", fontWeight: 600 }}>brzozę</Link>{" "}
          jest najczęstszą przyczyną reaktywności krzyżowej w Polsce. Główne białko uczulające brzozy —
          <strong> Bet v 1</strong> — jest strukturalnie podobne do białek w jabłkach (Mal d 1),
          gruszkach, czereśniach, śliwkach i orzechach laskowych.
        </P>
        <P>
          Objawy po spożyciu jabłka mogą nasilać się w sezonie pylenia brzozy (kwiecień–maj).
          Poza sezonem białko Bet v 1 przestaje mocno stymulować układ immunologiczny
          i jabłko może być lepiej tolerowane.
        </P>

        <H2>Bylica i seler — „zespół bylicowo-selerowy"</H2>
        <P>
          Uczulenie na <Link to="/pylek/roslina/mugwort" style={{ color: "var(--forest)", fontWeight: 600 }}>bylicę</Link>{" "}
          może powodować silne reakcje na seler, marchew, pietruszkę i przyprawy korzenne
          (kminek, anyż, koper, kolendra). Jest to tzw. <strong>zespół bylicowo-selerowy</strong>.
          W przeciwieństwie do alergii na brzozę, ta reaktywność może wywoływać poważniejsze objawy systemowe.
        </P>

        <H2>Jak postępować przy reaktywności krzyżowej?</H2>
        <ul style={{ paddingLeft: 20, marginBottom: 24 }}>
          {[
            "Gotuj, piecz lub blanszuj problematyczne warzywa i owoce — obróbka termiczna niszczy białka alergenne.",
            "Obierz owoce ze skórki — większość alergenów koncentruje się w skórce.",
            "Prowadź dziennik objawów — zapisuj co jadłeś i kiedy pojawiły się reakcje.",
            "Nie eliminuj pokarmów na własną rękę bez diagnostyki — to może prowadzić do niedoborów.",
            "Skonsultuj się z alergologiem w celu wykonania testów na konkretne białka molekularne.",
            "Przy silnych reakcjach (obrzęk gardła, trudności z oddychaniem) natychmiast zadzwoń po pomoc.",
          ].map((tip, i) => (
            <li key={i} style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 6 }}>
              {tip}
            </li>
          ))}
        </ul>

        <div style={{ background: "var(--surface)", border: "1px solid var(--cream-dark)", borderRadius: "var(--r-md)", padding: "20px 24px", marginTop: 40 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 8 }}>Sprawdź stężenia pyłków wywołujących reaktywność</p>
          <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 16, lineHeight: 1.6 }}>
            Gdy stężenia pyłków brzozy lub bylicy są wysokie, reaktywność krzyżowa nasila się.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/pylek/roslina/birch" style={{
              display: "inline-block", padding: "8px 18px", borderRadius: 999, fontSize: 13,
              fontWeight: 600, color: "white", background: "var(--forest)", textDecoration: "none",
            }}>
              Brzoza — aktualne stężenie
            </Link>
            <Link to="/pylek/roslina/mugwort" style={{
              display: "inline-block", padding: "8px 18px", borderRadius: 999, fontSize: 13,
              fontWeight: 600, color: "var(--forest)", background: "rgba(27,67,50,0.08)", textDecoration: "none",
            }}>
              Bylica — aktualne stężenie
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--cream-dark)", display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link to="/porady/alergia-na-pylek" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Alergia na pyłki — poradnik →
          </Link>
          <Link to="/porady/sezon-pylkowy-2026" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Sezon pyłkowy 2026 →
          </Link>
          <Link to="/kalendarz-pylenia" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Kalendarz pylenia →
          </Link>
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 24, lineHeight: 1.6 }}>
          Ten artykuł ma charakter informacyjny i nie zastępuje porady lekarskiej.
          W przypadku podejrzenia reaktywności krzyżowej skonsultuj się z alergologiem.
        </p>
      </div>
    </>
  );
}
