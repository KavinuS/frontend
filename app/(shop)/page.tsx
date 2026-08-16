import { liveProducts } from "@/Data/product";
import FlashSaleCard from "@/components/flashSalesCard/FlashSalesCard";
import Hero from "@/components/hero/Hero";
import SystemStatus from "@/components/systemStatus/SystemStatus";
import UpcomingDeals from "@/components/upcomingDeals/UpcomingDeals";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Section";

export default function Home() {
  const live = liveProducts();

  return (
    <>
      <Hero />

      {/* Live deals — static seed data for now, backed by the API in Phase 1 */}
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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((product) => (
              <FlashSaleCard key={product.sku} product={product} />
            ))}
          </div>
        </div>
      </Container>

      <UpcomingDeals />

      <SystemStatus />
    </>
  );
}
