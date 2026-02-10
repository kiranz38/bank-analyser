import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Example Report – See What Leaky Wallet Finds',
  description: 'Preview an anonymized sample report from Leaky Wallet. See how we detect subscriptions, categorize spending, and identify money leaks.',
  alternates: {
    canonical: 'https://whereismymoneygo.com/example',
  },
  openGraph: {
    title: 'Example Report – Leaky Wallet',
    description: 'See a sample analysis report showing detected subscriptions and spending insights.',
    type: 'website',
    url: 'https://whereismymoneygo.com/example',
  },
}

export default function ExamplePage() {
  return (
    <main className="container example-page">
      <div className="example-content">
        <h1>Example Analysis Report</h1>
        <p className="example-intro">
          Here's what a typical Leaky Wallet report looks like. This is based on anonymized
          data to show you what insights you can expect from your own analysis.
        </p>

        {/* Sample Stats */}
        <section className="example-section">
          <div className="example-stats-card">
            <div className="example-stat-grid">
              <div className="example-stat danger">
                <span className="example-stat-label">Monthly Leak</span>
                <span className="example-stat-value">$347</span>
                <span className="example-stat-sub">Hidden spending detected</span>
              </div>
              <div className="example-stat success">
                <span className="example-stat-label">Potential Annual Savings</span>
                <span className="example-stat-value">$4,164</span>
                <span className="example-stat-sub">If you fix these leaks</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Subscriptions */}
        <section className="example-section">
          <h2>Detected Subscriptions</h2>
          <p className="example-section-desc">
            Leaky Wallet identifies recurring charges by analyzing transaction patterns.
          </p>
          <div className="example-card">
            <ul className="example-subscription-list">
              <li className="example-subscription">
                <div className="example-sub-info">
                  <span className="example-sub-name">Netflix Premium</span>
                  <span className="example-sub-confidence high">High confidence</span>
                </div>
                <div className="example-sub-cost">
                  <span className="example-sub-monthly">$22.99/mo</span>
                  <span className="example-sub-annual">$275.88/yr</span>
                </div>
              </li>
              <li className="example-subscription">
                <div className="example-sub-info">
                  <span className="example-sub-name">Spotify Family</span>
                  <span className="example-sub-confidence high">High confidence</span>
                </div>
                <div className="example-sub-cost">
                  <span className="example-sub-monthly">$16.99/mo</span>
                  <span className="example-sub-annual">$203.88/yr</span>
                </div>
              </li>
              <li className="example-subscription">
                <div className="example-sub-info">
                  <span className="example-sub-name">Adobe Creative Cloud</span>
                  <span className="example-sub-confidence high">High confidence</span>
                </div>
                <div className="example-sub-cost">
                  <span className="example-sub-monthly">$54.99/mo</span>
                  <span className="example-sub-annual">$659.88/yr</span>
                </div>
              </li>
              <li className="example-subscription">
                <div className="example-sub-info">
                  <span className="example-sub-name">Planet Fitness</span>
                  <span className="example-sub-confidence medium">Medium confidence</span>
                </div>
                <div className="example-sub-cost">
                  <span className="example-sub-monthly">$24.99/mo</span>
                  <span className="example-sub-annual">$299.88/yr</span>
                </div>
              </li>
              <li className="example-subscription faded">
                <div className="example-sub-info">
                  <span className="example-sub-name">Headspace</span>
                  <span className="example-sub-confidence low">Possible</span>
                </div>
                <div className="example-sub-cost">
                  <span className="example-sub-monthly">$12.99/mo</span>
                  <span className="example-sub-annual">$155.88/yr</span>
                </div>
              </li>
            </ul>
            <div className="example-sub-total">
              <span>Total Subscriptions</span>
              <span className="example-sub-total-value">$132.95/month ($1,595.40/year)</span>
            </div>
          </div>
        </section>

        {/* Sample Categories */}
        <section className="example-section">
          <h2>Spending by Category</h2>
          <p className="example-section-desc">
            See where your money actually goes each month.
          </p>
          <div className="example-card">
            <div className="example-category-list">
              <div className="example-category-item">
                <div className="example-cat-header">
                  <span className="example-cat-dot" style={{background: '#ef4444'}}></span>
                  <span className="example-cat-name">Food & Dining</span>
                  <span className="example-cat-percent">32%</span>
                </div>
                <div className="example-cat-bar">
                  <div className="example-cat-fill" style={{width: '32%', background: '#ef4444'}}></div>
                </div>
                <span className="example-cat-amount">$847.23</span>
              </div>
              <div className="example-category-item">
                <div className="example-cat-header">
                  <span className="example-cat-dot" style={{background: '#f59e0b'}}></span>
                  <span className="example-cat-name">Shopping</span>
                  <span className="example-cat-percent">24%</span>
                </div>
                <div className="example-cat-bar">
                  <div className="example-cat-fill" style={{width: '24%', background: '#f59e0b'}}></div>
                </div>
                <span className="example-cat-amount">$634.50</span>
              </div>
              <div className="example-category-item">
                <div className="example-cat-header">
                  <span className="example-cat-dot" style={{background: '#10b981'}}></span>
                  <span className="example-cat-name">Transportation</span>
                  <span className="example-cat-percent">18%</span>
                </div>
                <div className="example-cat-bar">
                  <div className="example-cat-fill" style={{width: '18%', background: '#10b981'}}></div>
                </div>
                <span className="example-cat-amount">$476.00</span>
              </div>
              <div className="example-category-item">
                <div className="example-cat-header">
                  <span className="example-cat-dot" style={{background: '#6366f1'}}></span>
                  <span className="example-cat-name">Entertainment</span>
                  <span className="example-cat-percent">14%</span>
                </div>
                <div className="example-cat-bar">
                  <div className="example-cat-fill" style={{width: '14%', background: '#6366f1'}}></div>
                </div>
                <span className="example-cat-amount">$370.45</span>
              </div>
              <div className="example-category-item">
                <div className="example-cat-header">
                  <span className="example-cat-dot" style={{background: '#8b5cf6'}}></span>
                  <span className="example-cat-name">Bills & Utilities</span>
                  <span className="example-cat-percent">12%</span>
                </div>
                <div className="example-cat-bar">
                  <div className="example-cat-fill" style={{width: '12%', background: '#8b5cf6'}}></div>
                </div>
                <span className="example-cat-amount">$317.82</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Easy Wins */}
        <section className="example-section">
          <h2>Easy Wins</h2>
          <p className="example-section-desc">
            Quick actions that could save you money.
          </p>
          <div className="example-card">
            <div className="example-easy-wins">
              <div className="example-easy-win">
                <div className="example-win-header">
                  <span className="example-win-title">Cancel unused gym membership</span>
                  <span className="example-win-savings">Save $300/yr</span>
                </div>
                <p className="example-win-desc">
                  You visited Planet Fitness only 2 times in the last 3 months. Consider a pay-per-visit option.
                </p>
              </div>
              <div className="example-easy-win">
                <div className="example-win-header">
                  <span className="example-win-title">Downgrade streaming plan</span>
                  <span className="example-win-savings">Save $96/yr</span>
                </div>
                <p className="example-win-desc">
                  Netflix Basic ($6.99) might be enough if you rarely watch 4K content.
                </p>
              </div>
              <div className="example-easy-win">
                <div className="example-win-header">
                  <span className="example-win-title">Review subscription overlap</span>
                  <span className="example-win-savings">Save $156/yr</span>
                </div>
                <p className="example-win-desc">
                  You have both Headspace and Calm - consider keeping just one meditation app.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="example-cta-section">
          <h2>Get Your Own Report</h2>
          <p>Upload your bank statement and see your personalized insights in seconds.</p>
          <Link href="/" className="btn btn-primary btn-lg">
            Analyze My Statement
          </Link>
          <p className="example-cta-note">Free, private, no signup required</p>
        </section>
      </div>
    </main>
  )
}
