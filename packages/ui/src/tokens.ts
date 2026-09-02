/**
 * Design tokens Lentific : bleu dominant (moins vif, plus profond), blanc cassé,
 * rouge fonctionnel ET décoratif, jaune fonctionnel (boutons) ET décoratif.
 * Palette v1.1 (assombrie/désaturée + jaune ajouté) ; source unique de vérité
 * pour Tailwind (apps/web, apps/admin) et pour tout composant de packages/ui.
 */
export const colors = {
  bg: "#EEEBE3",
  surface: "#FFFFFF",
  surfaceAlt: "#F6F3EC",
  ink: "#171B2B",
  inkSoft: "#545B6E",
  inkFaint: "#8A8F9E",
  line: "#E2DDD0",

  brand: "#2E4A9E", // bleu dominant, moins vif et plus foncé que la v1.0
  brandInk: "#1C2F6B",
  brandSoft: "#E4E8F5",

  accent: "#C4293A", // rouge, fonctionnel (alertes) ET décoratif (traits, soulignés, formes)
  accentSoft: "#FBE7E7",

  yellow: "#F5C21B", // jaune, fonctionnel (boutons, toujours avec texte noir/ink) ET décoratif
  yellowInk: "#C89A00", // hover/actif sur fond jaune, le texte reste noir
  yellowSoft: "#FCF0C7",

  success: "#157F45",
  successSoft: "#E5F4EB",
} as const;

export type ColorToken = keyof typeof colors;
