"use server";

import { usersRepo } from "@fintech/database";
import { getCurrentUser } from "../session";

/**
 * Mémorise la langue choisie sur le compte, quand une session existe
 * (§ demande produit 2026-09-18 : le contrat doit se générer dans la langue
 * du visiteur, mais sa génération est déclenchée plus tard par un
 * événement serveur, pas par une page en cours de rendu, donc le cookie seul
 * ne suffit pas). Silencieux si personne n'est connectée, LanguageSwitcher
 * marche déjà très bien sans compte via le cookie NEXT_LOCALE.
 */
export async function setPreferredLocale(locale: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await usersRepo.setPreferredLocale(user.id, locale);
}
