/**
 * Rendu du contrat de prêt en PDF réel (§24). Structure établie par référence
 * aux articles L.548-1 et suivants et R.548-1 et suivants (notamment R.548-6,
 * qui liste les mentions obligatoires du contrat type) du Code monétaire et
 * financier français, à partir d'un contrat réel de financement participatif
 * consulté en ligne pour calibrer le formalisme attendu.
 *
 * Ce texte reste un GABARIT : les mentions marquées « à confirmer » exigent
 * soit une donnée d'immatriculation réelle de la société (SIREN, ORIAS...),
 * soit un arbitrage d'un conseil juridique (droit de rétractation, barème de
 * frais, indemnité de remboursement anticipé) avant tout usage réel, voir
 * cahier des charges §62 (revue réglementaire) et le README du dépôt.
 */
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { buildSchedule } from "@fintech/loans";

export interface ContractData {
  reference: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerCity?: string;
  amount: number;
  durationMonths: number;
  rate: number;
  riskScore?: number | null;
  generatedAt: Date;
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const INK = rgb(0.1, 0.1, 0.1);
const MUTED = rgb(0.35, 0.35, 0.35);
const ACCENT = rgb(0.48, 0.09, 0.13);
const LINE = rgb(0.85, 0.85, 0.85);

const NBSP = String.fromCharCode(0x00a0);
const NARROW_NBSP = String.fromCharCode(0x202f);

function money(n: number) {
  const formatted = n
    .toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split(NBSP)
    .join(" ")
    .split(NARROW_NBSP)
    .join(" ");
  return `${formatted} EUR`;
}

/** Petit gestionnaire de mise en page, pdf-lib ne fait pas de flux de texte automatique. */
class Flow {
  pdf: PDFDocument;
  font: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  page: PDFPage;
  y: number;
  pageNum = 1;

  constructor(pdf: PDFDocument, font: PDFFont, bold: PDFFont, italic: PDFFont) {
    this.pdf = pdf;
    this.font = font;
    this.bold = bold;
    this.italic = italic;
    this.page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  private ensureSpace(h: number) {
    if (this.y - h < MARGIN + 20) {
      this.page = this.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.pageNum += 1;
      this.y = PAGE_HEIGHT - MARGIN;
    }
  }

  private wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  para(text: string, opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb>; gap?: number } = {}) {
    const size = opts.size ?? 9.6;
    const font = opts.f ?? this.font;
    const lineHeight = size + 4.5;
    const lines = this.wrap(text, font, size, CONTENT_WIDTH);
    this.ensureSpace(lines.length * lineHeight + (opts.gap ?? 8));
    for (const line of lines) {
      this.page.drawText(line, { x: MARGIN, y: this.y, size, font, color: opts.color ?? INK });
      this.y -= lineHeight;
    }
    this.y -= opts.gap ?? 8;
  }

  heading(text: string, num?: number) {
    this.ensureSpace(30);
    this.y -= 6;
    this.page.drawLine({ start: { x: MARGIN, y: this.y + 2 }, end: { x: PAGE_WIDTH - MARGIN, y: this.y + 2 }, thickness: 0.5, color: LINE });
    this.y -= 12;
    const label = num ? `ARTICLE ${num} - ${text}` : text;
    this.page.drawText(label, { x: MARGIN, y: this.y, size: 10.5, font: this.bold, color: INK });
    this.y -= 16;
  }

  subheading(text: string) {
    this.ensureSpace(18);
    this.page.drawText(text, { x: MARGIN, y: this.y, size: 9.6, font: this.bold, color: INK });
    this.y -= 15;
  }

  numberedList(items: string[]) {
    for (let i = 0; i < items.length; i++) {
      const marker = `${i + 1}. `;
      const size = 9.6;
      const lineHeight = size + 4.5;
      const maxWidth = CONTENT_WIDTH - 16;
      const lines = this.wrap(items[i], this.font, size, maxWidth);
      this.ensureSpace(lines.length * lineHeight + 3);
      lines.forEach((line, idx) => {
        const prefix = idx === 0 ? marker : "";
        this.page.drawText(prefix + line, { x: MARGIN + (idx === 0 ? 0 : 14), y: this.y, size, font: this.font, color: INK });
        this.y -= lineHeight;
      });
      this.y -= 3;
    }
    this.y -= 6;
  }

