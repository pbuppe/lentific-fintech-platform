import type { ReactNode } from "react";

/**
 * Carte de base. `accented` ajoute le liseré rouge décoratif à gauche
 * (signature graphique Lentific, sans signification d'alerte).
 */
export function Card({
  children,
  accented = false,
  className = "",
}: {
  children: ReactNode;
  accented?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-xl border border-line bg-surface p-5 shadow-sm ${
        accented ? "before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:rounded-l-xl before:bg-accent" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
