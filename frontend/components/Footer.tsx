import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Lock } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <span className="text-lg font-bold">Leaky Wallet</span>
            <p className="mt-2 text-sm text-muted-foreground">
              Free privacy-first bank statement analyzer.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              For informational purposes only. Not financial advice.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/how-it-works" className="transition-colors hover:text-foreground">How it works</Link>
              <Link href="/example" className="transition-colors hover:text-foreground">Example Report</Link>
              <Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
              <Link href="/banks" className="transition-colors hover:text-foreground">Bank Connect</Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">Terms of Use</Link>
            </nav>
            <p className="mt-3 text-xs text-muted-foreground">
              <a href="mailto:support@whereismymoneygo.com" className="transition-colors hover:text-foreground">
                support@whereismymoneygo.com
              </a>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">&copy; {currentYear} whereismymoneygo.com</p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Trust Line */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span>We never store your financial data. Analysis runs in memory only.</span>
        </div>
      </div>
    </footer>
  )
}
