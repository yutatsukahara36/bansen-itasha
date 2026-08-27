import type { Progress } from "@/lib/format";
import { yen } from "@/lib/format";

/**
 * The shop counter slip. Paper, tape, marker. Not a metric card:
 * the number is a countdown written on a price slip, the bar is a hand-drawn box.
 */
export function ProgressOverlay({ p, className = "" }: { p: Progress; className?: string }) {
  return (
    <div
      role="status"
      className={`paper tape w-[min(320px,78vw)] rotate-[-1.5deg] px-[22px] pb-[18px] pt-[22px] max-md:w-[min(250px,68vw)] max-md:px-[14px] max-md:pb-3 max-md:pt-[14px] ${
        className.includes("absolute") ? "" : "relative"
      } ${className}`}
    >
      <div className="font-display text-[40px] leading-[1.05] max-md:text-[26px]">
        {p.remaining === 0 ? (
          <>
            完売<br />しました
          </>
        ) : (
          <>
            完売まで
            <br />
            あと<b className="mx-1 inline-block translate-y-1.5 text-[64px] font-normal max-md:text-[42px]">{p.remaining}</b>枠
          </>
        )}
      </div>
      <div className="mt-2.5 flex justify-between gap-3 text-[14px] font-bold max-md:text-[12px]">
        <span>あつまった金額</span>
        <span>
          {yen(p.raised)} / {yen(p.goal)}
        </span>
      </div>
      <div className="relative mt-2 h-4 border-[3px] border-ink bg-paper-2">
        <i className="absolute inset-0 bg-yellow" style={{ width: `${p.pct}%` }} />
      </div>
      <div className="mt-3 border-t-2 border-dashed border-ink pt-2.5 text-[13px] font-bold max-md:text-[12px]">
        ローンチパートナー　残り <b className="font-display text-[22px] font-normal">{p.lpRemaining}</b>社 / 全{p.lpTotal}社
      </div>
    </div>
  );
}
