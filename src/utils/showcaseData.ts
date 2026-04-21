import type { PollenLevel } from "../types";

// Demo-dane dla trybu prezentacji — rozłożone estetycznie po mapie Polski
// południe/centrum → czerwone, północ/wschód → zielone
export const SHOWCASE_CITY_LEVELS: Record<string, PollenLevel> = {
  // Śląsk — bardzo wysokie
  "katowice": "very_high",
  "sosnowiec": "very_high",
  "gliwice": "very_high",
  "zabrze": "very_high",
  "bytom": "very_high",
  "rybnik": "very_high",
  "tychy": "very_high",
  "dabrowa-gornicza": "very_high",
  "ruda-slaska": "very_high",
  "chorzow": "very_high",
  "jaworzno": "very_high",
  "jastrzebie-zdroj": "very_high",
  "myslowice": "very_high",
  "siemianowice-slaskie": "very_high",
  "bedzin": "very_high",
  "knurow": "very_high",
  "oswiecim": "very_high",
  "tarnowskie-gory": "high",
  "wodzislaw-slaski": "high",
  "raciborz": "high",
  "kedzierzyn-kozle": "high",
  "zawiercie": "high",
  "zory": "high",
  "piekary-slaskie": "high",
  "swietochlowice": "high",
  "mikolow": "high",
  "bielsko-biala": "very_high",
  "czestochowa": "high",

  // Małopolska
  "krakow": "very_high",
  "tarnow": "very_high",
  "nowy-sacz": "high",
  "mielec": "high",
  "debica": "high",

  // Podkarpacie
  "rzeszow": "high",
  "przemysl": "high",
  "krosno": "high",
  "jaroslaw": "high",
  "stalowa-wola": "medium",
  "tarnobrzeg": "medium",

  // Dolny Śląsk
  "wroclaw": "high",
  "walbrzych": "high",
  "legnica": "high",
  "jelenia-gora": "high",
  "lubin": "medium",
  "glogow": "medium",
  "swidnica": "high",
  "nowa-sol": "medium",
  "nysa": "medium",
  "zielona-gora": "medium",

  // Mazowsze
  "warszawa": "high",
  "radom": "high",
  "plock": "medium",
  "siedlce": "medium",
  "ostroleka": "medium",
  "pruszkow": "high",
  "legionowo": "medium",
  "piaseczno": "high",
  "otwock": "medium",
  "wolomin": "medium",
  "zabki": "high",
  "marki": "medium",
  "biala-podlaska": "low",
  "ciechanow": "medium",
  "minsk-mazowiecki": "medium",
  "zyrardow": "medium",
  "grudziadz": "medium",
  "kwidzyn": "low",
  "kutno": "medium",
  "starogard-gdanski": "low",
  "wloclawek": "medium",

  // Łódź i region
  "lodz": "high",
  "piotrkow-trybunalski": "medium",
  "pabianice": "medium",
  "zgierz": "medium",
  "skierniewice": "low",
  "tomaszow-mazowiecki": "medium",
  "radomsko": "medium",
  "belchatow": "medium",
  "kalisz": "medium",
  "sieradz": "medium",
  "zdunska-wola": "medium",
  "skarzysko-kamienna": "medium",
  "starachowice": "medium",

  // Lubelskie
  "lublin": "high",
  "zamosc": "medium",
  "chelm": "medium",
  "pulawy": "medium",
  "swidnik": "medium",
  "ostrowiec-swietokrzyski": "medium",

  // Świętokrzyskie
  "kielce": "medium",

  // Wielkopolska
  "poznan": "medium",
  "gniezno": "low",
  "leszno": "low",
  "konin": "medium",
  "ostrow-wielkopolski": "low",
  "inowroclaw": "low",

  // Bydgoszcz/Toruń
  "bydgoszcz": "medium",
  "torun": "low",

  // Opolskie
  "opole": "medium",

  // Lubuskie
  "gorzow-wielkopolski": "low",

  // Pomorze
  "gdansk": "low",
  "gdynia": "low",
  "slupsk": "low",
  "koszalin": "low",
  "kolobrzeg": "none",
  "tczew": "low",
  "malbork": "low",
  "rumia": "low",
  "wejherowo": "low",
  "chojnice": "low",
  "swinoujscie": "none",
  "stargard": "low",
  "szczecin": "low",
  "szczecinek": "none",

  // Warmia i Mazury
  "olsztyn": "low",
  "elblag": "low",

  // Podlaskie
  "bialystok": "low",
  "lomza": "low",
  "suwalki": "none",
  "elk": "none",
};
