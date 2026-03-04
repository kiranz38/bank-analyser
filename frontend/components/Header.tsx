'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Wallet, Sun, Moon, Menu, Coffee, User, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const useDark = savedTheme === 'dark'
    setIsDarkMode(useDark)
    document.documentElement.classList.toggle('dark', useDark)
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

      if (currentScrollY < 50) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY + scrollThreshold) {
        setIsVisible(false)
        setMobileOpen(false)
      } else if (currentScrollY < lastScrollY - scrollThreshold) {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const isLoggedIn = status === 'authenticated' && session?.user

  const navLinks = [
    { href: '/how-it-works', label: 'How it works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/example', label: 'Example' },
  ]

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-sm transition-transform duration-300',
        isVisible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Brand */}
        <a
          href="/"
          className="flex items-center gap-2 font-bold"
          onClick={() => sessionStorage.removeItem('leaky_wallet_results')}
        >
          <Wallet className="h-5 w-5 text-primary" />
          <span>Leaky Wallet</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://buymeacoffee.com/joh38"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Coffee className="h-4 w-4" />
            Support
          </a>

          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <User className="h-4 w-4" />
                    {session.user.name || session.user.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : status !== 'loading' ? (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          ) : null}

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>

        {/* Mobile: theme toggle + sheet trigger */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href="https://buymeacoffee.com/joh38"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                  onClick={() => setMobileOpen(false)}
                >
                  <Coffee className="h-4 w-4" />
                  Buy me a coffee
                </a>

                <div className="my-2 h-px bg-border" />

                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/account"
                      className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/' })
                        setMobileOpen(false)
                      }}
                      className="rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-accent"
                    >
                      Sign out
                    </button>
                  </>
                ) : status !== 'loading' ? (
                  <>
                    <Link
                      href="/login"
                      className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
