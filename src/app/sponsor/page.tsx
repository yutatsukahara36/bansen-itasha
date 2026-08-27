import type { Metadata } from "next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PriceTable } from "@/components/sponsor/PriceTable";
import { Options } from "@/components/sponsor/Options";
import { Faq } from "@/components/sponsor/Faq";
import { InquiryForm } from "@/components/sponsor/InquiryForm";
import { spotById } from "@/data/spots";

export const metadata: Metadata = {
  title: "宣伝したい方はこちら / デジタル番宣痛車",
  description: "全40枠の価格表、2つの入り方、よくある質問、お問い合わせ。企業も、ブランドも、個人も。",
};

export default async function SponsorPage({ searchParams }: { searchParams: Promise<{ spot?: string }> }) {
  const { spot } = await searchParams;
  const initialSpot = spot && (spotById(spot) ? (spotById(spot)!.forSale ? spot : "lp") : "");
  return (
    <>
      <Header />
      <main className="w-full max-w-full overflow-x-hidden">
        <Section>
          <Reveal>
            <h1 className="max-w-[16em] font-display text-[clamp(34px,5vw,64px)] leading-[1.1]">宣伝したい方はこちら</h1>
            <p className="mt-6 max-w-[40em] text-[18px] font-bold text-ink-soft">
              企業も、ブランドも、個人も。全40枠、固定価格、先着、恒久掲載。40枠中35枠が¥100,000未満なので、面白がった担当者がその場で決められます。
            </p>
          </Reveal>
        </Section>

        <Section id="price" className="pt-0">
          <Reveal>
            <h2 className="mb-8 font-display text-[clamp(28px,3.4vw,44px)] leading-[1.15]">枠と価格</h2>
          </Reveal>
          <PriceTable />
        </Section>

        <Section id="options" className="border-t-[3px] border-ink bg-paper-2">
          <Reveal>
            <h2 className="font-display text-[clamp(28px,3.4vw,44px)] leading-[1.15]">2つの入り方</h2>
            <p className="mb-8 mt-4 max-w-[40em] text-[16px] font-bold text-ink-soft">
              最初に動いてくださった5社には、非売品の小枠を無償で提供します。後から知ると「えこひいき」になるので、最初に書いておきます。
            </p>
          </Reveal>
          <Options />
        </Section>

        <Section id="faq">
          <Reveal>
            <h2 className="mb-6 font-display text-[clamp(28px,3.4vw,44px)] leading-[1.15]">よくある質問</h2>
          </Reveal>
          <Faq />
        </Section>

        <Section id="inquiry" className="border-t-[3px] border-ink bg-yellow">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
            <Reveal>
              <h2 className="font-display text-[clamp(28px,3.4vw,44px)] leading-[1.15]">お問い合わせ</h2>
              <p className="mt-4 max-w-[30em] text-[16px] font-bold">
                決済はまだありません。まず話しましょう。御社のロゴを貼った痛車の画像を作ってお返しします。想像させるより、見せた方が早いので。
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <InquiryForm initialSpot={initialSpot || ""} />
            </Reveal>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
