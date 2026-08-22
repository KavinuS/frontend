import Link from "next/link";

import { discountPercent, formatPrice } from "@/app/lib/format";
import type { Product } from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Section";

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

      <div className="grid gap-6 md:grid-cols-3">
        {upcoming.map((product) => (
          <Link
            key={product.id}
            href={`/sales/${product.sku}`}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5"
          >
            <div className="mb-5 flex h-36 items-center justify-center rounded-xl bg-linear-to-br from-slate-100 to-slate-200">
              <span
                aria-hidden="true"
                className="text-5xl transition-transform duration-300 group-hover:scale-110"
              >
                {product.emoji}
              </span>
            </div>

            <Badge tone="brand">Scheduled</Badge>

            <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600">
              {product.name}
            </h3>

            <p className="mt-1 text-sm text-slate-600">{product.tagline}</p>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-900">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-sm font-semibold text-orange-600">
                {discountPercent(product.originalPrice, product.salePrice)}% off
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
