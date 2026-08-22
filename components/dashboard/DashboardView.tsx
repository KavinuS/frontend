"use client";

import Link from "next/link";

import { useCart } from "@/app/lib/cart-context";
import { formatDateTime, formatPrice, shortId } from "@/app/lib/format";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Section";
import type { Order } from "@/types/order";

/**
 * Orders arrive from the server; the cart is still client-side, so this stays a
 * Client Component and only waits on the cart to hydrate.
 */
export default function DashboardView({ orders }: { orders: Order[] }) {
  const { itemCount, hydrated: cartHydrated } = useCart();

  if (!cartHydrated) {
    return (
      <div className="space-y-6">
        <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
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
    { label: "Total orders", value: String(orders.length), tone: "text-slate-900" },
    { label: "Confirmed", value: String(confirmed.length), tone: "text-green-600" },
    { label: "Processing", value: String(pending.length), tone: "text-amber-600" },
    { label: "Total spent", value: formatPrice(totalSpent), tone: "text-blue-600" },
  ];

  const recent = orders.slice(0, 4);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Your reservations, at a glance.
          </p>
        </div>

        <ButtonLink href="/sales" variant="flash">
          Shop flash sales
        </ButtonLink>
      </div>

      {/* Account identity is a placeholder: the session cookie holds an opaque
          backend token, so there is no user profile to read until Phase 1. */}
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm text-amber-900">
        Signed-in account details aren&apos;t wired up yet — this page reads
        locally stored orders. It switches to <code className="font-mono">GET /api/v1/orders</code>{" "}
        once the backend lands.
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {stat.label}
            </dt>
            <dd className={`mt-2 text-3xl font-bold ${stat.tone}`}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent orders</h2>
            <Link
              href="/orders"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon="📦"
                title="No orders yet"
                description="Your reservations will appear here."
                actionLabel="Shop flash sales"
                actionHref="/sales"
              />
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-slate-100">
              {recent.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 transition-opacity hover:opacity-70"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-slate-100 to-slate-200 text-lg"
                      >
                        {order.lines[0]?.emoji ?? "📦"}
                      </span>

                      <div>
                        <p className="font-mono text-sm font-semibold text-slate-900">
                          #{shortId(order.id)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(order.placedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="w-20 text-right font-semibold text-slate-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Your cart</h2>
            <p className="mt-2 text-sm text-slate-600">
              {itemCount === 0
                ? "Nothing in your cart right now."
                : `${itemCount} item${itemCount === 1 ? "" : "s"} waiting to be reserved.`}
            </p>

            <ButtonLink
              href={itemCount === 0 ? "/sales" : "/cart"}
              variant={itemCount === 0 ? "secondary" : "primary"}
              fullWidth
              className="mt-4"
            >
              {itemCount === 0 ? "Browse sales" : "Go to cart"}
            </ButtonLink>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Account</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Session</dt>
                <dd className="font-semibold text-slate-900">Local only</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Order history</dt>
                <dd className="font-semibold text-slate-900">
                  {orders.length} record{orders.length === 1 ? "" : "s"}
                </dd>
              </div>
            </dl>

            <ButtonLink
              href="/login"
              variant="secondary"
              fullWidth
              className="mt-5"
            >
              Manage sign-in
            </ButtonLink>
          </section>
        </div>
      </div>
    </div>
  );
}
