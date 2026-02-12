import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/report-qa
 *
 * Receives a redacted report summary and sends it to Claude
 * for quality-assurance checks. Returns structured JSON with
 * pass/fail, severity, and section omission recommendations.
 *
 * No PII or raw transactions are sent — only aggregated summaries.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

const SYSTEM_PROMPT = `You are a financial report quality auditor. You receive a REDACTED statistical summary of a consumer spending report (no raw transactions, no PII).

Your job:
1. Check if the numbers are internally consistent and plausible.
2. Flag any section that should be OMITTED from the final PDF because the data backing it is clearly insufficient or contradictory.
3. Provide brief user-friendly notes.

RULES:
- You MUST NOT invent or change any numbers.
- You MUST NOT reference specific transactions, dates, or personal details.
- If subscription count is 0 but the report mentions subscription costs, flag subscription_insights for omission.
- If there are 0 categories and 0 monthly data, flag those sections.
- If health score doesn't match the label range (0-39=Needs Attention, 40-59=Fair, 60-79=Good, 80-100=Excellent), flag it.
- If projected savings are unrealistically high (>50% of total annual spend), flag savings_projection.
- If any category percent sums are wildly off from 100%, flag category_deep_dives.
- If monthly trends show 0 spend for all months, flag monthly_trends.
- If there are 0 actions but savings projection is non-zero, flag savings_projection.
- If subscriptionCount is 0, omit subscription_insights.

Respond with ONLY valid JSON matching this exact schema (no markdown, no code fences):
{
  "pass": boolean,
  "severity": "low" | "medium" | "high",
  "omitSections": string[],
  "notesForUser": string,
  "narrativeBullets": string[],
  "checks": [{"rule": string, "result": "ok" | "warn" | "fail", "detail": string}]
}

omitSections values must only be from: subscription_insights, savings_projection, action_plan, behavioral_insights, category_deep_dives, monthly_trends
Keep notesForUser under 200 characters.
narrativeBullets should be 2-5 plain-English bullet points summarizing key findings.
Set pass=false and severity=high if multiple critical checks fail.`

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 },
    )
  }

  let body: { summary: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.summary || typeof body.summary !== 'object') {
    return NextResponse.json({ error: 'Missing summary object' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000) // 20s server-side timeout

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Please QA-check this report summary and respond with JSON only:\n\n${JSON.stringify(body.summary, null, 2)}`,
          },
        ],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errText = await response.text().catch(() => 'unknown')
      console.error('[ReportQA] Claude API error:', response.status, errText)
      return NextResponse.json(
        { error: `Claude API error: ${response.status}` },
        { status: 502 },
      )
    }

    const data = await response.json()
    const content = data?.content?.[0]?.text

    if (!content) {
      return NextResponse.json(
        { error: 'Empty response from Claude' },
        { status: 502 },
      )
    }

    // Parse Claude's JSON response (strip markdown fences if present)
    const cleaned = content.replace(/^```json?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[ReportQA] Error:', msg)

    if (msg.includes('abort')) {
      return NextResponse.json({ error: 'QA check timed out' }, { status: 504 })
    }

    return NextResponse.json({ error: `QA check failed: ${msg}` }, { status: 500 })
  }
}
