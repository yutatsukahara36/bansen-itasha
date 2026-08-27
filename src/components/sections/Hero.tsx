"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SPOTS, spotById } from "@/data/spots";
import { SPONSORS, type Sponsor } from "@/data/sponsors";
import { progress } from "@/lib/format";
import { ProgressOverlay } from "@/components/car/ProgressOverlay";
import { SpotPanel } from "@/components/car/SpotPanel";
import { Button } from "@/components/ui/Button";

const CarScene = dynamic(() => import("@/components/car/CarScene").then((m) => m.CarScene), { ssr: false });

export function Hero() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [sponsors, setSponsors] = useState<Sponsor[]>(SPONSORS);
  const onReady = useCallback(() => setReady(true), []);
  const p = progress(SPOTS, sponsors);
  const selected = selectedId ? spotById(selectedId) ?? null : null;

  // Dev only: /?sell=front-door-r,wiper sells those spots to a sample sponsor 1.5s after load, to watch the peel.
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !ready) return;
    const ids = new URLSearchParams(window.location.search).get("sell");
    if (!ids) return;
    const timer = setTimeout(async () => {
      const { sampleSponsor } = await import("@/data/sponsors.dev");
      setSponsors((cur) => [
        ...cur,
        ...ids
          .split(",")
          .filter((id) => spotById(id) && !cur.some((s) => s.spotId === id))
          .map((id) => sampleSponsor(id, !spotById(id)!.forSale)),
      ]);
    }, 1500);
    return () => clearTimeout(timer);
  }, [ready]);

  return (
    <section className="relative min-h-[calc(100dvh-60px)] w-full overflow-hidden">
      <CarScene hoveredId={hoveredId} onHover={setHoveredId} onSelect={setSelectedId} onReady={onReady} sponsors={sponsors} />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/og.jpg" alt="値札だらけのデジタル番宣痛車" className="absolute inset-0 h-full w-full object-cover" />
      </noscript>

      <div
        className={`pointer-events-none absolute inset-0 grid place-items-center font-display text-[18px] text-ink-soft transition-opacity duration-[600ms] ease-[var(--ease)] ${
          ready ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={ready}
      >
        痛車を出しています…
      </div>

      <div className="pointer-events-none absolute left-8 top-9 z-[10] max-md:left-4 max-md:right-4 max-md:top-5">
        <h1 className="max-w-[14em] font-display text-[clamp(30px,4.2vw,58px)] font-normal leading-[1.12] tracking-[0.01em] max-md:text-[clamp(24px,7.5vw,34px)]">
          アニメには番宣痛車がある。
          <br />
          企業には、ない。
        </h1>
        <p className="mt-3.5 max-w-[28em] text-[16px] font-bold text-ink-soft max-md:text-[13px]">
          だから作ります。<span className="marker-hl">全40枠</span>、¥20,000から。埋まったら、この姿のまま実車にします。
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-[262px] left-[34px] z-[10] flex gap-3.5 text-[12px] font-bold text-ink-soft max-md:hidden">
        <span className="hint-dot">ドラッグで回せます</span>
        <span className="hint-dot">値札をクリック</span>
      </div>

      <ProgressOverlay p={p} className="absolute bottom-10 left-8 z-[10] max-md:bottom-4 max-md:left-4" />

      <div className="absolute bottom-11 right-9 z-[10] flex flex-wrap gap-3.5 max-md:hidden">
        <Button href="/sponsor" size="lg" rotate={-1.2}>
          企業の方々はこちら
        </Button>
        <Button href="/about" size="lg" variant="ghost" rotate={0.8}>
          番宣痛車とは？
        </Button>
      </div>

      <SpotPanel
        spot={selected}
        sponsor={selected ? sponsors.find((s) => s.spotId === selected.id) : undefined}
        open={!!selected}
        onClose={() => setSelectedId(null)}
      />
    </section>
  );
}
