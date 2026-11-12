import { randomUUID } from "node:crypto";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { healthResponseSchema, type HealthResponse } from "@offercheck/shared";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import { DEFAULT_PROBE_TIMEOUTS_MS, runProbe, type ProbeTimeouts, type Probes } from "./probes.js";

export interface AppOptions {
  probes: Probes;
  probeTimeoutsMs?: ProbeTimeouts;
  webOrigins: string[];
  version: string;
  logger?: FastifyServerOptions["logger"];
}

interface ErrorBody {
  error: { code: string; message: string; requestId: string };
}

export async function buildApp(options: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
    genReqId: () => `req_${randomUUID()}`,
  });

  // Every response carries the request id, so a user-reported problem can be found in the logs.
  app.addHook("onSend", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });

  await app.register(helmet);
  await app.register(cors, { origin: options.webOrigins, methods: ["GET", "POST"] });

  app.get("/health", async (_request, reply) => {
    const timeouts = options.probeTimeoutsMs ?? DEFAULT_PROBE_TIMEOUTS_MS;
    const [db, redis, ml] = await Promise.all([
      runProbe(options.probes.db, timeouts.db),
      runProbe(options.probes.redis, timeouts.redis),
      runProbe(options.probes.ml, timeouts.ml),
    ]);
    const status: HealthResponse["status"] = !db ? "down" : redis && ml ? "ok" : "degraded";
    const body = healthResponseSchema.parse({
      status,
      db: db ? "ok" : "down",
      redis: redis ? "ok" : "down",
      ml: ml ? "ok" : "down",
      version: options.version,
    });
    // Only a database outage makes the API unusable; Redis and ML problems degrade it.
    return reply.code(db ? 200 : 503).send(body);
  });

  app.setNotFoundHandler((request, reply) => {
    const body: ErrorBody = {
      error: { code: "NOT_FOUND", message: "Route not found.", requestId: request.id },
    };
    return reply.code(404).send(body);
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, "request failed");
    const body: ErrorBody = {
      error: { code: "INTERNAL", message: "Something went wrong.", requestId: request.id },
    };
    return reply.code(500).send(body);
  });

  return app;
}
