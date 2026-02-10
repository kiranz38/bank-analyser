# Implementation Plan - Leaky Wallet Upgrade

**Created:** February 2026
**Target:** Transform whereismymoneygo.com into higher-converting, trust-first Leaky Wallet app

---

## Milestone Checklist

### Milestone 0: Repo Audit and Plan ✅
- [x] Inspect routes/pages/components
- [x] Inspect analyzer pipeline
- [x] Inspect PDF/CSV parsing
- [x] Create PRODUCT_AUDIT.md
- [x] Create IMPLEMENTATION_PLAN.md
- [x] Confirm GA4 tag present (G-BD8VF1JPDZ)

---

### Milestone 1: Landing Conversion Driver + Trust-First UX
**Goal:** Force a single dominant first action that feels emotionally safe

#### Tasks
- [ ] Update hero section
  - [ ] Keep H1 as "Leaky Wallet"
  - [ ] Add subhead variants (A/B ready)
  - [ ] Add dominant CTA "Find my money leaks"
- [ ] Create MethodChooser component
  - [ ] Card 1: Upload statement (default highlighted)
  - [ ] Card 2: Connect bank (Beta) - gated
- [ ] Add trust strip under CTA
- [ ] Ensure upload flow still works as before

#### Files to Touch
- `frontend/app/page.tsx` - Hero update, CTA, state management
- `frontend/components/MethodChooser.tsx` - NEW
- `frontend/components/UploadForm.tsx` - Minor refactor
- `frontend/app/globals.css` - New styles

#### Risks & Flags
- **Risk:** Breaking existing upload flow
- **Mitigation:** Keep UploadForm component intact, wrap in MethodChooser

---

### Milestone 2: Sitelink Pages + SEO + Internal Linking
**Goal:** Improve Google Ads asset strength with proper pages

#### Tasks
- [ ] Create /how-it-works page
- [ ] Create /pricing page (Free, donation link)
- [ ] Create /example page (anonymized sample report)
- [ ] Create /banks page (bank connect beta explanation)
- [ ] Update Header nav
- [ ] Update Footer nav
- [ ] Add OpenGraph tags to all pages
- [ ] Update sitemap.xml with all pages
- [ ] Add robots.txt
- [ ] Add canonical URLs

#### Files to Touch
- `frontend/app/how-it-works/page.tsx` - NEW
- `frontend/app/pricing/page.tsx` - NEW
- `frontend/app/example/page.tsx` - NEW
- `frontend/app/banks/page.tsx` - NEW
- `frontend/app/sitemap.xml/route.ts` - Update
- `frontend/app/robots.txt/route.ts` - NEW
- `frontend/components/Header.tsx` - Nav update
- `frontend/components/Footer.tsx` - Nav update

#### Risks & Flags
- **Risk:** SEO changes may take time to reflect
- **Mitigation:** Use proper canonical URLs, submit to Search Console

---

### Milestone 3: Upload Flow Upgrades (Multi-Month)
**Goal:** Support multiple files and encourage 3+ months

#### Tasks
- [ ] Update UploadForm to accept multiple files
- [ ] Add UI to list uploaded files with remove button
- [ ] Add prompt: "Upload at least 3 months for better habit detection"
- [ ] Update backend to accept multiple files
- [ ] Implement NormalizedTransaction schema
- [ ] Add deduplication logic
- [ ] Show progress states (parsing → categorizing → insights)

#### Files to Touch
- `frontend/components/UploadForm.tsx` - Multi-file support
- `frontend/components/UploadProgress.tsx` - NEW
- `frontend/app/page.tsx` - State management
- `backend/main.py` - Multi-file endpoint
- `backend/parser.py` - Merge transactions
- `backend/models.py` - NEW (NormalizedTransaction schema)

#### Risks & Flags
- **Risk:** Deduplication could remove valid transactions
- **Mitigation:** Conservative matching (same date + amount + description hash)
- **Flag:** ENABLE_MULTI_FILE feature flag

