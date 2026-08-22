"use server";

import { redirect } from "next/navigation";
import * as z from "zod";

import { googleOAuthUrl, postJson, type AuthSuccess } from "@/app/lib/api";
import {
  LoginFormSchema,
  RegisterFormSchema,
  type AuthFormState,
} from "@/app/lib/definitions";
import { safeRedirectPath } from "@/app/lib/redirects";
import { createSession, deleteSession, readClaims } from "@/app/lib/session";

/**
 * Auth Server Actions.
 *
 * Credentials are posted to the server and never handled in the browser, so the
 * password is out of the client bundle and out of the URL. Each action returns
 * an `AuthFormState` that `useActionState` renders as inline field errors.
 */

/**
 * Where a freshly signed-in account belongs.
 *
 * An admin has no use for the customer dashboard — the console is the reason
 * they signed in — so the landing page follows the role rather than being the
 * same for everyone. This is a convenience, not a control: `/admin` is still
 * gated by `requireAdmin()`, and every `/api/v1/admin/**` endpoint re-checks the
 * role against the token signature. A forged `role: "ADMIN"` claim buys a
 * redirect to a page that immediately bounces it.
 */
function landingFor(token: string) {
  return readClaims(token)?.role === "ADMIN" ? "/admin" : "/dashboard";
}

export async function register(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validatedFields = RegisterFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    terms: formData.get("terms"),
  });

  // Echo back what the user typed so a validation error doesn't wipe the form.
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      values,
    };
  }

  const { name, email, password } = validatedFields.data;

  const result = await postJson<AuthSuccess>("/api/v1/auth/register", {
    name,
    email,
    password,
  });

  if (!result.ok) {
    // 409 is the backend's "email already registered" — show it on the field
    // that caused it rather than as a generic banner.
    if (result.status === 409) {
      return { errors: { email: [result.message] }, values };
    }
    return { message: result.message, values };
  }

  const sessionError = await startSession(result.data);
  if (sessionError) return { message: sessionError, values };

  // Outside try/catch on purpose — redirect() signals by throwing.
  //
  // Registration always mints a CUSTOMER, so this is `/dashboard` in practice.
  // It goes through the same helper anyway so there is one rule about where a
  // new session lands, rather than two that can drift.
  redirect(landingFor(result.data.token));
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const values = { email: String(formData.get("email") ?? "") };

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      values,
    };
  }

  const { email, password } = validatedFields.data;

  const result = await postJson<AuthSuccess>("/api/v1/auth/login", {
    email,
    password,
  });

  if (!result.ok) {
    // Deliberately generic on 401: naming which half was wrong turns the login
    // form into an account-enumeration oracle.
    if (result.status === 401) {
      return { message: "Incorrect email or password.", values };
    }
    return { message: result.message, values };
  }

  const sessionError = await startSession(result.data);
  if (sessionError) return { message: sessionError, values };

  // Where the user was heading before being asked to sign in. Validated, never
  // used raw - see safeRedirectPath for why this is the one redirect on the
  // site worth guarding.
  //
  // An explicit `next` still wins: someone who hit /admin cold was bounced here
  // with `?next=/admin` and expects to land back there. The role only decides
  // the fallback, for the ordinary case of signing in from the navbar.
  redirect(safeRedirectPath(formData.get("next"), landingFor(result.data.token)));
}

/**
 * Writes the session cookie, refusing to mint one from a 2xx with a missing
 * token — that would store the string "undefined" and look like a valid login.
 * Returns an error message, or null on success.
 */
async function startSession(data: AuthSuccess): Promise<string | null> {
  if (!data?.token) {
    return "The authentication service returned an unexpected response.";
  }

  await createSession(data.token, data.expiresIn);
  return null;
}

/**
 * Hands the browser off to the backend, which owns the Google OAuth exchange
 * and drops the session cookie before sending the user back to /dashboard.
 */
export async function signInWithGoogle() {
  const url = googleOAuthUrl();

  if (!url) {
    // The button is disabled when unconfigured; this covers a direct POST.
    return;
  }

  redirect(url);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
