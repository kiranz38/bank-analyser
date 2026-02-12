import type { AnalysisResult } from './types'
import type { jsPDF as jsPDFType } from 'jspdf'

const BRAND_COLOR = [14, 165, 233] as const   // #0ea5e9
const DANGER_COLOR = [239, 68, 68] as const    // #ef4444
const SUCCESS_COLOR = [16, 185, 129] as const  // #10b981
const MUTED_COLOR = [100, 116, 139] as const   // #64748b
const HEADER_BAR_HEIGHT = 12
const PAGE_MARGIN = 20
const CONTENT_WIDTH = 170 // A4 width (210) - 2 * margin (20)

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function fmtPrecise(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function drawHeaderBar(doc: jsPDFType) {
  doc.setFillColor(...BRAND_COLOR)
  doc.rect(0, 0, 210, HEADER_BAR_HEIGHT, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text('Leaky Wallet', PAGE_MARGIN, 8)
  doc.setFont('helvetica', 'normal')
  doc.text('Spending Analysis Report', 210 - PAGE_MARGIN, 8, { align: 'right' })
}

function drawFooter(doc: jsPDFType, pageNum: number, totalPages: number) {
  const y = 290
  doc.setDrawColor(226, 232, 240)
  doc.line(PAGE_MARGIN, y - 4, 210 - PAGE_MARGIN, y - 4)
  doc.setFontSize(7)
  doc.setTextColor(...MUTED_COLOR)
  doc.text('For informational purposes only. Not financial advice.', PAGE_MARGIN, y)
  doc.text(`Page ${pageNum} of ${totalPages}`, 210 - PAGE_MARGIN, y, { align: 'right' })
}

function addPageWithHeader(doc: jsPDFType): number {
  doc.addPage()
  drawHeaderBar(doc)
  return HEADER_BAR_HEIGHT + 10
}

function checkPageBreak(doc: jsPDFType, y: number, needed: number): number {
  if (y + needed > 275) {
    return addPageWithHeader(doc)
  }
  return y
}

function drawSectionTitle(doc: jsPDFType, title: string, y: number): number {
  y = checkPageBreak(doc, y, 14)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42) // slate-900
  doc.text(title, PAGE_MARGIN, y)
  y += 2
  doc.setDrawColor(...BRAND_COLOR)
  doc.setLineWidth(0.5)
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + 40, y)
  return y + 6
}

