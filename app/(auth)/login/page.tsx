import type { Metadata } from "next";
import Link from "next/link";

import { isBackendConfigured } from "@/app/lib/api";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — FlashX",
  description: "Sign in to FlashX to track your flash sale orders in real time.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to reserve stock and follow your orders live."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Create one
          </Link>
        </>
      }
    >
      <LoginForm googleEnabled={isBackendConfigured()} />
    </AuthShell>
  );
}
