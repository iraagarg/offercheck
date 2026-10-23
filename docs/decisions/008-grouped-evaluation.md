# ADR 008: Grouped cross-validation and a fresh final test

Status: accepted · Date: 2026-10-22

## Context
The main dataset has 118 messages (40 scams). A 20% hold-out would test only ~8 scams — too few for a meaningful score. Some scam letters are near-copies under different company names.

## Options considered
- Single 60/20/20 split
- Grouped, stratified 5-fold cross-validation (repeated) + a final test on messages collected after the system is frozen

## Decision
Grouped stratified 5-fold cross-validation, repeated with 5 seeds, grouped by the `group` column. Settings that are learned from scores (scoring weights, thresholds, confidence margin) are fitted on out-of-fold scores from an inner grouped cross-validation (nested), so no number is tuned on predictions the model made about its own training data. Confidence intervals by group-level bootstrap. The final locked test is `fresh_test.csv` (messages from 2026-10-21 onwards), scored once after the system is frozen.

## Consequences
- Every message is tested once per repeat; near-copies never leak between training and test.
- The final number comes from data that did not exist while the system was built.
- More computation per benchmark run — negligible at this size.
