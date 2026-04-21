// ==================================
// FILE: src/utils/exportPDF.js
// Generates a styled PDF from tabular data using jsPDF (loaded via CDN).
// No npm install needed — the library loads on first use and is cached.
// ==================================

let jsPDFInstance = null;

async function loadJsPDF() {
  if (jsPDFInstance) return jsPDFInstance;
  return new Promise((resolve, reject) => {
    if (window.jspdf?.jsPDF) {
      jsPDFInstance = window.jspdf.jsPDF;
      return resolve(jsPDFInstance);
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      jsPDFInstance = window.jspdf.jsPDF;
      resolve(jsPDFInstance);
    };
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });
}

async function loadAutoTable() {
  return new Promise((resolve, reject) => {
    if (window.jspdfAutotable) return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load jsPDF AutoTable'));
    document.head.appendChild(script);
  });
}

/**
 * Export tabular data to a styled, non-editable PDF.
 *
 * @param {Object} options
 * @param {string}   options.title      - Report title shown at the top
 * @param {string}   options.filename   - Downloaded filename (without .pdf)
 * @param {string[]} options.headers    - Column header labels
 * @param {Array[]}  options.rows       - Array of row arrays (values match headers order)
 * @param {string}   [options.subtitle] - Optional subtitle / date range line
 */
export async function exportToPDF({ title, filename, headers, rows, subtitle }) {
  const JsPDF = await loadJsPDF();
  await loadAutoTable();

  const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // ── Header block ──────────────────────────────────────────────────
  doc.setFillColor(30, 64, 175); // blue-800
  doc.rect(0, 0, pageW, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TTC Homes Essentials', 14, 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 17);

  // Date top-right
  doc.setFontSize(9);
  doc.text(`Generated: ${today}`, pageW - 14, 10, { align: 'right' });
  if (subtitle) {
    doc.text(subtitle, pageW - 14, 16, { align: 'right' });
  }

  // ── Table ──────────────────────────────────────────────────────────
  doc.autoTable({
    startY: 26,
    head: [headers],
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 30, 30],
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 255],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer on every page
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}  •  TTC Homes Essentials  •  ${today}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'center' }
      );
    },
  });

  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
}
