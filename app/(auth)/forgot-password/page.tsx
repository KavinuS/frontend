import type { Metadata } from "next";
import Link from "next/link";

import AuthShell from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Reset password — FlashX",
  description: "Reset your FlashX password.",
};

/**
 * Stub. A working reset needs a backend that can mint and email a signed,
 * expiring token — there is nothing sensible to build here until that exists,
 * and a form that silently does nothing would be worse than saying so.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Password reset isn't available yet."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-fx-accent hover:text-fx-accent-700"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <div className="border-y-2 border-fx-divider py-6">
        <p className="fx-eyebrow text-fx-accent">Not implemented yet</p>
        <p className="fx-muted mt-3 text-sm">
          Resetting a password requires the backend to issue a signed, expiring
          token and send it by email. That lands with the auth service in
          Phase 1. Until then, register a new account if you need one.
        </p>
      </div>
    </AuthShell>
  );
}
