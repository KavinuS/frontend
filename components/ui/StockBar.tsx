import { stockPercent } from "@/app/lib/format";

/** Under this share of the allocation, the bar switches to the accent. */
const SCARCE_PERCENT = 15;

/**
 * Remaining-stock bar.
 *
 * A 5px rule, not a rounded meter. Colour is binary rather than a traffic-light
 * ramp: ink while there is room, accent once the counter is nearly gone. The
 * system has one accent, so spending it here is what makes scarcity legible at
 * a glance down a column of twenty rows.
 *
 * The label swaps from a ratio to a count in the same moment. "Only 3 left" is
 * the number a buyer acts on; "3 / 200" makes them do the arithmetic first.
 */
export default function StockBar({
  remaining,
  total,
  showLabel = true,
  /** Stagger for the fill animation, so a list of bars sweeps rather than snaps. */
  delayMs = 300,
}: {
  remaining: number;
  total: number;
  showLabel?: boolean;
  delayMs?: number;
}) {
  const percent = stockPercent(remaining, total);
  const soldOut = remaining <= 0;
  const scarce = !soldOut && percent <= SCARCE_PERCENT;

  return (
    <div>
      {showLabel && (
        <div
          className={`mb-1.5 text-xs ${
            soldOut ? "fx-muted" : scarce ? "text-fx-accent-700" : ""
          }`}
        >
          {soldOut ? (
            `0 / ${total.toLocaleString("en-US")}`
          ) : scarce ? (
            `Only ${remaining.toLocaleString("en-US")} left`
          ) : (
            <>
              {remaining.toLocaleString("en-US")} /{" "}
              {total.toLocaleString("en-US")}
            </>
          )}
        </div>
      )}

      <div
        className="h-1.25 w-full bg-fx-neutral-300"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${remaining} of ${total} items remaining`}
      >
        {/* A sold-out sale draws no fill at all — an empty track reads as zero
            faster than a 0%-wide sliver of colour. */}
        {!soldOut && (
          <div
            className={`h-full origin-left animate-fx-bar ${
              scarce ? "bg-fx-accent" : "bg-fx-ink"
            }`}
            // min-width keeps a 1% sliver visible; without it the most urgent
            // bar on the page is the one you cannot see.
            style={{
              width: `${percent}%`,
              minWidth: 5,
              animationDelay: `${delayMs}ms`,
            }}
          />
        )}
      </div>
    </div>
  );
}
