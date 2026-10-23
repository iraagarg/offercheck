# ADR 005: Groq as the default LLM provider, Anthropic optional

Status: accepted · Date: 2026-10-22

## Context
The LLM does two small jobs per request (fact extraction, explanation). Speed and cost matter more than maximum reasoning power.

## Options considered
- One provider only
- Provider abstraction with Groq default and Anthropic fallback
- Self-hosted model

## Decision
A small provider interface; `LLM_PROVIDER=groq` by default, `anthropic` optional; model from `LLM_MODEL`.

## Consequences
- Fast responses keep p95 latency low; costs stay small.
- Switching provider is a config change, and both are measured in the benchmark.
- Exact model names and prices are verified from official docs when Phase 4 is built.
