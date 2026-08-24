import "server-only";

import { request, type ApiResult } from "@/app/lib/http";

/**
 * Auth endpoints.
 *
 * Thin on purpose — the transport, error normalisation, and base URL all live
 * in `http.ts`. What is left here is the auth contract itself.
 *
 * `API_BASE_URL` is deliberately NOT prefixed with `NEXT_PUBLIC_`: only Server
 * Actions talk to the backend, so the URL never ships to the browser.
 */

export type { ApiResult };

/** The 200 body from register and login. */
export type AuthSuccess = {
  token: string;
  /** Token lifetime in seconds. Falls back to the cookie default when absent. */
  expiresIn?: number;
};

export const postJson = <T>(path: string, body: unknown): Promise<ApiResult<T>> =>
  request<T>({ method: "POST", url: path, data: body });

/**
 * Where the browser is sent to start the Google OAuth dance.
 *
 * The redirect MUST be handled by the backend, not the frontend: the client
 * secret and the code-for-token exchange never belong in a Next.js bundle.
 * Returns `null` when unconfigured so callers can disable the button.
 *
 * This is the one backend URL that has to be reachable from the BROWSER rather
 * than from this container, because it is a `redirect()` the user's browser
 * follows — not a fetch made from a Server Action. Under docker compose those
 * are different addresses: `API_BASE_URL` is `http://api-gateway:8080`, a
 * compose-network name that does not resolve on the user's machine, so sending
 * the browser there fails to load. `PUBLIC_API_BASE_URL` carries the
 * externally-reachable address and takes precedence.
 *
 * It falls back to `API_BASE_URL` because in local development the two are the
 * same `http://localhost:8080`, and requiring both there would be noise.
 */
export function googleOAuthUrl(): string | null {
  const baseUrl = process.env.PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL;
  if (!baseUrl) return null;
  return `${baseUrl}/api/v1/auth/oauth2/google`;
}

export const isBackendConfigured = () => Boolean(process.env.API_BASE_URL);
