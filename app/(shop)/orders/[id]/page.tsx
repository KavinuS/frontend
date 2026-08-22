import type { Metadata } from "next";

import { getMyOrder } from "@/app/lib/orders";
import OrderDetailView from "@/components/orders/OrderDetailView";
import { Container, EmptyState } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Order — FlashX",
  description: "Track this reservation from the queue to confirmation.",
};

export default async function OrderDetailPage(
  props: PageProps<"/orders/[id]">,
) {
  const { id } = await props.params;
  const { placed } = await props.searchParams;

  const result = await getMyOrder(id);

  // 404 is expected immediately after checkout: the 202 has returned but the
  // queue worker has not written the row yet. The view treats a null order as
  // "still coming" and polls, rather than as "does not exist".
  const order = result.ok ? result.data : null;

  if (!result.ok && result.status === 401) {
    return (
      <Container className="py-12 lg:py-16">
        <EmptyState
          icon="🔐"
          title="Sign in to view this order"
          description="Orders are tied to your account."
          actionLabel="Sign in"
          actionHref={`/login?next=/orders/${encodeURIComponent(id)}`}
        />
      </Container>
    );
  }

  return (
    <Container className="py-12 lg:py-16">
      <OrderDetailView order={order} justPlaced={placed === "1"} />
    </Container>
  );
}
