import type { ForecastData } from "../types";
import { LEVEL_LABELS, getDayName } from "../utils/pollen";

const DOT_BG: Record<string, string> = {
  none:      "#E8EDE8",
  low:       "rgba(82,183,136,0.25)",
  medium:    "rgba(244,162,97,0.30)",
  high:      "rgba(231,111,81,0.28)",
  very_high: "rgba(193,18,31,0.22)",
};
const DOT_COLOR: Record<string, string> = {
  none: "#8A9A8A", low: "#1B5E3B", medium: "#8C4A10", high: "#8B2500", very_high: "#8B0000",
};

export default function ForecastChart({ forecast }: { forecast: ForecastData[] }) {
  const dates = [...new Set(forecast.map(f => f.forecast_date))].sort().slice(0, 5);
  const order = ["none","low","medium","high","very_high"];

  const days = dates.map(date => {
    const dayData = forecast.filter(f => f.forecast_date === date);
    const maxLevel = dayData.reduce((max, f) =>
      order.indexOf(f.level) > order.indexOf(max) ? f.level : max, "none");
    const dominant = dayData
      .filter(f => f.level !== "none")
      .sort((a, b) => order.indexOf(b.level) - order.indexOf(a.level));
    return { date, maxLevel, dominant };
  });

  if (!days.length) return (
    <p style={{ textAlign: "center", color: "var(--ink-3)", fontSize: 13, padding: "16px 0" }}>
      Brak danych prognozy
    </p>
  );

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
      {days.map(({ date, maxLevel, dominant }, i) => {
        const d = new Date(date);
        return (
          <div
            key={date}
            className="anim-fade-up flex-none md:flex-1"
            style={{
              minWidth: 68,
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "14px 6px 12px",
              background: "var(--surface)",
              border: "1px solid rgba(24,24,15,0.07)",
              borderRadius: "var(--r-sm)",
              boxShadow: "var(--s-card)",
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ink)", margin: 0 }}>
              {getDayName(date)}
            </p>
            <p style={{ fontSize: 10, color: "var(--ink-3)", margin: "1px 0 10px" }}>
              {d.getDate()}.{String(d.getMonth()+1).padStart(2,"0")}
            </p>

            {/* Dot */}
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: DOT_BG[maxLevel] ?? "#E8EDE8",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 8, fontSize: 16,
            }}>
              🌿
            </div>

            <p style={{ fontSize: 11, fontWeight: 600, textAlign: "center", color: DOT_COLOR[maxLevel] ?? "#8A9A8A", lineHeight: 1.2, margin: 0 }}>
              {LEVEL_LABELS[maxLevel as keyof typeof LEVEL_LABELS]}
            </p>
            {dominant[0] && (
              <p style={{ fontSize: 10, textAlign: "center", color: "var(--ink-3)", marginTop: 3, lineHeight: 1.3, paddingInline: 4 }}>
                {dominant[0].plant_name}
              </p>
            )}
          </div>
        );
      })}
      </div>
      <div
        aria-hidden
        className="md:hidden"
        style={{
          position: "absolute", right: 0, top: 0, bottom: 4,
          width: 32, pointerEvents: "none",
          background: "linear-gradient(to right, transparent, var(--surface, #fffcf5))",
        }}
      />
    </div>
  );
}
