import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Story() {
  return (
    <Section rhythm="loose" id="story">
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-20">
        <Reveal>
          <h2 className="font-display text-[clamp(30px,3.6vw,48px)] leading-[1.15]">
            企業さんが宣伝できる
            <br />
            痛車を作りたい。
          </h2>
          <p className="mt-6 max-w-[32em] text-[16px] font-bold text-ink-soft">
            海外では「仮想のトイレ」や「仮想のMacBook」に企業ロゴを貼る企画が流行っています。面白い。でも、あれをそのまま日本でやっても輸入品です。
          </p>
        </Reveal>
        <Reveal delay={0.1} className="max-w-[65ch] space-y-5 text-[17px] leading-[1.9]">
          <p>
            日本には痛車があります。街で見かけると絶対に目を奪われる、あの過剰なラッピング。そしてアニメの世界には昔から「番宣痛車」がある。製作委員会が番組を宣伝するために走らせる、公式のラッピング車です。
          </p>
          <p className="font-black">アニメには番宣痛車があるのに、企業にはない。じゃあ、つくればいい。</p>
          <p>ただ、痛車をつくる金がない。</p>
          <p>
            そこで順番を変えました。まずネット上に仮想の痛車をつくって、車体のパーツを広告枠として売る。お金が貯まりきったら、その時点の姿をそのまま現実にコピーする。
          </p>
          <p>無謀です。でも素敵だと思っています。</p>
          <div className="pt-2">
            <Button href="/about" variant="ghost" rotate={-1}>
              もっと詳しく読む
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
