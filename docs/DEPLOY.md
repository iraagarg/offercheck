# Deployment

How OfferCheck is deployed, and how to repeat it. Secrets are never typed on the command line or
committed: they are read from the local `.env` and piped to the host with `--stdin`.

## Live addresses

| Part | Host | Address |
|---|---|---|
| Website | Vercel | https://offercheck-delta.vercel.app |
| API | Railway | https://api-production-65c1.up.railway.app (`/health`) |
| ML service | Railway | private only: `http://ml.railway.internal:8000` (no public address) |
| Database | Neon | pooled URL for the app, direct URL for migrations |
| Redis | Upstash | `rediss://` URL |

## One-time setup

### Tools
```bash
brew install uv               # Python
corepack enable || npm i -g pnpm@12.4.1
vercel login                  # once, opens the browser
railway login                 # once, opens the browser
```

### Railway (API and ML service)
```bash
railway init --name offercheck
railway add --service ml
railway add --service api

# ML service: listen on :: so it is reachable over Railway's private network (IPv6 + IPv4).
railway variable set --service ml --skip-deploys PORT=8000 HOST=::

# API: non-secret settings
railway variable set --service api --skip-deploys PORT=3001 HOST=:: \
  ML_URL=http://ml.railway.internal:8000 \
  RAILWAY_DOCKERFILE_PATH=apps/api/Dockerfile \
  WEB_ORIGIN=https://offercheck-delta.vercel.app,https://offercheck-iraagargs-projects.vercel.app,http://localhost:3000

# API: secrets, piped from .env (never shown on screen)
get(){ grep -m1 "^$1=" .env | cut -d= -f2-; }
get DATABASE_URL | railway variable set --service api --skip-deploys --stdin DATABASE_URL
get REDIS_URL    | railway variable set --service api --skip-deploys --stdin REDIS_URL

# Public address for the API only
railway domain --service api --port 3001
```

### Vercel (website)
The project root is `apps/web`; Vercel installs the whole pnpm workspace and builds the shared package first
(`apps/web` build script). `ENABLE_EXPERIMENTAL_COREPACK=1` makes Vercel use the exact pnpm version from
`package.json` (`packageManager`), which the lockfile needs.
```bash
vercel api /v10/projects -X POST -F name=offercheck -F framework=nextjs -F rootDirectory=apps/web
vercel link --yes --project offercheck
printf "https://api-production-65c1.up.railway.app" | vercel env add NEXT_PUBLIC_API_URL production
printf "1" | vercel env add ENABLE_EXPERIMENTAL_COREPACK production
```

## Deploying a new version (from the repository root)
```bash
railway up services/ml --path-as-root --service ml --ci   # ML service (build context: services/ml)
railway up --service api --ci                             # API (build context: repository root)
vercel deploy --prod --yes                                # website
make smoke URL=https://api-production-65c1.up.railway.app # check
```
`.railwayignore` and `.vercelignore` keep `.env`, `data/`, the private docs and the notes at the repository root (every `.md` file
there except `README.md`) from being uploaded.

## Verify
- `make smoke URL=https://api-production-65c1.up.railway.app` returns `"status":"ok"`.
- https://offercheck-delta.vercel.app shows "All systems working".
- The ML service has no public address (only the API can reach it).

## Things to know
- **Neon cold start:** the free database suspends when idle; the first connection takes ~2 s. The API's
  database health check waits up to 5 s (Redis and ML: 2 s), so a waking database is not reported as down.
- **CORS:** if the website address changes (custom domain, new Vercel project), add it to `WEB_ORIGIN`.
- **Version shows `dev`:** Railway sets `RAILWAY_GIT_COMMIT_SHA` only for GitHub-triggered deploys.
  Connecting the services to the GitHub repository (automatic deploys) is planned for Phase 7.
- **Costs:** Railway trial = one-time $5 credit for 30 days; afterwards the Hobby plan ($5/month incl.
  $5 usage). Vercel Hobby and Neon/Upstash free tiers are enough for this project.

## Monitoring (UptimeRobot)
1. uptimerobot.com → **Add New Monitor** → type **HTTP(s)**.
2. URL: `https://api-production-65c1.up.railway.app/health`, interval 5 minutes.
3. Alert contact: your email. A 503 (database down) triggers an alert; "degraded" (200) does not.