---

### Milestone 4: Analysis Upgrades
**Goal:** Provide value beyond just subscription detection

#### Tasks
- [ ] Add spending overview section
- [ ] Enhance fee detection and display
- [ ] Add savings plan with 5-10 actionable items
- [ ] Create alternatives mapping JSON
- [ ] Add alternatives display in results
- [ ] Detect price increases in subscriptions
- [ ] Detect potential duplicate subscriptions

#### Files to Touch
- `frontend/components/ResultCards.tsx` - New sections
- `frontend/components/FeeBreakdown.tsx` - NEW
- `frontend/components/AlternativesPanel.tsx` - NEW
- `backend/analyzer.py` - Enhanced analysis
- `backend/subscription_detector.py` - Price trends
- `backend/data/alternatives.json` - NEW (curated mapping)

#### Risks & Flags
- **Risk:** Hallucinated alternative links
- **Mitigation:** Only include verified URLs in alternatives.json
- **Flag:** ENABLE_ALTERNATIVES feature flag

---

### Milestone 5: Analytics (GA4) Events
**Goal:** Wire events to GA4 for data-driven decisions

#### Tasks
- [ ] Create analytics wrapper utility
- [ ] Implement all events:
  - cta_find_money_leaks_clicked
  - method_upload_selected
  - method_bankconnect_selected
  - upload_started
  - upload_completed
  - analysis_generated
  - results_viewed
  - recurring_detected
  - alternatives_clicked
  - waitlist_submitted
  - plaid_link_opened
  - plaid_link_success
  - plaid_link_exit
- [ ] Document primary conversion event
- [ ] Create analytics verification doc

#### Files to Touch
- `frontend/lib/analytics.ts` - NEW (wrapper)
- `frontend/app/page.tsx` - Event calls
- `frontend/components/MethodChooser.tsx` - Event calls
- `frontend/components/UploadForm.tsx` - Event calls
- `frontend/components/ResultCards.tsx` - Event calls
- `docs/ANALYTICS_VERIFICATION.md` - NEW

#### Risks & Flags
- **Risk:** Ad blockers may block events
- **Mitigation:** Document this limitation, use server-side backup if critical

---

### Milestone 6: Bank Connect Beta (Plaid)
**Goal:** Optional Plaid integration for US/UK users

#### Tasks
- [ ] Add NEXT_PUBLIC_BANK_CONNECT_BETA flag
- [ ] Implement region detection (US/UK only)
- [ ] Create waitlist form component
- [ ] Create waitlist API endpoint
- [ ] Implement Plaid Link integration
- [ ] Create server routes:
  - POST /api/plaid/create_link_token
  - POST /api/plaid/exchange_public_token
  - GET /api/plaid/transactions
- [ ] Create Plaid adapter → NormalizedTransaction
- [ ] Use same analysis pipeline
- [ ] Never expose access tokens

#### Files to Touch
- `frontend/components/MethodChooser.tsx` - Plaid button
- `frontend/components/WaitlistForm.tsx` - NEW
- `frontend/components/PlaidLink.tsx` - NEW
- `frontend/lib/plaid.ts` - NEW
- `backend/main.py` - Plaid routes
- `backend/plaid_client.py` - NEW
- `backend/plaid_adapter.py` - NEW
- `.env.local` - Plaid credentials

#### Risks & Flags
- **Risk:** Plaid credentials exposure
- **Mitigation:** Server-side only, never client
- **Risk:** Users outside US/UK trying to connect
- **Mitigation:** Region gate + clear messaging
- **Flag:** NEXT_PUBLIC_BANK_CONNECT_BETA=true

---

### Milestone 7: Feedback Loop
**Goal:** Enable fast product iteration via user feedback

#### Tasks
- [ ] Add thumbs up/down on results screen
- [ ] Add follow-up question based on response
- [ ] Create feedback API endpoint
- [ ] Store feedback (no transaction data)
- [ ] Add rate limiting to feedback endpoint

