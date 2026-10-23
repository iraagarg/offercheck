# ADR 002: Fastify for the API

Status: accepted · Date: 2026-10-22

## Context
The API validates every input, runs many checks in parallel with timeouts, and needs structured logs and fast tests.

## Options considered
- Express
- Fastify
- NestJS

## Decision
Fastify.

## Consequences
- Built-in schema-based validation hooks, structured logging (pino) and `inject()` for testing requests without a running server.
- Lower overhead than Express; less framework weight than NestJS for a small service.
- Smaller ecosystem than Express — acceptable; the plugins needed (CORS, rate limit, multipart, helmet) exist.
