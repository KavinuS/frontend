import "server-only";

import axios, { type AxiosRequestConfig } from "axios";

/**
 * The single axios instance every backend call goes through.
 *
 * `server-only`: this module attaches bearer tokens. If it were ever imported
 * into a Client Component the token would be serialised into the RSC payload
 * and shipped to the browser, defeating the httpOnly cookie. The import turns
 * that into a build error rather than a silent leak.
 *
 * Everything addresses the API gateway, never a service directly, so a change
 * in the backend topology is a gateway config edit rather than a frontend one.
 *
 * ## Why this returns a result object instead of throwing
 *
 * axios rejects on any non-2xx. Left alone that forces a try/catch around every
 * call site and makes "the sale sold out" (a 409 the UI must render) look like
 * "the network died" (a crash). Normalising both into `ApiResult` at the
 * boundary means a caller branches on `ok` and gets a message it can display
 * either way.
 *
 * ## What we give up by not using fetch
 *
 * Next.js patches global `fetch` to add request deduplication and the
 * `cache`/`revalidate` tag system. axios uses Node's http module underneath and
 * gets none of that. It costs nothing here: admin screens are all `no-store` by
 * necessity, and live sale stock is the last thing that should be served from a
 * cache. Where a read genuinely benefits from caching, wrap the call in
 * `unstable_cache` explicitly — see `app/lib/catalog.ts`.
 */

/** Distinguishes "not configured" and "unreachable" from a real HTTP status. */
const NOT_CONFIGURED = -1;
const UNREACHABLE = 0;
const TIMED_OUT = -2;

export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      status: number;
      message: string;
      /**
       * The backend's machine-readable `ErrorResponse.code` — SKU_TAKEN,
       * SOLD_OUT, ILLEGAL_TRANSITION. Callers branch on this rather than
       * matching message text, which is prose and changes.
       */
      code?: string;
    };

/** Thrown by the request interceptor; converted to NOT_CONFIGURED below. */
class MissingBaseUrlError extends Error {
  constructor() {
    super("API_BASE_URL is not set.");
    this.name = "MissingBaseUrlError";
  }
}

export const http = axios.create({
  // A hung gateway must not hold a Server Component open until the platform
  // kills it. Ten seconds is far longer than any call here should take and
  // still short enough to surface as an error page rather than a hang.
  timeout: 10_000,
  headers: { Accept: "application/json" },
  // Take the body as-is on error responses too; the normaliser below reads
  // `message` and `code` out of it.
  validateStatus: (status) => status >= 200 && status < 300,
});

/**
 * Resolved per request, not once at module load.
 *
 * A module-level constant is captured the first time this file is evaluated,
 * which bakes in a build-time value and ignores whatever the container was
 * started with.
 */
http.interceptors.request.use((config) => {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) throw new MissingBaseUrlError();

  config.baseURL = baseUrl;
  return config;
});

/** Copy for statuses that arrive without an `ErrorResponse` body. */
function defaultMessageFor(status: number) {
  switch (status) {
    case 401:
      return "Your session has expired. Sign in again to continue.";
    case 403:
      return "This account is not allowed to do that.";
    case 404:
      return "That record no longer exists.";
    case 409:
      return "That conflicts with the current state. Refresh and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function toApiResult(error: unknown): { ok: false } & Record<string, unknown> {
  if (error instanceof MissingBaseUrlError) {
    return {
      ok: false,
      status: NOT_CONFIGURED,
      message:
        "API_BASE_URL is not set, so the app has no backend to talk to.",
    };
  }

  if (axios.isAxiosError(error)) {
    // The server answered, just not with a 2xx.
    if (error.response) {
      const body = error.response.data as
        | { message?: string; code?: string }
        | undefined;

      return {
        ok: false,
        status: error.response.status,
        message: body?.message ?? defaultMessageFor(error.response.status),
        code: body?.code,
      };
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return {
        ok: false,
        status: TIMED_OUT,
        message: "The backend took too long to respond. Please try again.",
      };
    }

    return {
      ok: false,
      status: UNREACHABLE,
      message:
        "Could not reach the API gateway. Check that the backend is running.",
    };
  }

  // Not an axios failure at all — a bug in a caller, or JSON that could not be
  // parsed. Logged rather than shown, so an internal message never reaches a
  // browser.
  console.error("Unexpected error calling the backend:", error);
  return {
    ok: false,
    status: 500,
    message: "Something went wrong. Please try again.",
  };
}

/** Issues a request and normalises both outcomes into `ApiResult`. */
export async function request<T>(
  config: AxiosRequestConfig,
): Promise<ApiResult<T>> {
  try {
    const response = await http.request<T>(config);
    return { ok: true, data: response.data };
  } catch (error) {
    return toApiResult(error) as ApiResult<T>;
  }
}

/** Adds the caller's bearer token. Omitted entirely when there is no session. */
export const withAuth = (token: string | undefined): AxiosRequestConfig =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};
