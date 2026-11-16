import type { IconName } from "@fintech/ui";
import { AccountNavLink } from "./AccountNavLink";

export type NavItem = { href: string; label: string; badge?: number; icon?: IconName };

/**
 * Mise en page de l'espace client (demande produit 2026-11-14) : quelques
 * entrées « découverte » en haut (investisseurs, mises en relation…), et tout
 * ce qui concerne le compte du client dans un menu vertical à gauche. Sur
 * mobile, le menu latéral devient une barre défilante au-dessus du contenu.
 */
export function AccountShell({
  top,
  side,
  sideTitle,
  sideFooter,
  banner,
  children,
}: {
  top: NavItem[];
  side: NavItem[];
  sideTitle: string;
  sideFooter?: React.ReactNode;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      {banner}
      <nav className="flex gap-1 overflow-x-auto border-b border-line bg-surface-alt px-6 py-2 sm:px-12">
        {top.map((item) => (
          <AccountNavLink key={item.href} variant="top" {...item} />
        ))}
      </nav>
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-line bg-surface px-4 py-3 lg:min-h-[calc(100vh-110px)] lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
          <p className="hidden px-3 pb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint lg:block">{sideTitle}</p>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {side.map((item) => (
              <AccountNavLink key={item.href} variant="side" {...item} />
            ))}
          </nav>
          {sideFooter && <div className="mt-6 hidden lg:block">{sideFooter}</div>}
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
