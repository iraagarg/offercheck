import { Redis } from "ioredis";
import postgres from "postgres";

/** A probe answers one question: is this dependency reachable right now? */
export type Probe = () => Promise<boolean>;

export interface Probes {
  db: Probe;
  redis: Probe;
  ml: Probe;
}

export interface ProbeResources {
  probes: Probes;
  close: () => Promise<void>;
}

export type ProbeTimeouts = Record<keyof Probes, number>;

/**
 * The database gets longer: Neon's free tier suspends an idle database, and the first
 * connection after a pause takes a few seconds while it wakes up.
 */
export const DEFAULT_PROBE_TIMEOUTS_MS: ProbeTimeouts = { db: 5000, redis: 2000, ml: 2000 };

/** Runs a probe with a time limit. Any error or timeout counts as "not reachable". */
export async function runProbe(probe: Probe, timeoutMs: number): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => resolve(false), timeoutMs);
  });
  try {
    return await Promise.race([probe().catch(() => false), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export function createProbes(urls: {
  databaseUrl: string;
  redisUrl: string;
  mlUrl: string;
}): ProbeResources {
  const sql = postgres(urls.databaseUrl, { max: 1, connect_timeout: 5, idle_timeout: 20 });
  const redis = new Redis(urls.redisUrl, {
    lazyConnect: true,
    connectTimeout: 2000,
    maxRetriesPerRequest: 1,
    // Fail fast while Redis is unreachable instead of queueing commands forever.
    enableOfflineQueue: false,
  });
  // Without a listener, ioredis would log every reconnect attempt as an unhandled error.
  redis.on("error", () => undefined);

  const probes: Probes = {
    db: async () => {
      await sql`select 1`;
      return true;
    },
    redis: async () => {
      if (redis.status === "wait") await redis.connect();
      return (await redis.ping()) === "PONG";
    },
    ml: async () => {
      const response = await fetch(`${urls.mlUrl}/health`, {
        signal: AbortSignal.timeout(DEFAULT_PROBE_TIMEOUTS_MS.ml),
      });
      return response.ok;
    },
  };

  return {
    probes,
    close: async () => {
      await Promise.allSettled([sql.end({ timeout: 2 }), redis.quit()]);
    },
  };
}
