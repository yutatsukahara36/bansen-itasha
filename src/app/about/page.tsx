import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "番宣痛車とは？ / デジタル番宣痛車",
  description: "痛車、番宣痛車、そしてこの企画がはじまった理由。",
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal className="grid gap-6 border-t-2 border-dashed border-ink py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
      <h2 className="font-display text-[clamp(26px,3vw,40px)] leading-[1.15]">{title}</h2>
      <div className="max-w-[65ch] space-y-5 text-[17px] leading-[1.9]">{children}</div>
    </Reveal>
  );
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="w-full max-w-full overflow-x-hidden">
        <Section>
          <Reveal>
            <h1 className="max-w-[16em] font-display text-[clamp(34px,5vw,64px)] leading-[1.1]">
              番宣痛車とは？
            </h1>
            <p className="mt-6 max-w-[36em] text-[18px] font-bold text-ink-soft">
              アニメには昔からある。企業にはない。だから、企業版をつくる。この企画の背景をぜんぶ書きます。
            </p>
          </Reveal>

          <div className="mt-16">
            <Block title="痛車">
              <p>
                好きなキャラクターやタイトルで車を全面ラッピングした車のこと。街で見かけると、興味があってもなくても、必ず目が行く。あの過剰さが本体の文化です。
              </p>
              <p>
                もともとは個人が自分の好きなものを載せるための文化で、作り込みが浅いとすぐに見抜かれます。だからこの企画も、絵は雑にしません。3Dモデルを回して、どの角度から見ても成立するように作っています。
              </p>
            </Block>

            <Block title="番宣痛車">
              <p>
                アニメの製作委員会が、番組の宣伝のために走らせる公式のラッピング車。イベント会場やアニメショップの前に停まっている、あれです。「番宣痛車」という言葉自体が、すでにある言葉で、すでにあるカテゴリです。
              </p>
              <p className="font-black">つまりこの企画は「企業版の痛車」ではなく、「企業版の番宣痛車」です。</p>
            </Block>

            <Block title="場所に格がある">
              <p>
                神社に貼られた千社札を思い出してください。高いところ、目立つところほど格が上で、貼るのが難しい。この車の枠割りも同じ考え方です。CPMではなく、位置の格で値段を決めています。
              </p>
              <p>
                ボンネットがいちばん上で、冠スポンサーの権利が付きます。ドアミラーやホイール、給油口のような小さな枠は¥20,000から。小さい会社でも、個人でも、車体に乗れます。価格は全枠ぜんぶ公開しています。
              </p>
            </Block>

            <Block title="はじまり">
              <p>企業さんが宣伝できる痛車を作りたい。</p>
              <p>
                海外で宣伝できる仮想トイレ、MacBookなどが流行っているので、自分もいつもお世話になっている日本の企業のために同じようなことをしたい、と思いました。日本版だと何ができるかと考えたところ、閃いたのが痛車です。街中で見かけると必ず通る人の目を奪うラッピングと派手な装甲。
              </p>
              <p>しかし、痛車を作る金がない。</p>
              <p>
                そうだ、まずは仮想の痛車をネットで作り、告知スペースを企業に売ってお金を貯め、十分に貯まったらそのお金を使って、貯まり切った時点での仮想の痛車をそのまま現実世界で作っちゃおう。
              </p>
              <p>という、無謀で素敵なアイデアから始まりました。</p>
            </Block>

            <Block title="本当に作るのか">
              <p className="font-black">約束はできません。ここは正直に書きます。</p>
              <p>
                実車をつくるのは、全40枠が埋まり、集まった金額が¥2,000,000に到達した場合だけです。到達しなければ、実車はつくりません。その場合でも、デジタル痛車上の掲載枠はそのまま残ります。
              </p>
              <p>
                企業のみなさんが買うのは、デジタル痛車上の掲載枠と、そこから生まれる露出です。実車化は、条件を満たしたときに起きるおまけです。作れなかったら、それはそれで面白い企画だったということにしてください。
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
