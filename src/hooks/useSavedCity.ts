import { useState, useEffect } from "react";

interface SavedCity {
  name: string;
  slug: string;
}

const KEY = "copyli_saved_city";

export function useSavedCity() {
  const [savedCity, setSavedCity] = useState<SavedCity | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSavedCity(JSON.parse(raw));
    } catch {
      // ignore corrupt data
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
