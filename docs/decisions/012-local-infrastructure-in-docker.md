# ADR 012: Local PostgreSQL and Redis in Docker; Neon and Upstash only in production

Status: accepted · Date: 2026-10-24

## Context
Developers (and CI) need to run the whole system without cloud accounts, and tests must never touch real data.

## Options considered
- Point local development at Neon and Upstash
- Run PostgreSQL and Redis locally in Docker Compose

## Decision
`docker compose` runs PostgreSQL 18 and Redis 8 locally; `make up` starts web, api, ml and both stores with no secrets. Production uses Neon and Upstash through environment variables.

## Consequences
- `make up` works from a clean clone and in CI.
- Local data is disposable; the cloud database can never be damaged by a test.
- Small differences between local and cloud services are possible — the deployed `/health` check catches connection problems early.
