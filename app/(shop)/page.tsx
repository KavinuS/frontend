import { listFlashSales, liveOnly, upcomingOnly } from "@/app/lib/catalog";
import FlashSaleCard from "@/components/flashSalesCard/FlashSalesCard";
import Hero from "@/components/hero/Hero";
import SystemStatus from "@/components/systemStatus/SystemStatus";
import UpcomingDeals from "@/components/upcomingDeals/UpcomingDeals";
import { ButtonLink } from "@/components/ui/Button";
import { Container, EmptyState, SectionHeading } from "@/components/ui/Section";

export default async function Home() {
  const catalogue = await listFlashSales();

  const live = catalogue.ok ? liveOnly(catalogue.data) : [];
  const upcoming = catalogue.ok ? upcomingOnly(catalogue.data) : [];

  return (
    <>
      <Hero />

      <Container className="py-20">
        {/* scroll-mt clears the sticky navbar when the hero's anchor jumps here. */}
        <div id="live-deals" className="scroll-mt-24">
          <SectionHeading
            eyebrow="Live now"
            title="Flash deals"
            description="Atomic reservations, first come first served. Stock updates the moment someone checks out."
            action={
              <ButtonLink href="/sales" variant="secondary">
                View all sales
              </ButtonLink>
            }
          />

          {!catalogue.ok ? (
            // Says what actually failed instead of rendering an empty grid,
            // which would read as "no sales" and is a different problem.
            <EmptyState
              icon="🔌"
              title="Can't reach the catalogue"
              description={catalogue.message}
            />
          ) : live.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((product) => (
                <FlashSaleCard key={product.sku} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="😴"
              title="No sales running right now"
              description="Nothing is open at the moment. Check the scheduled drops below."
            />
          )}
        </div>
      </Container>

      <UpcomingDeals upcoming={upcoming} />

      <SystemStatus />
    </>
  );
}
