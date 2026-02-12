import type { ProReportData } from './proReportTypes'
import type { jsPDF as jsPDFType } from 'jspdf'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESIGN TOKENS — consistent spacing & colors throughout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BRAND: [number, number, number] = [14, 165, 233]
const DANGER: [number, number, number] = [239, 68, 68]
const SUCCESS: [number, number, number] = [16, 185, 129]
const WARNING: [number, number, number] = [245, 158, 11]
const MUTED: [number, number, number] = [100, 116, 139]
const DARK: [number, number, number] = [15, 23, 42]
const LIGHT_BG: [number, number, number] = [248, 250, 252]
const WHITE: [number, number, number] = [255, 255, 255]

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 20
const CONTENT_W = PAGE_W - MARGIN * 2 // 170
const HEADER_H = 10
const FOOTER_Y = 285
const SAFE_BOTTOM = 272 // don't draw below this; leave room for footer

// Spacing constants — every gap in the document uses one of these
const GAP_XS = 3      // tight: after label before value
const GAP_SM = 5      // small: after body text, between bullets
const GAP_MD = 8      // medium: after tables, between subsections
const GAP_LG = 12     // large: between major sections
const GAP_XL = 16     // extra-large: after cover elements

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FORMATTERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function fmtD(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DRAWING PRIMITIVES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function drawHeader(doc: jsPDFType) {
  doc.setFillColor(...BRAND)
  doc.rect(0, 0, PAGE_W, HEADER_H, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...WHITE)
  doc.text('LEAKY WALLET', MARGIN, 7)
  doc.setFont('helvetica', 'normal')
  doc.text('PRO REPORT', PAGE_W - MARGIN, 7, { align: 'right' })
}

function drawFooter(doc: jsPDFType, page: number, total: number) {
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, FOOTER_Y - 3, PAGE_W - MARGIN, FOOTER_Y - 3)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  doc.text('For informational purposes only. Not financial advice.', MARGIN, FOOTER_Y)
  doc.text(`Page ${page} of ${total}`, PAGE_W - MARGIN, FOOTER_Y, { align: 'right' })
}

function newPage(doc: jsPDFType): number {
  doc.addPage()
  drawHeader(doc)
  return HEADER_H + GAP_MD
}

function needsBreak(doc: jsPDFType, y: number, needed: number): number {
  if (y + needed > SAFE_BOTTOM) return newPage(doc)
  return y
}

/** Major section title with brand-colored underline */
function sectionTitle(doc: jsPDFType, title: string, y: number): number {
  y = needsBreak(doc, y, 16)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text(title, MARGIN, y)
  y += 2.5
  doc.setDrawColor(...BRAND)
  doc.setLineWidth(0.6)
  doc.line(MARGIN, y, MARGIN + 45, y)
  return y + GAP_MD
}

/** Subsection heading — bold, slightly smaller */
function subHeading(doc: jsPDFType, text: string, y: number): number {
  y = needsBreak(doc, y, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text(text, MARGIN, y)
  return y + GAP_SM
}

/** Body paragraph — wraps text automatically */
function bodyText(doc: jsPDFType, text: string, y: number, indent = 0): number {
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  const lines = doc.splitTextToSize(text, CONTENT_W - indent)
  y = needsBreak(doc, y, lines.length * 4.2)
  doc.text(lines, MARGIN + indent, y)
  return y + lines.length * 4.2 + GAP_XS
}

/** Bullet point with wrapping text */
function bullet(doc: jsPDFType, text: string, y: number, indent = 0): number {
  y = needsBreak(doc, y, 8)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  doc.text('\u2022', MARGIN + indent + 2, y)
  const lines = doc.splitTextToSize(text, CONTENT_W - indent - 8)
  doc.text(lines, MARGIN + indent + 7, y)
  return y + lines.length * 3.8 + 2
}

/** Highlighted info/tip box with tinted background */
function infoBox(doc: jsPDFType, title: string, body: string, y: number, color: [number, number, number]): number {
  doc.setFontSize(8.5)
  const bodyLines = doc.splitTextToSize(body, CONTENT_W - 14)
  const boxH = 14 + bodyLines.length * 3.8
  y = needsBreak(doc, y, boxH + GAP_SM)

  // Tinted background
  const bg: [number, number, number] = [
    Math.round(255 - (255 - color[0]) * 0.08),
    Math.round(255 - (255 - color[1]) * 0.08),
    Math.round(255 - (255 - color[2]) * 0.08),
  ]
  doc.setFillColor(...bg)
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 2, 2, 'F')
  // Left accent bar
  doc.setFillColor(...color)
  doc.rect(MARGIN, y, 2.5, boxH, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...color)
  doc.text(title, MARGIN + 7, y + 7)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  doc.text(bodyLines, MARGIN + 7, y + 13)

  return y + boxH + GAP_MD
}

