import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

/* Photo: real photo of Yuta to be supplied; no placeholder image until then. */
export function Profile() {
  return (
    <Section className="border-t-[3px] border-ink bg-paper-2" id="profile">
      <Reveal className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-14">
        <div className="paper tape relative inline-block w-fit -rotate-2 bg-yellow px-6 py-5">
          <div className="text-[13px] font-black">やっている人</div>
          <div className="mt-1 font-display text-[40px] leading-none">塚原悠太</div>
          <div className="mt-2 text-[14px] font-bold">マーケター</div>
        </div>
        <div className="max-w-[65ch] space-y-4 text-[17px] leading-[1.9]">
          <p>いつもお世話になっている日本の企業のために、何か面白いことをしたいと思ってはじめました。</p>
          <p>
            企画、デザイン、サイト、営業、実車の立ち会いまで、ぜんぶ一人でやります。会社ではなく個人の企画です。だから決裁は速いです。DMをくだされば、その日のうちに御社のロゴを貼った痛車の画像をお返しします。
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
