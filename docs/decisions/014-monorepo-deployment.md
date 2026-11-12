# ADR 014: How the monorepo is deployed

Status: accepted · Date: 2026-10-24

## Context
The repository holds three deployable parts with different hosts.

## Options considered
- One host for everything
- Vercel for the website, Railway for the API and ML service (Docker)

## Decision
Vercel builds only `apps/web` (it builds the shared package first). Railway builds `apps/api` from `apps/api/Dockerfile` with the repository root as build context (it needs the shared package) and `services/ml` from its own Dockerfile. Both Dockerfiles are multi-stage, run as a non-root user and have health checks.

## Consequences
- Each part uses the host best suited to it; the website gets Vercel's CDN and preview deploys.
- The API image contains only production dependencies (`pnpm deploy --prod`).
- Two dashboards to manage; settings are documented in docs/DEPLOY.md.
