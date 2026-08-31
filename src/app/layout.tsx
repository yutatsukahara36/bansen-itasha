import type { Metadata } from "next";
import { DotGothic16, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import { SPOT_COUNT } from "@/lib/format";

const dot = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dot",
  display: "swap",
  preload: false,
});

const maru = Zen_Maru_Gothic({
  weight: ["500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-maru",
  display: "swap",
  preload: false,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "デジタル番宣痛車",
  description:
    `誰でも宣伝できる番宣痛車、作ります。ネット上の痛車に全${SPOT_COUNT}枠、¥20,000から。企業も、ブランドも、個人も。全部埋まったら、この姿のまま実車にします。`,
  openGraph: {
    title: "デジタル番宣痛車",
    description: `誰でも宣伝できる痛車、つくります。全${SPOT_COUNT}枠、¥20,000から。`,
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `値札だらけのデジタル番宣痛車。完売まであと${SPOT_COUNT}枠` }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${dot.variable} ${maru.variable}`}>
      <body>
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
