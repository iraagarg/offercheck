# ADR 007: Three labels: scam, suspicious, legit

Status: accepted · Date: 2026-10-22

## Context
Many real messages ask for no money but are not honest offers (fake shortlisting, mandatory 'program' webinars, social-media follow requirements). Forcing them into scam or legit would teach wrong rules (e.g. 'WhatsApp = scam').

## Options considered
- Two labels
- Three labels

## Decision
Three labels, defined in the private labelling guide. A scam is a lie used to take something valuable (money, free work, referrals, data); suspicious is a grey area with no clear lie-for-gain.

## Consequences
- The main benchmark is scam vs legit; suspicious messages get their own report (expected: Medium).
- The product output maps naturally to the verdicts Scam / Suspicious / Looks legit (ADR 011).
- Labelling needs more care; every borderline decision is recorded in the guide.
