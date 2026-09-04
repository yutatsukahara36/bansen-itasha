import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Story() {
  return (
    <Section rhythm="loose" id="story">
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-20">
        <Reveal>
          <h2 className="font-display text-[clamp(30px,3.6vw,48px)] leading-[1.15]">
            みんなが宣伝できる
            <br />
            楽しい番宣痛車を作りたい。
          </h2>
          <p className="mt-6 max-w-[32em] text-[16px] font-bold text-ink-soft">
            企業・ブランド・著名人、誰もが広告枠を買える「番宣痛車」をネット上に作り、その仮想痛車を（できたら）現実世界で再現する。
          </p>
        </Reveal>
        <Reveal delay={0.1} className="max-w-[65ch] space-y-5 text-[17px] leading-[1.9]">
          <p>
            海外で宣伝できる仮想トイレ、マックブックなどが流行っているので、自分も国内の企業やブランド、著名人のために同じような事をしたい！と思い、日本版だと何ができるかと考えたところ、閃いたのが「痛車」。街中で見かけると必ず通る人の目を奪うラッピングと派手な装甲。
          </p>
          <p>しかし、痛車を作る金がない。。。</p>
          <p>
            そうだ、まずは仮想の痛車をネットで作り、告知スペースを企業や宣伝を出したい人に売りお金を貯め、十分に貯まったらそのお金を使って、貯まり切った時点での仮想の痛車をそのまま現実世界で作っちゃおう。
          </p>
          <p>という、無謀で素敵なアイデアから「デジタル番宣痛車」プロジェクト、始まりました。</p>
        </Reveal>
      </div>
    </Section>
  );
}
