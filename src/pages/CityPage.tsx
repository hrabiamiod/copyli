import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import CitySearch from "../components/CitySearch";
import type { City, CityPageData } from "../types";
import SEOHead from "../components/SEOHead";
import ShareButton from "../components/ShareButton";
import PollenCard from "../components/PollenCard";
import ForecastChart from "../components/ForecastChart";
import WalkIndexCard from "../components/WalkIndexCard";
import AirQualityCard from "../components/AirQualityCard";
import HistoryChart from "../components/HistoryChart";
import { getCityPageTitle, getCityPageDescription, getCityShareText, getStructuredDataCity } from "../utils/seo";
import StickyMobileCTA from "../components/StickyMobileCTA";

const PollenMap = lazy(() => import("../components/PollenMap"));

export default function CityPage() {
  const { miasto } = useParams<{ miasto: string }>();
  const navigate = useNavigate();
  const [city, setCity] = useState<City | null>(null);
  const [data, setData] = useState<CityPageData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState<unknown[]>([]);

  useEffect(() => {
    if (!miasto) return;
    setLoading(true); setError(false);
    Promise.all([fetch(`/data/cities/${miasto}.json`), fetch("/data/cities.json")])
      .then(async ([dr, cr]) => {
        if (!dr.ok) { setError(true); setLoading(false); return; }
        const [cityData, allCities] = await Promise.all([dr.json(), cr.json()]) as [CityPageData, City[]];
        setCity(allCities.find(c => c.slug === miasto) ?? null);
        setData(cityData); setCities(allCities); setLoading(false);
        fetch(`/data/history/${miasto}.json`)
          .then(r => r.ok ? r.json() : [])
          .then((h: unknown[]) => setHistory(h))
          .catch(() => {});
      }).catch(() => { setError(true); setLoading(false); });
  }, [miasto]);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:36, marginBottom:12 }} className="animate-bounce">🌸</p>
        <p style={{ fontSize:13, color:"var(--ink-3)" }}>Ładowanie danych pyłkowych…</p>
      </div>
    </div>
  );

  if (error || !city || !data) return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:"64px 16px", textAlign:"center" }}>
      <p style={{ fontSize:36, marginBottom:16 }}>🌿</p>
      <h1 style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:700, color:"var(--ink)", marginBottom:8 }}>
        Nie znaleziono miasta
      </h1>
      <p style={{ fontSize:14, color:"var(--ink-2)", marginBottom:24 }}>Sprawdź pisownię lub wróć do mapy.</p>
      <Link to="/" style={{
        display:"inline-block", padding:"9px 22px", borderRadius:999, fontSize:13,
        fontWeight:600, color:"white", background:"var(--forest)", textDecoration:"none",
      }}>Wróć do mapy</Link>
    </div>
  );

  const wx = data.weather;
  const nearbyCities = cities
    .filter(c => c.voivodeship_slug === city.voivodeship_slug && c.slug !== city.slug)
    .sort((a, b) => b.population - a.population).slice(0, 6);
  const updatedAt = data.pollen[0]?.measured_at
    ? new Date(data.pollen[0].measured_at).toLocaleString("pl-PL", { day:"numeric", month:"long", hour:"2-digit", minute:"2-digit" })
    : null;

  return (
    <>
      <SEOHead
        title={getCityPageTitle(city, data.pollen)}
        description={getCityPageDescription(city, data.pollen)}
        canonical={`https://copyli.pl/pylek/${city.slug}`}
        structuredData={getStructuredDataCity(city, data.pollen[0]?.measured_at)}
        ogImage={`https://copyli.pl/og/cities/${city.slug}.png`}
      />

      <div className="pb-28 md:pb-14" style={{ maxWidth:1080, margin:"0 auto", padding:"24px 16px 0" }}>

        {/* Breadcrumb */}
        <nav className="breadcrumb anim-fade-in" style={{ marginBottom:20 }}>
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <Link to={`/pylek/woj/${city.voivodeship_slug}`}>{city.voivodeship_name}</Link>
          <span>›</span>
          <span style={{ color:"var(--ink)", fontWeight:500 }}>{city.name}</span>
        </nav>

        {/* Header */}
        <div className="anim-fade-up" style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:6 }}>
            <h1 style={{
              fontFamily:"var(--font-display)", fontSize:"clamp(26px,4vw,36px)",
              fontWeight:800, letterSpacing:"-0.03em", color:"var(--ink)", margin:0,
            }}>
              Pyłki w <span style={{ color:"var(--forest)" }}>{city.name}</span>
            </h1>
            <ShareButton
              title={`Pyłki w ${city.name} — CoPyli.pl`}
              text={getCityShareText(city, data.pollen)}
              url={`https://copyli.pl/pylek/${city.slug}`}
            />
          </div>
          {updatedAt && <p style={{ fontSize:12, color:"var(--ink-3)" }}>Dane z: {updatedAt}</p>}
          {city.seo_description && (
            <p style={{ fontSize:14, color:"var(--ink-2)", marginTop:8, lineHeight:1.6, maxWidth:640 }}>
              {city.seo_description}
            </p>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px]" style={{ gap:14 }}>

          {/* Left */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Pollen today */}
            <div className="card anim-fade-up delay-1" style={{ padding:"20px 22px" }}>
              <h2 style={{
                fontFamily:"var(--font-display)", fontSize:16, fontWeight:700,
                color:"var(--ink)", margin:"0 0 16px", letterSpacing:"-0.02em",
              }}>Co pyli dziś w {city.name}?</h2>
              <PollenCard data={data.pollen} />
            </div>

            {/* Forecast */}
            {data.forecast.length > 0 && (
              <div className="card anim-fade-up delay-2" style={{ padding:"20px 22px" }}>
                <h2 style={{
                  fontFamily:"var(--font-display)", fontSize:16, fontWeight:700,
                  color:"var(--ink)", margin:"0 0 16px", letterSpacing:"-0.02em",
                }}>Prognoza pyłkowa — 5 dni</h2>
                <ForecastChart forecast={data.forecast} />
              </div>
            )}

            {/* Historia / Trendy sezonowe */}
            {history.length > 0 && (
              <div className="card anim-fade-up delay-3" style={{ padding: "20px 22px" }}>
                <h2 style={{
                  fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
                  color: "var(--ink)", margin: "0 0 4px", letterSpacing: "-0.02em",
                }}>Trendy sezonowe — ostatnie 90 dni</h2>
                <p style={{ fontSize: 12, color: "var(--ink-3)", margin: "0 0 16px" }}>
                  Maksymalne dzienne stężenie pyłków w {city.name}.
                </p>
                <HistoryChart history={history as Parameters<typeof HistoryChart>[0]["history"]} />
              </div>
            )}

            {/* FAQ per miasto */}
            <div className="card anim-fade-up delay-3" style={{ padding:"20px 22px" }}>
              <h2 style={{
                fontFamily:"var(--font-display)", fontSize:16, fontWeight:700,
                color:"var(--ink)", margin:"0 0 16px", letterSpacing:"-0.02em",
              }}>
                Najczęstsze pytania — pyłki w {city.name}
              </h2>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  {
                    q: `Co pyli dziś w ${city.name}?`,
                    a: data.pollen.filter(p => p.level !== "none").length > 0
                      ? `Dziś w ${city.name} pylą: ${data.pollen.filter(p => p.level !== "none").slice(0,3).map(p => `${p.plant_name} (${p.level === "very_high" ? "bardzo wysokie" : p.level === "high" ? "wysokie" : p.level === "medium" ? "średnie" : "niskie"})`).join(", ")}.`
                      : `Aktualnie stężenie pyłków w ${city.name} jest niskie lub nie ma aktywnych alergenów.`,
                  },
                  {
                    q: `Kiedy jest sezon pyłkowy w ${city.name}?`,
                    a: `Sezon pyłkowy w ${city.name} (${city.voivodeship_name}) trwa od lutego do października. Najwcześniej pylą olcha i leszczyna (luty–marzec), następnie brzoza i jesion (kwiecień–maj), trawy (maj–wrzesień) oraz chwasty jak bylica i ambrozja (lipiec–październik).`,
                  },
                  {
                    q: `Skąd pochodzą dane pyłkowe dla ${city.name}?`,
                    a: `Dane dla ${city.name} pochodzą z Open-Meteo Air Quality API i są aktualizowane co 2 godziny.`,
                  },
                ].map(({ q, a }) => (
                  <details key={q} className="faq-item">
                    <summary style={{ fontSize:14 }}>
                      {q}
                      <span className="faq-chevron">▾</span>
                    </summary>
                    <div className="faq-body" style={{ fontSize:13 }}>{a}</div>
                  </details>
                ))}
              </div>
            </div>

            {/* Mini map */}
            <div className="anim-fade-up delay-3">
              <p className="label" style={{ marginBottom:8 }}>Mapa — {city.name} i okolice</p>
              <div style={{
                height:220, borderRadius:"var(--r-md)",
                overflow:"hidden", boxShadow:"var(--s-card)",
              }}>
                <Suspense fallback={
                  <div style={{ width:"100%", height:"100%", background:"var(--cream-dark)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <p style={{ fontSize:13, color:"var(--ink-3)" }}>Ładowanie mapy…</p>
                  </div>
                }>
                  <PollenMap cities={cities} mapData={[]} highlightCitySlug={city.slug} compact />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Right sidebar — order-first na mobile: Walk/AQI pojawia sie przed Pollen */}
          <div className="order-first md:order-none" style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {wx?.score != null && (
              <div className="anim-slide-r delay-1">
                <WalkIndexCard score={wx.score} recommendation={wx.recommendation} best_time={wx.best_time} reason={wx.reason} />
              </div>
            )}

            {wx?.aqi != null && (
              <div className="anim-slide-r delay-2">
                <AirQualityCard aqi={wx.aqi} aqi_label={wx.aqi_label} temperature={wx.temperature} humidity={wx.humidity} wind_speed={wx.wind_speed} precipitation={wx.precipitation} />
              </div>
            )}

            {/* Porównaj z innym miastem */}
            <div className="card anim-slide-r delay-3" style={{ padding:"16px 18px" }}>
              <p className="label" style={{ marginBottom:10 }}>Porównaj z innym miastem</p>
              <CitySearch
                compact
                onSelect={c => navigate(`/porownaj/${city.slug}/${c.slug}`)}
              />
              {nearbyCities.length > 0 && (
                <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(24,24,15,0.07)", display:"flex", flexDirection:"column", gap:2 }}>
                  {nearbyCities.slice(0, 3).map(c => (
                    <Link
                      key={c.slug}
                      to={`/porownaj/${city.slug}/${c.slug}`}
                      style={{ fontSize:12, color:"var(--ink-2)", textDecoration:"none", padding:"4px 6px", borderRadius:"var(--r-xs)", transition:"color 0.12s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--forest)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-2)")}
                    >
                      {city.name} vs {c.name} →
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {nearbyCities.length > 0 && (
              <div className="card anim-slide-r delay-3" style={{ padding:"16px 18px" }}>
                <p className="label" style={{ marginBottom:12 }}>Inne miasta — {city.voivodeship_name}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                  {nearbyCities.map(c => (
                    <Link
                      key={c.slug} to={`/pylek/${c.slug}`}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"8px 10px", borderRadius:"var(--r-xs)",
                        fontSize:13, fontWeight:500, color:"var(--ink)", textDecoration:"none",
                        transition:"background 0.12s, color 0.12s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--forest-soft)"; (e.currentTarget as HTMLElement).style.color = "var(--forest)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
                    >
                      {c.name}
                      <span style={{ fontSize:10, color:"var(--ink-3)" }}>›</span>
                    </Link>
                  ))}
                </div>
                <Link
                  to={`/pylek/woj/${city.voivodeship_slug}`}
                  style={{
                    display:"block", marginTop:10, paddingTop:10,
                    borderTop:"1px solid rgba(24,24,15,0.07)",
                    fontSize:12, fontWeight:500, textAlign:"center",
                    color:"var(--ink-2)", textDecoration:"none",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--forest-mid)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-2)")}
                >
                  Wszystkie miasta →
                </Link>
              </div>
            )}
          <div className="card anim-slide-r delay-3" style={{ padding:"16px 18px" }}>
            <p className="label" style={{ marginBottom:12 }}>Porady dla alergików</p>
            <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
              {[
                { to:"/porady/alergia-na-pylek", label:"Alergia na pyłki — poradnik" },
                { to:"/porady/reaktywnosc-krzyzowa", label:"Reaktywność krzyżowa" },
                { to:"/porady/sezon-pylkowy-2026", label:"Sezon pyłkowy 2026" },
                { to:"/kalendarz-pylenia", label:"Kalendarz pylenia" },
              ].map(({ to, label }) => (
                <Link
                  key={to} to={to}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"7px 10px", borderRadius:"var(--r-xs)",
                    fontSize:13, color:"var(--ink-2)", textDecoration:"none",
                    transition:"background 0.12s, color 0.12s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--forest-soft)"; (e.currentTarget as HTMLElement).style.color = "var(--forest)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "var(--ink-2)"; }}
                >
                  {label}
                  <span style={{ fontSize:10, color:"var(--ink-3)" }}>›</span>
                </Link>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>
      <StickyMobileCTA />
    </>
  );
}
