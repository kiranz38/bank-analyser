# Affiliate Alternatives System

The affiliate alternatives layer enriches the backend's cheaper-alternative recommendations with tracking links, provider metadata, and compliance disclosures.

## Architecture

```
Backend (alternatives.json) → API response (Alternative[])
  → affiliateMatching.enrichAlternatives()
    → affiliateRegistry (provider lookup)
    → AffiliateAlternatives component (UI)
    → /api/redirect (safe redirect endpoint)
```

## Adding a New Provider

Edit `frontend/lib/affiliateRegistry.ts` and add an entry to the `PROVIDERS` array:

```ts
{
  providerId: 'my-service',        // Unique slug
  name: 'My Service',              // Display name
  categoryTags: ['streaming'],     // Match backend category
  baseUrl: 'https://myservice.com',
  affiliateUrl: 'https://myservice.com/?ref=leakywallet', // or null
  network: 'generic',              // 'generic' | 'impact' | 'cj' | 'partnerstack' | 'shareasale'
  countryAvailability: ['US'],     // or ['*'] for all
  isActive: true,
  priority: 50,                    // 0-100, higher = preferred
  terms: '$9.99/mo',               // Short pricing summary
  matchNames: ['my service'],      // Lowercase aliases for matching
}
```

**Important:** `matchNames` must be unique across all providers. Run `npm test` to verify.

## Environment Flags

| Flag | Default | Description |
|------|---------|-------------|
| `NEXT_PUBLIC_AFFILIATE_ENABLED` | `true` | Master switch for affiliate links |
| `NEXT_PUBLIC_AFFILIATE_GATING_ENABLED` | `false` | Gate alternatives behind Pro purchase |

## Gating Behavior

When `NEXT_PUBLIC_AFFILIATE_GATING_ENABLED=true`:
- Free users see the 1st alternative fully; the rest have savings blurred and CTA locked
- Pro users and demo mode see everything
- When disabled (default): all alternatives are visible to everyone

## Compliance

The component renders FTC-compliant disclosures automatically:
- **Disclosure banner** (shown when any affiliate link is present): "We may earn a commission at no extra cost to you."
- **Footer note**: "Alternatives are generated algorithmically based on category and pricing."
- **Report link**: "Report incorrect alternative" mailto button

## Analytics Events

| Event | Fires When | Params |
|-------|-----------|--------|
| `alternatives_viewed` | Section expanded | `count` |
| `alternatives_clicked` | CTA link clicked | `original_service`, `alternative_service`, `potential_savings` |
| `affiliate_link_impression` | Section expanded | `count`, `is_pro`, `affiliate_count` |
| `affiliate_link_click` | Affiliate CTA clicked | `provider_id`, `network`, `is_pro`, `placement` |
| `affiliate_modal_shown` | Gating modal opens | — |

## Redirect Endpoint

`GET /api/redirect?pid=<providerId>`

- Only accepts registered provider IDs (not arbitrary URLs)
- Returns 302 redirect with `Cache-Control: public, max-age=300`
- Uses affiliate URL if available, falls back to base URL
- Returns 400 for missing/invalid pid, 404 for unknown/inactive providers

## Key Constraints

1. Never injects alternatives not in the backend response
2. Never filters out alternatives just because they lack an affiliate
3. All alternatives from the backend are preserved and displayed
4. Ranking is additive scoring, not filtering
