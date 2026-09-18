/**
 * Rendu du contrat de prêt marketplace (multi-prêteurs, Lentific
 * intermédiaire) en PDF réel (§24). Structure établie par référence aux
 * articles L.548-1 et suivants et R.548-1 et suivants (notamment R.548-6,
 * qui liste les mentions obligatoires du contrat type) du Code monétaire et
 * financier français, à partir d'un contrat réel de financement participatif
 * consulté en ligne pour calibrer le formalisme attendu.
 *
 * Ce texte reste un GABARIT : les mentions marquées « à confirmer » exigent
 * soit une donnée d'immatriculation réelle de la société (SIREN, ORIAS...),
 * soit un arbitrage d'un conseil juridique (droit de rétractation, barème de
 * frais, indemnité de remboursement anticipé) avant tout usage réel, voir
 * cahier des charges §62 (revue réglementaire) et le README du dépôt.
 *
 * Généré dans la langue préférée de l'emprunteur (§ demande produit
 * 2026-09-18), voir packages/contracts/src/i18n/. Le texte juridique lui
 * n'a été rédigé et vérifié qu'en français ; les traductions sont, comme le
 * reste du document, un MODÈLE à faire valider par un juriste par langue
 * avant tout usage réel.
 */
import { PDFDocument } from "pdf-lib";
import { buildSchedule } from "@fintech/loans";
import { Flow, fmt, money, embedFonts, MARGIN, PAGE_WIDTH, PAGE_HEIGHT, CONTENT_WIDTH, INK, MUTED, ACCENT, LINE } from "./pdfKit";
import { getContractStrings, type ContractLocale } from "./i18n";
import { rgb } from "pdf-lib";

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
  locale?: ContractLocale | string | null;
}

