import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import CitySearch from "../components/CitySearch";
import type { City, CityPageData } from "../types";
import SEOHead from "../components/SEOHead";
import PollenCard from "../components/PollenCard";
import ForecastChart from "../components/ForecastChart";
import WalkIndexCard from "../components/WalkIndexCard";
import AirQualityCard from "../components/AirQualityCard";
import { getCityPageTitle, getCityPageDescription, getStructuredDataCity } from "../utils/seo";

const PollenMap = lazy(() => import("../components/PollenMap"));

export default function CityPage() {
  const { miasto } = useParams<{ miasto: string }>();
  const navigate = useNavigate();
  const [city, setCity] = useState<City | null>(null);
  const [data, setData] = useState<CityPageData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!miasto) return;
    setLoading(true); setError(false);
    Promise.all([fetch(`/data/cities/${miasto}.json`), fetch("/data/cities.json")])
      .then(async ([dr, cr]) => {
        if (!dr.ok) { setError(true); setLoading(false); return; }
        const [cityData, allCities] = await Promise.all([dr.json(), cr.json()]) as [CityPageData, City[]];
        setCity(allCities.find(c => c.slug === miasto) ?? null);
        setData(cityData); setCities(allCities); setLoading(false);
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
        structuredData={getStructuredDataCity(city)}
      />

      <div style={{ maxWidth:1080, margin:"0 auto", padding:"24px 16px 56px" }}>

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
          <h1 style={{
            fontFamily:"var(--font-display)", fontSize:"clamp(26px,4vw,36px)",
            fontWeight:800, letterSpacing:"-0.03em", color:"var(--ink)", margin:"0 0 6px",
          }}>
            Pyłki w <span style={{ color:"var(--forest)" }}>{city.name}</span>
          </h1>
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

          {/* Right sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

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
          </div>
        </div>
      </div>
    </>
  );
}
