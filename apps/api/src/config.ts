import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  ML_URL: z.url(),
  // Comma-separated list of website origins allowed to call the API (CORS).
  WEB_ORIGIN: z.string().min(1),
  // Railway sets RAILWAY_GIT_COMMIT_SHA on deploys; GIT_SHA can be set elsewhere.
  RAILWAY_GIT_COMMIT_SHA: z.string().optional(),
  GIT_SHA: z.string().optional(),
});

export interface Config {
  port: number;
  host: string;
  logLevel: string;
  databaseUrl: string;
  redisUrl: string;
  mlUrl: string;
  webOrigins: string[];
  version: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = configSchema.safeParse(env);
  if (!parsed.success) {
    // Name the missing/invalid settings, never their values (they may be secrets).
    const names = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid or missing environment variables: ${names}`);
  }
  const e = parsed.data;
  return {
    port: e.PORT,
    host: e.HOST,
    logLevel: e.LOG_LEVEL,
    databaseUrl: e.DATABASE_URL,
    redisUrl: e.REDIS_URL,
    mlUrl: e.ML_URL.replace(/\/+$/, ""),
    webOrigins: e.WEB_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    version: (e.RAILWAY_GIT_COMMIT_SHA ?? e.GIT_SHA ?? "dev").slice(0, 12),
  };
}
