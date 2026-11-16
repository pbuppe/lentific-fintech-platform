/**
 * Utilitaires de mise en page PDF partagés entre les gabarits de contrat
 * (marketplace multi-prêteurs et bilatéral emprunteur/prêteur direct,
 * §24 et § demande produit 2026-09-18). pdf-lib ne fait pas de flux de texte
 * automatique, ce petit gestionnaire s'en charge.
 */
import { PDFDocument, rgb, LineCapStyle, type PDFPage, type PDFFont } from "pdf-lib";
import { legalIdentity } from "@fintech/database";
import fontkit from "@pdf-lib/fontkit";
import { FONT_REGULAR_B64, FONT_BOLD_B64, FONT_ITALIC_B64 } from "./fontData";

export const PAGE_WIDTH = 595.28;
export const PAGE_HEIGHT = 841.89;
export const MARGIN = 54;
export const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
// Palette de la marque (packages/ui/src/tokens.ts) : bleu, bleu nuit, rouge, jaune, encre.
const hex = (h: string) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
export const BRAND = hex("#2E4A9E");
export const BRAND_INK = hex("#1C2F6B");
export const YELLOW = hex("#F5C21B");
export const INK = hex("#171B2B");
export const MUTED = rgb(0.35, 0.36, 0.42);
export const ACCENT = hex("#C4293A");
export const LINE = rgb(0.85, 0.85, 0.87);
/** Hauteur réservée en haut de chaque page pour l'en-tête (logo + identité de la société). */
export const HEADER_SPACE = 40;
export const CONTENT_TOP = PAGE_HEIGHT - MARGIN - HEADER_SPACE;

const NBSP = String.fromCharCode(0x00a0);
const NARROW_NBSP = String.fromCharCode(0x202f);

/** Substitution simple {token} -> valeur, pas de l'ICU (pas de pluriels ici, juste des phrases juridiques). */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export function money(n: number, currency = "EUR"): string {
  const formatted = n
    .toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split(NBSP)
    .join(" ")
    .split(NARROW_NBSP)
    .join(" ");
  return `${formatted} ${currency}`;
}

export async function embedFonts(pdf: PDFDocument) {
  // Police Unicode (voir fontData.ts) : les polices standard PDF ne couvrent
  // pas tous les caractères des 8 langues (ex. « ő » / « ű » en hongrois).
  pdf.registerFontkit(fontkit);
  return {
    font: await pdf.embedFont(Buffer.from(FONT_REGULAR_B64, "base64"), { subset: true }),
    bold: await pdf.embedFont(Buffer.from(FONT_BOLD_B64, "base64"), { subset: true }),
    italic: await pdf.embedFont(Buffer.from(FONT_ITALIC_B64, "base64"), { subset: true }),
  };
}

export class Flow {
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
    this.y = CONTENT_TOP;
  }

  /** Nouvelle page, le contenu reprend sous l'en-tête. */
  newPage() {
    this.page = this.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.pageNum += 1;
    this.y = CONTENT_TOP;
  }

  ensureSpace(h: number) {
    if (this.y - h < MARGIN + 20) this.newPage();
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

  heading(text: string, num?: number, articleLabel = "ARTICLE") {
    // Garde le titre avec au moins deux lignes de texte (pas de titre orphelin en bas de page).
    this.ensureSpace(64);
    this.y -= 6;
    this.page.drawLine({ start: { x: MARGIN, y: this.y + 2 }, end: { x: PAGE_WIDTH - MARGIN, y: this.y + 2 }, thickness: 0.5, color: LINE });
    this.y -= 12;
    const label = num ? `${articleLabel} ${num} - ${text}` : text;
    this.page.drawText(label, { x: MARGIN, y: this.y, size: 10.5, font: this.bold, color: BRAND_INK });
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

  calloutToConfirm(text: string, prefix: string) {
    const size = 8.4;
    const maxWidth = CONTENT_WIDTH - 20;
    const lines = this.wrap(`${prefix} : ${text}`, this.italic, size, maxWidth);
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
    this.y = CONTENT_TOP;
    this.page.drawText(title, { x: MARGIN, y: this.y, size: 13, font: this.bold, color: BRAND_INK });
    this.y -= 26;
  }
}

/**
 * Logo Lentific « La passerelle » (même dessin que packages/ui/src/LogoMark.tsx) :
 * carré bleu, L blanc, point rouge en haut, point jaune en bas. Dessiné en
 * vectoriel (net à l'impression). (x, top) = coin supérieur gauche, size en points.
 */
export function drawLogoMark(page: PDFPage, x: number, top: number, size: number) {
  const s = size / 64;
  page.drawSvgPath("M16 2h32a14 14 0 0 1 14 14v32a14 14 0 0 1-14 14H16A14 14 0 0 1 2 48V16A14 14 0 0 1 16 2z", { x, y: top, scale: s, color: BRAND });
  page.drawSvgPath("M18 14v30a6 6 0 0 0 6 6h18", { x, y: top, scale: s, borderColor: rgb(1, 1, 1), borderWidth: 8, borderLineCap: LineCapStyle.Round });
  page.drawCircle({ x: x + 47 * s, y: top - 50 * s, size: 7 * s, color: YELLOW });
  page.drawCircle({ x: x + 18 * s, y: top - 14 * s, size: 7 * s, color: ACCENT });
}

/**
 * En-tête et pied de page de marque, posés sur toutes les pages une fois le
 * document terminé (le total de pages est alors connu) : logo + « Lentific »,
 * identité légale de la société exploitante, référence et numéro de page.
 */
export function decoratePages(pdf: PDFDocument, fonts: { font: PDFFont; bold: PDFFont }, opts: { reference: string; docLabel: string }) {
  const id = legalIdentity();
  const pages = pdf.getPages();
  const top = PAGE_HEIGHT - MARGIN + 14;
  pages.forEach((page, i) => {
    drawLogoMark(page, MARGIN, top, 22);
    page.drawText("Lentific", { x: MARGIN + 29, y: top - 16, size: 14, font: fonts.bold, color: BRAND_INK });
    const right = (text: string, y: number, size: number, font: PDFFont, color = MUTED) =>
      page.drawText(text, { x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(text, size), y, size, font, color });
    right(opts.docLabel, top - 7, 7.5, fonts.bold, BRAND_INK);
    right(`${id.company} · Company number ${id.companyNumber}`, top - 17, 7, fonts.font);
    page.drawLine({ start: { x: MARGIN, y: top - 27 }, end: { x: PAGE_WIDTH - MARGIN, y: top - 27 }, thickness: 1.2, color: BRAND });
    page.drawLine({ start: { x: MARGIN, y: top - 27 }, end: { x: MARGIN + 40, y: top - 27 }, thickness: 1.2, color: ACCENT });

    const footY = MARGIN - 26;
    page.drawLine({ start: { x: MARGIN, y: footY + 10 }, end: { x: PAGE_WIDTH - MARGIN, y: footY + 10 }, thickness: 0.4, color: LINE });
    page.drawText(`Lentific · ${id.company} · ${id.address} · ${id.email}`, { x: MARGIN, y: footY, size: 6.8, font: fonts.font, color: MUTED });
    right(`${opts.reference} · ${i + 1} / ${pages.length}`, footY, 6.8, fonts.font);
  });
}
