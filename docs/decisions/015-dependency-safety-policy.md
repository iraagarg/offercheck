# ADR 015: Dependency safety: 14-day release age, security exceptions, compatibility pins

Status: accepted · Date: 2026-10-24

## Context
New package releases are occasionally broken or even malicious (supply-chain attacks), and these are usually caught within days. But known security holes must be patched quickly.

## Options considered
- Always use the latest version
- Only versions at least 14 days old, with no exceptions
- 14-day minimum age with narrow, documented security exceptions

## Decision
All dependencies are pinned to exact versions. pnpm `minimumReleaseAge: 20160` (14 days) and uv `exclude-newer` enforce the rule for every package, including indirect ones. Exceptions are allowed only for versions that fix a published advisory, listed by exact name and version with the advisory IDs, and removed once they are 14 days old. CI fails on high or critical vulnerabilities (`pnpm audit`, `pip-audit`). GitHub Actions are pinned to full commit SHAs. Compatibility pins: TypeScript 6.0 (typescript-eslint supports < 6.1) and ESLint 9 (eslint-plugin-react, used by Next.js, does not support ESLint 10).

## Consequences
- Brand-new releases cannot slip in through indirect dependencies.
- Example: Next.js 16.3.8 (old enough) had two critical advisories, so 16.4.2 is used as a documented exception.
- Upgrades are deliberate: bump the pin, check the age and the audit, run CI.
- Example (2026-11-12): new advisories in zod, fast-uri and minimatch were fixed by moving to versions that
  are now older than 14 days (zod 4.6.7, Fastify 5.12.7, fast-uri 3.1.9 / 4.2.3); the earlier security
  exceptions were removed because those versions passed the 14-day age.

## Accepted risks (re-check at every phase)
| Package | Severity | Why accepted | Revisit when |
|---|---|---|---|
| minimatch 10.2.6 (GHSA-g3hv-75wg-m249, denial of service) | moderate | Only inside the development-time lint tool (typescript-eslint); never shipped to production and never processes user input. No typescript-eslint release depends on the fixed minimatch 11 yet. | typescript-eslint moves to minimatch ≥ 11.0.1 |
