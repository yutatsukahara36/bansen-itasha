import * as THREE from "three";
import type { Spot } from "@/data/spots";
import { yen } from "./format";

// Deterministic pseudo random per spot so tags are crooked the same way on every load
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}
export const rnd = (seed: string, i: number) => hash(seed + ":" + i);

const YELLOW = "#FFE500";
const INK = "#1E1B14";
const TAPE = "rgba(255,250,225,0.72)";

function wobblyRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: string, amp: number) {
  const steps = 14;
  const pts: [number, number][] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number, k: number) => {
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      pts.push([
        x0 + (x1 - x0) * t + (rnd(seed, k * 100 + i) - 0.5) * amp,
        y0 + (y1 - y0) * t + (rnd(seed, k * 100 + i + 50) - 0.5) * amp,
      ]);
    }
  };
  edge(x, y, x + w, y, 1);
  edge(x + w, y, x + w, y + h, 2);
  edge(x + w, y + h, x, y + h, 3);
  edge(x, y + h, x, y, 4);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

export const TAG_W = 640;
export const TAG_H = 448;

/** Draws a ヴィレヴァン-style POP札 for an unsold spot into a canvas. */
export function drawTag(c: HTMLCanvasElement, spot: Spot) {
  const W = TAG_W, H = TAG_H;
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);
  const isLP = !spot.forSale;
  const pad = 28;
  const paper = isLP ? INK : YELLOW;
  const ink = isLP ? YELLOW : INK;

  ctx.save();
  wobblyRect(ctx, pad, pad, W - pad * 2, H - pad * 2, spot.id, 6);
  ctx.fillStyle = paper;
  ctx.fill();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 15;
  ctx.stroke();
  wobblyRect(ctx, pad + 5, pad + 5, W - pad * 2 - 10, H - pad * 2 - 10, spot.id + "b", 5);
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${spot.nameJa.length > 9 ? 44 : 52}px "Zen Maru Gothic", sans-serif`;
  ctx.fillText(spot.nameJa, W / 2, 116);

  if (isLP) {
    // 非売品 only: no partner name, no count. Nothing on the car announces "0 partners".
    ctx.font = '400 128px DotGothic16, monospace';
    ctx.fillText("非売品", W / 2, 250);
  } else {
    const price = yen(spot.price);
    ctx.font = `400 ${price.length > 8 ? 118 : 132}px DotGothic16, monospace`;
    ctx.fillText(price, W / 2, 250);
    ctx.font = '700 32px "Zen Maru Gothic", sans-serif';
    ctx.fillText(spot.note ? spot.note + " / 先着1社" : "先着1社", W / 2, 352);
  }

  ctx.save();
  ctx.translate(W / 2, pad + 6);
  ctx.rotate((rnd(spot.id, 9) - 0.5) * 0.12);
  ctx.fillStyle = TAPE;
  ctx.fillRect(-110, -22, 220, 44);
  ctx.restore();
}

export function makeTagTexture(spot: Spot) {
  const c = document.createElement("canvas");
  drawTag(c, spot);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Resolves once both faces are usable in canvas. */
export function tagFontsReady() {
  if (typeof document === "undefined" || !("fonts" in document)) return Promise.resolve();
  return Promise.all([
    document.fonts.load('400 120px DotGothic16'),
    document.fonts.load('900 52px "Zen Maru Gothic"'),
  ]).then(() => undefined, () => undefined);
}
