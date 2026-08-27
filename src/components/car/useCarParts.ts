"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";

export const CAR_URL = "/models/car.glb";

export type CarPart = {
  key: string;
  mesh: string; // GLTF object name, e.g. MAIN_BODY, MAIN_BODY_3, WHEEL_1
  material: string; // material name, e.g. _MAIN_BODY
  geometry: THREE.BufferGeometry;
};

/**
 * Loads the Draco GLB and bakes every node transform into its geometry so that all parts live in one
 * car space (identity transforms). Decal positions in spots.ts are in that space, and drei <Decal>
 * computes in the parent's local space, so parent local must equal car space.
 */
export function useCarParts(): CarPart[] {
  const gltf = useGLTF(CAR_URL) as unknown as GLTF;
  return useMemo(() => {
    gltf.scene.updateMatrixWorld(true);
    const parts: CarPart[] = [];
    gltf.scene.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
      const mesh = o as THREE.Mesh;
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      const material = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).name;
      parts.push({ key: `${mesh.name}/${material}`, mesh: mesh.name, material, geometry });
    });
    return parts;
  }, [gltf]);
}

useGLTF.preload(CAR_URL);
