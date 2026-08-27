import type { Sponsor } from "@/data/sponsors";

/**
 * Infinite horizontal logo strip. Hides itself when there are no sponsors (the v1 launch state).
 * CSS animation on transform only; two copies of the row for a seamless loop.
 */
export function LogoMarquee({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;
  const row = [...sponsors, ...sponsors];
  return (
    <section aria-label="スポンサー一覧" className="w-full overflow-hidden border-b-[3px] border-ink bg-paper py-8">
      <div className="mx-auto mb-4 max-w-[1200px] px-4 text-[13px] font-black text-ink-soft md:px-8">乗っている企業</div>
      <div className="marquee flex w-max gap-12 px-6">
        {row.map((s, i) => (
          <a
            key={s.spotId + i}
            href={s.url}
            target="_blank"
            rel="noopener"
            className="flex h-16 shrink-0 items-center gap-3"
            aria-hidden={i >= sponsors.length}
            tabIndex={i >= sponsors.length ? -1 : 0}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.logo} alt={s.name} className="h-12 w-auto max-w-[180px] object-contain" />
            {s.launchPartner && <span className="bg-ink px-1.5 py-0.5 text-[11px] font-bold text-yellow">ローンチパートナー</span>}
          </a>
        ))}
      </div>
    </section>
  );
}
