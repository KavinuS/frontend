import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getFlashSaleBySku } from "@/app/lib/catalog";
import { discountPercent, formatPrice } from "@/app/lib/format";
import AddToCartPanel from "@/components/cart/AddToCartPanel";
import Countdown from "@/components/sales/Countdown";
import { LiveDot } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container, EmptyState } from "@/components/ui/Section";
import Thumb from "@/components/ui/Thumb";

/*
 * `generateStaticParams` was removed deliberately.
 *
 * Prerendering this page would freeze `remainingStock` and `status` at build
 * time, so a sold-out sale would keep advertising stock until the next deploy.
 * Stock is the entire subject of the page; serving a stale copy of it is worse
 * than serving it a few milliseconds slower.
 */

export async function generateMetadata(
  props: PageProps<"/sales/[sku]">,
): Promise<Metadata> {
  const { sku } = await props.params;
  const result = await getFlashSaleBySku(sku);

  if (!result.ok) return { title: "Sale not found — FlashX" };

  return {
    title: `${result.data.name} — FlashX`,
    description: result.data.tagline,
  };
}

export default async function SaleDetailPage(props: PageProps<"/sales/[sku]">) {
  const { sku } = await props.params;
  const result = await getFlashSaleBySku(sku);

  // An unknown SKU renders the 404 page rather than an empty shell. A backend
  // that is merely down is NOT a 404 — that would tell the customer the product
  // does not exist, so it surfaces as an error instead.
  if (!result.ok) {
    if (result.status === 404) notFound();

    return (
      <Container className="py-20">
        <EmptyState
          icon="🔌"
          title="Can't load this sale"
          description={result.message}
          actionLabel="Back to flash sales"
          actionHref="/sales"
        />
      </Container>
    );
  }

  const product = result.data;

  const soldOut = product.remainingStock <= 0;
  const scheduled = product.status === "SCHEDULED";
  const ended = product.status === "ENDED";
  const live = !scheduled && !ended && !soldOut;
  const discount = discountPercent(product.originalPrice, product.salePrice);

  return (
    <Container className="pb-22 pt-10">
      {/* A single back link, not a breadcrumb trail. There is exactly one route
          into this page, so the middle crumbs were only ever decoration. */}
      <ButtonLink href="/sales" variant="ghost" className="mb-7">
        ← All flash sales
      </ButtonLink>

      <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div className="lg:sticky lg:top-24">
          <div className="animate-fx-wipe">
            <Thumb
              emoji={product.emoji}
              height={460}
              dimmed={soldOut || ended}
            />
          </div>

          <dl className="mt-3 grid grid-cols-3 gap-3">
            <Fact label="SKU" value={product.sku} mono />
            <Fact label="Category" value={product.category} />
            <Fact
              label="Allocated"
              value={product.totalStock.toLocaleString("en-US")}
              mono
            />
          </dl>
        </div>

        <div className="animate-fx-lift [animation-delay:0.1s]">
          <div className="flex items-center gap-2.5">
            {live && <LiveDot size={9} />}
            <span className="fx-eyebrow tracking-[0.16em]">
              {statusWord(product.status, soldOut)} · {product.category}
            </span>
          </div>

          <h1 className="mt-4.5 text-[clamp(38px,5vw,54px)] tracking-[-0.03em]">
            {product.name}
          </h1>

          <p className="fx-mono fx-muted mt-2.5 text-xs">{product.sku}</p>

          <p className="mt-4.5 max-w-[52ch]">{product.description}</p>

          <div className="mt-8 flex flex-wrap items-baseline gap-3.5 border-t-2 border-fx-divider pt-6.5">
            <span className="font-heading text-[52px] font-extrabold tracking-[-0.03em]">
              {formatPrice(product.salePrice)}
            </span>
            <span className="fx-muted text-lg line-through">
              {formatPrice(product.originalPrice)}
            </span>
            {discount > 0 && (
              <span className="bg-fx-accent px-2.5 py-[5px] font-heading text-sm font-extrabold text-fx-bg">
                −{discount}%
              </span>
            )}
          </div>

          {/* Time and stock share one ruled band, split by a hairline. They are
              the two numbers that decide whether to buy now, so they are read
              together rather than stacked in separate panels. */}
          <div className="mt-7 grid grid-cols-2 border-y border-fx-divider">
            <div className="border-r border-fx-divider py-4.5 pr-5">
              <div className="fx-muted fx-eyebrow tracking-[0.12em]">
                {scheduled ? "Closes in" : "Sale ends in"}
              </div>
              <Countdown
                endsAt={product.endsAt}
                className="mt-2 block text-[28px] tracking-[0.02em]"
              />
            </div>

            <div className="py-4.5 pl-5">
              <div className="fx-muted fx-eyebrow tracking-[0.12em]">
                Remaining
              </div>
              <div className="mt-2 font-heading text-[28px] font-extrabold">
                {product.remainingStock.toLocaleString("en-US")}{" "}
                <span className="fx-muted text-[15px]">
                  of {product.totalStock.toLocaleString("en-US")}
                </span>
              </div>
              <div className="mt-2.5 h-1.25 bg-fx-neutral-300">
                <div
                  className="h-full origin-left animate-fx-bar bg-fx-ink"
                  style={{
                    width: `${
                      product.totalStock > 0
                        ? Math.min(
                            100,
                            (product.remainingStock / product.totalStock) * 100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-7">
            {scheduled ? (
              <p className="border-y border-fx-divider py-3.5 text-center font-heading font-extrabold">
                This sale hasn&apos;t started yet
              </p>
            ) : ended ? (
              <p className="border-y border-fx-divider py-3.5 text-center font-heading font-extrabold">
                This sale has closed
              </p>
            ) : (
              <AddToCartPanel flashSaleId={product.id} soldOut={soldOut} />
            )}
          </div>

          <p className="fx-muted mt-2.5 text-xs">
            The cart holds an intention to buy, not a reservation. Inventory is
            claimed atomically at checkout.
          </p>

          {product.highlights.length > 0 && (
            <div className="mt-9">
              <h2 className="fx-eyebrow mb-3.5">Highlights</h2>

              {/* Numbered and ruled rather than ticked and bulleted: the index
                  is the only ornament the system allows itself, and it doubles
                  as the count. */}
              <ul className="grid list-none border-b border-fx-divider p-0">
                {product.highlights.map((highlight, index) => (
                  <li
                    key={highlight}
                    className="flex gap-3.5 border-t border-fx-divider py-3"
                  >
                    <span className="fx-mono text-fx-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

function statusWord(status: string, soldOut: boolean) {
  if (soldOut) return "Sold out";
  if (status === "SCHEDULED") return "Scheduled";
  if (status === "ENDED") return "Closed";
  return "Live";
}

function Fact({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border-t border-fx-divider pt-2.5">
      <dt className="fx-muted fx-eyebrow tracking-[0.1em]">{label}</dt>
      <dd className={`mt-1 truncate text-[13px] ${mono ? "fx-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
