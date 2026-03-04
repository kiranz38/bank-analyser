'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Upload, FileText, Plus, X, Info, Search, Shield, Check, HelpCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackConsentChecked } from '@/lib/analytics'

interface UploadFormProps {
  onAnalyze: (data: File[] | string) => void
  loading: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_TOTAL_SIZE = 30 * 1024 * 1024
const MAX_FILES = 12
const MAX_TEXT_SIZE = 5 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.csv', '.pdf']

interface UploadedFile {
  file: File
  id: string
}

export default function UploadForm({ onAnalyze, loading }: UploadFormProps) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [consentChecked, setConsentChecked] = useState(false)
  const [consentError, setConsentError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `"${file.name}" is not a supported format. Please upload CSV or PDF files.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB per file.`
    }
    return null
  }

  const addFiles = (newFiles: FileList | File[]) => {
    setFileError(null)
    const filesToAdd: UploadedFile[] = []
    let totalSize = files.reduce((sum, f) => sum + f.file.size, 0)

    for (const file of Array.from(newFiles)) {
      if (files.length + filesToAdd.length >= MAX_FILES) {
        setFileError(`Maximum ${MAX_FILES} files allowed.`)
        break
      }

      const error = validateFile(file)
      if (error) {
        setFileError(error)
        continue
      }

      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        setFileError(`Total file size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit.`)
        break
      }

      const isDuplicate = files.some(f => f.file.name === file.name && f.file.size === file.size)
      if (isDuplicate) continue

      totalSize += file.size
      filesToAdd.push({
        file,
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`
      })
    }

    if (filesToAdd.length > 0) {
      setFiles(prev => [...prev, ...filesToAdd])
      setText('')
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    setFileError(null)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setFileError(null)

    if (new Blob([newText]).size > MAX_TEXT_SIZE) {
      setFileError(`Text too large. Maximum size is ${MAX_TEXT_SIZE / (1024 * 1024)}MB.`)
      return
    }

    setText(newText)
    setFiles([])
  }

  const handleConsentChange = (checked: boolean) => {
    setConsentChecked(checked)
    if (checked) {
      setConsentError(false)
      trackConsentChecked()
    }
  }

  const handleSubmit = () => {
    if (!consentChecked) {
      setConsentError(true)
      return
    }
    if (files.length > 0) {
      onAnalyze(files.map(f => f.file))
    } else if (text.trim()) {
      onAnalyze(text.trim())
    }
  }

  const clearAll = () => {
    setFiles([])
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const hasData = files.length > 0 || text.trim().length > 0
  const canSubmit = hasData && !loading && !fileError && consentChecked
  const showMultiMonthTip = files.length > 0 && files.length < 3

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Upload your statement to reveal spending leaks</h2>
        <p className="mt-1 text-sm text-muted-foreground">No signup. Files auto-delete. We analyze transactions only.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          {/* Drag & drop zone */}
          <div
            className={cn(
              'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors',
              dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            {files.length > 0 ? (
              <div className="w-full space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    {files.length} file{files.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add more
                  </Button>
                </div>
                <ul className="space-y-1.5">
                  {files.map((f) => (
                    <li key={f.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm">
                      <span className="truncate">{f.file.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{(f.file.size / 1024).toFixed(0)}KB</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(f.id)
                          }}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${f.file.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearAll()
                  }}
                >
                  Clear all
                </button>
              </div>
            ) : (
              <>
                <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm">
                  <strong>Drop your bank statements here</strong> or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">CSV and PDF files up to 10MB each</p>
              </>
            )}
            {fileError && (
              <p className="mt-2 text-sm text-destructive">{fileError}</p>
            )}
          </div>

          {showMultiMonthTip && (
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs dark:bg-blue-950/30">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <strong>Tip:</strong> Upload 3+ months of statements for better subscription detection and spending pattern analysis.
              </span>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            We only read transaction description, date, and amount &mdash; not names or credentials.
          </p>

          <div className="relative flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or paste your transactions</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <textarea
            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={`Paste your bank statement data here...\n\nExample format:\nDate,Description,Amount\n2024-01-05,NETFLIX,-15.99\n2024-01-10,UBER EATS,-34.50\n2024-01-12,STARBUCKS,-5.75`}
            value={text}
            onChange={handleTextChange}
            disabled={files.length > 0}
          />

          {/* Consent */}
          <div className={cn(
            'flex items-start gap-3 rounded-lg border p-3',
            consentError && 'border-destructive'
          )}>
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => handleConsentChange(checked === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="consent" className="text-sm leading-tight">
                I confirm this is my own statement and I agree to AI processing.
              </Label>
              {consentError && (
                <p className="text-xs text-destructive">Please confirm before uploading.</p>
              )}
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            <Search className="mr-2 h-4 w-4" />
            Find My Money Leaks
            {files.length > 1 && ` (${files.length} files)`}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Your file is processed temporarily and deleted immediately.
          </p>
        </div>

        {/* Trust Box */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-primary" />
            What happens to your data?
          </div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {[
              'We only analyze transaction date, description, and amount.',
              'No names. No credentials.',
              'Files are processed temporarily and deleted immediately.',
              'We don\'t sell or share your data.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Instructions toggle */}
      <button
        className="mx-auto flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setShowInstructions(!showInstructions)}
      >
        <HelpCircle className="h-4 w-4" />
        How to download your bank statement
        <ChevronDown className={cn('h-4 w-4 transition-transform', showInstructions && 'rotate-180')} />
      </button>

      {showInstructions && (
        <div className="rounded-xl border bg-card p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { bank: 'ANZ', steps: ['Log in to ANZ Internet Banking', 'Go to your account and click "Transactions"', 'Click "Export" and select PDF or CSV', 'Choose date range and download'] },
              { bank: 'Westpac', steps: ['Log in to Westpac Online Banking', 'Select your account', 'Click "Export transactions"', 'Choose CSV or PDF format'] },
              { bank: 'CommBank', steps: ['Log in to NetBank', 'Go to "View accounts" → select account', 'Click "Export" at the top', 'Select format and date range'] },
              { bank: 'NAB', steps: ['Log in to NAB Internet Banking', 'Click on your account', 'Select "Export transactions"', 'Choose CSV and download'] },
            ].map((item) => (
              <div key={item.bank}>
                <h4 className="mb-2 font-semibold">{item.bank}</h4>
                <ol className="space-y-1 text-sm text-muted-foreground">
                  {item.steps.map((step, i) => (
                    <li key={i} className="pl-4" style={{ listStyleType: 'decimal', listStylePosition: 'inside' }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            <strong>Tip:</strong> For best results, upload 3+ months of statements. PDF statements work best. If you have issues, try exporting as CSV instead.
          </p>
        </div>
      )}
    </section>
  )
}
