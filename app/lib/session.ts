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

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
