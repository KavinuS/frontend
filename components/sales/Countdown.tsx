"use client";

import { useEffect, useState } from "react";

import { countdownParts } from "@/app/lib/format";
import { useIsClient } from "@/app/lib/local-store";

/**
 * Ticking countdown to the end of a sale.
 *
 * One monospaced `HH:MM:SS` clock, not four labelled boxes. The design treats
 * the remaining time as a number in a column — it has to line up against the
 * clock in the row above it and stay the same width as the seconds roll over,
 * which is what the tabular figures in `.fx-mono` are for. Hours accumulate
 * past 24 rather than splitting off a days segment, so the string never changes
 * shape mid-sale.
 *
 * The server renders at request time and the browser hydrates anywhere from
 * seconds to days later, so any clock-derived output would differ between the
 * two. `useIsClient` is false for the server render and the hydrating render,
 * which keeps the first paint identical on both sides; the real time only
 * appears on the re-render immediately after.
 */
export default function Countdown({
  endsAt,
  endedLabel = "Closed",
  className = "",
}: {
  endsAt: string;
  /** Shown once the target has passed. */
  endedLabel?: string;
  className?: string;
}) {
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

  const parts = isClient ? countdownParts(endsAt, now) : null;

  // Em-dashes rather than zeroes before hydration: 00:00:00 would read as an
  // expired sale for the one frame it is on screen.
  const label = !isClient
    ? "––:––:––"
    : parts
      ? clock(parts)
      : endedLabel;

  return (
    <span
      className={`fx-mono ${!isClient || parts ? "" : "fx-muted"} ${className}`}
      // The value changes every second; announcing each tick would be unusable.
      aria-live="off"
    >
      {label}
    </span>
  );
}

const pad = (value: number) => String(value).padStart(2, "0");

function clock({
  days,
  hours,
  minutes,
  seconds,
}: NonNullable<ReturnType<typeof countdownParts>>) {
  return `${pad(days * 24 + hours)}:${pad(minutes)}:${pad(seconds)}`;
}
