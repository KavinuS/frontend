import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { findProductBySku, products } from "@/Data/product";
import { discountPercent, formatPrice } from "@/app/lib/format";
import AddToCartPanel from "@/components/cart/AddToCartPanel";
import Countdown from "@/components/sales/Countdown";
import { Badge, SaleStatusBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import StockBar from "@/components/ui/StockBar";

/** Prerenders every catalogue entry at build time. */
export function generateStaticParams() {
  return products.map((product) => ({ sku: product.sku }));
}

export async function generateMetadata(
  props: PageProps<"/sales/[sku]">,
): Promise<Metadata> {
  const { sku } = await props.params;
  const product = findProductBySku(sku);

  if (!product) return { title: "Sale not found — FlashX" };

  return {
    title: `${product.name} — FlashX`,
    description: product.tagline,
  };
}

export default async function SaleDetailPage(props: PageProps<"/sales/[sku]">) {
  const { sku } = await props.params;
  const product = findProductBySku(sku);

  // Unknown SKU renders the 404 page rather than an empty shell.
  if (!product) notFound();

  const soldOut = product.remainingStock <= 0;
  const scheduled = product.status === "SCHEDULED";
  const discount = discountPercent(product.originalPrice, product.salePrice);
  const saving = product.originalPrice - product.salePrice;

  return (
    <Container className="py-10 lg:py-16">

      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-slate-900">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/sales" className="hover:text-slate-900">Flash Sales</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-slate-900">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex aspect-square items-center justify-center rounded-3xl border border-slate-200 bg-linear-to-br from-slate-100 to-slate-200">
            <span aria-hidden="true" className="text-[9rem]">
              {product.emoji}
            </span>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <SaleStatusBadge status={product.status} />
            <Badge tone="neutral">{product.category}</Badge>
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            {product.name}
          </h1>

          <p className="mt-3 text-lg text-slate-600">{product.tagline}</p>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-bold text-slate-900">
              {formatPrice(product.salePrice)}
            </span>
            <span className="text-lg text-slate-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
            {discount > 0 && (
              <Badge tone="danger">
                Save {formatPrice(saving)} ({discount}%)
              </Badge>
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <StockBar
              remaining={product.remainingStock}
              total={product.totalStock}
            />

            <div className="mt-6">
              <p className="mb-2.5 text-sm font-medium text-slate-600">
                {scheduled ? "Sale opens soon — closes in" : "Sale closes in"}
              </p>
              <Countdown endsAt={product.endsAt} />
            </div>

            <div className="mt-6">
              {scheduled ? (
                <p className="rounded-xl bg-slate-50 py-3.5 text-center text-sm font-semibold text-slate-500">
                  This sale hasn&apos;t started yet
                </p>
              ) : (
                <AddToCartPanel sku={product.sku} soldOut={soldOut} />
              )}

              {!scheduled && !soldOut && (
                <ButtonLink
                  href="/cart"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="mt-3"
                >
                  Go to cart
                </ButtonLink>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              Adding to the cart does not reserve stock. Inventory is claimed
              atomically at checkout.
            </p>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-bold text-slate-900">About this item</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {product.description}
            </p>

            <ul className="mt-6 space-y-2.5">
              {product.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3 text-slate-600">
                  <span aria-hidden="true" className="mt-0.5 text-green-600">✓</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200">
            <div className="bg-white p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                SKU
              </dt>
              <dd className="mt-1 font-mono text-sm text-slate-900">
                {product.sku}
              </dd>
            </div>
            <div className="bg-white p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Allocated stock
              </dt>
              <dd className="mt-1 font-mono text-sm text-slate-900">
                {product.totalStock.toLocaleString("en-US")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Container>
  );
}
