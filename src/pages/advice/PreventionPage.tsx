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
  headline: "Jak chronić się przed pyłkami — 10 sprawdzonych metod",
  description: "Skuteczna ochrona przed pyłkami: sprawdź stężenia, dobierz leki, zadbaj o dom. 10 praktycznych wskazówek dla alergika podczas sezonu pyłkowego.",
  url: "https://copyli.pl/porady/jak-chronic-sie-przed-pylkami",
  datePublished: "2026-04-29",
  dateModified: "2026-04-29",
  author: { "@type": "Organization", name: "Zespół CoPyli.pl" },
  publisher: { "@type": "Organization", name: "CoPyli.pl", url: "https://copyli.pl" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://copyli.pl" },
      { "@type": "ListItem", position: 2, name: "Porady", item: "https://copyli.pl/porady/" },
      { "@type": "ListItem", position: 3, name: "Jak chronić się przed pyłkami", item: "https://copyli.pl/porady/jak-chronic-sie-przed-pylkami" },
    ],
  },
};

const TIPS = [
  {
    num: "01",
    title: "Sprawdzaj stężenia przed wyjściem",
    desc: "Korzystaj z CoPyli.pl — dane pyłkowe dla Twojego miasta, aktualizowane co kilka godzin. Indeks Spacerowy od razu pokaże, czy dziś warto wyjść.",
    cta: true,
  },
  {
    num: "02",
    title: "Unikaj godzin 10:00–14:00",
    desc: "W te godziny pyłki są najwyżej uniesione w powietrzu. Wychódź rano (przed 8:00) lub wieczorem — stężenia są wtedy znacznie niższe.",
  },
  {
    num: "03",
    title: "Noś okulary przeciwsłoneczne",
    desc: "Duże, szczelne okulary ograniczają kontakt pyłków z oczami. To prosty sposób na zmniejszenie objawów zapalenia spojówek.",
  },
  {
    num: "04",
    title: "Zmień ubranie po powrocie",
    desc: "Pyłki przywierają do tkanin i włosów. Po wejściu do domu od razu zmień ubranie i umyj twarz, ręce oraz nos. Nie siadaj w ubraniu z zewnątrz na kanapie ani łóżku.",
  },
  {
    num: "05",
    title: "Śpij przy zamkniętych oknach",
    desc: "Nocą pyłki opadają i gromadzą się przy ziemi — otwarte okno sypialni to prosta droga do pogorszenia snu. Używaj klimatyzacji z filtrem lub oczyszczacza powietrza HEPA.",
  },
  {
    num: "06",
    title: "Nie susz prania na zewnątrz",
    desc: "Mokre ubrania i pościel zbierają pyłki jak magnes. W sezonie pylenia susź pranie wewnątrz domu lub w suszarce.",
  },
  {
    num: "07",
    title: "Wychodź po deszczu",
    desc: "Opady deszczu wymywają pyłki z powietrza. Kilka godzin po deszczu stężenia są najniższe — to najlepszy moment na aktywność na zewnątrz.",
  },
  {
    num: "08",
    title: "Stosuj leki profilaktycznie",
    desc: "Kortykosteroidy donosowe wymagają 1–2 tygodni, by osiągnąć pełny efekt. Zacznij je stosować przed spodziewanym początkiem sezonu, nie po pierwszych objawach. Kwalifikuje lekarz.",
  },
  {
    num: "09",
    title: "Używaj oczyszczacza powietrza",
    desc: "Oczyszczacze z filtrem HEPA skutecznie zatrzymują ziarna pyłku. Najważniejszy jest pokój sypialniany — przez sen spędzasz tam 7–8 godzin.",
  },
  {
    num: "10",
    title: "Planuj urlop poza sezonem",
    desc: "Plaże nadmorskie i tereny górskie powyżej 1500 m n.p.m. mają zwykle znacznie niższe stężenia pyłków. Wyjazd nad morze w szczycie pylenia traw (czerwiec–lipiec) może przynieść dużą ulgę.",
  },
] as const;

