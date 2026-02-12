# Pro Report Quality Gate

## Overview

The Pro Report pipeline includes a multi-layer quality gate to prevent NaN values, empty tables, and nonsensical content from appearing in the generated PDF.

**Pipeline flow:**
```
AnalysisResult
  → generateProReportWithWarnings()     // Milestone A: safe numeric helpers
  → validateReportData()                // Milestone B: Zod schema + invariants
  → runReportQa()                       // Milestone C: Claude AI sanity check (feature-flagged)
  → applyQaResult()                     // Merge omissions
  → generateProPdf(finalReport, opts)   // Milestone D: hardened PDF renderer
```

## Milestones

### A — Safe Numeric Helpers (`lib/numberSafe.ts`)
- `safeNumber(x, fallback, field)` — coerces any value to finite number, tracks warnings
- `safeDivide(num, denom, fallback)` — division by zero protection
- `safePercent(num, denom)` — safe percentage calculation
- `safeCurrency(amount)` — single formatter entry point, never returns `$NaN`
- `safeFixed(value, decimals)` — `.toFixed()` that never returns `"NaN"`
- `clamp(value, min, max)` — bounds enforcement
- Warning collector: `resetWarnings()`, `getWarnings()` for downstream reporting

### B — Schema Validation (`lib/reportValidation.ts`)
- **Zod schema** with `finiteNumber` refinement on every numeric field
- **Section-level validation**: invalid sections get replaced with safe defaults, not rejected entirely
- **Invariant checks** (10 rules):
  - Savings monotonically increasing
  - Health score/label alignment
  - Category percentages ≈ 100%
  - Subscription annual = monthly × 12
  - Action plan yearly ≈ monthly × 12
  - No `$NaN` in executive summary
  - Period dates not inverted
  - Unique monthly trend months
  - Contiguous action priorities
- **`validateReportData()`** returns `{ valid, schemaErrors, invariantViolations, failedSections, safeData }`

### C — Claude AI QA (`lib/reportQaClaude.ts` + `app/api/report-qa/route.ts`)
- **Feature flag**: `NEXT_PUBLIC_REPORT_QA_ENABLED=true` (off by default)
- **Privacy**: Only a redacted summary is sent — no raw transactions, no PII, merchant names truncated to 15 chars, no dates more granular than month
- **Claude's role**: flag suspicious relationships, recommend section omissions, generate narrative bullets. Claude CANNOT change numbers.
- **Strict JSON schema** for Claude response: `{ pass, severity, omitSections, notesForUser, narrativeBullets, checks }`
- **Failure handling**: If Claude times out (15s) or returns invalid JSON, default to `pass=true` with no narrative — validated numeric PDF still generates
- **Safe Mode**: If `pass=false` or `severity=high`, omitted sections are applied and a Data Quality banner is shown

### D — PDF Hardening (`lib/generateProPdf.ts`)
- **Single formatters**: `fmt()`, `fmtD()` always return `$0` / `$0.00` for non-finite inputs
- **`cell()` helper**: Returns `—` dash for null/undefined/NaN/empty string values in table cells
- **Safe Mode banner**: Shown at top of PDF when sections are omitted
- **Data Quality page**: Added before Important Notices when warnings or omissions exist; shows omitted sections, grouped warning counts (no PII), and tips for better uploads
- **Narrative bullets**: Claude's AI-generated key findings shown after executive summary

### E — Tests
- **85 tests** across 6 test files
- `numberSafe.test.ts` — 33 tests for every helper function
- `reportValidation.test.ts` — 19 tests for schema, invariants, and validation gate
- `proReportGenerator.test.ts` — 10 tests for NaN prevention in generation
- `reportQaClaude.test.ts` — 9 tests for redacted summary builder and QA application
- `fullPipeline.test.ts` — 9 integration tests simulating the complete flow with minimal, realistic, sparse (WpStat-like), and poison data

### F — Observability
- **Structured console log** `[ProReport]` with: valid, qa_pass, severity, omitted_sections_count, warnings_count, safe_mode, section_counts (no PII)
- **GA4 event** `pro_report_quality_gate` fired when validation fails, QA fails, or sections are omitted

## Privacy Rules

1. **No raw transactions** are ever sent to Claude or logged
2. **Merchant names** are truncated to 15 characters in the redacted summary
3. **No dates** more granular than month (YYYY-MM) are included in QA payloads
4. **Warnings** logged by field group name only (e.g., "3 issues in sub fields"), never raw values
5. **GA events** contain only counts and boolean flags, never amounts or names

## Configuration

| Env Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_REPORT_QA_ENABLED` | `false` | Enable Claude AI quality check |
| `ANTHROPIC_API_KEY` | — | Required if QA enabled (server-side only) |

## File Map

```
frontend/lib/
  numberSafe.ts          — Safe numeric helpers + warning collector
  reportValidation.ts    — Zod schema + invariant checks + validation gate
  reportQaClaude.ts      — Redacted summary builder + Claude QA client + result applier
  generateProPdf.ts      — Hardened PDF generator with quality metadata support
  proReportGenerator.ts  — Report data assembly (all math uses safe helpers)
  proReportTypes.ts      — TypeScript interfaces for ProReportData

frontend/app/api/
  report-qa/route.ts     — Server-side Claude API proxy for QA checks

frontend/lib/__tests__/
  numberSafe.test.ts
  reportValidation.test.ts
  proReportGenerator.test.ts
  reportQaClaude.test.ts
  fullPipeline.test.ts
```
