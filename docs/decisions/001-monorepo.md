# ADR 001: One repository for web, api, ml and shared code

Status: accepted · Date: 2026-10-22

## Context
OfferCheck has four parts (web, api, ml service, shared schemas) that must agree on the same request/response shapes.

## Options considered
- Separate repositories per part
- One monorepo with pnpm workspaces (Python service alongside)

## Decision
One monorepo with pnpm workspaces. `packages/shared` holds the Zod schemas used by both web and api; the Python service lives in `services/ml`.

## Consequences
- A change to the API contract is made once and type-checked everywhere in the same commit.
- One CI pipeline and one `make up` for the whole system.
- Mixed languages (TypeScript + Python) need two toolchains in CI — accepted.
