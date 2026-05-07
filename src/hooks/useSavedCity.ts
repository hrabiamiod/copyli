import { useState, useEffect } from "react";

interface SavedCity {
  name: string;
  slug: string;
}

const KEY = "copyli:selected-city";

export function useSavedCity() {
  const [savedCity, setSavedCity] = useState<SavedCity | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.slug && parsed?.name) {
        setSavedCity(parsed);
      } else {
        localStorage.removeItem(KEY);
      }
    } catch {
      localStorage.removeItem(KEY);
    }
  }, []);

  function saveCity(city: SavedCity) {
    try {
      localStorage.setItem(KEY, JSON.stringify(city));
      setSavedCity(city);
    } catch {
      // ignore storage errors
    }
  }

  function clearCity() {
    try {
      localStorage.removeItem(KEY);
      setSavedCity(null);
    } catch {
      // ignore storage errors
    }
  }

  return { savedCity, saveCity, clearCity };
}
