"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { placeOrder } from "@/app/actions/checkout";
import { useCart } from "@/app/lib/cart-context";
import { formatPrice } from "@/app/lib/format";
import OrderSummary from "@/components/cart/OrderSummary";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Section";
import Thumb from "@/components/ui/Thumb";

/**
 * What the "Place order" button actually sets off. Shown, not hidden behind a
 * spinner: the asynchronous hand-off is the whole point of this system, and a
 * customer who understands why they got an ID before a confirmation will not
 * read the pending state as a failure.
 */
const pipeline = [
  "Redis runs an atomic DECR on the stock counter — sub-millisecond, no database lock.",
  "If stock remains, an OrderCreatedEvent is pushed onto the queue.",
  "You get 202 Accepted and a correlation ID straight away.",
  "A background worker writes the order to Postgres in an ACID transaction.",
];

export default function CheckoutView() {
  const router = useRouter();
  const { lines, hydrated, subtotal, savings, itemCount, clear, removeItem } =
    useCart();

  const [pending, startTransition] = useTransition();
  const [rejected, setRejected] = useState<
    { flashSaleId: number; name: string; message: string }[]
  >([]);

  if (!hydrated) {
    return <div className="h-72 animate-pulse border-2 border-fx-divider" />;
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
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div>
        <h2 className="fx-eyebrow border-b-2 border-fx-divider pb-3">
          Items being reserved
        </h2>

        <ul>
          {lines.map((line) => (
            <li
              key={line.flashSaleId}
              className="flex items-center gap-4.5 border-b border-fx-divider py-5"
            >
              <Thumb
                emoji={line.emoji}
                width={64}
                height={56}
                dimmed={line.soldOut || line.closed}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-heading font-extrabold">
                  {line.name}
                </p>
                <p className="fx-muted mt-0.75 text-[13px]">
                  Qty {line.quantity} × {formatPrice(line.unitPrice)}
                </p>
                {(line.soldOut || line.closed) && (
                  <p className="mt-1 font-heading text-[13px] font-extrabold text-fx-accent-800">
                    {line.soldOut
                      ? "Sold out since you added it"
                      : "This sale has closed"}
                  </p>
                )}
              </div>

              <span className="font-heading font-extrabold">
                {formatPrice(line.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <section className="mt-11 border-t-2 border-fx-divider pt-6.5">
          <h2 className="fx-eyebrow text-fx-accent">
            What happens when you place this order
          </h2>

          {/* Two by two, divided by hairlines rather than numbered bullets in a
              tinted panel: the four steps are one mechanism, not a list of
              tips, and the grid makes the hand-off at step 02 visible. */}
          <ol className="mt-5.5 grid list-none p-0 sm:grid-cols-2">
            {pipeline.map((step, index) => (
              <li
                key={step}
                className={[
                  "border-b border-fx-divider py-5",
                  index % 2 === 0 ? "sm:border-r sm:pr-6" : "sm:pl-6",
                  // The last row keeps its rule on mobile, where the items are
                  // stacked, and drops it on the two-column layout.
                  index >= 2 ? "sm:border-b-0" : "",
                ].join(" ")}
              >
                <span className="mb-2 block font-heading font-extrabold text-fx-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <OrderSummary
        subtotal={subtotal}
        savings={savings}
        itemCount={itemCount}
        footer={
          <>
            <Button
              fullWidth
              className="px-4.5 py-3.5"
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
                className="mt-3 bg-fx-accent-100 px-4 py-3 text-[13px] text-fx-accent-800"
              >
                <p className="font-heading font-extrabold">
                  {rejected.length === 1 && !rejected[0].name
                    ? "Checkout failed"
                    : "Some items could not be reserved"}
                </p>
                <ul className="mt-1.5 grid gap-1">
                  {rejected.map((line, index) => (
                    <li key={line.flashSaleId || index}>
                      {line.name && <span>{line.name}: </span>}
                      {line.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {blocked && (
              <p className="mt-3 text-[13px] text-fx-accent-800">
                An item in your cart can no longer be reserved. Remove it in the
                cart to continue.
              </p>
            )}

            <p className="fx-muted mt-3.5 text-xs">
              Stock is claimed atomically at checkout. Two clicks would be two
              reservations, so the button locks while in flight.
            </p>
          </>
        }
      />
    </div>
  );
}
