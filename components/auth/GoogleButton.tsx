"use client";

import { useFormStatus } from "react-dom";

import { signInWithGoogle } from "@/app/actions/auth";

/**
 * "Continue with Google" — posts to a Server Action that redirects the browser
 * to the backend's OAuth entry point.
 *
 * It is a real <form> rather than an onClick handler so the hand-off still
 * works before hydration, and so the OAuth start is a POST (a GET link would be
 * prefetchable and CSRF-triggerable).
 */
export default function GoogleButton({
  label,
  disabled = false,
  next,
}: {
  label: string;
  disabled?: boolean;
  /** Where to land afterwards, e.g. /admin. Validated server-side. */
  next?: string;
}) {
  return (
    <form action={signInWithGoogle}>
      {/* Carried through the form for the same reason the password form does
          it: a Server Action cannot see the caller's search params. The action
          parks it in a cookie, because the OAuth round trip has nowhere to put
          it. */}
      {next && <input type="hidden" name="next" value={next} />}

      <GoogleSubmit label={label} disabled={disabled} />
    </form>
  );
}

function GoogleSubmit({
  label,
  disabled,
}: {
  label: string;
  disabled: boolean;
}) {
  // useFormStatus only reports the status of the nearest parent <form>, which
  // is why this is split out of GoogleButton.
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      title={
        disabled ? "Google sign-in requires the backend to be configured." : undefined
      }
      className="fx-btn fx-btn-secondary fx-btn-block gap-3 px-4.5 py-3.5"
    >
      <GoogleLogo />
      {pending ? "Redirecting…" : label}
    </button>
  );
}

/** Google's four-colour "G". aria-hidden — the button text already names it. */
function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
