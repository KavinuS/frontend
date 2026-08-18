/**
 * Shared formatters.
 *
 * All of these pin an explicit locale. Relying on the runtime default makes
 * the server and the browser disagree whenever they differ, which React reports
 * as a hydration mismatch.
 */

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatPrice = (amount: number) => currency.format(amount);

const dateTime = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/** UTC-pinned for the same server/client agreement reason. */
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

/**
 * ISO instant -> the `YYYY-MM-DDTHH:mm` an `<input type="datetime-local">` wants.
 *
 * Deliberately renders the UTC wall clock, and every such field in the admin
 * console is labelled "UTC" because of it. The alternative — local time — is
 * friendlier but cannot be done correctly here: the value is produced during
 * server rendering, so it would be stamped with the *server's* zone and then
 * hydrated in a browser that may be somewhere else. The admin would see a time
 * that is silently wrong by a whole number of hours, and sale windows are the
 * one thing in this system where an hour matters.
 */
export function toDateTimeLocalUtc(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  // `toISOString` is always UTC; trimming to minutes is exactly the input format.
  return date.toISOString().slice(0, 16);
}

/** The inverse: what the datetime-local input posts back, read as UTC. */
export function fromDateTimeLocalUtc(value: string) {
  // Browsers may include seconds ("...T10:30:00"). Appending "Z" to whatever
  // arrives is what forces the UTC reading; without it, `new Date` would apply
  // the server's local zone and quietly shift the window.
  const date = new Date(`${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export const discountPercent = (originalPrice: number, salePrice: number) =>
  originalPrice > 0
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

/** Clamped to 0–100 so a bad stock figure can't emit `width: NaN%`. */
export const stockPercent = (remaining: number, total: number) =>
  total > 0 ? Math.min(100, Math.max(0, (remaining / total) * 100)) : 0;

/**
 * Compact "2h 14m" style countdown. Returns null once the target has passed so
 * callers can switch to an ended state rather than render a negative duration.
 */
export function countdownParts(targetIso: string, from: number = Date.now()) {
  const remainingMs = new Date(targetIso).getTime() - from;
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return null;

  const totalSeconds = Math.floor(remainingMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** Shortens a UUID for display without losing enough to be ambiguous. */
export const shortId = (id: string) => id.slice(0, 8).toUpperCase();
