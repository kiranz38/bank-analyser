/**
 * Static example result preview to show users what to expect.
 * Uses fictional data - no real user data.
 */
export default function ExamplePreview() {
  return (
    <div className="example-preview">
      <h3 className="example-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Example Analysis Preview
      </h3>

      <div className="example-content">
        <div className="example-stats">
          <div className="example-stat">
            <span className="example-stat-label">Monthly Leak</span>
            <span className="example-stat-value danger">$347</span>
          </div>
          <div className="example-stat">
            <span className="example-stat-label">Annual Savings</span>
            <span className="example-stat-value success">$4,164</span>
          </div>
        </div>

        <div className="example-categories">
          <div className="example-category">
            <span className="example-cat-name">Subscriptions</span>
            <span className="example-cat-value">$89/mo</span>
          </div>
          <div className="example-category">
            <span className="example-cat-name">Food Delivery</span>
            <span className="example-cat-value">$156/mo</span>
          </div>
          <div className="example-category">
            <span className="example-cat-name">Fees</span>
            <span className="example-cat-value">$42/mo</span>
          </div>
        </div>

        <div className="example-subscriptions">
          <span className="example-sub-label">Detected subscriptions:</span>
          <div className="example-sub-list">
            <span className="example-sub-tag">Netflix $15.99</span>
            <span className="example-sub-tag">Spotify $12.99</span>
            <span className="example-sub-tag">Gym $49.99</span>
          </div>
        </div>
      </div>

      <p className="example-note">
        This is a sample result. Upload your statement to see your personalized analysis.
      </p>
    </div>
  )
}
