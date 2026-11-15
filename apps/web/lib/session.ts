import { cookies } from "next/headers";
import { getSessionUser, isAccountActive, SESSION_COOKIE_NAME } from "@fintech/auth";

/**
 * Utilisateur connecté, QUEL QUE SOIT le statut de son compte (en attente,
 * refusé...). À n'utiliser que là où un compte non validé doit pouvoir
 * apparaître : en-tête du site, page « compte en attente », choix de langue.
 */
export async function getSignedInUser() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return getSessionUser(token);
}

/**
 * Utilisateur connecté ET validé par un administrateur (demande produit
 * 2026-11-14). Un compte en attente/refusé/suspendu est traité comme non
 * connecté par toutes les pages, actions serveur et routes API de l'espace
 * client : fermé par défaut, sans avoir à y penser dans chaque fichier.
 */
export async function getCurrentUser() {
  const user = await getSignedInUser();
  return user && isAccountActive(user) ? user : null;
}
