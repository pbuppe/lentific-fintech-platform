/**
 * Rendu du contrat de prêt DIRECT entre un emprunteur et le prêteur
 * particulier précis avec qui il a été mis en relation (§ demande produit
 * 2026-09-18), par opposition au contrat marketplace multi-prêteurs
 * (template.ts). Volontairement plus simple : pas de financement fractionné,
 * pas de rôle d'intermédiaire réglementé de Lentific dans le prêt lui-même
 * (seulement dans la mise en relation, déjà payée en amont). GABARIT : à
 * faire valider par un juriste avant tout usage réel, notamment sur la
 * qualification éventuelle en crédit à la consommation (voir callout
 * Article 4).
 */
import { PDFDocument, rgb } from "pdf-lib";
import { buildSchedule } from "@fintech/loans";
import { Flow, fmt, money, embedFonts, MARGIN, PAGE_WIDTH, PAGE_HEIGHT, CONTENT_WIDTH, INK, MUTED, ACCENT, LINE } from "./pdfKit";
import { getContractStrings, type ContractLocale } from "./i18n";

export interface DirectContractData {
  reference: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerCity?: string;
  lenderName: string;
  lenderEmail: string;
  amount: number;
  durationMonths: number;
  rate: number;
  generatedAt: Date;
  locale?: ContractLocale | string | null;
}

