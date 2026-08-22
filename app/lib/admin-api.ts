import "server-only";

import { redirect } from "next/navigation";

import { request, withAuth, type ApiResult } from "@/app/lib/http";
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

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Serialised as a query string. Null, undefined, and "" entries are dropped. */
  query?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * Issues an authenticated call to an admin endpoint.
 *
 * The bearer token is read per call rather than held in a module-scoped axios
 * instance: a single shared instance carrying an Authorization header would
 * leak one request's identity into another's, and on a server handling
 * concurrent requests that is a cross-user data leak, not a style problem.
 */
export async function adminFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const token = await getSessionToken();

  if (!token) {
    return {
      ok: false,
      status: 401,
      message: "Your session has expired. Sign in again to continue.",
    };
  }

  return request<T>({
    method: options.method ?? "GET",
    url: path,
    data: options.body,
    // axios drops undefined params itself; the empty-string filter is ours, so
    // an empty search box does not become `?search=` and get read as a filter
    // for the empty string rather than no filter at all.
    params: Object.fromEntries(
      Object.entries(options.query ?? {}).filter(
        ([, value]) => value !== null && value !== undefined && value !== "",
      ),
    ),
    ...withAuth(token),
  });
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
