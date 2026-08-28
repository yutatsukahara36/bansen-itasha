"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Decal } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { LineMaterial, LineSegments2, LineSegmentsGeometry } from "three-stdlib";
import { SPOTS, spotById, type Spot } from "@/data/spots";
import { SPONSORS, type Sponsor } from "@/data/sponsors";
import { makeMaterials, TRANSPARENT_MATERIALS } from "./materials";
import { useCarParts } from "./useCarParts";
import { buildZones, type Zone } from "@/lib/zoneBuild";
import { zoneFill, ZONE_STYLE } from "@/lib/zones";
import { drawZoneLabel, makeZoneLabelTexture } from "@/lib/zoneLabel";
import { loadLogoTexture } from "@/lib/logoTexture";
import { tagFontsReady } from "@/lib/tagTexture";

type Props = {
  hoveredId: string | null;
  selectedId?: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onReady?: () => void;
  spots?: Spot[];
  sponsors?: Sponsor[];
  overrides?: Record<string, Spot["decal"]>; // legacy, unused in zone display
};

function useZoneMaterial(zone: Zone, spot: Spot | undefined, state: "idle" | "hover" | "selected" | "dim", sold: boolean) {
  const mat = useMemo(() => {
    const glass = zone.kind === "glass";
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ffffff"),
      metalness: 0,
      roughness: glass ? 0.3 : 0.55,
      clearcoat: glass ? 0 : 0.35,
      clearcoatRoughness: 0.18,
      envMapIntensity: 0.45,
      transparent: glass,
      opacity: glass ? 0.72 : 1,
      depthWrite: !glass,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
    });
    return m;
  }, [zone.kind]);
  useEffect(() => {
    const forSale = spot ? spot.forSale : true;
    const base = sold ? ZONE_STYLE.sold : zoneFill(zone.id, forSale, zone.tint);
    const target =
      state === "selected" ? ZONE_STYLE.selected : state === "hover" ? new THREE.Color(base).lerp(new THREE.Color(ZONE_STYLE.selected), 0.55).getStyle() : base;
    mat.color.set(target);
    if (state === "dim") mat.color.lerp(new THREE.Color("#f4efdf"), 0.55);
    mat.emissive.setHex(state === "hover" || state === "selected" ? 0x141000 : 0x000000);
  }, [mat, state, sold, spot, zone]);
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

function useZoneLabel(spot: Spot | undefined) {
  const tex = useMemo(() => (spot ? makeZoneLabelTexture(spot) : null), [spot]);
  useEffect(() => {
    if (!tex || !spot) return;
    let alive = true;
    tagFontsReady().then(() => {
      if (!alive) return;
      drawZoneLabel(tex.image as HTMLCanvasElement, spot);
      tex.needsUpdate = true;
    });
    return () => {
      alive = false;
    };
  }, [tex, spot]);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

function useLogoTexture(url?: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) return;
    let alive = true;
    let loaded: THREE.Texture | null = null;
    loadLogoTexture(url)
      .then((t) => {
        if (!alive) return t.dispose();
        loaded = t;
        setTex(t);
      })
      .catch(console.error);
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [url]);
  return tex;
}

function ZoneMesh({
  zone,
  spot,
  sponsor,
  state,
  onHover,
  onSelect,
}: {
  zone: Zone;
  spot?: Spot;
  sponsor?: Sponsor;
  state: "idle" | "hover" | "selected" | "dim";
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const mat = useZoneMaterial(zone, spot, state, !!sponsor);
  const label = useZoneLabel(sponsor ? undefined : spot);
  const logo = useLogoTexture(sponsor?.logo);
  const map = sponsor ? logo : label;
  const w = zone.labelSize;
  const isLp = spot ? !spot.forSale : false;
  return (
    <mesh
      geometry={zone.geometry}
      material={mat}
      castShadow={zone.kind === "body"}
      renderOrder={zone.kind === "glass" ? 5 : 0}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onHover(zone.id);
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(zone.id);
      }}
    >
      {map && (
        <Decal
          position={[zone.centroid.x, zone.centroid.y, zone.centroid.z]}
          rotation={zone.labelRotation}
          scale={[w, sponsor ? w * 0.7 : w * 0.5, Math.max(0.04, w * 0.5)]}
          renderOrder={10}
        >
          <meshBasicMaterial
            map={map}
            transparent
            depthTest
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-6}
            toneMapped={false}
            opacity={isLp && !sponsor ? 1 : 0.92}
          />
        </Decal>
      )}
    </mesh>
  );
}

/** Ink border lines between parcels, drawn in screen-space pixels so they stay readable. */
function Borders({ positions }: { positions: Float32Array }) {
  const { size } = useThree();
  const line = useMemo(() => {
    const geo = new LineSegmentsGeometry();
    geo.setPositions(Array.from(positions));
    const mat = new LineMaterial({ color: 0x1e1b14, linewidth: 1.6, worldUnits: false, transparent: true, opacity: 0.9 });
    const l = new LineSegments2(geo, mat);
    l.computeLineDistances();
    l.renderOrder = 2;
    return l;
  }, [positions]);
  useEffect(() => {
    (line.material as LineMaterial).resolution.set(size.width, size.height);
  }, [line, size]);
  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as LineMaterial).dispose();
    },
    [line],
  );
  return <primitive object={line} />;
}

/**
 * The parcel-map car: every paintable triangle belongs to one of the 45 zones.
 * Unsold zone: tinted parcel + ink border + flat name/price label. Sold: paper fill + sponsor logo.
 * Non-paintable trim (lights, chrome, tires, windshield centre) keeps its real material.
 */
export function CarModel({ hoveredId, selectedId = null, onHover, onSelect, onReady, spots = SPOTS, sponsors = SPONSORS }: Props) {
  const parts = useCarParts();
  const materials = useMemo(() => makeMaterials(), []);
  const zoneMap = useMemo(() => buildZones(parts), [parts]);
  const ready = useRef(false);
  useEffect(() => {
    if (!ready.current && zoneMap.zones.length) {
      ready.current = true;
      onReady?.();
    }
  }, [onReady, zoneMap]);

  const spotOf = (id: string) => spots.find((s) => s.id === id) ?? spotById(id);

  return (
    <group>
      {zoneMap.rest.map((p) => {
        const mat = materials[p.material] ?? materials._GREY;
        const transparent = TRANSPARENT_MATERIALS.has(p.material);
        return <mesh key={p.key} geometry={p.geometry} material={mat} castShadow={!transparent} renderOrder={transparent ? 5 : 0} />;
      })}
      {zoneMap.zones.map((z) => {
        const state = selectedId === z.id ? "selected" : hoveredId === z.id ? "hover" : selectedId ? "dim" : "idle";
        return (
          <ZoneMesh
            key={z.id + "/" + z.kind + z.geometry.uuid}
            zone={z}
            spot={spotOf(z.id)}
            sponsor={sponsors.find((s) => s.spotId === z.id)}
            state={state}
            onHover={onHover}
            onSelect={onSelect}
          />
        );
      })}
      <Borders positions={zoneMap.borders} />
    </group>
  );
}
