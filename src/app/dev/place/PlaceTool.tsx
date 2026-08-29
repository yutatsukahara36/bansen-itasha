"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import { SPOTS, GOAL, type Spot } from "@/data/spots";
import { TIER_ORDER, TIER_PRICE, type Tier } from "@/data/tiers";
import { yen } from "@/lib/format";
import type { PlaceHit } from "@/components/car/CarModel";

const CarScene = dynamic(() => import("@/components/car/CarScene").then((m) => m.CarScene), { ssr: false });

const clone = (s: Spot[]): Spot[] => JSON.parse(JSON.stringify(s));
const round = (v: number) => +v.toFixed(4);

/** Same upright logic as the placement pipeline: labels stand up on walls, read from the front on the hood. */
function rotationFor(point: THREE.Vector3, normal: THREE.Vector3, tiltDeg: number): [number, number, number] {
  const n = normal.clone().normalize();
  const up = Math.abs(n.y) < 0.88 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, point.z > 0.1 ? -1 : 1);
  const right = new THREE.Vector3().crossVectors(up, n).normalize();
  const trueUp = new THREE.Vector3().crossVectors(n, right).normalize();
  const m = new THREE.Matrix4().makeBasis(right, trueUp, n);
  const o = new THREE.Object3D();
  o.setRotationFromMatrix(m);
  o.rotateZ((tiltDeg * Math.PI) / 180);
  return [round(o.rotation.x), round(o.rotation.y), round(o.rotation.z)];
}

function tiltBy(rotation: [number, number, number], deltaDeg: number): [number, number, number] {
  const e = new THREE.Euler(...rotation);
  const q = new THREE.Quaternion().setFromEuler(e);
  q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (deltaDeg * Math.PI) / 180));
  const out = new THREE.Euler().setFromQuaternion(q);
  return [round(out.x), round(out.y), round(out.z)];
}

const depthFor = (w: number, h: number) => round(Math.max(0.04, Math.min(w, h) * 0.7));

