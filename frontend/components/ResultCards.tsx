'use client'

import { useEffect, useState } from 'react'
import ShareCard from './ShareCard'
import FeedbackWidget from './FeedbackWidget'
import AffiliateAlternatives from './AffiliateAlternatives'
import SummaryStats from './results/SummaryStats'
import OverviewRow from './results/OverviewRow'
import ThreeColumnCards from './results/ThreeColumnCards'
import ExpandedSections from './results/ExpandedSections'
import SpendingModal from './results/SpendingModal'
import SubscriptionsModal from './results/SubscriptionsModal'
import QuickWinsModal from './results/QuickWinsModal'
import ProReportSection from './results/ProReportSection'
import {
  trackCategoryViewed,
  trackShareCardGenerated,
  trackShareClicked,
  trackPriceChangesViewed,
  trackDuplicatesViewed,
} from '@/lib/analytics'
import type { AnalysisResult, Leak } from '@/lib/types'

interface ResultCardsProps {
  results: AnalysisResult
  proPaymentStatus?: 'success' | 'cancelled' | null
  proSessionId?: string | null
  proCustomerEmail?: string | null
  isDemo?: boolean
  isPro?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  'Subscriptions': '#8b5cf6',
  'Dining & Delivery': '#f97316',
  'Food Delivery': '#fb923c',
  'Shopping': '#3b82f6',
  'Transport': '#10b981',
  'Groceries': '#22c55e',
  'Entertainment': '#ec4899',
  'Utilities & Bills': '#6366f1',
  'Health & Fitness': '#14b8a6',
  'Travel': '#f59e0b',
  'Fees': '#ef4444',
  'Fees & Charges': '#dc2626',
  'Transfers': '#64748b',
  'Other': '#94a3b8',
}

export default function ResultCards({ results, proPaymentStatus, proSessionId, proCustomerEmail, isDemo, isPro }: ResultCardsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [showSpendingModal, setShowSpendingModal] = useState(false)
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false)
  const [showQuickWinsModal, setShowQuickWinsModal] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  useEffect(() => {
    if (isDemo) return
    if (results.category_summary && results.category_summary.length > 0) {
      trackCategoryViewed(results.category_summary.map(c => c.category))
    }
    if (results.share_summary) {
      trackShareCardGenerated(results.share_summary.annual_savings)
    }
    if (results.price_changes && results.price_changes.length > 0) {
      const totalImpact = results.price_changes.reduce((sum, pc) => sum + pc.yearly_impact, 0)
      trackPriceChangesViewed({ count: results.price_changes.length, totalYearlyImpact: totalImpact })
    }
    if (results.duplicate_subscriptions && results.duplicate_subscriptions.length > 0) {
      const totalMonthly = results.duplicate_subscriptions.reduce((sum, d) => sum + d.combined_monthly, 0)
      trackDuplicatesViewed({ categoryCount: results.duplicate_subscriptions.length, totalMonthly })
    }
  }, [results, isDemo])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

  const formatCurrencyPrecise = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)

  // Group leaks by category
  const groupedLeaks = results.top_leaks.reduce((acc, leak) => {
    const category = leak.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(leak)
    return acc
  }, {} as Record<string, Leak[]>)

  const categoryTotals = Object.entries(groupedLeaks).map(([category, leaks]) => ({
    category,
    leaks,
    monthlyTotal: leaks.reduce((sum, l) => sum + (Number(l.monthly_cost) || 0), 0),
    yearlyTotal: leaks.reduce((sum, l) => sum + (Number(l.yearly_cost) || 0), 0)
  })).sort((a, b) => b.monthlyTotal - a.monthlyTotal)

  // Prepare pie chart data
  const pieData = results.category_summary && results.category_summary.length > 0
    ? results.category_summary
        .filter(c => c.category !== 'Transfers' && c.category !== 'Income')
        .slice(0, 6)
        .map(cat => ({
          name: cat.category,
          value: cat.total,
          color: CATEGORY_COLORS[cat.category] || '#94a3b8'
        }))
    : categoryTotals
        .slice(0, 6)
        .map(ct => ({
          name: ct.category,
          value: ct.monthlyTotal,
          color: CATEGORY_COLORS[ct.category] || '#94a3b8'
        }))

  const confirmedSubs = (results.subscriptions || []).filter(s => s.confidence >= 0.6)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <SummaryStats monthlyLeak={results.monthly_leak} annualSavings={results.annual_savings} />

      {/* Overview Row */}
      <OverviewRow
        pieData={pieData}
        confirmedSubsCount={confirmedSubs.length}
        confirmedSubsMonthly={confirmedSubs.reduce((s, sub) => s + sub.monthly_cost, 0)}
        easyWinsCount={results.easy_wins.length}
        easyWinsYearlySavings={results.easy_wins.reduce((s, w) => s + w.estimated_yearly_savings, 0)}
        onShowSpending={() => setShowSpendingModal(true)}
        onShowSubscriptions={() => setShowSubscriptionsModal(true)}
        onShowQuickWins={() => setShowQuickWinsModal(true)}
        formatCurrency={formatCurrency}
        formatCurrencyPrecise={formatCurrencyPrecise}
      />

      {/* Three Column Cards */}
      <ThreeColumnCards
        easyWins={results.easy_wins}
        categoryTotals={categoryTotals}
        recoveryPlan={results.recovery_plan}
        onToggleSection={toggleSection}
        onShowQuickWins={() => setShowQuickWinsModal(true)}
        formatCurrency={formatCurrency}
        formatCurrencyPrecise={formatCurrencyPrecise}
      />

      {/* Expandable Sections */}
      <ExpandedSections
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        categoryTotals={categoryTotals}
        recoveryPlan={results.recovery_plan}
        topSpending={results.top_spending}
        priceChanges={results.price_changes}
        formatCurrency={formatCurrency}
        formatCurrencyPrecise={formatCurrencyPrecise}
      />

      {/* Alternatives */}
      {results.alternatives && results.alternatives.length > 0 && (
        <AffiliateAlternatives alternatives={results.alternatives} isPro={isPro ?? false} isDemo={isDemo ?? false} />
      )}

      {/* Share Card */}
      {results.share_summary && (
        <ShareCard
          shareSummary={results.share_summary}
          onShare={(platform) => !isDemo && trackShareClicked(platform)}
        />
      )}

      {/* Pro Report */}
      {!isDemo && (
        <ProReportSection
          results={results}
          proPaymentStatus={proPaymentStatus}
          proSessionId={proSessionId}
          proCustomerEmail={proCustomerEmail}
        />
      )}

      {/* Feedback */}
      <FeedbackWidget
        context={{
          monthlyLeak: results.monthly_leak,
          subscriptionCount: results.subscriptions?.length || 0
        }}
      />

      {/* Modals */}
      <SpendingModal
        open={showSpendingModal}
        onOpenChange={setShowSpendingModal}
        pieData={pieData}
        categorySummary={results.category_summary}
        comparison={results.comparison}
      />

      {confirmedSubs.length > 0 && (
        <SubscriptionsModal
          open={showSubscriptionsModal}
          onOpenChange={setShowSubscriptionsModal}
          subscriptions={confirmedSubs}
        />
      )}

      {results.easy_wins.length > 0 && (
        <QuickWinsModal
          open={showQuickWinsModal}
          onOpenChange={setShowQuickWinsModal}
          easyWins={results.easy_wins}
        />
      )}
    </div>
  )
}
