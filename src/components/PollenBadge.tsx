import type { PollenLevel } from "../types";
import { LEVEL_LABELS } from "../utils/pollen";

interface PollenBadgeProps {
  level: PollenLevel;
  size?: "sm" | "md" | "lg";
}

const STYLES: Record<PollenLevel, { bg: string; color: string }> = {
  none:      { bg: "rgba(232,237,232,0.8)", color: "#4A5949" },
  low:       { bg: "rgba(82,183,136,0.15)", color: "#1B5E3B" },
  medium:    { bg: "rgba(244,162,97,0.18)",  color: "#8C4A10" },
  high:      { bg: "rgba(231,111,81,0.16)", color: "#8B2500" },
  very_high: { bg: "rgba(193,18,31,0.12)",  color: "#8B0000" },
};

const PAD = { sm: "2px 8px", md: "3px 10px", lg: "5px 13px" };
const FS  = { sm: "11px", md: "12px", lg: "13px" };

export default function PollenBadge({ level, size = "md" }: PollenBadgeProps) {
  const { bg, color } = STYLES[level] ?? STYLES.none;
  return (
    <span style={{
      display: "inline-block",
      borderRadius: 999,
      padding: PAD[size],
      fontSize: FS[size],
      fontWeight: 600,
      whiteSpace: "nowrap",
      background: bg,
      color,
      fontFamily: "var(--font-body)",
    }}>
      {LEVEL_LABELS[level]}
    </span>
  );
}
