import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Plant } from "../types";
import SEOHead from "../components/SEOHead";
import { CATEGORY_LABELS } from "../utils/pollen";

const MONTHS = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];
const MONTH_COLORS: Record<string, string> = {
  tree: "#81C784",
  grass: "#FFD54F",
  weed: "#FF8A65",
};
const PEAK_COLORS: Record<string, string> = {
  tree: "#2E7D32",
  grass: "#F57F17",
  weed: "#BF360C",
};

export default function CalendarPage() {
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    fetch("/data/plants.json").then(r => r.json()).then(setPlants);
  }, []);

  const currentMonth = new Date().getMonth(); // 0-indexed

  const categories = ["tree", "grass", "weed"] as const;

  return (
    <>
      <SEOHead
        title="Kalendarz pylenia roślin w Polsce — kiedy co pyli? | CoPyli.pl"
        description="Interaktywny kalendarz pylenia roślin w Polsce. Sprawdź kiedy pylą drzewa (brzoza, olcha), trawy i chwasty (ambrozja, bylica). Daty sezonów pyłkowych dla alergików."
        canonical="https://copyli.pl/kalendarz-pylenia"
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <nav className="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
          <Link to="/" className="hover:text-green-700">Strona główna</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">Kalendarz pylenia</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Kalendarz pylenia roślin w Polsce
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Przegląd sezonów pyłkowych dla najważniejszych roślin uczulających w Polsce.
          Kolory intensywne = szczyt pylenia.
        </p>

        {/* Heatmapa */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {/* Nagłówek miesięcy */}
          <div className="flex border-b border-gray-100">
            <div className="w-32 shrink-0 p-3 text-xs text-gray-500 font-medium">Roślina</div>
            {MONTHS.map((m, i) => (
              <div
                key={m}
                className={`flex-1 p-2 text-center text-xs font-semibold min-w-[36px] ${
                  i === currentMonth ? "bg-blue-50 text-blue-700" : "text-gray-500"
                }`}
              >
                {m}
                {i === currentMonth && <div className="w-1 h-1 bg-blue-500 rounded-full mx-auto mt-0.5" />}
              </div>
            ))}
          </div>

          {categories.map(cat => {
            const catPlants = plants.filter(p => p.category === cat);
            if (catPlants.length === 0) return null;
            return (
              <div key={cat}>
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {CATEGORY_LABELS[cat]}
                  </span>
                </div>
                {catPlants.map(plant => {
                  const peakMonths: number[] = plant.peak_months
                    ? JSON.parse(plant.peak_months)
                    : [];

                  return (
                    <div key={plant.slug} className="flex border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <div className="w-32 shrink-0 p-3 flex items-center gap-1.5">
                        <span className="text-base">{plant.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-gray-800 leading-tight">{plant.name_pl}</p>
                          <p className="text-xs text-gray-400 italic leading-tight">{plant.name_latin}</p>
                        </div>
                      </div>
                      {MONTHS.map((_, monthIdx) => {
                        const month = monthIdx + 1;
                        const inRange = plant.month_start <= plant.month_end
                          ? month >= plant.month_start && month <= plant.month_end
                          : month >= plant.month_start || month <= plant.month_end;
                        const isPeak = peakMonths.includes(month);
                        const isCurrent = monthIdx === currentMonth;

                        return (
                          <div
                            key={monthIdx}
                            className={`flex-1 min-w-[36px] p-1 flex items-center justify-center ${isCurrent ? "ring-1 ring-inset ring-blue-200" : ""}`}
                          >
                            {inRange && (
                              <div
                                className="w-full h-6 rounded"
                                style={{
                                  backgroundColor: isPeak ? PEAK_COLORS[cat] : MONTH_COLORS[cat],
                                  opacity: isPeak ? 1 : 0.5,
                                }}
                                title={`${plant.name_pl} — ${isPeak ? "szczyt" : "pylenie"}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded bg-green-600" />
            <span>Drzewa (szczyt)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded bg-yellow-600" />
            <span>Trawy (szczyt)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded bg-orange-700" />
            <span>Chwasty (szczyt)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded bg-blue-200" />
            <span>Bieżący miesiąc</span>
          </div>
        </div>

        {/* Opis */}
        <section className="mt-8 prose prose-sm max-w-none text-gray-600">
          <h2 className="text-lg font-bold text-gray-800">Kiedy najgorzej dla alergika?</h2>
          <p>
            W Polsce sezon pyłkowy zaczyna się już w <strong>lutym</strong>, gdy pylić zaczynają leszczyna i olcha —
            szczególnie w cieplejsze zimy. Najintensywniejszy okres to <strong>kwiecień–maj</strong> (brzoza, dąb, jesion)
            oraz <strong>czerwiec–lipiec</strong> (trawy — najczęstsza przyczyna alergii w Polsce).
          </p>
          <p>
            Alergicy uczuleni na ambrozję cierpią <strong>sierpień–wrzesień</strong>. Ambrozja to roślina inwazyjna,
            bardzo silnie alergizująca, której obszar w Polsce wciąż się powiększa.
          </p>
          <p>
            Sprawdź aktualne stężenia pyłków w <Link to="/" className="text-green-700 underline">interaktywnej mapie</Link> lub
            wybierz swoje miasto poniżej.
          </p>
        </section>
      </div>
    </>
  );
}
