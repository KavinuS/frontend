import type { OrderStatus } from "@/types/order";
import type { SaleStatus } from "@/types/product";

const tones = {
  flash: "bg-orange-50 text-orange-700 ring-orange-200",
  brand: "bg-blue-50 text-blue-700 ring-blue-200",
  success: "bg-green-50 text-green-700 ring-green-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
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
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Pulsing dot for anything backed by a currently-running sale. */
export function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative flex h-2 w-2 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-current opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
    </span>
  );
}

const saleStatusConfig: Record<
  SaleStatus,
  { tone: BadgeTone; label: string; live: boolean }
> = {
  ACTIVE: { tone: "flash", label: "Live now", live: true },
  SCHEDULED: { tone: "brand", label: "Scheduled", live: false },
  EXHAUSTED: { tone: "neutral", label: "Sold out", live: false },
  ENDED: { tone: "neutral", label: "Ended", live: false },
};

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const { tone, label, live } = saleStatusConfig[status];

  return (
    <Badge tone={tone}>
      {live && <LiveDot />}
      {label}
    </Badge>
  );
}

/**
 * Order status. The wording matters here — PENDING_PERSISTENCE means the stock
 * is genuinely reserved and only the database write is outstanding, so the copy
 * must reassure without claiming the order is complete.
 */
const orderStatusConfig: Record<
  OrderStatus,
  { tone: BadgeTone; label: string; icon: string }
> = {
  PENDING_PERSISTENCE: { tone: "warning", label: "Processing", icon: "⏳" },
  CONFIRMED: { tone: "success", label: "Confirmed", icon: "✓" },
  FAILED: { tone: "danger", label: "Failed", icon: "✕" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { tone, label, icon } = orderStatusConfig[status];

  return (
    <Badge tone={tone}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </Badge>
  );
}

export { orderStatusConfig };
