"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { placeOrder } from "@/app/actions/checkout";
import { useCart } from "@/app/lib/cart-context";
import { formatPrice } from "@/app/lib/format";
import OrderSummary from "@/components/cart/OrderSummary";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Section";

export default function CheckoutView() {
  const router = useRouter();
  const { lines, hydrated, subtotal, savings, itemCount, clear, removeItem } =
    useCart();

  const [pending, startTransition] = useTransition();
  const [rejected, setRejected] = useState<
    { flashSaleId: number; name: string; message: string }[]
  >([]);

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

  // A closed sale is as unbuyable as a sold-out one; reserve_stock.lua refuses
  // both, so the button must not offer to try.
  const blocked = lines.some((line) => line.soldOut || line.closed);

  const handlePlaceOrder = () => {
    if (blocked || pending) return;
    setRejected([]);

    startTransition(async () => {
      /*
       * `POST /api/v1/flash-sale/checkout`, once per cart line — the endpoint
       * reserves one sale at a time. See app/actions/checkout.ts for why that
       * is a sequential loop and not a transaction.
       */
      const outcome = await placeOrder(
        lines.map((line) => ({
          flashSaleId: line.flashSaleId,
          quantity: line.quantity,
          name: line.name,
        })),
      );

      if ("error" in outcome) {
        setRejected([{ flashSaleId: 0, name: "", message: outcome.error }]);
        return;
      }

      // Drop only what was actually reserved. A partial failure — two lines
      // through, one sold out — must leave the failed line in the cart, or the
      // customer loses the thing they came for with no explanation.
      for (const line of outcome.placed) removeItem(line.flashSaleId);

      if (outcome.rejected.length > 0) {
        setRejected(outcome.rejected);
        return;
      }

      clear();
      router.push(`/orders/${outcome.placed[0].orderId}?placed=1`);
    });
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
              <li
                key={line.flashSaleId}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
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
                  {(line.soldOut || line.closed) && (
                    <p className="mt-1 text-sm font-semibold text-red-600">
                      {line.soldOut
                        ? "Sold out since you added it"
                        : "This sale has closed"}
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
                // Disabled while in flight. The idempotency key is minted per
                // attempt on the server, so two clicks would be two distinct
                // reservations rather than one deduped by the UNIQUE index.
                disabled={blocked || pending}
                onClick={handlePlaceOrder}
              >
                {pending ? "Reserving stock…" : "Place order"}
              </Button>

              {rejected.length > 0 && (
                <div
                  role="alert"
                  className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left"
                >
                  <p className="text-sm font-semibold text-red-900">
                    {rejected.length === 1 && !rejected[0].name
                      ? "Checkout failed"
                      : "Some items could not be reserved"}
                  </p>
                  <ul className="mt-1.5 space-y-1 text-sm text-red-800">
                    {rejected.map((line, index) => (
                      <li key={line.flashSaleId || index}>
                        {line.name && (
                          <span className="font-medium">{line.name}: </span>
                        )}
                        {line.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {blocked && (
                <p className="mt-3 text-center text-sm text-red-600">
                  An item in your cart can no longer be reserved. Remove it in
                  the cart to continue.
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
