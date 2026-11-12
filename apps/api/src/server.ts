import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createProbes } from "./probes.js";

const config = loadConfig();
const resources = createProbes(config);
const app = await buildApp({
  probes: resources.probes,
  webOrigins: config.webOrigins,
  version: config.version,
  logger: { level: config.logLevel },
});

const shutdown = async (signal: string): Promise<void> => {
  app.log.info({ signal }, "shutting down");
  await app.close();
  await resources.close();
  process.exit(0);
};
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

await app.listen({ port: config.port, host: config.host });
