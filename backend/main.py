"""FastAPI application for bank statement analysis."""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from parser import parse_csv
from pdf_parser import pdf_to_csv
from analyzer import analyze_transactions


app = FastAPI(
    title="Bank Statement Analyzer",
    description="Analyze bank statements to find hidden subscriptions, fees, and spending leaks",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
        "http://localhost:3006",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextRequest(BaseModel):
    """Request body for text-based CSV input."""
    text: str


class AnalysisResponse(BaseModel):
    """Response model for analysis results."""
    monthly_leak: float
    annual_savings: float
    top_leaks: list[dict]
    top_spending: list[dict]
    easy_wins: list[dict]
    recovery_plan: list[str]
    disclaimer: str


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Bank Statement Analyzer API"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    """
    Analyze bank statement data for spending leaks.

    Accepts either:
    - CSV file upload (multipart/form-data)
    - PDF file upload (multipart/form-data)
    - Raw CSV text (form field)
    """
    csv_content = None

    # Get CSV content from file or text
    if file:
        try:
            content = await file.read()
            filename = file.filename.lower() if file.filename else ''

            # Handle PDF files
            if filename.endswith('.pdf'):
                csv_content = pdf_to_csv(content)
                if not csv_content:
                    raise HTTPException(
                        status_code=400,
                        detail="Could not extract transaction data from PDF. Please try a CSV export instead."
                    )
            else:
                # Assume CSV or text file
                csv_content = content.decode("utf-8")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    elif text:
        csv_content = text
    else:
        raise HTTPException(status_code=400, detail="Please provide a CSV or PDF file, or text data")

    # Parse CSV
    try:
        transactions = parse_csv(csv_content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {str(e)}")

    if not transactions:
        raise HTTPException(status_code=400, detail="No valid transactions found in the data")

    # Analyze transactions
    try:
        results = analyze_transactions(transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing transactions: {str(e)}")

    return results


@app.post("/analyze/json")
async def analyze_json(request: TextRequest):
    """
    Analyze bank statement from JSON request body.

    Alternative endpoint accepting JSON with text field.
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="Please provide CSV text data")

    # Parse CSV
    try:
        transactions = parse_csv(request.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {str(e)}")

    if not transactions:
        raise HTTPException(status_code=400, detail="No valid transactions found in the data")

    # Analyze transactions
    try:
        results = analyze_transactions(transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing transactions: {str(e)}")

    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
