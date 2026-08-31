import { FOR_SALE, GOAL, SPOTS, type Spot } from "@/data/spots";
import type { Sponsor } from "@/data/sponsors";

export const yen = (n: number) => "¥" + n.toLocaleString("ja-JP");

// copy-facing counts, derived from the data so edited layouts never drift from the text
export const SPOT_COUNT = FOR_SALE.length;
export const UNDER_100K_COUNT = FOR_SALE.filter((s) => s.price < 100_000).length;
export const MIN_PRICE = Math.min(...FOR_SALE.map((s) => s.price));

export type Progress = {
  raised: number;
  goal: number;
  pct: number;
  soldCount: number;
  forSaleCount: number;
  remaining: number;
  lpTotal: number;
  lpTaken: number;
  lpRemaining: number;
};

export function progress(spots: Spot[] = SPOTS, sponsors: Sponsor[] = []): Progress {
  const soldIds = new Set(sponsors.map((s) => s.spotId));
  const forSale = spots.filter((s) => s.forSale);
  const lp = spots.filter((s) => !s.forSale);
  const sold = forSale.filter((s) => soldIds.has(s.id));
  const raised = sold.reduce((a, s) => a + s.price, 0);
  const lpTaken = lp.filter((s) => soldIds.has(s.id)).length;
  return {
    raised,
    goal: GOAL,
    pct: Math.min(100, (raised / GOAL) * 100),
    soldCount: sold.length,
    forSaleCount: forSale.length,
    remaining: forSale.length - sold.length,
    lpTotal: lp.length,
    lpTaken,
    lpRemaining: lp.length - lpTaken,
  };
}
