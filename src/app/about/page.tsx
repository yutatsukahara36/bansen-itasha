import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SPOT_COUNT } from "@/lib/format";

export const metadata: Metadata = {
  title: "痛車とは？ / デジタル番宣痛車",
  description: "痛車という文化と、この企画がはじまった理由。",
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal className="grid gap-6 border-t-2 border-dashed border-ink py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
      <h2 className="font-display text-[clamp(26px,3vw,40px)] leading-[1.15]">{title}</h2>
      <div className="max-w-[65ch] space-y-5 text-[17px] leading-[1.9]">{children}</div>
    </Reveal>
  );
}

/* Audience-facing. Visual culture and the origin story only: no anime framing, no 製作委員会, no 千社札 (05 brief). */
export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="w-full max-w-full overflow-x-hidden">
        <Section>
          <Reveal>
            <h1 className="max-w-[16em] font-display text-[clamp(34px,5vw,64px)] leading-[1.1]">痛車とは？</h1>
            <p className="mt-6 max-w-[36em] text-[18px] font-bold text-ink-soft">
              街で一度は見たことがあるはずの、あの車。この企画がそこから始まった理由をぜんぶ書きます。
            </p>
          </Reveal>

          <div className="mt-16">
            <Block title="痛車">
              <p>
                好きなものを車の全面に貼った車のこと。ボンネットからドア、リアガラスまで、隙間なくラッピングして走る。街で見かけると、興味があってもなくても、必ず目が行く。あの過剰さが本体の文化です。
              </p>
              <p>
                もともとは個人が自分の好きなものを載せるための文化で、作り込みが浅いとすぐに見抜かれます。だからこの企画も、絵は雑にしません。3Dモデルを回して、どの角度から見ても成立するように作っています。
              </p>
            </Block>

            <Block title="なぜ目を奪われるのか">
              <p>
                車は本来、無地で走るものです。そこに色と文字と絵が全面に載っていると、視界の中で一台だけ文法が違う。だから通行人は必ず一度、視線を止める。
              </p>
              <p>
                この企画は、その「必ず一度は見られる」面を、パーツごとに切り分けて売っています。ボンネットがいちばん大きくて高い。ドアミラーや給油口のような小さな枠は¥20,000から。小さい会社でも、個人でも、車体に乗れます。価格は全枠ぜんぶ公開しています。
              </p>
            </Block>

            <Block title="はじまり">
              <p>みんなが宣伝できる楽しい番宣痛車を作りたい。</p>
              <p>
                海外で宣伝できる仮想トイレ、MacBookなどが流行っているので、自分も国内の企業やブランド、著名人のために同じようなことをしたい、と思いました。日本版だと何ができるかと考えたところ、閃いたのが痛車です。街中で見かけると必ず通る人の目を奪うラッピングと派手な装甲。
              </p>
              <p>しかし、痛車を作る金がない。</p>
              <p>
                そうだ、まずは仮想の痛車をネットで作り、告知スペースを企業や宣伝を出したい人に売ってお金を貯め、十分に貯まったらそのお金を使って、貯まり切った時点での仮想の痛車をそのまま現実世界で作っちゃおう。
              </p>
              <p>という、無謀で素敵なアイデアから「デジタル番宣痛車」は始まりました。</p>
            </Block>

            <Block title="本当に作るのか">
              <p className="font-black">約束はできません。ここは正直に書きます。</p>
              <p>
                実車をつくるのは、全{SPOT_COUNT}枠が埋まり、集まった金額が¥2,000,000に到達した場合だけです。到達しなければ、実車はつくりません。その場合でも、デジタル痛車上の掲載枠はそのまま残ります。
              </p>
              <p>
                買っていただくのは、デジタル痛車上の掲載枠と、そこから生まれる露出です。実車化は、条件を満たしたときに起きるおまけです。作れなかったら、それはそれで面白い企画だったということにしてください。
              </p>
            </Block>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Button href="/sponsor" size="lg" rotate={-1}>
              枠と価格を見る
            </Button>
            <Button href="/" size="lg" variant="ghost" rotate={1}>
              車を見に戻る
            </Button>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