/** Standard autoTable theme for consistent look */
function tableTheme(headerColor: [number, number, number] = BRAND) {
  return {
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240] as [number, number, number], lineWidth: 0.2 },
    headStyles: { fillColor: headerColor, textColor: WHITE, fontStyle: 'bold' as const, cellPadding: 3.5 },
    alternateRowStyles: { fillColor: LIGHT_BG },
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN GENERATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function generateProPdf(report: ProReportData): Promise<Blob> {
  const jspdfModule = await import('jspdf')
  const autoTableModule = await import('jspdf-autotable')

  const jsPDF = jspdfModule.jsPDF || jspdfModule.default
  const autoTable = autoTableModule.autoTable || autoTableModule.default

  if (typeof autoTableModule.applyPlugin === 'function') {
    autoTableModule.applyPlugin(jsPDF)
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // ──────────────────────────────────────────────────────────
  // PAGE 1 — COVER & EXECUTIVE SUMMARY
  // ──────────────────────────────────────────────────────────
  drawHeader(doc)
  let y = HEADER_H + GAP_XL

  // Report title
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('Pro Spending Report', MARGIN, y)
  y += 10

  // PRO badge + date range
  doc.setFillColor(...BRAND)
  doc.roundedRect(MARGIN, y, 18, 6.5, 1.5, 1.5, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('PRO', MARGIN + 5, y + 4.5)

  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  doc.text(`Analysis period: ${report.period.start} to ${report.period.end}`, MARGIN + 22, y + 4.5)
  y += GAP_XL + 2

  // ── Health Score Card ──
  const hs = report.executive_summary.health_score
  const scoreColor: [number, number, number] = hs >= 60 ? SUCCESS : hs >= 40 ? WARNING : DANGER

  // Background card
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(MARGIN, y, CONTENT_W, 34, 3, 3, 'FD')

  // Left side — label
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  doc.text('FINANCIAL HEALTH SCORE', MARGIN + 8, y + 10)

  // Left side — large score
  doc.setFontSize(30)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...scoreColor)
  doc.text(`${hs}`, MARGIN + 8, y + 27)
  const scoreW = doc.getTextWidth(`${hs}`)

  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  doc.text('/ 100', MARGIN + 8 + scoreW + 2, y + 27)

  // Right side — health label + description
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...scoreColor)
  doc.text(report.executive_summary.health_label, MARGIN + 90, y + 14)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  const scoreDesc = doc.splitTextToSize('Based on subscription count, fees, delivery spending ratio, and overall patterns.', 72)
  doc.text(scoreDesc, MARGIN + 90, y + 21)

  y += 34 + GAP_LG

  // ── Headline + Paragraph ──
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  const headlineLines = doc.splitTextToSize(report.executive_summary.headline, CONTENT_W)
  doc.text(headlineLines, MARGIN, y)
  y += headlineLines.length * 6 + GAP_SM

  y = bodyText(doc, report.executive_summary.paragraph, y)
  y += GAP_SM

  // ── Key Metrics Table ──
  y = subHeading(doc, 'Key Metrics at a Glance', y)

  const totalSubs = report.subscription_insights.length
  const totalSubCost = report.subscription_insights.reduce((s, sub) => s + sub.monthly_cost, 0)
  const reviewSubs = report.subscription_insights.filter(s => s.roi_label !== 'Good value').length
  const easyActions = report.action_plan.filter(a => a.difficulty === 'easy').length
  const totalActionSavings = report.action_plan.reduce((s, a) => s + a.estimated_yearly_savings, 0)

  const metricsData = [
    ['Active Subscriptions', `${totalSubs} totaling ${fmtD(totalSubCost)}/mo (${fmt(totalSubCost * 12)}/yr)`],
    ['Needs Review', `${reviewSubs} subscription${reviewSubs !== 1 ? 's' : ''} flagged for review or cancellation`],
    ['Easy Wins', `${easyActions} quick action${easyActions !== 1 ? 's' : ''} you can take this week`],
    ['Savings Potential', `${fmt(totalActionSavings)}/yr if all recommended actions are taken`],
    ['Avg Daily Spend', `${fmtD(report.behavioral_insights.avg_daily_spend)} per day`],
    ['Peak Spending Day', report.behavioral_insights.peak_spending_day],
  ]

  autoTable(doc, {
    startY: y,
    body: metricsData,
    ...tableTheme(),
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold', textColor: DARK },
      1: { cellWidth: 130, textColor: DARK },
    },
    didDrawPage: () => drawHeader(doc),
  })
  y = (doc as any).lastAutoTable.finalY + GAP_LG

  // ──────────────────────────────────────────────────────────
  // MONTHLY SPENDING TRENDS
  // ──────────────────────────────────────────────────────────
  if (report.monthly_trends.length > 0) {
    y = needsBreak(doc, y, 40)
    y = sectionTitle(doc, 'Monthly Spending Trends', y)
    y = bodyText(doc, 'Total monthly spend over the analysis period. Use this to identify seasonal patterns and track progress.', y)
    y += GAP_XS

    const categories = Object.keys(report.monthly_trends[0].by_category).slice(0, 5)
    const trendHead = ['Month', 'Total', ...categories.map(c => c.length > 12 ? c.slice(0, 11) + '.' : c)]
    const trendRows = report.monthly_trends.map(t => {
      const row = [t.month, fmtD(t.total_spend)]
      for (const cat of categories) {
        row.push(t.by_category[cat] ? fmt(t.by_category[cat]) : '-')
      }
      return row
    })

    const colStyles: Record<number, object> = {
      0: { cellWidth: 22 },
      1: { cellWidth: 24, halign: 'right' as const, fontStyle: 'bold' as const },
    }
    categories.forEach((_, i) => {
      colStyles[i + 2] = { cellWidth: Math.floor(124 / categories.length), halign: 'right' as const }
    })

    autoTable(doc, {
      startY: y,
      head: [trendHead],
      body: trendRows,
      ...tableTheme(),
      styles: { fontSize: 7.5, cellPadding: 2.5, lineColor: [226, 232, 240] as [number, number, number], lineWidth: 0.2 },
      columnStyles: colStyles,
      didDrawPage: () => drawHeader(doc),
    })
    y = (doc as any).lastAutoTable.finalY + GAP_MD

    // Trend analysis box
    if (report.monthly_trends.length >= 2) {
      const first = report.monthly_trends[0].total_spend
      const last = report.monthly_trends[report.monthly_trends.length - 1].total_spend
      const diff = last - first
      const pct = ((diff / first) * 100).toFixed(1)
      const direction = diff > 0 ? 'increased' : 'decreased'
      y = infoBox(doc, 'Trend Analysis',
        `Your spending ${direction} by ${fmtD(Math.abs(diff))} (${Math.abs(Number(pct))}%) from the first to last month analyzed. ` +
        (diff > 0 ? 'Consider setting monthly spending caps to reverse this trend.' : 'Great progress — maintain this trajectory.'),
        y, diff > 0 ? WARNING : SUCCESS)
    }
    y += GAP_XS
  }

  // ──────────────────────────────────────────────────────────
  // SUBSCRIPTION ROI ANALYSIS
  // ──────────────────────────────────────────────────────────
  if (report.subscription_insights.length > 0) {
    y = needsBreak(doc, y, 40)
    y = sectionTitle(doc, 'Subscription ROI Analysis', y)
    y = bodyText(doc, `You have ${totalSubs} active subscriptions costing ${fmtD(totalSubCost)}/mo (${fmt(totalSubCost * 12)}/yr). Each is evaluated for usage and value.`, y)
    y += GAP_XS

    const subRows = report.subscription_insights.map(s => [
      s.merchant,
      fmtD(s.monthly_cost),
      fmt(s.annual_cost),
      s.usage_estimate,
      s.roi_label,
    ])

    autoTable(doc, {
      startY: y,
      head: [['Subscription', 'Monthly', 'Annual', 'Usage', 'Verdict']],
      body: subRows,
      ...tableTheme(),
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 22, halign: 'right' },
        2: { cellWidth: 22, halign: 'right' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 35 },
      },
      didDrawPage: () => drawHeader(doc),
    })
    y = (doc as any).lastAutoTable.finalY + GAP_MD

    // Individual recommendations
    y = subHeading(doc, 'Subscription Recommendations', y)
    for (const sub of report.subscription_insights) {
      y = bullet(doc, `${sub.merchant} (${fmtD(sub.monthly_cost)}/mo): ${sub.recommendation}`, y)
    }
    y += GAP_LG
  }

  // ──────────────────────────────────────────────────────────
  // PROJECTED SAVINGS
  // ──────────────────────────────────────────────────────────
  y = needsBreak(doc, y, 55)
  y = sectionTitle(doc, 'Projected Savings Timeline', y)
  y = bodyText(doc, 'These projections assume you implement the recommended actions in their suggested timeframes. Actual savings depend on your individual circumstances.', y)
  y += GAP_SM

  // Three projection cards
  const boxW = (CONTENT_W - GAP_MD * 2) / 3
  const boxH = 28
  const projections = [
    { label: '3 Months', value: report.savings_projection.month_3 },
    { label: '6 Months', value: report.savings_projection.month_6 },
    { label: '12 Months', value: report.savings_projection.month_12 },
  ]

  projections.forEach((p, i) => {
    const x = MARGIN + i * (boxW + GAP_MD)
    // Card background
    doc.setFillColor(209, 250, 229)
    doc.setDrawColor(134, 239, 172)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, boxW, boxH, 2, 2, 'FD')
    // Label
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text(p.label, x + boxW / 2, y + 10, { align: 'center' })
    // Value
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...SUCCESS)
    doc.text(fmt(p.value), x + boxW / 2, y + 22, { align: 'center' })
  })
  y += boxH + GAP_MD

  // Assumptions
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...MUTED)
  for (const a of report.savings_projection.assumptions) {
    y = needsBreak(doc, y, 5)
    doc.text(`\u2022  ${a}`, MARGIN + 2, y)
    y += 4
  }
  y += GAP_LG

  // ──────────────────────────────────────────────────────────
  // PRIORITY ACTION PLAN
  // ──────────────────────────────────────────────────────────
  if (report.action_plan.length > 0) {
    y = needsBreak(doc, y, 40)
    y = sectionTitle(doc, 'Priority Action Plan', y)
    y = bodyText(doc, 'Actions ranked by estimated yearly savings. Start with the highest-priority items for maximum impact.', y)
    y += GAP_XS

    const actionRows = report.action_plan.map(a => [
      `#${a.priority}`,
      a.title,
      a.difficulty.charAt(0).toUpperCase() + a.difficulty.slice(1),
      a.timeframe,
      fmtD(a.estimated_monthly_savings) + '/mo',
      fmt(a.estimated_yearly_savings) + '/yr',
    ])

    autoTable(doc, {
      startY: y,
      head: [['#', 'Action', 'Difficulty', 'Timeframe', 'Monthly', 'Yearly']],
      body: actionRows,
      ...tableTheme(SUCCESS),
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 52 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 26 },
        4: { cellWidth: 26, halign: 'right' },
        5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
      },
      didDrawPage: () => drawHeader(doc),
    })
    y = (doc as any).lastAutoTable.finalY + GAP_MD

    // Step-by-step details
    y = subHeading(doc, 'Step-by-Step Action Details', y)
    for (const action of report.action_plan) {
      y = needsBreak(doc, y, 18)

      // Action title
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...DARK)
      doc.text(`#${action.priority}  ${action.title}`, MARGIN + 3, y)
      y += 5

      // Description
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...MUTED)
      const descText = `${action.description}  \u2014  Save ${fmt(action.estimated_yearly_savings)}/yr  |  ${action.difficulty} difficulty  |  ${action.timeframe}`
      const descLines = doc.splitTextToSize(descText, CONTENT_W - 10)
      y = needsBreak(doc, y, descLines.length * 3.5)
      doc.text(descLines, MARGIN + 6, y)
      y += descLines.length * 3.5 + GAP_SM
    }
    y += GAP_SM
  }

  // ──────────────────────────────────────────────────────────
  // BEHAVIORAL INSIGHTS
  // ──────────────────────────────────────────────────────────
  y = needsBreak(doc, y, 50)
  y = sectionTitle(doc, 'Behavioral Insights', y)
  y = bodyText(doc, 'Understanding your spending behavior is the first step to changing it. These patterns were detected from your transaction data.', y)
  y += GAP_XS

  const bi = report.behavioral_insights
  const biData: string[][] = [
    ['Peak Spending Day', bi.peak_spending_day, 'The day you tend to spend the most'],
    ['Avg Daily Spend', fmtD(bi.avg_daily_spend), `${fmtD(bi.avg_daily_spend * 365)} per year`],
    ['Avg Weekly Spend', fmtD(bi.avg_weekly_spend), 'Track weekly to stay on budget'],
    ['Impulse Spending', fmtD(bi.impulse_spend_estimate), 'Small frequent purchases that add up'],
  ]

  if (bi.top_impulse_merchants.length > 0) {
    biData.push(['Top Impulse Merchants', bi.top_impulse_merchants.join(', '), 'Where small purchases accumulate fastest'])
  }
  biData.push(['Spending Pattern', bi.spending_velocity, ''])

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value', 'What This Means']],
    body: biData,
    ...tableTheme(MUTED),
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold' },
      1: { cellWidth: 45 },
      2: { cellWidth: 87, textColor: MUTED, fontStyle: 'italic' },
    },
    didDrawPage: () => drawHeader(doc),
  })
  y = (doc as any).lastAutoTable.finalY + GAP_MD

  y = infoBox(doc, 'Behavioral Tip',
    `Your peak spending day is ${bi.peak_spending_day}. Try the "24-hour rule" \u2014 before any non-essential purchase over $25, wait 24 hours. ` +
    `Set a daily spending alert of ${fmtD(bi.avg_daily_spend * 0.8)} (20% below your average) to build awareness.`,
    y, BRAND)

  // ──────────────────────────────────────────────────────────
  // CATEGORY DEEP DIVES
  // ──────────────────────────────────────────────────────────
  if (report.category_deep_dives.length > 0) {
    y = needsBreak(doc, y, 40)
    y = sectionTitle(doc, 'Category-by-Category Analysis', y)
    y = bodyText(doc, 'Each spending category analyzed for total spend, trends, and top merchants with personalized insights.', y)
    y += GAP_XS

    // Summary table
    const catRows = report.category_deep_dives.map(cat => {
      const arrow = cat.trend === 'increasing' ? '\u2191' : cat.trend === 'decreasing' ? '\u2193' : '\u2192'
      return [
        cat.category,
        fmtD(cat.total),
        `${cat.percent}%`,
        fmtD(cat.monthly_average) + '/mo',
        `${arrow} ${cat.trend_percent > 0 ? '+' : ''}${cat.trend_percent.toFixed(1)}%`,
      ]
    })

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Total', '% Share', 'Monthly Avg', 'Trend']],
      body: catRows,
      ...tableTheme(),
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 32, halign: 'right' },
        4: { cellWidth: 30, halign: 'center' },
      },
      didDrawPage: () => drawHeader(doc),
    })
    y = (doc as any).lastAutoTable.finalY + GAP_LG

    // Per-category detail
    for (const cat of report.category_deep_dives) {
      y = needsBreak(doc, y, 40)
      y = subHeading(doc, `${cat.category}  \u2014  ${fmtD(cat.total)} (${cat.percent}%)`, y)

      // Merchant mini-table
      if (cat.top_merchants.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [['Merchant', 'Total Spent', 'Transactions']],
          body: cat.top_merchants.map(m => [m.name, fmtD(m.total), String(m.count)]),
          margin: { left: MARGIN + 4, right: MARGIN + 4 },
          styles: { fontSize: 7.5, cellPadding: 2.5, lineColor: [226, 232, 240] as [number, number, number], lineWidth: 0.2 },
          headStyles: { fillColor: MUTED, textColor: WHITE, fontStyle: 'bold' as const, cellPadding: 3 },
          alternateRowStyles: { fillColor: LIGHT_BG },
          didDrawPage: () => drawHeader(doc),
        })
        y = (doc as any).lastAutoTable.finalY + GAP_SM
      }

      y = bullet(doc, `Insight: ${cat.insight}`, y, 2)
      y = bullet(doc, `Action: ${cat.recommendation}`, y, 2)
      y += GAP_MD
    }
  }

  // ──────────────────────────────────────────────────────────
  // 12-WEEK ROADMAP
  // ──────────────────────────────────────────────────────────
  y = needsBreak(doc, y, 60)
  y = sectionTitle(doc, 'What To Do Next \u2014 Your 12-Week Roadmap', y)
  y = bodyText(doc, 'Your action plan broken into a manageable week-by-week schedule. One focused task per week to avoid overwhelm.', y)
  y += GAP_XS

  const weeklyActions = report.action_plan.filter(a => a.timeframe === 'This week')
  const monthlyActions = report.action_plan.filter(a => a.timeframe === 'This month')
  const quarterActions = report.action_plan.filter(a => a.timeframe === 'Next 3 months')

  const roadmap: string[][] = []

  if (weeklyActions.length > 0) {
    roadmap.push(['Week 1', `Quick wins: ${weeklyActions.map(a => a.title).join('; ')}`, fmt(weeklyActions.reduce((s, a) => s + a.estimated_yearly_savings, 0)) + '/yr'])
  }
  roadmap.push(['Week 2', 'Set up spending tracking (app, spreadsheet, or notebook). Review all subscriptions and mark which to keep or cancel.', '-'])

  if (monthlyActions.length > 0) {
    const half1 = monthlyActions.slice(0, Math.ceil(monthlyActions.length / 2))
    const half2 = monthlyActions.slice(Math.ceil(monthlyActions.length / 2))
    if (half1.length > 0) {
      roadmap.push(['Week 3', `Start: ${half1.map(a => a.title).join('; ')}`, fmt(half1.reduce((s, a) => s + a.estimated_yearly_savings, 0)) + '/yr'])
    }
    if (half2.length > 0) {
      roadmap.push(['Week 4', `Continue: ${half2.map(a => a.title).join('; ')}`, fmt(half2.reduce((s, a) => s + a.estimated_yearly_savings, 0)) + '/yr'])
    }
  }

  roadmap.push(['Week 5\u20136', 'Review progress. Check bank statement for cancelled subscriptions still charging. Contact providers if needed.', '-'])
  roadmap.push(['Week 7\u20138', 'Set monthly budgets per category based on your averages. Reduce your top 2 categories by 10%.', '-'])

  if (quarterActions.length > 0) {
    roadmap.push(['Week 9\u201310', `Longer-term changes: ${quarterActions.map(a => a.title).join('; ')}`, fmt(quarterActions.reduce((s, a) => s + a.estimated_yearly_savings, 0)) + '/yr'])
  }
  roadmap.push(['Week 11', 'Automate savings: set up automatic transfer of estimated monthly savings to a separate account.', '-'])
  roadmap.push(['Week 12', `Re-run your spending analysis to measure progress. Target: health score above ${Math.min(hs + 20, 100)}/100.`, '-'])

  autoTable(doc, {
    startY: y,
    head: [['When', 'What to Do', 'Savings']],
    body: roadmap,
    ...tableTheme(SUCCESS),
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 120 },
      2: { cellWidth: 24, halign: 'right' },
    },
    didDrawPage: () => drawHeader(doc),
  })
  y = (doc as any).lastAutoTable.finalY + GAP_MD

  y = infoBox(doc, 'The 50/30/20 Rule',
    'A widely-used budgeting guideline: 50% of income for needs (rent, groceries, utilities), 30% for wants (dining, entertainment, subscriptions), ' +
    '20% for savings and debt repayment. Compare your category percentages above to see where you stand.',
    y, BRAND)

  // ──────────────────────────────────────────────────────────
  // EVIDENCE APPENDIX
  // ──────────────────────────────────────────────────────────
  if (report.evidence.subscription_transactions.length > 0) {
    y = needsBreak(doc, y, 35)
    y = sectionTitle(doc, 'Appendix A: Subscription Evidence', y)
    y = bodyText(doc, 'Detected recurring charges with charge dates, confirming each subscription identified in this report.', y)
    y += GAP_XS

    const subTxRows = report.evidence.subscription_transactions.map(s => [
      s.merchant,
      `${s.dates.length}`,
      s.dates.length > 0 ? s.dates[0] : '-',
      s.dates.length > 0 ? s.dates[s.dates.length - 1] : '-',
      s.amounts.length > 0 ? fmtD(s.amounts[0]) : '-',
    ])

    autoTable(doc, {
      startY: y,
      head: [['Merchant', 'Charges', 'First Date', 'Latest Date', 'Amount']],
      body: subTxRows,
      ...tableTheme(MUTED),
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 28, halign: 'right' },
      },
      didDrawPage: () => drawHeader(doc),
    })
    y = (doc as any).lastAutoTable.finalY + GAP_LG
  }

  if (report.evidence.top_50_transactions.length > 0) {
    y = needsBreak(doc, y, 35)
    y = sectionTitle(doc, 'Appendix B: Largest Transactions', y)

    const txnRows = report.evidence.top_50_transactions.map(t => [
      t.date,
      t.merchant,
      t.category,
      fmtD(t.amount),
    ])

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Merchant', 'Category', 'Amount']],
      body: txnRows,
      ...tableTheme(MUTED),
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 60 },
        2: { cellWidth: 40 },
        3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      },
      didDrawPage: () => drawHeader(doc),
    })
    y = (doc as any).lastAutoTable.finalY + GAP_LG
  }

  // ──────────────────────────────────────────────────────────
  // IMPORTANT NOTICES
  // ──────────────────────────────────────────────────────────
  y = needsBreak(doc, y, 70)
  y = sectionTitle(doc, 'Important Notices', y)

  const disclaimers = [
    'This report is generated by automated analysis of bank statement transaction data and is provided for general informational and educational purposes only.',
    'This report does not constitute financial advice, investment advice, tax advice, or any other form of professional advice. The analysis, scores, projections, and recommendations are based on algorithmic pattern detection and should not be relied upon as a substitute for professional financial guidance.',
    'Projected savings are estimates based on assumptions stated in this report. Actual results will vary based on individual circumstances, market conditions, and whether actions are fully implemented.',
    'The Financial Health Score is a proprietary metric based on spending pattern analysis. It is not an official financial rating and should not be compared to credit scores or other regulated financial metrics.',
    'Before making any financial decisions \u2014 including cancelling subscriptions, switching service providers, or changing banking arrangements \u2014 consider your individual circumstances and consult with a licensed financial adviser if appropriate.',
    'No personal financial data was stored, retained, or shared in the generation of this report. Transaction data was processed temporarily in memory and deleted immediately after analysis.',
    'Leaky Wallet and its operators accept no liability for any loss or damage arising from the use of this report or reliance on its contents.',
  ]

  for (const d of disclaimers) {
    y = bullet(doc, d, y)
  }

  y += GAP_MD
  y = needsBreak(doc, y, 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...MUTED)
  doc.text(
    `Report generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} by Leaky Wallet Pro.`,
    MARGIN, y
  )

  // ──────────────────────────────────────────────────────────
  // FOOTERS ON ALL PAGES
  // ──────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    drawFooter(doc, i, totalPages)
  }

  doc.save('leaky-wallet-pro-report.pdf')
  return doc.output('blob')
}
