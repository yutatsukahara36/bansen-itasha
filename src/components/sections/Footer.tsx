import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t-[3px] border-ink bg-paper px-4 py-12 md:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-display text-[22px]">デジタル番宣痛車</div>
          <p className="mt-2 max-w-[40em] text-[13px] font-bold text-ink-soft">
            本サービスで販売しているのはデジタル痛車上の掲載枠です。実車の製作を保証するものではありません。お支払いは全額前払い、非返金です。
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-bold">
          <Link href="/about">痛車とは？</Link>
          <Link href="/sponsor">宣伝したい方はこちら</Link>
          <Link href="/sponsor#faq">よくある質問</Link>
          <Link href="/sponsor#inquiry">お問い合わせ</Link>
          <span className="text-ink-soft">特定商取引法に基づく表記（準備中）</span>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-[1200px] text-[12px] font-bold text-ink-soft">© 2026 デジタル番宣痛車</div>
    </footer>
  );
}
