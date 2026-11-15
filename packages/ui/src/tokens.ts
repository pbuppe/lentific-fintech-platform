/**
 * Design tokens SODIVA CREDITS (lot 6 de l'intégration de la maquette, 2026-11-14) :
 * vert profond dominant, fond crème, sable pour les états « en attente », rouge
 * brique pour les alertes. Source unique de vérité pour Tailwind (apps/web,
 * apps/admin) et pour tout composant de packages/ui.
 *
 * Les noms de jetons historiques sont conservés pour ne pas toucher aux écrans :
 * `brand` = vert SODIVA ; `yellow` = couleur des boutons d'action principale
 * (vert, texte clair) ; `accent` = rouge brique ; `sand` = états en attente.
 */
export const colors = {
  bg: "#F4F1EA",
  surface: "#FFFFFF",
  surfaceAlt: "#FAF7F1",
  ink: "#1F2A24",
  inkSoft: "#4E5A54",
  inkFaint: "#6B756F",
  line: "#E8DFCE",

  brand: "#2F5D46",
  brandInk: "#1F3F2F",
  brandSoft: "#DCE7DD",

  accent: "#B8432F",
  accentSoft: "#FCEDE9",

  yellow: "#2F5D46", // bouton d'action principal (texte clair)
  yellowInk: "#1F3F2F", // survol du bouton principal
  yellowSoft: "#FBF3E2",

  sand: "#F6E7C8",
  sandInk: "#6B4E12",

  success: "#1F6B45",
  successSoft: "#DCE7DD",
} as const;

export type ColorToken = keyof typeof colors;
