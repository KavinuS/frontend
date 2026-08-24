import type { OrderStatus } from "@/types/order";
import type { SaleStatus } from "@/types/product";

/**
 * Tags, in the Modernist system's three flavours.
 *
 * The palette is deliberately thin — accent, neutral, outline — because the
 * system has one accent colour and no semantic green/amber/red ramp. Meaning is
 * carried by which of the three a status maps to plus the word itself, not by a
 * hue the reader has to learn.
 */
const tones = {
  /** Something happening now: live sales, orders mid-flight. */
  accent: "fx-tag-accent",
  /** Settled and no longer interesting: confirmed, sold out, ended. */
  neutral: "fx-tag-neutral",
  /** Not settled and not running — scheduled, or failed. */
  outline: "fx-tag-outline",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`fx-tag ${tones[tone]} ${className}`}>{children}</span>
  );
}

/**
 * Pulsing square for anything backed by a currently-running sale.
 *
 * A square, not a dot: the system has no rounded corners anywhere, and the same
 * 7–10px accent square is the "live" mark on the nav, the detail page and the
 * order timeline.
 */
export function LiveDot({
  size = 8,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 animate-fx-dot bg-fx-accent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

const saleStatusConfig: Record<
  SaleStatus,
  { tone: BadgeTone; label: string; live: boolean }
> = {
  ACTIVE: { tone: "accent", label: "Live", live: true },
  SCHEDULED: { tone: "outline", label: "Scheduled", live: false },
  EXHAUSTED: { tone: "neutral", label: "Sold out", live: false },
  ENDED: { tone: "neutral", label: "Ended", live: false },
};

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const { tone, label, live } = saleStatusConfig[status];

  return (
    <Badge tone={tone}>
      {live && <LiveDot size={6} />}
      {label}
    </Badge>
  );
}

/**
 * Order status. The wording matters here — PENDING_PERSISTENCE means the stock
 * is genuinely reserved and only the database write is outstanding, so the copy
 * must reassure without claiming the order is complete.
 *
 * Note the mapping: Processing is the *accent* tag, Confirmed the neutral one.
 * That inverts the usual "green means good" instinct on purpose — the row worth
 * a second look is the one still in flight, not the one that already landed.
 */
const orderStatusConfig: Record<
  OrderStatus,
  { tone: BadgeTone; label: string }
> = {
  PENDING_PERSISTENCE: { tone: "accent", label: "Processing" },
  CONFIRMED: { tone: "neutral", label: "Confirmed" },
  FAILED: { tone: "outline", label: "Failed" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { tone, label } = orderStatusConfig[status];

  return <Badge tone={tone}>{label}</Badge>;
}

export { orderStatusConfig };
