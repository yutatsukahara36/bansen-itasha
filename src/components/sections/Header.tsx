import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="sticky top-0 z-[20] flex items-center justify-between gap-2.5 border-b-[3px] border-ink bg-paper px-7 py-3.5 max-md:px-3.5 max-md:py-2.5">
      <Link href="/" className="inline-flex items-baseline gap-2.5 whitespace-nowrap font-display text-[22px] tracking-[0.02em] max-md:text-[17px]">
        デジタル番宣痛車
        <small className="font-body text-[12px] font-bold text-ink-soft max-md:hidden">企業版の番宣痛車、つくります</small>
      </Link>
      <nav className="flex gap-2.5 max-md:gap-1.5">
        <Button href="/about" variant="ghost" rotate={-1} className="max-md:hidden">
          番宣痛車とは？
        </Button>
        <Button href="/sponsor" rotate={1} className="max-md:!text-[13px] max-md:!px-3 max-md:!py-3">
          企業の方はこちら
        </Button>
      </nav>
    </header>
  );
}
