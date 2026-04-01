interface Props {
  aqi: number; aqi_label: string;
  temperature?: number; humidity?: number; wind_speed?: number; precipitation?: number;
}

const AQI_THEME = (aqi: number) =>
  aqi <= 20 ? { bg: "rgba(82,183,136,0.14)", color: "#1B5E3B" }
  : aqi <= 40 ? { bg: "rgba(244,162,97,0.16)", color: "#8C4A10" }
  : aqi <= 60 ? { bg: "rgba(231,111,81,0.16)", color: "#8B2500" }
  : { bg: "rgba(193,18,31,0.12)", color: "#8B0000" };

export default function AirQualityCard({ aqi, aqi_label, temperature, humidity, wind_speed, precipitation }: Props) {
  const { bg, color } = AQI_THEME(aqi);
  const stats = [
    { icon: "🌡️", label: "Temp.", value: temperature != null ? `${Math.round(temperature)}°C` : "—" },
    { icon: "💧", label: "Wilgotność", value: humidity != null ? `${Math.round(humidity)}%` : "—" },
    { icon: "💨", label: "Wiatr", value: wind_speed != null ? `${Math.round(wind_speed)} km/h` : "—" },
    { icon: "🌧️", label: "Opady", value: precipitation != null ? `${precipitation.toFixed(1)} mm` : "—" },
  ];

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid rgba(24,24,15,0.07)",
      borderRadius: "var(--r-md)",
      padding: "16px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", margin: 0 }}>Jakość powietrza</p>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: bg, color }}>
          {aqi_label ?? "—"}{aqi > 0 ? ` (${aqi})` : ""}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 3 }}>{s.icon}</div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {s.value}
            </p>
            <p style={{ fontSize: 10, color: "var(--ink-3)", margin: "2px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
