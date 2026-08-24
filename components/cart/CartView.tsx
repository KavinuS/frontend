"use client";

import Link from "next/link";

import { MAX_PER_ITEM, useCart, type CartLine } from "@/app/lib/cart-context";
import { formatPrice } from "@/app/lib/format";
import OrderSummary from "@/components/cart/OrderSummary";
import QuantityStepper from "@/components/cart/QuantityStepper";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Section";
import Thumb from "@/components/ui/Thumb";

export default function CartView() {
  const { lines, hydrated, subtotal, savings, itemCount, clear } = useCart();

  // The cart lives in localStorage, so there is genuinely nothing to show until
  // the client has read it. A skeleton avoids flashing "your cart is empty".
  if (!hydrated) return <CartSkeleton />;

  if (lines.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        description="Browse the live flash sales and grab something before the stock runs out."
        actionLabel="Shop flash sales"
        actionHref="/sales"
      />
    );
  }

  // Sold out AND closed both block checkout: the reservation script refuses
  // either, so letting the button through would just produce a failed order.
  const blocked = lines.filter((line) => line.soldOut || line.closed);

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div>
        <div className="flex items-center justify-between border-b-2 border-fx-divider pb-3">
          <h2 className="fx-eyebrow">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </h2>

          <Button variant="ghost" onClick={clear}>
            Clear cart
          </Button>
        </div>

        <ul>
          {lines.map((line) => (
            <CartRow key={line.flashSaleId} line={line} />
          ))}
        </ul>
      </div>

      <OrderSummary
        subtotal={subtotal}
        savings={savings}
        itemCount={itemCount}
        footer={
          <>
            <ButtonLink
              href="/checkout"
              fullWidth
              // A blocked line makes checkout pointless. `aria-disabled` marks
              // it unavailable and `.fx-btn[aria-disabled]` dims it, but a link
              // with that attribute still navigates — `pointer-events-none`
              // plus removing it from the tab order is what actually stops it.
              className={`px-4.5 py-3.5 ${
                blocked.length > 0 ? "pointer-events-none" : ""
              }`}
              aria-disabled={blocked.length > 0}
              tabIndex={blocked.length > 0 ? -1 : undefined}
            >
              Proceed to checkout
            </ButtonLink>

            {blocked.length > 0 && (
              <p className="mt-3 text-[13px] text-fx-accent-800">
                Remove the sold-out item{blocked.length === 1 ? "" : "s"} to
                continue.
              </p>
            )}

            <ButtonLink
              href="/sales"
              variant="secondary"
              fullWidth
              className="mt-2 px-4.5 py-3"
            >
              Continue shopping
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}

/**
 * One cart line.
 *
 * A blocked line is not styled as an error and left there — it is promoted. The
 * accent wash and the solid Remove button make it the loudest thing in the
 * list, because it is the only thing standing between the customer and
 * checkout.
 */
function CartRow({ line }: { line: CartLine }) {
  const { setQuantity, removeItem } = useCart();
  const blocked = line.soldOut || line.closed;

  return (
    <li
      className={
        blocked
          ? "flex flex-wrap items-center gap-5 border-b-2 border-fx-accent bg-fx-accent-100 px-3 py-5.5"
          : "flex flex-wrap items-center gap-5 border-b border-fx-divider py-5.5"
      }
    >
      <Link href={`/sales/${line.sku}`} tabIndex={-1} aria-hidden="true">
        <Thumb emoji={line.emoji} width={88} height={72} dimmed={blocked} />
      </Link>

      <div className="min-w-40 flex-1">
        <Link
          href={`/sales/${line.sku}`}
          className="font-heading text-lg font-extrabold text-fx-ink hover:text-fx-accent"
        >
          {line.name}
        </Link>

        <div className="fx-mono fx-muted mt-1 text-[11px]">
          {line.sku}
          {!blocked && ` · ${formatPrice(line.unitPrice)} each`}
        </div>

        {blocked ? (
          <p className="mt-1.5 font-heading text-[13px] font-extrabold text-fx-accent-800">
            {line.soldOut
              ? "Sold out — remove to continue"
              : "Sale closed — remove to continue"}
          </p>
        ) : (
          // Say why the + is greyed out — scarcity and the per-customer cap are
          // different messages and the user can act on the first.
          line.atMax && (
            <p className="mt-1.5 text-xs text-fx-accent-700">
              {line.remainingStock < MAX_PER_ITEM
                ? `Only ${line.remainingStock} left in this sale`
                : `Limit ${MAX_PER_ITEM} per customer`}
            </p>
          )
        )}
      </div>

      {!blocked && (
        <QuantityStepper
          value={line.quantity}
          onChange={(next) => setQuantity(line.flashSaleId, next)}
          canDecrease
          // `atMax` already folds in both ceilings — the per-customer cap and
          // the remaining stock, whichever bites first.
          canIncrease={!line.atMax}
          label={`quantity of ${line.name}`}
        />
      )}

      <div className="w-23 text-right font-heading text-lg font-extrabold">
        {formatPrice(line.lineTotal)}
      </div>

      <Button
        variant={blocked ? "primary" : "ghost"}
        onClick={() => removeItem(line.flashSaleId)}
        aria-label={`Remove ${line.name} from cart`}
      >
        Remove
      </Button>
    </li>
  );
}

function CartSkeleton() {
  return (
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div>
        {[0, 1].map((index) => (
          <div
            key={index}
            className="h-28 animate-pulse border-b border-fx-divider bg-fx-surface"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse border-2 border-fx-divider" />
    </div>
  );
}
