"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RefreshIcon } from "@/components/admin/icons";

/**
 * Polls the dashboard by re-running the server render.
 *
 * `router.refresh()` re-fetches the current route's Server Components and
 * reconciles the result into the existing tree, so the numbers update without a
 * full navigation and without losing scroll position or focus.
 *
 * Polling is the honest choice for now. The real-time story in the proposal is
 * SSE from order-service, which does not exist yet; a five-second poll is
 * closer to that than a dashboard that quietly goes stale while an operator
 * watches a sale.
 *
 * Off by default. This hits four services on every tick, and leaving a tab open
 * overnight should not generate eleven thousand requests nobody reads.
 */
export function AutoRefresh({ seconds = 5 }: { seconds?: number }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      router.refresh();
      // Formatted here rather than during render: a timestamp produced on the
      // server never matches the one the browser would produce, which React
      // reports as a hydration mismatch.
      setLastRefreshed(new Date().toLocaleTimeString());
    }, seconds * 1000);

    return () => clearInterval(timer);
  }, [enabled, seconds, router]);

  return (
    <div className="flex items-center gap-3">
      {lastRefreshed && (
        <span className="hidden text-xs text-slate-500 sm:inline">
          Updated {lastRefreshed}
        </span>
      )}

      <button
        type="button"
        onClick={() => setEnabled((on) => !on)}
        aria-pressed={enabled}
        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
          enabled
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <RefreshIcon className={`h-4 w-4 ${enabled ? "animate-spin" : ""}`} />
        {enabled ? `Live · ${seconds}s` : "Go live"}
      </button>
    </div>
  );
}
