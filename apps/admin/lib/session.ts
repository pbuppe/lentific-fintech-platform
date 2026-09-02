import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE_NAME } from "@fintech/auth";

/** Glue Next.js (cookies()) ↔ @fintech/auth, propre à chaque app, pas de logique métier ici. */
export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return getSessionUser(token);
}
