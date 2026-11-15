import { cookies } from "next/headers";
import { getSessionUser, isAccountActive, SESSION_COOKIE_NAME } from "@fintech/auth";

/**
 * Glue Next.js (cookies()) ↔ @fintech/auth, propre à chaque app, pas de logique métier ici.
 * Un compte suspendu (statut ≠ ACTIVE) est traité comme non connecté.
 */
export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);
  return user && isAccountActive(user) ? user : null;
}
