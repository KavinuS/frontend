import type { Metadata } from "next";

import CartView from "@/components/cart/CartView";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Cart — FlashX",
  description: "Review the items you're about to reserve.",
};

export default function CartPage() {
  return (
    <Container className="pb-22 pt-14">
      <h1 className="animate-fx-lift text-[clamp(40px,5vw,60px)] tracking-[-0.03em]">
        Cart
      </h1>
      <p className="fx-muted mt-2">
        Nothing here is reserved yet — stock is claimed atomically at checkout.
      </p>

      <div className="mt-8">
        <CartView />
      </div>
    </Container>
  );
}
