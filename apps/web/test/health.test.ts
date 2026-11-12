import { describe, expect, it } from "vitest";
import { describeHealth } from "../lib/health";

describe("describeHealth", () => {
  it("shows every part working when the API is ok", () => {
    const view = describeHealth({ status: "ok", db: "ok", redis: "ok", ml: "ok", version: "abc" });
    expect(view).toMatchObject({ kind: "ready", headline: "All systems working", version: "abc" });
    if (view.kind === "ready") expect(view.rows.every((row) => row.ok)).toBe(true);
  });

  it("marks the unavailable part when degraded", () => {
    const view = describeHealth({
      status: "degraded",
      db: "ok",
      redis: "down",
      ml: "ok",
      version: "abc",
    });
    expect(view.headline).toBe("Working, with some parts unavailable");
    if (view.kind === "ready") {
      expect(view.rows.find((row) => row.label === "Redis")?.ok).toBe(false);
    }
  });

  it("explains a waking-up or unreachable service when the answer is missing or invalid", () => {
    expect(describeHealth(null).kind).toBe("unreachable");
    expect(describeHealth({ hello: "world" }).kind).toBe("unreachable");
  });
});
