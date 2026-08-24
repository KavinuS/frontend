import type { Metadata } from "next";

import { listMyOrders } from "@/app/lib/orders";
import OrdersView from "@/components/orders/OrdersView";
import { Container, EmptyState } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "My Orders — FlashX",
  description: "Track your flash sale reservations from queue to confirmation.",
};

export default async function OrdersPage() {
  const orders = await listMyOrders();

  return (
    <Container className="pb-22 pt-14">
      <h1 className="animate-fx-lift text-[clamp(40px,5vw,60px)] tracking-[-0.03em]">
        Orders
      </h1>
      <p className="fx-muted mt-2 max-w-[58ch]">
        Every reservation, with the status the persistence worker last reported.
      </p>

      <div className="mt-7">
        {orders.ok ? (
          <OrdersView orders={orders.data} />
        ) : orders.status === 401 ? (
          // Not an error state. Orders are scoped to the JWT subject, so a
          // signed-out visitor simply has none to show.
          <EmptyState
            icon="🔐"
            title="Sign in to see your orders"
            description="Your reservations are tied to your account, not this browser."
            actionLabel="Sign in"
            actionHref="/login?next=/orders"
          />
        ) : (
          <EmptyState
            icon="🔌"
            title="Can't load your orders"
            description={orders.message}
            actionLabel="Shop flash sales"
            actionHref="/sales"
          />
        )}
      </div>
    </Container>
  );
}
