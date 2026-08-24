"use client";

import { useState } from "react";

import { useCart } from "@/app/lib/cart-context";
import AddToCartButton from "@/components/cart/AddToCartButton";
import QuantityStepper from "@/components/cart/QuantityStepper";

/**
 * Quantity stepper plus add button, for the product detail page.
 *
 * The rows elsewhere add one at a time; a detail page is where someone decides
 * they want three. The stepper is capped by whatever the cart can still accept
 * for this SKU — the per-customer limit minus what's already in there, or the
 * remaining stock if that is lower.
 *
 * Laid out as one control strip: the stepper is a fixed-width box and the add
 * button takes the rest of the line, so the two read as a single action rather
 * than as a setting followed by a button.
 */
export default function AddToCartPanel({
  flashSaleId,
  soldOut,
}: {
  flashSaleId: number;
  soldOut: boolean;
}) {
  // limitFor comes from the context now: the ceiling depends on live stock,
  // which arrives with the catalogue rather than from a module import.
  const { hydrated, limitFor, quantityOf } = useCart();
  const [quantity, setQuantity] = useState(1);

  const inCart = quantityOf(flashSaleId);
  const limit = limitFor(flashSaleId);
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
        flashSaleId={flashSaleId}
        disabled
        label="Sold out"
        size="lg"
        fullWidth
      />
    );
  }

  return (
    <div>
      <div className="flex items-stretch gap-3">
        <QuantityStepper
          value={maxedOut ? 0 : effective}
          onChange={setQuantity}
          canDecrease={effective > 1 && !maxedOut}
          canIncrease={effective < allowance && !maxedOut}
          label="quantity"
          size="lg"
        />

        <AddToCartButton
          flashSaleId={flashSaleId}
          quantity={effective}
          disabled={maxedOut}
          label={maxedOut ? "Maximum in cart" : "Add to cart"}
          size="lg"
          fullWidth
          className="flex-1"
          // Back to 1 after a successful add, so the next add doesn't silently
          // repeat the previous quantity.
          onAdded={(result) => {
            if (result.ok) setQuantity(1);
          }}
        />
      </div>

      {/* Rendered only after hydration — `inCart` is read from localStorage and
          would otherwise disagree with the server-rendered markup. */}
      {hydrated && inCart > 0 && (
        <p className="fx-muted mt-2.5 text-xs">
          {inCart} already in your cart · limit {limit} for this sale
        </p>
      )}
    </div>
  );
}
