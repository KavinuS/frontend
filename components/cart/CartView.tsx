"use client";

import Link from "next/link";

import { MAX_PER_ITEM, useCart, type CartLine } from "@/app/lib/cart-context";
import { formatPrice } from "@/app/lib/format";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Section";
import OrderSummary from "@/components/cart/OrderSummary";

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

  // Sold-out lines block checkout: the reservation would fail at the backend
  // anyway, so it is better to say so here than to bounce the user later.
  // Sold out AND closed both block checkout: the reservation script refuses
  // either, so letting the button through would just produce a failed order.
  const blockedLines = lines.filter((line) => line.soldOut || line.closed);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>

          <Button variant="danger" size="sm" onClick={clear}>
            Clear cart
          </Button>
        </div>

        <ul className="space-y-3">
          {lines.map((line) => (
            <CartRow key={line.flashSaleId} line={line} />
          ))}
        </ul>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <OrderSummary
          subtotal={subtotal}
          savings={savings}
          itemCount={itemCount}
          footer={
            <>
              <ButtonLink
                href="/checkout"
                variant="flash"
                size="lg"
                fullWidth
                // A sold-out line makes checkout pointless; aria-disabled keeps
                // the link in the tab order while marking it unavailable.
                aria-disabled={blockedLines.length > 0}
                className={
                  blockedLines.length > 0
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              >
                Proceed to checkout
              </ButtonLink>

              {blockedLines.length > 0 && (
                <p className="mt-3 text-center text-sm text-red-600">
                  Remove the sold-out item{blockedLines.length === 1 ? "" : "s"}{" "}
                  to continue.
                </p>
              )}

              <ButtonLink
                href="/sales"
                variant="ghost"
                size="md"
                fullWidth
                className="mt-2"
              >
                Continue shopping
              </ButtonLink>
            </>
          }
        />
      </div>
    </div>
  );
}

function CartRow({ line }: { line: CartLine }) {
  const { setQuantity, removeItem } = useCart();

  return (
    <li
      className={`flex gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${
        line.soldOut || line.closed
          ? "border-red-200 bg-red-50/40"
          : "border-slate-200"
      }`}
    >
      <Link
        href={`/sales/${line.sku}`}
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-slate-100 to-slate-200 text-3xl"
        aria-hidden="true"
      >
        {line.emoji}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">
            <Link href={`/sales/${line.sku}`} className="hover:text-blue-600">
              {line.name}
            </Link>
          </h3>

          <p className="mt-0.5 font-mono text-xs text-slate-400">{line.sku}</p>

          {line.soldOut || line.closed ? (
            <p className="mt-1.5 text-sm font-semibold text-red-600">
              Sold out — remove to continue
            </p>
          ) : (
            <>
              <p className="mt-1.5 text-sm text-slate-500">
                {formatPrice(line.unitPrice)} each
              </p>

              {/* Say why the + is greyed out — scarcity and the per-customer
                  cap are different messages and the user can act on the first. */}
              {line.atMax && (
                <p className="mt-1 text-xs font-semibold text-amber-600">
                  {line.remainingStock < MAX_PER_ITEM
                    ? `Only ${line.remainingStock} left in this sale`
                    : `Limit ${MAX_PER_ITEM} per customer`}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-4">

          <div className="flex items-center rounded-xl border border-slate-200">
            <QuantityButton
              label={`Decrease quantity of ${line.name}`}
              disabled={line.soldOut || line.closed}
              onClick={() =>
                setQuantity(line.flashSaleId, line.quantity - 1)
              }
            >
              −
            </QuantityButton>

            <span className="w-9 text-center font-mono text-sm font-semibold tabular-nums text-slate-900">
              {line.quantity}
            </span>

            {/* `atMax` already folds in both ceilings — the per-customer cap
                and the remaining stock, whichever bites first. */}
            <QuantityButton
              label={`Increase quantity of ${line.name}`}
              disabled={line.soldOut || line.closed || line.atMax}
              onClick={() =>
                setQuantity(line.flashSaleId, line.quantity + 1)
              }
            >
              +
            </QuantityButton>
          </div>

          <div className="w-20 text-right font-semibold text-slate-900">
            {formatPrice(line.lineTotal)}
          </div>

          <button
            type="button"
            onClick={() => removeItem(line.flashSaleId)}
            aria-label={`Remove ${line.name} from cart`}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M3 4h10M6.5 4V2.5h3V4M5 4l.6 9h4.8L11 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}

function QuantityButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-3">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}
