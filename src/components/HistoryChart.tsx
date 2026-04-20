import { useMemo, useState } from "react";

interface HistoryEntry {
  date: string;
  concentration: number;
  level: string;
}

interface PlantHistory {
  plant_slug: string;
  plant_name: string;
  category: string;
  icon: string;
  data: HistoryEntry[];
}

interface Props {
  history: PlantHistory[];
}

const LEVEL_COLOR: Record<string, string> = {
  none:      "var(--p-none)",
  low:       "var(--p-low)",
  medium:    "var(--p-medium)",
  high:      "var(--p-high)",
  very_high: "var(--p-very-high)",
};

const CAT_COLOR: Record<string, string> = {
  tree:  "var(--forest)",
  grass: "var(--gold)",
  weed:  "var(--p-high)",
};

const CAT_LABEL: Record<string, string> = {
  tree:  "Drzewa",
  grass: "Trawy",
  weed:  "Chwasty",
};

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

export default function HistoryChart({ history }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Agreguj per kategoria — max concentration per day
  const categories = useMemo(() => {
    const catMap = new Map<string, { label: string; icon: string; color: string; data: HistoryEntry[] }>();
    for (const plant of history) {
      const existing = catMap.get(plant.category);
      if (!existing) {
        catMap.set(plant.category, {
          label: CAT_LABEL[plant.category] ?? plant.category,
          icon: plant.icon,
          color: CAT_COLOR[plant.category] ?? "var(--ink-3)",
          data: plant.data.map(d => ({ ...d })),
        });
      } else {
        // Merge — max concentration per date
        const byDate = new Map(existing.data.map(d => [d.date, d]));
        for (const d of plant.data) {
          const ex = byDate.get(d.date);
          if (!ex || d.concentration > ex.concentration) byDate.set(d.date, d);
        }
        existing.data = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
      }
    }
    return Array.from(catMap.entries())
      .sort(([a], [b]) => (a === "tree" ? -1 : b === "tree" ? 1 : a === "grass" ? -1 : 1))
      .map(([cat, v]) => ({ cat, ...v }));
  }, [history]);

  const allDates = useMemo(() => {
    const set = new Set<string>();
    for (const c of categories) for (const d of c.data) set.add(d.date);
    return Array.from(set).sort();
  }, [categories]);

  if (allDates.length < 3 || categories.length === 0) {
    return (
      <p style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center", padding: "20px 0" }}>
        Za mało danych historycznych — pojawią się po kilku dniach zbierania.
      </p>
    );
  }

  const maxConc = Math.max(
    10,
    ...categories.flatMap(c => c.data.map(d => d.concentration))
  );

  const W = 600;
  const H = 140;
  const PAD_L = 36;
  const PAD_R = 8;
  const PAD_T = 10;
  const PAD_B = 24;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const xScale = (i: number) => PAD_L + (i / (allDates.length - 1)) * chartW;
  const yScale = (v: number) => PAD_T + chartH - (v / maxConc) * chartH;

  function buildPath(data: HistoryEntry[], filled: boolean): string {
    const byDate = new Map(data.map(d => [d.date, d.concentration]));
    const pts = allDates.map((date, i) => ({ x: xScale(i), y: yScale(byDate.get(date) ?? 0) }));
    if (pts.length === 0) return "";
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    if (!filled) return line;
    return `${line} L${pts[pts.length - 1].x.toFixed(1)},${(PAD_T + chartH).toFixed(1)} L${pts[0].x.toFixed(1)},${(PAD_T + chartH).toFixed(1)} Z`;
  }

  // Tick labels — co ~14 dni
  const tickStep = Math.max(1, Math.floor(allDates.length / 5));
  const ticks = allDates
    .map((d, i) => ({ i, d }))
    .filter(({ i }) => i % tickStep === 0 || i === allDates.length - 1);

  // Y axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ val: Math.round(f * maxConc), y: yScale(f * maxConc) }));

  return (
    <div>
      {/* Legenda */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
        {categories.map(c => (
          <div key={c.cat} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{ width: 20, height: 3, borderRadius: 2, background: c.color, display: "inline-block" }} />
            <span style={{ color: "var(--ink-2)" }}>{c.icon} {c.label}</span>
          </div>
        ))}
      </div>

      {/* SVG Chart */}
      <div style={{ position: "relative" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {categories.map(c => (
              <linearGradient key={c.cat} id={`grad-${c.cat}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={c.color} stopOpacity="0.02" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {yTicks.map(({ val, y }) => (
            <g key={val}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                stroke="rgba(24,24,15,0.06)" strokeWidth="1" />
              <text x={PAD_L - 4} y={y + 4} textAnchor="end"
                fontSize="9" fill="var(--ink-3)">{val}</text>
            </g>
          ))}

          {/* Filled areas */}
          {categories.map(c => (
            <path key={`fill-${c.cat}`}
              d={buildPath(c.data, true)}
              fill={`url(#grad-${c.cat})`}
            />
          ))}

          {/* Lines */}
          {categories.map(c => (
            <path key={`line-${c.cat}`}
              d={buildPath(c.data, false)}
              fill="none"
              stroke={c.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {/* Hover interaction zones */}
          {allDates.map((date, i) => (
            <rect
              key={date}
              x={xScale(i) - chartW / allDates.length / 2}
              y={PAD_T}
              width={chartW / allDates.length}
              height={chartH}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => setHoveredIdx(i)}
            />
          ))}

          {/* Hover line */}
          {hoveredIdx !== null && (
            <line
              x1={xScale(hoveredIdx)} y1={PAD_T}
              x2={xScale(hoveredIdx)} y2={PAD_T + chartH}
              stroke="rgba(24,24,15,0.2)" strokeWidth="1" strokeDasharray="3,3"
            />
          )}

          {/* X axis ticks */}
          {ticks.map(({ i, d }) => (
            <text key={d} x={xScale(i)} y={H - 4} textAnchor="middle"
              fontSize="9" fill="var(--ink-3)">{formatDateShort(d)}</text>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredIdx !== null && (
          <div style={{
            position: "absolute",
            top: 0,
            left: `${Math.min(85, (hoveredIdx / allDates.length) * 100)}%`,
            background: "var(--surface)",
            border: "1px solid var(--cream-dark)",
            borderRadius: "var(--r-sm)",
            boxShadow: "var(--s-card)",
            padding: "8px 12px",
            fontSize: 12,
            pointerEvents: "none",
            minWidth: 130,
            zIndex: 10,
          }}>
            <p style={{ fontWeight: 700, color: "var(--ink)", margin: "0 0 6px" }}>
              {formatDateShort(allDates[hoveredIdx])}
            </p>
            {categories.map(c => {
              const entry = c.data.find(d => d.date === allDates[hoveredIdx]);
              if (!entry) return null;
              return (
                <div key={c.cat} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: LEVEL_COLOR[entry.level] ?? "var(--ink-3)",
                    flexShrink: 0,
                  }} />
                  <span style={{ color: "var(--ink-2)" }}>
                    {c.icon} {entry.concentration.toFixed(0)} — <span style={{ color: LEVEL_COLOR[entry.level] ?? "var(--ink-3)", fontWeight: 600 }}>{entry.level}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
