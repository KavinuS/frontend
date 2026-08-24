import type { Metadata } from "next";

import { listMyOrders } from "@/app/lib/orders";
import DashboardView from "@/components/dashboard/DashboardView";
import { Container, EmptyState } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Dashboard — FlashX",
  description: "Your FlashX account overview and recent reservations.",
};

export default async function DashboardPage() {
  const orders = await listMyOrders();

  if (!orders.ok && orders.status === 401) {
    return (
      <Container className="pb-22 pt-14">
        <EmptyState
          icon="🔐"
          title="Sign in to see your dashboard"
          description="Your reservations are tied to your account, not this browser."
          actionLabel="Sign in"
          actionHref="/login?next=/dashboard"
        />
      </Container>
    );
  }

  return (
    <Container className="pb-22 pt-14">
      {/* A backend failure shows an empty dashboard rather than a crash; the
          orders page is where the error itself is reported. */}
      <DashboardView orders={orders.ok ? orders.data : []} />
    </Container>
  );
}
