import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string; rhythm?: "normal" | "loose"; id?: string };

/** Page section with the site rhythm. Never h-screen; sections are content-sized, the hero uses min-h-[100dvh]. */
export function Section({ children, className = "", rhythm = "normal", id }: Props) {
  return (
    <section id={id} className={`w-full max-w-full px-4 ${rhythm === "loose" ? "py-40" : "py-24"} md:px-8 ${className}`}>
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </section>
  );
}
