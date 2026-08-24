import { formatPrice } from "@/app/lib/format";

/**
 * Totals panel shared by the cart and checkout pages, so the two can't quote
 * different numbers for the same basket.
 *
 * A ruled box rather than a card — the only 2px border on the page, which is
 * what makes it read as the thing you act from. It sticks below the header on
 * wide screens so the total and the button stay reachable however long the item
 * list runs.
 *
 * Shipping is shown as a fixed placeholder and there is no tax line at all: the
 * schema has no shipping or tax model, and inventing a rate would be worse than
 * admitting it isn't calculated yet.
 */
export default function OrderSummary({
  subtotal,
  savings,
  itemCount,
  footer,
}: {
  subtotal: number;
  savings: number;
  itemCount: number;
  footer?: React.ReactNode;
}) {
  return (
    <aside className="border-2 border-fx-divider p-6.5 lg:sticky lg:top-24">
      <h2 className="fx-eyebrow">Order summary</h2>

      <dl className="mt-5.5 text-sm">
        <div className="flex justify-between">
          <dt className="fx-muted">
            Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})
          </dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>

        {savings > 0 && (
          <div className="mt-2.5 flex justify-between">
            <dt className="fx-muted">You save</dt>
            <dd className="text-fx-accent-700">−{formatPrice(savings)}</dd>
          </div>
        )}

        <div className="mt-2.5 flex justify-between">
          <dt className="fx-muted">Shipping</dt>
          <dd>Free</dd>
        </div>
      </dl>

      <div aria-hidden="true" className="my-5 h-0.5 bg-fx-divider" />

      <div className="flex items-baseline justify-between">
        <span className="font-heading font-extrabold">Total</span>
        <span className="font-heading text-3xl font-extrabold tracking-[-0.02em]">
          {formatPrice(subtotal)}
        </span>
      </div>

      {footer && <div className="mt-5.5">{footer}</div>}
    </aside>
  );
}
