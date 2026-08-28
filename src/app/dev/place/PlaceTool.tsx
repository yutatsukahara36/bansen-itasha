"use client";
/** Legacy decal placement tool. The zone display assigns surfaces via src/lib/zones.ts, so placement is now code, not gizmos. */
export function PlaceTool() {
  return (
    <div className="grid min-h-[100dvh] place-items-center p-8">
      <div className="paper max-w-[36em] p-7">
        <h1 className="font-display text-[28px]">旧ツール</h1>
        <p className="mt-3 text-[15px] leading-[1.8]">
          区画方式に移行したため、このギズモは使いません。区画の境界は <code>src/lib/zones.ts</code> の分類ルールで決まります。境界を動かすときはそこを編集してください。
        </p>
      </div>
    </div>
  );
}
