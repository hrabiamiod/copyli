import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { City, MapData } from "../types";
import type { PollenLevel } from "../types";
import SEOHead from "../components/SEOHead";
import PollenBadge from "../components/PollenBadge";
import { getVoivodeshipLevel, CATEGORY_LABELS, CATEGORY_ICONS, LEVEL_LABELS, LEVEL_COLORS } from "../utils/pollen";
import { getVoivodeshipPageTitle, getVoivodeshipPageDescription, getStructuredDataVoivodeship } from "../utils/seo";
import { getVoivodeshipInfo } from "../utils/voivodeship-descriptions";

const LEVEL_ORDER: PollenLevel[] = ["none", "low", "medium", "high", "very_high"];
const LEVEL_BAR_W: Record<PollenLevel, string> = {
  none: "0%", low: "20%", medium: "45%", high: "70%", very_high: "100%",
};

interface Voivodeship {
  id: number;
  slug: string;
  name: string;
}

export default function VoivodeshipPage() {
  const { wojewodztwo } = useParams<{ wojewodztwo: string }>();
  const [cities, setCities] = useState<City[]>([]);
  const [mapData, setMapData] = useState<MapData[]>([]);
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([]);
  const [cityLevels, setCityLevels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/cities.json").then(r => r.json()),
      fetch("/data/map-data.json").then(r => r.json()),
      fetch("/data/voivodeships.json").then(r => r.json()).catch(() => []),
      fetch("/data/city-levels.json").then(r => r.json()).catch(() => ({})),
    ]).then(([c, m, v, cl]) => {
      setCities(c); setMapData(m); setVoivodeships(v); setCityLevels(cl);
      setLoading(false);
    });
  }, []);

  const voivCities = cities.filter(c => c.voivodeship_slug === wojewodztwo).sort((a,b) => b.population - a.population);
  const voivName = voivCities[0]?.voivodeship_name ?? "";
  const level = getVoivodeshipLevel(mapData, wojewodztwo ?? "");
  const voivInfo = getVoivodeshipInfo(wojewodztwo ?? "");

  // Plant data for this voivodeship
  const voivPlants = mapData
    .filter(d => d.voivodeship_slug === wojewodztwo)
    .sort((a, b) => LEVEL_ORDER.indexOf(b.max_level) - LEVEL_ORDER.indexOf(a.max_level));

  // Group by category
  const plantsByCategory: Record<string, MapData[]> = {};
  for (const p of voivPlants) {
    if (!plantsByCategory[p.category]) plantsByCategory[p.category] = [];
    plantsByCategory[p.category].push(p);
  }

  // Dominant plant (highest level, highest concentration)
  const dominantPlant = voivPlants.find(p => p.max_level !== "none") ?? voivPlants[0];

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
        structuredData={getStructuredDataVoivodeship(wojewodztwo ?? "", voivName, voivCities.length)}
      />

      <div style={{ maxWidth:860, margin:"0 auto", padding:"24px 16px 56px", display:"flex", flexDirection:"column", gap:24 }}>

        <nav className="breadcrumb anim-fade-in">
          <Link to="/">Strona główna</Link>
          <span>›</span>
          <span style={{ color:"var(--ink)", fontWeight:500 }}>{voivName}</span>
        </nav>

        {/* Header */}
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

        {/* Dominant plant callout */}
        {dominantPlant && dominantPlant.max_level !== "none" && (
          <div
            className="anim-fade-up delay-1"
            style={{
              background:"rgba(27,67,50,0.07)",
              border:"1px solid rgba(27,67,50,0.15)",
              borderRadius:"var(--r-md)",
              padding:"14px 18px",
              display:"flex",
              alignItems:"center",
              gap:14,
            }}
          >
            <div style={{
              width:40, height:40, borderRadius:"50%",
              background:"rgba(27,67,50,0.12)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, flexShrink:0,
            }}>
              {CATEGORY_ICONS[dominantPlant.category] ?? "🌱"}
            </div>
            <div>
              <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:700, color:"var(--forest)" }}>
                Dominujący alergen: {dominantPlant.plant_name}
              </p>
              <p style={{ margin:0, fontSize:12, color:"var(--forest)", opacity:0.75 }}>
                Stężenie: <strong>{LEVEL_LABELS[dominantPlant.max_level]}</strong> ·{" "}
                {CATEGORY_LABELS[dominantPlant.category]}
              </p>
            </div>
          </div>
        )}

        {/* Plant breakdown by category */}
        {Object.keys(plantsByCategory).length > 0 && (
          <div className="anim-fade-up delay-1">
            <p className="label" style={{ marginBottom:12 }}>Stężenia pyłków według roślin</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {(["tree","grass","weed"] as const).map(cat => {
                const plants = plantsByCategory[cat];
                if (!plants?.length) return null;
                return (
                  <div
                    key={cat}
                    style={{
                      background:"var(--surface)",
                      border:"1px solid var(--cream-dark)",
                      borderRadius:"var(--r-md)",
                      padding:"14px 16px",
                    }}
                  >
                    <p style={{
                      margin:"0 0 10px",
                      fontSize:11, fontWeight:700,
                      textTransform:"uppercase", letterSpacing:"0.07em",
                      color:"var(--ink-2)",
                      display:"flex", alignItems:"center", gap:6,
                    }}>
                      <span>{CATEGORY_ICONS[cat]}</span>
                      {CATEGORY_LABELS[cat]}
                    </p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {plants.map(plant => (
                        <div key={plant.plant_slug} style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <Link to={`/pylek/roslina/${plant.plant_slug}`} style={{ fontSize:12, color:"var(--ink)", minWidth:100, flexShrink:0, textDecoration:"none" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "var(--forest)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "var(--ink)")}
                          >
                            {plant.plant_name}
                          </Link>
                          <div style={{ flex:1, height:6, borderRadius:3, background:"var(--cream-dark)", overflow:"hidden" }}>
                            <div style={{
                              height:"100%",
                              width: LEVEL_BAR_W[plant.max_level],
                              background: LEVEL_COLORS[plant.max_level],
                              borderRadius:3,
                              transition:"width 0.6s ease",
                            }} />
                          </div>
                          <span style={{
                            fontSize:11, fontWeight:600,
                            color: plant.max_level === "none" ? "var(--ink-3)" : "var(--ink)",
                            minWidth:90, textAlign:"right", flexShrink:0,
                          }}>
                            {LEVEL_LABELS[plant.max_level]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cities grid */}
        <div className="anim-fade-up delay-2">
          <p className="label" style={{ marginBottom:12 }}>Miasta w województwie {voivName}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap:8 }}>
            {voivCities.map((city, i) => {
              const cityLevel = (cityLevels[city.slug] ?? "none") as PollenLevel;
              const dotColor = LEVEL_COLORS[cityLevel];
              return (
                <Link
                  key={city.slug}
                  to={`/pylek/${city.slug}`}
                  className="city-card anim-fade-up"
                  style={{ animationDelay:`${i * 0.02}s` }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{
                      width:8, height:8, borderRadius:"50%",
                      background: dotColor,
                      border:"1px solid rgba(0,0,0,0.1)",
                      flexShrink:0,
                    }} />
                    <p style={{ fontSize:13, fontWeight:600, color:"var(--ink)", margin:0 }}>{city.name}</p>
                  </div>
                  {city.population > 0 && (
                    <p style={{ fontSize:11, color:"var(--ink-3)", margin:"2px 0 0", paddingLeft:16 }}>
                      {city.population.toLocaleString("pl-PL")} mieszk.
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Regional description */}
        <div className="anim-fade-up delay-3" style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <p style={{
            fontSize:14, lineHeight:1.7, color:"var(--ink-2)", margin:0,
          }}>
            {voivInfo.description}
          </p>
          <div style={{
            display:"flex", flexWrap:"wrap", gap:16,
            padding:"12px 16px",
            background:"rgba(27,67,50,0.05)",
            border:"1px solid rgba(27,67,50,0.10)",
            borderRadius:"var(--r-md)",
            fontSize:12,
          }}>
            <div>
              <span style={{ color:"var(--ink-3)", marginRight:6 }}>Główne alergeny:</span>
              <span style={{ color:"var(--forest)", fontWeight:600 }}>{voivInfo.dominantPlants}</span>
            </div>
            <div>
              <span style={{ color:"var(--ink-3)", marginRight:6 }}>Sezon pyłkowy:</span>
              <span style={{ color:"var(--forest)", fontWeight:600 }}>{voivInfo.season}</span>
            </div>
          </div>
        </div>

        {/* All voivodeships */}
        <div className="anim-fade-up delay-3">
          <p className="label" style={{ marginBottom:10 }}>Inne województwa</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {voivodeships
              .filter(v => v.slug !== wojewodztwo)
              .map(v => (
                <Link
                  key={v.slug} to={`/pylek/woj/${v.slug}`}
                  style={{
                    display:"inline-block", padding:"5px 13px", borderRadius:999,
                    fontSize:12, fontWeight:500, textDecoration:"none",
                    background:"var(--surface)", border:"1px solid rgba(24,24,15,0.08)",
                    color:"var(--ink-2)", transition:"all 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--forest)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(27,67,50,0.25)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink-2)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(24,24,15,0.08)"; }}
                >
                  {v.name}
                </Link>
              ))}
          </div>
        </div>

      </div>
    </>
  );
}
