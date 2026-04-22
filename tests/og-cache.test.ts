import { describe, it, expect } from "vitest";
import { createHash } from "crypto";

// Replikacja logiki hash z generate-og-images-cities.ts
function cityHash(rawData: string, templateHash: string): string {
  return createHash("sha1").update(rawData + templateHash).digest("hex").slice(0, 12);
}

describe("OG image cache — logika hash", () => {
  it("identyczne dane i template → identyczny hash", () => {
    expect(cityHash('{"level":"high"}', "tmplv1")).toBe(cityHash('{"level":"high"}', "tmplv1"));
  });

  it("różne dane pyłkowe → różny hash (inwalidacja cache)", () => {
    expect(cityHash('{"level":"high"}', "tmplv1")).not.toBe(cityHash('{"level":"low"}', "tmplv1"));
  });

  it("ta sama data, inny template → różny hash (zmiana template wymusza regenerację)", () => {
    expect(cityHash('{"name":"Wroclaw"}', "tmplv1")).not.toBe(cityHash('{"name":"Wroclaw"}', "tmplv2"));
  });

  it("hash ma 12 znaków hex", () => {
    const h = cityHash("{}", "tmpl");
    expect(h).toMatch(/^[0-9a-f]{12}$/);
  });

  it("pusty JSON nie powoduje błędu", () => {
    expect(() => cityHash("{}", "tmpl")).not.toThrow();
  });
});
