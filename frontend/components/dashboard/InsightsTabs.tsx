'use client'

import { useState, useEffect } from 'react'
import { trackAlternativeClicked } from '@/lib/analytics'

interface PriceChange {
  merchant: string
  old_price: number
  new_price: number
  increase: number
  percent_change: number
  first_date: string
  latest_date: string
  yearly_impact: number
}

interface DuplicateSubscription {
  category: string
  services: string[]
  count: number
  combined_monthly: number
  combined_yearly: number
  suggestion: string
}

interface Alternative {
  original: string
  alternative: string
  current_price: number
  alternative_price: number
  monthly_savings: number
  yearly_savings: number
  note: string
  category: string
}

interface TopSpending {
  date: string
  merchant: string
  amount: number
  category?: string
}

interface InsightsTabsProps {
  priceChanges?: PriceChange[]
  duplicates?: DuplicateSubscription[]
  alternatives?: Alternative[]
  topSpending?: TopSpending[]
}

type TabType = 'prices' | 'duplicates' | 'alternatives' | 'transactions'

export default function InsightsTabs({
  priceChanges = [],
  duplicates = [],
  alternatives = [],
  topSpending = []
}: InsightsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('prices')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCurrencyPrecise = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Count items for each tab
  const tabs = [
    { id: 'prices' as TabType, label: 'Price Changes', count: priceChanges.length },
    { id: 'duplicates' as TabType, label: 'Duplicates', count: duplicates.length },
    { id: 'alternatives' as TabType, label: 'Alternatives', count: alternatives.length },
    { id: 'transactions' as TabType, label: 'Top Transactions', count: topSpending.length }
  ]

  // Only show tabs that have data
  const activeTabs = tabs.filter(tab => tab.count > 0)

  // Set first available tab as active if current tab has no data
  useEffect(() => {
    const currentTabHasData = tabs.find(t => t.id === activeTab)?.count ?? 0 > 0
    if (!currentTabHasData && activeTabs.length > 0) {
      setActiveTab(activeTabs[0].id)
    }
  }, [priceChanges.length, duplicates.length, alternatives.length, topSpending.length])

  if (activeTabs.length === 0) {
    return null
  }

  return (
    <div className="dashboard-card insights-tabs-card">
      <div className="insights-tabs-header">
        {activeTabs.map(tab => (
          <button
            key={tab.id}
            className={`insights-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="insights-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="insights-tabs-content">
        {/* Price Changes Panel */}
        {activeTab === 'prices' && priceChanges.length > 0 && (
          <div className="insights-panel price-changes-panel">
            <p className="insights-panel-intro">
              Some subscriptions have increased in price
            </p>
            <ul className="insights-list">
              {priceChanges.slice(0, 4).map((change, index) => (
                <li key={index} className="insights-list-item">
                  <div className="insights-item-main">
                    <span className="insights-item-name">{change.merchant}</span>
                    <span className="insights-item-change price-up">
                      +{formatCurrencyPrecise(change.increase)}/mo
                    </span>
                  </div>
                  <div className="insights-item-detail">
                    {formatCurrencyPrecise(change.old_price)} → {formatCurrencyPrecise(change.new_price)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Duplicates Panel */}
        {activeTab === 'duplicates' && duplicates.length > 0 && (
          <div className="insights-panel duplicates-panel">
            <p className="insights-panel-intro">
              You have overlapping subscriptions in these categories
            </p>
            <ul className="insights-list">
              {duplicates.slice(0, 4).map((dup, index) => (
                <li key={index} className="insights-list-item">
                  <div className="insights-item-main">
                    <span className="insights-item-name">{dup.category}</span>
                    <span className="insights-item-badge">{dup.count} services</span>
                  </div>
                  <div className="insights-item-detail">
                    {dup.services.slice(0, 3).join(', ')} — {formatCurrency(dup.combined_monthly)}/mo
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternatives Panel */}
        {activeTab === 'alternatives' && alternatives.length > 0 && (
          <div className="insights-panel alternatives-panel">
            <p className="insights-panel-intro">
              Cheaper or free alternatives to your current subscriptions
            </p>
            <ul className="insights-list">
              {alternatives.slice(0, 4).map((alt, index) => (
                <li
                  key={index}
                  className="insights-list-item clickable"
                  onClick={() => trackAlternativeClicked({
                    original: alt.original,
                    alternative: alt.alternative,
                    potentialSavings: alt.yearly_savings
                  })}
                >
                  <div className="insights-item-main">
                    <span className="insights-item-name">
                      {alt.original} → {alt.alternative}
                      {alt.alternative_price === 0 && <span className="free-badge">FREE</span>}
                    </span>
                    <span className="insights-item-savings">
                      Save {formatCurrency(alt.yearly_savings)}/yr
                    </span>
                  </div>
                  <div className="insights-item-detail">{alt.note}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top Transactions Panel */}
        {activeTab === 'transactions' && topSpending.length > 0 && (
          <div className="insights-panel transactions-panel">
            <p className="insights-panel-intro">
              Your biggest transactions this period
            </p>
            <ul className="insights-list">
              {topSpending.slice(0, 5).map((item, index) => (
                <li key={index} className="insights-list-item">
                  <div className="insights-item-main">
                    <span className="insights-item-rank">#{index + 1}</span>
                    <span className="insights-item-name">{item.merchant}</span>
                    <span className="insights-item-amount">{formatCurrencyPrecise(item.amount)}</span>
                  </div>
                  {item.date && <div className="insights-item-detail">{item.date}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
