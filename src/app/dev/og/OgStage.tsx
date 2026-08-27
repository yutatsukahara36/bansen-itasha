"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { SPOTS } from "@/data/spots";
import { SPONSORS } from "@/data/sponsors";
import { progress } from "@/lib/format";
import { ProgressOverlay } from "@/components/car/ProgressOverlay";

const CarScene = dynamic(() => import("@/components/car/CarScene").then((m) => m.CarScene), { ssr: false });

export function OgStage() {
  const [ready, setReady] = useState(false);
  const p = progress(SPOTS, SPONSORS);
  return (
    <div id="og" data-ready={ready} className="relative h-[630px] w-[1200px] overflow-hidden bg-paper">
      <CarScene hoveredId={null} onHover={() => {}} onSelect={() => {}} onReady={() => setReady(true)} autoRotate={false} />
      <div className="pointer-events-none absolute left-10 top-10 z-[10]">
        <div className="font-display text-[22px]">デジタル番宣痛車</div>
        <h1 className="mt-3 font-display text-[52px] leading-[1.12]">
          アニメには番宣痛車がある。
          <br />
          企業には、ない。
        </h1>
        <p className="mt-3 text-[18px] font-bold text-ink-soft">
          だから作ります。<span className="marker-hl">全40枠</span>、¥20,000から。
        </p>
      </div>
      <ProgressOverlay p={p} className="absolute bottom-8 left-10 z-[10] scale-[0.85] origin-bottom-left" />
    </div>
  );
}
