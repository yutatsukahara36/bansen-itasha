import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { spotById } from "@/data/spots";
import { yen } from "@/lib/format";

export const runtime = "nodejs";

type Body = { company?: string; name?: string; email?: string; spot?: string; message?: string; invoice?: boolean };

const clean = (s: unknown, max: number) => (typeof s === "string" ? s.trim().slice(0, max) : "");

/**
 * POST /api/inquiry → Supabase row + email notification.
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL.
 * Missing env degrades gracefully: the row or the mail is skipped and logged, the form still succeeds.
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const company = clean(body.company, 200);
  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const spot = clean(body.spot, 40);
  const message = clean(body.message, 4000);
  const invoice = body.invoice === true;
  if (!company || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }
  const spotLabel = spot === "lp" ? "ローンチパートナー（非売品枠）" : spot ? `${spotById(spot)?.nameJa ?? spot} ${spotById(spot) ? yen(spotById(spot)!.price) : ""}` : "未定";

  const results: Record<string, string> = {};

  const sb = supabaseAdmin();
  if (sb) {
    const { error } = await sb.from("inquiries").insert({ company, name, email, spot: spot || null, message: message || null, invoice });
    results.db = error ? "error: " + error.message : "ok";
    if (error) console.error("[inquiry] supabase", error);
  } else {
    results.db = "skipped (no env)";
  }

  const to = process.env.INQUIRY_TO_EMAIL;
  const key = process.env.RESEND_API_KEY;
  if (to && key) {
    const from = process.env.INQUIRY_FROM_EMAIL ?? "デジタル番宣痛車 <onboarding@resend.dev>";
    const text = [`会社: ${company}`, `担当: ${name}`, `メール: ${email}`, `枠: ${spotLabel}`, `請求書払い: ${invoice ? "希望" : "なし"}`, "", message || "(ひとこと なし)"].join("\n");
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to, reply_to: email, subject: `[番宣痛車] 問い合わせ: ${company} / ${spotLabel}`, text }),
    });
    results.mail = r.ok ? "ok" : "error: " + r.status;
    if (!r.ok) console.error("[inquiry] resend", r.status, await r.text());
  } else {
    results.mail = "skipped (no env)";
  }

  if (results.db.startsWith("error") && results.mail.startsWith("error")) {
    return NextResponse.json({ error: "delivery failed" }, { status: 502 });
  }
  console.log("[inquiry]", { company, spot: spotLabel, ...results });
  return NextResponse.json({ ok: true, ...results });
}
