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
}: {
  googleEnabled: boolean;
}) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="space-y-6">

      <GoogleButton label="Continue with Google" disabled={!googleEnabled} />

      <Divider label="or" />

      <form action={action} className="space-y-5" noValidate>

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
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
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
