import { LP_SPOTS, SPOTS } from "@/data/spots";
import { TIER_LABEL, type Tier } from "@/data/tiers";
import type { Spot } from "@/data/spots";
import { yen } from "@/lib/format";
import { SPONSORS } from "@/data/sponsors";
import { PopTag } from "@/components/ui/PopTag";
import { Reveal } from "@/components/ui/Reveal";
import { rnd } from "@/lib/tagTexture";

/**
 * Differentiated bento, not 40 equal tiles. One block per tier, sized by rank; grid-flow-dense keeps it gapless.
 * The S spot is the biggest single object on the page, D spots are a dense strip of small tags.
 */
const BLOCK: Record<Tier, { span: string; size: "sm" | "md" | "lg"; bg: string; blurb: string }> = {
  S: { span: "md:col-span-6 md:row-span-2", size: "lg", bg: "bg-paper-2", blurb: "1社だけ。「◯◯ presents デジタル番宣痛車」がサイト、OGP、全投稿に入ります。" },
  A: { span: "md:col-span-6", size: "md", bg: "bg-paper", blurb: "いちばん面積が大きい4枠。ドア、リアゲート、ルーフ。" },
  B: { span: "md:col-span-6", size: "md", bg: "bg-paper", blurb: "課長決裁で通る、目立つ枠。" },
  C: { span: "md:col-span-7", size: "sm", bg: "bg-paper-2", blurb: "フェンダー、サイドスカート、サイドウィンドウ。" },
  D: { span: "md:col-span-5 md:row-span-2", size: "sm", bg: "bg-paper", blurb: "小口枠。個人でも乗れます。" },
  E: { span: "md:col-span-7", size: "sm", bg: "bg-paper-2", blurb: "痛内装。外から見えない場所にも、ちゃんと文化があります。窓ガラスに貼って見せます。" },
  LP: { span: "md:col-span-12", size: "sm", bg: "bg-ink", blurb: "" },
};

function priceRange(spots: Spot[]) {
  if (!spots.length) return "";
  const prices = [...new Set(spots.map((s) => s.price))].sort((a, b) => a - b);
  return prices.length === 1 ? yen(prices[0]) : `${yen(prices[0])}〜${yen(prices[prices.length - 1])}`;
}

export function PriceTable() {
  const sold = new Set(SPONSORS.map((s) => s.spotId));
  const tiers: Tier[] = ["S", "A", "B", "C", "D", "E"];
  return (
    <div className="grid grid-flow-dense grid-cols-1 gap-4 md:grid-cols-12">
      {tiers.map((t, ti) => {
        const b = BLOCK[t];
        const spots = SPOTS.filter((s) => s.tier === t);
        if (!spots.length) return null; // a tier can empty out as prices get rebalanced; skip it rather than render a broken block
        const remaining = spots.filter((s) => !sold.has(s.id)).length;
        return (
          <Reveal key={t} delay={ti * 0.05} className={`${b.span} ${b.bg} border-[3px] border-ink p-5 md:p-6`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-[26px] leading-none">{TIER_LABEL[t]}</h3>
              <div className="text-[13px] font-black">
                <span className="font-display text-[22px]">{priceRange(spots)}</span> × {spots.length}枠　残り{remaining}
              </div>
            </div>
            {b.blurb && <p className="mt-2 max-w-[40em] text-[14px] font-bold text-ink-soft">{b.blurb}</p>}
            <div className={`mt-5 flex flex-wrap ${t === "S" ? "gap-6" : "gap-3"}`}>
              {spots.map((s) => (
                <PopTag
                  key={s.id}
                  name={s.nameJa}
                  price={s.price}
                  note={t === "S" ? "冠スポンサー付" : undefined}
                  size={b.size}
                  sold={sold.has(s.id)}
                  rotate={(rnd(s.id, 3) - 0.5) * 5}
                  className={t === "S" ? "mt-3" : "mt-2"}
                />
              ))}
            </div>
          </Reveal>
        );
      })}
      <Reveal className="md:col-span-12 border-[3px] border-ink bg-ink p-5 text-yellow md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-[26px] leading-none">非売品 {LP_SPOTS.length}枠</h3>
        </div>
        <p className="mt-2 max-w-[48em] text-[14px] font-bold text-paper">
          お金では買えない小さな枠が5つあります。最初に動いてくださった方に無償でお渡しします。
        </p>
      </Reveal>
    </div>
  );
}
