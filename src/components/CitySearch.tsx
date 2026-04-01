import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { City } from "../types";

interface CitySearchProps {
  compact?: boolean;
  onSelect?: (city: City) => void;
}

// Cache cities.json in module scope — loaded once, reused
let citiesCache: City[] | null = null;
async function loadCities(): Promise<City[]> {
  if (citiesCache) return citiesCache;
  const res = await fetch("/data/cities.json");
  citiesCache = await res.json() as City[];
  return citiesCache;
}

function searchLocally(cities: City[], q: string): City[] {
  const norm = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return cities
    .filter(c => {
      const name = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return name.startsWith(norm) || name.includes(norm);
    })
    .sort((a, b) => {
      const an = a.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const bn = b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const aStart = an.startsWith(norm) ? 0 : 1;
      const bStart = bn.startsWith(norm) ? 0 : 1;
      if (aStart !== bStart) return aStart - bStart;
      return b.population - a.population;
    })
    .slice(0, 10);
}

export default function CitySearch({ compact, onSelect }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setResults([]); return; }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json() as City[];
        setResults(data.slice(0, 10));
        setOpen(true);
        return;
      }
    } catch {
      // API niedostępne — fallback do client-side
    }

    const cities = await loadCities();
    setResults(searchLocally(cities, q));
    setOpen(true);
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(timerRef.current);
  }, [query, search]);

  const handleSelect = (city: City) => {
    setQuery("");
    setOpen(false);
    if (onSelect) { onSelect(city); return; }
    navigate(`/pylek/${city.slug}`);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: focused ? "var(--surface)" : "rgba(24,24,15,0.07)",
        borderRadius: 999,
        padding: "0 12px",
        border: `1.5px solid ${focused ? "rgba(27,67,50,0.5)" : "transparent"}`,
        transition: "background 0.15s, border-color 0.15s",
      }}>
        <span style={{ fontSize: 13, color: "var(--ink-3)", flexShrink: 0 }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 150); }}
          placeholder={compact ? "Szukaj miasta..." : "Wpisz nazwę miasta (min. 3 litery)"}
          style={{
            background: "transparent",
            outline: "none",
            border: "none",
            fontSize: 13,
            color: "var(--ink)",
            padding: "9px 0",
            width: "100%",
            maxWidth: compact ? 180 : "none",
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--ink-3)", fontSize: 12, padding: 0, flexShrink: 0,
              lineHeight: 1,
            }}
          >✕</button>
        )}
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "var(--surface)",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(24,24,15,0.12)",
          border: "1px solid rgba(24,24,15,0.08)",
          zIndex: 9999,
          overflow: "hidden",
        }}>
          {results.map((city, i) => (
            <button
              key={city.slug}
              onMouseDown={() => handleSelect(city)}
              style={{
                width: "100%", textAlign: "left",
                padding: "10px 16px",
                background: "none", border: "none",
                borderBottom: i < results.length - 1 ? "1px solid rgba(24,24,15,0.06)" : "none",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: 13,
                transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--forest-soft)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontWeight: 600, color: "var(--ink)" }}>{city.name}</span>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{city.voivodeship_name}</span>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 3 && results.length === 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "var(--surface)",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(24,24,15,0.12)",
          border: "1px solid rgba(24,24,15,0.08)",
          zIndex: 9999,
          padding: "12px 16px",
          fontSize: 13, color: "var(--ink-3)",
        }}>
          Nie znaleziono miasta „{query}"
        </div>
      )}
    </div>
  );
}
