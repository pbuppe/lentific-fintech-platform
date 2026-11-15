/**
 * Console super admin (demande produit 2026-11-14, maquette Lentific) :
 *  - équipe : inviter un membre (il choisit son mot de passe via un lien),
 *    suspendre / réactiver ;
 *  - clients : suspendre / réactiver un compte ;
 *  - assistance en direct : le client génère un code à 6 chiffres qui vaut
 *    accord pour 30 minutes ; l'équipe peut alors agir pour lui (déposer un
 *    document reçu par e-mail) ou le guider pas à pas. Tout est journalisé et
 *    le client est notifié de ce qui est fait sur son compte.
 */
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma, auditLogsRepo, notificationsRepo, type Role } from "@fintech/database";
import { sendStaffInviteEmail } from "./mailer";

export class ConsoleError extends Error {}

type Actor = { id: string; role: Role; name: string | null; email: string; countryId: string };

export const STAFF_ROLES: Role[] = ["AGENT", "ADMIN", "SUPER_ADMIN"];
const CLIENT_ROLES: Role[] = ["BORROWER", "INVESTOR"];
const INVITE_DURATION_MS = 72 * 60 * 60 * 1000;
const CODE_DURATION_MS = 10 * 60 * 1000;
const ASSISTANCE_DURATION_MS = 30 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;
export const GUIDANCE_KEYS = ["sign", "pay", "identity", "accept", "documents"] as const;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function requireSuperAdmin(actor: Actor) {
  if (actor.role !== "SUPER_ADMIN") throw new ConsoleError("not_allowed");
}

function audit(actor: Actor, action: string, targetId: string, after?: object) {
  return auditLogsRepo.create({ userId: actor.id, action: `console.${action}`, entity: `User:${targetId}`, after });
}

// --- Équipe ------------------------------------------------------------------

export async function listStaff() {
  const staff = await prisma.user.findMany({
    where: { role: { in: STAFF_ROLES } },
    select: { id: true, name: true, email: true, role: true, accountStatus: true, passwordHash: true, createdAt: true },
    orderBy: [{ role: "desc" }, { name: "asc" }],
  });
  const lastLogins = await prisma.session.groupBy({
    by: ["userId"],
    where: { userId: { in: staff.map((s) => s.id) } },
    _max: { createdAt: true },
  });
  return staff.map(({ passwordHash, ...s }) => ({
    ...s,
    invitationPending: !passwordHash,
    lastLoginAt: lastLogins.find((l) => l.userId === s.id)?._max.createdAt ?? null,
  }));
}

export async function inviteStaff(actor: Actor, input: { name: string; email: string; role: string }, adminBaseUrl: string) {
  requireSuperAdmin(actor);
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim().slice(0, 80);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name.length < 2) throw new ConsoleError("invalid_input");
  if (!(["AGENT", "ADMIN", "SUPER_ADMIN"] as string[]).includes(input.role)) throw new ConsoleError("invalid_input");
  if (await prisma.user.findUnique({ where: { email } })) throw new ConsoleError("email_taken");

  const user = await prisma.user.create({
    data: { email, name, role: input.role as Role, countryId: actor.countryId, accountStatus: "ACTIVE", preferredLocale: null },
  });
  const token = randomBytes(32).toString("hex");
  await prisma.accountSetupToken.create({
    data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + INVITE_DURATION_MS) },
  });
  await audit(actor, "staff_invited", user.id, { email, role: input.role });
  await sendStaffInviteEmail(user, `${adminBaseUrl.replace(/\/$/, "")}/activer/${token}`, actor.name ?? actor.email);
  return user;
}

export async function resendStaffInvite(actor: Actor, userId: string, adminBaseUrl: string) {
  requireSuperAdmin(actor);
  const user = await prisma.user.findFirst({ where: { id: userId, role: { in: STAFF_ROLES }, passwordHash: null } });
  if (!user) throw new ConsoleError("not_found");
  await prisma.accountSetupToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
  const token = randomBytes(32).toString("hex");
  await prisma.accountSetupToken.create({
    data: { userId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + INVITE_DURATION_MS) },
  });
  await audit(actor, "staff_invite_resent", userId);
  await sendStaffInviteEmail(user, `${adminBaseUrl.replace(/\/$/, "")}/activer/${token}`, actor.name ?? actor.email);
}

