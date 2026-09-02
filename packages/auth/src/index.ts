/**
 * Authentification & autorisations (§04).
 *
 * DÉCISION PRODUIT (nuit de construction) : plutôt que de figer une version
 * de la librairie Better Auth sans pouvoir vérifier son API en direct, ce
 * module implémente une session maison simple mais réelle : mot de passe
 * haché (bcrypt) + jeton opaque en cookie httpOnly, stocké dans le modèle
 * `Session` (packages/database). C'est le même principe que KYC/signature :
 * une interface stable (signUp/signIn/signOut/getSessionUser, can/assertCan)
 * que le reste de la plateforme utilise sans rien savoir de l'implémentation.
 * Pour brancher Better Auth plus tard (MFA, OAuth Google/Apple/Microsoft) :
 * remplacer le contenu de ce fichier sans changer sa signature exportée.
 */

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { usersRepo, sessionsRepo, type Role } from "@fintech/database";

export const ROLE_HIERARCHY: Record<Role, number> = {
  BORROWER: 0,
  INVESTOR: 0,
  AGENT: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

// Permissions cohérentes avec les rôles définis au §3 / stockées en base (§43, model Permission).
const PERMISSIONS: Record<Role, string[]> = {
  BORROWER: ["application:create", "application:read:own", "document:upload:own"],
  INVESTOR: ["funding:invest", "portfolio:read:own"],
  AGENT: ["application:review", "document:verify", "support:respond"],
  ADMIN: ["application:*", "user:*", "payment:read", "rules:manage"],
  SUPER_ADMIN: ["*"],
};

export function can(role: Role, action: string): boolean {
  const grants = PERMISSIONS[role];
  if (grants.includes("*")) return true;
  return grants.some((g) => g === action || (g.endsWith(":*") && action.startsWith(g.slice(0, -1))));
}

export interface Session {
  userId: string;
  role: Role;
  tenantId: string | null;
}

/**
 * À appeler dans chaque route/action serveur qui exige un droit précis.
 * Lève une erreur explicite plutôt que de laisser filtrer un 500 générique.
 */
export function assertCan(session: Session, action: string) {
  if (!can(session.role, action)) {
    throw new Error(`Action refusée : le rôle ${session.role} n'a pas la permission "${action}".`);
  }
}

// ---------------------------------------------------------------------------
// Session maison : mot de passe + jeton en cookie httpOnly
// ---------------------------------------------------------------------------

export const SESSION_COOKIE_NAME = "lentific_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export class AuthError extends Error {}

/** Crée un compte + sa session. Le mot de passe n'est jamais stocké en clair. */
export async function signUp(input: {
  email: string;
  password: string;
  role: Extract<Role, "BORROWER" | "INVESTOR">;
  countryId: string;
  name?: string;
}) {
  const existing = await usersRepo.findByEmail(input.email);
  if (existing) {
    throw new AuthError("Un compte existe déjà avec cet e-mail.");
  }
  if (input.password.length < 8) {
    throw new AuthError("Le mot de passe doit contenir au moins 8 caractères.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await usersRepo.create({
    email: input.email,
    countryId: input.countryId,
    role: input.role,
    name: input.name,
    passwordHash,
  });

  const token = generateToken();
  await sessionsRepo.create(user.id, token, new Date(Date.now() + SESSION_DURATION_MS));
  return { user, token };
}

/** Vérifie l'identifiant/mot de passe et ouvre une nouvelle session. */
export async function signIn(input: { email: string; password: string }) {
  const user = await usersRepo.findByEmail(input.email);
  if (!user || !user.passwordHash) {
    throw new AuthError("E-mail ou mot de passe incorrect.");
  }
  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthError("E-mail ou mot de passe incorrect.");
  }

  const token = generateToken();
  await sessionsRepo.create(user.id, token, new Date(Date.now() + SESSION_DURATION_MS));
  return { user, token };
}

export async function signOut(token: string) {
  await sessionsRepo.deleteByToken(token);
}

/** Retrouve l'utilisateur connecté à partir du jeton de cookie. `null` si absent/expiré. */
export async function getSessionUser(token: string | undefined) {
  if (!token) return null;
  const session = await sessionsRepo.findByToken(token);
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}
