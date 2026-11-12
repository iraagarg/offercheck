import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

const valid = {
  DATABASE_URL: "postgres://user:secret@localhost:5432/db",
  REDIS_URL: "redis://localhost:6379",
  ML_URL: "http://localhost:8000/",
  WEB_ORIGIN: "http://localhost:3000, https://offercheck.vercel.app",
};

describe("loadConfig", () => {
  it("parses valid settings and applies defaults", () => {
    const config = loadConfig(valid);
    expect(config.port).toBe(3001);
    expect(config.mlUrl).toBe("http://localhost:8000");
    expect(config.webOrigins).toEqual(["http://localhost:3000", "https://offercheck.vercel.app"]);
    expect(config.version).toBe("dev");
  });

  it("uses the deploy commit as the version, shortened", () => {
    const config = loadConfig({ ...valid, RAILWAY_GIT_COMMIT_SHA: "0123456789abcdef0123" });
    expect(config.version).toBe("0123456789ab");
  });

  it("names missing settings without revealing any values", () => {
    const { DATABASE_URL: _removed, ...rest } = valid;
    expect(() => loadConfig(rest)).toThrow(/DATABASE_URL/);
    expect(() => loadConfig({ ...valid, ML_URL: "not a url" })).toThrow(/ML_URL/);
    try {
      loadConfig({ ...valid, ML_URL: "not a url" });
    } catch (error) {
      expect(String(error)).not.toContain("secret");
    }
  });
});
