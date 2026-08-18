import Link from "next/link";

import type { OrderStatus, SaleStatus } from "@/app/lib/admin-types";
import { WarningIcon } from "@/components/admin/icons";

/**
 * Layout and table primitives shared by the admin screens.
 *
 * These are deliberately separate from `components/ui/`, which speaks to
 * customers. The storefront calls a running sale "Live now" and a queued order
 * "Processing"; an operator needs the actual state name, because the thing they
 * are diagnosing is the state machine itself.
 *
 * All Server Components — nothing here holds state.
 */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  padded = true,
  className = "",
  children,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  /** Off for tables, which manage their own edge-to-edge padding. */
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            {title && (
              <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

/**
 * Rendered in place of a panel whose fetch failed.
 *
 * Scoped to the panel rather than thrown to an error boundary on purpose: a
 * dashboard where the queue-depth card says "broker unreachable" while the
 * order counts still render is more useful for diagnosis than a blank page.
 */
export function ErrorPanel({
  message,
  hint,
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
      <WarningIcon className="h-5 w-5 shrink-0 text-red-500" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-red-900">{message}</p>
        {hint && <p className="mt-1 text-xs text-red-700">{hint}</p>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="text-4xl" aria-hidden="true">
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// -------------------------------------------------------------------- table

/** Horizontal scroll lives here so no table can widen the whole page. */
export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] text-left text-sm">{children}</table>
    </div>
  );
}

/**
 * Written out rather than interpolated as `text-${align}`. Tailwind v4 finds
 * classes by scanning source text, so a name assembled at runtime is never
 * generated and the style silently does nothing.
 */
const alignments = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

type CellProps = {
  children?: React.ReactNode;
  align?: keyof typeof alignments;
  className?: string;
};

export function Th({ children, align = "left", className = "" }: CellProps) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${alignments[align]} ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, align = "left", className = "" }: CellProps) {
  return (
    <td
      className={`border-b border-slate-100 px-4 py-3 align-middle text-slate-700 ${alignments[align]} ${className}`}
    >
      {children}
    </td>
  );
}

/** Tabular figures so digits line up column-wise and are scannable. */
export function Num({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`font-mono text-[13px] tabular-nums ${className}`}>
      {children}
    </span>
  );
}

// ------------------------------------------------------------------- status

const saleTones: Record<SaleStatus, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700 ring-blue-200",
  ACTIVE: "bg-orange-50 text-orange-700 ring-orange-200",
  ENDED: "bg-slate-100 text-slate-600 ring-slate-200",
  EXHAUSTED: "bg-violet-50 text-violet-700 ring-violet-200",
};

const orderTones: Record<OrderStatus, string> = {
  CONFIRMED: "bg-green-50 text-green-700 ring-green-200",
  PENDING_PERSISTENCE: "bg-amber-50 text-amber-700 ring-amber-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
};

/** Kept short so it fits a table cell; the full name is in the title. */
const orderLabels: Record<OrderStatus, string> = {
  CONFIRMED: "Confirmed",
  PENDING_PERSISTENCE: "Pending write",
  FAILED: "Failed",
};

export function SalePill({ status }: { status: SaleStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${saleTones[status]}`}
    >
      {status === "ACTIVE" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {status}
    </span>
  );
}

export function OrderPill({ status }: { status: OrderStatus }) {
  return (
    <span
      // The raw enum in the tooltip: PENDING_PERSISTENCE is what appears in the
      // logs and in RabbitMQ, so an operator searching for it should find it.
      title={status}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${orderTones[status]}`}
    >
      {orderLabels[status]}
    </span>
  );
}

// ------------------------------------------------------------------ buttons

const linkBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export const adminButton = {
  primary: `${linkBase} bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-500`,
  secondary: `${linkBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400`,
  flash: `${linkBase} bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-400`,
  danger: `${linkBase} border border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-400`,
} as const;

export function AdminLink({
  href,
  variant = "secondary",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof adminButton;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${adminButton[variant]} ${className}`}>
      {children}
    </Link>
  );
}
