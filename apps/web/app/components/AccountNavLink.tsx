"use client";

import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@fintech/ui";

/** Lien de menu de l'espace client, surligné quand la page courante lui correspond. */
export function AccountNavLink({
  href,
  label,
  badge,
  icon,
  variant,
}: {
  href: string;
  label: string;
  badge?: number;
  icon?: IconName;
  variant: "side" | "top";
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  if (variant === "top") {
    return (
      <a
        href={href}
        aria-current={active ? "page" : undefined}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
          active ? "bg-surface text-ink shadow-sm" : "text-ink-soft hover:bg-surface hover:text-ink"
        }`}
      >
        {icon && <Icon name={icon} size={16} />}
        {label}
      </a>
    );
  }

  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
        active ? "bg-brand text-white" : "text-ink-soft hover:bg-surface-alt hover:text-ink"
      }`}
    >
      <span className="flex items-center gap-2.5">
        {icon && <Icon name={icon} size={18} className={active ? "text-white" : "text-brand-ink"} />}
        {label}
      </span>
      {badge ? (
        <span
          className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold ${
            active ? "bg-white text-brand" : "bg-accent text-white"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </a>
  );
}
