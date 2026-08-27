import * as THREE from "three";
import { TAG_H, TAG_W } from "./tagTexture";

/**
 * Sponsor logo as a decal texture: the real logo file, contain-fit into the tag aspect with padding,
 * printed straight on the paint (transparent background), the way a 痛車 wrap is.
 */
export function loadLogoTexture(url: string): Promise<THREE.CanvasTexture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = TAG_W;
      c.height = TAG_H;
      const ctx = c.getContext("2d")!;
      const pad = 36;
      const iw = img.naturalWidth || img.width || 400;
      const ih = img.naturalHeight || img.height || 200;
      const k = Math.min((TAG_W - pad * 2) / iw, (TAG_H - pad * 2) / ih);
      const w = iw * k, h = ih * k;
      ctx.drawImage(img, (TAG_W - w) / 2, (TAG_H - h) / 2, w, h);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      resolve(tex);
    };
    img.onerror = () => reject(new Error("logo failed: " + url));
    img.src = url;
  });
}
