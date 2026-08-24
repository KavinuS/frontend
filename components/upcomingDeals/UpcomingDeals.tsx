import Link from "next/link";

import { discountPercent, formatPrice } from "@/app/lib/format";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Section";
import Thumb from "@/components/ui/Thumb";
import type { Product } from "@/types/product";

/**
 * Scheduled drops. The list is passed in rather than fetched here so the page
 * makes one catalogue call and slices it, instead of every section issuing its
 * own request for the same board.
 */
export default function UpcomingDeals({ upcoming }: { upcoming: Product[] }) {
  // Nothing scheduled is a legitimate state — drop the section rather than
  // render an empty grid under a heading.
  if (upcoming.length === 0) return null;

  return (
    <Container className="pb-24">
      <SectionHeading
        eyebrow="Coming soon"
        title="Upcoming deals"
        description="Scheduled drops. Stock is pre-warmed into Redis before each one opens."
        action={
          <ButtonLink href="/sales" variant="secondary">
            View all sales
          </ButtonLink>
        }
      />

      <div className="grid gap-8 md:grid-cols-3">
        {upcoming.map((product) => (
          <Link
            key={product.id}
            href={`/sales/${product.sku}`}
            className="group border-t-2 border-fx-divider pt-4"
          >
            <Thumb emoji={product.emoji} height={160} />

            <div className="mt-4">
              <Badge tone="outline">Scheduled</Badge>
            </div>

            <h3 className="mt-3 text-lg group-hover:text-fx-accent">
              {product.name}
            </h3>

            <p className="fx-muted mt-1 text-sm">{product.tagline}</p>

            <div className="mt-4 flex items-baseline justify-between border-t border-fx-divider pt-3">
              <span className="font-heading text-lg font-extrabold">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-sm text-fx-accent-700">
                {discountPercent(product.originalPrice, product.salePrice)}% off
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
