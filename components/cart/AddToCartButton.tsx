"use client";

import { useEffect, useRef, useState } from "react";

import { MAX_PER_ITEM, useCart, type AddResult } from "@/app/lib/cart-context";
import { Button, type ButtonVariant } from "@/components/ui/Button";

/**
 * Adds a product to the cart and reports what actually happened.
 *
 * The inline feedback is deliberate: the only other signal is the navbar badge,
 * which is easy to miss on a long page and off-screen on mobile once the user
 * has scrolled past a card. It also has to distinguish "added" from "you
 * already have the maximum" — flashing "Added ✓" when the cart didn't change
 * is a small lie the user would only discover at checkout.
 */
export default function AddToCartButton({
  sku,
  quantity = 1,
  disabled = false,
  label = "Add to cart",
  variant = "primary",
  size,
  fullWidth = false,
  onAdded,
}: {
  sku: string;
  quantity?: number;
  disabled?: boolean;
  label?: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  /** Lets a parent react to the outcome (e.g. reset a quantity stepper). */
  onAdded?: (result: AddResult) => void;
}) {
  const { addItem } = useCart();
  const [feedback, setFeedback] = useState<AddResult | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear on unmount so a pending timer can't setState on a gone component.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    const result = addItem(sku, quantity);
    setFeedback(result);
    onAdded?.(result);

    // Restart the window on rapid repeat clicks rather than stacking timers.
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFeedback(null), 2200);
  };

  // A clean add is confirmed by the button itself; anything partial or refused
  // needs words, since the button alone can't explain why nothing moved.
  const needsExplanation = Boolean(feedback && (!feedback.ok || feedback.clamped));

  return (
    <div>
      <Button
        onClick={handleClick}
        disabled={disabled}
        variant={feedback?.ok ? "secondary" : variant}
        size={size}
        fullWidth={fullWidth}
      >
        {feedback?.ok ? "Added ✓" : label}
      </Button>

      {/*
        A live region rather than a toast: it sits next to the control that
        caused it, so it is announced and seen where the user is already
        looking. Always rendered (visually hidden when idle) so assistive tech
        registers the region before it has anything to say.
      */}
      <p
        aria-live="polite"
        className={
          needsExplanation
            ? "mt-2 text-center text-xs font-semibold text-amber-600"
            : "sr-only"
        }
      >
        {feedback ? describe(feedback) : ""}
      </p>
    </div>
  );
}

function describe(result: AddResult): string {
  if (result.ok) {
    return result.clamped
      ? `Only ${result.limit} available — your cart now has ${result.quantity}.`
      : `Added to cart. ${result.quantity} in your cart.`;
  }

  switch (result.reason) {
    case "SOLD_OUT":
      return "This item is sold out.";
    case "AT_LIMIT":
      // Scarcity and the per-customer cap are different messages: the first
      // tells the user the sale is nearly gone, the second is just a rule.
      return result.limit < MAX_PER_ITEM
        ? `That's all the stock left (${result.limit}).`
        : `Limit ${result.limit} per customer.`;
    case "UNKNOWN_SKU":
      return "This item is no longer available.";
  }
}