export async function renderDirectContractPdf(data: DirectContractData): Promise<Uint8Array> {
  const t = getContractStrings(data.locale);
  const dateLocale = (data.locale as string) ?? "fr";

  const pdf = await PDFDocument.create();
  pdf.setTitle(fmt(t.dl_pdfTitle, { reference: data.reference }));
  const { font, bold, italic } = await embedFonts(pdf);
  const f = new Flow(pdf, font, bold, italic);

  const schedule = buildSchedule(data.amount, data.durationMonths, data.rate, data.generatedAt);
  const monthly = schedule[0]?.amount ?? 0;
  const totalCost = monthly * data.durationMonths;

  // --- Bandeau modèle -------------------------------------------------------
  f.page.drawRectangle({ x: MARGIN - 10, y: f.y - 28, width: CONTENT_WIDTH + 20, height: 30, color: rgb(0.97, 0.92, 0.92), borderColor: ACCENT, borderWidth: 0.8 });
  f.page.drawText(t.bannerLabel, { x: MARGIN, y: f.y - 12, size: 8, font: bold, color: ACCENT });
  f.page.drawText(fmt(t.bannerRef, { reference: data.reference, date: data.generatedAt.toLocaleDateString(dateLocale) }), { x: MARGIN, y: f.y - 23, size: 7.5, font, color: ACCENT });
  f.y -= 46;

  f.page.drawText(t.dl_mainTitle, { x: MARGIN, y: f.y, size: 14, font: bold, color: INK });
  f.y -= 16;
  f.page.drawText(t.dl_mainSubtitle, { x: MARGIN, y: f.y, size: 8.5, font: italic, color: MUTED });
  f.y -= 24;

  f.subheading(t.dl_borrowerHeading);
  const cityPart = data.borrowerCity ? fmt(t.dl_borrowerCityPart, { city: data.borrowerCity }) : "";
  f.para(fmt(t.dl_borrowerText, { name: data.borrowerName, email: data.borrowerEmail, cityPart }));

  f.subheading(t.dl_lenderHeading);
  f.para(fmt(t.dl_lenderText, { name: data.lenderName, email: data.lenderEmail }));

  f.heading(t.dl_preambleHeading);
  f.para(fmt(t.dl_preambleText, { borrowerName: data.borrowerName, lenderName: data.lenderName, amount: money(data.amount) }));

  f.heading(t.dl_art1Title, 1, t.articleWord);
  f.para(t.dl_art1Text);

  f.heading(t.dl_art2Title, 2, t.articleWord);
  f.termsTable([
    [t.dl_art2RowLabels[0], money(data.amount)],
    [t.dl_art2RowLabels[1], `${data.durationMonths} ${t.durationUnit}`],
    [t.dl_art2RowLabels[2], `${data.rate} %`],
    [t.dl_art2RowLabels[3], money(monthly)],
    [t.dl_art2RowLabels[4], money(totalCost)],
  ]);

  f.heading(t.dl_art3Title, 3, t.articleWord);
  f.para(t.dl_art3Text);

  f.heading(t.dl_art4Title, 4, t.articleWord);
  f.para(t.dl_art4Text);
  f.calloutToConfirm(t.dl_art4Callout, t.calloutPrefix);

  f.heading(t.dl_art5Title, 5, t.articleWord);
  f.para(t.dl_art5Text);

  f.heading(t.dl_art6Title, 6, t.articleWord);
  f.para(t.dl_art6Text);

  f.heading(t.dl_art7Title, 7, t.articleWord);
  f.para(t.dl_art7Text, { gap: 4 });
  f.numberedList(t.dl_art7Items);

  f.heading(t.dl_art8Title, 8, t.articleWord);
  f.para(t.dl_art8Text);

  f.heading(t.dl_art9Title, 9, t.articleWord);
  f.para(t.dl_art9Text);

  f.heading(t.dl_art10Title, 10, t.articleWord);
  f.para(t.dl_art10Text);

  // --- Signatures -------------------------------------------------------------
  f.y -= 10;
  f.page.drawLine({ start: { x: MARGIN, y: f.y }, end: { x: MARGIN + 190, y: f.y }, thickness: 0.7, color: MUTED });
  f.page.drawLine({ start: { x: PAGE_WIDTH - MARGIN - 190, y: f.y }, end: { x: PAGE_WIDTH - MARGIN, y: f.y }, thickness: 0.7, color: MUTED });
  f.y -= 13;
  f.page.drawText(t.dl_signBorrowerLabel, { x: MARGIN, y: f.y, size: 9, font: bold, color: INK });
  f.page.drawText(t.dl_signLenderLabel, { x: PAGE_WIDTH - MARGIN - 190, y: f.y, size: 9, font: bold, color: INK });
  f.y -= 12;
  f.page.drawText(data.borrowerName, { x: MARGIN, y: f.y, size: 8.5, font, color: MUTED });
  f.page.drawText(data.lenderName, { x: PAGE_WIDTH - MARGIN - 190, y: f.y, size: 8.5, font, color: MUTED });

  // --- Annexe 1 : échéancier -------------------------------------------------------------
  f.newAnnexPage(t.dl_annex1Title);
  f.page.drawText(fmt(t.dl_annex1Subtitle, { amount: money(data.amount), duration: data.durationMonths, rate: data.rate, monthly: money(monthly) }), { x: MARGIN, y: f.y, size: 8.5, font, color: MUTED });
  f.y -= 20;

  const colX = [MARGIN, MARGIN + 38, MARGIN + 135, MARGIN + 230, MARGIN + 320, MARGIN + 405];
  f.page.drawRectangle({ x: MARGIN - 4, y: f.y - 4, width: CONTENT_WIDTH + 8, height: 16, color: INK });
  t.dl_annex1Headers.forEach((h, i) => f.page.drawText(h, { x: colX[i], y: f.y, size: 7.5, font: bold, color: rgb(1, 1, 1) }));
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
    const dateStr = row.dueDate.toLocaleDateString(dateLocale);
    const values = [String(i + 1), dateStr, money(principal), money(interest), money(row.amount), money(balance)];
    values.forEach((v, col) => f.page.drawText(v, { x: colX[col], y: f.y, size: 7.8, font, color: INK }));
    f.page.drawLine({ start: { x: MARGIN, y: f.y - 3 }, end: { x: PAGE_WIDTH - MARGIN, y: f.y - 3 }, thickness: 0.3, color: LINE });
    f.y -= 14;
  });

  f.y -= 20;
  f.para(fmt(t.dl_footerNote, { reference: data.reference }), { size: 7, color: MUTED, f: italic });

  return pdf.save();
}