export async function generatePdf(
  results: AnalysisResult,
  chartContainerId: string
): Promise<void> {
  // Dynamic imports — zero impact on initial bundle
  const jspdfModule = await import('jspdf')
  const autoTableModule = await import('jspdf-autotable')
  const html2canvasModule = await import('html2canvas')

  const jsPDF = jspdfModule.jsPDF || jspdfModule.default
  const autoTable = autoTableModule.autoTable || autoTableModule.default
  const html2canvas = html2canvasModule.default || html2canvasModule

  // v5 requires explicit plugin registration
  if (typeof autoTableModule.applyPlugin === 'function') {
    autoTableModule.applyPlugin(jsPDF)
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // ─── PAGE 1: Cover ───────────────────────────────────────────
  drawHeaderBar(doc)
  let y = HEADER_BAR_HEIGHT + 16

  // Title
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('Spending Analysis Report', PAGE_MARGIN, y)
  y += 8

  // Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED_COLOR)
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, PAGE_MARGIN, y)
  y += 14

  // Stat boxes
  const boxWidth = CONTENT_WIDTH / 2 - 4
  const boxHeight = 28

  // Monthly Leak box
  doc.setFillColor(254, 226, 226) // red-100
  doc.roundedRect(PAGE_MARGIN, y, boxWidth, boxHeight, 3, 3, 'F')
  doc.setFontSize(9)
  doc.setTextColor(...DANGER_COLOR)
  doc.setFont('helvetica', 'normal')
  doc.text('Monthly Leak', PAGE_MARGIN + 6, y + 10)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(fmt(results.monthly_leak), PAGE_MARGIN + 6, y + 22)

  // Annual Savings box
  const box2X = PAGE_MARGIN + boxWidth + 8
  doc.setFillColor(209, 250, 229) // green-100
  doc.roundedRect(box2X, y, boxWidth, boxHeight, 3, 3, 'F')
  doc.setFontSize(9)
  doc.setTextColor(...SUCCESS_COLOR)
  doc.setFont('helvetica', 'normal')
  doc.text('Annual Savings', box2X + 6, y + 10)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(fmt(results.annual_savings), box2X + 6, y + 22)

  y += boxHeight + 12

  // Capture pie chart if element exists
  const chartEl = document.getElementById(chartContainerId)
  if (chartEl) {
    try {
      const canvas = await html2canvas(chartEl, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 80
      const imgHeight = (canvas.height / canvas.width) * imgWidth
      const imgX = (210 - imgWidth) / 2
      y = checkPageBreak(doc, y, imgHeight + 10)
      doc.addImage(imgData, 'PNG', imgX, y, imgWidth, imgHeight)
      y += imgHeight + 10
    } catch {
      // Chart capture failed silently — continue without it
    }
  }

  // ─── SPENDING BREAKDOWN TABLE ────────────────────────────────
  if (results.category_summary && results.category_summary.length > 0) {
    y = checkPageBreak(doc, y, 30)
    y = drawSectionTitle(doc, 'Spending Breakdown', y)

    const catRows = results.category_summary
      .filter(c => c.category !== 'Transfers' && c.category !== 'Income')
      .map(c => [
        c.category,
        fmt(c.total),
        `${c.percent.toFixed(1)}%`,
        String(c.transaction_count),
      ])

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Amount', '%', 'Transactions']],
      body: catRows,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: () => drawHeaderBar(doc),
    })
    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ─── SUBSCRIPTIONS TABLE ─────────────────────────────────────
  const confirmedSubs = (results.subscriptions || []).filter(s => s.confidence >= 0.6)
  if (confirmedSubs.length > 0) {
    y = checkPageBreak(doc, y, 30)
    y = drawSectionTitle(doc, `Subscriptions (${confirmedSubs.length} detected)`, y)

    const subRows = confirmedSubs.map(s => [
      s.merchant,
      fmtPrecise(s.monthly_cost),
      fmt(s.annual_cost),
      s.last_date,
      s.reason,
    ])

    autoTable(doc, {
      startY: y,
      head: [['Merchant', 'Monthly', 'Annual', 'Last Date', 'Reason']],
      body: subRows,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 35 },
        4: { cellWidth: 50 },
      },
      didDrawPage: () => drawHeaderBar(doc),
    })
    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ─── EASY WINS TABLE ─────────────────────────────────────────
  if (results.easy_wins.length > 0) {
    y = checkPageBreak(doc, y, 30)
    y = drawSectionTitle(doc, 'Easy Wins', y)

    const winRows = results.easy_wins.map((w, i) => [
      String(i + 1),
      w.action,
      fmt(w.estimated_yearly_savings) + '/yr',
    ])

    autoTable(doc, {
      startY: y,
      head: [['#', 'Action', 'Est. Yearly Savings']],
      body: winRows,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 120 },
        2: { cellWidth: 40, halign: 'right' },
      },
      didDrawPage: () => drawHeaderBar(doc),
    })
    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ─── CHEAPER ALTERNATIVES TABLE ──────────────────────────────
  if (results.alternatives && results.alternatives.length > 0) {
    y = checkPageBreak(doc, y, 30)
    y = drawSectionTitle(doc, 'Cheaper Alternatives', y)

    const altRows = results.alternatives.map(a => [
      a.original,
      a.alternative,
      fmtPrecise(a.monthly_savings) + '/mo',
      a.note,
    ])

    autoTable(doc, {
      startY: y,
      head: [['Current', 'Alternative', 'Savings/mo', 'Note']],
      body: altRows,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        3: { cellWidth: 55 },
      },
      didDrawPage: () => drawHeaderBar(doc),
    })
    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ─── PRICE INCREASES TABLE ───────────────────────────────────
  if (results.price_changes && results.price_changes.length > 0) {
    y = checkPageBreak(doc, y, 30)
    y = drawSectionTitle(doc, 'Price Increases', y)

    const priceRows = results.price_changes.map(p => [
      p.merchant,
      `${fmtPrecise(p.old_price)} → ${fmtPrecise(p.new_price)}`,
      `+${fmtPrecise(p.increase)}`,
      fmt(p.yearly_impact) + '/yr',
    ])

    autoTable(doc, {
      startY: y,
      head: [['Merchant', 'Old → New', 'Increase', 'Yearly Impact']],
      body: priceRows,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: () => drawHeaderBar(doc),
    })
    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ─── RECOVERY PLAN ───────────────────────────────────────────
  if (results.recovery_plan.length > 0) {
    y = checkPageBreak(doc, y, 30)
    y = drawSectionTitle(doc, 'Recovery Plan', y)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)

    results.recovery_plan.forEach((step, i) => {
      y = checkPageBreak(doc, y, 10)
      const prefix = `${i + 1}. `
      const maxWidth = CONTENT_WIDTH - 6
      const lines = doc.splitTextToSize(prefix + step, maxWidth)
      doc.text(lines, PAGE_MARGIN + 3, y)
      y += lines.length * 4.5 + 2
    })
  }

  // ─── ADD FOOTERS TO ALL PAGES ────────────────────────────────
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    drawFooter(doc, i, totalPages)
  }

  // Save
  doc.save('leaky-wallet-report.pdf')
}