#### Files to Touch
- `frontend/components/FeedbackWidget.tsx` - NEW
- `frontend/components/ResultCards.tsx` - Add widget
- `backend/main.py` - Feedback endpoint
- `backend/models.py` - Feedback schema

#### Risks & Flags
- **Risk:** Spam feedback
- **Mitigation:** Rate limit 5/day per IP

---

### Milestone 8: Performance + Reliability
**Goal:** Ensure smooth experience at scale

#### Tasks
- [ ] Move heavy parsing to web worker
- [ ] Lazy load ResultCards components
- [ ] Add error boundaries
- [ ] Add "Delete my session" button
- [ ] Add friendly error messages
- [ ] Cache insights in session storage

#### Files to Touch
- `frontend/lib/parseWorker.ts` - NEW
- `frontend/components/ResultCards.tsx` - Lazy load
- `frontend/components/ErrorBoundary.tsx` - NEW
- `frontend/app/page.tsx` - Session management

#### Risks & Flags
- **Risk:** Web worker complexity
- **Mitigation:** Keep fallback to main thread
- **Flag:** ENABLE_WEB_WORKER

---

### Milestone 9: Ads Asset Helper
**Goal:** Improve Google Ads asset strength

#### Tasks
- [ ] Create google-ads-assets.json with:
  - 12 short headlines (<=30 chars)
  - 5 long headlines (<=90 chars)
  - 8 descriptions (<=60 chars)
  - 8 descriptions (<=90 chars)
- [ ] Ensure all copy is truthful

#### Files to Touch
- `marketing/google-ads-assets.json` - NEW

---

## Testing Requirements

### Unit Tests
- [ ] Transaction normalization
- [ ] Subscription detection
- [ ] Deduplication logic
- [ ] Analytics event formatting

### Integration Tests
- [ ] CTA → Method selection → Upload → Results flow
- [ ] Multi-file upload flow
- [ ] Plaid flow (sandbox)

### E2E Tests
- [ ] Full user journey smoke test
- [ ] Feature flag gating for Plaid

### Quality Gates
- [ ] TypeScript strict mode pass
- [ ] ESLint pass
- [ ] Python type hints pass
- [ ] Frontend build succeeds
- [ ] Backend starts without errors

---

## Security Checklist

- [ ] No raw statements logged
- [ ] PII redacted in errors
- [ ] Upload size/type validated
- [ ] Rate limits on all endpoints
- [ ] Plaid tokens server-side only
- [ ] Waitlist email validation
- [ ] Privacy claims match code

---

## Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| NEXT_PUBLIC_BANK_CONNECT_BETA | false | Enable Plaid bank connect |
| ENABLE_MULTI_FILE | true | Enable multi-file upload |
| ENABLE_ALTERNATIVES | true | Show alternatives mapping |
| ENABLE_WEB_WORKER | false | Use web worker for parsing |

---

## Deployment Order

1. **Milestone 1** - Can deploy independently (UI only)
2. **Milestone 2** - Can deploy independently (new pages)
3. **Milestone 5** - Should deploy with M1 (analytics)
4. **Milestone 3** - Requires backend changes
5. **Milestone 4** - Requires backend changes
6. **Milestone 7** - Requires backend changes
7. **Milestone 6** - Deploy last (Plaid beta)
8. **Milestone 8** - Performance improvements
9. **Milestone 9** - Marketing assets (no deploy)

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| CTA click rate | Unknown | Track via analytics |
| Upload completion | Unknown | Track via analytics |
| Analysis completion | Unknown | Track via analytics |
| Bank connect waitlist | 0 | 100+ signups |
| Feedback submitted | 0 | 20+ per week |
| Google Ads asset strength | Unknown | "Excellent" |

---

## Rollback Plan

Each milestone should be deployable independently. If issues arise:

1. Revert to previous commit
2. Disable feature flag if applicable
3. Monitor error logs
4. Communicate status if user-facing

---

*Implementation Plan v1.0*
