import * as THREE from "three";

/**
 * Zone classifier: assigns every triangle of the paintable surfaces to one of the 45 spots,
 * so the whole car reads as a parcel map. No unsold-white anywhere on the shell:
 * body triangles that match no rule fall back to the nearest zone seed.
 * Coordinates are car space (front = +Z, ground y = -0.064), x measured from the centreline CX.
 */
export const CX = -0.04;

const v = (p: THREE.Vector3, n: THREE.Vector3) => ({ x: p.x - CX, y: p.y, z: p.z, ax: Math.abs(p.x - CX), n });

/** Ordered rules, first match wins. Returns a spot id. */
export function classifyBody(p: THREE.Vector3, n: THREE.Vector3): string {
  const { x, y, z, ax } = v(p, n);
  // mirrors protrude sideways at the A pillar base
  if (ax > 0.26 && y > 0.2 && z > 0.06 && z < 0.26) return x < 0 ? "mirror-l" : "mirror-r";
  // cowl below the windshield
  if (z > 0.185 && z < 0.27 && y > 0.225 && y < 0.31 && n.y > 0.25) return "wiper";
  // hood
  if (n.y > 0.35 && z > 0.24 && z < 0.68 && y > 0.16) return "bonnet";
  // nose centre band above the grille
  if (z > 0.55 && y > 0.155 && y < 0.235 && ax < 0.12) return "emblem";
  // front plate recess
  if (z > 0.58 && y > 0.04 && y < 0.135 && ax < 0.11 && n.z > 0.2) return "plate-f";
  if (z > 0.5 && y < 0.18) return "front-bumper";
  // pillars
  if (y > 0.245 && z > 0.0 && z < 0.26) return x < 0 ? "pillar-al" : "pillar-ar";
  if (n.y > 0.4 && y > 0.32 && z >= -0.56 && z <= 0.02) return "roof";
  if (y > 0.235 && z > -0.7 && z < -0.4 && ax > 0.1) return x < 0 ? "pillar-cl" : "pillar-cr";
  // rear glass surround, centre strip
  if (y > 0.23 && z <= -0.4 && z > -0.78 && ax <= 0.1 && n.y > 0.15) return "rear-gate";
  // sill band
  if (y < 0.02 && z > -0.44 && z < 0.3) return x < 0 ? "skirt-l" : "skirt-r";
  // the one door handle spot (left door, rear top)
  if (x < 0 && z > -0.4 && z < -0.29 && y > 0.16 && y < 0.215) return "door-handle";
  if (z > -0.435 && z < 0.1 && y < 0.25) return x < 0 ? "front-door-l" : "front-door-r";
  // fuel door on the left quarter
  if (x < 0 && z > -0.615 && z < -0.53 && y > 0.135 && y < 0.22) return "fuel";
  // rear arch band
  if (z > -0.615 && z < -0.435 && y < 0.24) return x < 0 ? "fender-rl" : "fender-rr";
  if (z >= 0.1 && z < 0.68) return x < 0 ? "fender-fl" : "fender-fr";
  // trunk corners
  if (n.y > 0.3 && z > -0.73 && z < -0.6 && x < -0.13) return "antenna";
  if (z < -0.735 && x > 0.12 && y > 0.21) return "spoiler";
  // rear plate on the tail panel
  if (z < -0.68 && n.z < -0.2 && y > 0.125 && y < 0.215 && ax < 0.11) return "plate-r";
  if (z < -0.66 && y < 0.17) return "rear-bumper";
  if ((n.y > 0.25 && z < -0.56 && y > 0.17) || (z < -0.72 && y > 0.2)) return "rear-gate";
  if (z <= -0.435) return x < 0 ? "rear-quarter-l" : "rear-quarter-r";
  // door window frames and roof rails between the glasses
  if (y > 0.3 && z > -0.44 && z < 0.06) return "roof";
  if (y >= 0.22 && z > -0.44 && z < 0.1) return x < 0 ? "front-door-l" : "front-door-r";
  return nearestSeed(p);
}

