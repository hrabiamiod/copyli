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
      // startsWith pierwszeństwo
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

    // Próba API (działa na Cloudflare Pages)
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

    // Fallback: wyszukiwanie po cities.json
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
    <div className="relative">
      <div className={`flex items-center gap-2 bg-gray-100 rounded-full px-3 ${focused ? "ring-2 ring-green-500 bg-white" : ""} transition-all`}>
        <span className="text-gray-400 text-sm">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 150); }}
          placeholder={compact ? "Szukaj miasta..." : "Wpisz nazwę miasta (min. 3 litery)"}
          className={`bg-transparent outline-none text-sm py-2 w-full ${compact ? "max-w-[180px]" : ""}`}
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          {results.map(city => (
            <button
              key={city.slug}
              onMouseDown={() => handleSelect(city)}
              className="w-full text-left px-4 py-2.5 hover:bg-green-50 flex items-center justify-between text-sm border-b last:border-0 border-gray-50"
            >
              <span className="font-medium">{city.name}</span>
              <span className="text-gray-400 text-xs">{city.voivodeship_name}</span>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 3 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 px-4 py-3 text-sm text-gray-500">
          Nie znaleziono miasta „{query}"
        </div>
      )}
    </div>
  );
}
