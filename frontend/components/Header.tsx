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
import { Wallet, Sun, Moon, Menu, Coffee, LogOut, LayoutDashboard, Settings, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

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

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? '?'

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
                  <button className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-1 text-sm font-medium text-foreground hover:bg-accent transition-colors outline-none">
                    {session.user.image && !avatarError ? (
                      <img src={session.user.image} alt="" className="h-7 w-7 rounded-full object-cover" onError={() => setAvatarError(true)} />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                        {userInitials}
                      </span>
                    )}
                    <span className="max-w-[120px] truncate">
                      {session.user.name || session.user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{session.user.name || session.user.email?.split('@')[0]}</p>
                    {session.user.email && (
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
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
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="gap-2 text-destructive focus:text-destructive">
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

        {/* Mobile: avatar dropdown (if logged in) + theme toggle + sheet trigger */}
        <div className="flex items-center gap-1 md:hidden">
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 rounded-full py-1 pl-1 pr-1.5 outline-none hover:bg-accent transition-colors">
                  {session.user.image && !avatarError ? (
                    <img src={session.user.image} alt="" className="h-7 w-7 rounded-full object-cover" onError={() => setAvatarError(true)} />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      {userInitials}
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{session.user.name || session.user.email?.split('@')[0]}</p>
                  {session.user.email && (
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  )}
                </div>
                <DropdownMenuSeparator />
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
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
                {isLoggedIn && (
                  <div className="mb-3 flex items-center gap-3 rounded-lg bg-accent px-3 py-2.5">
                    {session.user.image && !avatarError ? (
                      <img src={session.user.image} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" onError={() => setAvatarError(true)} />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {userInitials}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{session.user.name || session.user.email?.split('@')[0]}</p>
                      {session.user.email && (
                        <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                      )}
                    </div>
                  </div>
                )}
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
