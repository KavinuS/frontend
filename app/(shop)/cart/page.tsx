import type { Metadata } from "next";

import CartView from "@/components/cart/CartView";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Cart — FlashX",
  description: "Review the items you're about to reserve.",
};

export default function CartPage() {
  return (
    <Container className="py-12 lg:py-16">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Your cart
      </h1>
      <p className="mt-2 text-slate-600">
        Nothing here is reserved yet — stock is claimed atomically at checkout.
      </p>

      <div className="mt-10">
        <CartView />
      </div>
    </Container>
  );
}
