'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface UploadFormProps {
  onAnalyze: (data: File[] | string) => void
  loading: boolean
}

// Security constants - must match backend
const MAX_FILE_SIZE = 10 * 1024 * 1024  // 10MB per file
const MAX_TOTAL_SIZE = 30 * 1024 * 1024 // 30MB total
const MAX_FILES = 12  // Max 12 files (1 year of monthly statements)
const MAX_TEXT_SIZE = 5 * 1024 * 1024   // 5MB
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `"${file.name}" is not a supported format. Please upload CSV or PDF files.`
    }
    // Check file size
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
      // Check max files
      if (files.length + filesToAdd.length >= MAX_FILES) {
        setFileError(`Maximum ${MAX_FILES} files allowed.`)
        break
      }

      // Validate file
      const error = validateFile(file)
      if (error) {
        setFileError(error)
        continue
      }

      // Check total size
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        setFileError(`Total file size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit.`)
        break
      }

      // Check for duplicates
      const isDuplicate = files.some(f => f.file.name === file.name && f.file.size === file.size)
      if (isDuplicate) {
        continue
      }

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

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setFileError(null)

    // Check text size
    if (new Blob([newText]).size > MAX_TEXT_SIZE) {
      setFileError(`Text too large. Maximum size is ${MAX_TEXT_SIZE / (1024 * 1024)}MB.`)
      return
    }

    setText(newText)
    setFiles([])
  }

  const handleSubmit = () => {
    if (files.length > 0) {
      onAnalyze(files.map(f => f.file))
    } else if (text.trim()) {
      onAnalyze(text.trim())
    }
  }

  const clearAll = () => {
    setFiles([])
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const canSubmit = (files.length > 0 || text.trim()) && !loading && !fileError
  const showMultiMonthTip = files.length > 0 && files.length < 3

  return (
    <section className="upload-section">
      <div className="card upload-card">
        <div
          className={`upload-area ${dragging ? 'dragging' : ''}`}
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
            className="upload-input"
          />
          {files.length > 0 ? (
            <div className="files-selected" onClick={(e) => e.stopPropagation()}>
              <div className="files-header">
                <span className="files-count">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  className="add-more-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add more
                </button>
              </div>
              <ul className="files-list">
                {files.map((f) => (
                  <li key={f.id} className="file-item">
                    <span className="file-name">{f.file.name}</span>
                    <span className="file-size">
                      {(f.file.size / 1024).toFixed(0)}KB
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(f.id)
                      }}
                      className="file-remove"
                      aria-label={`Remove ${f.file.name}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="clear-all-btn"
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
              <div className="upload-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p>
                <strong>Drop your bank statements here</strong> or click to browse
              </p>
              <p className="upload-formats">CSV and PDF files up to 10MB each</p>
            </>
          )}
          {fileError && (
            <p className="upload-error" style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {fileError}
            </p>
          )}
        </div>

        {/* Multi-month tip */}
        {showMultiMonthTip && (
          <div className="multi-month-tip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span>
              <strong>Tip:</strong> Upload 3+ months of statements for better subscription detection and spending pattern analysis.
            </span>
          </div>
        )}

        <p className="upload-trust-line">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Your files are processed in memory and immediately discarded.
        </p>

        <div className="or-divider">or paste your transactions</div>

        <textarea
          className="textarea"
          placeholder={`Paste your bank statement data here...

Example format:
Date,Description,Amount
2024-01-05,NETFLIX,-15.99
2024-01-10,UBER EATS,-34.50
2024-01-12,STARBUCKS,-5.75`}
          value={text}
          onChange={handleTextChange}
          disabled={files.length > 0}
        />

        {/* What you'll see outcome list */}
        <div className="outcome-list">
          <p className="outcome-title">What you'll see in seconds:</p>
          <ul>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Hidden subscriptions you forgot about
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Monthly spending leaks draining your account
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Estimated yearly savings potential
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Unexpected bank fees & charges
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Simple recovery steps to save money
            </li>
          </ul>
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Analyze My Spending
          {files.length > 1 && ` (${files.length} files)`}
        </button>
      </div>

      <button
        className="instructions-toggle"
        onClick={() => setShowInstructions(!showInstructions)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        How to download your bank statement
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: showInstructions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showInstructions && (
        <div className="instructions-panel">
          <div className="instructions-grid">
            <div className="instruction-item">
              <h4>ANZ</h4>
              <ol>
                <li>Log in to ANZ Internet Banking</li>
                <li>Go to your account and click "Transactions"</li>
                <li>Click "Export" and select PDF or CSV</li>
                <li>Choose date range and download</li>
              </ol>
            </div>
            <div className="instruction-item">
              <h4>Westpac</h4>
              <ol>
                <li>Log in to Westpac Online Banking</li>
                <li>Select your account</li>
                <li>Click "Export transactions"</li>
                <li>Choose CSV or PDF format</li>
              </ol>
            </div>
            <div className="instruction-item">
              <h4>CommBank</h4>
              <ol>
                <li>Log in to NetBank</li>
                <li>Go to "View accounts" → select account</li>
                <li>Click "Export" at the top</li>
                <li>Select format and date range</li>
              </ol>
            </div>
            <div className="instruction-item">
              <h4>NAB</h4>
              <ol>
                <li>Log in to NAB Internet Banking</li>
                <li>Click on your account</li>
                <li>Select "Export transactions"</li>
                <li>Choose CSV and download</li>
              </ol>
            </div>
          </div>
          <p className="instructions-note">
            <strong>Tip:</strong> For best results, upload 3+ months of statements. PDF statements work best. If you have issues, try exporting as CSV instead.
          </p>
        </div>
      )}
    </section>
  )
}
