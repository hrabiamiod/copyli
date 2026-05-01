import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  structuredData?: object;
  extraStructuredData?: object;
  ogImage?: string;
}

export default function SEOHead({ title, description, canonical, structuredData, extraStructuredData, ogImage }: SEOHeadProps) {
  const image = ogImage ?? "https://copyli.pl/og-default.png";

  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, prop = false) => {
      const selector = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (prop) el.setAttribute("property", name);
        else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    setMeta("description", description);
    setLink("canonical", canonical);

    // Open Graph
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", canonical, true);
    setMeta("og:image", image, true);
    setMeta("og:type", "website", true);
    setMeta("og:locale", "pl_PL", true);
    setMeta("og:site_name", "CoPyli.pl", true);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    // Structured Data
    if (structuredData) {
      let sdEl = document.getElementById("structured-data") as HTMLScriptElement | null;
      if (!sdEl) {
        sdEl = document.createElement("script");
        sdEl.id = "structured-data";
        sdEl.type = "application/ld+json";
        document.head.appendChild(sdEl);
      }
      sdEl.textContent = JSON.stringify(structuredData);
    }

    // Extra Structured Data (second JSON-LD block, e.g. WebSite + Organization)
    if (extraStructuredData) {
      let sdEl2 = document.getElementById("structured-data-extra") as HTMLScriptElement | null;
      if (!sdEl2) {
        sdEl2 = document.createElement("script");
        sdEl2.id = "structured-data-extra";
        sdEl2.type = "application/ld+json";
        document.head.appendChild(sdEl2);
      }
      sdEl2.textContent = JSON.stringify(extraStructuredData);
    }
  }, [title, description, canonical, structuredData, extraStructuredData, image]);

  // Render in head during SSR (when using vite-ssg or similar)
  return null;
}
