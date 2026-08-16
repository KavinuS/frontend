import { formatPrice } from "@/app/lib/format";

/**
 * Totals panel shared by the cart and checkout pages, so the two can't quote
 * different numbers for the same basket.
 *
 * Shipping and tax are shown as fixed placeholders — the proposal's schema has
 * no shipping or tax model, and inventing a rate would be worse than admitting
 * it isn't calculated yet.
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Order summary</h2>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">
            Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})
          </dt>
          <dd className="font-semibold text-slate-900">
            {formatPrice(subtotal)}
          </dd>
        </div>

        {savings > 0 && (
          <div className="flex justify-between">
            <dt className="text-slate-600">Flash sale savings</dt>
            <dd className="font-semibold text-green-600">
              −{formatPrice(savings)}
            </dd>
          </div>
        )}

        <div className="flex justify-between">
          <dt className="text-slate-600">Shipping</dt>
          <dd className="font-semibold text-green-600">Free</dd>
        </div>

        <div className="flex justify-between border-t border-slate-200 pt-3">
          <dt className="text-base font-bold text-slate-900">Total</dt>
          <dd className="text-xl font-bold text-slate-900">
            {formatPrice(subtotal)}
          </dd>
        </div>
      </dl>

      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
}
