import { jsPDF } from "jspdf";
import { isChordLine } from "./cifraParser";

const MARGIN = 40;
const BORDER_MARGIN = 18;
const CHORD_COLOR = [79, 70, 229]; // var(--main)
const TEXT_COLOR = [30, 30, 30];
const MUTED_COLOR = [110, 110, 110];
const BORDER_COLOR = [79, 70, 229];

function sanitizeFilename(name) {
  return (name || "cifra")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "_") || "cifra";
}

// Courier é monospace: reduz o tamanho da fonte até a linha mais longa caber na página.
function fitFontSize(lines, usableWidth) {
  const maxLineLen = Math.max(1, ...lines.map((l) => l.length));
  const charWidthFactor = 0.6;
  let fontSize = 11;
  while (fontSize > 6 && maxLineLen * fontSize * charWidthFactor > usableWidth) {
    fontSize -= 0.5;
  }
  return fontSize;
}

function drawPageBorder(doc, pageWidth, pageHeight) {
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(1.2);
  doc.rect(
    BORDER_MARGIN,
    BORDER_MARGIN,
    pageWidth - BORDER_MARGIN * 2,
    pageHeight - BORDER_MARGIN * 2
  );
  doc.setLineWidth(0.5);
  doc.rect(
    BORDER_MARGIN + 4,
    BORDER_MARGIN + 4,
    pageWidth - (BORDER_MARGIN + 4) * 2,
    pageHeight - (BORDER_MARGIN + 4) * 2
  );
}

function drawAllPageBorders(doc) {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    drawPageBorder(doc, pageWidth, pageHeight);
  }
}

function truncateText(doc, text, maxWidth) {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && doc.getTextWidth(`${truncated}…`) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

function newPageCursor(doc) {
  return {
    y: MARGIN,
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
  };
}

function ensureSpace(doc, cursor, needed) {
  if (cursor.y + needed > cursor.pageHeight - MARGIN) {
    doc.addPage();
    cursor.y = MARGIN;
  }
}

function writeHeading(doc, cursor, nome, meta) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...TEXT_COLOR);
  ensureSpace(doc, cursor, 24);
  doc.text(nome || "", MARGIN, cursor.y);
  cursor.y += 20;

  if (meta) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...MUTED_COLOR);
    ensureSpace(doc, cursor, 14);
    doc.text(meta, MARGIN, cursor.y);
    cursor.y += 18;
  } else {
    cursor.y += 6;
  }
}

function writeCifraBody(doc, cursor, text) {
  const lines = (text || "").split("\n");
  const usableWidth = cursor.pageWidth - MARGIN * 2;
  const fontSize = fitFontSize(lines, usableWidth);
  const lineHeight = fontSize * 1.55;

  doc.setFontSize(fontSize);

  for (const line of lines) {
    if (!line.trim()) {
      cursor.y += lineHeight * 0.6;
      continue;
    }

    ensureSpace(doc, cursor, lineHeight);

    if (isChordLine(line)) {
      doc.setFont("courier", "bold");
      doc.setTextColor(...CHORD_COLOR);
    } else {
      doc.setFont("courier", "normal");
      doc.setTextColor(...TEXT_COLOR);
    }

    doc.text(line, MARGIN, cursor.y);
    cursor.y += lineHeight;
  }
}

function buildMeta({ artista, tom, bpm }) {
  const partes = [];
  if (artista) partes.push(artista);
  if (tom) partes.push(`Tom: ${tom}`);
  if (bpm) partes.push(`${bpm} BPM`);
  return partes.join("   •   ");
}

export function exportCifraPdf({ nome, artista, tom, bpm, text }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const cursor = newPageCursor(doc);

  writeHeading(doc, cursor, nome, buildMeta({ artista, tom, bpm }));
  writeCifraBody(doc, cursor, text);

  drawAllPageBorders(doc);
  doc.save(`${sanitizeFilename(nome)}.pdf`);
}

const TOC_ENTRY_HEIGHT = 22;
const TOC_PAGE_NUM_WIDTH = 34;
const TOC_NUMBER_WIDTH = 26;

function writeTocEntryTitle(doc, cursor, index, title) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED_COLOR);

  const numberLabel = `${index + 1}.`;
  doc.text(numberLabel, MARGIN, cursor.y);

  const titleX = MARGIN + TOC_NUMBER_WIDTH;
  const titleMaxWidth = cursor.pageWidth - MARGIN - TOC_PAGE_NUM_WIDTH - titleX;
  const truncatedTitle = truncateText(doc, title || "", titleMaxWidth);
  doc.setTextColor(...CHORD_COLOR);
  doc.text(truncatedTitle, titleX, cursor.y);
}

export function exportPlaylistPdf({ nome, musicas }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const cursor = newPageCursor(doc);
  const lista = musicas || [];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...TEXT_COLOR);
  doc.text(nome || "Playlist", MARGIN, cursor.y);
  cursor.y += 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED_COLOR);
  doc.text(`${lista.length} música(s)`, MARGIN, cursor.y);
  cursor.y += 30;

  const tocEntries = [];
  if (lista.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...TEXT_COLOR);
    ensureSpace(doc, cursor, 20);
    doc.text("Sumário", MARGIN, cursor.y);
    cursor.y += 22;

    lista.forEach((musica, index) => {
      ensureSpace(doc, cursor, TOC_ENTRY_HEIGHT);
      writeTocEntryTitle(doc, cursor, index, musica.nome);
      tocEntries.push({ page: doc.internal.getNumberOfPages(), y: cursor.y });
      cursor.y += TOC_ENTRY_HEIGHT;
    });
  }

  const startPages = lista.map((musica) => {
    doc.addPage();
    cursor.y = MARGIN;
    const startPage = doc.internal.getNumberOfPages();
    writeHeading(doc, cursor, musica.nome, buildMeta(musica));
    writeCifraBody(doc, cursor, musica.text);
    return startPage;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED_COLOR);
  tocEntries.forEach((entry, index) => {
    doc.setPage(entry.page);
    const pageLabel = String(startPages[index]);
    const pageLabelWidth = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, cursor.pageWidth - MARGIN - pageLabelWidth, entry.y);

    doc.link(
      MARGIN,
      entry.y - TOC_ENTRY_HEIGHT * 0.75,
      cursor.pageWidth - MARGIN * 2,
      TOC_ENTRY_HEIGHT,
      { pageNumber: startPages[index] }
    );
  });

  drawAllPageBorders(doc);
  doc.save(`${sanitizeFilename(nome)}.pdf`);
}
