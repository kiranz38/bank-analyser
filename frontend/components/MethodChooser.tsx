'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, LayoutGrid, Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
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
    <div className="space-y-6">
      <h2 className="text-center text-xl font-semibold">Choose how to analyze your spending</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Upload Method - Recommended */}
        <Card
          className="group relative cursor-pointer border-2 border-primary/50 transition-all hover:border-primary hover:shadow-md"
          onClick={handleUploadSelect}
        >
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Badge className="absolute right-3 top-3">Recommended</Badge>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold">Upload Statement</h3>
            <p className="mt-1 text-sm text-muted-foreground">CSV or PDF file</p>
            <ul className="mt-4 space-y-2 text-left text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                No login required
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Processed privately
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Works worldwide
              </li>
            </ul>
            <span className="mt-5 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors group-hover:bg-primary/90">
              Upload now
            </span>
          </CardContent>
        </Card>

        {/* Bank Connect Method */}
        <Card
          className={cn(
            'group relative cursor-pointer border transition-all hover:shadow-md',
            !bankConnectEnabled && 'opacity-75'
          )}
          onClick={bankConnectEnabled ? handleBankConnectSelect : undefined}
        >
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Badge variant="secondary" className="absolute right-3 top-3">
              {bankConnectEnabled ? 'Beta' : 'Coming Soon'}
            </Badge>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <LayoutGrid className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold">Connect Bank</h3>
            <p className="mt-1 text-sm text-muted-foreground">Instant & automatic</p>
            <ul className="mt-4 space-y-2 text-left text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-muted-foreground" />
                Read-only access
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-muted-foreground" />
                US & UK banks only
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-muted-foreground" />
                Powered by Plaid
              </li>
            </ul>
            <span className="mt-5 inline-block rounded-md border px-4 py-2 text-sm font-medium transition-colors group-hover:bg-accent">
              {bankConnectEnabled ? 'Connect' : 'Join waitlist'}
            </span>
          </CardContent>
        </Card>
      </div>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        Your data is processed in memory only and never stored
      </p>
    </div>
  )
}
