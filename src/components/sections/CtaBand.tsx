import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CtaBand() {
  return (
    <section className="w-full border-y-[3px] border-ink bg-yellow px-4 py-16 md:px-8 md:py-20">
      <Reveal className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[24em] font-display text-[clamp(22px,2.6vw,34px)] leading-[1.25]">
          値札が付いている場所は、全部売り物です。
        </p>
        <div className="flex flex-wrap gap-4">
          <Button href="/sponsor" size="lg" variant="ghost" rotate={-1}>
            宣伝したい方はこちら
          </Button>
          <Button href="/#story" size="lg" variant="ghost" rotate={1}>
            番宣痛車とは
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
