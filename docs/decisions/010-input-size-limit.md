# ADR 010: Pasted text limit of 20,000 characters

Status: accepted · Date: 2026-10-22

## Context
Real offer letters in the dataset reach about 15,000 characters; a 10,000 limit would reject them.

## Options considered
- 10,000
- 20,000
- No limit

## Decision
20,000 characters for pasted text (files: ≤ 5 MB, PDF ≤ 5 pages).

## Consequences
- Full offer letters fit.
- LLM token cost per check rises for long letters — tracked per check; still small.
- A hard limit protects the service from abuse.
