import * as THREE from "three";
import type { Spot } from "@/data/spots";
import { yen } from "./format";
import { ZONE_STYLE } from "./zones";

/**
 * Flat zone label: name over price, hand-marker ink straight on the parcel. No paper, no tape.
 * LP zones get yellow ink on their dark fill and say only 非売品.
 */
export function drawZoneLabel(c: HTMLCanvasElement, spot: Spot) {
  const W = 512, H = 256;
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);
  const lp = !spot.forSale;
  ctx.fillStyle = lp ? ZONE_STYLE.lpInk : ZONE_STYLE.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (lp) {
    ctx.font = '400 88px DotGothic16, monospace';
    ctx.fillText("非売品", W / 2, 128);
  } else {
    ctx.font = `900 ${spot.nameJa.length > 9 ? 40 : 48}px "Zen Maru Gothic", sans-serif`;
    ctx.fillText(spot.nameJa, W / 2, 74);
    const price = yen(spot.price);
    ctx.font = `400 ${price.length > 8 ? 84 : 96}px DotGothic16, monospace`;
    ctx.fillText(price, W / 2, 168);
  }
}

export function makeZoneLabelTexture(spot: Spot) {
  const c = document.createElement("canvas");
  drawZoneLabel(c, spot);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
