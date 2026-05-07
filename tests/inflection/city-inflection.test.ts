import { describe, it, expect } from "vitest";
import { CITY_LOCATIVE } from "../../src/utils/cityLocative";

const INFLECTION_FIXTURE = [
  ["plock", "w Płocku"],
  ["bytom", "w Bytomiu"],
  ["myszkow", "w Myszkowie"],
  ["myslenice", "w Myślenicach"],
  ["pabianice", "w Pabianicach"],
  ["lodz", "w Łodzi"],
  ["torun", "w Toruniu"],
  ["biala-podlaska", "w Białej Podlaskiej"],
  ["bydgoszcz", "w Bydgoszczy"],
  ["zamosc", "w Zamościu"],
  ["zory", "w Żorach"],
  ["lomza", "w Łomży"],
  ["mlawa", "w Mławie"],
  ["klodzko", "w Kłodzku"],
  ["jaslo", "w Jaśle"],
  ["jaworzno", "w Jaworznie"],
  ["skawina", "w Skawinie"],
  ["bielsko-biala", "w Bielsku-Białej"],
] as const;

describe("CITY_LOCATIVE — locative phrases", () => {
  it.each(INFLECTION_FIXTURE as unknown as [string, string][])(
    "slug '%s' → '%s'",
    (slug, expectedPhrase) => {
      const loc = CITY_LOCATIVE[slug];
      expect(loc, `Missing CITY_LOCATIVE entry for '${slug}'`).toBeDefined();
      expect(`w ${loc}`).toBe(expectedPhrase);
    }
  );

  it("covers at least 150 cities", () => {
    expect(Object.keys(CITY_LOCATIVE).length).toBeGreaterThanOrEqual(150);
  });
});
