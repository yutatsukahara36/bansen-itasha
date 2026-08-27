import { yen } from "@/lib/format";

type Props = {
  name: string;
  price: number; // 0 = 非売品
  note?: string;
  rotate?: number; // degrees
  size?: "sm" | "md" | "lg";
  sold?: boolean;
  className?: string;
};

/**
 * HTML POP札. The same object as the decal on the car: yellow paper, marker border, DotGothic price, tape.
 * Used in the price table and anywhere a price is shown outside the canvas.
 */
export function PopTag({ name, price, note, rotate = 0, size = "md", sold, className = "" }: Props) {
  const lp = price === 0;
  const pad = size === "lg" ? "px-6 py-5" : size === "sm" ? "px-3 py-2" : "px-4 py-3";
  const priceCls = size === "lg" ? "text-[56px]" : size === "sm" ? "text-[26px]" : "text-[38px]";
  return (
    <div
      className={`relative inline-block border-[3px] border-ink shadow-[4px_4px_0_var(--ink)] ${pad} ${
        lp ? "bg-ink text-yellow" : "bg-yellow text-ink"
      } ${sold ? "opacity-60" : ""} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <span
        aria-hidden
        className="absolute -top-2.5 left-1/2 h-4 w-16 -translate-x-1/2 rotate-[-3deg] border border-[oklch(80%_0.1_95/0.5)] bg-tape"
      />
      <div className="text-[13px] font-black leading-tight">{name}</div>
      <div className={`font-display leading-none ${priceCls} mt-1`}>{lp ? "非売品" : sold ? "完売" : yen(price)}</div>
      {note && <div className="mt-1 text-[12px] font-bold">{note}</div>}
    </div>
  );
}
