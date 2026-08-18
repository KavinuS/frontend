/**
 * Validates a post-sign-in redirect target.
 *
 * The `?next=` parameter is attacker-controllable: anyone can send a victim a
 * link to `/login?next=https://evil.example/harvest`, and a redirect that
 * trusted it would hand over a user who has just been trained to type their
 * password. That is a textbook open redirect, and it is worth far more to a
 * phisher on a sign-in page than anywhere else on the site.
 *
 * Only same-origin absolute paths are allowed through:
 *
 *   /admin            ok
 *   /admin?tab=live   ok
 *   //evil.example    rejected - protocol-relative, browsers treat it as a host
 *   /\evil.example    rejected - backslash is normalised to `/` by some browsers
 *   https://evil...   rejected - not a path at all
 *
 * Anything unrecognised falls back to `fallback` rather than erroring: a bad
 * `next` should be an ignored hint, not a failed sign-in.
 */
export function safeRedirectPath(
  value: FormDataEntryValue | string | null | undefined,
  fallback = "/dashboard",
) {
  if (typeof value !== "string" || value.length === 0) return fallback;

  // Must be a rooted path, and the second character must not turn it into an
  // authority. Checking both slash shapes because browsers disagree on `\`.
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;

  // A control character can smuggle a header break into the Location value.
  if (/[\x00-\x1f\x7f]/.test(value)) return fallback;

  return value;
}
