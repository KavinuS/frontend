/**
 * The product image slot.
 *
 * The design draws these as diagonal-hatch placeholders because the mock had no
 * photography; the seed catalogue has none either, but it does carry an emoji
 * per product, which is more identifying than a hatch. So the slot keeps the
 * design's shape — a flat, square-cornered block on the surface tone, sized in
 * exact pixels so a column of them lines up — and puts the emoji in it.
 *
 * Swap the inner span for an `<Image>` the day the catalogue grows a photo
 * column; nothing outside this file has an opinion about what fills the block.
 */
export default function Thumb({
  emoji,
  width,
  height,
  dimmed = false,
  className = "",
}: {
  emoji: string;
  /** Omit for a block that fills its column — the detail page's hero shot. */
  width?: number;
  height: number;
  /** Sold out or closed — the block fades with the row it belongs to. */
  dimmed?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`grid place-items-center bg-fx-surface ${
        width === undefined ? "w-full" : "shrink-0"
      } ${dimmed ? "opacity-55" : ""} ${className}`}
      style={{
        width,
        height,
        // Scaled off the block rather than fixed, so the same component works
        // at 46px in the dashboard list and 460px on the detail page.
        fontSize: Math.round(Math.min(width ?? height, height) * 0.55),
        lineHeight: 1,
      }}
    >
      <span>{emoji}</span>
    </div>
  );
}
