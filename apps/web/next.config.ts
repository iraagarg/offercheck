import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Local Docker image needs a self-contained build; Vercel builds without it.
  ...(process.env.NEXT_OUTPUT === "standalone" ? { output: "standalone" as const } : {}),
  // Monorepo: trace files from the repository root so the shared package is included.
  outputFileTracingRoot: path.join(here, "../.."),
  poweredByHeader: false,
};

export default nextConfig;
