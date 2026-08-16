"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/app/lib/cart-context";
import { formatPrice } from "@/app/lib/format";
import { useOrders } from "@/app/lib/orders-store";
import OrderSummary from "@/components/cart/OrderSummary";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Section";

export default function CheckoutView() {
  const router = useRouter();
  const { lines, hydrated, subtotal, savings, itemCount, clear } = useCart();
  const { placeOrder } = useOrders();

  const [placing, setPlacing] = useState(false);

  if (!hydrated) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    );
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        icon="🧾"
        title="Nothing to check out"
        description="Your cart is empty, so there's nothing to reserve yet."
        actionLabel="Shop flash sales"
        actionHref="/sales"
      />
    );
  }

  const blocked = lines.some((line) => line.soldOut);

  const handlePlaceOrder = () => {
    if (blocked) return;
    setPlacing(true);

    /*
     * Stands in for `POST /api/v1/flash-sale/checkout`.
     *
     * The real call returns 202 Accepted with a correlation ID after the Redis
     * DECR succeeds and the job is queued. Here the order is created locally
     * in PENDING_PERSISTENCE and the confirmation page drives it to CONFIRMED.
     * Swapping in the real endpoint means replacing this one function.
     */
    const order = placeOrder(
      lines.map((line) => ({
        sku: line.sku,
        name: line.name,
        emoji: line.emoji,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
    );

    clear();
    router.push(`/orders/${order.id}?placed=1`);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

      <div className="space-y-6">

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Items being reserved
          </h2>

          <ul className="mt-5 divide-y divide-slate-100">
            {lines.map((line) => (
              <li key={line.sku} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <span
                  aria-hidden="true"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-slate-100 to-slate-200 text-2xl"
                >
                  {line.emoji}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {line.name}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Qty {line.quantity} × {formatPrice(line.unitPrice)}
                  </p>
                  {line.soldOut && (
                    <p className="mt-1 text-sm font-semibold text-red-600">
                      Sold out since you added it
                    </p>
                  )}
                </div>

                <span className="font-semibold text-slate-900">
                  {formatPrice(line.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* The engineering story is the point of this project, so the checkout
            explains what is about to happen rather than hiding it. */}
        <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">
            What happens when you place this order
          </h2>

          <ol className="mt-4 space-y-3 text-sm text-blue-900/80">
            {[
              "Redis runs an atomic DECR on the stock counter — sub-millisecond, no database lock.",
              "If stock remains, an OrderCreatedEvent is pushed onto the queue.",
              "You get 202 Accepted and a correlation ID straight away.",
              "A background worker writes the order to Postgres in an ACID transaction.",
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <OrderSummary
          subtotal={subtotal}
          savings={savings}
          itemCount={itemCount}
          footer={
            <>
              <Button
                variant="flash"
                size="lg"
                fullWidth
                disabled={blocked || placing}
                onClick={handlePlaceOrder}
              >
                {placing ? "Reserving stock…" : "Place order"}
              </Button>

              {blocked && (
                <p className="mt-3 text-center text-sm text-red-600">
                  A sold-out item is still in your cart. Remove it in the cart
                  to continue.
                </p>
              )}

              <p className="mt-4 text-center text-xs text-slate-500">
                No payment is taken — this is a concurrency demo, not a store.
              </p>
            </>
          }
        />
      </div>
    </div>
  );
}
