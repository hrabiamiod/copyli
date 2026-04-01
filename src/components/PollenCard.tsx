import type { PollenData } from "../types";

const CAT = { tree: "Drzewa", grass: "Trawy", weed: "Chwasty" };

const LEVEL: Record<string, { bg: string; color: string; label: string }> = {
  none:      { bg: "rgba(232,237,232,0.7)", color: "#4A5949", label: "Brak" },
  low:       { bg: "rgba(82,183,136,0.14)", color: "#1B5E3B", label: "Niskie" },
  medium:    { bg: "rgba(244,162,97,0.17)",  color: "#8C4A10", label: "Średnie" },
  high:      { bg: "rgba(231,111,81,0.16)", color: "#8B2500", label: "Wysokie" },
  very_high: { bg: "rgba(193,18,31,0.12)",  color: "#8B0000", label: "Bardzo wysokie" },
};

export default function PollenCard({ data }: { data: PollenData[] }) {
  const active = data.filter(p => p.level !== "none");

  if (active.length === 0) {
    return (
      <div style={{
        background: "rgba(82,183,136,0.10)",
        border: "1px solid rgba(82,183,136,0.20)",
        borderRadius: "var(--r-sm)",
        padding: "16px 20px",
        textAlign: "center",
        fontSize: 14,
        fontWeight: 500,
        color: "#1B5E3B",
      }}>
        🎉 Dziś nie odnotowano istotnego pylenia
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {(["tree","grass","weed"] as const).map(cat => {
        const plants = data.filter(p => p.category === cat && p.level !== "none");
        if (!plants.length) return null;
        return (
          <div key={cat}>
            <p className="label" style={{ marginBottom: 8 }}>{CAT[cat]}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {plants.map(plant => {
                const lvl = LEVEL[plant.level] ?? LEVEL.none;
                return (
                  <div
                    key={plant.plant_slug}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "var(--surface)",
                      border: "1px solid rgba(24,24,15,0.07)",
                      borderRadius: "var(--r-xs)",
                      transition: "box-shadow 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span style={{ fontSize: 19, lineHeight: 1 }}>{plant.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", margin: 0, lineHeight: 1.3 }}>
                          {plant.plant_name}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--ink-3)", margin: 0, fontStyle: "italic" }}>
                          {plant.name_latin}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
                      {plant.concentration > 0 && (
                        <span style={{ fontSize: 10, color: "var(--ink-3)", tabularNums: true } as React.CSSProperties}>
                          {Math.round(plant.concentration)} z/m³
                        </span>
                      )}
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 9px",
                        borderRadius: 999, background: lvl.bg, color: lvl.color, whiteSpace: "nowrap",
                      }}>
                        {lvl.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
