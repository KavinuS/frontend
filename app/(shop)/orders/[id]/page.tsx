import type { Metadata } from "next";

import OrderDetailView from "@/components/orders/OrderDetailView";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Order — FlashX",
  description: "Track this reservation from the queue to confirmation.",
};

/**
 * Server component only to unwrap `params`; the order itself lives in
 * localStorage, so the rendering is all client-side from here down.
 */
export default async function OrderDetailPage(
  props: PageProps<"/orders/[id]">,
) {
  const { id } = await props.params;
  const { placed } = await props.searchParams;

  return (
    <Container className="py-12 lg:py-16">
      <OrderDetailView orderId={id} justPlaced={placed === "1"} />
    </Container>
  );
}
