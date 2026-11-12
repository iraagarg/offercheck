import { z } from "zod";

/** Each dependency the API needs is either reachable or not. */
export const componentStatusSchema = z.enum(["ok", "down"]);

/**
 * Response of GET /health.
 * - "ok": everything reachable.
 * - "degraded": the database works, but Redis or the ML service does not (the API still serves requests).
 * - "down": the database is unreachable (HTTP 503).
 */
export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded", "down"]),
  db: componentStatusSchema,
  redis: componentStatusSchema,
  ml: componentStatusSchema,
  version: z.string().min(1),
});

export type ComponentStatus = z.infer<typeof componentStatusSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
