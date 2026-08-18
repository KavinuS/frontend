import { cookies } from "next/headers";

export const SESSION_COOKIE = "flashx_session";

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Stores the backend-issued token in an httpOnly cookie.
 *
 * httpOnly keeps the token out of `document.cookie`, so an XSS bug on the
 * storefront can't exfiltrate it. Every call site is a Server Action — cookies
 * cannot be written from a Server Component once streaming has started.
 */
export async function createSession(token: string, expiresInSeconds?: number) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresInSeconds ?? DEFAULT_MAX_AGE_SECONDS,
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
  const token = await getSessionToken();
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
