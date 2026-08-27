"use client";
import { useState } from "react";
import { SPOTS } from "@/data/spots";
import { TIER_ORDER } from "@/data/tiers";
import { yen } from "@/lib/format";

type Field = "company" | "name" | "email" | "spot" | "message";
type Errors = Partial<Record<Field, string>>;

const inputCls =
  "w-full border-[3px] border-ink bg-paper px-3.5 py-3 text-[16px] outline-none focus:bg-yellow/30 aria-[invalid=true]:border-dashed";

/** Inquiry form. Inline errors, explicit states, no modal. Posts to /api/inquiry. */
export function InquiryForm({ initialSpot = "" }: { initialSpot?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState({ company: "", name: "", email: "", spot: initialSpot, message: "", invoice: false });

  const set = (k: keyof typeof values, v: string | boolean) => setValues((o) => ({ ...o, [k]: v }));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!values.company.trim()) e.company = "会社名か屋号を書いてください。個人の方はお名前で大丈夫です。";
    if (!values.name.trim()) e.name = "担当者のお名前を書いてください。";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "返信できるメールアドレスを書いてください。";
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setState("sending");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="paper tape relative max-w-[36em] -rotate-1 p-7">
        <div className="font-display text-[32px] leading-[1.15]">受け付けました。</div>
        <p className="mt-3 text-[15px] leading-[1.8]">
          返信は2日以内にします。ロゴを貼った状態の痛車の画像を添えてお返しするので、社内に見せるのに使ってください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid max-w-[40em] gap-5">
      <label className="grid gap-1.5">
        <span className="text-[13px] font-black">会社名 / 屋号</span>
        <input className={inputCls} value={values.company} onChange={(e) => set("company", e.target.value)} aria-invalid={!!errors.company} autoComplete="organization" />
        {errors.company && <span className="text-[13px] font-bold">{errors.company}</span>}
      </label>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-[13px] font-black">担当者名</span>
          <input className={inputCls} value={values.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} autoComplete="name" />
          {errors.name && <span className="text-[13px] font-bold">{errors.name}</span>}
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-black">メール</span>
          <input className={inputCls} type="email" value={values.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} autoComplete="email" inputMode="email" />
          {errors.email && <span className="text-[13px] font-bold">{errors.email}</span>}
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className="text-[13px] font-black">気になっている枠（あれば）</span>
        <select className={inputCls} value={values.spot} onChange={(e) => set("spot", e.target.value)}>
          <option value="">まだ決めていない</option>
          <option value="lp">ローンチパートナー（非売品枠）について</option>
          {TIER_ORDER.filter((t) => t !== "LP").map((t) => (
            <optgroup key={t} label={`${t}枠`}>
              {SPOTS.filter((s) => s.tier === t).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameJa}　{yen(s.price)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="text-[13px] font-black">ひとこと（任意）</span>
        <textarea className={`${inputCls} min-h-[120px]`} value={values.message} onChange={(e) => set("message", e.target.value)} />
      </label>
      <label className="flex items-center gap-2.5 text-[14px] font-bold">
        <input type="checkbox" className="size-5 accent-[#FFE500]" checked={values.invoice} onChange={(e) => set("invoice", e.target.checked)} />
        請求書払いを希望
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "sending"} className="pop-btn lg disabled:opacity-60" style={{ ["--r" as string]: "-1deg" }}>
          {state === "sending" ? "送っています…" : "問い合わせる"}
        </button>
        {state === "error" && <span className="text-[13px] font-bold">送れませんでした。時間をおいてもう一度試してください。</span>}
      </div>
    </form>
  );
}
