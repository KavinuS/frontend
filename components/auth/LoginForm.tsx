"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login } from "@/app/actions/auth";
import { Divider, FormBanner, SubmitButton } from "./FormControls";
import GoogleButton from "./GoogleButton";
import PasswordField from "./PasswordField";
import TextField from "./TextField";

export default function LoginForm({
  googleEnabled,
  next,
  notice,
}: {
  googleEnabled: boolean;
  /** Where to land after signing in, e.g. /admin. Validated server-side. */
  next?: string;
  /**
   * A failure that happened before this form was reached — currently a Google
   * sign-in that came back empty-handed. It sits above the Google button
   * rather than inside the password form, because that is the control it is
   * actually reporting on.
   */
  notice?: string;
}) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="space-y-6">

      <FormBanner message={notice} />

      <GoogleButton
        label="Continue with Google"
        disabled={!googleEnabled}
        next={next}
      />

      <Divider label="or" />

      <form action={action} className="space-y-5" noValidate>

        {/* Carried through the form rather than read from the URL inside the
            action: a Server Action has no access to the caller's search params. */}
        {next && <input type="hidden" name="next" value={next} />}

        <FormBanner message={state?.message} />

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
          autoComplete="current-password"
          placeholder="Enter your password"
          errors={state?.errors?.password}
          labelAction={
            <Link
              href="/forgot-password"
              className="text-xs text-fx-accent hover:text-fx-accent-700"
            >
              Forgot password?
            </Link>
          }
        />

        <SubmitButton
          pending={pending}
          idleLabel="Sign in"
          pendingLabel="Signing in…"
        />

      </form>
    </div>
  );
}
