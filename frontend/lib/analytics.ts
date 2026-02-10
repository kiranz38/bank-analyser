/**
 * Analytics wrapper for GA4 event tracking
 *
 * Events documented in docs/IMPLEMENTATION_PLAN.md
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

type EventParams = Record<string, string | number | boolean | undefined>

/**
 * Track an event to Google Analytics 4
 */
export function trackEvent(eventName: string, params?: EventParams): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, params || '')
  }

  // Send to GA4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// ============================================
// Conversion Events
// ============================================

/**
 * Primary CTA clicked
 */
export function trackCTAClicked(): void {
  trackEvent('cta_find_money_leaks_clicked')
}

/**
 * User selected upload method
 */
export function trackMethodUploadSelected(): void {
  trackEvent('method_upload_selected')
}

/**
 * User selected bank connect method
 */
export function trackMethodBankConnectSelected(): void {
  trackEvent('method_bankconnect_selected')
}

/**
 * Upload started
 */
export function trackUploadStarted(params: {
  filename: string
  size: number
  type: 'file' | 'text'
}): void {
  trackEvent('upload_started', {
    filename: params.filename,
    file_size: params.size,
    upload_type: params.type
  })
}

/**
 * Upload completed (file parsed successfully)
 */
export function trackUploadCompleted(params: {
  fileCount: number
  totalTransactions: number
}): void {
  trackEvent('upload_completed', {
    file_count: params.fileCount,
    total_transactions: params.totalTransactions
  })
}

/**
 * Analysis generated - PRIMARY CONVERSION EVENT
 */
export function trackAnalysisGenerated(params: {
  monthlyLeak: number
  annualSavings: number
  subscriptionCount: number
}): void {
  trackEvent('analysis_generated', {
    monthly_leak: params.monthlyLeak,
    annual_savings: params.annualSavings,
    subscription_count: params.subscriptionCount
  })
}

/**
 * Results viewed (scrolled to results)
 */
export function trackResultsViewed(): void {
  trackEvent('results_viewed')
}

/**
 * Recurring charges detected
 */
export function trackRecurringDetected(count: number): void {
  trackEvent('recurring_detected', { count })
}

/**
 * Alternative clicked
 */
export function trackAlternativeClicked(merchant: string): void {
  trackEvent('alternatives_clicked', { merchant })
}

// ============================================
// Bank Connect Events
// ============================================

/**
 * Waitlist form submitted
 */
export function trackWaitlistSubmitted(country: string): void {
  trackEvent('waitlist_submitted', { country })
}

/**
 * Plaid Link opened
 */
export function trackPlaidLinkOpened(): void {
  trackEvent('plaid_link_opened')
}

/**
 * Plaid Link success - CONVERSION EVENT
 */
export function trackPlaidLinkSuccess(): void {
  trackEvent('plaid_link_success')
}

/**
 * Plaid Link exited without success
 */
export function trackPlaidLinkExit(reason?: string): void {
  trackEvent('plaid_link_exit', { reason })
}

// ============================================
// Engagement Events
// ============================================

/**
 * Category breakdown viewed
 */
export function trackCategoryViewed(categories: string[]): void {
  trackEvent('category_viewed', {
    categories: categories.join(','),
    count: categories.length
  })
}

/**
 * Share card generated
 */
export function trackShareCardGenerated(annualSavings: number): void {
  trackEvent('share_card_generated', { annual_savings: annualSavings })
}

/**
 * Share button clicked
 */
export function trackShareClicked(platform: string): void {
  trackEvent('share_clicked', { platform })
}

/**
 * Feedback submitted
 */
export function trackFeedbackSubmitted(params: {
  rating: 'positive' | 'negative'
  hasComment: boolean
}): void {
  trackEvent('feedback_submitted', {
    rating: params.rating,
    has_comment: params.hasComment
  })
}

// ============================================
// Page View Events
// ============================================

/**
 * Track page view (for SPA navigation)
 */
export function trackPageView(pagePath: string, pageTitle: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle
    })
  }
}
