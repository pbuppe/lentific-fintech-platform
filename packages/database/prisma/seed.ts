import bcrypt from "bcryptjs";
import { prisma } from "../src/client";

/**
 * Données de démo, couvre tout le cycle de vie d'une demande, pour qu'on
 * puisse tester chaque écran sans devoir d'abord rejouer tout le parcours à
 * la main : un dossier "en cours" (Camille, à traiter depuis le back-office)
 * et un dossier déjà "signé" avec une opportunité ouverte sur la marketplace
 * (Marc, déjà partiellement financé par Yanis).
 *
 * Identifiants de connexion (mot de passe identique pour tous les comptes de
 * démo) :
 *   camille.aubert@example.com / yanis@example.com : mot de passe Demo1234!
 *   agent@lentific.com (back-office)                : mot de passe Demo1234!
 */
const DEMO_PASSWORD = "Demo1234!";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const france = await prisma.country.upsert({
    where: { code: "FR" },
    create: { code: "FR", currencyId: "eur", defaultLocale: "fr-FR" },
    update: {},
  });

  const eur = await prisma.currency.upsert({
    where: { code: "EUR" },
    create: { code: "EUR" },
    update: {},
  });

  const product = await prisma.loanProduct.upsert({
    where: { code: "PME-STANDARD" },
    create: { code: "PME-STANDARD", countries: ["FR"], minAmount: 2000, maxAmount: 100000 },
    update: {},
  });

  // Ouverture aux particuliers (§ demande produit : "rendre ça plus accessible
  // à tout le monde"), mêmes écrans, mêmes règles, montants adaptés à un
  // besoin personnel plutôt qu'à un besoin professionnel.
  const particulierProduct = await prisma.loanProduct.upsert({
    where: { code: "PARTICULIER-STANDARD" },
    create: { code: "PARTICULIER-STANDARD", countries: ["FR"], minAmount: 500, maxAmount: 50000 },
    update: {},
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@lentific.com" },
    create: { email: "agent@lentific.com", name: "Agent Démo", countryId: france.id, role: "AGENT", passwordHash },
    update: { passwordHash },
  });

  // Compte à "plein pouvoir" (§ demande produit) : seul rôle qui voit
  // l'onglet "Comptes" du back-office (demande de documents, vue complète).
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@lentific.com" },
    create: { email: "superadmin@lentific.com", name: "Super Admin Démo", countryId: france.id, role: "SUPER_ADMIN", passwordHash },
    update: { passwordHash },
  });

  // --- Dossier 1 : en cours de traitement (Camille) --------------------------

  const camille = await prisma.user.upsert({
    where: { email: "camille.aubert@example.com" },
    update: { passwordHash, name: "Camille Aubert" },
    create: {
      email: "camille.aubert@example.com",
      name: "Camille Aubert",
      countryId: france.id,
      role: "BORROWER",
      passwordHash,
      borrowerProfile: {
        create: {
          address: { city: "Lyon", postalCode: "69000" },
          employment: { status: "self-employed" },
          income: 3200,
          expenses: 1400,
          existingDebt: 0,
        },
      },
    },
  });

  // Réinitialisé à chaque seed (statut ET score) pour garder un point de départ
  // de démo fiable, même après avoir manuellement fait avancer ce dossier
  // en testant le parcours dans le navigateur.
  const camilleApp = await prisma.application.upsert({
    where: { reference: "APP-2026-000184" },
    create: {
      reference: "APP-2026-000184",
      borrowerId: camille.id,
      productId: product.id,
      amount: 18500,
      durationMonths: 24,
      purpose: "Financement PME",
      countryId: france.id,
      currencyId: eur.id,
      status: "KYC_PENDING",
    },
    update: { status: "KYC_PENDING", score: null },
  });

  const existingCamilleDoc = await prisma.document.findFirst({ where: { ownerId: camille.id, type: "identity" } });
  const camilleIdentityDoc = existingCamilleDoc
    ? await prisma.document.update({ where: { id: existingCamilleDoc.id }, data: { status: "UPLOADED" } })
    : await prisma.document.create({
        data: {
          ownerId: camille.id,
          applicationId: camilleApp.id,
          type: "identity",
          storageKey: "local/demo-carte-identite-camille.pdf",
          status: "UPLOADED",
        },
      });

  // Supprime tout scan de contrat signé déposé lors d'un précédent test du
  // parcours, sinon le tableau de bord pense à tort qu'un contrat a déjà
  // été envoyé et cache le formulaire d'upload / le lien de téléchargement.
  await prisma.document.deleteMany({ where: { ownerId: camille.id, type: "signed_contract" } });

  // Nettoie toute offre/prêt créés lors d'un précédent test du parcours, pour
  // que le dossier de Camille reparte proprement de "identité en attente".
  const staleOffers = await prisma.offer.findMany({ where: { applicationId: camilleApp.id } });
  for (const offer of staleOffers) {
    const loan = await prisma.loan.findUnique({ where: { offerId: offer.id } });
    if (loan) {
      if (loan.contractId) {
        await prisma.signature.deleteMany({ where: { contractId: loan.contractId } });
        await prisma.contract.delete({ where: { id: loan.contractId } }).catch(() => {});
      }
      await prisma.repayment.deleteMany({ where: { loanId: loan.id } });
      const staleOpportunity = await prisma.fundingOpportunity.findUnique({ where: { loanId: loan.id } });
      if (staleOpportunity) {
        // Un investisseur a pu réellement investir dessus en testant le parcours,
        // on nettoie aussi ces investissements de test avant de supprimer l'opportunité.
        await prisma.investment.deleteMany({ where: { opportunityId: staleOpportunity.id } });
        await prisma.fundingOpportunity.delete({ where: { id: staleOpportunity.id } });
      }
      await prisma.loan.delete({ where: { id: loan.id } });
    }
    await prisma.offer.delete({ where: { id: offer.id } });
  }

  // Démontre le pouvoir du super administrateur : une demande de document
  // en attente, visible sur /documents côté emprunteur.
  const existingCamilleDocRequest = await prisma.documentRequest.findFirst({
    where: { targetUserId: camille.id, status: "PENDING" },
  });
  if (!existingCamilleDocRequest) {
    await prisma.documentRequest.create({
      data: {
        targetUserId: camille.id,
        requestedById: superAdmin.id,
        label: "Justificatif de domicile",
        instructions: "De moins de 3 mois, à ton nom.",
      },
    });
  }

  // --- Dossier 2 : déjà signé, ouvert au financement (Marc) -------------------

  const marc = await prisma.user.upsert({
    where: { email: "marc.nguyen@example.com" },
    update: { passwordHash, name: "Marc Nguyen" },
    create: {
      email: "marc.nguyen@example.com",
      name: "Marc Nguyen",
      countryId: france.id,
      role: "BORROWER",
      passwordHash,
      borrowerProfile: {
        create: {
          address: { city: "Paris", postalCode: "75011" },
          employment: { status: "employee" },
          income: 4200,
          expenses: 1800,
          existingDebt: 200,
        },
      },
    },
  });

  const marcApp = await prisma.application.upsert({
    where: { reference: "APP-2026-000102" },
    create: {
      reference: "APP-2026-000102",
      borrowerId: marc.id,
      productId: product.id,
      amount: 10000,
      durationMonths: 18,
      purpose: "Développement commercial",
      countryId: france.id,
      currencyId: eur.id,
      status: "CONTRACT_SIGNED",
      score: 71,
    },
    update: {},
  });

  await prisma.document.upsert({
    where: { id: `${marcApp.id}-identity` },
    create: {
      id: `${marcApp.id}-identity`,
      ownerId: marc.id,
      applicationId: marcApp.id,
      type: "identity",
      storageKey: "local/demo-carte-identite-marc.pdf",
      status: "VERIFIED",
    },
    update: {},
  }).catch(() => {}); // id imposé volontairement pour un upsert idempotent, ignoré si le schéma génère déjà l'id

  let marcOffer = await prisma.offer.findFirst({ where: { applicationId: marcApp.id } });
  if (!marcOffer) {
    marcOffer = await prisma.offer.create({
      data: { applicationId: marcApp.id, amount: 10000, durationMonths: 18, rate: 5.5, status: "ACCEPTED" },
    });
  }

  let marcLoan = await prisma.loan.findUnique({ where: { offerId: marcOffer.id } });
  if (!marcLoan) {
    marcLoan = await prisma.loan.create({ data: { offerId: marcOffer.id } });
  }

  let marcContract = marcLoan.contractId ? await prisma.contract.findUnique({ where: { id: marcLoan.contractId } }) : null;
  if (!marcContract) {
    marcContract = await prisma.contract.create({
      data: { loanId: marcLoan.id, templateVersion: "v1.0", storageKey: `contracts/${marcLoan.id}-v1.0.pdf` },
    });
    marcLoan = await prisma.loan.update({ where: { id: marcLoan.id }, data: { contractId: marcContract.id } });
  }

  const marcSignature = await prisma.signature.upsert({
    where: { contractId: marcContract.id },
    create: { contractId: marcContract.id, provider: "manual_upload", status: "SIGNED", signedAt: new Date() },
    update: { status: "SIGNED", signedAt: new Date() },
  });

  const opportunity = await prisma.fundingOpportunity.upsert({
    where: { loanId: marcLoan.id },
    create: { loanId: marcLoan.id, targetAmount: 10000, fundedAmount: 3000, riskLevel: "low" },
    update: {},
  });

  const yanis = await prisma.user.upsert({
    where: { email: "yanis@example.com" },
    update: { passwordHash, name: "Yanis Martin" },
    create: {
      email: "yanis@example.com",
      name: "Yanis Martin",
      countryId: france.id,
      role: "INVESTOR",
      passwordHash,
      investorProfile: { create: { riskTolerance: "moderate" } },
    },
  });

  const existingInvestment = await prisma.investment.findFirst({
    where: { investorId: yanis.id, opportunityId: opportunity.id },
  });
  if (!existingInvestment) {
    await prisma.investment.create({
      data: { investorId: yanis.id, opportunityId: opportunity.id, amount: 3000 },
    });
  }

  // Échéancier du prêt de Marc (10 000 € / 18 mois / 5,5%) — deux mensualités
  // déjà encaissées (historique de rendement pour Yanis, seul investisseur de
  // cette opportunité) et une en retard, volontairement laissée SCHEDULED
  // pour démontrer /echeances côté back-office et la relance automatique.
  const marcMonthly = 580;
  const existingMarcRepayments = await prisma.repayment.findFirst({ where: { loanId: marcLoan.id } });
  if (!existingMarcRepayments) {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    await prisma.repayment.create({
      data: { loanId: marcLoan.id, dueDate: twoMonthsAgo, amount: marcMonthly, status: "PAID", paidAt: twoMonthsAgo },
    });
    await prisma.repayment.create({
      data: { loanId: marcLoan.id, dueDate: oneMonthAgo, amount: marcMonthly, status: "PAID", paidAt: oneMonthAgo },
    });
    await prisma.repayment.create({
      data: { loanId: marcLoan.id, dueDate: fiveDaysAgo, amount: marcMonthly, status: "SCHEDULED" },
    });
  }

  // Le portefeuille est recalculé à partir des vrais investissements de Yanis
  // plutôt qu'incrémenté à l'aveugle, reste cohérent même après un test dans
  // le navigateur qui aurait ajouté/supprimé des investissements entre-temps.
  // totalReceived reflète les deux mensualités déjà encaissées ci-dessus :
  // Yanis est seul investisseur de cette opportunité, sa part est de 100%.
  const yanisInvestments = await prisma.investment.findMany({ where: { investorId: yanis.id } });
  const yanisTotal = yanisInvestments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  await prisma.portfolio.upsert({
    where: { investorId: yanis.id },
    create: { investorId: yanis.id, totalInvested: yanisTotal, totalReceived: marcMonthly * 2 },
    update: { totalInvested: yanisTotal, totalReceived: marcMonthly * 2 },
  });

  // Yanis est abonné Premium (§ demande produit) : démontre les mises en
  // relation illimitées, les alertes automatiques et le tableau de bord de
  // performance avancé dès la connexion, sans étape manuelle supplémentaire.
  const yanisPeriodEnd = new Date();
  yanisPeriodEnd.setDate(yanisPeriodEnd.getDate() + 20);
  await prisma.subscription.upsert({
    where: { userId: yanis.id },
    create: { userId: yanis.id, tier: "INVESTOR_PREMIUM", amount: 15, currentPeriodEnd: yanisPeriodEnd },
    update: { status: "ACTIVE", cancelledAt: null, currentPeriodEnd: yanisPeriodEnd },
  });

  // --- Dossier 3 : offre publiée, en attente d'acceptation (Sophie) ----------

  const sophie = await prisma.user.upsert({
    where: { email: "sophie.bernard@example.com" },
    update: { passwordHash, name: "Sophie Bernard" },
    create: {
      email: "sophie.bernard@example.com",
      name: "Sophie Bernard",
      countryId: france.id,
      role: "BORROWER",
      passwordHash,
      borrowerProfile: {
        create: {
          address: { city: "Nantes", postalCode: "44000" },
          employment: { status: "business-owner" },
          income: 3800,
          expenses: 1600,
          existingDebt: 150,
        },
      },
    },
  });

  const sophieApp = await prisma.application.upsert({
    where: { reference: "APP-2026-000211" },
    create: {
      reference: "APP-2026-000211",
      borrowerId: sophie.id,
      productId: product.id,
      amount: 12000,
      durationMonths: 18,
      purpose: "Achat de matériel",
      countryId: france.id,
      currencyId: eur.id,
      status: "PUBLISHED",
      score: 62,
    },
    update: { status: "PUBLISHED", score: 62 },
  });

  await prisma.document.upsert({
    where: { id: `${sophieApp.id}-identity` },
    create: {
      id: `${sophieApp.id}-identity`,
      ownerId: sophie.id,
      applicationId: sophieApp.id,
      type: "identity",
      storageKey: "local/demo-carte-identite-sophie.pdf",
      status: "VERIFIED",
    },
    update: {},
  }).catch(() => {});

  const sophieOffer = await prisma.offer.findFirst({ where: { applicationId: sophieApp.id, status: "PENDING" } });
  if (!sophieOffer) {
    await prisma.offer.create({
      data: { applicationId: sophieApp.id, amount: 12000, durationMonths: 18, rate: 6.2, status: "PENDING" },
    });
  }

  // --- Dossier 4 : en revue, en attente d'une offre (Julien) -----------------

  const julien = await prisma.user.upsert({
    where: { email: "julien.moreau@example.com" },
    update: { passwordHash, name: "Julien Moreau" },
    create: {
      email: "julien.moreau@example.com",
      name: "Julien Moreau",
      countryId: france.id,
      role: "BORROWER",
      passwordHash,
      borrowerProfile: {
        create: {
          address: { city: "Toulouse", postalCode: "31000" },
          employment: { status: "self-employed" },
          income: 2900,
          expenses: 2100,
          existingDebt: 400,
        },
      },
    },
  });

  // SLA volontairement dépassé (échéance il y a 2h, slaBreachedAt encore
  // vide) : démontre la relance automatique du planificateur dès qu'il tourne
  // (instrumentation-node.ts), sans attendre 48h réelles pour le constater.
  const julienSlaDeadline = new Date();
  julienSlaDeadline.setHours(julienSlaDeadline.getHours() - 2);
  const julienApp = await prisma.application.upsert({
    where: { reference: "APP-2026-000234" },
    create: {
      reference: "APP-2026-000234",
      borrowerId: julien.id,
      productId: product.id,
      amount: 25000,
      durationMonths: 36,
      purpose: "Développement commercial",
      countryId: france.id,
      currencyId: eur.id,
      status: "UNDER_REVIEW",
      score: 45,
      priority: true,
      priorityRequestedAt: julienSlaDeadline,
      slaDeadline: julienSlaDeadline,
    },
    update: { status: "UNDER_REVIEW", score: 45, priority: true, slaDeadline: julienSlaDeadline, slaBreachedAt: null },
  });

  await prisma.document.upsert({
    where: { id: `${julienApp.id}-identity` },
    create: {
      id: `${julienApp.id}-identity`,
      ownerId: julien.id,
      applicationId: julienApp.id,
      type: "identity",
      storageKey: "local/demo-carte-identite-julien.pdf",
      status: "VERIFIED",
    },
    update: {},
  }).catch(() => {});

  // --- Dossier 5 : déjà signé, ouvert au financement, risque élevé (Amina) ---

  const amina = await prisma.user.upsert({
    where: { email: "amina.diallo@example.com" },
    update: { passwordHash, name: "Amina Diallo" },
    create: {
      email: "amina.diallo@example.com",
      name: "Amina Diallo",
      countryId: france.id,
      role: "BORROWER",
      passwordHash,
      borrowerProfile: {
        create: {
          address: { city: "Marseille", postalCode: "13001" },
          employment: { status: "self-employed" },
          income: 2400,
          expenses: 1900,
          existingDebt: 300,
        },
      },
    },
  });

  const aminaApp = await prisma.application.upsert({
    where: { reference: "APP-2026-000257" },
    create: {
      reference: "APP-2026-000257",
      borrowerId: amina.id,
      productId: product.id,
      amount: 8000,
      durationMonths: 12,
      purpose: "Trésorerie",
      countryId: france.id,
      currencyId: eur.id,
      status: "CONTRACT_SIGNED",
      score: 38,
    },
    update: {},
  });

  await prisma.document.upsert({
    where: { id: `${aminaApp.id}-identity` },
    create: {
      id: `${aminaApp.id}-identity`,
      ownerId: amina.id,
      applicationId: aminaApp.id,
      type: "identity",
      storageKey: "local/demo-carte-identite-amina.pdf",
      status: "VERIFIED",
    },
    update: {},
  }).catch(() => {});

  let aminaOffer = await prisma.offer.findFirst({ where: { applicationId: aminaApp.id } });
  if (!aminaOffer) {
    aminaOffer = await prisma.offer.create({
      data: { applicationId: aminaApp.id, amount: 8000, durationMonths: 12, rate: 8.9, status: "ACCEPTED" },
    });
  }

  let aminaLoan = await prisma.loan.findUnique({ where: { offerId: aminaOffer.id } });
  if (!aminaLoan) {
    aminaLoan = await prisma.loan.create({ data: { offerId: aminaOffer.id } });
  }

  let aminaContract = aminaLoan.contractId ? await prisma.contract.findUnique({ where: { id: aminaLoan.contractId } }) : null;
  if (!aminaContract) {
    aminaContract = await prisma.contract.create({
      data: { loanId: aminaLoan.id, templateVersion: "v1.0", storageKey: `contracts/${aminaLoan.id}-v1.0.pdf` },
    });
    aminaLoan = await prisma.loan.update({ where: { id: aminaLoan.id }, data: { contractId: aminaContract.id } });
  }

  await prisma.signature.upsert({
    where: { contractId: aminaContract.id },
    create: { contractId: aminaContract.id, provider: "manual_upload", status: "SIGNED", signedAt: new Date() },
    update: { status: "SIGNED", signedAt: new Date() },
  });

  const aminaOpportunity = await prisma.fundingOpportunity.upsert({
    where: { loanId: aminaLoan.id },
    create: { loanId: aminaLoan.id, targetAmount: 8000, fundedAmount: 0, riskLevel: "high" },
    update: {},
  });

  // --- Dossier 6 : particulier, besoin personnel (Léa) ------------------------

  const lea = await prisma.user.upsert({
    where: { email: "lea.fontaine@example.com" },
    update: { passwordHash, name: "Léa Fontaine" },
    create: {
      email: "lea.fontaine@example.com",
      name: "Léa Fontaine",
      phone: "+33 6 45 12 78 90",
      countryId: france.id,
      role: "BORROWER",
      passwordHash,
      borrowerProfile: {
        create: {
          address: { city: "Rennes", postalCode: "35000" },
          employment: { status: "employee" },
          income: 2600,
          expenses: 1300,
          existingDebt: 0,
        },
      },
    },
  });

  const leaApp = await prisma.application.upsert({
    where: { reference: "APP-2026-000301" },
    create: {
      reference: "APP-2026-000301",
      borrowerId: lea.id,
      productId: particulierProduct.id,
      amount: 6000,
      durationMonths: 24,
      purpose: "Rénovation appartement",
      countryId: france.id,
      currencyId: eur.id,
      status: "PUBLISHED",
      score: 68,
    },
    update: { status: "PUBLISHED", score: 68 },
  });

  await prisma.document.upsert({
    where: { id: `${leaApp.id}-identity` },
    create: {
      id: `${leaApp.id}-identity`,
      ownerId: lea.id,
      applicationId: leaApp.id,
      type: "identity",
      storageKey: "local/demo-carte-identite-lea.pdf",
      status: "VERIFIED",
    },
    update: {},
  }).catch(() => {});

  const leaOffer = await prisma.offer.findFirst({ where: { applicationId: leaApp.id, status: "PENDING" } });
  if (!leaOffer) {
    await prisma.offer.create({
      data: { applicationId: leaApp.id, amount: 6000, durationMonths: 24, rate: 4.8, status: "PENDING" },
    });
  }

  // --- Investisseurs supplémentaires : offres de capital publiées ------------

  const nadia = await prisma.user.upsert({
    where: { email: "nadia.chen@example.com" },
    update: { passwordHash, name: "Nadia Chen" },
    create: {
      email: "nadia.chen@example.com",
      name: "Nadia Chen",
      countryId: france.id,
      role: "INVESTOR",
      passwordHash,
      investorProfile: { create: { riskTolerance: "low" } },
    },
  });

  // Vérification manuelle déjà passée pour Nadia, démontre concrètement le
  // badge "Investisseur vérifié" côté marketplace/emprunteur.
  await prisma.investorProfile.update({
    where: { userId: nadia.id },
    data: { verificationStatus: "VERIFIED", verifiedAt: new Date() },
  });

  const existingNadiaListing = await prisma.investorListing.findFirst({ where: { investorId: nadia.id, status: "OPEN" } });
  if (!existingNadiaListing) {
    await prisma.investorListing.create({
      data: {
        investorId: nadia.id,
        amountAvailable: 100000,
        preferredRate: 5.5,
        preferredDurationMonths: 36,
        riskAppetite: "low",
      },
    });
  }

  const thomas = await prisma.user.upsert({
    where: { email: "thomas.lefevre@example.com" },
    update: { passwordHash, name: "Thomas Lefèvre" },
    create: {
      email: "thomas.lefevre@example.com",
      name: "Thomas Lefèvre",
      countryId: france.id,
      role: "INVESTOR",
      passwordHash,
      investorProfile: { create: { riskTolerance: "high" } },
    },
  });

  const existingThomasListing = await prisma.investorListing.findFirst({ where: { investorId: thomas.id, status: "OPEN" } });
  if (!existingThomasListing) {
    await prisma.investorListing.create({
      data: {
        investorId: thomas.id,
        amountAvailable: 15000,
        preferredRate: 6.2,
        preferredDurationMonths: 12,
        riskAppetite: "high",
      },
    });
  }

  const existingThomasInvestment = await prisma.investment.findFirst({
    where: { investorId: thomas.id, opportunityId: aminaOpportunity.id },
  });
  if (!existingThomasInvestment) {
    await prisma.investment.create({
      data: { investorId: thomas.id, opportunityId: aminaOpportunity.id, amount: 1500 },
    });
    await prisma.fundingOpportunity.update({
      where: { id: aminaOpportunity.id },
      data: { fundedAmount: { increment: 1500 } },
    });
  }

  // Thomas a déposé ses justificatifs et attend un agent, démontre la file
  // d'attente de vérification côté back-office (apps/admin/investisseurs).
  await prisma.investorProfile.upsert({
    where: { userId: thomas.id },
    create: { userId: thomas.id, riskTolerance: "high", verificationStatus: "PENDING_REVIEW" },
    update: { verificationStatus: "PENDING_REVIEW" },
  });
  const existingThomasIncomeDoc = await prisma.document.findFirst({ where: { ownerId: thomas.id, type: "proof_of_income" } });
  if (!existingThomasIncomeDoc) {
    await prisma.document.create({
      data: { ownerId: thomas.id, type: "proof_of_income", storageKey: "local/demo-avis-imposition-thomas.pdf", status: "UPLOADED" },
    });
  }
  const existingThomasFundsDoc = await prisma.document.findFirst({ where: { ownerId: thomas.id, type: "proof_of_funds" } });
  if (!existingThomasFundsDoc) {
    await prisma.document.create({
      data: { ownerId: thomas.id, type: "proof_of_funds", storageKey: "local/demo-releve-bancaire-thomas.pdf", status: "UPLOADED" },
    });
  }

  const thomasInvestments = await prisma.investment.findMany({ where: { investorId: thomas.id } });
  const thomasTotal = thomasInvestments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  await prisma.portfolio.upsert({
    where: { investorId: thomas.id },
    create: { investorId: thomas.id, totalInvested: thomasTotal },
    update: { totalInvested: thomasTotal },
  });

  // Prêteur particulier (par opposition à Nadia/Thomas, présentés côté
  // entreprise/structure dans la démo), démontre que le prêt entre
  // particuliers est un cas de premier ordre, pas une exception.
  const karim = await prisma.user.upsert({
    where: { email: "karim.haddad@example.com" },
    update: { passwordHash, name: "Karim Haddad" },
    create: {
      email: "karim.haddad@example.com",
      name: "Karim Haddad",
      phone: "+33 6 78 90 12 34",
      countryId: france.id,
      role: "INVESTOR",
      passwordHash,
      investorProfile: { create: { riskTolerance: "moderate" } },
    },
  });

  const existingKarimListing = await prisma.investorListing.findFirst({ where: { investorId: karim.id, status: "OPEN" } });
  if (!existingKarimListing) {
    await prisma.investorListing.create({
      data: {
        investorId: karim.id,
        amountAvailable: 5000,
        preferredRate: 4.8,
        preferredDurationMonths: 12,
        riskAppetite: "moderate",
      },
    });
  }

  console.log("Seed terminé :", {
    identifiants_demo: `email ci-dessous / mot de passe ${DEMO_PASSWORD}`,
    agent: agent.email,
    super_admin: superAdmin.email,
    emprunteurs: {
      camille: { email: camille.email, application: camilleApp.reference, status: camilleApp.status, identityDoc: camilleIdentityDoc.status },
      sophie: { email: sophie.email, application: sophieApp.reference, status: sophieApp.status },
      julien: { email: julien.email, application: julienApp.reference, status: julienApp.status, priority: "SLA dépassé (démo relance automatique)" },
      marc: { email: marc.email, application: marcApp.reference, status: marcApp.status },
      amina: { email: amina.email, application: aminaApp.reference, status: aminaApp.status },
      lea_particulier: { email: lea.email, application: leaApp.reference, status: leaApp.status, produit: "PARTICULIER-STANDARD" },
    },
    investisseurs: {
      yanis: { email: yanis.email, investedInOpportunity: opportunity.id, subscription: "INVESTOR_PREMIUM (active)" },
      thomas: { email: thomas.email, investedInOpportunity: aminaOpportunity.id, listingPublished: "15 000 € / 6.2% / 12 mois", verification: "PENDING_REVIEW" },
      nadia: { email: nadia.email, listingPublished: "100 000 € / 5.5% / 36 mois", verification: "VERIFIED" },
      karim_particulier: { email: karim.email, listingPublished: "5 000 € / 4.8% / 12 mois", verification: "UNVERIFIED" },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
