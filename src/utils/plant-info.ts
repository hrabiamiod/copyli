export interface PlantInfo {
  info: string;
  tips: string[];
}

export const PLANT_INFO: Record<string, PlantInfo> = {
  birch: {
    info: "Brzoza jest jednym z najsilniejszych alergenów w Polsce — uczula ok. 20% populacji. Główne białko alergenne Bet v 1 odpowiada za silną reaktywność krzyżową z innymi drzewami i owocami pestkowymi. Pyłek brzozy może przenosić się nawet na setki kilometrów.",
    tips: [
      "Obserwuj prognozy pyłkowe od marca — w ciepłe wiosny brzoza kwitnie wcześniej",
      "Reaktywność krzyżowa z jabłkami, gruszkami, wiśniami, brzoskwiniami i orzechami",
      "W szczycie sezonu (kwiecień–maj) ogranicz wietrzenie w godzinach 10–16",
      "Po powrocie z zewnątrz zmień ubranie i umyj twarz",
    ],
  },
  alder: {
    info: "Olcha to jeden z pierwszych alergenów sezonu pyłkowego — pyli już w lutym, kiedy inne rośliny jeszcze śpią. Jej pyłek jest szczególnie uciążliwy w ciepłe, bezśnieżne zimy i może zaskakiwać alergików nieprzygotowanych po zimowej przerwie.",
    tips: [
      "Sezon zaczyna się już w lutym — zaopatrz się w leki przed końcem stycznia",
      "Reaktywność krzyżowa z brzozą i leszczyną",
      "Pyłek olchy wylatuje głównie między godz. 10 a 14 w słoneczne dni",
      "Deszcz znacząco obniża stężenia — planuj aktywności na pochmurne lub mokre dni",
    ],
  },
  hazel: {
    info: "Leszczyna to najwcześniejszy alergen w Polsce — może pylić już w styczniu w ciepłe zimy, szczególnie na południu kraju. Jej pyłek, choć mniej alergizujący niż pyłek brzozy, często otwiera sezon i uwrażliwia układ odpornościowy.",
    tips: [
      "Monitoruj prognozy od stycznia — w ciepłe zimy stężenia mogą być zaskakująco wysokie",
      "Reaktywność krzyżowa z brzozą i olchą",
      "Leszczyna rośnie m.in. na skrajach lasów i w ogrodach — unikaj tych miejsc wczesną wiosną",
    ],
  },
  ash: {
    info: "Jesion wyniosły (Fraxinus excelsior) pyli w marcu i kwietniu, często jednocześnie z brzozą. Jego alergeny (Fra e 1) wykazują reaktywność krzyżową z oliwką i ligustrem. Jesion jest popularnym drzewem alejowym i parkowym w polskich miastach, co sprawia, że narażenie jest szczególnie duże w obszarach zurbanizowanych.",
    tips: [
      "Sezon pylenia zbiega się z brzozą — wiosną miej leki zawsze przy sobie",
      "Reaktywność krzyżowa z oliwką, ligustrem i bzem — uważaj na te rośliny",
      "Drzewa jesionowe stoją wzdłuż wielu polskich dróg — unikaj długich spacerów wzdłuż alei w szczycie sezonu",
      "Zamknięte okna w samochodzie i klimatyzacja z filtrem HEPA znacząco redukują ekspozycję",
    ],
  },
  oak: {
    info: "Dąb pyli głównie w maju, często nakładając się z końcem sezonu brzozy. Choć pyłek dębu jest mniej alergizujący niż pyłek brzozy, produkowany jest w ogromnych ilościach. Osoby uczulone na brzozę często reagują też na dąb ze względu na reaktywność krzyżową alergenów Que a 1 i Bet v 1.",
    tips: [
      "W maju możesz być narażony jednocześnie na pyłek brzozy i dębu — podwójny cios alergiczny",
      "Reaktywność krzyżowa z brzozą — jeśli masz alergię na brzozę, obserwuj też stężenia dębu",
      "Unikaj parków z dużą liczbą dębów w maju — szczególnie w słoneczne, bezwietrzne południa",
      "Stężenia dębowego pyłku spadają gwałtownie po deszczu — planuj wyjścia po opadach",
    ],
  },
  poplar: {
    info: "Topola pyli od marca do maja, a jej charakterystyczny biały puch pojawia się w czerwcu. Ważne: puch topoli to NIE jest pyłek — to włoski nasienne, które nie wywołują alergii! Prawdziwy pyłek topoli jest drobny, prawie niewidoczny gołym okiem i pojawia się kilka tygodni przed puchem. Alergia na pyłek topoli dotyczy stosunkowo nielicznej grupy osób.",
    tips: [
      "Nie myl puchu topoli z pyłkiem — puch nie wywołuje alergii, ale może podrażniać drogi oddechowe",
      "Pyłek topoli (marzec–maj) jest znacznie groźniejszy dla alergików niż puch (czerwiec)",
      "Topole rosną często wzdłuż rzek i w parkach — wiosną wybieraj inne trasy spacerowe",
      "Jeśli objawy nasilają się w czasie puchu — to prawdopodobnie inna roślina pyląca w tym samym czasie (trawy)",
    ],
  },
  pine: {
    info: "Sosna pyli obficie w maju i czerwcu — żółte chmury pyłku są dobrze widoczne gołym okiem. Mimo masowej produkcji pyłku, sosna jest stosunkowo słabym alergenem — jej ziarna są duże i ciężkie, słabiej wnikają głęboko do dróg oddechowych. Alergia na sosnę dotyka znacznie mniej osób niż alergia na brzozę czy trawy.",
    tips: [
      "Żółty nalot na samochodach i tarasach to pyłek sosny — spektakularny, ale rzadko groźny",
      "Jeśli masz objawy alergii w maju, sprawdź też stężenia brzozy i traw — to częstsze przyczyny",
      "Alergicy na sosnę powinni unikać lasów sosnowych w szczycie pylenia (maj–czerwiec)",
      "Pyłek sosny to dobry bioindykator — żółty nalot na wodzie w jeziorach wskazuje na szczyt sezonu",
    ],
  },
  plane: {
    info: "Platan klonolistny (Platanus × acerifolia) pyli w maju i jest coraz popularniejszym drzewem miejskim w Polsce. Jego mikrowłoski (trichomy) towarzyszące pyłkowi mogą podrażniać drogi oddechowe nawet u osób bez alergii. W dużych miastach (Warszawa, Kraków, Wrocław) platany stanowią znaczące źródło alergenów miejskich.",
    tips: [
      "Platany stoją wzdłuż głównych bulwarów i placów w centrach miast — w maju omijaj te miejsca",
      "Mikrowłoski platana mogą podrażniać oczy i nos nawet bez alergii — chroń się okularami",
      "Sezon pylenia platana (maj) pokrywa się ze szczytem sezonu traw — trudno odróżnić sprawcę objawów",
      "Po deszczu stężenia pyłku platana gwałtownie spadają — wtedy bezpieczniej w centrum",
    ],
  },
  grass: {
    info: "Alergia na trawy to najczęstsza alergia pyłkowa w Polsce — dotyczy ok. 30% alergików. Sezon jest długi (maj–wrzesień) z wyraźnym szczytem w czerwcu i lipcu. Główne alergeny to tymotka, kupkówka i życica.",
    tips: [
      "Unikaj przebywania na łąkach i polach w południe — stężenia są wtedy najwyższe",
      "Po powrocie z zewnątrz przebierz się i umyj włosy — pyłek mocno osiada na ubraniu i włosach",
      "Kośmy trawnik przed zakwitnięciem — krótkie trawy pylą mniej",
      "Leki antyhistaminowe zacznij brać 1–2 tygodnie przed spodziewanym szczytem",
    ],
  },
  ryegrass: {
    info: "Życica trwała (Lolium perenne) to jeden z najsilniejszych alergenów trawiastych w Polsce. Jej alergen Lol p 1 jest bardzo zbliżony do alergenów tymotki i kupkówki, co powoduje reaktywność krzyżową z praktycznie wszystkimi trawami. Życica jest powszechnie stosowana w trawnikach miejskich, na stadionach i w parkach.",
    tips: [
      "Alergia na życicę to w praktyce alergia na wszystkie trawy — unikaj terenów trawiastych od maja do września",
      "Parki i boiska sportowe w miastach to skupiska życicy — omijaj je w południe i po wietrznych dniach",
      "Skoszone trawniki uwalniają mniej pyłku — ale świeżo skoszona trawa może nasilać objawy",
      "Okulary przeciwsłoneczne chronią oczy przed pyłkiem podczas aktywności na świeżym powietrzu",
    ],
  },
  timothy: {
    info: "Tymotka łąkowa (Phleum pratense) jest dominującym alergenem trawiastym w Polsce i całej Europie Środkowej. Jej alergeny (Phl p 1, Phl p 5) są często używane jako standard w testach skórnych i odczulaniu. Tymotka rośnie na łąkach, przy drogach i na nieużytkach — jej zasięg jest ogólnopolski.",
    tips: [
      "Tymotka to referencyjny alergen w testach alergicznych — jeśli jesteś uczulony na trawy, prawdopodobnie reagujesz na tymotykę",
      "Szczyt pylenia w czerwcu–lipcu — najgorszy czas dla alergików na trawy",
      "Immunoterapia (odczulanie) na tymotykę daje dobre rezultaty — zapytaj alergologa",
      "Deszczowe lato = mniej pyłku tymotki — planuj urlop w mokre regiony lub nad morze",
    ],
  },
  mugwort: {
    info: "Bylica pospolita (Artemisia vulgaris) pyli od lipca do września. Jej alergeny (Art v 1, Art v 3) są zbliżone do alergenów ambrozji, co prowadzi do częstej reaktywności krzyżowej. Bylica jest wyjątkowo odporna i rośnie wszędzie — od ogrodów po pobocza autostrad.",
    tips: [
      "Unikaj terenów nieużytków i nasypów kolejowych — tam bylica rośnie najgęściej",
      "Reaktywność krzyżowa z ambrozją, kolendrą, kminem i papryką",
      "Pyłek bylicy jest aktywny głównie w godzinach wieczornych i nocnych",
      "Nie wynoś świeżych ziół z rodziny astrowatych do domu w szczycie sezonu",
    ],
  },
  ragweed: {
    info: "Ambrozja (Ambrosia artemisiifolia) to inwazyjna roślina z Ameryki Północnej — jeden z najgroźniejszych alergenów w Europie. Nawet 10 ziaren pyłku/m³ wystarcza do wywołania objawów. Zasięg ambrozji w Polsce stale się powiększa, głównie w dolinie Wisły i na południu.",
    tips: [
      "Sezon sierpień–wrzesień — zaplanuj urlop z dala od zachwaszczonych terenów",
      "Reaktywność krzyżowa z bylicą, słonecznikiem i bananem",
      "Ambrozja rośnie na nieużytkach, nasypy kolejowe i pobocza dróg — omijaj je",
      "Stężenia są najwyższe w ciepłe, suche wieczory",
    ],
  },
  nettle: {
    info: "Pokrzywa zwyczajna (Urtica dioica) pyli od maja do września i jest niedocenianym alergenem. Jej pyłek jest drobny i lekki, przenosząc się na duże odległości. Alergia na pokrzywę często mylona jest z alergią na trawy ze względu na nakładający się sezon. Pokrzywa rośnie masowo na terenach wilgotnych, w pobliżu wód i na nieużytkach.",
    tips: [
      "Jeśli objawy trwają przez całe lato (maj–wrzesień), sprawdź czy to nie pokrzywa — jej sezon jest dłuższy niż trawy",
      "Pokrzywa rośnie w wilgotnych miejscach — rowy, brzegi rzek, ogrody — unikaj tych terenów w szczycie sezonu",
      "Stężenia pokrzywy są najwyższe w czerwcu i lipcu, ale pylenie trwa przez cały sezon letni",
      "Ubrania z długimi rękawami chronią przed kontaktem z rośliną i przed osiadaniem pyłku na skórze",
    ],
  },
  plantain: {
    info: "Babka lancetowata (Plantago lanceolata) pyli od maja do września, często współwystępując z trawami. Jej pyłek jest mały i łatwo przenoszony przez wiatr. Babka rośnie na łąkach, polach, przydrożach i w ogrodach — jest jedną z najbardziej pospolitych roślin Polski. Alergia na babkę często diagnozowana jest łącznie z alergią na trawy.",
    tips: [
      "Babka często rośnie razem z trawami — jeśli jesteś uczulony na trawy, sprawdź też babkę",
      "Stężenia pyłku babki są najwyższe w czerwcu i lipcu — w środku letniego sezonu trawiastego",
      "Babka pospolita rośnie wszędzie — łąki, parki, ogrody, pobocza dróg — całkowite unikanie jest trudne",
      "Krótko skoszone trawniki zawierają mniej babki pylącej — dbaj o regularne koszenie ogrodu",
    ],
  },
};

