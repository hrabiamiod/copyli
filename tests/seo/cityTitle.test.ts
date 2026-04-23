import { describe, it, expect } from "vitest";
import { buildCityTitle, buildCityDescription } from "../../src/utils/cityTitle";

const LEVEL_LABELS: Record<string, string> = {
  none: "brak", low: "niskie", medium: "średnie", high: "wysokie", very_high: "bardzo wysokie",
};

const birch = { level: "high", plant_name: "Brzoza" };
const grass = { level: "medium", plant_name: "Trawy" };
const low = { level: "low", plant_name: "Leszczyna" };
const none = { level: "none", plant_name: "Olcha" };

describe("buildCityTitle", () => {
  it("uses locative + active pollen for known city", () => {
    expect(buildCityTitle("Warszawa", "warszawa", [birch, grass]))
      .toBe("Co teraz pyli w Warszawie? Brzoza, Trawy | CoPyli.pl");
  });

  it("uses locative + no pollen for known city with no active pollen", () => {
    expect(buildCityTitle("Warszawa", "warszawa", [none]))
      .toBe("Co teraz pyli w Warszawie? Sprawdź stężenie pyłków | CoPyli.pl");
  });

  it("uses locative for Krakow with low-level pollen (level != none counts)", () => {
    expect(buildCityTitle("Kraków", "krakow", [low]))
      .toBe("Co teraz pyli w Krakowie? Leszczyna | CoPyli.pl");
  });

  it("caps active pollen at 2 plants in title", () => {
    const three = [birch, grass, { level: "low", plant_name: "Bylica" }];
    const title = buildCityTitle("Warszawa", "warszawa", three);
    expect(title).toBe("Co teraz pyli w Warszawie? Brzoza, Trawy | CoPyli.pl");
  });

  it("skips none-level pollen in active list", () => {
    expect(buildCityTitle("Warszawa", "warszawa", [none, birch]))
      .toBe("Co teraz pyli w Warszawie? Brzoza | CoPyli.pl");
  });

  it("falls back to nominative format for unknown city with active pollen", () => {
    expect(buildCityTitle("Bielawa", "bielawa", [birch]))
      .toBe("Pyłki w Bielawa — Brzoza | CoPyli.pl");
  });

  it("falls back to nominative static format for unknown city with no pollen", () => {
    expect(buildCityTitle("Bielawa", "bielawa", []))
      .toBe("Stężenie pyłków w Bielawa dziś — aktualne dane | CoPyli.pl");
  });

  it("handles irregular city: Bielsko-Biała", () => {
    expect(buildCityTitle("Bielsko-Biała", "bielsko-biala", [birch]))
      .toBe("Co teraz pyli w Bielsku-Białej? Brzoza | CoPyli.pl");
  });

  it("handles empty pollen array for known city", () => {
    expect(buildCityTitle("Gdańsk", "gdansk", []))
      .toBe("Co teraz pyli w Gdańsku? Sprawdź stężenie pyłków | CoPyli.pl");
  });
});

describe("buildCityDescription", () => {
  it("lists high-level pollen in description", () => {
    const desc = buildCityDescription("Warszawa", "mazowieckie", [birch, grass], LEVEL_LABELS);
    expect(desc).toContain("Brzoza (wysokie)");
    expect(desc).not.toContain("Trawy");
  });

  it("returns generic description when no high-level pollen", () => {
    const desc = buildCityDescription("Kraków", "małopolskie", [low], LEVEL_LABELS);
    expect(desc).toContain("małopolskie");
    expect(desc).toContain("co 2 godziny");
  });
});
