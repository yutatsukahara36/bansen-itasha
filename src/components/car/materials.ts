import * as THREE from "three";

/**
 * The GLB has 12 flat-colour materials and no textures. Lighting does all the work.
 * Fixes from the model appendix: transparent glass, non-metallic clearcoat paint, single-sided body, recoloured _BLACK/_GREY.
 */
export function makeMaterials(): Record<string, THREE.Material> {
  const paint = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#F4F1EA"),
    metalness: 0,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1,
    side: THREE.FrontSide,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#2a2f33"),
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.42,
    envMapIntensity: 1.3,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const headlightGlass = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#dfe6ea"),
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.35,
    envMapIntensity: 1.3,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const m: Record<string, THREE.Material> = {
    _MAIN_BODY: paint,
    _GLASS: glass,
    _HEADLIGHT_GLASS: headlightGlass,
    _BLACK: new THREE.MeshStandardMaterial({ color: "#141416", roughness: 0.55, metalness: 0.1 }),
    _GREY: new THREE.MeshStandardMaterial({ color: "#2b2b2e", roughness: 0.8, metalness: 0 }),
    _CHROME: new THREE.MeshStandardMaterial({ color: "#e8e8ec", roughness: 0.18, metalness: 1 }),
    _METAL: new THREE.MeshStandardMaterial({ color: "#e8e8ec", roughness: 0.18, metalness: 1 }),
    _MAG: new THREE.MeshStandardMaterial({ color: "#d9d9dc", roughness: 0.35, metalness: 0.9 }),
    _TIRE: new THREE.MeshStandardMaterial({ color: "#0f0f10", roughness: 0.95, metalness: 0 }),
    _BREAK_LIGHT: new THREE.MeshStandardMaterial({ color: "#b3111a", roughness: 0.2, metalness: 0.1, emissive: "#3a0004" }),
    _HEAD_LIGHT: new THREE.MeshStandardMaterial({ color: "#f2f2f0", roughness: 0.25, metalness: 0.6 }),
    _YELLOW_LIGHT: new THREE.MeshStandardMaterial({ color: "#f2f2f0", roughness: 0.25, metalness: 0.6 }),
  };
  for (const mat of Object.values(m)) mat.name = Object.keys(m).find((k) => m[k] === mat)!;
  return m;
}

export const TRANSPARENT_MATERIALS = new Set(["_GLASS", "_HEADLIGHT_GLASS"]);
