import { describe, expect, it } from "vitest";
import { FOR_SALE, GOAL, LP_SPOTS, SPOTS } from "./spots";
import { TIER_PRICE } from "./tiers";
import { progress } from "@/lib/format";

describe("spots invariant", () => {
  it("40 for-sale spots sum to exactly ¥2,000,000", () => {
    expect(FOR_SALE.length).toBe(40);
    expect(FOR_SALE.reduce((a, s) => a + s.price, 0)).toBe(2_000_000);
    expect(GOAL).toBe(2_000_000);
  });
  it("5 launch-partner spots, priced 0, not for sale", () => {
    expect(LP_SPOTS.length).toBe(5);
    expect(LP_SPOTS.every((s) => s.price === 0 && !s.forSale)).toBe(true);
    expect(SPOTS.length).toBe(45);
  });
  it("every price matches its tier, except the two ¥20,000 interior spots", () => {
    for (const s of SPOTS) {
      if (s.id === "shift" || s.id === "ceiling") expect(s.price).toBe(20_000);
      else expect(s.price).toBe(TIER_PRICE[s.tier]);
    }
  });
  it("tier counts match the 2026-08-26 edit (6 windows, no floor mats)", () => {
    const count = (t: string) => SPOTS.filter((s) => s.tier === t).length;
    expect(count("S")).toBe(1);
    expect(count("A")).toBe(4);
    expect(count("B")).toBe(5);
    expect(count("C")).toBe(12);
    expect(count("D")).toBe(13);
    expect(count("E")).toBe(5);
  });
  it("35 of 40 spots are under ¥100,000", () => {
    expect(FOR_SALE.filter((s) => s.price < 100_000).length).toBe(35);
  });
  it("ids are unique", () => {
    expect(new Set(SPOTS.map((s) => s.id)).size).toBe(SPOTS.length);
  });
  it("progress math at zero and with one sale", () => {
    const zero = progress(SPOTS, []);
    expect(zero.raised).toBe(0);
    expect(zero.remaining).toBe(40);
    expect(zero.lpRemaining).toBe(5);
    const one = progress(SPOTS, [
      { spotId: "bonnet", name: "x", logo: "", url: "", blurb: "", soldAt: "2026-01-01" },
      { spotId: "wiper", name: "y", logo: "", url: "", blurb: "", launchPartner: true, soldAt: "2026-01-01" },
    ]);
    expect(one.raised).toBe(250_000);
    expect(one.remaining).toBe(39);
    expect(one.lpRemaining).toBe(4);
  });
});
