interface WalkIndexProps {
  score: number;
  recommendation: string;
  best_time: string;
  reason: string;
}

export default function WalkIndexCard({ score, recommendation, best_time, reason }: WalkIndexProps) {
  const theme = score >= 80
    ? { bg: "rgba(82,183,136,0.12)", accent: "#2D6A4F", track: "rgba(82,183,136,0.18)", text: "#1B4332" }
    : score >= 60
      ? { bg: "rgba(244,162,97,0.12)", accent: "#C9903A", track: "rgba(244,162,97,0.18)", text: "#7C4A1A" }
      : score >= 40
        ? { bg: "rgba(231,111,81,0.12)", accent: "#C04A2A", track: "rgba(231,111,81,0.18)", text: "#7A2A10" }
        : { bg: "rgba(193,18,31,0.10)", accent: "#C1121F", track: "rgba(193,18,31,0.14)", text: "#8B0000" };

  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div
      style={{
        background: theme.bg,
        borderRadius: "var(--r-md)",
        padding: "18px 20px",
        border: `1px solid ${theme.accent}22`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* SVG ring */}
        <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
          <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="30" cy="30" r={r} fill="none" stroke={theme.track} strokeWidth="5" />
            <circle
              cx="30" cy="30" r={r} fill="none"
              stroke={theme.accent} strokeWidth="5"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)" }}
            />
          </svg>
          <span style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
            color: theme.text,
          }}>
            {score}
          </span>
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <p className="label" style={{ marginBottom: 3 }}>Indeks Spacerowy</p>
          <p style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
            color: theme.text, margin: 0, lineHeight: 1.2,
          }}>
            {recommendation}
          </p>
          <p style={{ fontSize: 12, marginTop: 5, color: "var(--ink-2)" }}>
            ⏰ <span style={{ fontWeight: 500 }}>{best_time}</span>
          </p>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginTop: 14, height: 3, background: theme.track, borderRadius: 99 }}>
        <div style={{
          height: 3, borderRadius: 99, background: theme.accent,
          width: `${score}%`,
          transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>

      {reason && (
        <p style={{ marginTop: 12, fontSize: 12, lineHeight: 1.6, color: "var(--ink-2)" }}>
          {reason}
        </p>
      )}
    </div>
  );
}
