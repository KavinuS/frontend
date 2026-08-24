import type { Metadata } from "next";
import Link from "next/link";

import { isBackendConfigured } from "@/app/lib/api";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account — FlashX",
  description:
    "Create a FlashX account to join flash sales and track orders in real time.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes a minute. Then you're ready for the next drop."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-fx-accent hover:text-fx-accent-700"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm googleEnabled={isBackendConfigured()} />
    </AuthShell>
  );
}
