"use client";
import { useEffect, useMemo } from "react";
import { SPOTS, type Spot } from "@/data/spots";
import { SPONSORS, type Sponsor } from "@/data/sponsors";
import { makeMaterials, TRANSPARENT_MATERIALS } from "./materials";
import { useCarParts } from "./useCarParts";
import { SpotDecal } from "./SpotDecal";

type Props = {
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onReady?: () => void;
  spots?: Spot[]; // /dev/place passes live-edited spots
  sponsors?: Sponsor[];
  overrides?: Record<string, Spot["decal"]>;
};

export function CarModel({ hoveredId, onHover, onSelect, onReady, spots = SPOTS, sponsors = SPONSORS, overrides }: Props) {
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
              />
            ))}
          </mesh>
        );
      })}
    </group>
  );
}
