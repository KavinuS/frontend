/**
 * Thin client for the FlashX backend (Spring Boot / NestJS — see the proposal).
 *
 * The backend does not exist yet. Rather than fake a success, every call here
 * reports honestly when `API_BASE_URL` is unset or unreachable, so the auth
 * screens show a real error state instead of pretending a user was created.
 *
 * `API_BASE_URL` is intentionally NOT prefixed with `NEXT_PUBLIC_` — only
 * Server Actions talk to the backend, so the URL never ships to the browser.
 */

/**
 * Read per call, not once at module scope: a module-level const is captured the
 * first time this file is evaluated, which bakes in a build-time value and
 * ignores env supplied at container start.
 */
const apiBaseUrl = () => process.env.API_BASE_URL;

/** Expected auth contract. Documented here so the backend has a target to hit. */
export type AuthSuccess = {
  token: string;
  /** Token lifetime in seconds. Falls back to the cookie default when absent. */
  expiresIn?: number;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

/** Distinguishes "backend said no" from "backend isn't there", which need different copy. */
const NOT_CONFIGURED = -1;
const UNREACHABLE = 0;

export async function postJson<T>(
  path: string,
  body: unknown,
): Promise<ApiResult<T>> {
  const baseUrl = apiBaseUrl();

  if (!baseUrl) {
    return {
      ok: false,
      status: NOT_CONFIGURED,
      message:
        "Authentication backend is not configured yet. Set API_BASE_URL to enable sign in.",
    };
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: UNREACHABLE,
      message: "Could not reach the authentication service. Please try again.",
    };
  }

  // A non-JSON body (gateway HTML error page, empty 204) must not throw here.
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        (payload as { message?: string } | null)?.message ??
        "Something went wrong. Please try again.",
    };
  }

  return { ok: true, data: payload as T };
}

/**
 * Where the browser is sent to start the Google OAuth dance.
 *
 * The redirect MUST be handled by the backend, not the frontend: the client
 * secret and the code-for-token exchange never belong in a Next.js bundle.
 * Returns `null` when unconfigured so callers can disable the button.
 */
export function googleOAuthUrl(): string | null {
  const baseUrl = apiBaseUrl();
  if (!baseUrl) return null;
  return `${baseUrl}/api/v1/auth/oauth2/google`;
}

export const isBackendConfigured = () => Boolean(apiBaseUrl());
