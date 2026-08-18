import type { Metadata } from "next";

import { requireAdmin } from "@/app/lib/admin-api";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "FlashX Ops Console",
  description: "Manage products, flash sales, orders, and operators.",
  // The console has nothing to offer a search engine and everything to lose
  // from being indexed.
  robots: { index: false, follow: false },
};

/**
 * The admin section sits outside the `(shop)` route group, so it inherits the
 * root layout and none of the storefront chrome — no cart provider, no
 * customer navbar, no marketing footer.
 *
 * `requireAdmin()` here gates navigation only. It is repeated inside every
 * Server Action for the reason the Next.js docs give: an action is a public
 * POST endpoint that can be invoked without this layout ever rendering.
 */
export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const claims = await requireAdmin();

  return (
    <AdminShell name={claims.name} email={claims.email}>
      {children}
    </AdminShell>
  );
}
