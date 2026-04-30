import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";

interface Article {
  slug: string;
  icon: string;
  title: string;
  desc: string;
  tag: string;
  tagColor: string;
  season: string;
  readMin: number;
}

const ARTICLES: Article[] = [
  {
    slug: "alergia-na-pylek",
    icon: "🌸",
    title: "Alergia na pyłki — objawy, diagnostyka i jak się chronić",
    desc: "Kompleksowy przewodnik po pyłkowicy. Dowiedz się co uczula, jak zdiagnozować alergię i jak ograniczyć ekspozycję na pyłki podczas sezonu.",
    tag: "Przewodnik",
    tagColor: "#1B4332",
    season: "Cały rok",
    readMin: 7,
  },
  {
    slug: "alergia-na-trawy",
    icon: "🌾",
    title: "Alergia na trawy — objawy, sezon i leczenie",
    desc: "Trawy pylą od maja do sierpnia i uczulają 8% Polaków. Jak rozpoznać alergię na tymotykę, kupkówkę i wiechlinnę i jak sobie z nią poradzić?",
    tag: "Trawy",
    tagColor: "#2D6A4F",
    season: "Maj–Sierpień",
    readMin: 6,
  },
  {
    slug: "pylenie-brzozy",
    icon: "🌳",
    title: "Pylenie brzozy — sezon, objawy alergii i ochrona",
    desc: "Brzoza uczula ok. 20% polskich alergików. Kiedy pyli, dlaczego jej alergen jest tak agresywny i co łączy brzozę z jabłkami?",
    tag: "Drzewa",
    tagColor: "#4A7C59",
    season: "Marzec–Maj",
    readMin: 5,
  },
  {
    slug: "jak-chronic-sie-przed-pylkami",
    icon: "🛡️",
    title: "Jak chronić się przed pyłkami — 10 sprawdzonych metod",
    desc: "Które godziny są najgorsze? Jak urządzić dom i co zrobić po powrocie z zewnątrz? Praktyczna lista dla każdego alergika.",
    tag: "Ochrona",
    tagColor: "#2D6A4F",
    season: "Cały sezon",
    readMin: 5,
  },
  {
    slug: "alergia-na-ambrozje",
    icon: "🌿",
    title: "Ambrozja — alergia, sezon pylenia sierpień–październik",
    desc: "Inwazyjny chwast z Ameryki, który wydłuża sezon alergiczny do jesieni. Ekspansja na południu Polski, objawy i jak się chronić.",
    tag: "Chwasty",
    tagColor: "#856A2E",
    season: "Sierpień–Październik",
    readMin: 5,
  },
  {
    slug: "reaktywnosc-krzyzowa",
    icon: "🔗",
    title: "Reaktywność krzyżowa pyłków — pełna lista par",
    desc: "Dlaczego uczulenie na brzozę wywołuje reakcję na jabłka, a alergia na trawy — na pomidory? Kompletna mapa zależności pyłek–pokarm.",
    tag: "Diagnostyka",
    tagColor: "#1B4332",
    season: "Cały rok",
    readMin: 6,
  },
  {
    slug: "sezon-pylkowy-2026",
    icon: "📅",
    title: "Sezon pyłkowy 2026 — kiedy i co pyli w Polsce",
    desc: "Miesiąc po miesiącu: które drzewa, trawy i chwasty pylą kiedy i gdzie. Prognoza i harmonogram na cały rok dla polskich alergików.",
    tag: "Sezon",
    tagColor: "#4A7C59",
    season: "2026",
    readMin: 4,
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Porady dla alergików — CoPyli.pl",
  description: "Poradniki o alergii pyłkowej: objawy, leczenie, ochrona i aktualny sezon pyłkowy.",
  url: "https://copyli.pl/porady/",
};

function TagPill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color,
      background: color + "14",
      border: `1px solid ${color}28`,
      borderRadius: 6,
      padding: "2px 8px",
      flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

function ReadTime({ min }: { min: number }) {
  return (
    <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.02em" }}>
      {min} min czytania
    </span>
  );
}

export default function AdviceIndexPage() {
  const [featured, ...rest] = ARTICLES;

  return (
    <>
      <SEOHead
        title="Porady dla alergików — poradniki o alergii pyłkowej | CoPyli.pl"
        description="Poradniki dla alergików: alergia na pyłki, trawy, brzozę, ambrozję. Leki, ochrona i aktualny sezon pyłkowy 2026."
        canonical="https://copyli.pl/porady/"
        structuredData={structuredData}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, var(--cream) 0%, #eef4f0 100%)",
        borderBottom: "1px solid var(--cream-dark)",
        padding: "40px 20px 36px",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <nav className="breadcrumb anim-fade-in" style={{ marginBottom: 20 }}>
            <Link to="/">Strona główna</Link>
            <span>›</span>
            <span style={{ color: "var(--ink)", fontWeight: 500 }}>Porady</span>
          </nav>

          <div className="anim-fade-up">
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--forest)", marginBottom: 10,
            }}>
              {ARTICLES.length} artykułów · Aktualizowane na bieżąco
            </p>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--ink)",
              lineHeight: 1.1,
              margin: "0 0 14px",
            }}>
              Porady<br />
              <span style={{ color: "var(--forest)" }}>dla alergików</span>
            </h1>
            <p style={{
              fontSize: 15, color: "var(--ink-2)", lineHeight: 1.7,
              maxWidth: 520, margin: 0,
            }}>
              Przewodniki opracowane przez zespół CoPyli.pl — kiedy pylą rośliny,
              jak się leczyć i jak przeżyć sezon w dobrej formie.
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 80px" }}>

        {/* ── Wyróżniony artykuł ──────────────────────────────────────── */}
        <Link
          to={`/porady/${featured.slug}`}
          style={{ display: "block", textDecoration: "none" }}
        >
          <div
            className="anim-fade-up"
            style={{
              margin: "32px 0 0",
              padding: "28px 32px",
              background: "var(--surface)",
              border: "1px solid var(--cream-dark)",
              borderRadius: "var(--r-md)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative large number */}
            <div aria-hidden style={{
              position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
              fontFamily: "var(--font-display)", fontSize: 120, fontWeight: 800,
              color: "rgba(27,67,50,0.05)", lineHeight: 1, pointerEvents: "none",
              userSelect: "none",
            }}>01</div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <TagPill label={featured.tag} color={featured.tagColor} />
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>·</span>
              <ReadTime min={featured.readMin} />
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>·</span>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{featured.season}</span>
            </div>

            <p style={{ fontSize: 22, marginBottom: 10 }}>{featured.icon}</p>

            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(20px, 3vw, 26px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              margin: "0 0 10px",
              lineHeight: 1.25,
              maxWidth: "80%",
            }}>
              {featured.title}
            </h2>

            <p style={{
              fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7,
              margin: "0 0 20px", maxWidth: "72%",
            }}>
              {featured.desc}
            </p>

            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 700, color: "var(--forest)",
            }}>
              Czytaj artykuł
              <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
            </span>
          </div>
        </Link>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, margin: "36px 0 28px",
        }}>
          <div style={{ flex: 1, height: 1, background: "var(--cream-dark)" }} />
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--ink-3)",
          }}>Wszystkie artykuły</span>
          <div style={{ flex: 1, height: 1, background: "var(--cream-dark)" }} />
        </div>

        {/* ── Lista artykułów ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {rest.map((a, idx) => (
            <ArticleRow key={a.slug} article={a} index={idx + 2} />
          ))}
        </div>

        {/* ── Footer linki ────────────────────────────────────────────── */}
        <div style={{
          marginTop: 56, paddingTop: 28,
          borderTop: "1px solid var(--cream-dark)",
          display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Sprawdź też
          </span>
          {[
            { to: "/kalendarz-pylenia", label: "Kalendarz pylenia" },
            { to: "/pylek/rosliny", label: "Encyklopedia roślin" },
            { to: "/", label: "Mapa pyłkowa" },
          ].map(l => (
            <Link key={l.to} to={l.to} style={{
              fontSize: 13, color: "var(--forest)", fontWeight: 600,
              textDecoration: "none", borderBottom: "1px solid rgba(27,67,50,0.2)",
              paddingBottom: 1,
            }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function ArticleRow({ article: a, index }: { article: Article; index: number }) {
  const num = String(index).padStart(2, "0");

  return (
    <Link
      to={`/porady/${a.slug}`}
      style={{ display: "block", textDecoration: "none" }}
    >
      <div
        className="article-row"
        style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr",
          gap: "0 20px",
          padding: "22px 0",
          borderBottom: "1px solid var(--cream-dark)",
          position: "relative",
        }}
      >
        {/* Numer */}
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--ink-3)",
          paddingTop: 3,
          letterSpacing: "-0.02em",
        }}>
          {num}
        </div>

        {/* Treść */}
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <TagPill label={a.tag} color={a.tagColor} />
            <ReadTime min={a.readMin} />
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>· {a.season}</span>
          </div>

          <h3 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(16px, 2.5vw, 19px)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "var(--ink)",
            margin: "0 0 6px",
            lineHeight: 1.3,
          }}>
            {a.icon} {a.title}
          </h3>

          <p style={{
            fontSize: 13,
            color: "var(--ink-2)",
            lineHeight: 1.65,
            margin: "0 0 10px",
          }}>
            {a.desc}
          </p>

          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--forest)",
            letterSpacing: "0.02em",
          }}>
            Czytaj →
          </span>
        </div>
      </div>
    </Link>
  );
}
