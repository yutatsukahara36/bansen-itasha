export type Tier = "S" | "A" | "B" | "C" | "D" | "E" | "LP";

export const TIER_PRICE: Record<Tier, number> = {
  S: 250_000,
  A: 120_000,
  B: 80_000,
  C: 40_000,
  D: 20_000,
  E: 30_000,
  LP: 0,
};

export const TIER_LABEL: Record<Tier, string> = {
  S: "S枠 冠スポンサー付",
  A: "A枠",
  B: "B枠",
  C: "C枠",
  D: "D枠 個人も可",
  E: "E枠 痛内装",
  LP: "非売品",
};

export const TIER_ORDER: Tier[] = ["S", "A", "B", "C", "D", "E", "LP"];
