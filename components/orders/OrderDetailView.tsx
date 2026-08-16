"use client";

import Link from "next/link";
import { useEffect } from "react";

import { formatDateTime, formatPrice, shortId } from "@/app/lib/format";
import { useOrders } from "@/app/lib/orders-store";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Section";
import type { OrderStatus } from "@/types/order";

/** How long the fake persistence worker "takes". See the note below. */
const SIMULATED_PERSISTENCE_MS = 2600;

export default function OrderDetailView({
  orderId,
  justPlaced,
}: {
  orderId: string;
  justPlaced: boolean;
}) {
  const { getOrder, confirmOrder, hydrated } = useOrders();
  const order = getOrder(orderId);

  const isPending = order?.status === "PENDING_PERSISTENCE";

  /*
   * ⚠️ PROTOTYPE ONLY — replace in Phase 3. ⚠️
   *
   * Stands in for the SSE / WebSocket push that tells the client the queue
   * worker has committed the order to Postgres. The timer exists purely so the
   * PENDING_PERSISTENCE → CONFIRMED transition is visible and testable without
   * a backend. Phase 3 replaces this effect with an EventSource subscription;
   * every component below it stays exactly as it is.
   */
  useEffect(() => {
    if (!isPending) return;

    const timer = setTimeout(
      () => confirmOrder(orderId),
      SIMULATED_PERSISTENCE_MS,
    );
    return () => clearTimeout(timer);
  }, [isPending, orderId, confirmOrder]);

  if (!hydrated) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon="🔍"
        title="Order not found"
        description="We couldn't find an order with that ID. It may have been placed in a different browser — order history is stored locally until the backend lands."
        actionLabel="Back to orders"
        actionHref="/orders"
      />
    );
  }

  const itemCount = order.lines.reduce((total, line) => total + line.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl">

      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/orders" className="hover:text-slate-900">My orders</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-mono font-medium text-slate-900">
            #{shortId(order.id)}
          </li>
        </ol>
      </nav>

      {justPlaced && order.status !== "FAILED" && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
          <p className="text-lg font-bold text-green-900">
            🎉 Stock reserved
          </p>
          <p className="mt-1 text-sm text-green-800">
            Your reservation went through. The order is being written to the
            database now — you don&apos;t need to wait on this page.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Order</p>
            <h1 className="mt-1 font-mono text-2xl font-bold text-slate-900">
              #{shortId(order.id)}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Placed {formatDateTime(order.placedAt)}
            </p>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        <StatusTimeline status={order.status} />

        {order.status === "FAILED" && order.failureReason && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-900">Why this failed</p>
            <p className="mt-1 text-sm text-red-800">{order.failureReason}</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Items
          </h2>

          <ul className="mt-4 divide-y divide-slate-100">
            {order.lines.map((line) => (
              <li key={line.sku} className="flex items-center gap-4 py-4">
                <span
                  aria-hidden="true"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-slate-100 to-slate-200 text-2xl"
                >
                  {line.emoji}
                </span>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/sales/${line.sku}`}
                    className="truncate font-semibold text-slate-900 hover:text-blue-600"
                  >
                    {line.name}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Qty {line.quantity} × {formatPrice(line.unitPrice)}
                  </p>
                </div>

                <span className="font-semibold text-slate-900">
                  {formatPrice(line.unitPrice * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between border-t border-slate-200 pt-4">
            <span className="font-bold text-slate-900">
              Total ({itemCount} item{itemCount === 1 ? "" : "s"})
            </span>
            <span className="text-xl font-bold text-slate-900">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Surfacing the raw IDs is deliberate — they're what you'd quote when
            tracing a request through the queue and into Postgres. */}
        <dl className="mt-8 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-slate-500">Correlation ID</dt>
            <dd className="font-mono text-xs text-slate-900">{order.id}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-slate-500">Idempotency key</dt>
            <dd className="font-mono text-xs text-slate-900">
              {order.idempotencyKey}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/orders" variant="secondary">
          Back to orders
        </ButtonLink>
        <ButtonLink href="/sales" variant="ghost">
          Keep shopping
        </ButtonLink>
      </div>
    </div>
  );
}

/**
 * The three states the proposal's `orders.status` column can hold, shown as a
 * pipeline so the async hand-off is legible rather than a mystery spinner.
 */
function StatusTimeline({ status }: { status: OrderStatus }) {
  const failed = status === "FAILED";
  const confirmed = status === "CONFIRMED";

  const steps = [
    {
      label: "Stock reserved",
      detail: "Atomic DECR in Redis succeeded",
      state: "done" as const,
    },
    {
      label: "Queued for persistence",
      detail: "OrderCreatedEvent accepted by the broker",
      state: "done" as const,
    },
    {
      label: failed ? "Persistence failed" : "Written to Postgres",
      detail: failed
        ? "The worker could not commit this order"
        : confirmed
          ? "Committed in an ACID transaction"
          : "Waiting for the queue worker…",
      state: failed ? ("failed" as const) : confirmed ? ("done" as const) : ("active" as const),
    },
  ];

  return (
    <ol className="mt-8 space-y-4">
      {steps.map((step) => (
        <li key={step.label} className="flex gap-4">
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              step.state === "done"
                ? "bg-green-100 text-green-700"
                : step.state === "failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {step.state === "done" ? "✓" : step.state === "failed" ? "✕" : "⏳"}
          </span>

          <div>
            <p className="font-semibold text-slate-900">{step.label}</p>
            <p className="text-sm text-slate-500">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
