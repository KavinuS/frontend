"use client";

import Link from "next/link";

import { useCart } from "@/app/lib/cart-context";
import { formatDateTime, formatPrice, shortId } from "@/app/lib/format";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Section";
import Thumb from "@/components/ui/Thumb";
import type { Order } from "@/types/order";

/**
 * Orders arrive from the server; the cart is still client-side, so this stays a
 * Client Component and only waits on the cart to hydrate.
 */
export default function DashboardView({ orders }: { orders: Order[] }) {
  const { itemCount, hydrated: cartHydrated } = useCart();

  if (!cartHydrated) {
    return (
      <div className="grid gap-8">
        <div className="h-28 animate-pulse border-y-2 border-fx-divider" />
        <div className="h-64 animate-pulse bg-fx-surface" />
      </div>
    );
  }

  const confirmed = orders.filter((order) => order.status === "CONFIRMED");
  const pending = orders.filter(
    (order) => order.status === "PENDING_PERSISTENCE",
  );

  /* Only confirmed orders count toward spend — a pending row hasn't been
     committed yet and a failed one never will be. */
  const totalSpent = confirmed.reduce(
    (total, order) => total + order.totalAmount,
    0,
  );

  const stats = [
    { label: "Total orders", value: String(orders.length), accent: false },
    { label: "Confirmed", value: String(confirmed.length), accent: false },
    // The one accented figure on the page: an order still in flight is the only
    // number here that might change while you are looking at it.
    { label: "Processing", value: String(pending.length), accent: true },
    { label: "Total spent", value: formatPrice(totalSpent), accent: false },
  ];

  const recent = orders.slice(0, 4);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <h1 className="animate-fx-lift text-[clamp(40px,5vw,60px)] tracking-[-0.03em]">
            Dashboard
          </h1>
          <p className="fx-muted mt-2">Your reservations, at a glance.</p>
        </div>

        <ButtonLink href="/sales" className="px-5 py-3.5">
          Shop flash sales
        </ButtonLink>
      </div>

      {/* One ruled band, four cells split by hairlines — not four cards. The
          figures are meant to be read across as one row, and a card each would
          put a gutter between numbers that belong to the same sentence. */}
      <dl className="mt-11 grid grid-cols-2 border-y-2 border-fx-divider md:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={[
              "border-fx-divider px-6 py-6 first:pl-0 last:pr-0",
              // Vertical rules: between the pair at 2-up, between every cell
              // at 4-up. Only the first cell never has one.
              index % 2 === 1 ? "border-l" : index > 0 ? "md:border-l" : "",
              // Horizontal rule: only exists while the stats wrap to two rows.
              index < 2 ? "border-b md:border-b-0" : "",
            ].join(" ")}
          >
            <dt className="fx-muted fx-eyebrow tracking-[0.12em]">
              {stat.label}
            </dt>
            <dd
              className={`mt-2.5 font-heading text-[40px] font-extrabold ${
                stat.accent ? "text-fx-accent" : ""
              }`}
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section>
          <div className="flex items-baseline justify-between border-b-2 border-fx-divider pb-3.5">
            <h2 className="text-2xl">Recent orders</h2>
            <ButtonLink href="/orders" variant="ghost">
              View all
            </ButtonLink>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No orders yet"
              description="Your reservations will appear here."
              actionLabel="Shop flash sales"
              actionHref="/sales"
            />
          ) : (
            <ul>
              {recent.map((order, index) => (
                <li
                  key={order.id}
                  className={
                    index === recent.length - 1
                      ? "border-b-2 border-fx-divider"
                      : "border-b border-fx-divider"
                  }
                >
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-5 py-5"
                  >
                    <Thumb
                      emoji={order.lines[0]?.emoji ?? "📦"}
                      width={56}
                      height={46}
                      dimmed={order.status === "FAILED"}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="fx-mono text-sm">
                        #{shortId(order.id)}
                      </div>
                      <div className="fx-muted mt-0.75 text-xs">
                        {formatDateTime(order.placedAt)}
                      </div>
                    </div>

                    <OrderStatusBadge status={order.status} />

                    <span className="w-20 text-right font-heading font-extrabold">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-8">
          <section className="border-2 border-fx-divider p-6">
            <h2 className="text-xl">Your cart</h2>
            <p className="fx-muted mt-2 text-sm">
              {itemCount === 0
                ? "Nothing in your cart right now."
                : `${itemCount} item${itemCount === 1 ? "" : "s"} waiting to be reserved.`}
            </p>

            <ButtonLink
              href={itemCount === 0 ? "/sales" : "/cart"}
              variant={itemCount === 0 ? "secondary" : "primary"}
              fullWidth
              className="mt-4.5 px-4.5 py-3"
            >
              {itemCount === 0 ? "Browse sales" : "Go to cart"}
            </ButtonLink>
          </section>

          <section className="border-2 border-fx-divider p-6">
            <h2 className="text-xl">Account</h2>

            <dl className="mt-3.5 text-sm">
              <div className="flex justify-between border-b border-fx-divider py-2.5">
                <dt className="fx-muted">Session</dt>
                <dd>flashx_session</dd>
              </div>
              <div className="flex justify-between border-b border-fx-divider py-2.5">
                <dt className="fx-muted">Order history</dt>
                <dd>
                  {orders.length} record{orders.length === 1 ? "" : "s"}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="fx-muted">Confirmed</dt>
                <dd>{confirmed.length}</dd>
              </div>
            </dl>

            <ButtonLink
              href="/profile"
              variant="secondary"
              fullWidth
              className="mt-4 px-4.5 py-3"
            >
              Manage account
            </ButtonLink>
          </section>
        </div>
      </div>
    </div>
  );
}
