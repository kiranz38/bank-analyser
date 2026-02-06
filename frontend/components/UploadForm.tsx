'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface UploadFormProps {
  onAnalyze: (data: File | string) => void
  loading: boolean
}

export default function UploadForm({ onAnalyze, loading }: UploadFormProps) {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedFileRef = useRef<File | null>(null)

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

    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.pdf'))) {
      setFileName(file.name)
      selectedFileRef.current = file
      setText('')
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      selectedFileRef.current = file
      setText('')
    }
  }

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setFileName(null)
    selectedFileRef.current = null
  }

  const handleSubmit = () => {
    if (selectedFileRef.current) {
      onAnalyze(selectedFileRef.current)
    } else if (text.trim()) {
      onAnalyze(text.trim())
    }
  }

  const clearFile = () => {
    setFileName(null)
    selectedFileRef.current = null
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const canSubmit = (selectedFileRef.current || text.trim()) && !loading

  return (
    <section className="upload-section">
      <div className="card upload-card">
        <div
          className={`upload-area ${dragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !fileName && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.pdf"
            onChange={handleFileChange}
            className="upload-input"
          />
          {fileName ? (
            <div className="file-selected">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>{fileName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  clearFile()
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: 'var(--muted)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
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
                <strong>Drop your bank statement here</strong> or click to browse
              </p>
              <p className="upload-formats">Supports CSV and PDF files</p>
            </>
          )}
        </div>

        <p className="upload-trust-line">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Your file is processed in memory and immediately discarded.
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
            <strong>Tip:</strong> PDF statements work best. If you have issues, try exporting as CSV instead.
          </p>
        </div>
      )}
    </section>
  )
}
