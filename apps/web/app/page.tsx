import { StatusPanel } from "./status-panel";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">OfferCheck</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Check a job or internship message for scam signals — with evidence for every reason.
        </p>
        <p className="mt-2 text-sm text-slate-500">Coming soon.</p>
      </div>
      <StatusPanel />
    </main>
  );
}
