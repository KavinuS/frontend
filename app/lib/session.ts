import { cookies } from "next/headers";

export const SESSION_COOKIE = "flashx_session";

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * The flags the session cookie is written with.
 *
 * Shared rather than inlined because the cookie is now set from two places: the
 * password Server Actions, which go through `createSession`, and the Google
 * callback Route Handler, which sets it on a `NextResponse` it returns. Two
 * copies of these flags would drift, and the one that drifts is the one that
 * silently loses `httpOnly`.
 *
 * `sameSite: "lax"` is what makes the OAuth return leg work at all: the browser
 * arrives at /auth/callback as a top-level redirect from the backend, and a
 * `strict` cookie would not be sent on the navigation that follows.
 */
export function sessionCookieOptions(expiresInSeconds?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: expiresInSeconds ?? DEFAULT_MAX_AGE_SECONDS,
  };
}

/**
 * Stores the backend-issued token in an httpOnly cookie.
 *
 * httpOnly keeps the token out of `document.cookie`, so an XSS bug on the
 * storefront can't exfiltrate it. Every call site is a Server Action — cookies
 * cannot be written from a Server Component once streaming has started.
 */
export async function createSession(token: string, expiresInSeconds?: number) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(expiresInSeconds));
}

/**
 * Where the user was heading when they clicked "Continue with Google".
 *
 * The OAuth round trip goes through Google and comes back to a fixed callback
 * URL, so there is nowhere to thread a `?next=` through: the backend's redirect
 * target is a single configured value, and OAuth `state` is owned by Spring
 * Security. Parking the destination in a short-lived cookie is the one channel
 * that survives the trip.
 *
 * Deliberately NOT httpOnly-sensitive data — it is a path, already validated by
 * `safeRedirectPath` on the way back in.
 */
export const OAUTH_NEXT_COOKIE = "flashx_oauth_next";

/** Ten minutes: long enough to finish a Google login, short enough to be stale-proof. */
const OAUTH_NEXT_MAX_AGE_SECONDS = 600;

export async function stashOAuthNext(next: string | undefined) {
  const cookieStore = await cookies();

  if (!next) {
    // Clear a leftover from an abandoned attempt, so an old `next` cannot
    // hijack a later sign-in that asked for no particular destination.
    cookieStore.delete(OAUTH_NEXT_COOKIE);
    return;
  }

  cookieStore.set(OAUTH_NEXT_COOKIE, next, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_NEXT_MAX_AGE_SECONDS,
  });
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

/** The claims auth-service mints into the token. See `TokenService.mint`. */
export type SessionClaims = {
  /** The user's UUID. Orders are stamped with this. */
  sub: string;
  name?: string;
  email?: string;
  role?: "CUSTOMER" | "ADMIN";
  /** Expiry, in seconds since the epoch. */
  exp?: number;
};

/**
 * Reads the claims out of the session token WITHOUT verifying its signature.
 *
 * This is safe for exactly one purpose: deciding what to render. It must never
 * be the thing that grants access. A hand-crafted cookie claiming
 * `role: "ADMIN"` will get someone the admin sidebar and then a wall of 403s,
 * because every `/api/v1/admin/**` endpoint verifies the HS256 signature and
 * re-checks the role server-side. The frontend is doing UI gating; the backend
 * is doing authorisation.
 *
 * Verifying here as well would mean shipping the signing secret to the web tier,
 * which is a real downgrade in exchange for no extra safety.
 */
export async function getSessionClaims(): Promise<SessionClaims | null> {
  return readClaims(await getSessionToken());
}

/**
 * The same decode, against a token held in hand rather than read from the
 * cookie.
 *
 * Sign-in needs the role to decide where to send the user, and at that moment
 * the cookie has only just been written. Going back through `cookies()` to read
 * what we are already holding is a round trip for no gain, so the decode is
 * split out and both callers share it.
 */
export function readClaims(token: string | undefined): SessionClaims | null {
  if (!token) return null;

  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionClaims;

    // An expired token is no session at all. The backend would reject it
    // anyway; catching it here means the user gets the sign-in page instead of
    // an admin screen that fails on every panel.
    if (claims.exp && claims.exp * 1000 <= Date.now()) return null;

    return claims;
  } catch {
    // Malformed or truncated cookie. Treated as signed out rather than thrown,
    // so a corrupted cookie can be recovered from by signing in again.
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
