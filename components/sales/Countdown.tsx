"use client";

import { useEffect, useState } from "react";

import { countdownParts } from "@/app/lib/format";
import { useIsClient } from "@/app/lib/local-store";

/**
 * Ticking countdown to the end of a sale.
 *
 * The server renders at build time and the browser hydrates anywhere from
 * seconds to days later, so any clock-derived output would differ between the
 * two. `useIsClient` is false for the server render and the hydrating render,
 * which keeps the first paint identical on both sides; the real time only
 * appears on the re-render immediately after.
 */
export default function Countdown({ endsAt }: { endsAt: string }) {
  const isClient = useIsClient();

  // Initialised at mount so the first client render is already accurate,
  // rather than showing a stale value until the interval's first tick.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // setState inside the interval callback, not in the effect body — the
    // effect only wires up the timer.
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isClient) {
    return <Shell segments={[null, null, null, null]} />;
  }

  const parts = countdownParts(endsAt, now);

  if (!parts) {
    return (
      <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-500">
        This sale has ended.
      </p>
    );
  }

  return (
    <Shell
      segments={[
        { value: parts.days, label: "Days" },
        { value: parts.hours, label: "Hours" },
        { value: parts.minutes, label: "Mins" },
        { value: parts.seconds, label: "Secs" },
      ]}
    />
  );
}

const labels = ["Days", "Hours", "Mins", "Secs"];

function Shell({
  segments,
}: {
  segments: ({ value: number; label: string } | null)[];
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {segments.map((segment, index) => (
        <div
          key={labels[index]}
          className="rounded-xl border border-slate-200 bg-white px-2 py-3 text-center"
        >
          <div className="font-mono text-2xl font-bold tabular-nums text-slate-900">
            {segment ? String(segment.value).padStart(2, "0") : "––"}
          </div>
          <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {segment?.label ?? labels[index]}
          </div>
        </div>
      ))}
    </div>
  );
}
