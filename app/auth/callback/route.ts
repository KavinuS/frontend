import { NextResponse, type NextRequest } from "next/server";

import { landingFor, safeRedirectPath } from "@/app/lib/redirects";
import {
  OAUTH_NEXT_COOKIE,
  SESSION_COOKIE,
  readClaims,
  sessionCookieOptions,
} from "@/app/lib/session";

/**
 * Where a completed Google login lands.
 *
 * auth-service finishes the OAuth exchange, mints a FlashX JWT, and redirects
 * the browser here with the token on the query string. This route's whole job
 * is to get that token out of the URL and into the httpOnly session cookie as
 * fast as possible, then send the user on by role — the same landing rule the
 * password sign-in uses.
 *
 * A Route Handler rather than a page: the cookie has to be written before
 * anything renders, and a Server Component cannot set one once streaming has
 * begun. Nothing is ever rendered from this URL, which also means the token
 * never reaches a React tree or the client bundle.
 *
 * ## On the token being in the URL
 *
 * This is the weak point of the flow, and it is inherited rather than chosen:
 * auth-service cannot set the cookie itself because the cookie has to belong to
 * the Next.js origin, not the backend's. The query parameter is the hand-off
 * channel. It lands in browser history and can leak through a Referer header,
 * which is why:
 *
 *   - the redirect below is to a clean path, so the token is gone from the URL
 *     bar by the time any page renders and never becomes a Referer value;
 *   - the response is marked no-store, so the URL-bearing response is not
 *     written to the disk cache;
 *   - the token is short-lived (one hour, see TokenService).
 *
 * The stronger design is a one-time exchange code redeemed server-to-server.
 * That is tracked as D1 in docs/PROJECT-REPORT.md and is a backend change; this
 * route is written so that swapping to it only changes which parameter is read.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // auth-service sends `?error=missing_email` when Google authenticated someone
  // but returned no email address to key the account on.
  const error = params.get("error");
  const token = params.get("token");

  if (error || !token) {
    return failTo(request, error === "missing_email" ? "google_no_email" : "google");
  }

  // A token that will not decode is not a session. This is a sanity check on a
  // malformed hand-off, NOT an authorisation decision — the signature is
  // verified by every backend endpoint that matters. See readClaims.
  const claims = readClaims(token);
  if (!claims) {
    return failTo(request, "google");
  }

  // Prefer where the user was actually heading — they may have been bounced to
  // /login from a protected page. Re-validated even though signInWithGoogle
  // already checked it, because a cookie is not a trusted input channel.
  const stashed = request.cookies.get(OAUTH_NEXT_COOKIE)?.value;
  const destination = safeRedirectPath(stashed, landingFor(token));

  const response = NextResponse.redirect(new URL(destination, request.nextUrl.origin));

  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresIn(params)));

  // One-shot: it has served its purpose and must not steer a later sign-in.
  response.cookies.delete(OAUTH_NEXT_COOKIE);

  response.headers.set("Cache-Control", "no-store");

  return response;
}

/**
 * Back to sign-in with a code the page turns into a message. A code rather than
 * the message itself so the wording lives with the UI, and so nothing
 * attacker-supplied is ever echoed onto the page.
 */
function failTo(request: NextRequest, code: string) {
  const url = new URL("/login", request.nextUrl.origin);
  url.searchParams.set("error", code);

  const response = NextResponse.redirect(url);
  response.cookies.delete(OAUTH_NEXT_COOKIE);
  response.headers.set("Cache-Control", "no-store");

  return response;
}

/**
 * The token's lifetime, so the cookie expires with it rather than outliving it
 * by days and presenting a dead session as a live one. Anything unparseable
 * falls through to the cookie default.
 */
function expiresIn(params: URLSearchParams) {
  const raw = Number(params.get("expiresIn"));
  return Number.isFinite(raw) && raw > 0 ? raw : undefined;
}
