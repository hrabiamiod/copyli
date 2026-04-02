import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import type { Plant, MapData, PollenLevel } from "../types";
import SEOHead from "../components/SEOHead";
import PollenBadge from "../components/PollenBadge";
import { CATEGORY_LABELS, LEVEL_COLORS, CATEGORY_ICONS } from "../utils/pollen";

const MONTHS = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];
const LEVEL_ORDER: PollenLevel[] = ["none", "low", "medium", "high", "very_high"];

// Reaktywność krzyżowa — slug → lista powiązanych roślin
const CROSS: Record<string, { name: string; slug: string }[]> = {
  alder:   [{ name: "Brzoza", slug: "birch" }, { name: "Leszczyna", slug: "hazel" }],
  birch:   [{ name: "Olcha", slug: "alder" }, { name: "Leszczyna", slug: "hazel" }, { name: "Jabłoń", slug: "apple" }],
  hazel:   [{ name: "Olcha", slug: "alder" }, { name: "Brzoza", slug: "birch" }],
  mugwort: [{ name: "Ambrozja", slug: "ragweed" }],
  ragweed: [{ name: "Bylica", slug: "mugwort" }],
  rye:     [{ name: "Trawy", slug: "grass" }],
  grass:   [{ name: "Żyto", slug: "rye" }],
};

