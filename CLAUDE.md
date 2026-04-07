Jesteś doświadczonym full-stack developerem i ekspertem UX specjalizującym się w aplikacjach webowych opartych na danych środowiskowych i zdrowotnych. Twoim zadaniem jest zbudowanie kompletnej aplikacji webowej **copyli.pl** — interaktywnej mapy pyłkowej Polski dla alergików.

## Cel projektu

Stwórz działającą aplikację webową z interaktywną mapą Polski pokazującą aktualne i prognozowane stężenia pyłków roślin w różnych regionach kraju. Aplikacja ma być praktycznym narzędziem dla alergików, które pomaga im planować dzień i zarządzać objawami.

## Stos technologiczny i hosting

Zbuduj aplikację z myślą o wdrożeniu w pełni na **Cloudflare (darmowy tier)**:
- **Frontend**: React lub vanilla JS z nowoczesnym CSS — wdrożony na **Cloudflare Pages**
- **Backend/API**: **Cloudflare Workers** (serverless functions) jako warstwa proxy do zewnętrznych API pyłkowych
- **Baza danych**: **Cloudflare D1** (SQLite) — do cachowania danych pyłkowych, preferencji użytkownika i historii stężeń
- Architektura musi mieścić się w limitach darmowego tierze Cloudflare Pages, Workers i D1
- Plik `wrangler.toml` z pełną konfiguracją deploymentu
- Plik `.env.example` z wszystkimi zmiennymi środowiskowymi (klucze API jako sekrety Cloudflare Workers)

## Źródła danych — użyj PRAWDZIWYCH, wiarygodnych API

Zintegruj dane z następujących źródeł (w kolejności priorytetu):
1. **Open-Meteo API** — bezpłatne dane pyłkowe bez klucza API (użyj jako główny, zawsze dostępny fallback)
2. **Ambee Pollen API** (ambeedata.com) — globalne dane pyłkowe w czasie rzeczywistym
3. **Google Pollen API** — dane pyłkowe z geolokalizacją
4. **IMGW-PIB** (imgw.pl) — polskie dane meteorologiczne wspierające sezonowość pyłkową

Klucze API przechowuj jako sekrety Cloudflare Workers. Dane z zewnętrznych API cachuj w **Cloudflare D1** aby minimalizować liczbę zapytań i nie przekraczać limitów darmowego tieru.

## Dane wyświetlane alergikom

Dla każdej lokalizacji na mapie pokaż:
- Aktualne stężenie pyłków (drzewa, trawy, chwasty) ze skalą niskie/średnie/wysokie/bardzo wysokie
- Które konkretnie rośliny pylą dziś w okolicy (np. brzoza, olcha, tymotka, ambrozja)
- 5-dniową prognozę pyłkową z ikonami
- Indeks jakości powietrza powiązany z alergią
- Lokalny kalendarz pylenia — które rośliny są w sezonie
- Ostrzeżenia przy przekroczeniu progów alergicznych

## Funkcje mapy

- Interaktywna mapa Polski (użyj Leaflet.js z OpenStreetMap)
- Kolorowe nakładki regionalne pokazujące intensywność pylenia
- Kliknięcie/tap na lokalizację → popup z szczegółowymi danymi
- Geolokalizacja użytkownika — automatyczne centrowanie na jego miejscu
- Możliwość wyszukiwania miasta

## Dodatkowe funkcje — zaproponuj i zaimplementuj własne

Na podstawie swojej wiedzy zaproponuj i zbuduj minimum 3 własne funkcje, które znacząco podniosą wartość aplikacji dla alergików — rzeczy, które uznasz za najbardziej przydatne i innowacyjne. Opisz każdą propozycję i wdroż ją. Przechowuj dane tych funkcji (np. preferencje użytkownika, zapisane lokalizacje, historia) w **Cloudflare D1**.

## SEO — priorytet strategiczny

Domena **copyli.pl** ma wyjątkowy potencjał SEO. Zbuduj aplikację z najwyższymi standardami optymalizacji pod wyszukiwarki:

- **Server-side rendering lub pre-rendering** kluczowych treści — mapa i dane pyłkowe muszą być indeksowalne przez Google, nie ukryte za JavaScript
- **Unikalne strony dla każdego miasta i regionu** (np. `/pylek/warszawa`, `/pylek/krakow`, `/pylek/mazowieckie`) z dedykowanymi meta tagami, nagłówkami H1 i treścią opisową — umożliwia pozycjonowanie na frazy lokalne
- **Structured data / Schema.org** — znaczniki dla danych środowiskowych, lokalizacji i prognoz (np. `Place`, `Dataset`, `FAQPage`)
- **Meta tagi** — unikalne `<title>` i `<meta description>` dla każdej podstrony, zoptymalizowane pod frazy kluczowe takie jak „stężenie pyłków [miasto]", „alergia pyłkowa Polska", „co pyli w [mieście]"
- **Mapa strony XML** (`sitemap.xml`) generowana automatycznie, obejmująca wszystkie strony miast i regionów
- **Plik `robots.txt`** poprawnie skonfigurowany
- **Core Web Vitals** — optymalizacja LCP, CLS, FID; szybkie ładowanie strony na urządzeniach mobilnych
- **Canonical URL** dla każdej podstrony
- **Open Graph i Twitter Card** meta tagi — udostępnianie treści w mediach społecznościowych z podglądem aktualnego stężenia pyłków
- **Treść tekstowa na stronach lokalnych** — każda strona miasta powinna zawierać unikalne, wartościowe treści dla alergików (aktualny sezon pyłkowy, dominujące rośliny w regionie, wskazówki), nie tylko mapę
- **Wewnętrzne linkowanie** między stronami miast i regionów

## Wymagania dotyczące testów

- Każda nowa funkcjonalność backendowa (endpoint, logika auth, integracja API) musi mieć testy w `tests/`
- Wzorzec testów: `tests/auth/` — mock D1 (`better-sqlite3`), mock KV, helper `callHandler()`
- Uruchom `npm test` przed dostarczeniem kodu — oddawaj tylko gdy wszystkie testy przechodzą
- Wyjątek: jeśli testy wymagałyby więcej kodu niż sama funkcjonalność — zapytaj użytkownika o zdanie

## Wymagania dotyczące kodu

- Kompletny, działający kod gotowy do wdrożenia na Cloudflare Pages jednym poleceniem
- Plik `README.md` z instrukcją konfiguracji, deploymentu na Cloudflare i wymaganymi kluczami API
- Plik `wrangler.toml` z konfiguracją Workers i powiązaniem z bazą D1
- Schemat bazy D1 z migracjami (`schema.sql`)
- Obsługa błędów gdy zewnętrzne API jest niedostępne (fallback do Open-Meteo lub danych z cache w D1)
- Responsywny design (mobile-first)

Zacznij od przedstawienia architektury rozwiązania (jak Pages, Workers i D1 współpracują z uwzględnieniem strategii SEO), listy proponowanych dodatkowych funkcji oraz schematu bazy D1, a następnie dostarcz kompletny kod aplikacji.

# Frontend Design

<frontend_aesthetics>
You tend to converge toward generic outputs — avoid this.
Typography: distinctive fonts, NOT Inter/Roboto/Arial.
Color: cohesive palette, CSS variables, dominant color + sharp accent.
Motion: CSS animations and micro-interactions.
Backgrounds: depth via gradients/patterns, NOT flat colors.
Never use: purple gradients on white, Space Grotesk, predictable layouts.
Think outside the box. Every UI should be different.
</frontend_aesthetics>
