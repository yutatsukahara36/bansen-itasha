import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { Spot } from "@/data/spots";
import { generateSpotsTs } from "@/lib/spotsFile";

export const runtime = "nodejs";

const TIERS = new Set(["S", "A", "B", "C", "D", "E", "LP"]);
const isVec3 = (a: unknown): a is [number, number, number] => Array.isArray(a) && a.length === 3 && a.every((n) => Number.isFinite(n));

function valid(s: unknown): s is Spot {
  if (!s || typeof s !== "object") return false;
  const o = s as Record<string, unknown>;
  const t = o.target as Record<string, unknown> | undefined;
  const d = o.decal as Record<string, unknown> | undefined;
  return (
    typeof o.id === "string" && /^[\w-]{1,40}$/.test(o.id) &&
    typeof o.nameJa === "string" && o.nameJa.length > 0 && o.nameJa.length <= 40 &&
    TIERS.has(o.tier as string) &&
    typeof o.price === "number" && Number.isFinite(o.price) && o.price >= 0 &&
    typeof o.forSale === "boolean" &&
    (o.note === undefined || (typeof o.note === "string" && o.note.length <= 60)) &&
    !!t && typeof t.mesh === "string" && typeof t.material === "string" &&
    !!d && isVec3(d.position) && isVec3(d.rotation) && isVec3(d.scale)
  );
}

/** Dev-only: /dev/place saves the edited spot list straight into src/data/spots.ts. */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "not found" }, { status: 404 });
  let body: { spots?: unknown[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const spots = body.spots;
  if (!Array.isArray(spots) || spots.length === 0 || spots.length > 100 || !spots.every(valid)) {
    return NextResponse.json({ error: "invalid spots" }, { status: 422 });
  }
  const ids = new Set(spots.map((s) => s.id));
  if (ids.size !== spots.length) return NextResponse.json({ error: "duplicate ids" }, { status: 422 });
  const file = path.join(process.cwd(), "src", "data", "spots.ts");
  await writeFile(file, generateSpotsTs(spots as Spot[]), "utf8");
  const sum = (spots as Spot[]).filter((s) => s.forSale).reduce((a, s) => a + s.price, 0);
  console.log("[dev/spots] saved", spots.length, "spots, for-sale sum", sum);
  return NextResponse.json({ ok: true, count: spots.length, forSaleSum: sum });
}
