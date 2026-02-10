# Product Audit - Leaky Wallet (whereismymoneygo.com)

**Audit Date:** February 2026
**Auditor:** Claude Code
**Version:** Pre-upgrade baseline

---

## 1. Current User Journey

```
Landing Page (/)
    │
    ├── Hero Section
    │   ├── H1: "Bank Statement Analyzer"
    │   ├── Tagline: "Where's My Money Going?"
    │   ├── Trust badges (No data stored, Secure, Free)
    │   └── Shock motivator: "$200-$600/month in hidden spending"
    │
    ├── Upload Section (visible immediately)
    │   ├── Drag & drop area (CSV/PDF up to 10MB)
    │   ├── OR paste transactions textarea
    │   ├── "Analyze My Spending" button
    │   └── Bank download instructions (collapsible)
    │
    ├── Example Preview (static mockup)
    │
    └── Results (after analysis)
        ├── Monthly Leak / Annual Savings stats
        ├── Recurring Spending Leaks (grouped by category)
        ├── Top 5 Biggest Transactions
        ├── Easy Wins
        ├── Spending Breakdown by Category
        ├── Subscription List
        ├── Month Comparison (if >60 days data)
        ├── Recovery Plan
        └── Share Card + Social buttons
```

### Pain Points Identified
1. **No dominant CTA above fold** - User sees upload form immediately, which can feel demanding
2. **No method choice** - Upload is the only option; no bank connect alternative
3. **Single file only** - Cannot upload multiple months in one session
4. **Analytics not wired** - `trackEvent` function exists but only logs to console
5. **No feedback loop** - Only email link, no quick thumbs up/down
6. **Limited SEO pages** - Only 4 pages in sitemap

---

## 2. Current Features

### Frontend (Next.js 14 App Router)
| Feature | Status | Notes |
|---------|--------|-------|
| Upload CSV/PDF | ✅ Working | Single file, 10MB limit |
| Paste transactions | ✅ Working | 5MB text limit |
| File validation | ✅ Working | Extension + size checks |
| Dark mode | ✅ Working | localStorage persisted |
| Results display | ✅ Working | Rich cards with categories |
| Share functionality | ✅ Working | Twitter, Facebook, WhatsApp, copy |
| Mobile responsive | ✅ Working | Header hide on scroll |
| SEO pages | ⚠️ Partial | /privacy, /terms, /bank-statement-analyzer |
| Sitemap | ⚠️ Partial | Only 2 URLs |

### Backend (FastAPI Python)
| Feature | Status | Notes |
|---------|--------|-------|
| PDF parsing | ✅ Working | CommBank, NAB, Westpac, ANZ, US banks |
| CSV parsing | ✅ Working | Multiple formats |
| Transaction categorization | ✅ Working | ~15 categories |
| Subscription detection | ✅ Working | Known services + pattern matching |
| Month comparison | ✅ Working | Requires >60 days data |
| Claude AI enhancement | ✅ Working | Anonymized data only |
| Rate limiting | ✅ Working | 10 req/min per IP |
| Security headers | ✅ Working | HSTS, X-Frame-Options, etc. |

### Analytics
| Event | Status | Notes |
|-------|--------|-------|
| GA4 tag | ✅ Present | G-BD8VF1JPDZ via next/script |
| Event tracking | ⚠️ Console only | trackEvent() not wired to gtag |
| Conversion tracking | ❌ Missing | No conversion event defined |

---

## 3. Current Gaps

### Critical Gaps (Must Fix)
1. **No dominant first-action CTA** - Upload form is too demanding as first interaction
2. **No multi-file upload** - Users can't easily analyze 3+ months
3. **Analytics not functional** - Events log to console, not GA4
4. **No bank connect option** - Users requesting seamless Plaid integration
5. **No feedback mechanism** - Can't iterate without user feedback

### Important Gaps (Should Fix)
1. **Missing sitelink pages** - /how-it-works, /pricing, /example, /banks
2. **Sitemap incomplete** - Missing /privacy, /terms pages
3. **No alternatives mapping** - Could suggest cheaper alternatives
4. **No fee detection UI** - Fees detected but not highlighted separately
5. **No waitlist system** - Can't collect interest for bank connect beta

### Nice-to-Have Gaps
1. **No progress states** - Loading overlay exists but no step-by-step
2. **No session management** - Can't "delete my data" (though nothing stored)
3. **No A/B testing infrastructure** - Hardcoded copy

