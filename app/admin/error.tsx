"use client";

import { useEffect } from "react";

import { WarningIcon } from "@/components/admin/icons";

/**
 * Error boundary for the admin section.
 *
 * Most failures never reach here: the data functions return an `ApiResult` and
 * each page renders an inline panel, so a dead service costs one card rather
 * than the whole screen. What lands here is the unexpected — a render-time
 * throw, or a fetch that failed in a way the client did not model.
 *
 * The raw message is shown because the only people who see this screen are
 * admins, and an operator diagnosing a broken console needs the actual error
 * rather than a reassuring paraphrase. `digest` is the id to grep for in the
 * server log when the message itself was redacted in production.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin console error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <WarningIcon className="h-7 w-7 text-red-600" />
      </span>

      <h1 className="mt-5 text-xl font-bold text-slate-900">
        This screen failed to load
      </h1>

      <p className="mt-2 text-sm text-slate-600">
        Something threw while rendering. The backend may be mid-restart, or the
        gateway may be pointing somewhere unexpected.
      </p>

      <p className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-left font-mono text-xs text-slate-300">
        {error.message}
        {error.digest && (
          <span className="mt-1 block text-slate-500">
            digest: {error.digest}
          </span>
        )}
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
      >
        Try again
      </button>
    </div>
  );
}
