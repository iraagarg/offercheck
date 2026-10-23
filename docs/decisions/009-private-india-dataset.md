# ADR 009: The India dataset and labelling notes stay private

Status: accepted · Date: 2026-10-22

## Context
The dataset and labelling guide name real companies next to 'scam' or 'suspicious' labels. Publishing that could be unfair or legally risky.

## Options considered
- Publish everything
- Keep private; publish only aggregate results
- Publish an anonymised copy

## Decision
Keep `data/india/`, the labelling guide and the red-flags notes out of git. Publish aggregate results only; decide in Phase 2 whether an anonymised copy (company names and domains masked) is useful.

## Consequences
- Reproducibility is weaker for outside readers — the method, code and aggregate numbers are still public.
- The product itself never names a company as a fraud.