/** Interior (E tier) spots surface on the glass they are seen through; the windshield centre stays clear. */
export function classifyGlass(p: THREE.Vector3, n: THREE.Vector3): string | null {
  const { x, y, z } = v(p, n);
  if (Math.abs(n.x) > 0.4) {
    // side glass
    if (z > -0.42) return z > -0.16 ? (x < 0 ? "window-fl-f" : "window-fr-f") : x < 0 ? "window-fl-r" : "window-fr-r";
    return x < 0 ? "window-ql" : "window-qr";
  }
  if (n.z < -0.25 && z < -0.3) {
    // rear window
    if (y > 0.345) return "ceiling";
    if (y < 0.3 && Math.abs(x) > 0.1) return x < 0 ? "headrest-l" : "headrest-r";
    return "rear-window";
  }
  if (n.z > 0.25 && z > 0.0) {
    // windshield: only the bottom band is for sale (interior spots seen through it); the rest must stay clear
    if (y < 0.27) return x < 0 ? "dash" : "shift";
    return null;
  }
  return null;
}

/** Wheel rims: one zone per corner, resolved from the rim centre. */
export function classifyWheel(center: THREE.Vector3): string {
  const front = center.z > 0;
  const left = center.x < CX;
  return front ? (left ? "wheel-fl" : "wheel-fr") : left ? "wheel-rl" : "wheel-rr";
}

const SEEDS: [string, number, number, number][] = [
  ["bonnet", CX, 0.24, 0.45],
  ["roof", CX, 0.378, -0.2],
  ["rear-gate", CX, 0.26, -0.72],
  ["front-door-l", CX - 0.32, 0.12, -0.17],
  ["front-door-r", CX + 0.32, 0.12, -0.17],
  ["fender-fl", CX - 0.3, 0.15, 0.45],
  ["fender-fr", CX + 0.3, 0.15, 0.45],
  ["fender-rl", CX - 0.3, 0.12, -0.5],
  ["fender-rr", CX + 0.3, 0.12, -0.5],
  ["rear-quarter-l", CX - 0.28, 0.15, -0.68],
  ["rear-quarter-r", CX + 0.28, 0.15, -0.68],
  ["front-bumper", CX, 0.1, 0.72],
  ["rear-bumper", CX, 0.09, -0.82],
  ["skirt-l", CX - 0.31, 0.0, -0.06],
  ["skirt-r", CX + 0.31, 0.0, -0.06],
  ["pillar-al", CX - 0.24, 0.29, 0.12],
  ["pillar-ar", CX + 0.24, 0.29, 0.12],
  ["pillar-cl", CX - 0.2, 0.28, -0.55],
  ["pillar-cr", CX + 0.2, 0.28, -0.55],
];
const seedVecs = SEEDS.map(([id, x, y, z]) => ({ id, p: new THREE.Vector3(x, y, z) }));

function nearestSeed(p: THREE.Vector3): string {
  let best = seedVecs[0].id;
  let d = Infinity;
  for (const s of seedVecs) {
    const dd = s.p.distanceToSquared(p);
    if (dd < d) {
      d = dd;
      best = s.id;
    }
  }
  return best;
}

/* ---------- zone visual language ---------- */

// alternating paper-yellow tints so adjacent parcels read as separate; LP zones are ink
const TINTS = ["#F0DF75", "#FCF6CE", "#E0C42F", "#F6ECA6", "#CDB01F"];
export const ZONE_STYLE = {
  lpFill: "#2A2620",
  sold: "#F6F3EC",
  selected: "#FFE500",
  border: "#1E1B14",
  ink: "#1E1B14",
  lpInk: "#FFE500",
};

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function zoneFill(id: string, forSale: boolean, tint?: number) {
  if (!forSale) return ZONE_STYLE.lpFill;
  return TINTS[(tint ?? hash(id)) % TINTS.length];
}