  calloutToConfirm(text: string) {
    const size = 8.4;
    const maxWidth = CONTENT_WIDTH - 20;
    const lines = this.wrap(`À CONFIRMER PAR LE CONSEIL JURIDIQUE : ${text}`, this.italic, size, maxWidth);
    const boxHeight = lines.length * (size + 4) + 10;
    this.ensureSpace(boxHeight + 8);
    this.page.drawRectangle({ x: MARGIN - 8, y: this.y - boxHeight + 8, width: CONTENT_WIDTH + 16, height: boxHeight, color: rgb(0.99, 0.96, 0.87), borderColor: rgb(0.7, 0.55, 0.1), borderWidth: 0.6 });
    let ly = this.y;
    for (const line of lines) {
      this.page.drawText(line, { x: MARGIN, y: ly, size, font: this.italic, color: rgb(0.45, 0.33, 0.02) });
      ly -= size + 4;
    }
    this.y -= boxHeight + 10;
  }

  termsTable(rows: [string, string][]) {
    const size = 9.4;
    for (const [label, value] of rows) {
      this.ensureSpace(size + 8);
      this.page.drawText(label, { x: MARGIN, y: this.y, size, font: this.font, color: MUTED });
      this.page.drawText(value, { x: MARGIN + 230, y: this.y, size, font: this.bold, color: INK });
      this.page.drawLine({ start: { x: MARGIN, y: this.y - 4 }, end: { x: PAGE_WIDTH - MARGIN, y: this.y - 4 }, thickness: 0.4, color: LINE });
      this.y -= size + 10;
    }
    this.y -= 6;
  }

