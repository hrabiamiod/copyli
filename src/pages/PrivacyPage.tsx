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

export default function PrivacyPage() {
  return (
    <>
      <SEOHead
        title="Polityka prywatności — CoPyli.pl"
        description="Polityka prywatności serwisu CoPyli.pl — informacje o przetwarzaniu danych osobowych zgodnie z RODO."
        canonical="https://copyli.pl/polityka-prywatnosci"
      />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 72px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,32px)", fontWeight: 700, color: "var(--forest)", marginBottom: 6 }}>
          Polityka prywatności
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 32 }}>Ostatnia aktualizacja: 21 kwietnia 2026 r.</p>

        <H2>1. Administrator danych</H2>
        <P>
          Administratorem danych osobowych zbieranych za pośrednictwem serwisu <strong>CoPyli.pl</strong> jest
          Michał Wiącek, zamieszkały we Wrocławiu, Polska (dalej: „Administrator").
          Kontakt w sprawach związanych z ochroną danych: <a href="mailto:kontakt@copyli.pl" style={{ color: "var(--forest)" }}>kontakt@copyli.pl</a>.
        </P>

        <H2>2. Podstawy prawne przetwarzania</H2>
        <P>Dane przetwarzane są na następujących podstawach prawnych (art. 6 RODO):</P>
        <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
          <Li><strong>Zgoda (art. 6 ust. 1 lit. a)</strong> — analityczne pliki cookie (Google Analytics 4).</Li>
          <Li><strong>Wykonanie umowy (art. 6 ust. 1 lit. b)</strong> — rejestracja i obsługa konta użytkownika.</Li>
          <Li><strong>Uzasadniony interes (art. 6 ust. 1 lit. f)</strong> — zapewnienie bezpieczeństwa serwisu, logi techniczne.</Li>
        </ul>

        <H2>3. Zakres zbieranych danych</H2>
        <P>W zależności od sposobu korzystania z serwisu możemy zbierać następujące dane:</P>
        <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
          <Li><strong>Dane rejestracyjne:</strong> adres e-mail, opcjonalna nazwa wyświetlana, hasło (przechowywane w postaci zaszyfrowanej hash bcrypt).</Li>
          <Li><strong>Dane konta:</strong> wybrane alergeny i ich nasilenie, zapisane lokalizacje (z etykietami Dom/Praca/Inne).</Li>
          <Li><strong>Dziennik objawów:</strong> daty wpisów, ocena samopoczucia (1–5), wybrane objawy, przyjęte leki, notatki własne, opcjonalne miasto.</Li>
          <Li><strong>Ustawienia powiadomień:</strong> preferencje alertów e-mail (próg, godzina).</Li>
          <Li><strong>Dane techniczne:</strong> adres IP (anonimizowany przez Google Analytics), typ przeglądarki, strony odwiedzane w serwisie.</Li>
        </ul>

        <H2>4. Cele przetwarzania</H2>
        <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
          <Li>Świadczenie usług serwisu: rejestracja, logowanie, personalizowany dashboard pyłkowy.</Li>
          <Li>Wysyłanie alertów e-mail o stężeniu pyłków (wyłącznie za zgodą użytkownika).</Li>
          <Li>Analiza ruchu i poprawa jakości serwisu (Google Analytics 4 — wyłącznie za zgodą).</Li>
          <Li>Zapewnienie bezpieczeństwa i ochrona przed nadużyciami.</Li>
        </ul>

        <H2>5. Odbiorcy danych</H2>
        <P>Dane mogą być przekazywane następującym podmiotom:</P>
        <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
          <Li><strong>Cloudflare Inc.</strong> (USA) — hosting serwisu (Cloudflare Pages) oraz baza danych (Cloudflare D1). Transfer odbywa się na podstawie standardowych klauzul umownych zatwierdzonych przez Komisję Europejską.</Li>
          <Li><strong>Google LLC</strong> (USA) — Google Analytics 4, wyłącznie po udzieleniu zgody. Dane anonimizowane (anonymize_ip: true). Transfer: standardowe klauzule umowne UE.</Li>
          <Li><strong>Resend Inc.</strong> (USA) — dostarczanie wiadomości e-mail (weryfikacja konta, alerty pyłkowe). Transfer: standardowe klauzule umowne UE.</Li>
          <Li><strong>Organy publiczne</strong> — w przypadkach przewidzianych przepisami prawa.</Li>
        </ul>

        <H2>6. Pliki cookie</H2>
        <P>Serwis wykorzystuje następujące kategorie plików cookie:</P>
        <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
          <Li><strong>Niezbędne:</strong> sesja logowania, preferencje zgody cookie — nie wymagają zgody, konieczne do działania serwisu.</Li>
          <Li><strong>Analityczne (za zgodą):</strong> Google Analytics 4 — zbierają anonimowe dane o sposobie korzystania ze strony w celu jej ulepszania.</Li>
        </ul>
        <P>Zgodą możesz zarządzać w dowolnym momencie, klikając przycisk „Ustawienia cookie" w stopce strony lub zmieniając ustawienia przeglądarki.</P>

        <H2>7. Okres przechowywania danych</H2>
        <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
          <Li><strong>Dane konta:</strong> do momentu usunięcia konta przez użytkownika lub przez Administratora.</Li>
          <Li><strong>Dziennik objawów:</strong> do momentu usunięcia przez użytkownika lub usunięcia konta.</Li>
          <Li><strong>Dane analityczne (GA4):</strong> maksymalnie 14 miesięcy, zgodnie z ustawieniami Google Analytics.</Li>
          <Li><strong>Logi techniczne:</strong> do 12 miesięcy.</Li>
          <Li><strong>Korespondencja e-mail:</strong> do 3 lat od daty wymiany.</Li>
        </ul>

        <H2>8. Prawa użytkownika</H2>
        <P>Przysługują Ci następujące prawa względem swoich danych osobowych:</P>
        <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
          <Li><strong>Prawo dostępu</strong> — możesz uzyskać informację o przetwarzanych danych.</Li>
          <Li><strong>Prawo do sprostowania</strong> — możesz poprawić nieprawidłowe dane.</Li>
          <Li><strong>Prawo do usunięcia</strong> — możesz usunąć konto i wszystkie powiązane dane bezpośrednio w ustawieniach (zakładka „Strefa niebezpieczna").</Li>
          <Li><strong>Prawo do ograniczenia przetwarzania</strong> — możesz zażądać wstrzymania przetwarzania danych.</Li>
          <Li><strong>Prawo do przenoszenia danych</strong> — możesz otrzymać kopię swoich danych w formacie JSON na żądanie.</Li>
          <Li><strong>Prawo sprzeciwu</strong> — możesz sprzeciwić się przetwarzaniu na podstawie uzasadnionego interesu.</Li>
          <Li><strong>Prawo do cofnięcia zgody</strong> — cofnięcie zgody nie wpływa na przetwarzanie przed jej cofnięciem.</Li>
        </ul>
        <P>
          Wnioski dotyczące praw prosimy kierować na adres:{" "}
          <a href="mailto:kontakt@copyli.pl" style={{ color: "var(--forest)" }}>kontakt@copyli.pl</a>.
          Odpowiedź zostanie udzielona w terminie 30 dni od otrzymania wniosku.
        </P>

        <H2>9. Prawo do skargi</H2>
        <P>
          Masz prawo wniesienia skargi do organu nadzorczego — Prezesa Urzędu Ochrony Danych Osobowych (UODO),
          ul. Stawki 2, 00-193 Warszawa, <a href="https://uodo.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: "var(--forest)" }}>uodo.gov.pl</a>.
        </P>

        <H2>10. Bezpieczeństwo danych</H2>
        <P>
          Stosujemy odpowiednie środki techniczne i organizacyjne chroniące dane przed nieuprawnionym dostępem,
          utratą lub zniszczeniem. Hasła przechowywane są wyłącznie w postaci zaszyfrowanej (bcrypt).
          Połączenie z serwisem odbywa się wyłącznie przez szyfrowane HTTPS.
        </P>

        <H2>11. Dzieci</H2>
        <P>
          Serwis nie jest kierowany do dzieci poniżej 16. roku życia. Jeśli uważasz, że dziecko podało swoje dane
          bez zgody opiekuna, skontaktuj się z nami — usuniemy je niezwłocznie.
        </P>

        <H2>12. Zmiany polityki prywatności</H2>
        <P>
          Administrator zastrzega sobie prawo do zmiany niniejszej polityki. Istotne zmiany zostaną
          zakomunikowane użytkownikom zarejestrowanym drogą e-mail z co najmniej 14-dniowym wyprzedzeniem.
          Aktualna wersja dostępna jest zawsze pod adresem{" "}
          <a href="https://copyli.pl/polityka-prywatnosci" style={{ color: "var(--forest)" }}>copyli.pl/polityka-prywatnosci</a>.
        </P>
      </div>
    </>
  );
}
