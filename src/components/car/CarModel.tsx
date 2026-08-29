"use client";
import { useEffect, useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { SPOTS, type Spot } from "@/data/spots";
import { SPONSORS, type Sponsor } from "@/data/sponsors";
import { makeMaterials, TRANSPARENT_MATERIALS } from "./materials";
import { useCarParts } from "./useCarParts";
import { SpotDecal } from "./SpotDecal";

export type PlaceHit = {
  point: [number, number, number];
  normal: [number, number, number];
  mesh: string;
  material: string;
};

type Props = {
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onReady?: () => void;
  spots?: Spot[]; // /dev/place passes live-edited spots
  sponsors?: Sponsor[];
  overrides?: Record<string, Spot["decal"]>;
  onPlace?: (hit: PlaceHit) => void;
  interactive?: boolean;
};

export function CarModel({ hoveredId, onHover, onSelect, onReady, spots = SPOTS, sponsors = SPONSORS, overrides, onPlace, interactive = true }: Props) {
  const parts = useCarParts();
  const materials = useMemo(() => makeMaterials(), []);
  useEffect(() => {
    onReady?.();
  }, [onReady, parts]);

  return (
    <group>
      {parts.map((p) => {
        const mat = materials[p.material] ?? materials._GREY;
        const transparent = TRANSPARENT_MATERIALS.has(p.material);
        const mine = spots.filter((s) => s.target.mesh === p.mesh && s.target.material === p.material);
        return (
          <mesh
            key={p.key}
            name={p.mesh}
            geometry={p.geometry}
            material={mat}
            castShadow={!transparent}
            renderOrder={transparent ? 5 : 0}
            onClick={
              onPlace && ["_MAIN_BODY", "_GLASS", "_MAG"].includes(p.material)
                ? (e: ThreeEvent<MouseEvent>) => {
                    e.stopPropagation();
                    if (!e.face) return;
                    onPlace({
                      point: [e.point.x, e.point.y, e.point.z],
                      normal: [e.face.normal.x, e.face.normal.y, e.face.normal.z],
                      mesh: p.mesh,
                      material: p.material,
                    });
                  }
                : undefined
            }
          >
            {mine.map((s) => (
              <SpotDecal
                key={s.id}
                spot={s}
                sponsor={sponsors.find((x) => x.spotId === s.id)}
                hovered={hoveredId === s.id}
                onHover={onHover}
                onSelect={onSelect}
                override={overrides?.[s.id]}
                interactive={interactive}
              />
            ))}
          </mesh>
        );
      })}
    </group>
  );
}
