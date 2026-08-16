import type { Metadata } from "next";

import OrdersView from "@/components/orders/OrdersView";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "My Orders — FlashX",
  description: "Track your flash sale reservations from queue to confirmation.",
};

export default function OrdersPage() {
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
        <OrdersView />
      </div>
    </Container>
  );
}
