import { healthResponseSchema, type HealthResponse } from "@offercheck/shared";

export interface StatusRow {
  label: string;
  ok: boolean;
}

export type HealthView =
  | { kind: "ready"; headline: string; rows: StatusRow[]; version: string }
  | { kind: "unreachable"; headline: string };

/** Turns the API's /health answer (or a failed request) into what the status panel shows. */
export function describeHealth(payload: unknown): HealthView {
  const parsed = healthResponseSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      kind: "unreachable",
      headline: "The service is waking up or unreachable. Try again in a minute.",
    };
  }
  const health: HealthResponse = parsed.data;
  const headline =
    health.status === "ok"
      ? "All systems working"
      : health.status === "degraded"
        ? "Working, with some parts unavailable"
        : "The service is temporarily down";
  return {
    kind: "ready",
    headline,
    version: health.version,
    rows: [
      { label: "API", ok: true },
      { label: "Database", ok: health.db === "ok" },
      { label: "Redis", ok: health.redis === "ok" },
      { label: "ML service", ok: health.ml === "ok" },
    ],
  };
}
