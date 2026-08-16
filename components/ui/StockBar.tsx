import { stockPercent } from "@/app/lib/format";

/**
 * Remaining-stock bar.
 *
 * Colour tracks scarcity rather than the brand: green while there is room,
 * amber under a quarter left, red in the last 10%. That way the urgency is
 * carried by the bar itself and not only by the number beside it.
 */
export default function StockBar({
  remaining,
  total,
  showLabel = true,
}: {
  remaining: number;
  total: number;
  showLabel?: boolean;
}) {
  const percent = stockPercent(remaining, total);
  const soldOut = remaining <= 0;

  const fill = soldOut
    ? "bg-slate-300"
    : percent <= 10
      ? "bg-red-500"
      : percent <= 25
        ? "bg-amber-500"
        : "bg-green-500";

  return (
    <div>
      {showLabel && (
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="text-slate-600">
            {soldOut ? (
              <span className="font-semibold text-slate-500">Sold out</span>
            ) : (
              <>
                <span className="font-semibold text-slate-900">
                  {remaining.toLocaleString("en-US")}
                </span>{" "}
                of {total.toLocaleString("en-US")} left
              </>
            )}
          </span>

          {!soldOut && percent <= 25 && (
            <span className="text-xs font-semibold text-red-600">
              Almost gone
            </span>
          )}
        </div>
      )}

      <div
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${remaining} of ${total} items remaining`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${fill}`}
          style={{ width: `${percent}%` }}
        >
          {/* Travelling highlight, only while stock is actually moving. */}
          {!soldOut && (
            <div className="h-full w-full animate-shimmer bg-linear-to-r from-transparent via-white/40 to-transparent" />
          )}
        </div>
      </div>
    </div>
  );
}
