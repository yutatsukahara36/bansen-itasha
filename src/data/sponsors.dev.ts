import type { Sponsor } from "./sponsors";

/** Dev-only sample sponsor for testing the sold state and the peel. Never ships: only used behind NODE_ENV !== 'production'. */
export const sampleSponsor = (spotId: string, launchPartner = false): Sponsor => ({
  spotId,
  name: "サンプル株式会社",
  logo: "/logos/sample.svg",
  url: "https://example.com",
  blurb: "テスト用のサンプル枠です。本番ではスポンサー企業から支給された実ロゴを使います。",
  launchPartner,
  soldAt: "2026-08-26",
});
