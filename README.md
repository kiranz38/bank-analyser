# Bank Statement Analyzer

Analyze your bank statements to find hidden subscriptions, fees, and spending leaks.

## Features

- **CSV Upload**: Support for various bank statement formats
- **Smart Detection**: Automatically identifies columns and normalizes data
- **Subscription Detection**: Finds recurring charges
- **Fee Detection**: Identifies bank fees, ATM charges, overdrafts
- **Food Delivery Tracking**: Aggregates spending on delivery apps
- **Micro Leak Detection**: Spots small purchases that add up
- **Personalized Recovery Plan**: Actionable steps to save money

## Quick Start

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

Open http://localhost:3000 in your browser.

## Environment Variables

Create a `.env` file in the backend directory (optional):

```
ANTHROPIC_API_KEY=sk-ant-...
```

If provided, Claude will enhance the analysis with smarter categorization and personalized suggestions.

## Testing

Use the sample data in `tests/sample.csv` to test the analyzer.

## Privacy

- Your data is processed locally and never stored
- No user accounts or tracking
- Analysis happens in memory only

## License

MIT
