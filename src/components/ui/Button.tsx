import Link from "next/link";
import type { ComponentProps } from "react";

type Base = { variant?: "primary" | "ghost"; size?: "md" | "lg"; rotate?: number; className?: string };
type LinkProps = Base & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className">;
type BtnProps = Base & { href?: undefined } & Omit<ComponentProps<"button">, "className">;

function split<T extends Base>(props: T) {
  const { variant = "primary", size = "md", rotate = 0, className = "", ...rest } = props;
  const cls = `pop-btn ${variant === "ghost" ? "ghost" : ""} ${size === "lg" ? "lg" : ""} ${className}`;
  const style = { ["--r" as string]: `${rotate}deg` };
  return { cls, style, rest };
}

/** Paper POP button. Yellow primary, paper ghost. Lifts on hover, scales 0.98 on press. */
export function Button(props: LinkProps | BtnProps) {
  if ("href" in props && props.href) {
    const { cls, style, rest } = split(props as LinkProps);
    const { href, ...linkRest } = rest as LinkProps;
    return <Link href={href} className={cls} style={style} {...linkRest} />;
  }
  const { cls, style, rest } = split(props as BtnProps);
  const { href: _unused, ...btnRest } = rest as BtnProps;
  void _unused;
  return <button type="button" className={cls} style={style} {...btnRest} />;
}
