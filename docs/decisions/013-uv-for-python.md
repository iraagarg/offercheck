# ADR 013: uv for Python dependencies

Status: accepted · Date: 2026-10-24

## Context
The ML service needs reproducible installs (same versions on a laptop, in CI and in Docker) and fast builds.

## Options considered
- pip + venv + requirements.txt
- Poetry
- uv

## Decision
uv with `pyproject.toml` and a committed `uv.lock`; Docker installs with `uv sync --frozen`.

## Consequences
- Fast, locked, reproducible installs; one tool replaces pip, venv and pip-tools.
- `exclude-newer` gives the same 14-day supply-chain protection as pnpm (ADR 015).
- One more tool to install locally (`brew install uv`).
