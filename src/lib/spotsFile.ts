import type { Spot } from "@/data/spots";

const f = (a: readonly number[]) => "[" + a.map((v) => String(+v.toFixed(4))).join(", ") + "]";
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

/** Serializes the spot list back into src/data/spots.ts. Used by the /dev/place save API. */
export function generateSpotsTs(spots: Spot[]) {
  let ts = `// Single source of truth for the 45 spots. Shared by the 3D scene, the /sponsor price table and the progress math.
// Decal transforms are in car space (car ~1.53 units long, front = +Z, ground y = -0.064; the GLB node transforms are baked in CarModel).
// Edited visually in /dev/place (dev only): place, resize, rename, reprice, then 保存 writes this file.
import type { Tier } from './tiers';

export type Spot = {
  id: string;
  nameJa: string;
  tier: Tier;
  price: number; // 0 for ローンチパートナー枠
  forSale: boolean; // false for the 5 LP spots
  note?: string;
  target: { mesh: string; material: string };
  decal: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
};

export const SPOTS: Spot[] = [
`;
  for (const s of spots) {
    ts += `  { id: '${esc(s.id)}', nameJa: '${esc(s.nameJa)}', tier: '${s.tier}', price: ${s.price}, forSale: ${s.forSale},${s.note ? ` note: '${esc(s.note)}',` : ""}\n`;
    ts += `    target: { mesh: '${esc(s.target.mesh)}', material: '${esc(s.target.material)}' },\n`;
    ts += `    decal: { position: ${f(s.decal.position)}, rotation: ${f(s.decal.rotation)}, scale: ${f(s.decal.scale)} } },\n`;
  }
  ts += `];

export const GOAL = 2_000_000;
export const FOR_SALE = SPOTS.filter((s) => s.forSale);
export const LP_SPOTS = SPOTS.filter((s) => !s.forSale);
export const spotById = (id: string) => SPOTS.find((s) => s.id === id);
`;
  return ts;
}
