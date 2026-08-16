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
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
        <p className="font-semibold text-amber-900">Not implemented yet</p>
        <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
          Resetting a password requires the backend to issue a signed, expiring
          token and send it by email. That lands with the auth service in
          Phase 1. Until then, register a new account if you need one.
        </p>
      </div>
    </AuthShell>
  );
}
