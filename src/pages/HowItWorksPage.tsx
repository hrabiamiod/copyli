import SEOHead from "../components/SEOHead";

const SECTIONS = [
  {
    icon: "📡",
    title: "Źródła danych pyłkowych",
    content: `Dane pyłkowe pobieramy z Open-Meteo Air Quality API — bezpłatnego, europejskiego serwisu meteorologicznego opartego na modelach CAMS (Copernicus Atmosphere Monitoring Service). Dane są aktualizowane co 1–2 godziny i obejmują ponad 1000 polskich miast. Obejmują stężenia pyłków: drzew (brzozy, olchy, leszczyny, topoli, jesionu), traw oraz chwastów (bylicy, ambrozji).`,
  },
  {
    icon: "🎚️",
    title: "Progi stężeń i skala poziomów",
    content: `Stężenia pyłków prezentujemy w czterostopniowej skali: niskie (🟢), średnie (🟡), wysokie (🔴) i bardzo wysokie (🔴🔴). Progi są kalibrowane zgodnie z wytycznymi Europejskiej Akademii Alergologii i Immunologii Klinicznej (EAACI) i uwzględniają specyficzne wartości dla każdego gatunku. Dla przykładu: brzoza — poziom wysoki oznacza powyżej 75 ziaren/m³ powietrza, natomiast dla traw — powyżej 50 ziaren/m³.`,
  },
  {
    icon: "🚶",
    title: "Indeks Spacerowy",
    content: `Indeks Spacerowy to własny wskaźnik CoPyli.pl, który łączy aktualne stężenia pyłków z prognozą pogody (temperatura, opady, wiatr). Wynik od 1 (trudny dzień dla alergika) do 10 (idealne warunki do wyjścia na zewnątrz) pozwala szybko ocenić, czy dziś warto wychodzić bez leku antyhistaminowego. Im niższe stężenia pyłków i im wyższe opady, tym wyższy Indeks.`,
  },
  {
    icon: "⚠️",
    title: "Ograniczenia modelu",
    content: `Model numeryczny Open-Meteo przewiduje stężenia na podstawie warunków atmosferycznych i fenologii roślin, jednak nie zastąpi lokalnych pomiarów pyłkometrycznych. Wyniki mogą się różnić od rzeczywistych stężeń o ±20–40% — szczególnie w dni z silnym wiatrem lub po nagłej zmianie pogody. Dane stanowią wskazówkę dla alergików, a nie diagnozę medyczną. W przypadku ciężkich objawów zawsze konsultuj się z alergologiem.`,
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SEOHead
        title="Jak działa CoPyli.pl — metodologia i źródła danych pyłkowych"
        description="Dowiedz się skąd pobieramy dane pyłkowe, jak obliczamy Indeks Spacerowy i jakie są ograniczenia modelu prognozowania pyłków."
        canonical="https://copyli.pl/jak-dziala"
      />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
          Jak działa CoPyli.pl?
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "2.5rem", lineHeight: 1.6 }}>
          Metodologia, źródła danych i ograniczenia modelu pyłkowego.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {SECTIONS.map(({ icon, title, content }) => (
            <section
              key={title}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "1.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "0.75rem" }}>
                {icon} {title}
              </h2>
              <p style={{ color: "#374151", lineHeight: 1.7, margin: 0 }}>{content}</p>
            </section>
          ))}
        </div>

        <p style={{ marginTop: "2.5rem", fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.6 }}>
          Masz pytania lub uwagi do metodologii?{" "}
          <a href="mailto:kontakt@copyli.pl" style={{ color: "#16a34a" }}>
            Napisz do nas
          </a>
          .
        </p>
      </main>
    </>
  );
}
