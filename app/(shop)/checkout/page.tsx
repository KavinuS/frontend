import type { Metadata } from "next";

import CheckoutView from "@/components/checkout/CheckoutView";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Checkout — FlashX",
  description: "Reserve your items. Stock is claimed atomically in Redis.",
};

export default function CheckoutPage() {
  return (
    <Container className="py-12 lg:py-16">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Checkout
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Placing the order runs an atomic decrement in Redis and queues the write
        to Postgres. You&apos;ll get a correlation ID immediately.
      </p>

      <div className="mt-10">
        <CheckoutView />
      </div>
    </Container>
  );
}
