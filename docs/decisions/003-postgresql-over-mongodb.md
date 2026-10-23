# ADR 003: PostgreSQL for stored results

Status: accepted · Date: 2026-10-22

## Context
Each check produces one result with many signals; the benchmark and dashboards need joins and aggregates (e.g. most common red signals).

## Options considered
- MongoDB (used in an earlier project)
- PostgreSQL

## Decision
PostgreSQL (Neon) with Drizzle ORM and versioned migrations.

## Consequences
- Results and signals are naturally relational (one check → many signals) with a foreign key.
- SQL aggregates make the statistics easy; JSONB still covers flexible `details`.
- Choosing per problem (MongoDB before, PostgreSQL here) is a deliberate, explainable choice.
