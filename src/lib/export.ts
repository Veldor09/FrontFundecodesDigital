"use client";

/**
 * Utilidades de exportación para PDF (jsPDF + autotable) y Excel (xlsx).
 * Uso:
 *   exportToPDF({ title, columns, rows, filename })
 *   exportToExcel({ columns, rows, filename, sheetName })
 */

export interface ExportColumn {
  /** Clave del objeto en `rows` */
  key: string;
  /** Encabezado de columna visible */
  header: string;
  /** Ancho relativo en PDF (opcional) */
  width?: number;
}

export type ExportRow = Record<string, string | number | boolean | null | undefined>;

// Color institucional FUNDECODES
const BRAND_COLOR: [number, number, number] = [0, 51, 102]; // #003366
const BRAND_LIGHT: [number, number, number] = [219, 232, 245]; // #dbe8f5
const ALT_ROW: [number, number, number] = [247, 249, 251]; // #f7f9fb

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("logo load failed"));
      img.src = "/Img/FUNDECODES_Logo.png";
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

// ─── PDF ────────────────────────────────────────────────────────────────────

export async function exportToPDF(options: {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  rows: ExportRow[];
  filename?: string;
  orientation?: "portrait" | "landscape";
}) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const {
    title,
    subtitle,
    columns,
    rows,
    filename = "exportacion",
    orientation = "landscape",
  } = options;

  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const headerH = 30;

  // ── Encabezado institucional ──────────────────────────────────────────────
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageW, headerH, "F");

  // Logo
  const logoData = await loadLogoDataUrl();
  if (logoData) {
    doc.addImage(logoData, "PNG", margin, 4, 22, 22);
  }

  // Fecha de generación (esquina derecha)
  const generatedAt = new Date().toLocaleString("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 225, 240);
  doc.text(`Generado: ${generatedAt}`, pageW - margin, headerH * 0.58, { align: "right" });

  // ── Título del reporte ────────────────────────────────────────────────────
  let cursorY = headerH + 8;
  doc.setTextColor(...BRAND_COLOR);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, margin, cursorY);
  cursorY += 6;

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(subtitle, margin, cursorY);
    cursorY += 6;
  }

  doc.setTextColor(0, 0, 0);

  // ── Línea separadora ─────────────────────────────────────────────────────
  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageW - margin, cursorY);
  cursorY += 4;

  // ── Tabla ─────────────────────────────────────────────────────────────────
  const head = [columns.map((c) => c.header)];
  const body = rows.map((r) => columns.map((c) => formatCell(r[c.key])));

  // Escalar anchos de columnas para llenar el ancho disponible de la página
  const availableW = pageW - margin * 2;
  const totalColW = columns.reduce((s, c) => s + (c.width ?? 18), 0);
  const colScale = totalColW > 0 ? availableW / totalColW : 1;

  autoTable(doc, {
    head,
    body,
    startY: cursorY,
    tableWidth: availableW,
    margin: { left: margin, right: margin, bottom: 16 },
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
      overflow: "linebreak",
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: ALT_ROW },
    columnStyles: Object.fromEntries(
      columns.map((c, i) => [
        i,
        { cellWidth: Math.floor((c.width ?? 18) * colScale) },
      ])
    ),
    didDrawPage: () => {
      // Solo texto institucional — número de página se agrega en post-proceso
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      doc.text(
        "FUNDECODES DIGITAL – Sistema Administrativo · Documento confidencial",
        margin,
        pageH - 7
      );
      doc.setTextColor(0, 0, 0);
    },
  });

  // Post-proceso: numerar páginas con total correcto
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text(`Página ${p} de ${totalPages}`, pageW - margin, pageH - 7, {
      align: "right",
    });
    doc.setTextColor(0, 0, 0);
  }

  doc.save(`${filename}.pdf`);
}

// ─── Excel ───────────────────────────────────────────────────────────────────

export async function exportToExcel(options: {
  columns: ExportColumn[];
  rows: ExportRow[];
  filename?: string;
  sheetName?: string;
  title?: string;
}) {
  const XLSX = await import("xlsx");

  const {
    columns,
    rows,
    filename = "exportacion",
    sheetName = "Datos",
    title,
  } = options;

  const wsData: (string | number | null | undefined)[][] = [];

  // Fila de título opcional
  if (title) {
    wsData.push([title]);
    wsData.push([]);
  }

  // Encabezados
  wsData.push(columns.map((c) => c.header));

  // Filas de datos
  rows.forEach((r) => {
    wsData.push(columns.map((c) => {
      const v = r[c.key];
      if (v == null) return "";
      if (typeof v === "boolean") return v ? "Sí" : "No";
      return v;
    }));
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Ancho de columnas
  ws["!cols"] = columns.map((c) => ({ wch: c.width ?? 18 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatCell(v: string | number | boolean | null | undefined): string {
  if (v == null) return "";
  if (typeof v === "boolean") return v ? "Sí" : "No";
  return String(v);
}
