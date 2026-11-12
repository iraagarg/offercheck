import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import type { Probes } from "../src/probes.js";

const up = async (): Promise<boolean> => true;
const down = async (): Promise<boolean> => false;
const broken = async (): Promise<boolean> => {
  throw new Error("connection refused");
};
const hangs = (): Promise<boolean> => new Promise(() => undefined);

let app: FastifyInstance | undefined;

const after = (ms: number) => (): Promise<boolean> =>
  new Promise((resolve) => setTimeout(() => resolve(true), ms));

async function start(probes: Partial<Probes> = {}): Promise<FastifyInstance> {
  app = await buildApp({
    probes: { db: up, redis: up, ml: up, ...probes },
    // Short limits keep the tests fast; the database still gets the longest one, as in production.
    probeTimeoutsMs: { db: 500, redis: 200, ml: 200 },
    webOrigins: ["http://localhost:3000"],
    version: "test",
  });
  return app;
}

afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe("GET /health", () => {
  it("is ok when every dependency is reachable", async () => {
    const res = await (await start()).inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok", db: "ok", redis: "ok", ml: "ok", version: "test" });
  });

  it("returns 503 and status down when the database is unreachable", async () => {
    const res = await (await start({ db: down })).inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ status: "down", db: "down" });
  });

  it("is degraded (still 200) when Redis is unreachable", async () => {
    const res = await (await start({ redis: down })).inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: "degraded", redis: "down", db: "ok" });
  });

  it("is degraded (still 200) when the ML service is unreachable", async () => {
    const res = await (await start({ ml: down })).inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: "degraded", ml: "down" });
  });

  it("counts a probe that throws as down instead of crashing", async () => {
    const res = await (await start({ redis: broken })).inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: "degraded", redis: "down" });
  });

  it("counts a probe that never answers as down after the time limit", async () => {
    const res = await (await start({ ml: hangs })).inject({ method: "GET", url: "/health" });
    expect(res.json()).toMatchObject({ ml: "down" });
  });

  it("waits longer for a database that is waking up", async () => {
    // 300 ms is longer than the Redis/ML limit (200 ms) but within the database limit (500 ms).
    const res = await (await start({ db: after(300) })).inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ db: "ok" });
  });

  it("still gives up on a database that takes too long", async () => {
    const res = await (await start({ db: after(800) })).inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(503);
  });

  it("returns a request id header", async () => {
    const res = await (await start()).inject({ method: "GET", url: "/health" });
    expect(res.headers["x-request-id"]).toMatch(/^req_/);
  });
});

describe("CORS", () => {
  it("allows the configured website origin", async () => {
    const res = await (
      await start()
    ).inject({
      method: "GET",
      url: "/health",
      headers: { origin: "http://localhost:3000" },
    });
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("does not allow other origins", async () => {
    const res = await (
      await start()
    ).inject({
      method: "GET",
      url: "/health",
      headers: { origin: "https://evil.example" },
    });
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("unknown routes", () => {
  it("return the standard error shape with a request id", async () => {
    const res = await (await start()).inject({ method: "GET", url: "/nope" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({
      error: { code: "NOT_FOUND", requestId: expect.stringMatching(/^req_/) },
    });
  });
});