export default function PreventionPage() {
  return (
    <>
      <SEOHead
        title="Jak chronić się przed pyłkami — 10 sprawdzonych metod | CoPyli.pl"
        description="Skuteczna ochrona przed pyłkami: sprawdź stężenia, dobierz leki, zadbaj o dom. 10 praktycznych wskazówek dla alergika podczas sezonu pyłkowego."
        canonical="https://copyli.pl/porady/jak-chronic-sie-przed-pylkami"
        structuredData={structuredData}
      />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 72px" }}>

        <nav className="breadcrumb anim-fade-in" style={{ marginBottom: 24 }}>
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <Link to="/porady/">Porady</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Jak chronić się przed pyłkami</span>
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
          }}>Jak chronić się przed pyłkami — 10 sprawdzonych metod</h1>
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
            Całkowita eliminacja ekspozycji na pyłki jest niemożliwa, ale świadome zarządzanie ryzykiem
            znacząco ogranicza objawy. Poniższe metody pomogą Ci przeżyć sezon z mniejszym dyskomfortem.
          </p>
        </div>

        <H2>Sprawdzaj stężenia zanim wyjdziesz</H2>
        <P>
          Stężenia pyłków w ciągu dnia mogą różnić się kilkakrotnie. Rano, jeszcze przed 8:00,
          pyłki dopiero zaczynają być uwalniane. Szczyt przypada na godziny 10:00–14:00, kiedy
          temperatura jest najwyższa i wiatr najsilniejszy. Późnym wieczorem stężenia znowu opadają.
        </P>
        <P>
          CoPyli.pl pokazuje aktualne stężenie pyłków dla ponad 1000 polskich miast i wylicza
          Indeks Spacerowy — jedno spojrzenie wystarczy, by ocenić ryzyko na dziś.
        </P>

        <H2>Kiedy nie wychodzić — najgorsze godziny</H2>
        <P>
          Dane meteorologiczne wskazują na trzy czynniki zwiększające stężenie pyłków w powietrzu:
          wysoka temperatura (powyżej 20°C), silny i suchy wiatr oraz brak opadów przez ponad 3 dni.
          Kombinacja tych warunków tworzy "dni pyłkowe" — szczególnie niebezpieczne dla alergików.
        </P>

        <H2>Ochrona w domu</H2>
        <P>
          Dom może być Twoją strefą wolną od pyłków, jeśli zadbasz o kilka podstawowych rzeczy:
          uszczelnione okna w sypialni, oczyszczacz powietrza HEPA w pokojach, regularne odkurzanie
          (najlepiej odkurzaczem z filtrem HEPA) i mokre wycieranie powierzchni.
        </P>

        <H2>Ubranie i higiena po powrocie</H2>
        <P>
          Pyłki przywierają do włosów, skóry i ubrań. Każde wejście do domu bez zmiany ubrania
          to przeniesienie pyłków do przestrzeni mieszkalnej. Prysznic wieczorem (zamiast rano)
          zmywa pyłki zebrane w ciągu dnia i poprawia jakość snu.
        </P>

        <H2>Planowanie podróży i wyjazdów</H2>
        <P>
          Różne regiony Polski pylą w nieco różnym czasie. Wybrzeże Bałtyku i Tatry mają niższe
          stężenia niż np. Nizina Śląska w szczycie sezonu. Warto sprawdzić stężenia w miejscu
          docelowym przed wyjazdem.
        </P>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 32, marginTop: 16 }}>
          {TIPS.map(tip => (
            <div key={tip.num} style={{ background: "var(--surface)", border: "1px solid var(--cream-dark)", borderRadius: "var(--r-md)", padding: "16px 18px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--forest)", marginBottom: 6, letterSpacing: "0.05em" }}>
                {tip.num}
              </p>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)", marginBottom: 6 }}>{tip.title}</p>
              <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.55, margin: 0 }}>{tip.desc}</p>
              {"cta" in tip && (
                <Link to="/" style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "var(--forest)", fontWeight: 600 }}>
                  Sprawdź CoPyli.pl →
                </Link>
              )}
            </div>
          ))}
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
          <Link to="/porady/leki-na-alergie-pylkowa" style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
            Leki na alergię →
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
