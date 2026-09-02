import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "link";

const variantClasses: Record<Variant, string> = {
  primary: "bg-yellow text-ink hover:bg-yellow-ink",
  ghost: "border border-line text-ink hover:bg-surface-alt",
  link: "text-brand-ink underline decoration-accent underline-offset-4 font-semibold",
};

type CommonProps = { variant?: Variant; className?: string };

/** `href` fait rendre un `<a>` stylé comme un bouton, même composant, même palette, pour une simple navigation. */
export function Button({
  variant = "primary",
  className = "",
  href,
  ...props
}: CommonProps & (({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>))) {
  const base = variant === "link" ? "text-sm" : "inline-block rounded-lg px-4 py-2.5 text-sm font-semibold";
  const classes = `${base} ${variantClasses[variant]} ${className}`;

  if (href) {
    return <a href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} />;
  }
  return <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} />;
}
