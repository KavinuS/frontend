import "server-only";

import { redirect } from "next/navigation";

import type { ApiResult } from "@/app/lib/api";
import { getSessionClaims, getSessionToken } from "@/app/lib/session";

/**
 * Authenticated client for the `/api/v1/admin/**` endpoints.
 *
 * `server-only` is not decoration: this module reads the session cookie and
 * attaches a bearer token. If it were ever imported into a Client Component the
 * token would be serialised into the RSC payload and shipped to the browser,
 * which is exactly what the httpOnly cookie exists to prevent. The import makes
 * that a build error instead of a silent leak.
 *
 * Every call goes through the API gateway on `API_BASE_URL`, which routes to
 * auth-service, catalog-service, or order-service by path. The frontend never
 * addresses a service directly, so a topology change is a gateway config edit.
 */

const apiBaseUrl = () => process.env.API_BASE_URL;

/** Same sentinels as `app/lib/api.ts`: these are transport, not HTTP, states. */
const NOT_CONFIGURED = -1;
const UNREACHABLE = 0;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Appended as a query string. Null and undefined entries are dropped. */
  query?: Record<string, string | number | boolean | null | undefined>;
};

function buildUrl(
  baseUrl: string,
  path: string,
  query: RequestOptions["query"],
) {
  const url = new URL(baseUrl + path);

  for (const [key, value] of Object.entries(query ?? {})) {
    // An empty search box must not become `?search=`, which the backend would
    // treat as a filter for the empty string rather than "no filter".
    if (value === null || value === undefined || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export async function adminFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const baseUrl = apiBaseUrl();

  if (!baseUrl) {
    return {
      ok: false,
      status: NOT_CONFIGURED,
      message:
        "API_BASE_URL is not set, so the admin console has no backend to talk to.",
    };
  }

  const token = await getSessionToken();

  if (!token) {
    return {
      ok: false,
      status: 401,
      message: "Your session has expired. Sign in again to continue.",
    };
  }

  const { method = "GET", body, query } = options;

  let response: Response;

  try {
    response = await fetch(buildUrl(baseUrl, path, query), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      // Admin screens show live inventory and queue depth. A cached response
      // here would be actively misleading, not merely stale.
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: UNREACHABLE,
      message:
        "Could not reach the API gateway. Check that the backend is running.",
    };
  }

  // 204 from DELETE, and any HTML error page the gateway emits, must not throw.
  const payload =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload as { message?: string; code?: string } | null;

    return {
      ok: false,
      status: response.status,
      message: error?.message ?? defaultMessageFor(response.status),
      code: error?.code,
    };
  }

  return { ok: true, data: payload as T };
}

/**
 * Copy for the statuses that reach us without a body — a 403 from the gateway,
 * for instance, never carries an `ErrorResponse`.
 */
function defaultMessageFor(status: number) {
  switch (status) {
    case 401:
      return "Your session has expired. Sign in again to continue.";
    case 403:
      return "This account does not have admin access.";
    case 404:
      return "That record no longer exists.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * The gate on every admin route.
 *
 * Called from the admin layout AND from each mutating Server Action. That
 * repetition is the point: a Server Action is a public POST endpoint, reachable
 * without ever rendering the layout, so a layout-only check protects the
 * navigation and nothing else. See the warning in the Next.js "Mutating Data"
 * guide.
 *
 * Redirecting rather than throwing keeps the failure legible — an unauthorised
 * visitor lands on the sign-in page, not a stack trace.
 */
export async function requireAdmin() {
  const claims = await getSessionClaims();

  if (!claims) {
    redirect("/login?next=/admin");
  }

  if (claims.role !== "ADMIN") {
    redirect("/dashboard?denied=admin");
  }

  return claims;
}
