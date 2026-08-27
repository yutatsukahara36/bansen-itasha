"use client";
import type { Spot } from "@/data/spots";
import type { Sponsor } from "@/data/sponsors";
import { TIER_LABEL } from "@/data/tiers";
import { yen } from "@/lib/format";
import { Button } from "@/components/ui/Button";

type Props = { spot: Spot | null; sponsor?: Sponsor; open: boolean; onClose: () => void };

/** Inline detail panel. Opaque paper, tape in the corner, slides from the right. Not a modal. */
export function SpotPanel({ spot, sponsor, open, onClose }: Props) {
  const lp = spot ? !spot.forSale : false;
  return (
    <aside
      aria-live="polite"
      aria-hidden={!open}
      className={`absolute right-0 top-0 z-[15] h-full w-[min(380px,90vw)] border-l-[3px] border-ink bg-paper px-7 py-10 transition-transform duration-[600ms] ease-[var(--ease)] ${
        open ? "translate-x-0" : "translate-x-[104%]"
      }`}
      style={{ visibility: open ? "visible" : "hidden", transitionProperty: "transform, visibility", transitionDelay: open ? "0s" : "0s, 600ms" }}
    >
      <span aria-hidden className="absolute -left-7 top-[18px] h-7 w-[120px] -rotate-[35deg] border border-[oklch(80%_0.1_95/0.5)] bg-tape" />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-3.5 border-2 border-ink px-2.5 py-2 font-display text-[14px] active:scale-[0.98]"
      >
        とじる
      </button>
      {spot && (
        <>
          <span className="inline-block border-2 border-ink px-2 py-1 text-[12px] font-black tracking-[0.08em]">{TIER_LABEL[spot.tier]}</span>
          <h2 className="mt-3.5 font-display text-[34px] leading-[1.15]">{spot.nameJa}</h2>
          {sponsor ? (
            <div className="mt-4">
              <div className="paper inline-block bg-paper p-4">
                {/* Real logo file supplied by the company. Small SVG/PNG, no optimizer needed. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sponsor.logo} alt={sponsor.name} className="max-h-16 max-w-[220px]" />
              </div>
              <div className="mt-3 text-[18px] font-black">{sponsor.name}</div>
              {sponsor.launchPartner && (
                <span className="mt-1 inline-block bg-ink px-2 py-0.5 text-[12px] font-bold text-yellow">ローンチパートナー</span>
              )}
              <p className="mt-3 max-w-[30em] text-[15px] leading-[1.75]">{sponsor.blurb}</p>
              <div className="mt-5">
                <Button href={sponsor.url} variant="ghost" rotate={-1} target="_blank" rel="noopener">
                  {sponsor.name}のサイトへ
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-2.5 inline-block -rotate-[1.5deg] bg-yellow px-3 pb-1 pt-1.5 font-display text-[56px] leading-none">
                {lp ? "非売品" : yen(spot.price)}
              </div>
              <p className="mt-4 max-w-[30em] text-[15px] leading-[1.75]">
                {lp
                  ? "最初に動いてくださった5社だけに、お金では買えない小さな枠を無償でお渡しします。埋まったら永久に締め切ります。"
                  : spot.tier === "S"
                    ? "冠スポンサー付き。「◯◯ presents デジタル番宣痛車」がサイトのヘッダー、OGP画像、この企画の全投稿に入ります。1社限定、先着。"
                    : "先着1社、固定価格、恒久掲載。買った枠は誰にも奪われません。入札もオークションもありません。"}
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button href={`/sponsor?spot=${spot.id}`} rotate={-1}>
                  {lp ? "ローンチパートナーについて" : "この枠を問い合わせる"}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </aside>
  );
}
