"""FastAPI application for bank statement analysis."""

import os
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from parser import parse_csv
from pdf_parser import pdf_to_csv
from analyzer import analyze_transactions

# Configure logging - log errors server-side only
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_TEXT_SIZE = 5 * 1024 * 1024   # 5MB for pasted text
RATE_LIMIT = "10/minute"  # 10 requests per minute per IP

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Bank Statement Analyzer",
    description="Analyze bank statements to find hidden subscriptions, fees, and spending leaks",
    version="1.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration - allow frontend origins from env or defaults for local dev
cors_origins_env = os.getenv("CORS_ORIGINS", "")
cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

# Add default local development origins (only used in dev)
if not cors_origins:
    cors_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,  # Set to False - we don't need credentials
    allow_methods=["GET", "POST"],  # Only necessary methods
    allow_headers=["Content-Type"],  # Only necessary headers
)


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # HSTS - only enable if served over HTTPS in production
    if os.getenv("ENVIRONMENT") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


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


def validate_pdf_format(content: bytes) -> bool:
    """Validate that content is a valid PDF file."""
    # Check PDF magic bytes (%PDF-)
    if not content.startswith(b'%PDF'):
        return False
    # Check for PDF end marker (should contain %%EOF)
    if b'%%EOF' not in content[-1024:]:
        return False
    return True


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Bank Statement Analyzer API"}


@app.post("/analyze", response_model=AnalysisResponse)
@limiter.limit(RATE_LIMIT)
async def analyze(
    request: Request,
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    """
    Analyze bank statement data for spending leaks.

    Accepts either:
    - CSV file upload (multipart/form-data) - Max 10MB
    - PDF file upload (multipart/form-data) - Max 10MB
    - Raw CSV text (form field) - Max 5MB
    """
    csv_content = None

    # Get CSV content from file or text
    if file:
        try:
            # Read file content
            content = await file.read()

            # Validate file size FIRST
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB."
                )

            filename = file.filename.lower() if file.filename else ''

            # Handle PDF files
            if filename.endswith('.pdf'):
                # Validate PDF format
                if not validate_pdf_format(content):
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid PDF file. Please upload a valid PDF bank statement."
                    )

                csv_content = pdf_to_csv(content)
                if not csv_content:
                    raise HTTPException(
                        status_code=400,
                        detail="Could not extract transaction data from PDF. Please try a CSV export instead."
                    )
            else:
                # Assume CSV or text file
                try:
                    csv_content = content.decode("utf-8")
                except UnicodeDecodeError:
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid file encoding. Please upload a UTF-8 encoded CSV file."
                    )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"File processing error: {e}", exc_info=True)
            raise HTTPException(
                status_code=400,
                detail="Failed to process file. Please check the format and try again."
            )
    elif text:
        # Validate text size
        if len(text.encode('utf-8')) > MAX_TEXT_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Text too large. Maximum size is {MAX_TEXT_SIZE // (1024 * 1024)}MB."
            )
        csv_content = text
    else:
        raise HTTPException(status_code=400, detail="Please provide a CSV or PDF file, or text data")

    # Parse CSV
    try:
        transactions = parse_csv(csv_content)
    except ValueError as e:
        # ValueError is raised for known parsing issues - safe to show
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"CSV parsing error: {e}", exc_info=True)
        raise HTTPException(
            status_code=400,
            detail="Failed to parse the data. Please check the format and try again."
        )

    if not transactions:
        raise HTTPException(status_code=400, detail="No valid transactions found in the data")

    # Analyze transactions
    try:
        results = analyze_transactions(transactions)
    except Exception as e:
        logger.error(f"Analysis error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Analysis failed. Please try again or use a different file format."
        )

    return results


@app.post("/analyze/json")
@limiter.limit(RATE_LIMIT)
async def analyze_json(request: Request, body: TextRequest):
    """
    Analyze bank statement from JSON request body.

    Alternative endpoint accepting JSON with text field.
    """
    if not body.text:
        raise HTTPException(status_code=400, detail="Please provide CSV text data")

    # Validate text size
    if len(body.text.encode('utf-8')) > MAX_TEXT_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Text too large. Maximum size is {MAX_TEXT_SIZE // (1024 * 1024)}MB."
        )

    # Parse CSV
    try:
        transactions = parse_csv(body.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"CSV parsing error: {e}", exc_info=True)
        raise HTTPException(
            status_code=400,
            detail="Failed to parse the data. Please check the format and try again."
        )

    if not transactions:
        raise HTTPException(status_code=400, detail="No valid transactions found in the data")

    # Analyze transactions
    try:
        results = analyze_transactions(transactions)
    except Exception as e:
        logger.error(f"Analysis error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Analysis failed. Please try again or use a different file format."
        )

    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
