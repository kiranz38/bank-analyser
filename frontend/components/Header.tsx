'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="header-container">
        <Link href="/" className="header-brand">
          <div className="header-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="header-brand-text">Where Is My Money Going?</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          <Link href="/bank-statement-analyzer" className="header-link">
            How it works
          </Link>
          <Link href="/privacy" className="header-link">
            Privacy
          </Link>
          <a
            href="https://buymeacoffee.com/joh38"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Support
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="header-nav mobile-nav">
          <Link
            href="/bank-statement-analyzer"
            className="header-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/privacy"
            className="header-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Privacy
          </Link>
          <a
            href="https://buymeacoffee.com/joh38"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Support
          </a>
        </nav>
      )}
    </header>
  )
}
