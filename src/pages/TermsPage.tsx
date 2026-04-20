import SEOHead from "../components/SEOHead";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--forest)", margin: "32px 0 10px" }}>
      {children}
    </h2>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 10 }}>{children}</p>;
}
function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, marginBottom: 4 }}>{children}</li>;
}

export default function TermsPage() {
  return (
    <>
      <SEOHead
        title="Regulamin — CoPyli.pl"
        description="Regulamin serwisu CoPyli.pl — interaktywnej mapy pyłkowej Polski dla alergików."
        canonical="https://copyli.pl/regulamin"
      />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 72px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,32px)", fontWeight: 700, color: "var(--forest)", marginBottom: 6 }}>
          Regulamin serwisu CoPyli.pl
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 32 }}>Ostatnia aktualizacja: 21 kwietnia 2026 r.</p>

        <H2>§ 1. Postanowienia ogólne</H2>
        <P>
          Niniejszy Regulamin określa zasady korzystania z serwisu internetowego <strong>CoPyli.pl</strong>
          (dalej: „Serwis"), dostępnego pod adresem <a href="https://copyli.pl" style={{ color: "var(--forest)" }}>copyli.pl</a>.
        </P>
        <P>
          Operatorem Serwisu jest Michał Wiącek, zamieszkały we Wrocławiu, Polska
          (dalej: „Operator"). Kontakt: <a href="mailto:kontakt@copyli.pl" style={{ color: "var(--forest)" }}>kontakt@copyli.pl</a>.
        </P>
        <P>
          Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu w całości.
        </P>

        <H2>§ 2. Charakter Serwisu i zastrzeżenie medyczne</H2>
        <P>
          CoPyli.pl jest serwisem informacyjnym prezentującym dane o stężeniu pyłków roślin na terenie Polski,
          oparte na danych z zewnętrznych źródeł (Open-Meteo API i innych). Serwis ma charakter wyłącznie
          <strong> informacyjny i edukacyjny</strong>.
        </P>
        <P>
          <strong>Informacje zawarte w Serwisie nie stanowią porady medycznej</strong> i nie zastępują
          konsultacji z lekarzem alergologiem. Decyzje dotyczące leczenia alergii należy podejmować
          wyłącznie w porozumieniu z lekarzem. Operator nie ponosi odpowiedzialności za skutki decyzji
          podjętych na podstawie danych prezentowanych w Serwisie.
        </P>

        <H2>§ 3. Rejestracja i konto użytkownika</H2>
        <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
          <Li>Rejestracja w Serwisie jest dobrowolna i bezpłatna.</Li>
          <Li>Do rejestracji wymagany jest aktywny adres e-mail oraz hasło spełniające wymogi bezpieczeństwa (min. 8 znaków, zawierające literę i cyfrę).</Li>
          <Li>Użytkownik zobowiązany jest do podania prawdziwych danych oraz do zachowania poufności hasła.</Li>
          <Li>Jedno konto może posiadać jedna osoba fizyczna. Zakaz tworzenia kont wielokrotnych.</Li>
          <Li>Użytkownik zobowiązany jest niezwłocznie poinformować Operatora o podejrzeniu nieautoryzowanego dostępu do konta.</Li>
          <Li>Konto można usunąć w dowolnym momencie z poziomu ustawień (zakładka „Strefa niebezpieczna").</Li>
        </ul>

        <H2>§ 4. Zasady korzystania z Serwisu</H2>
        <P>Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z prawem, dobrymi obyczajami oraz niniejszym Regulaminem. Zabrania się w szczególności:</P>
        <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
          <Li>podejmowania działań naruszających przepisy prawa polskiego lub unijnego,</Li>
          <Li>podejmowania prób nieuprawnionego dostępu do systemów informatycznych Serwisu,</Li>
          <Li>rozsyłania spamu lub treści o charakterze reklamowym bez zgody Operatora,</Li>
          <Li>automatycznego pobierania danych (scraping) bez pisemnej zgody Operatora,</Li>
          <Li>wprowadzania danych wprowadzających innych użytkowników w błąd.</Li>
        </ul>

        <H2>§ 5. Dokładność danych pyłkowych</H2>
        <P>
          Dane o stężeniu pyłków pochodzą z zewnętrznych źródeł (m.in. Open-Meteo API) i są aktualizowane
          automatycznie co ok. 2 godziny. Operator dokłada starań, aby prezentowane dane były jak najbardziej
          aktualne i dokładne, jednak <strong>nie gwarantuje ich bezbłędności, kompletności ani aktualności</strong>.
        </P>
        <P>
          Prognoza pyłkowa ma charakter orientacyjny. Rzeczywiste stężenia pyłków mogą odbiegać od prezentowanych
          w zależności od lokalnych warunków atmosferycznych i mikroklimatu.
        </P>

        <H2>§ 6. Dziennik objawów</H2>
        <P>
          Funkcja dziennika objawów służy wyłącznie do osobistego śledzenia samopoczucia przez użytkownika.
          Dane wpisywane do dziennika nie są weryfikowane przez Operatora i nie są udostępniane osobom trzecim.
          Użytkownik ponosi pełną odpowiedzialność za treść swoich wpisów.
        </P>

        <H2>§ 7. Odpowiedzialność Operatora</H2>
        <P>Operator nie ponosi odpowiedzialności za:</P>
        <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
          <Li>skutki decyzji zdrowotnych podjętych na podstawie danych z Serwisu,</Li>
          <Li>przerwy w dostępności Serwisu spowodowane pracami technicznymi lub awarią infrastruktury zewnętrznej,</Li>
          <Li>utratę danych spowodowaną okolicznościami niezależnymi od Operatora,</Li>
          <Li>treści zewnętrznych serwisów, do których prowadzą linki zamieszczone w Serwisie.</Li>
        </ul>

        <H2>§ 8. Własność intelektualna</H2>
        <P>
          Wszelkie prawa do Serwisu, w tym prawa autorskie do kodu, grafik, tekstów i layoutu, należą do Operatora
          lub są używane na podstawie odpowiednich licencji. Dane pyłkowe pochodzą z Open-Meteo API (licencja CC BY 4.0).
          Niedozwolone jest kopiowanie, modyfikowanie lub rozpowszechnianie elementów Serwisu bez pisemnej zgody Operatora.
        </P>

        <H2>§ 9. Reklamacje</H2>
        <P>
          Reklamacje dotyczące funkcjonowania Serwisu należy kierować na adres:{" "}
          <a href="mailto:kontakt@copyli.pl" style={{ color: "var(--forest)" }}>kontakt@copyli.pl</a>.
          Operator rozpatruje reklamacje w terminie 14 dni od ich otrzymania.
        </P>

        <H2>§ 10. Zmiany Regulaminu</H2>
        <P>
          Operator zastrzega sobie prawo do zmiany Regulaminu. O istotnych zmianach zarejestrowani użytkownicy
          zostaną powiadomieni drogą e-mail z co najmniej 14-dniowym wyprzedzeniem. Korzystanie z Serwisu po
          upływie tego terminu oznacza akceptację nowych warunków. Aktualna wersja Regulaminu dostępna jest
          zawsze pod adresem{" "}
          <a href="https://copyli.pl/regulamin" style={{ color: "var(--forest)" }}>copyli.pl/regulamin</a>.
        </P>

        <H2>§ 11. Prawo właściwe i rozstrzyganie sporów</H2>
        <P>
          Regulamin podlega prawu polskiemu. Wszelkie spory wynikające z korzystania z Serwisu będą rozstrzygane
          przez sądy powszechne właściwe dla miejsca zamieszkania Operatora, tj. sądy we Wrocławiu,
          chyba że przepisy prawa konsumenckiego stanowią inaczej.
        </P>
        <P>
          Konsumenci mają możliwość skorzystania z platformy ODR (Online Dispute Resolution) dostępnej pod adresem
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: "var(--forest)" }}> ec.europa.eu/consumers/odr</a>.
        </P>

        <H2>§ 12. Postanowienia końcowe</H2>
        <P>
          W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy Kodeksu cywilnego,
          ustawy o świadczeniu usług drogą elektroniczną oraz rozporządzenia RODO.
        </P>
      </div>
    </>
  );
}
