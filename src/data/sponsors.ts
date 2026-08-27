// Sponsor records. Empty at launch: the zero-sponsor render is the Phase 1 hero shot.
// Logos are real files supplied by the company (SVG or transparent PNG) in /public/logos. Never approximated.
export type Sponsor = {
  spotId: string;
  name: string;
  logo: string; // /logos/xxx.svg
  url: string;
  blurb: string;
  launchPartner?: boolean; // only true for the 5 LP spots. Paid sponsors never get the badge.
  soldAt: string; // ISO date
};

export const SPONSORS: Sponsor[] = [];

export const sponsorForSpot = (spotId: string) => SPONSORS.find((s) => s.spotId === spotId);
