'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Initialize theme — default to light; only honour saved preference if explicitly 'dark'
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const useDark = savedTheme === 'dark'
    setIsDarkMode(useDark)
    document.documentElement.classList.toggle('dark', useDark)
    // Ensure first-time visitors get light mode persisted
    if (!savedTheme) {
      localStorage.setItem('theme', 'light')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    document.documentElement.classList.toggle('dark', newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollThreshold = 10

      // Always show header at the top of the page
      if (currentScrollY < 50) {
        setIsVisible(true)
      }
      // Scrolling down - hide header
      else if (currentScrollY > lastScrollY + scrollThreshold) {
        setIsVisible(false)
        setMobileMenuOpen(false) // Close mobile menu when hiding
      }
      // Scrolling up - show header
      else if (currentScrollY < lastScrollY - scrollThreshold) {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <header className={`site-header ${isVisible ? 'header-visible' : 'header-hidden'}`}>
      <div className="header-container">
        <Link href="/" className="header-brand">
          <svg className="header-logo-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            {/* Wallet body */}
            <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            {/* Wallet fold/flap */}
            <path d="M3 7V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
            {/* Card clasp */}
            <rect x="15" y="10" width="6" height="4" rx="1" />
            {/* Leak drops - subtle coins falling */}
            <circle cx="6" cy="21" r="1.2" fill="currentColor" fillOpacity="0.45" stroke="none" />
            <circle cx="10" cy="22" r="1" fill="currentColor" fillOpacity="0.35" stroke="none" />
            <circle cx="13.5" cy="21.5" r="0.8" fill="currentColor" fillOpacity="0.25" stroke="none" />
          </svg>
          <span className="header-brand-text">Leaky Wallet</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          <Link href="/how-it-works" className="header-link">
            How it works
          </Link>
          <Link href="/pricing" className="header-link">
            Pricing
          </Link>
          <Link href="/example" className="header-link">
            Example
          </Link>
          <a
            href="https://buymeacoffee.com/joh38"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link header-support"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            Support
          </a>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="theme-toggle"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
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
            href="/how-it-works"
            className="header-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/pricing"
            className="header-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/example"
            className="header-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Example
          </Link>
          <a
            href="https://buymeacoffee.com/joh38"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link header-support"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            Support
          </a>
          {/* Dark Mode Toggle - Mobile */}
          <button
            onClick={() => {
              toggleDarkMode()
              setMobileMenuOpen(false)
            }}
            className="theme-toggle mobile-theme-toggle"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </nav>
      )}
    </header>
  )
}
