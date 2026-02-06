interface ShareSummary {
  monthly_leak: number
  annual_savings: number
  top_categories: Array<{ category: string; monthly: number }>
  subscription_count: number
  tagline: string
}

interface ShareCardProps {
  shareSummary: ShareSummary | null
  onShare?: (platform: string) => void
}

export default function ShareCard({ shareSummary, onShare }: ShareCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (!shareSummary) {
    return null
  }

  const handleShare = (platform: string) => {
    if (onShare) {
      onShare(platform)
    }
  }

  const shareText = `I found ${formatCurrency(shareSummary.annual_savings)}/year in hidden spending leaks using this free tool!`
  const shareUrl = 'https://whereismymoneygo.com'

  return (
    <div className="share-card-section">
      {/* Visual share card that can be screenshot */}
      <div className="share-card" id="share-card">
        <div className="share-card-header">
          <div className="share-card-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="share-card-brand">Where's My Money Going?</span>
        </div>

        <div className="share-card-content">
          <div className="share-card-headline">
            <span className="share-card-label">I discovered</span>
            <span className="share-card-amount">{formatCurrency(shareSummary.annual_savings)}</span>
            <span className="share-card-period">in hidden spending per year</span>
          </div>

          <div className="share-card-stats">
            <div className="share-card-stat">
              <span className="share-stat-value">{formatCurrency(shareSummary.monthly_leak)}</span>
              <span className="share-stat-label">Monthly leaks</span>
            </div>
            <div className="share-card-stat">
              <span className="share-stat-value">{shareSummary.subscription_count}</span>
              <span className="share-stat-label">Subscriptions</span>
            </div>
          </div>

          {shareSummary.top_categories.length > 0 && (
            <div className="share-card-categories">
              <span className="share-categories-label">Top spending:</span>
              <div className="share-categories-list">
                {shareSummary.top_categories.slice(0, 3).map((cat, index) => (
                  <span key={index} className="share-category-tag">
                    {cat.category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="share-card-footer">
          <span>Analyze your spending free at</span>
          <span className="share-card-url">whereismymoneygo.com</span>
        </div>
      </div>

      {/* Share buttons */}
      <div className="share-actions">
        <p className="share-cta">Found savings? Share with friends & family</p>

        <div className="share-buttons">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-twitter"
            title="Share on Twitter"
            onClick={() => handleShare('twitter')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>Twitter</span>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-facebook"
            title="Share on Facebook"
            onClick={() => handleShare('facebook')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-whatsapp"
            title="Share on WhatsApp"
            onClick={() => handleShare('whatsapp')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl)
              handleShare('copy')
              alert('Link copied!')
            }}
            className="share-btn share-copy"
            title="Copy link"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  )
}
