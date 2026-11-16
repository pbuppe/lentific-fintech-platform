import { colors } from "./tokens";

/**
 * Logo Lentific « La passerelle » (choisi le 2026-11-16) : le L relie deux
 * points, l'emprunteur (rouge) et l'investisseur (jaune), sur le carré bleu.
 * `plain` retire le carré (pour un fond déjà bleu, ex. menu du back-office).
 * Même dessin que les favicons (apps/web/app/icon.svg, apps/admin/app/icon.svg).
 */
export const LOGO_PATHS = {
  stroke: "M18 14v30a6 6 0 0 0 6 6h18",
  top: { cx: 18, cy: 14, r: 7 },
  bottom: { cx: 47, cy: 50, r: 7 },
};

export function LogoMark({ size = 24, plain = false, className }: { size?: number; plain?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      {!plain && <rect x="2" y="2" width="60" height="60" rx="14" fill={colors.brand} />}
      <path d={LOGO_PATHS.stroke} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      <circle {...LOGO_PATHS.bottom} fill={colors.yellow} />
      <circle {...LOGO_PATHS.top} fill={colors.accent} />
    </svg>
  );
}
