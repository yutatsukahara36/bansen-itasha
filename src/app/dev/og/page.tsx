import { notFound } from "next/navigation";
import { OgStage } from "./OgStage";

export const metadata = { title: "dev / og", robots: { index: false } };

/** Dev-only 1200x630 stage for the OGP screenshot. Regenerate public/og.png when sponsors change. */
export default function OgPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <OgStage />;
}
