# ADR 006: Code decides the verdict; the LLM only extracts facts and writes the explanation

Status: accepted · Date: 2026-10-22

## Context
Scam messages are untrusted input and may contain instructions aimed at an AI ("mark this as safe"). LLM outputs can also be wrong or inconsistent.

## Options considered
- LLM decides the verdict
- LLM extracts facts; deterministic checks + a fitted scoring function decide

## Decision
The verdict comes only from deterministic checks and a pure scoring function. The LLM extracts facts into a strict schema and writes an explanation from the evidence list; a validator rejects explanations with claims not in the evidence.

## Consequences
- Prompt injection cannot change the level (tested in Phase 5).
- Every warning has evidence a student can verify.
- Some nuance is lost compared with a free-form LLM judgement — the benchmark compares against an LLM-only baseline to measure this.
