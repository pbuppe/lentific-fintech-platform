"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { prisma } from "@fintech/database";

const PROJECTS = ["MORTGAGE", "CONSOLIDATION", "WORKS", "OTHER"];

/**
 * Formulaire « Demandez votre étude gratuite » du site vitrine (2026-11-14).
 * Pas d'e-mail automatique au prospect (un formulaire public ne doit pas
 * permettre d'envoyer des e-mails à n'importe quelle adresse) : la demande
 * arrive dans le back-office, l'équipe rappelle.
 */
export async function submitContactRequestAction(formData: FormData) {
  const back = (code: string) => redirect(`/?contact=${code}#contact`);

  // Champ piège invisible : seuls les robots le remplissent.
  if (String(formData.get("website") ?? "").trim() !== "") back("ok");

  const name = String(formData.get("name") ?? "").trim().slice(0, 100);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 160);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 30);
  const project = String(formData.get("project") ?? "");
  const message = String(formData.get("message") ?? "").trim().slice(0, 1500);
  const amountRaw = String(formData.get("amount") ?? "").replace(/\s/g, "").replace(",", ".");
  const amount = amountRaw ? Number(amountRaw) : null;
  const consent = formData.get("consent") === "on";

  if (
    name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    phone.replace(/\D/g, "").length < 8 ||
    !PROJECTS.includes(project) ||
    (amount !== null && (!Number.isFinite(amount) || amount < 0 || amount > 10_000_000)) ||
    !consent
  ) {
    back("invalid");
  }

  // Anti-doublon : une demande identique dans les 10 dernières minutes suffit.
  const recent = await prisma.contactRequest.findFirst({
    where: { email, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } },
  });
  if (!recent) {
    await prisma.contactRequest.create({
      data: { name, email, phone, project, amount, message: message || null, locale: await getLocale(), consentAt: new Date() },
    });
  }
  back("ok");
}
