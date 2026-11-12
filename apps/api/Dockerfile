# Build context: repository root (the API needs the shared package).
FROM node:24.22.1-bookworm-slim AS build
RUN npm install --global pnpm@12.4.1
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile --filter @offercheck/api...
RUN pnpm --filter @offercheck/shared build && pnpm --filter @offercheck/api build
# A self-contained copy of the API with only production dependencies.
RUN pnpm --filter @offercheck/api deploy --prod /out

FROM node:24.22.1-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=3001
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/health').then((r) => process.exit(r.status < 500 ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/server.js"]
