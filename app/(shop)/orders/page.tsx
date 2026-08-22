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
    <Container className="py-12 lg:py-16">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        My orders
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Every reservation, from the moment stock was claimed to the moment the
        row landed in Postgres.
      </p>

      <div className="mt-10">
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