/** Page publique /activer/[token] : vérifie le lien sans le consommer. */
export async function findValidSetupToken(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const row = await prisma.accountSetupToken.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } });
  if (!row || row.usedAt || row.expiresAt < new Date() || row.user.accountStatus !== "ACTIVE") return null;
  return row;
}

export async function activateStaffAccount(token: string, password: string) {
  const row = await findValidSetupToken(token);
  if (!row) throw new ConsoleError("invalid_link");
  if (password.length < 10) throw new ConsoleError("password_short");
  await prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  await prisma.accountSetupToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  await auditLogsRepo.create({ userId: row.userId, action: "console.staff_activated", entity: `User:${row.userId}` });
  return row.user;
}

async function setStatus(actor: Actor, userId: string, status: "ACTIVE" | "SUSPENDED", roles: Role[]) {
  requireSuperAdmin(actor);
  if (userId === actor.id) throw new ConsoleError("self");
  const target = await prisma.user.findFirst({ where: { id: userId, role: { in: roles } } });
  if (!target) throw new ConsoleError("not_found");
  if (status === "SUSPENDED" && target.role === "SUPER_ADMIN") {
    const others = await prisma.user.count({ where: { role: "SUPER_ADMIN", accountStatus: "ACTIVE", id: { not: userId } } });
    if (others === 0) throw new ConsoleError("last_super_admin");
  }
  if (status === "ACTIVE" && !["SUSPENDED"].includes(target.accountStatus)) throw new ConsoleError("not_found");
  await prisma.user.update({ where: { id: userId }, data: { accountStatus: status } });
  // Une suspension coupe l'accès immédiatement : toutes les sessions ouvertes sont fermées.
  if (status === "SUSPENDED") await prisma.session.deleteMany({ where: { userId } });
  await audit(actor, status === "SUSPENDED" ? "account_suspended" : "account_reactivated", userId, { role: target.role });
}

export const setStaffStatus = (actor: Actor, userId: string, status: "ACTIVE" | "SUSPENDED") => setStatus(actor, userId, status, STAFF_ROLES);
export const setClientStatus = (actor: Actor, userId: string, status: "ACTIVE" | "SUSPENDED") => setStatus(actor, userId, status, CLIENT_ROLES);

// --- Clients -----------------------------------------------------------------

