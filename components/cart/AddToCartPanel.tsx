"use client";

import { useState } from "react";

import { useCart } from "@/app/lib/cart-context";
import { limitFor } from "@/app/lib/cart-store";
import AddToCartButton from "@/components/cart/AddToCartButton";

/**
 * Quantity stepper plus add button, for the product detail page.
 *
 * The cards elsewhere add one at a time; a detail page is where someone decides
 * they want three. The stepper is capped by whatever the cart can still accept
 * for this SKU — the per-customer limit minus what's already in there, or the
 * remaining stock if that is lower.
 */
export default function AddToCartPanel({
  sku,
  soldOut,
}: {
  sku: string;
  soldOut: boolean;
}) {
  const { lines, hydrated } = useCart();
  const [quantity, setQuantity] = useState(1);

  const inCart = lines.find((line) => line.sku === sku)?.quantity ?? 0;
  const limit = limitFor(sku);
  const allowance = Math.max(0, limit - inCart);
  const maxedOut = hydrated && !soldOut && allowance === 0;

  /*
   * Derived, not synced. Clamping `quantity` back into range with an effect
   * when the allowance shrinks would be a cascading render; deriving the value
   * used for this render keeps the stepper honest with no extra state.
   */
  const effective = Math.min(Math.max(1, quantity), Math.max(1, allowance));

  if (soldOut) {
    return (
      <AddToCartButton
        sku={sku}
        disabled
        label="Sold out"
        variant="flash"
        size="lg"
        fullWidth
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-600">Quantity</span>

        <div className="flex items-center rounded-xl border border-slate-200">
          <Step
            label="Decrease quantity"
            disabled={effective <= 1 || maxedOut}
            onClick={() => setQuantity(effective - 1)}
          >
            −
          </Step>

          <span className="w-10 text-center font-mono text-sm font-semibold tabular-nums text-slate-900">
            {maxedOut ? 0 : effective}
          </span>

          <Step
            label="Increase quantity"
            disabled={effective >= allowance || maxedOut}
            onClick={() => setQuantity(effective + 1)}
          >
            +
          </Step>
        </div>
      </div>

      <AddToCartButton
        sku={sku}
        quantity={effective}
        disabled={maxedOut}
        label={maxedOut ? "Maximum in cart" : `Add ${effective} to cart`}
        variant="flash"
        size="lg"
        fullWidth
        // Back to 1 after a successful add, so the next add doesn't silently
        // repeat the previous quantity.
        onAdded={(result) => {
          if (result.ok) setQuantity(1);
        }}
      />

      {/* Rendered only after hydration — `inCart` is read from localStorage and
          would otherwise disagree with the server-rendered markup. */}
      {hydrated && inCart > 0 && (
        <p className="mt-2 text-center text-xs text-slate-500">
          {inCart} already in your cart
        </p>
      )}
    </div>
  );
}

function Step({
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
      className="flex h-10 w-10 items-center justify-center text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
