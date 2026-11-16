/**
 * Mandat de recherche de financement et convention d'honoraires (demande
 * produit 2026-11-16) : le contrat que tout client du courtage signe avant
 * que Lentific ne cherche son financement. Honoraires fixés au cas par cas
 * par le conseiller (montant saisi dans le back-office), dus uniquement si
 * le prêt est obtenu, exigibles après le versement des fonds, comme annoncé
 * sur le site (FAQ « Combien coûte un courtier ? »).
 *
 * GABARIT, comme les deux autres contrats : à faire valider par un juriste
 * (statut d'intermédiaire, assurance RC professionnelle, médiateur).
 */
import { PDFDocument, rgb } from "pdf-lib";
import { legalIdentity } from "@fintech/database";
import { Flow, fmt, money, embedFonts, MARGIN, PAGE_WIDTH, CONTENT_WIDTH, INK, MUTED, ACCENT, decoratePages } from "./pdfKit";
import { getContractStrings, type ContractLocale } from "./i18n";

export interface MandateData {
  reference: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  durationMonths: number;
  fee: number;
  currency: string;
  generatedAt: Date;
  locale?: ContractLocale | string | null;
}

export async function renderMandatePdf(data: MandateData): Promise<Uint8Array> {
  const t = getContractStrings(data.locale);
  const dateLocale = (data.locale as string) ?? "fr";
  const id = legalIdentity();

  const pdf = await PDFDocument.create();
  pdf.setTitle(fmt(t.bm_pdfTitle, { reference: data.reference }));
  pdf.setAuthor(id.company);
  const { font, bold, italic } = await embedFonts(pdf);
  const f = new Flow(pdf, font, bold, italic);

  // --- Bandeau modèle -------------------------------------------------------
  f.page.drawRectangle({ x: MARGIN - 10, y: f.y - 28, width: CONTENT_WIDTH + 20, height: 30, color: rgb(0.97, 0.92, 0.92), borderColor: ACCENT, borderWidth: 0.8 });
  f.page.drawText(t.bannerLabel, { x: MARGIN, y: f.y - 12, size: 8, font: bold, color: ACCENT });
  f.page.drawText(fmt(t.bannerRef, { reference: data.reference, date: data.generatedAt.toLocaleDateString(dateLocale) }), { x: MARGIN, y: f.y - 23, size: 7.5, font, color: ACCENT });
  f.y -= 46;

  f.page.drawText(t.bm_mainTitle, { x: MARGIN, y: f.y, size: 14, font: bold, color: INK });
  f.y -= 16;
  f.page.drawText(t.bm_mainSubtitle, { x: MARGIN, y: f.y, size: 8.5, font: italic, color: MUTED });
  f.y -= 24;

  f.subheading(t.bm_brokerHeading);
  f.para(fmt(t.bm_brokerText, { company: id.company, companyNumber: id.companyNumber, address: id.address, oriasPart: id.orias ? fmt(t.bm_oriasPart, { orias: id.orias }) : "" }));

  f.subheading(t.bm_clientHeading);
  f.para(fmt(t.bm_clientText, { name: data.clientName, email: data.clientEmail }));

  const vars = {
    reference: data.reference,
    amount: money(data.amount, data.currency),
    duration: data.durationMonths,
    fee: money(data.fee, data.currency),
    email: id.email,
  };
  const articles: [string, string][] = [
    [t.bm_art1Title, t.bm_art1Text],
    [t.bm_art2Title, t.bm_art2Text],
    [t.bm_art3Title, t.bm_art3Text],
    [t.bm_art4Title, t.bm_art4Text],
    [t.bm_art5Title, t.bm_art5Text],
    [t.bm_art6Title, t.bm_art6Text],
    [t.bm_art7Title, t.bm_art7Text],
    [t.bm_art8Title, t.bm_art8Text],
  ];
  articles.forEach(([title, text], i) => {
    f.heading(title, i + 1, t.articleWord);
    f.para(fmt(text, vars));
  });

  // --- Signatures -------------------------------------------------------------
  f.ensureSpace(90);
  f.y -= 40;
  f.page.drawLine({ start: { x: MARGIN, y: f.y }, end: { x: MARGIN + 190, y: f.y }, thickness: 0.7, color: MUTED });
  f.page.drawLine({ start: { x: PAGE_WIDTH - MARGIN - 190, y: f.y }, end: { x: PAGE_WIDTH - MARGIN, y: f.y }, thickness: 0.7, color: MUTED });
  f.y -= 13;
  f.page.drawText(t.bm_signClientLabel, { x: MARGIN, y: f.y, size: 9, font: bold, color: INK });
  f.page.drawText(fmt(t.bm_signBrokerLabel, { company: id.company }), { x: PAGE_WIDTH - MARGIN - 190, y: f.y, size: 9, font: bold, color: INK });
  f.y -= 12;
  f.page.drawText(data.clientName, { x: MARGIN, y: f.y, size: 8.5, font, color: MUTED });
  f.page.drawText(t.signElectronic, { x: PAGE_WIDTH - MARGIN - 190, y: f.y, size: 8.5, font, color: MUTED });
  f.y -= 11;
  f.page.drawText(t.bm_signHint, { x: MARGIN, y: f.y, size: 7.5, font: italic, color: MUTED });

  f.y -= 30;
  f.para(fmt(t.bm_footerNote, { reference: data.reference }), { size: 7, color: MUTED, f: italic });

  decoratePages(pdf, { font, bold }, { reference: data.reference, docLabel: t.bm_pdfTitle.split(" - ")[0] });
  return pdf.save();
}
