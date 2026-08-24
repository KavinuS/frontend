"use client";

/**
 * − [ n ] + , as one hairline-ruled box.
 *
 * Shared by the detail page and the cart rows so the two cannot drift apart.
 * The number sits between two internal rules rather than in its own field: it
 * is a readout, not an input, and a text box would invite typing into it while
 * the value is capped by live stock the field knows nothing about.
 *
 * Both callers pass `canIncrease` already folded — the per-customer cap and the
 * remaining stock, whichever bites first — so this component never has to know
 * which ceiling it is enforcing.
 */
export default function QuantityStepper({
  value,
  onChange,
  canDecrease,
  canIncrease,
  label,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  canDecrease: boolean;
  canIncrease: boolean;
  /** Names the thing being counted, for the button labels: "quantity of X". */
  label: string;
  size?: "md" | "lg";
}) {
  const button = size === "lg" ? "w-[46px] text-lg" : "w-[38px]";
  const readout = size === "lg" ? "w-[52px] text-base" : "w-[42px] text-sm";

  return (
    <div className="flex shrink-0 border border-fx-divider">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={!canDecrease}
        aria-label={`Decrease ${label}`}
        className={`fx-btn justify-center px-0 ${button}`}
      >
        −
      </button>

      <span
        className={`fx-mono grid place-items-center border-x border-fx-divider ${readout}`}
        // The buttons carry the accessible labels; announcing the readout as
        // well would repeat the number on every press.
        aria-hidden="true"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={!canIncrease}
        aria-label={`Increase ${label}`}
        className={`fx-btn justify-center px-0 ${button}`}
      >
        +
      </button>
    </div>
  );
}
