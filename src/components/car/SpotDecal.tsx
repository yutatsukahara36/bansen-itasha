"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Decal } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Spot } from "@/data/spots";
import type { Sponsor } from "@/data/sponsors";
import { drawTag, makeTagTexture, tagFontsReady } from "@/lib/tagTexture";
import { loadLogoTexture } from "@/lib/logoTexture";

type Props = {
  spot: Spot;
  sponsor?: Sponsor;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  override?: Spot["decal"]; // /dev/place live transform
  interactive?: boolean; // false: clicks pass through to the car surface (placement mode)
};

export const PEEL_MS = 900;
const PEEL_FREEZE: number | null =
  process.env.NODE_ENV !== "production" && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("peel")
    ? Number(new URLSearchParams(window.location.search).get("peel"))
    : null;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function useTagTexture(spot: Spot) {
  const tex = useMemo(() => makeTagTexture(spot), [spot]);
  useEffect(() => {
    let alive = true;
    tagFontsReady().then(() => {
      if (!alive) return;
      drawTag(tex.image as HTMLCanvasElement, spot);
      tex.needsUpdate = true;
    });
    return () => {
      alive = false;
    };
  }, [tex, spot]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function useLogoTexture(url?: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) return;
    let alive = true;
    let loaded: THREE.Texture | null = null;
    loadLogoTexture(url).then((t) => {
      if (!alive) return t.dispose();
      loaded = t;
      setTex(t);
    }).catch(console.error);
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [url]);
  return tex;
}

/**
 * The POP札 material with the 値札めくれ baked into the shader:
 * a diagonal wipe from the bottom-left corner discards the paper, and a thin band ahead of the edge
 * turns paper-white so it reads as the curled back of the tag being lifted off.
 */
function makePeelMaterial(map: THREE.Texture) {
  const uniforms = { uPeel: { value: 0 } };
  const mat = new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -8,
    roughness: 0.85,
    metalness: 0,
    side: THREE.FrontSide,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uPeel = uniforms.uPeel;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uPeel;")
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        float peelEdge = uPeel * 2.3;
        float pd = vMapUv.x + vMapUv.y;
        if (pd < peelEdge) discard;
        if (pd < peelEdge + 0.16) {
          float k = smoothstep(peelEdge, peelEdge + 0.16, pd);
          diffuseColor.rgb = mix(vec3(0.99, 0.975, 0.9), diffuseColor.rgb, k * 0.25);
        }`,
      );
  };
  return { mat, uniforms };
}

/**
 * One spot on its target mesh. Unsold: POP札. Sold: sponsor logo.
 * When a sponsor arrives while the tag is showing, the tag peels off and the logo is underneath.
 * Must be rendered as a child of the target mesh.
 */
export function SpotDecal({ spot, sponsor, hovered, onHover, onSelect, override, interactive = true }: Props) {
  const tag = useTagTexture(spot);
  const logo = useLogoTexture(sponsor?.logo);
  const d = override ?? spot.decal;

  const peel = useMemo(() => makePeelMaterial(tag), [tag]);
  useEffect(() => () => peel.mat.dispose(), [peel]);

  // tag lifecycle, driven inside the frame loop so no setState-in-effect
  const life = useRef({ hadSponsor: !!sponsor, start: 0, done: !!sponsor });
  const [tagGone, setTagGone] = useState(!!sponsor);

  // imperative three.js state driven per frame; React Compiler rules do not apply here
  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const s = life.current;
    if (sponsor && logo && !s.hadSponsor) {
      s.hadSponsor = true;
      s.start = performance.now();
    }
    if (!sponsor && s.hadSponsor) {
      // sponsor removed (dev only): put the tag back
      s.hadSponsor = false;
      s.done = false;
      peel.uniforms.uPeel.value = 0;
      setTagGone(false);
    }
    if (s.hadSponsor && !s.done) {
      const t = Math.min(1, (performance.now() - s.start) / PEEL_MS);
      peel.uniforms.uPeel.value = easeOutExpo(t);
      // dev only: /?sell=...&peel=0.45 freezes the peel to inspect a frame
      if (PEEL_FREEZE !== null) {
        peel.uniforms.uPeel.value = PEEL_FREEZE;
        return;
      }
      if (t >= 1) {
        s.done = true;
        setTagGone(true);
      }
    }
  });
  /* eslint-enable react-hooks/immutability */

  useEffect(() => {
    peel.mat.emissive.setHex(hovered ? 0x332a00 : 0x000000);
  }, [hovered, peel]);

  const events = interactive
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(spot.id);
        },
        onPointerOut: () => onHover(null),
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(spot.id);
        },
      }
    : { raycast: () => null };

  return (
    <>
      {sponsor && logo && (
        <Decal position={d.position} rotation={d.rotation} scale={d.scale} renderOrder={10} {...events}>
          <meshStandardMaterial
            map={logo}
            transparent
            depthTest
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-6}
            roughness={0.6}
            metalness={0}
            emissive={hovered ? "#222222" : "#000000"}
            side={THREE.FrontSide}
          />
        </Decal>
      )}
      {!tagGone && (
        <Decal position={d.position} rotation={d.rotation} scale={d.scale} renderOrder={11} {...events}>
          <primitive object={peel.mat} attach="material" />
        </Decal>
      )}
    </>
  );
}
