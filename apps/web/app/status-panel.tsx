"use client";

import { useCallback, useEffect, useState } from "react";
import { describeHealth, type HealthView } from "../lib/health";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchHealth(): Promise<HealthView> {
  try {
    const response = await fetch(`${API_URL}/health`, { cache: "no-store" });
    return describeHealth(await response.json());
  } catch {
    return describeHealth(null);
  }
}

export function StatusPanel() {
  const [view, setView] = useState<HealthView | null>(null);

  useEffect(() => {
    let active = true;
    void fetchHealth().then((next) => {
      if (active) setView(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const retry = useCallback(() => {
    setView(null);
    void fetchHealth().then(setView);
  }, []);

  return (
    <section
      aria-labelledby="status-title"
      aria-live="polite"
      className="w-full max-w-md rounded-2xl border border-slate-200 p-6 dark:border-slate-800"
    >
      <h2
        id="status-title"
        className="text-sm font-semibold uppercase tracking-wide text-slate-500"
      >
        System status
      </h2>
      {view === null ? (
        <p className="mt-3 text-slate-600 dark:text-slate-400">Checking…</p>
      ) : (
        <>
          <p className="mt-3 font-medium">{view.headline}</p>
          {view.kind === "ready" ? (
            <ul className="mt-4 space-y-2">
              {view.rows.map((row) => (
                <li key={row.label} className="flex items-center justify-between">
                  <span>{row.label}</span>
                  <span
                    className={
                      row.ok
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }
                  >
                    {row.ok ? "✓ working" : "✗ unavailable"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            onClick={retry}
            className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 dark:border-slate-700 dark:hover:bg-slate-900"
          >
            Check again
          </button>
          {view.kind === "ready" ? (
            <p className="mt-3 text-xs text-slate-500">Version {view.version}</p>
          ) : null}
        </>
      )}
    </section>
  );
}
