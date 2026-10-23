# ADR 004: A separate Python service for PDF, OCR and the classifier

Status: accepted · Date: 2026-10-22

## Context
PDF text extraction, OCR (Tesseract with Hindi) and scikit-learn models are mature in Python, weaker in Node.

## Options considered
- Do everything in Node
- Separate Python FastAPI service
- Serverless functions

## Decision
A small FastAPI service (`/extract`, `/classify`) called by the API.

## Consequences
- Uses the best libraries for each job; the benchmark (also Python) reuses the same classifier code.
- One more deploy target and a network hop — mitigated by timeouts and an `unavailable` fallback.
- If the ML service is down, text checks still work.