// Statyczne opisy i wskazówki per roślina
const PLANT_INFO: Record<string, { info: string; tips: string[] }> = {
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
    info: "Leszczyna to najwcześniejszy alergen w Polsce — może pylić już w januarym w ciepłe zimy, szczególnie na południu kraju. Jej pyłek, choć mniej alergizujący niż pyłek brzozy, często otwiera sezon i uwrażliwia układ odpornościowy.",
    tips: [
      "Monitoruj prognozy od stycznia — w ciepłe zimy stężenia mogą być zaskakująco wysokie",
      "Reaktywność krzyżowa z brzozą i olchą",
      "Leszczyna rośnie m.in. na skrajach lasów i w ogrodach — unikaj tych miejsc wczesną wiosną",
    ],
  },
  grass: {
    info: "Alergia na trawy to najczęstsza alergia pyłkowa w Polsce — dotyczy ok. 30% alergików. Sezon jest długi (maj–wrzesień) z wyraźnym szczytem w czerwcu i lipcu. Główne alergeny to tymotka, kupkówka i życica.",
    tips: [
      "Unikaj przebywania na łąkach i polach w południe — stężenia są wtedy najwyższe",
      "Po powrocie z zewnątrz koszula się i myj włosy — pyłek mocno osiada na włosach",
      "Kośmy trawnik przed zakwitnięciem — krótkie trawy pylą mniej",
      "Leki antyhistaminowe zacznij brać 1–2 tygodnie przed spodziewanym szczytem",
    ],
  },
  ragweed: {
    info: "Ambrozja (Ambrosia artemisiifolia) to inwazyjna roślina z Ameryki Północnej — jeden z najgroźniejszych alergenów w Europie. Nawet 10 ziaren pyłku/m³ wystarcza do wywołania objawów. Zasięg ambrozji w Polsce stale się powiększa, głównie w dolinie Wisły i na południu.",
    tips: [
      "Sezon sierpień–wrzesień — zaplanuj urlop z dala od zachwaszczonych terenów",
      "Reaktywność krzyżowa z bylic ą, słonecznikiem i bananem",
      "Ambrozja rośnie na nieużytkach, nasypy kolejowe i pobocza dróg — omijaj je",
      "Stężenia są najwyższe w ciepłe, suche wieczory",
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
};

export default function PlantPage() {
  const { roslina } = useParams<{ roslina: string }>();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [mapData, setMapData] = useState<MapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/plants.json").then(r => r.json()),
      fetch("/data/map-data.json").then(r => r.json()),
    ]).then(([p, m]) => { setPlants(p); setMapData(m); setLoading(false); });
  }, []);

  const plant = plants.find(p => p.slug === roslina);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
      <p style={{ fontSize: 13, color: "var(--ink-3)" }}>Ładowanie…</p>
    </div>
  );

  if (!plant) return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "64px 16px", textAlign: "center" }}>
      <p style={{ fontSize: 36, marginBottom: 16 }}>🌿</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
        Roślina nie znaleziona
      </h1>
      <Link to="/kalendarz-pylenia" style={{ color: "var(--forest)", fontWeight: 600, textDecoration: "underline" }}>
        Zobacz kalendarz pylenia →
      </Link>
    </div>
  );

  // Dane dla tej rośliny per województwo
  const plantVoivData = mapData
    .filter(d => d.plant_slug === roslina)
    .sort((a, b) => LEVEL_ORDER.indexOf(b.max_level) - LEVEL_ORDER.indexOf(a.max_level));

  // Aktualny dominujący poziom w Polsce
  const peakMonths: number[] = plant.peak_months ? JSON.parse(plant.peak_months) : [];
  const currentMonth = new Date().getMonth() + 1;
  const isInSeason = plant.month_start && plant.month_end
    ? (plant.month_start <= plant.month_end
      ? currentMonth >= plant.month_start && currentMonth <= plant.month_end
      : currentMonth >= plant.month_start || currentMonth <= plant.month_end)
    : false;

  const overallLevel: PollenLevel = plantVoivData.length > 0
    ? plantVoivData[0].max_level
    : "none";

  const info = PLANT_INFO[roslina ?? ""];
  const crossReact = CROSS[roslina ?? ""] ?? [];

  // Inne rośliny w tej samej kategorii
  const relatedPlants = plants.filter(p => p.category === plant.category && p.slug !== plant.slug);

  const title = `${plant.name_pl} — kiedy pyli, alergia, stężenie pyłków | CoPyli.pl`;
  const description = `Kiedy pyli ${plant.name_pl} (${plant.name_latin}) w Polsce? Sezon pylenia, aktualne stężenia w województwach, reaktywność krzyżowa i wskazówki dla alergików.`;

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonical={`https://copyli.pl/pylek/roslina/${roslina}`}
      />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px 56px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Breadcrumb */}
        <nav className="breadcrumb anim-fade-in">
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <Link to="/kalendarz-pylenia">Kalendarz pylenia</Link>
          <span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{plant.name_pl}</span>
        </nav>

        {/* Header */}
        <div className="anim-fade-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "var(--r-md)",
              background: "var(--surface)", border: "1px solid var(--cream-dark)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, flexShrink: 0,
            }}>
              {plant.icon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
                  color: "var(--forest)", background: "rgba(27,67,50,0.08)", borderRadius: 6, padding: "2px 8px",
                }}>
                  {CATEGORY_ICONS[plant.category]} {CATEGORY_LABELS[plant.category]}
                </span>
                {isInSeason && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "var(--gold)",
                    background: "var(--gold-soft)", borderRadius: 6, padding: "2px 8px",
                  }}>
                    Sezon aktywny
                  </span>
                )}
              </div>
              <h1 style={{
                fontFamily: "var(--font-display)", fontSize: "clamp(22px, 4vw, 30px)",
                fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)", margin: "0 0 2px",
              }}>
                {plant.name_pl}
              </h1>
              <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink-3)", margin: 0 }}>
                {plant.name_latin}
              </p>
            </div>
          </div>
          <div style={{ marginTop: 4, flexShrink: 0 }}>
            <PollenBadge level={overallLevel} size="lg" />
          </div>
        </div>

        {/* Sezon pylenia — 12-miesięczny strip */}
        <div className="card anim-fade-up delay-1" style={{ padding: "18px 20px" }}>
          <p className="label" style={{ marginBottom: 12 }}>Sezon pylenia w Polsce</p>
          <div style={{ display: "flex", gap: 3 }}>
            {MONTHS.map((m, i) => {
              const month = i + 1;
              const inRange = plant.month_start && plant.month_end
                ? (plant.month_start <= plant.month_end
                  ? month >= plant.month_start && month <= plant.month_end
                  : month >= plant.month_start || month <= plant.month_end)
                : false;
              const isPeak = peakMonths.includes(month);
              const isCurrent = month === currentMonth;
              return (
                <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%", height: 28, borderRadius: 5,
                    background: !inRange ? "var(--cream-dark)"
                      : isPeak ? "#1B4332"
                      : "rgba(27,67,50,0.25)",
                    outline: isCurrent ? "2px solid var(--gold)" : "none",
                    outlineOffset: 1,
                  }} />
                  <span style={{
                    fontSize: 9, fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? "var(--forest)" : "var(--ink-3)",
                    letterSpacing: "0.02em",
                  }}>
                    {m}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: "var(--ink-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 8, borderRadius: 2, background: "#1B4332" }} />
              <span>Szczyt pylenia</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 8, borderRadius: 2, background: "rgba(27,67,50,0.25)" }} />
              <span>Pylenie</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 8, borderRadius: 2, background: "var(--cream-dark)" }} />
              <span>Brak</span>
            </div>
          </div>
        </div>

        {/* Aktualne stężenia w województwach */}
        {plantVoivData.length > 0 && (
          <div className="anim-fade-up delay-2">
            <p className="label" style={{ marginBottom: 12 }}>Aktualne stężenie w województwach</p>
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 8 }}>
              {plantVoivData.map(d => (
                <Link
                  key={d.voivodeship_slug}
                  to={`/pylek/woj/${d.voivodeship_slug}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 8, padding: "10px 14px",
                    background: "var(--surface)", border: "1px solid var(--cream-dark)",
                    borderRadius: "var(--r-md)", textDecoration: "none",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(27,67,50,0.25)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--cream-dark)")}
                >
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>
                    {d.voivodeship_name}
                  </span>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                    background: LEVEL_COLORS[d.max_level],
                    border: "1px solid rgba(0,0,0,0.1)",
                  }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Opis + wskazówki */}
        {info && (
          <div className="anim-fade-up delay-2" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card" style={{ padding: "18px 20px" }}>
              <p className="label" style={{ marginBottom: 10 }}>O roślinie</p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
                {info.info}
              </p>
            </div>
            <div className="card" style={{ padding: "18px 20px" }}>
              <p className="label" style={{ marginBottom: 12 }}>Wskazówki dla alergika</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {info.tips.map((tip, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%", background: "rgba(27,67,50,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "var(--forest)", flexShrink: 0, marginTop: 1,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-2)" }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Reaktywność krzyżowa */}
        {crossReact.length > 0 && (
          <div className="anim-fade-up delay-3">
            <p className="label" style={{ marginBottom: 10 }}>Reaktywność krzyżowa</p>
            <div style={{
              background: "rgba(201,144,58,0.07)", border: "1px solid rgba(201,144,58,0.2)",
              borderRadius: "var(--r-md)", padding: "14px 18px",
            }}>
              <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 10 }}>
                Alergia na <strong>{plant.name_pl}</strong> może powodować reakcje krzyżowe z:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {crossReact.map(cr => {
                  const relPlant = plants.find(p => p.slug === cr.slug);
                  return relPlant ? (
                    <Link
                      key={cr.slug}
                      to={`/pylek/roslina/${cr.slug}`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "5px 12px", borderRadius: 999, textDecoration: "none",
                        background: "var(--surface)", border: "1px solid var(--cream-dark)",
                        fontSize: 12, fontWeight: 500, color: "var(--ink)",
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(27,67,50,0.3)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--cream-dark)")}
                    >
                      {relPlant.icon} {relPlant.name_pl}
                    </Link>
                  ) : (
                    <span key={cr.slug} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "5px 12px", borderRadius: 999,
                      background: "var(--surface)", border: "1px solid var(--cream-dark)",
                      fontSize: 12, fontWeight: 500, color: "var(--ink-2)",
                    }}>
                      {cr.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Inne rośliny w tej kategorii */}
        {relatedPlants.length > 0 && (
          <div className="anim-fade-up delay-3">
            <p className="label" style={{ marginBottom: 10 }}>
              Inne {CATEGORY_LABELS[plant.category].toLowerCase()} pylące w Polsce
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {relatedPlants.map(p => (
                <Link
                  key={p.slug}
                  to={`/pylek/roslina/${p.slug}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 999, textDecoration: "none",
                    background: "var(--surface)", border: "1px solid var(--cream-dark)",
                    fontSize: 12, fontWeight: 500, color: "var(--ink)",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(27,67,50,0.3)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--cream-dark)")}
                >
                  {p.icon} {p.name_pl}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Link do kalendarza */}
        <div className="anim-fade-up delay-3">
          <Link
            to="/kalendarz-pylenia"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 20px", borderRadius: 999,
              background: "var(--forest)", color: "#fff",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            📅 Zobacz pełny kalendarz pylenia
          </Link>
        </div>

      </div>
    </>
  );
}
