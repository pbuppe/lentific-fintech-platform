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

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  usersRepo,
  sessionsRepo,
  auditLogsRepo,
  emailVerificationTokensRepo,
  type Role,
  type AccountStatus,
} from "@fintech/database";
import { sendVerifyEmail, sendAccountApprovedEmail, sendAccountRejectedEmail, webBaseUrl, webUrlInLocale } from "./mailer";

export { sendContactRequestNotice, contactInbox } from "./mailer";
export { sendEmail, webBaseUrl, sendClientNoticeEmail,
  sendPremiumPaymentFailedEmail, type ClientNoticeKind } from "./mailer";

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

/**
 * Crée un compte + sa session. Le mot de passe n'est jamais stocké en clair.
 * Le compte naît en PENDING_EMAIL : la session permet seulement d'afficher la
 * page « compte en attente » ; l'espace client reste fermé tant qu'un
 * administrateur n'a pas validé (demande produit 2026-11-14).
 */
export async function signUp(input: {
  email: string;
  password: string;
  role: Extract<Role, "BORROWER" | "INVESTOR">;
  countryId: string;
  name?: string;
  locale?: string;
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
  const pendingUser = await usersRepo.setAccountStatus(user.id, "PENDING_EMAIL");
  const withLocale = input.locale
    ? await usersRepo.setPreferredLocale(user.id, input.locale)
    : pendingUser;

  await auditLogsRepo.create({
    userId: user.id,
    action: "account.signed_up",
    entity: "User",
    after: { email: user.email, role: user.role, accountStatus: "PENDING_EMAIL" },
  });
  await issueEmailVerification(withLocale);

  const token = generateToken();
  await sessionsRepo.create(user.id, token, new Date(Date.now() + SESSION_DURATION_MS));
  return { user: withLocale, token };
}

// ---------------------------------------------------------------------------
// Confirmation d'e-mail + validation par un administrateur (2026-11-14)
// ---------------------------------------------------------------------------

const EMAIL_VERIFICATION_DURATION_MS = 48 * 60 * 60 * 1000; // 48 heures

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Seuls les comptes ACTIVE ont accès à leur espace. */
export function isAccountActive(user: { accountStatus: AccountStatus }) {
  return user.accountStatus === "ACTIVE";
}

/** Génère un nouveau lien de confirmation (les précédents deviennent caducs) et l'envoie. */
export async function issueEmailVerification(user: {
  id: string;
  email: string;
  name: string | null;
  preferredLocale: string | null;
}) {
  await emailVerificationTokensRepo.invalidateAllForUser(user.id);
  const token = generateToken();
  await emailVerificationTokensRepo.create(user.id, hashToken(token), new Date(Date.now() + EMAIL_VERIFICATION_DURATION_MS));
  const url = webUrlInLocale(`/verifier-email?token=${token}`, user.preferredLocale);
  await sendVerifyEmail(user, url);
}

/** Renvoi demandé par l'utilisateur ou un administrateur ; seulement si l'e-mail n'est pas encore confirmé. */
export async function resendEmailVerification(userId: string) {
  const user = await usersRepo.findById(userId);
  if (!user || user.accountStatus !== "PENDING_EMAIL") return false;
  await issueEmailVerification(user);
  return true;
}

export type VerifyEmailResult = "verified" | "already_verified" | "expired" | "invalid";

/** Consomme un lien de confirmation : PENDING_EMAIL → PENDING_REVIEW. */
export async function verifyEmailToken(token: string | undefined): Promise<VerifyEmailResult> {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return "invalid";
  const record = await emailVerificationTokensRepo.findByHash(hashToken(token));
  if (!record) return "invalid";
  if (record.user.accountStatus !== "PENDING_EMAIL") return "already_verified";
  if (record.usedAt) return "invalid";
  if (record.expiresAt < new Date()) return "expired";

  await emailVerificationTokensRepo.markUsed(record.id);
  await usersRepo.setAccountStatus(record.userId, "PENDING_REVIEW", { emailVerifiedAt: new Date() });
  await auditLogsRepo.create({
    userId: record.userId,
    action: "account.email_verified",
    entity: "User",
    before: { accountStatus: "PENDING_EMAIL" },
    after: { accountStatus: "PENDING_REVIEW" },
  });
  return "verified";
}

/** Rôles autorisés à valider/refuser une inscription. */
export const ACCOUNT_REVIEWER_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"];

function assertReviewer(reviewer: { role: Role }) {
  if (!ACCOUNT_REVIEWER_ROLES.includes(reviewer.role)) {
    throw new AuthError("Seul un administrateur peut valider ou refuser un compte.");
  }
}

export async function approveAccount(userId: string, reviewer: { id: string; role: Role }) {
  assertReviewer(reviewer);
  const user = await usersRepo.findById(userId);
  if (!user || (user.accountStatus !== "PENDING_REVIEW" && user.accountStatus !== "PENDING_EMAIL")) {
    throw new AuthError("Ce compte n'est pas en attente de validation.");
  }
  const updated = await usersRepo.setAccountStatus(userId, "ACTIVE", {
    accountReviewedAt: new Date(),
    accountReviewedById: reviewer.id,
    accountRejectionReason: null,
    // Validation forcée d'un compte dont l'e-mail n'est pas confirmé :
    // l'administrateur se porte garant de l'adresse.
    ...(user.emailVerifiedAt ? {} : { emailVerifiedAt: new Date() }),
  });
  await auditLogsRepo.create({
    userId: reviewer.id,
    action: "account.approved",
    entity: "User",
    before: { userId, accountStatus: user.accountStatus },
    after: { userId, accountStatus: "ACTIVE" },
  });
  await sendAccountApprovedEmail(updated);
  return updated;
}

export async function rejectAccount(userId: string, reviewer: { id: string; role: Role }, reason: string) {
  assertReviewer(reviewer);
  const cleanReason = reason.trim();
  if (cleanReason.length < 3) throw new AuthError("Indiquez un motif de refus.");
  const user = await usersRepo.findById(userId);
  if (!user || (user.accountStatus !== "PENDING_REVIEW" && user.accountStatus !== "PENDING_EMAIL")) {
    throw new AuthError("Ce compte n'est pas en attente de validation.");
  }
  const updated = await usersRepo.setAccountStatus(userId, "REJECTED", {
    accountReviewedAt: new Date(),
    accountReviewedById: reviewer.id,
    accountRejectionReason: cleanReason,
  });
  await auditLogsRepo.create({
    userId: reviewer.id,
    action: "account.rejected",
    entity: "User",
    before: { userId, accountStatus: user.accountStatus },
    after: { userId, accountStatus: "REJECTED", reason: cleanReason },
  });
  await sendAccountRejectedEmail(updated, cleanReason);
  return updated;
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

// ---------------------------------------------------------------------------
// Lien secret de bootstrap admin (§ demande produit 2026-09-18)
// ---------------------------------------------------------------------------

/**
 * Comparaison à temps constant du jeton fourni dans l'URL contre
 * ADMIN_BOOTSTRAP_TOKEN (jamais committé, réglé dans les variables
 * d'environnement Vercel). Un `===` classique fuit un timing différent selon
 * le nombre de caractères corrects trouvés avant le premier écart, ce qui
 * permettrait en théorie de deviner le jeton caractère par caractère.
 */
export function isValidBootstrapToken(provided: string | undefined): boolean {
  const expected = process.env.ADMIN_BOOTSTRAP_TOKEN;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Crée un compte agent/admin/super-admin sans passer par le formulaire
 * public de /signup (réservé à BORROWER/INVESTOR, voir signUp ci-dessus).
 * N'ouvre pas de session : la personne créée se connecte ensuite normalement
 * depuis /login, ce lien sert uniquement à amorcer un compte, pas à
 * emprunter son identité (§ demande produit : "sans se connecter au compte
 * administrateur principal"). Consigne systématiquement l'action dans
 * AuditLog : un point d'entrée capable de créer un super administrateur sans
 * authentification préalable doit laisser une trace exploitable.
 */
export async function bootstrapAdminAccount(input: {
  email: string;
  password: string;
  name: string;
  role: Extract<Role, "AGENT" | "ADMIN" | "SUPER_ADMIN">;
  countryId: string;
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

  await auditLogsRepo.create({
    userId: user.id,
    action: "admin.bootstrap_created",
    entity: "User",
    after: { email: user.email, role: user.role },
  });

  return user;
}
export * from "./console";
export * from "./marketing";
