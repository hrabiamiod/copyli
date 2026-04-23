import CitySearch from "./CitySearch";

export default function StickyMobileCTA() {
  return (
    <div
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        zIndex: 850,
        padding: "10px 16px calc(10px + env(safe-area-inset-bottom, 0px))",
        background: "rgba(247,242,235,0.94)",
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        borderTop: "1px solid rgba(24,24,15,0.08)",
        boxShadow: "0 -4px 20px rgba(24,24,15,0.06)",
      }}
    >
      <CitySearch compact />
    </div>
  );
}
