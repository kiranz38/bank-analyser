'use client'

import { trackMethodUploadSelected, trackMethodBankConnectSelected } from '@/lib/analytics'

interface MethodChooserProps {
  onSelectUpload: () => void
  onSelectBankConnect: () => void
  bankConnectEnabled: boolean
}

export default function MethodChooser({
  onSelectUpload,
  onSelectBankConnect,
  bankConnectEnabled
}: MethodChooserProps) {
  const handleUploadSelect = () => {
    trackMethodUploadSelected()
    onSelectUpload()
  }

  const handleBankConnectSelect = () => {
    trackMethodBankConnectSelected()
    onSelectBankConnect()
  }

  return (
    <div className="method-chooser">
      <h2 className="method-chooser-title">Choose how to analyze your spending</h2>

      <div className="method-cards">
        {/* Upload Method - Default/Highlighted */}
        <button
          className="method-card method-card-primary"
          onClick={handleUploadSelect}
        >
          <div className="method-card-badge">Recommended</div>
          <div className="method-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h3 className="method-card-title">Upload Statement</h3>
          <p className="method-card-subtitle">CSV or PDF file</p>
          <ul className="method-card-features">
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              No login required
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Processed privately
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Works worldwide
            </li>
          </ul>
          <span className="method-card-cta">Upload now</span>
        </button>

        {/* Bank Connect Method */}
        <button
          className="method-card method-card-secondary"
          onClick={handleBankConnectSelect}
          disabled={!bankConnectEnabled}
        >
          {!bankConnectEnabled && (
            <div className="method-card-badge method-card-badge-beta">Coming Soon</div>
          )}
          {bankConnectEnabled && (
            <div className="method-card-badge method-card-badge-beta">Beta</div>
          )}
          <div className="method-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <h3 className="method-card-title">Connect Bank</h3>
          <p className="method-card-subtitle">Instant & automatic</p>
          <ul className="method-card-features">
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Read-only access
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              US & UK banks only
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Powered by Plaid
            </li>
          </ul>
          <span className="method-card-cta">
            {bankConnectEnabled ? 'Connect' : 'Join waitlist'}
          </span>
        </button>
      </div>

      <p className="method-chooser-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Your data is processed in memory only and never stored
      </p>
    </div>
  )
}
