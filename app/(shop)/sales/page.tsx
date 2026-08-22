import type { Metadata } from "next";

import { listFlashSales, liveOnly, upcomingOnly } from "@/app/lib/catalog";
import FlashSaleCard from "@/components/flashSalesCard/FlashSalesCard";
import UpcomingDeals from "@/components/upcomingDeals/UpcomingDeals";
import { Badge, LiveDot } from "@/components/ui/Badge";
import { Container, EmptyState, SectionHeading } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Flash Sales — FlashX",
  description:
    "Every live and scheduled FlashX drop. Limited stock, atomic reservations.",
};

export default async function SalesPage() {
  const catalogue = await listFlashSales();

  const live = catalogue.ok ? liveOnly(catalogue.data) : [];
  const upcoming = catalogue.ok ? upcomingOnly(catalogue.data) : [];

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <Container className="py-16">
          <Badge tone="flash" className="px-4 py-1.5 text-sm">
            <LiveDot />
            {live.length} sale{live.length === 1 ? "" : "s"} running
          </Badge>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
            Flash sales
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Stock is pre-warmed into Redis before each sale opens, then
            decremented atomically as orders land. What you see is what is left.
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <SectionHeading
          eyebrow="Live now"
          title="Open sales"
          description="Reservations are first come, first served."
        />

        {!catalogue.ok ? (
          <EmptyState
            icon="🔌"
            title="Can't reach the catalogue"
            description={catalogue.message}
          />
        ) : live.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((product) => (
              <FlashSaleCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="😴"
            title="No sales running right now"
            description="Nothing is open at the moment. Check the scheduled drops below."
          />
        )}
      </Container>

      {/* Only render the upcoming block when it has something in it — the
          component already no-ops on an empty list. */}
      {upcoming.length > 0 && <UpcomingDeals upcoming={upcoming} />}
    </>
  );
}
