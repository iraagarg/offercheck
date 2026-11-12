.PHONY: install up down logs test lint typecheck format smoke

API_PORT ?= 3001
URL ?= http://localhost:$(API_PORT)

install: ## Install all dependencies (Node + Python)
	pnpm install --frozen-lockfile
	cd services/ml && uv sync --frozen

up: ## Build and start the whole system locally (web on :3000, api on :3001; override with WEB_PORT / API_PORT)
	docker compose up -d --build --wait

down: ## Stop everything
	docker compose down

logs: ## Follow the logs of all services
	docker compose logs -f

test: ## Run every test
	pnpm --filter @offercheck/shared build
	pnpm test
	cd services/ml && uv run pytest -q

lint: ## Check code style
	pnpm lint
	cd services/ml && uv run ruff check . && uv run ruff format --check .

typecheck: ## Check types
	pnpm --filter @offercheck/shared build
	pnpm typecheck
	cd services/ml && uv run mypy app tests

format: ## Auto-format code
	pnpm format
	cd services/ml && uv run ruff format .

smoke: ## Check a running API: make smoke URL=https://your-api.example
	@curl -fsS $(URL)/health && echo
