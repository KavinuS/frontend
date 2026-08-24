import type { Metadata } from "next";

import CheckoutView from "@/components/checkout/CheckoutView";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Checkout — FlashX",
  description: "Reserve your items. Stock is claimed atomically in Redis.",
};

export default function CheckoutPage() {
  return (
    <Container className="pb-22 pt-14">
      <h1 className="animate-fx-lift text-[clamp(40px,5vw,60px)] tracking-[-0.03em]">
        Checkout
      </h1>
      <p className="fx-muted mt-2">
        No payment is taken — this is a concurrency demo, not a store.
      </p>

      <div className="mt-8">
        <CheckoutView />
      </div>
    </Container>
  );
}
