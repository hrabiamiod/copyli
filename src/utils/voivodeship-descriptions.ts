interface VoivodeshipInfo {
  description: string;
  dominantPlants: string;
  season: string;
}

const VOIVODESHIP_INFO: Record<string, VoivodeshipInfo> = {
  "dolnoslaskie": {
    description: "Dolny Śląsk to region o urozmaiconej rzeźbie terenu — od Sudetów po nizinne doliny Odry i Nysy Łużyckiej. Bogactwo lasów bukowych, świerkowych i dębowych sprawia, że sezon pyłkowy jest tu rozłożony od wczesnej wiosny do późnego lata. W dolinach rzecznych dominują olcha i wierzba, które pylą już w lutym i marcu.",
    dominantPlants: "Olcha, leszczyna, brzoza, buk, trawy łąkowe",
    season: "Luty–sierpień",
  },
  "kujawsko-pomorskie": {
    description: "Kujawy i Pomorze to jeden z największych regionów rolniczych Polski. Rozległe pola uprawne zbóż, rzepaku i traw sprawiają, że alergicy na pyłki traw należą tu do grupy szczególnie narażonej. Sezon pylenia traw trwa od maja do końca lipca. Wczesną wiosną groźne są leszczyna i olcha rosnące wzdłuż rzek.",
    dominantPlants: "Trawy, żyto, rzepak, leszczyna, olcha",
    season: "Luty–lipiec",
  },
  "lubelskie": {
    description: "Lubelszczyzna jest jednym z polskich regionów najsilniej dotkniętych pyleniem ambrozji — rośliny inwazyjnej, która masowo zadomowiła się na polach i ugorach wschodniej Polski. Sierpień i wrzesień to czas najwyższych stężeń ambrozji. Wiosną dominują pyłki drzew — brzozy i dębu, a latem obficie pylą trawy i bylica.",
    dominantPlants: "Ambrozja, bylica, brzoza, trawy, dąb",
    season: "Marzec–wrzesień",
  },
  "lubuskie": {
    description: "Województwo lubuskie to zielone płuca zachodniej Polski — lasy iglaste pokrywają ponad połowę powierzchni regionu. Sosna, świerk i modrzew pylą tu intensywnie w maju i czerwcu, tworząc żółte warstwy pyłku na powierzchni wód. Wzdłuż Odry i Warty rosną alergizujące olchy i wierzby.",
    dominantPlants: "Sosna, brzoza, olcha, trawy",
    season: "Marzec–lipiec",
  },
  "lodzkie": {
    description: "Centralna Polska, z Łodzią jako metropolitalnym centrum, łączy cechy klimatu kontynentalnego z mozaiką pól, łąk i lasów. Trawy łąkowe to dominujący alergen w sezonie letnim. Agresywna bylica pospolita pylić zaczyna od lipca i stanowi poważne zagrożenie dla alergików przez całe lato i wczesną jesień.",
    dominantPlants: "Trawy, brzoza, bylica, babka lancetowata",
    season: "Marzec–wrzesień",
  },
  "malopolskie": {
    description: "Małopolska obejmuje Tatry, Beskidy i Wyżynę Krakowsko-Częstochowską. Wysokość terenu opóźnia tutejszy sezon pyłkowy — w górach pylenie brzóz i traw przypada na maj, a nie na kwiecień jak na nizinach. Alergicy jadący w Tatry w czerwcu powinni uważać na pyłki traw alpejskich i gorczycy.",
    dominantPlants: "Brzoza, trawy, kosodrzewina, bylica",
    season: "Kwiecień–sierpień",
  },
  "mazowieckie": {
    description: "Mazowsze z Warszawą to największe województwo Polski. Rozległe lasy mazowieckie — sosnowe, brzozowe i dębowe — są źródłem pyłków od wczesnej wiosny. Wielkomiejskie parki i aleje brzozy powodują, że w Warszawie stężenia pyłków brzozowych w kwietniu mogą być jednymi z najwyższych w kraju.",
    dominantPlants: "Brzoza, sosna, trawy, bylica, leszczyna",
    season: "Luty–wrzesień",
  },
  "opolskie": {
    description: "Opolszczyzna to żyzna kraina rolnicza na południu Polski. Intensywna uprawa zbóż i rzepaku sprawia, że sezon pyłkowy traw i zbóż jest tu wyjątkowo intensywny. Żyzne doliny Odry pokryte są roślinnością zielną, w tym bylicą i pokrzywą, które pylą od połowy lata.",
    dominantPlants: "Trawy, żyto, rzepak, bylica, brzoza",
    season: "Marzec–sierpień",
  },
  "podkarpackie": {
    description: "Podkarpacie to region pogranicza — od Pogórza Karpackiego po Bieszczady. Mieszane lasy jodłowe i bukowe pylą intensywnie wiosną. Kotliny i doliny rzek sprzyjają kumulowaniu się pyłków, co szczególnie odczuwają alergicy w Rzeszowie i Przemyślu. Sezon pyłkowy jest tu przesunięty w stosunku do nizin o 1-2 tygodnie.",
    dominantPlants: "Buk, jodła, brzoza, trawy, bylica",
    season: "Kwiecień–sierpień",
  },
  "podlaskie": {
    description: "Podlasie to kraina mokradeł, łąk i rozległych kompleksów leśnych Puszczy Białowieskiej i Knyszyńskiej. Olcha i wierzba rosnące wzdłuż rzek i bagien pylą już w lutym i marcu, gdy inne rośliny jeszcze śpią. Rozległe łąki Narwi i Biebrzy to z kolei jedno z najsilniejszych źródeł pyłków traw w Polsce.",
    dominantPlants: "Olcha, wierzba, trawy łąkowe, brzoza, leszczyna",
    season: "Luty–sierpień",
  },
  "pomorskie": {
    description: "Pomorze Gdańskie łączy wybrzeże Bałtyku z Pojezierzem Kaszubskim. Morski klimat łagodzi sezony pyłkowe — wiatr znad Bałtyku 'rozcieńcza' stężenia, ale może też zawiewać pyłki z daleka. Sosnowe lasy Trójmiejskiego Parku Krajobrazowego intensywnie pylą w maju. Alergicy na trawy powinni uważać na kaszubskie łąki w czerwcu i lipcu.",
    dominantPlants: "Sosna, brzoza, trawy, leszczyna",
    season: "Marzec–lipiec",
  },
  "slaskie": {
    description: "Śląsk to region o największym zurbanizowaniu w Polsce — Górnośląski Okręg Przemysłowy łączy się z aglomeracją katowicką. Paradoksalnie, parki miejskie i zieleń towarzysząca drogom to główne źródła pyłków w tym regionie. Beskidy Śląskie, jak całe Karpaty, opóźniają sezony pyłkowe o kilka tygodni w stosunku do nizin.",
    dominantPlants: "Brzoza, trawy, bylica, topola, leszczyna",
    season: "Marzec–wrzesień",
  },
  "swietokrzyskie": {
    description: "Świętokrzyskie z prastarymi Górami Świętokrzyskimi i rozległymi kompleksami jodłowo-bukowymi to jeden z najmniej zurbanizowanych regionów. Pyłki drzew liściastych — dębu, grabu i lipy — pylą intensywnie od maja. Kieleckie wzgórza pokryte są murawami kserotermicznymi bogatymi w trawę i bylicę.",
    dominantPlants: "Dąb, jodła, brzoza, trawy, bylica",
    season: "Marzec–sierpień",
  },
  "warminsko-mazurskie": {
    description: "Warmia i Mazury to kraina tysiąca jezior, gdzie lasy brzozowe i olchowe są nieodłącznym elementem krajobrazu. Olchy rosnące przy jeziorach i rzekach pylą intensywnie już w lutym, często gdy jeszcze leży śnieg. Brzoza na Mazurach pyli w drugiej połowie kwietnia — nierzadko przy silnym wietrze stężenia mogą być bardzo wysokie.",
    dominantPlants: "Olcha, brzoza, sosna, trawy, leszczyna",
    season: "Luty–lipiec",
  },
  "wielkopolskie": {
    description: "Wielkopolska to rolnicze serce Polski — rozległe pola, sady i łąki tworzą idealne warunki dla pylenia traw i zbóż. Poznań i okolice należą do regionów o najdłuższym sezonie pylenia w Polsce. Warto zaznaczyć, że region ma też duże obszary piaszczystych borów sosnowych, które intensywnie pylą w maju.",
    dominantPlants: "Trawy, żyto, brzoza, sosna, bylica",
    season: "Luty–wrzesień",
  },
  "zachodniopomorskie": {
    description: "Zachodniopomorskie to region Pobrzeża Bałtyckiego i Pojezierza Zachodniopomorskiego. Nadmorski klimat z silnymi wiatrami zachodnimi wywiera duży wpływ na stężenia pyłków — w dni z wiatrem od morza stężenia są niższe, ale wschodni wiatr może nanosić pyłki ze Szwecji i Niemiec. Bogate lasy mieszane pylą intensywnie od marca do czerwca.",
    dominantPlants: "Sosna, brzoza, olcha, trawy, leszczyna",
    season: "Luty–lipiec",
  },
};

export function getVoivodeshipInfo(slug: string): VoivodeshipInfo {
  return VOIVODESHIP_INFO[slug] ?? {
    description: "Aktualne stężenia pyłków roślin dla tego województwa. Dane aktualizowane co 2 godziny.",
    dominantPlants: "Brzoza, trawy, bylica",
    season: "Marzec–sierpień",
  };
}
