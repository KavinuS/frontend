"use client";

import Link from "next/link";
import { useActionState } from "react";

import { register } from "@/app/actions/auth";
import { Divider, FormBanner, SubmitButton } from "./FormControls";
import GoogleButton from "./GoogleButton";
import PasswordField from "./PasswordField";
import TextField, { FieldErrors } from "./TextField";

export default function RegisterForm({
  googleEnabled,
}: {
  googleEnabled: boolean;
}) {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <div className="space-y-6">

      <GoogleButton label="Sign up with Google" disabled={!googleEnabled} />

      <Divider label="or" />

      <form action={action} className="space-y-5" noValidate>

        <FormBanner message={state?.message} />

        <TextField
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          defaultValue={state?.values?.name}
          errors={state?.errors?.name}
        />

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state?.values?.email}
          errors={state?.errors?.email}
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          errors={state?.errors?.password}
        />

        {/* Only shown once the user has something to fix — the rules are long
            enough that listing them up front crowds the form. */}
        {!state?.errors?.password && (
          <p className="fx-muted -mt-2 text-xs">
            Use 8+ characters with a letter, a number, and a special character.
          </p>
        )}

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          errors={state?.errors?.confirmPassword}
        />

        <div>
          <label htmlFor="terms" className="fx-muted flex items-start gap-3 text-sm">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              aria-invalid={Boolean(state?.errors?.terms?.length)}
              aria-describedby={
                state?.errors?.terms?.length ? "terms-error" : undefined
              }
              className="mt-1 h-4 w-4 shrink-0 rounded-none accent-fx-accent"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-fx-accent hover:text-fx-accent-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-fx-accent hover:text-fx-accent-700">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <FieldErrors id="terms-error" errors={state?.errors?.terms} />
        </div>

        <SubmitButton
          pending={pending}
          idleLabel="Create account"
          pendingLabel="Creating account…"
        />

      </form>
    </div>
  );
}
