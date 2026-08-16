import * as z from "zod";

/**
 * Auth form schemas.
 *
 * These run inside Server Actions and are the only validation in the app: both
 * forms set `noValidate` so the browser's native bubbles don't compete with the
 * styled inline errors, and client-side checks would be bypassable anyway.
 */

/**
 * Trim and lowercase BEFORE validating, then pipe into the email check.
 *
 * `z.email().trim()` — the shape the Next.js docs use — runs the format check
 * on the raw string, so an address pasted with a trailing space is rejected as
 * invalid rather than being cleaned up. Autofill and copy-paste do that often
 * enough to matter. Lowercasing keeps "Ada@x.com" and "ada@x.com" one account.
 */
const emailField = () =>
  z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Please enter a valid email address." }));

export const RegisterFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Name must be at least 2 characters long." })
      .max(80, { error: "Name must be 80 characters or fewer." }),
    email: emailField(),
    password: z
      .string()
      .min(8, { error: "Be at least 8 characters long." })
      .regex(/[a-zA-Z]/, { error: "Contain at least one letter." })
      .regex(/[0-9]/, { error: "Contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, { error: "Contain at least one special character." }),
    confirmPassword: z.string(),
    // Unchecked checkboxes are absent from FormData, so this arrives as `null`.
    terms: z.literal("on", { error: "Please accept the terms to continue." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/**
 * Login deliberately does NOT reuse the register password rules. Telling a
 * signing-in user their password is "too short" leaks whether the rules changed
 * and is useless noise — the backend is the only thing that can judge it.
 */
export const LoginFormSchema = z.object({
  email: emailField(),
  password: z.string().min(1, { error: "Please enter your password." }),
});

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
        terms?: string[];
      };
      /** Form-level failure (bad credentials, email taken, backend unreachable). */
      message?: string;
      /**
       * Re-populates the form after a failed submit. Passwords are never echoed
       * back, so only the non-secret fields are kept.
       */
      values?: {
        name?: string;
        email?: string;
      };
    }
  | undefined;