  newAnnexPage(title: string) {
    this.page = this.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.pageNum += 1;
    this.y = PAGE_HEIGHT - MARGIN;
    this.page.drawText(title, { x: MARGIN, y: this.y, size: 13, font: this.bold, color: INK });
    this.y -= 26;
  }
}

export async function renderContractPdf(data: ContractData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Contrat de prêt - ${data.reference}`);
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const f = new Flow(pdf, font, bold, italic);

  const schedule = buildSchedule(data.amount, data.durationMonths, data.rate, data.generatedAt);
  const monthly = schedule[0]?.amount ?? 0;
  const totalCost = monthly * data.durationMonths;
  const totalInterest = totalCost - data.amount;

  // --- Bandeau modèle -------------------------------------------------------
  f.page.drawRectangle({ x: MARGIN - 10, y: f.y - 28, width: CONTENT_WIDTH + 20, height: 30, color: rgb(0.97, 0.92, 0.92), borderColor: ACCENT, borderWidth: 0.8 });
  f.page.drawText("MODÈLE : document généré automatiquement, à faire valider par un juriste avant usage réel", { x: MARGIN, y: f.y - 12, size: 8, font: bold, color: ACCENT });
  f.page.drawText(`Référence du dossier : ${data.reference}, généré le ${data.generatedAt.toLocaleDateString("fr-FR")}`, { x: MARGIN, y: f.y - 23, size: 7.5, font, color: ACCENT });
  f.y -= 46;

  f.page.drawText("CONTRAT DE PRÊT DE FINANCEMENT PARTICIPATIF", { x: MARGIN, y: f.y, size: 14, font: bold, color: INK });
  f.y -= 16;
  f.page.drawText("Établi en application des articles L.548-1 et s. et R.548-1 et s. du Code monétaire et financier", { x: MARGIN, y: f.y, size: 8.5, font: italic, color: MUTED });
  f.y -= 24;

  f.subheading("L'INTERMÉDIAIRE EN FINANCEMENT PARTICIPATIF");
  f.para("La société Lentific, [forme sociale à compléter] au capital de [montant] euros, [adresse du siège social à compléter], immatriculée au RCS de [ville] sous le numéro [SIREN à confirmer], immatriculée auprès de l'ORIAS en qualité d'intermédiaire en financement participatif sous le numéro [numéro ORIAS à confirmer], ci-après « l'Intermédiaire » ou « Lentific », agissant en qualité de mandataire des Prêteurs, sans être elle-même partie prêteuse.");

  f.subheading("L'EMPRUNTEUR");
  f.para(`${data.borrowerName} (${data.borrowerEmail})${data.borrowerCity ? `, domicilié(e) à ${data.borrowerCity}` : ""}, agissant à titre professionnel, ci-après « l'Emprunteur ».`);

  f.subheading("LE OU LES PRÊTEURS");
  f.para("Les personnes physiques ou morales dont l'identité, les coordonnées et la quote-part individuellement prêtée figurent en Annexe 3 (Bulletins de souscription), chaque Prêteur agissant individuellement et sans solidarité entre eux, ci-après collectivement les « Prêteurs ».");

  f.heading("PRÉAMBULE");
  f.para(`L'Emprunteur a soumis sur la plateforme Lentific une demande de financement d'un montant de ${money(data.amount)} destinée à un usage professionnel. Ce dossier a fait l'objet d'une vérification d'identité, d'une analyse de la capacité de remboursement par le moteur de risque de la Plateforme${data.riskScore != null ? ` (score obtenu : ${data.riskScore}/100)` : ""}, puis d'une revue par un gestionnaire habilité, à l'issue de laquelle une offre a été établie et acceptée par l'Emprunteur.`);
  f.para("Le présent contrat formalise les conditions de ce financement, assuré par un ou plusieurs Prêteurs sur la marketplace P2P de la Plateforme, dans les conditions de financement fractionné décrites à l'Article 5.");

  f.heading("DÉFINITIONS", 1);
  f.numberedList([
    "« Plateforme » désigne le site et l'application exploités par Lentific.",
    "« Financement participatif par prêt » (crowdlending) désigne l'opération par laquelle un ou plusieurs Prêteurs consentent un prêt rémunéré à l'Emprunteur, conformément aux articles L.548-1 et suivants du Code monétaire et financier.",
    "« TAEG » désigne le taux annuel effectif global.",
    "« Échéancier » désigne le tableau d'amortissement figurant en Annexe 1.",
  ]);

  f.heading("DÉCLARATIONS ET GARANTIES DES PARTIES", 2);
  f.subheading("2.1 Déclarations communes");
  f.para("Chaque Partie déclare avoir la pleine capacité juridique de contracter et ne pas être en état de cessation des paiements à la date de signature.");
  f.subheading("2.2 Déclarations de l'Emprunteur");
  f.para("L'Emprunteur déclare que les informations transmises dans le cadre de sa demande sont exactes, sincères et à jour, et qu'aucun événement susceptible d'affecter sa capacité de remboursement n'est survenu sans en avoir informé la Plateforme.");
  f.subheading("2.3 Déclarations des Prêteurs");
  f.para("Chaque Prêteur déclare avoir pris connaissance de la fiche d'information synthétique (Annexe 2) et reconnaît avoir été informé et mis en garde sur les risques décrits à l'Article 10.");

  f.heading("OBJET DU CONTRAT", 3);
  f.para("Le présent contrat fixe les conditions selon lesquelles les Prêteurs consentent à l'Emprunteur, par l'intermédiaire de la Plateforme, un prêt d'argent rémunéré, ainsi que les modalités de son remboursement.");

  f.heading("CARACTÉRISTIQUES FINANCIÈRES DU PRÊT", 4);
  f.termsTable([
    ["Montant total du crédit", money(data.amount)],
    ["Durée", `${data.durationMonths} mois`],
    ["Taux débiteur fixe applicable (annuel)", `${data.rate} %`],
    ["Mensualité (hors assurance)", money(monthly)],
    ["Montant total des intérêts", money(totalInterest)],
    ["Coût total du crédit", money(totalCost)],
    ["TAEG", "à calculer par l'Intermédiaire avant diffusion"],
  ]);

  f.heading("MISE À DISPOSITION DES FONDS ET FINANCEMENT FRACTIONNÉ", 5);
  f.para("Les fonds sont collectés sur la marketplace P2P jusqu'à atteinte du montant total : chaque Prêteur finance une quote-part, sans qu'aucun Prêteur ne soit tenu au-delà de sa quote-part ni solidaire des autres Prêteurs. Une fois le montant collecté, les fonds sont versés à l'Emprunteur par virement, déduction faite le cas échéant des frais visés à l'Article 8.");
  f.para("Si le montant total n'est pas collecté dans le délai affiché sur la Plateforme, le financement est réputé non abouti et les sommes déjà versées sont restituées aux Prêteurs.");

  f.heading("AMORTISSEMENT ET ÉCHÉANCIER", 6);
  f.para("Le prêt est remboursable selon un amortissement constant, conformément au tableau figurant en Annexe 1. Les remboursements sont redistribués par l'Intermédiaire à chaque Prêteur au prorata de sa quote-part.");

  f.heading("REMBOURSEMENT ANTICIPÉ", 7);
  f.para("L'Emprunteur peut à tout moment rembourser par anticipation, en totalité ou en partie, les sommes restant dues.");
  f.calloutToConfirm("une indemnité de remboursement anticipé est-elle applicable, et selon quel plafond réglementaire ?");

  f.heading("FRAIS DE L'INTERMÉDIAIRE", 8);
  f.para("L'Intermédiaire perçoit des frais dont le principe et le barème sont ceux définis par le moteur de frais (Fee Engine) applicable au produit concerné à la date de conclusion du présent contrat.");
  f.calloutToConfirm("barème précis à joindre en annexe avant diffusion.");

  f.heading("DÉFAUT DE PAIEMENT ET INTÉRÊTS DE RETARD", 9);
  f.para("À défaut de paiement à son échéance, et sans mise en demeure préalable nécessaire, les sommes impayées porteront de plein droit intérêt au taux légal en vigueur majoré, à compter de la date d'exigibilité jusqu'à complet paiement, sans préjudice de l'article 1231-6 du Code civil.");

  f.heading("AVERTISSEMENT SUR LES RISQUES", 10);
  f.para("Chaque Prêteur est averti et mis en garde, conformément à l'article L.548-6 du Code monétaire et financier, sur le mode de fonctionnement du financement participatif, et notamment :", { gap: 4 });
  f.numberedList([
    "le risque de perte totale ou partielle du capital prêté en cas de défaillance de l'Emprunteur ;",
    "l'absence de garantie de remboursement par l'Intermédiaire, qui n'est ni prêteur, ni garant, ni assureur ;",
    "le risque d'illiquidité des sommes prêtées avant l'échéance convenue ;",
    "la nécessité de diversifier ses investissements.",
  ]);

  f.heading("EXIGIBILITÉ ANTICIPÉE", 11);
  f.para("L'Intermédiaire, au nom et pour le compte des Prêteurs, pourra se prévaloir de l'exigibilité immédiate du prêt, sans préavis ni formalité judiciaire préalable, notamment en cas de non-paiement non régularisé sous 15 jours suivant mise en demeure, de procédure collective visant l'Emprunteur, d'inexactitude d'une déclaration ou de manœuvre frauduleuse.");

  f.heading("GESTION DE LA DÉFAILLANCE DE L'EMPRUNTEUR", 12);
  f.para("En cas d'impayé, l'Intermédiaire notifie les Prêteurs et adresse à l'Emprunteur une relance puis, à défaut de régularisation sous 15 jours, une mise en demeure. À défaut de paiement, l'Intermédiaire pourra engager tout recouvrement amiable ou judiciaire pour le compte des Prêteurs qui l'y autorisent.");

  f.heading("DROIT DE RÉTRACTATION", 13);
  f.calloutToConfirm("l'existence et la durée d'un droit de rétractation dépendent du statut réglementaire précis de l'Intermédiaire (IFP national ou PSFP au sens du règlement ECSP 2020/1503) et de la qualification du Prêteur. L'article R.548-6 impose de mentionner ce droit et ses modalités.");

  f.heading("RÔLE ET RESPONSABILITÉ DE L'INTERMÉDIAIRE", 14);
  f.para("L'Intermédiaire agit en qualité de mandataire des Prêteurs. Il n'est en aucun cas partie prêteuse, ne garantit ni le capital ni les intérêts, et sa responsabilité ne saurait être engagée du seul fait de la défaillance de l'Emprunteur, sous réserve de ses obligations de bonne conduite au titre des articles L.548-1 et suivants.");

  f.heading("DONNÉES À CARACTÈRE PERSONNEL", 15);
  f.para("Les données personnelles des Parties sont traitées par l'Intermédiaire, responsable de traitement, conformément au RGPD et à la loi n° 78-17 du 6 janvier 1978 modifiée, aux seules fins d'exécution du contrat et du respect des obligations légales applicables.");

  f.heading("DROIT APPLICABLE ET JURIDICTION COMPÉTENTE", 16);
  f.para("Le présent contrat est soumis au droit français. Tout litige relatif à sa validité, son interprétation ou son exécution sera soumis à la compétence exclusive des tribunaux français territorialement compétents, sous réserve des règles d'ordre public applicables.");

  // --- Signatures -------------------------------------------------------------
  f.y -= 10;
  f.page.drawLine({ start: { x: MARGIN, y: f.y }, end: { x: MARGIN + 190, y: f.y }, thickness: 0.7, color: MUTED });
  f.page.drawLine({ start: { x: PAGE_WIDTH - MARGIN - 190, y: f.y }, end: { x: PAGE_WIDTH - MARGIN, y: f.y }, thickness: 0.7, color: MUTED });
  f.y -= 13;
  f.page.drawText("L'Emprunteur", { x: MARGIN, y: f.y, size: 9, font: bold, color: INK });
  f.page.drawText("Pour l'Intermédiaire, Lentific", { x: PAGE_WIDTH - MARGIN - 190, y: f.y, size: 9, font: bold, color: INK });
  f.y -= 12;
  f.page.drawText(data.borrowerName, { x: MARGIN, y: f.y, size: 8.5, font, color: MUTED });
  f.page.drawText("(signature électronique)", { x: PAGE_WIDTH - MARGIN - 190, y: f.y, size: 8.5, font, color: MUTED });

  // --- Annexe 1 : échéancier -------------------------------------------------------------
  f.newAnnexPage("ANNEXE 1 - ÉCHÉANCIER DE REMBOURSEMENT");
  f.page.drawText(`Prêt de ${money(data.amount)} · ${data.durationMonths} mensualités · taux fixe ${data.rate} % · mensualité ${money(monthly)}`, { x: MARGIN, y: f.y, size: 8.5, font, color: MUTED });
  f.y -= 20;

  const colX = [MARGIN, MARGIN + 45, MARGIN + 155, MARGIN + 260, MARGIN + 355, MARGIN + 440];
  const headers = ["Éch.", "Date", "Capital", "Intérêts", "Mensualité", "Restant dû"];
  f.page.drawRectangle({ x: MARGIN - 4, y: f.y - 4, width: CONTENT_WIDTH + 8, height: 16, color: INK });
  headers.forEach((h, i) => f.page.drawText(h, { x: colX[i], y: f.y, size: 7.5, font: bold, color: rgb(1, 1, 1) }));
  f.y -= 16;

  const monthlyRate = data.rate / 12 / 100;
  let balance = data.amount;
  schedule.forEach((row, i) => {
    if (f.y < MARGIN + 20) {
      f.page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      f.y = PAGE_HEIGHT - MARGIN;
    }
    const interest = balance * monthlyRate;
    const principal = row.amount - interest;
    balance = Math.max(0, balance - principal);
    const dateStr = row.dueDate.toLocaleDateString("fr-FR");
    const values = [String(i + 1), dateStr, money(principal), money(interest), money(row.amount), money(balance)];
    values.forEach((v, col) => f.page.drawText(v, { x: colX[col], y: f.y, size: 7.8, font, color: INK }));
    f.page.drawLine({ start: { x: MARGIN, y: f.y - 3 }, end: { x: PAGE_WIDTH - MARGIN, y: f.y - 3 }, thickness: 0.3, color: LINE });
    f.y -= 14;
  });

  // --- Annexe 2 : fiche d'information -------------------------------------------------------------
  f.newAnnexPage("ANNEXE 2 - FICHE D'INFORMATION SYNTHÉTIQUE");
  f.termsTable([
    ["Emprunteur", data.borrowerName],
    ["Montant emprunté", money(data.amount)],
    ["Durée", `${data.durationMonths} mois`],
    ["Taux débiteur fixe", `${data.rate} % / an`],
    ["Mensualité", money(monthly)],
    ["Coût total du crédit", money(totalCost)],
    ["Score de risque interne", data.riskScore != null ? `${data.riskScore} / 100` : "Non disponible"],
    ["Risque principal pour le Prêteur", "Perte partielle ou totale du capital prêté (Article 10)"],
  ]);

  // --- Annexe 3 : bulletin de souscription -------------------------------------------------------------
  f.newAnnexPage("ANNEXE 3 - BULLETIN DE SOUSCRIPTION (MODÈLE)");
  f.para(`Je soussigné(e) [Nom du Prêteur], déclare souscrire au financement de l'Emprunteur désigné aux présentes pour un montant de [montant] EUR, et reconnais avoir pris connaissance et accepté sans réserve l'intégralité des stipulations du présent contrat référencé ${data.reference}, notamment l'avertissement sur les risques figurant à l'Article 10.`);

  f.y -= 30;
  f.para(
    `Document généré automatiquement par la plateforme Lentific à partir du dossier ${data.reference}. Les mentions signalées « à confirmer » doivent être complétées avec les données d'immatriculation réelles de la société et arbitrées par un avocat avant toute mise en production. Structure établie par référence aux articles L.548-1 et s. et R.548-1 et s. (notamment R.548-6) du Code monétaire et financier.`,
    { size: 7, color: MUTED, f: italic }
  );

  return pdf.save();
}
