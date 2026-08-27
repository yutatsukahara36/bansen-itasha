import { Reveal } from "@/components/ui/Reveal";

const rows: [string, string, string][] = [
  ["枠", "非売品枠だけ。40枠の外にある、価格表に載っていないパーツ", "40枠から好きな枠を選べます。ボンネットも、ドアも"],
  ["料金", "無償", "価格表どおり"],
  ["条件", "ローンチ時に自社アカウントで投稿すること", "なし。買うだけ"],
  ["特典", "ローンチパートナーの地位（永久）。サイト最上部に専用バッジ付きで掲載", "枠と掲載。バッジは付きません"],
  ["枠数", "限定5社。埋まったら永久に締め切り", "先着。売れたら終わり"],
];

/** The two entry points. Both are honest about what the other one does not get. */
export function Options() {
  return (
    <Reveal className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-[15px]">
        <thead>
          <tr>
            <th className="w-[18%] border-[3px] border-ink bg-paper-2 p-4 text-left font-black" />
            <th className="border-[3px] border-ink bg-ink p-4 text-left font-display text-[22px] font-normal text-yellow">A ローンチパートナー</th>
            <th className="border-[3px] border-ink bg-yellow p-4 text-left font-display text-[22px] font-normal">B 通常スポンサー</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, a, b]) => (
            <tr key={k}>
              <th className="border-[3px] border-ink bg-paper-2 p-4 text-left font-black">{k}</th>
              <td className="border-[3px] border-ink p-4 leading-[1.7]">{a}</td>
              <td className="border-[3px] border-ink p-4 leading-[1.7]">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 max-w-[60em] text-[14px] font-bold text-ink-soft">
        Aは地位を、Bは一等地を得ます。互いに相手が持てないものを持つ設計です。ローンチパートナーの投稿には「ローンチパートナーとして枠を無償で提供いただきました」と書いていただきます（景品表示法のステマ規制への対応です）。
      </p>
    </Reveal>
  );
}