export function PlaceTool() {
  const [spots, setSpots] = useState<Spot[]>(() => clone(SPOTS));
  const [selectedId, setSelectedId] = useState<string>(SPOTS[0].id);
  const [hovered, setHovered] = useState<string | null>(null);
  const [placeMode, setPlaceMode] = useState(false);
  const [status, setStatus] = useState<string>("");

  const sel = spots.find((s) => s.id === selectedId);
  const forSale = spots.filter((s) => s.forSale);
  const sum = forSale.reduce((a, s) => a + s.price, 0);
  const under100k = forSale.filter((s) => s.price < 100_000).length;

  const update = (id: string, fn: (s: Spot) => void) =>
    setSpots((cur) => {
      const next = clone(cur);
      const s = next.find((x) => x.id === id);
      if (s) fn(s);
      return next;
    });

  const onPlace = (hit: PlaceHit) => {
    if (!sel) return;
    update(sel.id, (s) => {
      s.decal.position = hit.point.map(round) as [number, number, number];
      s.decal.rotation = rotationFor(new THREE.Vector3(...hit.point), new THREE.Vector3(...hit.normal), 0);
      s.target = { mesh: hit.mesh, material: hit.material };
    });
    setStatus(`${sel.nameJa} を貼り直した`);
  };

  const setSize = (axis: 0 | 1, value: number) => {
    if (!sel || !Number.isFinite(value) || value <= 0.01) return;
    update(sel.id, (s) => {
      s.decal.scale[axis] = round(value);
      s.decal.scale[2] = depthFor(s.decal.scale[0], s.decal.scale[1]);
    });
  };

  const addLabel = () => {
    let n = 1;
    while (spots.some((s) => s.id === `custom-${n}`)) n++;
    const id = `custom-${n}`;
    const fresh: Spot = {
      id,
      nameJa: `新しい枠 ${n}`,
      tier: "D",
      price: TIER_PRICE.D,
      forSale: true,
      target: { mesh: "MAIN_BODY_2", material: "_MAIN_BODY" },
      decal: { position: [-0.04, 0.239, 0.42], rotation: [-1.4521, 0, 0], scale: [0.12, 0.084, 0.059] },
    };
    setSpots((cur) => [...cur, fresh]);
    setSelectedId(id);
    setPlaceMode(true);
    setStatus("車をクリックして貼る場所を選ぶ");
  };

  const removeLabel = () => {
    if (!sel) return;
    if (!confirm(`「${sel.nameJa}」を消す?`)) return;
    setSpots((cur) => cur.filter((s) => s.id !== sel.id));
    setSelectedId(spots[0]?.id ?? "");
  };

  const save = async () => {
    setStatus("保存中…");
    try {
      const res = await fetch("/api/dev/spots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spots }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? res.status);
      setStatus(`保存した（${json.count}枠 / 販売合計 ${yen(json.forSaleSum)}）。ホットリロードで反映されます`);
    } catch (e) {
      setStatus("保存に失敗: " + String(e));
    }
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(spots, null, 2));
    setStatus("JSONをコピーした");
  };

  const num = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const inputCls = "w-full border-2 border-ink bg-paper px-2 py-1.5 text-[13px]";

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden">
      <div className="relative flex-1">
        <CarScene
          hoveredId={hovered}
          onHover={setHovered}
          onSelect={(id) => !placeMode && setSelectedId(id)}
          autoRotate={false}
          disc={false}
          spots={spots}
          onPlace={placeMode ? onPlace : undefined}
          interactive={!placeMode}
        />
        <div className="absolute left-3 top-3 z-[10] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPlaceMode((m) => !m)}
            className={`border-2 border-ink px-3 py-2 font-display text-[14px] active:scale-[0.98] ${placeMode ? "bg-yellow" : "bg-paper"}`}
          >
            {placeMode ? "配置モード ON: 車をクリックで貼る" : "配置モード OFF: 値札クリックで選択"}
          </button>
          <span className="border border-ink-soft bg-paper px-2 py-1 text-[12px] font-bold text-ink-soft">{status}</span>
        </div>
        <div
          className={`absolute bottom-3 left-3 z-[10] border-2 border-ink px-3 py-2 text-[13px] font-black ${sum === GOAL ? "bg-paper" : "bg-ink text-yellow"}`}
        >
          販売{forSale.length}枠 合計 {yen(sum)} / {yen(GOAL)}
          {sum !== GOAL && `（差 ${yen(sum - GOAL)}）`}　¥100,000未満 {under100k}枠
        </div>
      </div>

      <aside className="flex w-[380px] flex-col gap-3 overflow-y-auto border-l-[3px] border-ink bg-paper p-3">
        <div className="flex gap-2">
          <button type="button" className="pop-btn !px-3 !py-2 !text-[13px]" onClick={save}>
            保存（spots.tsに書く）
          </button>
          <button type="button" className="pop-btn ghost !px-3 !py-2 !text-[13px]" onClick={copyJson}>
            JSONコピー
          </button>
          <button type="button" className="pop-btn ghost !px-3 !py-2 !text-[13px]" onClick={addLabel}>
            +追加
          </button>
        </div>

        {sel && (
          <div className="border-2 border-ink p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black text-ink-soft">{sel.id}</span>
              <button type="button" onClick={removeLabel} className="border border-ink px-2 py-0.5 text-[11px] font-bold active:scale-[0.98]">
                消す
              </button>
            </div>
            <label className="mt-2 grid gap-1">
              <span className="text-[11px] font-black">名前</span>
              <input className={inputCls} value={sel.nameJa} onChange={(e) => update(sel.id, (s) => (s.nameJa = e.target.value))} />
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="grid gap-1">
                <span className="text-[11px] font-black">価格</span>
                <input
                  className={inputCls}
                  type="number"
                  step={10000}
                  value={sel.price}
                  onChange={(e) => update(sel.id, (s) => (s.price = num(e.target.value)))}
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[11px] font-black">ティア</span>
                <select
                  className={inputCls}
                  value={sel.tier}
                  onChange={(e) =>
                    update(sel.id, (s) => {
                      s.tier = e.target.value as Tier;
                      s.forSale = s.tier !== "LP";
                      if (!s.forSale) s.price = 0;
                    })
                  }
                >
                  {TIER_ORDER.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="grid gap-1">
                <span className="text-[11px] font-black">幅 {sel.decal.scale[0].toFixed(3)}</span>
                <div className="flex gap-1">
                  <button type="button" className="border border-ink px-2 font-bold" onClick={() => setSize(0, sel.decal.scale[0] - 0.02)}>
                    -
                  </button>
                  <input className={inputCls} type="number" step={0.01} value={sel.decal.scale[0]} onChange={(e) => setSize(0, num(e.target.value))} />
                  <button type="button" className="border border-ink px-2 font-bold" onClick={() => setSize(0, sel.decal.scale[0] + 0.02)}>
                    +
                  </button>
                </div>
              </label>
              <label className="grid gap-1">
                <span className="text-[11px] font-black">高さ {sel.decal.scale[1].toFixed(3)}</span>
                <div className="flex gap-1">
                  <button type="button" className="border border-ink px-2 font-bold" onClick={() => setSize(1, sel.decal.scale[1] - 0.02)}>
                    -
                  </button>
                  <input className={inputCls} type="number" step={0.01} value={sel.decal.scale[1]} onChange={(e) => setSize(1, num(e.target.value))} />
                  <button type="button" className="border border-ink px-2 font-bold" onClick={() => setSize(1, sel.decal.scale[1] + 0.02)}>
                    +
                  </button>
                </div>
              </label>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[11px] font-black">傾き</span>
              {[-5, -1, 1, 5].map((d) => (
                <button
                  key={d}
                  type="button"
                  className="border border-ink px-2 py-1 text-[12px] font-bold active:scale-[0.98]"
                  onClick={() => update(sel.id, (s) => (s.decal.rotation = tiltBy(s.decal.rotation, d)))}
                >
                  {d > 0 ? "+" + d : d}°
                </button>
              ))}
              <span className="ml-auto text-[11px] text-ink-soft">{sel.target.material.replace("_", "")} 上</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
              貼り直し: 配置モードONにして車をクリック。向きは面に合わせて自動、傾きボタンで微調整。
            </p>
          </div>
        )}

        <div className="flex flex-col gap-0.5 text-[13px]">
          {TIER_ORDER.map((t) => {
            const list = spots.filter((s) => s.tier === t);
            if (!list.length) return null;
            return (
              <div key={t}>
                <div className="mt-1.5 text-[11px] font-black text-ink-soft">
                  {t}　{yen(list.reduce((a, s) => a + s.price, 0))}
                </div>
                {list.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    onMouseEnter={() => setHovered(s.id)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex w-full items-center justify-between border-b border-dashed border-ink/30 px-1 py-1 text-left ${s.id === selectedId ? "bg-yellow" : ""}`}
                  >
                    <span>{s.nameJa}</span>
                    <span className="text-[11px] text-ink-soft">{s.forSale ? yen(s.price) : "非売品"}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
