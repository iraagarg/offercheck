# ADR 011: Clear verdicts with measured confidence

Status: accepted · Date: 2026-10-23 (replaces the earlier "Low / Medium / High risk signals, never say safe" wording)

## Context
A student needs a clear answer. Wording like "Low risk signals" and never saying a message is fine makes
the tool feel unsure and less useful than asking a chatbot. At the same time, no tool can guarantee what
happens after a message, and scammers often impersonate real companies.

## Options considered
- Risk levels only (Low / Medium / High risk signals), never a positive verdict
- Clear verdicts with "100% safe" for clean messages
- Clear verdicts (Scam / Suspicious / Looks legit) with a measured confidence level

## Decision
Clear verdicts — **Scam**, **Suspicious**, **Looks legit** — each with a confidence level (`high` / `medium`).
"High confidence" is only allowed where cross-validation shows the verdict is right at least 95% of the time
and the checks that apply actually ran. The verdict is about the message ("this message is a scam — it
pretends to be X"), never a declaration that a named company is a fraud. No "100% safe" or "guaranteed".

## Consequences
- Students get a direct answer they can act on, backed by evidence and a measured confidence.
- The benchmark must also measure the accuracy of "high confidence" verdicts.
- "Looks legit" is still not a promise: the result reminds students to apply through official websites.
