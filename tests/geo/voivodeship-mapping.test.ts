import { describe, it, expect } from "vitest";
import cities from "../../public/data/cities.json";

const GEO_FIXTURE = [
  { slug: "bydgoszcz", voivodeship: "kujawsko-pomorskie" },
  { slug: "biala-podlaska", voivodeship: "lubelskie" },
  { slug: "torun", voivodeship: "kujawsko-pomorskie" },
  { slug: "plock", voivodeship: "mazowieckie" },
  { slug: "lodz", voivodeship: "lodzkie" },
  { slug: "zlotow", voivodeship: "wielkopolskie" },
  { slug: "klobuck", voivodeship: "slaskie" },
  { slug: "lubin", voivodeship: "dolnoslaskie" },
  { slug: "ostrzeszow", voivodeship: "wielkopolskie" },
  { slug: "strykow", voivodeship: "lodzkie" },
  { slug: "mlawa", voivodeship: "mazowieckie" },
  { slug: "suraz", voivodeship: "podlaskie" },
  { slug: "gubin", voivodeship: "lubuskie" },
  { slug: "wolow", voivodeship: "dolnoslaskie" },
  { slug: "sroda-slaska", voivodeship: "dolnoslaskie" },
] as const;

describe("city → voivodeship mapping", () => {
  it.each(GEO_FIXTURE.map(f => [f.slug, f.voivodeship] as [string, string]))(
    "%s maps to %s",
    (slug, expected) => {
      const city = (cities as any[]).find((c: any) => c.slug === slug);
      expect(city, `City '${slug}' not found in cities.json`).toBeDefined();
      expect(city.voivodeship_slug).toBe(expected);
    }
  );

  it("Dolnośląskie page does not contain Bydgoszcz, Biała Podlaska or Suraż", () => {
    const dolnoslaskie = (cities as any[]).filter((c: any) => c.voivodeship_slug === "dolnoslaskie");
    const slugs = dolnoslaskie.map((c: any) => c.slug);
    expect(slugs).not.toContain("bydgoszcz");
    expect(slugs).not.toContain("biala-podlaska");
    expect(slugs).not.toContain("suraz");
  });

  it("every city has a non-empty voivodeship_slug", () => {
    const missing = (cities as any[]).filter((c: any) => !c.voivodeship_slug);
    expect(missing.map((c: any) => c.slug)).toEqual([]);
  });
});
