# Analytics Verification Guide

**Last Updated:** February 2026
**GA4 Property:** G-BD8VF1JPDZ

---

## Overview

This document describes the GA4 event tracking implementation for Leaky Wallet (whereismymoneygo.com). All events are sent via the `gtag` API.

---

## Event Inventory

### Conversion Events (Primary KPIs)

| Event Name | Description | Parameters | Trigger |
|------------|-------------|------------|---------|
| `analysis_generated` | **PRIMARY CONVERSION** - User received spending analysis | `monthly_leak`, `annual_savings`, `subscription_count` | After successful API response |
| `plaid_link_success` | User successfully connected bank account | - | Plaid callback success |

### Funnel Events

| Event Name | Description | Parameters | Trigger |
|------------|-------------|------------|---------|
| `cta_find_money_leaks_clicked` | Hero CTA clicked | - | Click on main CTA button |
| `method_upload_selected` | User chose upload method | - | Click upload option in MethodChooser |
| `method_bankconnect_selected` | User chose bank connect | - | Click bank connect option |
| `upload_started` | File/text upload initiated | `filename`, `file_size`, `upload_type` | Form submission |
| `upload_completed` | Files parsed successfully | `file_count`, `total_transactions` | After parsing, before analysis |
| `results_viewed` | Results section displayed | - | Results component mounted |

### Engagement Events

| Event Name | Description | Parameters | Trigger |
|------------|-------------|------------|---------|
| `recurring_detected` | Subscriptions found | `count` | Results with subscriptions |
| `category_viewed` | Category breakdown shown | `categories`, `count` | SpendingBreakdown rendered |
| `alternatives_viewed` | Cheaper alternatives shown | `count` | AlternativesPanel rendered |
| `alternatives_clicked` | User clicked an alternative | `original_service`, `alternative_service`, `potential_savings` | Click on alternative option |
| `price_changes_viewed` | Price increase alerts shown | `count`, `total_yearly_impact` | PriceChangesPanel rendered |
| `duplicates_viewed` | Duplicate subs shown | `category_count`, `total_monthly` | DuplicateSubscriptionsPanel rendered |
| `share_card_generated` | Share summary created | `annual_savings` | ShareCard rendered |
| `share_clicked` | Share button clicked | `platform` | Click share button |

### Bank Connect Events

| Event Name | Description | Parameters | Trigger |
|------------|-------------|------------|---------|
| `waitlist_submitted` | Joined bank connect waitlist | `country` | Waitlist form submission |
| `plaid_link_opened` | Plaid Link modal opened | - | Plaid Link init |
| `plaid_link_exit` | User closed Plaid without completing | `reason` | Plaid onExit callback |

### Feedback Events

| Event Name | Description | Parameters | Trigger |
|------------|-------------|------------|---------|
| `feedback_submitted` | User submitted feedback | `rating`, `has_comment` | Feedback form submission |

---

## Implementation Details

### Analytics Wrapper

All events go through `frontend/lib/analytics.ts`:

```typescript
export function trackEvent(eventName: string, params?: EventParams): void {
  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, params || '')
  }

  // GA4 tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}
```

### File Locations

| Component | Events Tracked |
|-----------|----------------|
| `app/page.tsx` | `cta_find_money_leaks_clicked`, `upload_started`, `upload_completed`, `analysis_generated`, `results_viewed`, `recurring_detected` |
| `components/MethodChooser.tsx` | `method_upload_selected`, `method_bankconnect_selected` |
| `components/ResultCards.tsx` | `category_viewed`, `share_card_generated`, `share_clicked`, `alternatives_viewed`, `price_changes_viewed`, `duplicates_viewed` |
| `components/AlternativesPanel.tsx` | `alternatives_clicked` |
| `components/WaitlistForm.tsx` | `waitlist_submitted` |

---

## Verification Steps

### Development Testing

1. Open browser DevTools Console
2. Navigate to the app
3. Perform actions and verify console logs:
   ```
   [Analytics] cta_find_money_leaks_clicked
   [Analytics] method_upload_selected
   [Analytics] upload_started {filename: "statement.csv", file_size: 12345, upload_type: "file"}
   ```

### GA4 DebugView Testing

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) extension
2. Enable debug mode
3. Open GA4 > Admin > DebugView
4. Perform user actions
5. Verify events appear in real-time

### Production Verification

1. Go to GA4 > Reports > Realtime
2. Perform test conversion
3. Verify events appear within 30 seconds

---

## Funnel Configuration

### Recommended GA4 Funnel

Create a funnel in GA4 Explore with these steps:

1. `cta_find_money_leaks_clicked` - Clicked main CTA
2. `method_upload_selected` OR `method_bankconnect_selected` - Chose method
3. `upload_started` - Started upload
4. `upload_completed` - Upload successful
5. `analysis_generated` - Got results (CONVERSION)

### Drop-off Analysis

Monitor these key transitions:
- CTA → Method selection (friction in method chooser?)
- Method → Upload start (confusion about file format?)
- Upload → Completion (parsing errors?)
- Completion → Analysis (API errors?)

---

## Ad Blocker Considerations

Many users have ad blockers that may block GA4 tracking. Current mitigations:

1. **Console logging** - Events always log to console for debugging
2. **Graceful degradation** - App works fully without analytics

### Future Options (Not Implemented)

- Server-side tracking via Measurement Protocol
- First-party proxy for gtag.js
- Privacy-respecting alternatives (Plausible, Fathom)

---

## Event Parameters Reference

### Naming Conventions

- Use `snake_case` for event names and parameters
- Prefix internal events with category (e.g., `plaid_link_success`)
- Keep parameter names under 40 characters

### Parameter Types

| Type | GA4 Handling |
|------|--------------|
| `string` | Text dimension |
| `number` | Numeric metric |
| `boolean` | Converted to "true"/"false" string |

---

## Debugging Tips

### Event Not Firing?

1. Check if `window.gtag` exists
2. Verify GA4 script loaded (check Network tab)
3. Check for ad blocker interference
4. Verify event name matches exactly

### Event Firing But Not in GA4?

1. Wait 24-48 hours for processing
2. Check DebugView for real-time data
3. Verify property ID matches
4. Check for data filters in GA4 settings

### Parameters Missing?

1. Ensure parameters are primitives (string/number/boolean)
2. Check parameter name length (max 40 chars)
3. Verify no undefined values

---

## Changelog

| Date | Change |
|------|--------|
| Feb 2026 | Initial implementation with all Milestone 5 events |
| Feb 2026 | Added Milestone 4 events (alternatives, price changes, duplicates) |