export async function listClientsForConsole(q?: string) {
  const query = q?.trim();
  const clients = await prisma.user.findMany({
    where: {
      role: { in: CLIENT_ROLES },
      accountStatus: { in: ["ACTIVE", "SUSPENDED"] },
      ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" as const } }, { email: { contains: query, mode: "insensitive" as const } }] } : {}),
    },
    select: {
      id: true, name: true, email: true, phone: true, role: true, accountStatus: true,
      applications: { select: { reference: true, status: true }, orderBy: { createdAt: "desc" }, take: 1 },
      assistanceAsClient: { select: { problem: true, createdAt: true, endedAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ name: "asc" }],
    take: 100,
  });
  return clients;
}

// --- Assistance en direct ------------------------------------------------------

/** Côté client : génère un nouveau code (les codes précédents non utilisés sont annulés). */
export async function createAssistanceCode(clientId: string, problem?: string) {
  await prisma.assistanceSession.updateMany({
    where: { clientId, startedAt: null, endedAt: null },
    data: { endedAt: new Date() },
  });
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const session = await prisma.assistanceSession.create({
    data: {
      clientId,
      codeHash: "",
      codeExpiresAt: new Date(Date.now() + CODE_DURATION_MS),
      problem: problem?.trim().slice(0, 300) || null,
    },
  });
  await prisma.assistanceSession.update({ where: { id: session.id }, data: { codeHash: sha256(`${session.id}:${code}`) } });
  return { code, expiresAt: session.codeExpiresAt };
}

/** État de l'assistance pour un client : code en attente, ou session ouverte. */
export async function getClientAssistance(clientId: string) {
  const now = new Date();
  const latest = await prisma.assistanceSession.findFirst({
    where: { clientId, endedAt: null },
    include: { staff: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return null;
  if (latest.startedAt && latest.expiresAt && latest.expiresAt > now) return { ...latest, state: "active" as const };
  if (!latest.startedAt && latest.codeExpiresAt > now && latest.attempts < MAX_CODE_ATTEMPTS) return { ...latest, state: "pending" as const };
  return null;
}

export async function cancelAssistanceCode(clientId: string) {
  await prisma.assistanceSession.updateMany({ where: { clientId, startedAt: null, endedAt: null }, data: { endedAt: new Date() } });
}

export async function openAssistance(actor: Actor, clientId: string, code: string) {
  if (!STAFF_ROLES.includes(actor.role) || actor.role === "AGENT") throw new ConsoleError("not_allowed");
  const pending = await prisma.assistanceSession.findFirst({
    where: { clientId, startedAt: null, endedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!pending || pending.codeExpiresAt < new Date() || pending.attempts >= MAX_CODE_ATTEMPTS) throw new ConsoleError("no_code");
  const cleaned = code.replace(/\s/g, "");
  const expected = Buffer.from(pending.codeHash);
  const given = Buffer.from(sha256(`${pending.id}:${cleaned}`));
  if (!/^\d{6}$/.test(cleaned) || expected.length !== given.length || !timingSafeEqual(expected, given)) {
    await prisma.assistanceSession.update({ where: { id: pending.id }, data: { attempts: { increment: 1 } } });
    throw new ConsoleError(pending.attempts + 1 >= MAX_CODE_ATTEMPTS ? "too_many_attempts" : "bad_code");
  }
  const session = await prisma.assistanceSession.update({
    where: { id: pending.id },
    data: { staffId: actor.id, startedAt: new Date(), expiresAt: new Date(Date.now() + ASSISTANCE_DURATION_MS) },
  });
  await audit(actor, "assistance_opened", clientId);
  await notificationsRepo.create({ userId: clientId, event: "assistance.started", senderId: actor.id });
  return session;
}

/** Vérifie qu'une session d'assistance est ouverte par CET agent pour CE client. */
export async function requireActiveAssistance(actor: Actor, clientId: string) {
  const s = await getClientAssistance(clientId);
  if (!s || s.state !== "active" || s.staffId !== actor.id) throw new ConsoleError("no_session");
  return s;
}

export async function setAssistanceGuidance(actor: Actor, clientId: string, key: string) {
  const s = await requireActiveAssistance(actor, clientId);
  if (!(GUIDANCE_KEYS as readonly string[]).includes(key)) throw new ConsoleError("invalid_input");
  await prisma.assistanceSession.update({ where: { id: s.id }, data: { guidance: key } });
  await audit(actor, "assistance_guided", clientId, { guidance: key });
}

export async function recordAssistanceAction(actor: Actor, clientId: string, action: string, detail?: string) {
  await requireActiveAssistance(actor, clientId);
  await audit(actor, `assistance_${action}`, clientId, detail ? { detail } : undefined);
  await notificationsRepo.create({ userId: clientId, event: `assistance.${action}`, senderId: actor.id, body: detail });
}

export async function endAssistance(actor: Actor, clientId: string) {
  const s = await requireActiveAssistance(actor, clientId);
  await prisma.assistanceSession.update({ where: { id: s.id }, data: { endedAt: new Date(), guidance: null } });
  const minutes = Math.max(1, Math.round((Date.now() - (s.startedAt?.getTime() ?? Date.now())) / 60000));
  await audit(actor, "assistance_ended", clientId, { minutes });
  await notificationsRepo.create({ userId: clientId, event: "assistance.ended", senderId: actor.id });
}

export function listConsoleLog(take = 40) {
  return prisma.auditLog.findMany({
    where: { action: { startsWith: "console." } },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

/** Journal visible par le client : ce que l'équipe a fait sur son compte. */
export function listConsoleLogForClient(clientId: string, take = 20) {
  return prisma.auditLog.findMany({
    where: { action: { startsWith: "console." }, entity: `User:${clientId}` },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}
