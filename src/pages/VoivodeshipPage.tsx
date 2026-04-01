import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { City, MapData } from "../types";
import SEOHead from "../components/SEOHead";
import PollenBadge from "../components/PollenBadge";
import { getVoivodeshipLevel } from "../utils/pollen";
import { getVoivodeshipPageTitle, getVoivodeshipPageDescription } from "../utils/seo";

export default function VoivodeshipPage() {
  const { wojewodztwo } = useParams<{ wojewodztwo: string }>();
  const [cities, setCities] = useState<City[]>([]);
  const [mapData, setMapData] = useState<MapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/cities.json").then(r => r.json()),
      fetch("/data/map-data.json").then(r => r.json()),
    ]).then(([c, m]) => { setCities(c); setMapData(m); setLoading(false); });
  }, []);

  const voivCities = cities.filter(c => c.voivodeship_slug === wojewodztwo).sort((a,b) => b.population - a.population);
  const voivName = voivCities[0]?.voivodeship_name ?? "";
  const level = getVoivodeshipLevel(mapData, wojewodztwo ?? "");

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"40vh" }}>
      <p style={{ fontSize:13, color:"var(--ink-3)" }}>Ładowanie…</p>
    </div>
  );

  return (
    <>
      <SEOHead
        title={getVoivodeshipPageTitle(voivName)}
        description={getVoivodeshipPageDescription(voivName)}
        canonical={`https://copyli.pl/pylek/woj/${wojewodztwo}`}
      />

      <div style={{ maxWidth:860, margin:"0 auto", padding:"24px 16px 56px", display:"flex", flexDirection:"column", gap:24 }}>

        <nav className="breadcrumb anim-fade-in">
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <span style={{ color:"var(--ink)", fontWeight:500 }}>{voivName}</span>
        </nav>

        <div className="anim-fade-up" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
          <div>
            <h1 style={{
              fontFamily:"var(--font-display)", fontSize:"clamp(24px,4vw,32px)",
              fontWeight:800, letterSpacing:"-0.03em", color:"var(--ink)", margin:"0 0 6px",
            }}>
              Pyłki w województwie<br />
              <span style={{ color:"var(--forest)" }}>{voivName}</span>
            </h1>
            <p style={{ fontSize:13, color:"var(--ink-3)", margin:0 }}>
              {voivCities.length} miast · dane aktualizowane co 2 godziny
            </p>
          </div>
          <div style={{ marginTop:4, flexShrink:0 }}>
            <PollenBadge level={level} size="lg" />
          </div>
        </div>

        <div className="anim-fade-up delay-1">
          <p className="label" style={{ marginBottom:12 }}>Miasta w województwie {voivName}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap:8 }}>
            {voivCities.map((city, i) => (
              <Link
                key={city.slug}
                to={`/pylek/${city.slug}`}
                className="city-card anim-fade-up"
                style={{ animationDelay:`${i * 0.02}s` }}
              >
                <p style={{ fontSize:13, fontWeight:600, color:"var(--ink)", margin:0 }}>{city.name}</p>
                {city.population > 0 && (
                  <p style={{ fontSize:11, color:"var(--ink-3)", margin:"2px 0 0" }}>
                    {city.population.toLocaleString("pl-PL")} mieszk.
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div
          className="anim-fade-up delay-2"
          style={{
            background:"rgba(27,67,50,0.07)",
            border:"1px solid rgba(27,67,50,0.12)",
            borderRadius:"var(--r-md)",
            padding:"14px 18px",
            fontSize:13,
            lineHeight:1.65,
            color:"var(--forest)",
          }}
        >
          Sprawdź aktualne stężenie pyłków, prognozę 5-dniową i Indeks Spacerowy
          dla każdego miasta w województwie {voivName}. Dane z Open-Meteo, aktualizowane co 2 godziny.
        </div>

        <div className="anim-fade-up delay-3">
          <p className="label" style={{ marginBottom:10 }}>Inne województwa</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[["Mazowieckie","mazowieckie"],["Małopolskie","malopolskie"],["Śląskie","slaskie"],
              ["Wielkopolskie","wielkopolskie"],["Dolnośląskie","dolnoslaskie"],["Pomorskie","pomorskie"]]
              .filter(([,s]) => s !== wojewodztwo)
              .map(([name, slug]) => (
                <Link
                  key={slug} to={`/pylek/woj/${slug}`}
                  style={{
                    display:"inline-block", padding:"5px 13px", borderRadius:999,
                    fontSize:12, fontWeight:500, textDecoration:"none",
                    background:"var(--surface)", border:"1px solid rgba(24,24,15,0.08)",
                    color:"var(--ink-2)", transition:"all 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--forest)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(27,67,50,0.25)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink-2)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(24,24,15,0.08)"; }}
                >
                  {name}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
