/**
 * Utilitaires de mise en page PDF partagés entre les gabarits de contrat
 * (marketplace multi-prêteurs et bilatéral emprunteur/prêteur direct,
 * §24 et § demande produit 2026-09-18). pdf-lib ne fait pas de flux de texte
 * automatique, ce petit gestionnaire s'en charge.
 */
import { PDFDocument, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { FONT_REGULAR_B64, FONT_BOLD_B64, FONT_ITALIC_B64 } from "./fontData";

export const PAGE_WIDTH = 595.28;
export const PAGE_HEIGHT = 841.89;
export const MARGIN = 54;
export const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
export const INK = rgb(0.1, 0.1, 0.1);
export const MUTED = rgb(0.35, 0.35, 0.35);
export const ACCENT = rgb(0.48, 0.09, 0.13);
export const LINE = rgb(0.85, 0.85, 0.85);

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

  heading(text: string, num?: number, articleLabel = "ARTICLE") {
    this.ensureSpace(30);
    this.y -= 6;
    this.page.drawLine({ start: { x: MARGIN, y: this.y + 2 }, end: { x: PAGE_WIDTH - MARGIN, y: this.y + 2 }, thickness: 0.5, color: LINE });
    this.y -= 12;
    const label = num ? `${articleLabel} ${num} - ${text}` : text;
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
    this.y = PAGE_HEIGHT - MARGIN;
    this.page.drawText(title, { x: MARGIN, y: this.y, size: 13, font: this.bold, color: INK });
    this.y -= 26;
  }
}
