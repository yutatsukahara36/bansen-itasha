"use client";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CarModel } from "./CarModel";
import type { Spot } from "@/data/spots";
import type { Sponsor } from "@/data/sponsors";

export const GROUND_Y = -0.064;
export const CAMERA = { position: [1.75, 0.78, 1.95] as [number, number, number], target: [-0.04, 0.1, -0.05] as [number, number, number], fov: 30 };

/** Portrait phones: widen the fov so the whole car fits above the counter. */
function ResponsiveFov({ base }: { base: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    // three.js camera is an imperative object; mutation here is the R3F norm
    // eslint-disable-next-line react-hooks/immutability
    cam.fov = aspect < 0.9 ? base * (1.15 + (0.9 - aspect) * 1.3) : base;
    cam.updateProjectionMatrix();
  }, [camera, size, base]);
  return null;
}

/** Studio light built from lightformers, no HDR download. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#d8d4c8"]} />
      <Lightformer intensity={3.2} form="rect" position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[6, 4, 1]} color="#fffaf0" />
      <Lightformer intensity={1.4} form="rect" position={[-5, 2, 0]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} color="#fff4d6" />
      <Lightformer intensity={1.6} form="rect" position={[5, 2, 1]} rotation-y={-Math.PI / 2} scale={[4, 2, 1]} color="#f6f6ff" />
      <Lightformer intensity={0.9} form="rect" position={[0, 1.5, -5]} scale={[6, 1.5, 1]} color="#fff0c0" />
      <Lightformer intensity={0.6} form="rect" position={[0, 1, 5]} rotation-y={Math.PI} scale={[6, 1.2, 1]} color="#ffffff" />
    </Environment>
  );
}

function Floor({ disc = true }: { disc?: boolean }) {
  return (
    <group position={[-0.04, GROUND_Y, -0.09]}>
      {disc && (
        <mesh rotation-x={-Math.PI / 2} position-y={-0.002} renderOrder={-2}>
          <circleGeometry args={[1.75, 96]} />
          <meshBasicMaterial color="#FFE500" />
        </mesh>
      )}
      <ContactShadows position={[0, 0.001, 0]} opacity={0.55} scale={3.2} blur={2.4} far={0.9} resolution={1024} color="#5a4a00" frames={1} />
    </group>
  );
}

type Props = {
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onReady?: () => void;
  autoRotate?: boolean;
  disc?: boolean;
  spots?: Spot[];
  sponsors?: Sponsor[];
  overrides?: Record<string, Spot["decal"]>;
  children?: ReactNode; // extra scene content (dev gizmo)
  controlsRef?: React.RefObject<OrbitControlsImpl | null>;
  className?: string;
};

export function CarScene({ hoveredId, onHover, onSelect, onReady, autoRotate = true, disc = true, spots, sponsors, overrides, children, controlsRef, className = "" }: Props) {
  const localControls = useRef<OrbitControlsImpl | null>(null);
  const ref = controlsRef ?? localControls;
  const [rotating, setRotating] = useState(autoRotate);

  return (
    <div className={`absolute inset-0 cursor-marker ${hoveredId ? "is-hover" : ""} ${className}`} style={{ touchAction: "none" }}>
      <Canvas
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        camera={{ position: CAMERA.position, fov: CAMERA.fov, near: 0.05, far: 50 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <ResponsiveFov base={CAMERA.fov} />
        <Suspense fallback={null}>
          <Studio />
          <directionalLight
            position={[1.5, 3.2, 1.8]}
            intensity={2.4}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0004}
            shadow-normalBias={0.01}
            shadow-radius={6}
          >
            <orthographicCamera attach="shadow-camera" args={[-1.4, 1.4, 1.4, -1.4, 0.5, 10]} />
          </directionalLight>
          <directionalLight position={[-2.5, 1.5, -1.5]} intensity={0.6} color="#fff3c0" />
          <Floor disc={disc} />
          <CarModel hoveredId={hoveredId} onHover={onHover} onSelect={onSelect} onReady={onReady} spots={spots} sponsors={sponsors} overrides={overrides} />
          {children}
        </Suspense>
        <OrbitControls
          ref={ref}
          target={CAMERA.target}
          enableDamping
          dampingFactor={0.08}
          minDistance={1.2}
          maxDistance={5}
          maxPolarAngle={Math.PI / 2 - 0.02}
          enablePan={false}
          autoRotate={rotating}
          autoRotateSpeed={0.35}
          onStart={() => setRotating(false)}
        />
      </Canvas>
    </div>
  );
}
