import * as THREE from "three";
import type { CarPart } from "@/components/car/useCarParts";
import { classifyBody, classifyGlass, classifyWheel } from "./zones";

export type ZoneKind = "body" | "glass" | "wheel";

export type Zone = {
  id: string;
  kind: ZoneKind;
  geometry: THREE.BufferGeometry;
  centroid: THREE.Vector3;
  normal: THREE.Vector3;
  area: number;
  labelRotation: [number, number, number];
  labelSize: number; // world width of the label decal
  tint: number; // index into the tint palette, chosen so neighbours differ
};

export type ZoneMap = {
  zones: Zone[];
  rest: { key: string; material: string; geometry: THREE.BufferGeometry }[];
  borders: Float32Array;
};

const quant = (n: number) => Math.round(n * 2000);
const vkey = (x: number, y: number, z: number) => `${quant(x)},${quant(y)},${quant(z)}`;

type Tri = { ia: number; ib: number; ic: number; label: string | null; n: THREE.Vector3; edges: [string, string, string] };

/** Classify every triangle, then smooth labels by majority vote so borders stop being triangle confetti. */
function partition(geometry: THREE.BufferGeometry, classify: (p: THREE.Vector3, n: THREE.Vector3) => string | null) {
  const pos = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const count = index ? index.count : pos.count;
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  const cent = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3();
  const tris: Tri[] = [];
  const edgeToTris = new Map<string, number[]>();

  for (let i = 0; i < count; i += 3) {
    const ia = index ? index.getX(i) : i;
    const ib = index ? index.getX(i + 1) : i + 1;
    const ic = index ? index.getX(i + 2) : i + 2;
    A.fromBufferAttribute(pos, ia);
    B.fromBufferAttribute(pos, ib);
    C.fromBufferAttribute(pos, ic);
    cent.copy(A).add(B).add(C).multiplyScalar(1 / 3);
    ab.copy(B).sub(A);
    ac.copy(C).sub(A);
    const n = new THREE.Vector3().copy(ab).cross(ac).normalize();
    const ka = vkey(A.x, A.y, A.z), kb = vkey(B.x, B.y, B.z), kc = vkey(C.x, C.y, C.z);
    const e = (p: string, q: string) => (p < q ? p + "|" + q : q + "|" + p);
    const edges: [string, string, string] = [e(ka, kb), e(kb, kc), e(kc, ka)];
    const ti = tris.length;
    tris.push({ ia, ib, ic, label: classify(cent, n), n, edges });
    for (const ek of edges) {
      let list = edgeToTris.get(ek);
      if (!list) edgeToTris.set(ek, (list = []));
      list.push(ti);
    }
  }

  // majority smoothing: a triangle takes its neighbours' label when at least two agree against it
  for (let pass = 0; pass < 3; pass++) {
    let changed = 0;
    const next: (string | null)[] = tris.map((t) => t.label);
    for (let ti = 0; ti < tris.length; ti++) {
      const t = tris[ti];
      const counts = new Map<string | null, number>();
      for (const ek of t.edges) {
        for (const nb of edgeToTris.get(ek)!) {
          if (nb === ti) continue;
          const l = tris[nb].label;
          counts.set(l, (counts.get(l) ?? 0) + 1);
        }
      }
      let bestLabel: string | null = t.label;
      let best = 0;
      for (const [l, cnt] of counts) {
        if (cnt > best) {
          best = cnt;
          bestLabel = l;
        }
      }
      if (best >= 2 && bestLabel !== t.label) {
        next[ti] = bestLabel;
        changed++;
      }
    }
    tris.forEach((t, i) => (t.label = next[i]));
    if (!changed) break;
  }

  // buckets and border edges from the smoothed labels
  const buckets = new Map<string, number[]>();
  const restIdx: number[] = [];
  for (const t of tris) {
    if (!t.label) {
      restIdx.push(t.ia, t.ib, t.ic);
      continue;
    }
    let b = buckets.get(t.label);
    if (!b) buckets.set(t.label, (b = []));
    b.push(t.ia, t.ib, t.ic);
  }
  const borders: { a: number; b: number; n: THREE.Vector3 }[] = [];
  const adjacency = new Map<string, Set<string>>();
  const seen = new Set<string>();
  for (const [ek, list] of edgeToTris) {
    if (seen.has(ek)) continue;
    seen.add(ek);
    const labels = new Set(list.map((ti) => tris[ti].label));
    if (labels.size < 2) continue;
    const t = tris[list[0]];
    const which = t.edges.indexOf(ek);
    const pair: [number, number] = which === 0 ? [t.ia, t.ib] : which === 1 ? [t.ib, t.ic] : [t.ic, t.ia];
    borders.push({ a: pair[0], b: pair[1], n: t.n });
    for (const l1 of labels) {
      if (!l1) continue;
      for (const l2 of labels) {
        if (!l2 || l1 === l2) continue;
        if (!adjacency.has(l1)) adjacency.set(l1, new Set());
        adjacency.get(l1)!.add(l2);
      }
    }
  }
  return { buckets, restIdx, borders, adjacency, pos };
}

