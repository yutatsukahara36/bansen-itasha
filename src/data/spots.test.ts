import { describe, expect, it } from "vitest";
import { FOR_SALE, GOAL, LP_SPOTS, SPOTS } from "./spots";
import { progress } from "@/lib/format";

describe("spots invariant", () => {
  it("for-sale spots sum to exactly ¥2,000,000", () => {
    expect(FOR_SALE.length).toBeGreaterThanOrEqual(40);
    expect(FOR_SALE.reduce((a, s) => a + s.price, 0)).toBe(2_000_000);
    expect(GOAL).toBe(2_000_000);
  });
  it("launch-partner spots are priced 0 and not for sale", () => {
    expect(LP_SPOTS.length).toBeGreaterThan(0);
    expect(LP_SPOTS.every((s) => s.price === 0 && !s.forSale)).toBe(true);
  });
  it("at least 35 of the for-sale spots stay under the ¥100,000 課長 line", () => {
    expect(FOR_SALE.filter((s) => s.price < 100_000).length).toBeGreaterThanOrEqual(35);
  });
  it("ids are unique", () => {
    expect(new Set(SPOTS.map((s) => s.id)).size).toBe(SPOTS.length);
  });
  it("progress math at zero and with one sale", () => {
    const zero = progress(SPOTS, []);
    expect(zero.raised).toBe(0);
    expect(zero.remaining).toBe(FOR_SALE.length);
    expect(zero.lpRemaining).toBe(LP_SPOTS.length);
    const first = FOR_SALE[0];
    const lp = LP_SPOTS[0];
    const one = progress(SPOTS, [
      { spotId: first.id, name: "x", logo: "", url: "", blurb: "", soldAt: "2026-01-01" },
      { spotId: lp.id, name: "y", logo: "", url: "", blurb: "", launchPartner: true, soldAt: "2026-01-01" },
    ]);
    expect(one.raised).toBe(first.price);
    expect(one.remaining).toBe(FOR_SALE.length - 1);
    expect(one.lpRemaining).toBe(LP_SPOTS.length - 1);
  });
});
