import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Profile() {
  return (
    <Section className="border-t-[3px] border-ink bg-paper-2" id="profile">
      <Reveal className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-14">
        <div className="w-[190px] shrink-0">
          <div className="paper tape relative -rotate-2 overflow-hidden bg-paper p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/profile.jpg" alt="塚原悠太" className="aspect-square w-full object-cover" />
          </div>
          <div className="paper relative mt-3 inline-block rotate-1 bg-yellow px-5 py-3">
            <div className="font-display text-[26px] leading-none">塚原悠太</div>
            <div className="mt-1.5 text-[13px] font-black">中の人</div>
          </div>
        </div>
        <div className="max-w-[65ch] space-y-4 text-[17px] leading-[1.9]">
          <p>
            カリフォルニア大学デイビス校を約3年で卒業、在学中にはポケモンカードでビジネスを立ち上げ、１３人のチーム率い150万円ほどの売り上げを達成。他にもSalesforceコンサルや、人事コンサルなどの会社でもインターンとし躍動。
          </p>
          <p>
            現在は、カリフォルニアのベイエリアを拠点とし、Pantera Capitalなどから出資を受けるAIスタートアップ「Surf AI」にて、マーケティングを統括している。
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[15px] font-bold">
            <a href="https://x.com/yutatsukahara_" target="_blank" rel="noopener" className="underline decoration-2 underline-offset-4">
              X
            </a>
            <a href="https://www.linkedin.com/in/yuta-tsukahara-a18940266/" target="_blank" rel="noopener" className="underline decoration-2 underline-offset-4">
              LinkedIn
            </a>
            <a href="https://asksurf.ai" target="_blank" rel="noopener" className="underline decoration-2 underline-offset-4">
              Surf AI
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
