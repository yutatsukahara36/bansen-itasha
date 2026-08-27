"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { SPOTS, type Spot } from "@/data/spots";
import { TIER_ORDER } from "@/data/tiers";

const CarScene = dynamic(() => import("@/components/car/CarScene").then((m) => m.CarScene), { ssr: false });

type Decal = Spot["decal"];
type Mode = "translate" | "rotate" | "scale";

const round = (v: number) => +v.toFixed(4);
function setOrbit(orbit: React.RefObject<OrbitControlsImpl | null>, enabled: boolean) {
  const c = orbit.current;
   
  if (c) c.enabled = enabled;
}
const fmt = (a: number[]) => "[" + a.map(round).join(", ") + "]";

function Gizmo({ decal, mode, onChange, orbit }: { decal: Decal; mode: Mode; onChange: (d: Decal) => void; orbit: React.RefObject<OrbitControlsImpl | null> }) {
  const [obj, setObj] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (!obj) return;
    obj.position.set(...decal.position);
    obj.rotation.set(...decal.rotation);
    obj.scale.set(...decal.scale);
  }, [decal, obj]);
  return (
    <>
      {obj && (
        <TransformControls
          object={obj}
          mode={mode}
          size={0.6}
          onMouseDown={() => setOrbit(orbit, false)}
          onMouseUp={() => setOrbit(orbit, true)}
          onObjectChange={() => {
            onChange({
              position: [obj.position.x, obj.position.y, obj.position.z].map(round) as Decal["position"],
              rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z].map(round) as Decal["rotation"],
              scale: [obj.scale.x, obj.scale.y, obj.scale.z].map(round) as Decal["scale"],
            });
          }}
        />
      )}
      <group ref={setObj}>
        {/* the projector box: shows the decal volume being projected */}
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ff0055" wireframe transparent opacity={0.6} />
        </mesh>
        <arrowHelper args={[new THREE.Vector3(0, 0, -1), new THREE.Vector3(), 1.2, 0xff0055]} />
      </group>
    </>
  );
}

export function PlaceTool() {
  const [overrides, setOverrides] = useState<Record<string, Decal>>({});
  const [selected, setSelected] = useState<string>(SPOTS[0].id);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("translate");
  const [copied, setCopied] = useState(false);
  const orbit = useRef<OrbitControlsImpl | null>(null);

  const spots = useMemo(() => SPOTS.map((s) => ({ ...s, decal: overrides[s.id] ?? s.decal })), [overrides]);
  const current = spots.find((s) => s.id === selected)!;

  const setDecal = useCallback((d: Decal) => setOverrides((o) => ({ ...o, [selected]: d })), [selected]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("place-overrides");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setOverrides(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("place-overrides", JSON.stringify(overrides));
    } catch {}
  }, [overrides]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "g") setMode("translate");
      if (e.key === "r") setMode("rotate");
      if (e.key === "s") setMode("scale");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const json = useMemo(
    () =>
      spots
        .map((s) => `  { id: '${s.id}', decal: { position: ${fmt(s.decal.position)}, rotation: ${fmt(s.decal.rotation)}, scale: ${fmt(s.decal.scale)} } },`)
        .join("\n"),
    [spots],
  );

  const copy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const nudge = (axis: 0 | 1 | 2, delta: number, what: "position" | "rotation" | "scale") => {
    const d = { ...current.decal, [what]: [...current.decal[what]] as Decal["position"] };
    d[what][axis] = round(d[what][axis] + delta);
    setDecal(d);
  };

  return (
    <div className="flex h-[100dvh] w-full">
      <div className="relative flex-1">
        <CarScene
          hoveredId={hovered}
          onHover={setHovered}
          onSelect={setSelected}
          autoRotate={false}
          spots={spots}
          controlsRef={orbit}
          disc={false}
        >
          <Gizmo decal={current.decal} mode={mode} onChange={setDecal} orbit={orbit} />
        </CarScene>
        <div className="absolute left-3 top-3 z-[10] rounded-none border-2 border-ink bg-paper px-3 py-2 text-[12px] font-bold">
          g 移動 / r 回転 / s 拡大 · 値札クリックで選択 · mode: <b>{mode}</b>
        </div>
      </div>
      <aside className="flex w-[360px] flex-col gap-2 overflow-y-auto border-l-[3px] border-ink bg-paper p-3 text-[13px]">
        <div className="flex gap-2">
          <button className="pop-btn !text-[13px] !px-3 !py-2" onClick={copy}>
            {copied ? "コピーした" : "copy JSON"}
          </button>
          <button
            className="pop-btn ghost !text-[13px] !px-3 !py-2"
            onClick={() => {
              if (confirm("上書きを全部消す？")) setOverrides({});
            }}
          >
            reset all
          </button>
          <button className="pop-btn ghost !text-[13px] !px-3 !py-2" onClick={() => setOverrides((o) => { const n = { ...o }; delete n[selected]; return n; })}>
            reset this
          </button>
        </div>
        <div className="border-2 border-ink p-2">
          <div className="font-display text-[18px]">{current.nameJa}</div>
          <div className="text-ink-soft">
            {current.id} · {current.target.mesh} / {current.target.material}
          </div>
          {(["position", "rotation", "scale"] as const).map((what) => (
            <div key={what} className="mt-1 flex items-center gap-1">
              <span className="w-14">{what}</span>
              {[0, 1, 2].map((i) => (
                <span key={i} className="flex items-center gap-0.5">
                  <button className="border border-ink px-1" onClick={() => nudge(i as 0 | 1 | 2, what === "rotation" ? -0.05 : what === "scale" ? -0.01 : -0.005, what)}>
                    -
                  </button>
                  <span className="w-14 text-center font-mono text-[11px]">{current.decal[what][i].toFixed(3)}</span>
                  <button className="border border-ink px-1" onClick={() => nudge(i as 0 | 1 | 2, what === "rotation" ? 0.05 : what === "scale" ? 0.01 : 0.005, what)}>
                    +
                  </button>
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          {TIER_ORDER.map((t) => (
            <div key={t}>
              <div className="mt-1 text-[11px] font-black text-ink-soft">{t}</div>
              {spots
                .filter((s) => s.tier === t)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    className={`block w-full border-b border-dashed border-ink/30 px-1 py-0.5 text-left ${s.id === selected ? "bg-yellow" : ""} ${overrides[s.id] ? "font-black" : ""}`}
                  >
                    {s.nameJa} <span className="text-ink-soft">{s.id}</span>
                  </button>
                ))}
            </div>
          ))}
        </div>
        <pre className="mt-2 max-h-48 overflow-auto border-2 border-ink bg-paper-2 p-2 text-[10px] leading-tight">{json}</pre>
      </aside>
    </div>
  );
}