export async function renderContractPdf(data: ContractData): Promise<Uint8Array> {
  const t = getContractStrings(data.locale);
  const dateLocale = (data.locale as string) ?? "fr";

  const pdf = await PDFDocument.create();
  pdf.setTitle(fmt(t.mp_pdfTitle, { reference: data.reference }));
  const { font, bold, italic } = await embedFonts(pdf);
  const f = new Flow(pdf, font, bold, italic);

  const schedule = buildSchedule(data.amount, data.durationMonths, data.rate, data.generatedAt);
  const monthly = schedule[0]?.amount ?? 0;
  const totalCost = monthly * data.durationMonths;
  const totalInterest = totalCost - data.amount;

  // --- Bandeau modèle -------------------------------------------------------
  f.page.drawRectangle({ x: MARGIN - 10, y: f.y - 28, width: CONTENT_WIDTH + 20, height: 30, color: rgb(0.97, 0.92, 0.92), borderColor: ACCENT, borderWidth: 0.8 });
  f.page.drawText(t.bannerLabel, { x: MARGIN, y: f.y - 12, size: 8, font: bold, color: ACCENT });
  f.page.drawText(fmt(t.bannerRef, { reference: data.reference, date: data.generatedAt.toLocaleDateString(dateLocale) }), { x: MARGIN, y: f.y - 23, size: 7.5, font, color: ACCENT });
  f.y -= 46;

  f.page.drawText(t.mp_mainTitle, { x: MARGIN, y: f.y, size: 14, font: bold, color: INK });
  f.y -= 16;
  f.page.drawText(t.mp_mainSubtitle, { x: MARGIN, y: f.y, size: 8.5, font: italic, color: MUTED });
  f.y -= 24;

  f.subheading(t.mp_intermediaryHeading);
  f.para(t.mp_intermediaryText);

  f.subheading(t.mp_borrowerHeading);
  const cityPart = data.borrowerCity ? fmt(t.mp_borrowerCityPart, { city: data.borrowerCity }) : "";
  f.para(fmt(t.mp_borrowerText, { name: data.borrowerName, email: data.borrowerEmail, cityPart }));

  f.subheading(t.mp_lendersHeading);
  f.para(t.mp_lendersText);

  f.heading(t.mp_preambleHeading);
  const riskPart = data.riskScore != null ? fmt(t.mp_preambleRiskPart, { score: data.riskScore }) : "";
  f.para(fmt(t.mp_preambleText1, { amount: money(data.amount), riskPart }));
  f.para(t.mp_preambleText2);

  f.heading(t.mp_art1Title, 1, t.articleWord);
  f.numberedList(t.mp_art1Items);

  f.heading(t.mp_art2Title, 2, t.articleWord);
  f.subheading(t.mp_art2Sub1);
  f.para(t.mp_art2Text1);
  f.subheading(t.mp_art2Sub2);
  f.para(t.mp_art2Text2);
  f.subheading(t.mp_art2Sub3);
  f.para(t.mp_art2Text3);

  f.heading(t.mp_art3Title, 3, t.articleWord);
  f.para(t.mp_art3Text);

  f.heading(t.mp_art4Title, 4, t.articleWord);
  f.termsTable([
    [t.mp_art4RowLabels[0], money(data.amount)],
    [t.mp_art4RowLabels[1], `${data.durationMonths} ${t.durationUnit}`],
    [t.mp_art4RowLabels[2], `${data.rate} %`],
    [t.mp_art4RowLabels[3], money(monthly)],
    [t.mp_art4RowLabels[4], money(totalInterest)],
    [t.mp_art4RowLabels[5], money(totalCost)],
    [t.mp_art4TaegLabel, t.mp_art4TaegValue],
  ]);

  f.heading(t.mp_art5Title, 5, t.articleWord);
  f.para(t.mp_art5Text1);
  f.para(t.mp_art5Text2);

  f.heading(t.mp_art6Title, 6, t.articleWord);
  f.para(t.mp_art6Text);

  f.heading(t.mp_art7Title, 7, t.articleWord);
  f.para(t.mp_art7Text);
  f.calloutToConfirm(t.mp_art7Callout, t.calloutPrefix);

  f.heading(t.mp_art8Title, 8, t.articleWord);
  f.para(t.mp_art8Text);
  f.calloutToConfirm(t.mp_art8Callout, t.calloutPrefix);

  f.heading(t.mp_art9Title, 9, t.articleWord);
  f.para(t.mp_art9Text);

  f.heading(t.mp_art10Title, 10, t.articleWord);
  f.para(t.mp_art10Text, { gap: 4 });
  f.numberedList(t.mp_art10Items);

  f.heading(t.mp_art11Title, 11, t.articleWord);
  f.para(t.mp_art11Text);

  f.heading(t.mp_art12Title, 12, t.articleWord);
  f.para(t.mp_art12Text);

  f.heading(t.mp_art13Title, 13, t.articleWord);
  f.calloutToConfirm(t.mp_art13Callout, t.calloutPrefix);

  f.heading(t.mp_art14Title, 14, t.articleWord);
  f.para(t.mp_art14Text);

  f.heading(t.mp_art15Title, 15, t.articleWord);
  f.para(t.mp_art15Text);

  f.heading(t.mp_art16Title, 16, t.articleWord);
  f.para(t.mp_art16Text);

  // --- Signatures -------------------------------------------------------------
  f.y -= 10;
  f.page.drawLine({ start: { x: MARGIN, y: f.y }, end: { x: MARGIN + 190, y: f.y }, thickness: 0.7, color: MUTED });
  f.page.drawLine({ start: { x: PAGE_WIDTH - MARGIN - 190, y: f.y }, end: { x: PAGE_WIDTH - MARGIN, y: f.y }, thickness: 0.7, color: MUTED });
  f.y -= 13;
  f.page.drawText(t.mp_signBorrowerLabel, { x: MARGIN, y: f.y, size: 9, font: bold, color: INK });
  f.page.drawText(t.mp_signIntermediaryLabel, { x: PAGE_WIDTH - MARGIN - 190, y: f.y, size: 9, font: bold, color: INK });
  f.y -= 12;
  f.page.drawText(data.borrowerName, { x: MARGIN, y: f.y, size: 8.5, font, color: MUTED });
  f.page.drawText(t.signElectronic, { x: PAGE_WIDTH - MARGIN - 190, y: f.y, size: 8.5, font, color: MUTED });

  // --- Annexe 1 : échéancier -------------------------------------------------------------
  f.newAnnexPage(t.mp_annex1Title);
  f.page.drawText(fmt(t.mp_annex1Subtitle, { amount: money(data.amount), duration: data.durationMonths, rate: data.rate, monthly: money(monthly) }), { x: MARGIN, y: f.y, size: 8.5, font, color: MUTED });
  f.y -= 20;

  const colX = [MARGIN, MARGIN + 38, MARGIN + 135, MARGIN + 230, MARGIN + 320, MARGIN + 405];
  f.page.drawRectangle({ x: MARGIN - 4, y: f.y - 4, width: CONTENT_WIDTH + 8, height: 16, color: INK });
  t.mp_annex1Headers.forEach((h, i) => f.page.drawText(h, { x: colX[i], y: f.y, size: 7.5, font: bold, color: rgb(1, 1, 1) }));
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

  // --- Annexe 2 : fiche d'information -------------------------------------------------------------
  f.newAnnexPage(t.mp_annex2Title);
  f.termsTable([
    [t.mp_annex2RowLabels[0], data.borrowerName],
    [t.mp_annex2RowLabels[1], money(data.amount)],
    [t.mp_annex2RowLabels[2], `${data.durationMonths} ${t.durationUnit}`],
    [t.mp_annex2RowLabels[3], `${data.rate} % / an`],
    [t.mp_annex2RowLabels[4], money(monthly)],
    [t.mp_annex2RowLabels[5], money(totalCost)],
    [t.mp_annex2RowLabels[6], data.riskScore != null ? `${data.riskScore} / 100` : t.noScoreAvailable],
    [t.mp_annex2RowLabels[7], t.mp_annex2MainRiskText],
  ]);

  // --- Annexe 3 : bulletin de souscription -------------------------------------------------------------
  f.newAnnexPage(t.mp_annex3Title);
  f.para(fmt(t.mp_annex3Text, { reference: data.reference }));

  f.y -= 30;
  f.para(fmt(t.mp_footerNote, { reference: data.reference }), { size: 7, color: MUTED, f: italic });

  return pdf.save();
}