export const CROSS: Record<string, { name: string; slug: string }[]> = {
  alder:    [{ name: "Brzoza", slug: "birch" }, { name: "Leszczyna", slug: "hazel" }],
  birch:    [{ name: "Olcha", slug: "alder" }, { name: "Leszczyna", slug: "hazel" }, { name: "Jabłoń", slug: "apple" }],
  hazel:    [{ name: "Olcha", slug: "alder" }, { name: "Brzoza", slug: "birch" }],
  ash:      [{ name: "Oliwka", slug: "olive" }, { name: "Ligustr", slug: "privet" }],
  oak:      [{ name: "Brzoza", slug: "birch" }],
  mugwort:  [{ name: "Ambrozja", slug: "ragweed" }],
  ragweed:  [{ name: "Bylica", slug: "mugwort" }],
  rye:      [{ name: "Trawy", slug: "grass" }],
  ryegrass: [{ name: "Trawy", slug: "grass" }, { name: "Tymotka", slug: "timothy" }],
  timothy:  [{ name: "Trawy", slug: "grass" }, { name: "Życica", slug: "ryegrass" }],
  grass:    [{ name: "Żyto", slug: "rye" }, { name: "Tymotka", slug: "timothy" }, { name: "Życica", slug: "ryegrass" }],
};