function zoneGeometry(source: THREE.BufferGeometry, indices: number[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", source.getAttribute("position"));
  g.setAttribute("normal", source.getAttribute("normal"));
  if (source.getAttribute("uv")) g.setAttribute("uv", source.getAttribute("uv"));
  g.setIndex(indices);
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

function zoneStats(g: THREE.BufferGeometry) {
  const pos = g.getAttribute("position");
  const index = g.getIndex()!;
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), cr = new THREE.Vector3();
  const centroid = new THREE.Vector3();
  const normal = new THREE.Vector3();
  let area = 0;
  for (let i = 0; i < index.count; i += 3) {
    A.fromBufferAttribute(pos, index.getX(i));
    B.fromBufferAttribute(pos, index.getX(i + 1));
    C.fromBufferAttribute(pos, index.getX(i + 2));
    ab.copy(B).sub(A);
    ac.copy(C).sub(A);
    cr.copy(ab).cross(ac);
    const a = cr.length() / 2;
    area += a;
    centroid.addScaledVector(A, a / 3).addScaledVector(B, a / 3).addScaledVector(C, a / 3);
    normal.addScaledVector(cr, 0.5);
  }
  if (area > 0) centroid.multiplyScalar(1 / area);
  normal.normalize();
  return { centroid, normal, area };
}

function labelRotation(centroid: THREE.Vector3, n: THREE.Vector3): [number, number, number] {
  const helper = new THREE.Object3D();
  let up: THREE.Vector3;
  if (Math.abs(n.y) < 0.88) {
    up = new THREE.Vector3(0, 1, 0);
  } else {
    up = new THREE.Vector3(0, 0, centroid.z > 0.1 ? -1 : 1);
  }
  const right = new THREE.Vector3().crossVectors(up, n).normalize();
  const trueUp = new THREE.Vector3().crossVectors(n, right).normalize();
  const m = new THREE.Matrix4().makeBasis(right, trueUp, n);
  helper.setRotationFromMatrix(m);
  return [helper.rotation.x, helper.rotation.y, helper.rotation.z];
}

export const TINT_COUNT = 5;

/** Greedy colouring: neighbouring parcels never share a tint. */
function assignTints(ids: string[], adjacency: Map<string, Set<string>>) {
  const tint = new Map<string, number>();
  const sorted = [...ids].sort((a, b) => (adjacency.get(b)?.size ?? 0) - (adjacency.get(a)?.size ?? 0));
  for (const id of sorted) {
    const used = new Set<number>();
    for (const nb of adjacency.get(id) ?? []) {
      const t = tint.get(nb);
      if (t !== undefined) used.add(t);
    }
    let pick = 0;
    while (used.has(pick % TINT_COUNT) && pick < TINT_COUNT) pick++;
    tint.set(id, pick % TINT_COUNT);
  }
  return tint;
}

export function buildZones(parts: CarPart[]): ZoneMap {
  const zones: Zone[] = [];
  const rest: ZoneMap["rest"] = [];
  const borderPositions: number[] = [];
  const adjacencyAll = new Map<string, Set<string>>();
  const zoneIds: string[] = [];

  const handleSurface = (part: CarPart, classify: (p: THREE.Vector3, n: THREE.Vector3) => string | null, kind: ZoneKind) => {
    const { buckets, restIdx, borders, adjacency, pos } = partition(part.geometry, classify);
    for (const [id, set] of adjacency) {
      if (!adjacencyAll.has(id)) adjacencyAll.set(id, new Set());
      for (const o of set) adjacencyAll.get(id)!.add(o);
    }
    for (const [id, idx] of buckets) {
      const g = zoneGeometry(part.geometry, idx);
      const { centroid, normal, area } = zoneStats(g);
      const labelSize = THREE.MathUtils.clamp(0.85 * Math.sqrt(area), 0.075, 0.3);
      zones.push({ id, kind, geometry: g, centroid, normal, area, labelRotation: labelRotation(centroid, normal), labelSize, tint: 0 });
      zoneIds.push(id);
    }
    if (restIdx.length) rest.push({ key: part.key + "/rest", material: part.material, geometry: zoneGeometry(part.geometry, restIdx) });
    const a = new THREE.Vector3(), b = new THREE.Vector3();
    for (const e of borders) {
      a.fromBufferAttribute(pos, e.a);
      b.fromBufferAttribute(pos, e.b);
      const off = 0.0018;
      borderPositions.push(
        a.x + e.n.x * off, a.y + e.n.y * off, a.z + e.n.z * off,
        b.x + e.n.x * off, b.y + e.n.y * off, b.z + e.n.z * off,
      );
    }
  };

  for (const part of parts) {
    if (part.material === "_MAIN_BODY") handleSurface(part, classifyBody, "body");
    else if (part.material === "_GLASS") handleSurface(part, classifyGlass, "glass");
    else if (part.material === "_MAG") {
      part.geometry.computeBoundingBox();
      const center = part.geometry.boundingBox!.getCenter(new THREE.Vector3());
      const id = classifyWheel(center);
      const { area } = zoneStats(part.geometry);
      const outward = new THREE.Vector3(center.x < -0.04 ? -1 : 1, 0, 0);
      zones.push({
        id,
        kind: "wheel",
        geometry: part.geometry,
        centroid: center.clone(),
        normal: outward,
        area,
        labelRotation: labelRotation(center, outward),
        labelSize: 0.11,
        tint: 0,
      });
      zoneIds.push(id);
    } else {
      rest.push({ key: part.key, material: part.material, geometry: part.geometry });
    }
  }

  const tints = assignTints(zoneIds, adjacencyAll);
  for (const z of zones) z.tint = tints.get(z.id) ?? 0;

  return { zones, rest, borders: new Float32Array(borderPositions) };
}
