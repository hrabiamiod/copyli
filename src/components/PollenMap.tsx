import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { City, MapData, PollenLevel } from "../types";
import { getVoivodeshipLevel, getVoivodeshipFillColor, LEVEL_LABELS, LEVEL_COLORS } from "../utils/pollen";
import { SHOWCASE_CITY_LEVELS } from "../utils/showcaseData";

const LEVEL_HEAT: Record<string, number> = {
  none: 0, low: 0.25, medium: 0.5, high: 0.75, very_high: 1,
};

interface PollenMapProps {
  cities: City[];
  mapData: MapData[];
  cityLevels?: Record<string, string>;
  onCityClick?: (city: City) => void;
  highlightCitySlug?: string;
  compact?: boolean;
  showcaseMode?: boolean;
}

export default function PollenMap({ cities, mapData, cityLevels = {}, onCityClick, highlightCitySlug, compact, showcaseMode = false }: PollenMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heatLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geojsonLayerRef = useRef<any>(null);
  const navigate = useNavigate();
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showcase, setShowcase] = useState(showcaseMode);
  const showcaseModeRef = useRef(showcaseMode);

  // W trybie prezentacji używamy demo-danych zamiast prawdziwych
  const activeLevels = showcase ? SHOWCASE_CITY_LEVELS : cityLevels;
  const activeLevelsRef = useRef(activeLevels);
  useEffect(() => { activeLevelsRef.current = activeLevels; }, [activeLevels]);

  // Budujemy mapę voivodeship_slug → max_level dla kolorowania markerów
  const voivLevelMap = new Map<string, PollenLevel>();
  for (const city of cities) {
    if (!voivLevelMap.has(city.voivodeship_slug)) {
      voivLevelMap.set(city.voivodeship_slug, getVoivodeshipLevel(mapData, city.voivodeship_slug));
    }
  }

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let L: typeof import("leaflet");
    let map: import("leaflet").Map;

    const init = async () => {
      L = (await import("leaflet")).default;
      leafletRef.current = L;
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

      map = L.map(mapRef.current!, {
        center: [52.1, 19.4],
        zoom: 7,
        zoomControl: false,
        scrollWheelZoom: true,
        minZoom: 6,
        maxZoom: 14,
        maxBounds: [[48.8, 13.8], [55.2, 24.3]],
        maxBoundsViscosity: 0.9,
      });

      // Na mini-mapie (CityPage) zoom w prawym dolnym rogu — nie zasłania legendy
      L.control.zoom({ position: compact ? "bottomright" : "topleft" }).addTo(map);

      tileLayerRef.current = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Nakładki województw
      try {
        const geoRes = await fetch("/data/voivodeships.geojson");
        if (geoRes.ok) {
          const geoJson = await geoRes.json();
          geojsonLayerRef.current = L.geoJSON(geoJson, {
            style: (feature) => {
              const slug = feature?.properties?.slug as string;
              const level = getVoivodeshipLevel(mapData, slug);
              return {
                fillColor: getVoivodeshipFillColor(level),
                weight: 2,
                opacity: 1,
                color: "#fff",
                fillOpacity: 0.65,
              };
            },
            onEachFeature: (feature, layer) => {
              const slug = feature?.properties?.slug as string;
              const name = feature?.properties?.name as string;
              const level = getVoivodeshipLevel(mapData, slug);
              layer.bindTooltip(`<span>${name}</span><br><small>${LEVEL_LABELS[level]}</small>`, {
                permanent: true,
                direction: "center",
                className: "voiv-label",
              });
              layer.on("click", () => navigate(`/pylek/woj/${slug}`));
            }
          }).addTo(map);
        }
      } catch (e) {
        console.warn("Nie udało się załadować GeoJSON województw:", e);
      }

      const polishCities = cities.filter(c =>
        voivLevelMap.has(c.voivodeship_slug) &&
        c.lat >= 49.0 && c.lat <= 54.9 &&
        c.lon >= 14.1 && c.lon <= 24.2
      ).sort((a, b) => b.population - a.population);

      const getSize = (city: City) => {
        const isHighlighted = city.slug === highlightCitySlug;
        return isHighlighted ? 16 : city.population > 200000 ? 13 : city.population > 50000 ? 10 : 7;
      };

      const createMarker = (city: City) => {
        const level = (activeLevelsRef.current[city.slug] ?? voivLevelMap.get(city.voivodeship_slug) ?? "none") as PollenLevel;
        const color = LEVEL_COLORS[level];
        const isHighlighted = city.slug === highlightCitySlug;
        const size = getSize(city);

        const icon = L.divIcon({
          html: `<div style="
            background:${color};
            border: 2px solid ${isHighlighted ? "#1B5E20" : "rgba(0,0,0,0.3)"};
            border-radius: 50%;
            width: ${size}px;
            height: ${size}px;
            box-shadow: 0 1px 4px rgba(0,0,0,.4);
          "></div>`,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([city.lat, city.lon], { icon });

        marker.bindPopup(`
          <div style="min-width:150px;font-family:sans-serif">
            <strong style="font-size:14px">${city.name}</strong><br>
            <small style="color:#666">${city.voivodeship_name}</small><br>
            <span style="display:inline-block;margin:4px 0;padding:2px 8px;border-radius:10px;background:${color};font-size:12px;font-weight:600;color:${level === 'none' || level === 'low' ? '#1B5E20' : '#fff'}">${LEVEL_LABELS[level]}</span><br>
            <a href="/pylek/${city.slug}" style="color:#2e7d32;font-size:13px;font-weight:600;text-decoration:none">
              Zobacz szczegóły →
            </a>
          </div>
        `, { maxWidth: 220 });

        marker.on("click", () => {
          if (onCityClick) onCityClick(city);
        });

        return marker;
      };

      const layerGroup = L.layerGroup().addTo(map);

      const renderMarkers = () => {
        const z = map.getZoom();
        layerGroup.clearLayers();
        let subset: City[];
        if (z >= 10) subset = polishCities;
        else if (z >= 8) subset = polishCities.slice(0, 100);
        else subset = polishCities.slice(0, 20);

        subset.forEach(city => {
          const marker = createMarker(city);
          const sz = getSize(city);
          // Etykiety z nazwą miasta — widoczne dla dużych miast lub przy przybliżeniu
          const showLabel = city.slug === highlightCitySlug ||
            (z >= 9 && city.population > 30000) ||
            (z >= 7 && city.population > 150000);
          if (showLabel) {
            marker.bindTooltip(city.name, {
              permanent: true,
              direction: "right",
              className: "city-name-label",
              offset: [sz / 2 + 4, 0] as [number, number],
            });
          }
          marker.addTo(layerGroup);
        });
      };

      renderMarkers();
      map.on("zoomend", renderMarkers);

      mapInstanceRef.current = map;

      if (highlightCitySlug) {
        const city = cities.find(c => c.slug === highlightCitySlug);
        if (city) map.setView([city.lat, city.lon], 10);
      }

      // Zastosuj showcase mode jeśli był aktywny przy ładowaniu
      if (showcaseModeRef.current) {
        map.removeLayer(tileLayerRef.current);
        tileLayerRef.current = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
          { attribution: '© OpenStreetMap © CARTO', subdomains: "abcd", maxZoom: 19 }
        ).addTo(map);
        tileLayerRef.current.bringToBack();

        if (geojsonLayerRef.current) {
          geojsonLayerRef.current.setStyle((feature: { properties?: { slug?: string } }) => {
            const slug = feature?.properties?.slug as string;
            const level = getVoivodeshipLevel(mapData, slug);
            return { fillColor: getVoivodeshipFillColor(level), weight: 1, opacity: 0.4, color: "rgba(255,255,255,0.3)", fillOpacity: 0.45 };
          });
        }

        const heatPoints = cities
          .filter(c => c.lat >= 49 && c.lat <= 55 && c.lon >= 14 && c.lon <= 24.5)
          .map(c => {
            const levelKey = (SHOWCASE_CITY_LEVELS[c.slug] ?? "none") as string;
            const intensity = LEVEL_HEAT[levelKey] ?? 0;
            return [c.lat, c.lon, intensity] as [number, number, number];
          })
          .filter(([,, i]) => i > 0);

        if (heatPoints.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          heatLayerRef.current = (L as any).heatLayer(heatPoints, {
            radius: 35, blur: 30, maxZoom: 10,
            gradient: { 0.25: "#52B788", 0.5: "#F4A261", 0.75: "#E76F51", 1.0: "#C1121F" },
          }).addTo(map);
        }
      }
    };

    init();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Synchronizuj ref z propem
  useEffect(() => { showcaseModeRef.current = showcaseMode; }, [showcaseMode]);

  // Reaguj na zewnętrzną zmianę showcaseMode (z panelu admina)
  useEffect(() => {
    if (showcaseMode !== showcase) applyShowcase(showcaseMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showcaseMode]);

  const applyShowcase = useCallback(async (next: boolean) => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;
    setShowcase(next);

    // Zmień tile layer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const tileUrl = next
      ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current.bringToBack();

    // Zaktualizuj styl GeoJSON
    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.setStyle((feature: { properties?: { slug?: string } }) => {
        const slug = feature?.properties?.slug as string;
        const level = getVoivodeshipLevel(mapData, slug);
        return next
          ? { fillColor: getVoivodeshipFillColor(level), weight: 1, opacity: 0.4, color: "rgba(255,255,255,0.3)", fillOpacity: 0.45 }
          : { fillColor: getVoivodeshipFillColor(level), weight: 2, opacity: 1, color: "#fff", fillOpacity: 0.65 };
      });
    }

    // Heatmapa
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (next) {
      const levels = next ? SHOWCASE_CITY_LEVELS : cityLevels;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const heatPoints = cities
        .filter(c => c.lat >= 49 && c.lat <= 55 && c.lon >= 14 && c.lon <= 24.5)
        .map(c => {
          const levelKey = (levels[c.slug] ?? "none") as string;
          const intensity = LEVEL_HEAT[levelKey] ?? 0;
          return [c.lat, c.lon, intensity] as [number, number, number];
        })
        .filter(([,, i]) => i > 0);

      if (heatPoints.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        heatLayerRef.current = (L as any).heatLayer(heatPoints, {
          radius: 35,
          blur: 30,
          maxZoom: 10,
          gradient: { 0.25: "#52B788", 0.5: "#F4A261", 0.75: "#E76F51", 1.0: "#C1121F" },
        }).addTo(map);
      }
    }
  }, [showcase, cities, cityLevels, mapData]);

  const geoMarkerRef = useRef<import("leaflet").Marker | null>(null);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("Przeglądarka nie obsługuje geolokalizacji");
      setTimeout(() => setGeoError(null), 4000);
      return;
    }
    if (!mapInstanceRef.current) {
      setGeoError("Mapa jeszcze się ładuje, spróbuj za chwilę");
      setTimeout(() => setGeoError(null), 3000);
      return;
    }
    setGeolocating(true);
    setGeoError(null);

    const onError = (err: GeolocationPositionError) => {
      setGeolocating(false);
      if (err.code === 1) setGeoError("Brak zgody na lokalizację — zezwól w przeglądarce");
      else if (err.code === 2) setGeoError("Nie można ustalić lokalizacji");
      else setGeoError("Przekroczono czas oczekiwania");
      setTimeout(() => setGeoError(null), 5000);
    };

    const onSuccess = (pos: GeolocationPosition) => {
      try {
        const { latitude, longitude } = pos.coords;
        const map = mapInstanceRef.current;
        if (!map) { setGeolocating(false); return; }

        map.setView([latitude, longitude], 11);

        if (geoMarkerRef.current) {
          geoMarkerRef.current.remove();
          geoMarkerRef.current = null;
        }

        const L = leafletRef.current;
        if (!L) { setGeolocating(false); return; }

        const icon = L.divIcon({
          html: `<div style="position:relative;width:20px;height:20px">
            <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:geoRipple 1.6s ease-out infinite"></div>
            <div style="position:absolute;inset:4px;border-radius:50%;background:#3B82F6;border:2.5px solid #fff;box-shadow:0 1px 6px rgba(59,130,246,0.6)"></div>
          </div>`,
          className: "",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        let nearest = cities[0];
        let minDist = Infinity;
        for (const city of cities) {
          const d = Math.hypot(city.lat - latitude, city.lon - longitude);
          if (d < minDist) { minDist = d; nearest = city; }
        }

        const marker = L.marker([latitude, longitude], { icon, zIndexOffset: 2000 });
        marker.bindPopup(
          `<div style="font-family:sans-serif;min-width:140px">
            <strong style="font-size:13px">📍 Twoja lokalizacja</strong><br>
            ${nearest ? `<a href="/pylek/${nearest.slug}" style="color:#1B4332;font-size:12px;font-weight:600;text-decoration:none">Najbliższe miasto: ${nearest.name} →</a>` : ""}
          </div>`,
          { maxWidth: 220 }
        );
        marker.addTo(map).openPopup();
        geoMarkerRef.current = marker;

        if (nearest && onCityClick) onCityClick(nearest);
      } catch (e) {
        console.warn("Błąd geolokalizacji:", e);
      } finally {
        setGeolocating(false);
      }
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      timeout: 10000,
      maximumAge: 60000,
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-xl" />

      {/* Geolocate button — tylko na pełnej mapie */}
      {!compact && (
        <button
          onClick={handleGeolocate}
          className="absolute bottom-4 right-4 z-[1000] bg-white rounded-full shadow-lg w-10 h-10 flex items-center justify-center text-lg hover:bg-green-50 transition-colors"
          title="Moja lokalizacja"
        >
          {geolocating ? "⌛" : "📍"}
        </button>
      )}

      {/* Błąd geolokalizacji */}
      {!compact && geoError && (
        <div style={{
          position: "absolute",
          bottom: 64,
          right: 16,
          zIndex: 1000,
          background: "rgba(24,24,15,0.88)",
          color: "#fff",
          borderRadius: 12,
          padding: "9px 14px",
          fontSize: 12,
          fontWeight: 500,
          backdropFilter: "blur(8px)",
          maxWidth: 220,
          textAlign: "center",
          lineHeight: 1.5,
        }}>
          {geoError}
        </div>
      )}

      {/* Legenda — tylko na pełnej mapie */}
      {!compact && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 text-xs">
          <p className="font-semibold text-gray-700 mb-2 text-[11px] uppercase tracking-wide">Stężenie pyłków</p>
          {(["none", "low", "medium", "high", "very_high"] as const).map(level => (
            <div key={level} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full border border-black/10" style={{ background: LEVEL_COLORS[level] }} />
              <span className="text-gray-600">{LEVEL_LABELS[level]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
