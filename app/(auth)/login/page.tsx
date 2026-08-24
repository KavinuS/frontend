import type { Metadata } from "next";
import Link from "next/link";

import { isBackendConfigured } from "@/app/lib/api";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — FlashX",
  description: "Sign in to FlashX to track your flash sale orders in real time.",
};

/**
 * Failures the /auth/callback route hands back as a code.
 *
 * Mapped here rather than passed as text so the wording lives with the UI, and
 * so an arbitrary `?error=` in a crafted link cannot put attacker-chosen prose
 * on a sign-in page — an unknown code renders nothing at all.
 */
const OAUTH_ERRORS: Record<string, string> = {
  google: "Google sign-in didn't complete. Please try again.",
  google_no_email:
    "Google didn't share an email address for that account, so there's nothing to sign you in as. Try another account, or use a password below.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { next, error } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to reserve stock and follow your orders live."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-fx-accent hover:text-fx-accent-700"
          >
            Create one
          </Link>
        </>
      }
    >
      <LoginForm
        googleEnabled={isBackendConfigured()}
        next={typeof next === "string" ? next : undefined}
        notice={typeof error === "string" ? OAUTH_ERRORS[error] : undefined}
      />
    </AuthShell>
  );
}
