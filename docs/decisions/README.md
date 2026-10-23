# Architecture Decision Records

- [ADR 001: One repository for web, api, ml and shared code](001-monorepo.md)
- [ADR 002: Fastify for the API](002-fastify-over-express.md)
- [ADR 003: PostgreSQL for stored results](003-postgresql-over-mongodb.md)
- [ADR 004: A separate Python service for PDF, OCR and the classifier](004-separate-python-ml-service.md)
- [ADR 005: Groq as the default LLM provider, Anthropic optional](005-groq-as-default-llm.md)
- [ADR 006: Code decides the verdict; the LLM only extracts facts and writes the explanation](006-code-decides-llm-only-extracts.md)
- [ADR 007: Three labels: scam, suspicious, legit](007-three-labels.md)
- [ADR 008: Grouped cross-validation and a fresh final test](008-grouped-evaluation.md)
- [ADR 009: The India dataset and labelling notes stay private](009-private-india-dataset.md)
- [ADR 010: Pasted text limit of 20,000 characters](010-input-size-limit.md)
- [ADR 011: Clear verdicts with measured confidence](011-clear-verdicts-with-confidence.md)
