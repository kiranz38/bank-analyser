'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CheckCircle, LayoutGrid, AlertCircle, X } from 'lucide-react'
import { trackWaitlistSubmitted } from '@/lib/analytics'

interface WaitlistFormProps {
  onClose: () => void
  onBack: () => void
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'OTHER', name: 'Other' },
]

export default function WaitlistForm({ onClose, onBack }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, country }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to join waitlist')
      }

      trackWaitlistSubmitted(country)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <CheckCircle className="mb-4 h-12 w-12 text-emerald-500" />
          <h3 className="text-lg font-semibold">You&apos;re on the list!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll notify you when bank connect is available in your region.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={onBack}>Try upload instead</Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative mx-auto max-w-md">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </Button>

      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <LayoutGrid className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Join the Bank Connect Waitlist</CardTitle>
        <p className="text-sm text-muted-foreground">
          Bank connect is currently in beta for US and UK users.
          Join the waitlist to get notified when it&apos;s available in your region.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="waitlist-email">Email</Label>
            <Input
              id="waitlist-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="waitlist-country">Country</Label>
            <select
              id="waitlist-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select your country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Joining...' : 'Join Waitlist'}
            </Button>
            <Button type="button" variant="outline" onClick={onBack}>
              Back to options
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          We&apos;ll only email you about bank connect availability. No spam.
        </p>
      </CardContent>
    </Card>
  )
}
