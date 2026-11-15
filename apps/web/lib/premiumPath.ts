/** Page Premium selon l'espace : /investor/premium pour un investisseur, /premium pour un emprunteur. */
export function premiumPath(role: string | null | undefined) {
  return role === "INVESTOR" ? "/investor/premium" : "/premium";
}