---

## 4. File Map

### Frontend (`/frontend`)
```
app/
├── layout.tsx              # Root layout with GA4 script
├── page.tsx                # Main landing/analyzer page
├── globals.css             # All styles
├── icon.svg                # Favicon
├── apple-icon.svg          # Apple touch icon
├── bank-statement-analyzer/
│   └── page.tsx            # SEO landing page
├── privacy/
│   └── page.tsx            # Privacy policy
├── terms/
│   └── page.tsx            # Terms of use
└── sitemap.xml/
    └── route.ts            # Dynamic sitemap

components/
├── Header.tsx              # Site header with nav
├── Footer.tsx              # Site footer
├── UploadForm.tsx          # File upload + paste form
├── ResultCards.tsx         # Main results display
├── SpendingBreakdown.tsx   # Category breakdown chart
├── SubscriptionList.tsx    # Detected subscriptions
├── MonthComparison.tsx     # Month-over-month comparison
├── ShareCard.tsx           # Shareable results card
├── ExamplePreview.tsx      # Static example mockup
└── LoadingOverlay.tsx      # Loading spinner overlay
```

### Backend (`/backend`)
```
main.py                     # FastAPI app, endpoints, security
parser.py                   # CSV parsing, multiple formats
pdf_parser.py               # PDF parsing (CommBank, NAB, Westpac, ANZ, US)
analyzer.py                 # Main analysis logic
categorizer.py              # Transaction categorization
subscription_detector.py    # Recurring charge detection
claude_client.py            # Anthropic API for AI enhancement
requirements.txt            # Python dependencies
```

### Configuration
```
frontend/
├── package.json            # Node dependencies
├── tsconfig.json           # TypeScript config
├── next.config.js          # Next.js config with security headers
└── .env.local              # Environment variables (not committed)

backend/
└── requirements.txt        # Python dependencies
```

---

## 5. Technical Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js | 14.x |
| Frontend Language | TypeScript | 5.x |
| Styling | CSS (custom) | - |
| Backend | FastAPI | 0.109+ |
| Backend Language | Python | 3.10+ |
| PDF Parsing | pdfplumber | 0.10+ |
| Data Processing | pandas | 2.1+ |
| AI Enhancement | Anthropic Claude | Sonnet |
| Rate Limiting | slowapi | 0.1.9+ |
| Hosting (Frontend) | Vercel | - |
| Hosting (Backend) | Render | - |
| CDN/DDoS | Cloudflare | Free tier |
| Analytics | Google Analytics 4 | - |

---

## 6. Security Posture

### Implemented
- [x] Rate limiting (10 req/min/IP)
- [x] File size limits (10MB)
- [x] File type validation
- [x] PDF format validation (magic bytes)
- [x] Sanitized error messages
- [x] Security headers (HSTS, X-Frame-Options, etc.)
- [x] CORS restricted to specific origins
- [x] No raw data sent to Claude (anonymized)
- [x] No data persistence (in-memory only)
- [x] HTTPS enforced via Cloudflare

### Not Implemented
- [ ] CAPTCHA (not needed yet)
- [ ] Web Application Firewall rules
- [ ] Content Security Policy (CSP) headers

---

## 7. Privacy Compliance Status

| Claim | Code Reality | Status |
|-------|--------------|--------|
| "No data stored" | In-memory processing, no database | ✅ True |
| "Immediately discarded" | Python garbage collection | ✅ True |
| "No tracking of financial data" | Only anonymized summaries to Claude | ✅ True |
| "No account required" | No auth system | ✅ True |

---

## 8. Performance Notes

- Frontend bundle: ~107KB first load JS
- Backend PDF parsing: Can take 2-5s for large PDFs
- No web workers (parsing on main thread)
- No lazy loading for heavy components
- No caching layer (each request reprocesses)

---

## 9. Recommendations Summary

### Immediate (Milestone 1-2)
1. Add dominant CTA "Find my money leaks" with method chooser
2. Wire analytics events to GA4
3. Add missing sitelink pages
4. Update sitemap with all pages

### Short-term (Milestone 3-5)
1. Implement multi-file upload
2. Add Plaid bank connect beta (US/UK only)
3. Add alternatives mapping JSON
4. Add thumbs up/down feedback

### Medium-term (Milestone 6-9)
1. Add waitlist system for bank connect
2. Implement progress states
3. Add session management
4. Performance optimizations (web workers)

---

*End of Product Audit*
