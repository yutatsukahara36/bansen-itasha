import { notFound } from "next/navigation";
import { PlaceTool } from "./PlaceTool";

export const metadata = { title: "dev / place", robots: { index: false } };

/** Dev-only decal placement tool. Excluded from production. */
export default function PlacePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PlaceTool />;
}
