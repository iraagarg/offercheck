import { describe, expect, it } from "vitest";
import { healthResponseSchema } from "../src/health.js";

describe("healthResponseSchema", () => {
  it("accepts a valid health response", () => {
    const result = healthResponseSchema.safeParse({
      status: "degraded",
      db: "ok",
      redis: "down",
      ml: "ok",
      version: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown status", () => {
    const result = healthResponseSchema.safeParse({
      status: "fine",
      db: "ok",
      redis: "ok",
      ml: "ok",
      version: "abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty version", () => {
    const result = healthResponseSchema.safeParse({
      status: "ok",
      db: "ok",
      redis: "ok",
      ml: "ok",
      version: "",
    });
    expect(result.success).toBe(false);
  });
});
