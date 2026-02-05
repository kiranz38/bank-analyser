# Bank Statement Analyzer - Architecture

## Overview

A full-stack application for analyzing bank statements to identify spending leaks, subscriptions, and fees.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (Port 3000)             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │  │
│  │  │ UploadForm  │  │ ResultCards │  │   SEO/Meta   │   │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST /analyze
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                FastAPI Backend (Port 8000)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    main.py                            │  │
│  │              POST /analyze endpoint                   │  │
│  │         (multipart/form-data or JSON)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│              ┌───────────────┼───────────────┐              │
│              ▼               ▼               ▼              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │   parser.py   │  │  analyzer.py  │  │claude_client  │   │
│  │               │  │               │  │     .py       │   │
│  │ CSV parsing   │  │ Heuristic     │  │ Claude API    │   │
│  │ Column detect │  │ detection     │  │ enhancement   │   │
│  │ Normalization │  │ Categorize    │  │ (optional)    │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     JSON Response                            │
│  {                                                          │
│    "monthly_leak": 487.50,                                  │
│    "annual_savings": 5850.00,                               │
│    "top_leaks": [...],                                      │
│    "easy_wins": [...],                                      │
│    "recovery_plan": [...]                                   │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Frontend (Next.js)

- **app/layout.tsx**: Root layout with SEO metadata
- **app/page.tsx**: Main page with upload form and results
- **components/UploadForm.tsx**: CSV file upload and text paste
- **components/ResultCards.tsx**: Display analysis results

### Backend (FastAPI)

- **main.py**: API endpoints and CORS configuration
- **parser.py**: CSV parsing with heuristic column detection
- **analyzer.py**: Spending analysis with pattern detection
- **claude_client.py**: Optional Claude API integration

## Data Flow

1. User uploads CSV file or pastes text
2. Frontend sends POST request to `/analyze`
3. Backend parses CSV and detects columns
4. Heuristic analyzer identifies spending patterns
5. (Optional) Claude enhances analysis
6. JSON results returned to frontend
7. Results displayed in cards

## Heuristic Detection

### Subscriptions
- Known services: Netflix, Spotify, gyms, etc.
- Pattern: Same merchant, similar amounts, monthly frequency

### Fees
- Keywords: FEE, CHARGE, OVERDRAFT, ATM, SERVICE
- Bank and service charges

### Food Delivery
- Keywords: UBER EATS, DOORDASH, DELIVEROO, etc.
- Aggregated by service

### Micro Leaks
- Small transactions (<$10) with high frequency (10+)
- Coffee shops, convenience stores

## Privacy

- No data persistence
- Processing in memory only
- No user accounts or tracking
- Data never leaves the server

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...  # Optional, enables Claude enhancement
```

## Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Access at http://localhost:3000
