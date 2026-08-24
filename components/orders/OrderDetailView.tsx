"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { formatDateTime, formatPrice, shortId } from "@/app/lib/format";
import { LiveDot } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, Rule } from "@/components/ui/Section";
import Thumb from "@/components/ui/Thumb";
import type { Order, OrderStatus } from "@/types/order";

/** How often to ask the backend whether the queue worker has committed yet. */
const POLL_INTERVAL_MS = 1500;

/** Stop after this long so a stuck order does not poll a tab forever. */
const POLL_TIMEOUT_MS = 60_000;

export default function OrderDetailView({
  order,
  justPlaced,
}: {
  /** Null while the row does not exist yet, or when it is not ours. */
  order: Order | null;
  justPlaced: boolean;
}) {
  const router = useRouter();

  /*
   * Polling, until SSE exists.
   *
   * The old version of this component ran a timer that FAKED the transition to
   * CONFIRMED. This one asks the backend and reports what it actually says —
   * which means an order that never commits now stays visibly pending instead
   * of pretending to succeed.
   *
   * Two states are worth polling. `order === null` covers the window right
   * after checkout where the 202 has returned but the queue worker has not
   * written the row, so `GET /orders/{id}` is still a 404. PENDING_PERSISTENCE
   * covers the row existing but not yet confirmed.
   *
   * Phase 3 replaces this whole effect with an EventSource subscription;
   * everything below it stays exactly as it is.
   */
  const awaitingWorker = order === null || order.status === "PENDING_PERSISTENCE";

  useEffect(() => {
    if (!awaitingWorker) return;

    const poll = setInterval(() => router.refresh(), POLL_INTERVAL_MS);
    const giveUp = setTimeout(() => clearInterval(poll), POLL_TIMEOUT_MS);

    return () => {
      clearInterval(poll);
      clearTimeout(giveUp);
    };
  }, [awaitingWorker, router]);

  // No row yet. Right after a checkout this is expected and temporary; arriving
  // cold on an unknown id it is a genuine miss. The copy has to cover both
  // without claiming the order is lost.
  if (!order) {
    return justPlaced ? (
      <EmptyState
        icon="⏳"
        title="Reservation accepted — writing it down"
        description={
          "Your stock is reserved in Redis and the order is queued. The row appears " +
          "here as soon as the worker commits it, usually within a second or two."
        }
        actionLabel="Back to orders"
        actionHref="/orders"
      />
    ) : (
      <EmptyState
        icon="🔍"
        title="Order not found"
        description={
          "No order with that ID belongs to your account. If you just placed it, " +
          "give the queue a moment and refresh."
        }
        actionLabel="Back to orders"
        actionHref="/orders"
      />
    );
  }

  const itemCount = order.lines.reduce(
    (total, line) => total + line.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-[1000px]">
      <ButtonLink href="/orders" variant="ghost" className="mb-7">
        ← All orders
      </ButtonLink>

      {justPlaced && order.status !== "FAILED" && (
        <p className="mb-7 bg-fx-accent-100 px-4 py-3 text-[13px] text-fx-accent-800">
          Stock reserved. The order is being written to the database now — you
          don&apos;t need to wait on this page.
        </p>
      )}

      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="fx-eyebrow tracking-[0.16em] text-fx-accent">Order</p>

          {/* The ID is the headline, in mono at regular weight. It is what the
              customer quotes and what you would grep the queue for; dressing it
              up in the heading face would make it less copyable, not more
              important. */}
          <h1 className="fx-mono mt-3 text-[clamp(34px,5vw,52px)] font-normal tracking-[-0.03em]">
            #{shortId(order.id)}
          </h1>

          <p className="fx-muted mt-1.5">
            Placed {formatDateTime(order.placedAt)}
          </p>
        </div>

        <div className="text-right">
          <p className="fx-muted fx-eyebrow tracking-[0.12em]">Total</p>
          <p className="mt-1 font-heading text-[44px] font-extrabold tracking-[-0.02em]">
            {formatPrice(order.totalAmount)}
          </p>
        </div>
      </div>

      <Rule animate className="mt-8" />

      <StatusPanel status={order.status} failureReason={order.failureReason} />

      <ul>
        {order.lines.map((line, index) => (
          <li
            key={line.sku}
            className={`flex items-center gap-4.5 py-5.5 ${
              index === order.lines.length - 1
                ? "border-b-2 border-fx-divider"
                : "border-b border-fx-divider"
            }`}
          >
            <Thumb emoji={line.emoji} width={72} height={60} />

            <div className="min-w-0 flex-1">
              <Link
                href={`/sales/${line.sku}`}
                className="font-heading font-extrabold text-fx-ink hover:text-fx-accent"
              >
                {line.name}
              </Link>
              <p className="fx-mono fx-muted mt-0.75 text-xs">
                {line.sku} · Qty {line.quantity} × {formatPrice(line.unitPrice)}
              </p>
            </div>

            <span className="font-heading text-lg font-extrabold">
              {formatPrice(line.unitPrice * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex justify-between pt-4">
        <span className="font-heading font-extrabold">
          Total ({itemCount} item{itemCount === 1 ? "" : "s"})
        </span>
        <span className="font-heading text-xl font-extrabold">
          {formatPrice(order.totalAmount)}
        </span>
      </div>

      {/* Surfacing the raw IDs is deliberate — they're what you'd quote when
          tracing a request through the queue and into Postgres. */}
      <dl className="mt-8 grid gap-px text-[13px] sm:grid-cols-2">
        <div className="border-t border-fx-divider pt-2.5">
          <dt className="fx-muted fx-eyebrow tracking-[0.1em]">
            Correlation ID
          </dt>
          <dd className="fx-mono mt-1 break-all">{order.id}</dd>
        </div>
        <div className="border-t border-fx-divider pt-2.5">
          <dt className="fx-muted fx-eyebrow tracking-[0.1em]">
            Idempotency key
          </dt>
          <dd className="fx-mono mt-1 break-all">{order.idempotencyKey}</dd>
        </div>
      </dl>

      <div className="mt-7 flex flex-wrap gap-3">
        <ButtonLink href="/sales" variant="secondary">
          Keep shopping
        </ButtonLink>
        <ButtonLink href="/orders" variant="ghost">
          Back to orders
        </ButtonLink>
      </div>
    </div>
  );
}

/**
 * The three states the `orders.status` column can hold, drawn as a rail rather
 * than a vertical checklist.
 *
 * Each stage is a 4px bar over its own label: filled once the stage is past,
 * empty while it is out of reach, and — for the stage actually in flight —
 * filled by an animation that sweeps left to right. That last bar is the only
 * moving thing on the page, which is exactly where attention should be while
 * the worker is still writing.
 *
 * A failed order leaves the third bar empty. The bar is progress; it never got
 * there, and filling it red would say the opposite.
 */
function StatusPanel({
  status,
  failureReason,
}: {
  status: OrderStatus;
  failureReason?: string;
}) {
  const failed = status === "FAILED";
  const confirmed = status === "CONFIRMED";

  return (
    <div className="border-b-2 border-fx-divider py-8">
      <div className="flex items-center gap-3">
        {!confirmed && !failed && <LiveDot size={10} />}
        <h2 className="font-heading text-xl font-extrabold">
          {failed ? "Failed" : confirmed ? "Confirmed" : "Processing"}
        </h2>
      </div>

      <p className="fx-muted mt-2.5">
        {failed
          ? failureReason ??
            "The worker could not commit this order. Nothing was charged."
          : confirmed
            ? "Written to Postgres in an ACID transaction. Your reservation is final."
            : "Stock is claimed. A background worker is writing the order to Postgres — this usually takes a moment."}
      </p>

      <ol className="mt-7 grid list-none gap-0 p-0 sm:grid-cols-3">
        <Stage
          state="done"
          label="Stock reserved"
          detail="Atomic DECR in Redis succeeded"
          className="pb-5 sm:pb-0 sm:pr-6"
        />
        <Stage
          state="done"
          label="Queued for persistence"
          detail="202 Accepted, event on the broker"
          className="pb-5 sm:px-6 sm:pb-0"
        />
        <Stage
          state={confirmed ? "done" : failed ? "blocked" : "active"}
          label={
            failed
              ? "Persistence failed"
              : confirmed
                ? "Persisted"
                : "Awaiting persistence"
          }
          detail={
            failed
              ? "The order was never committed"
              : confirmed
                ? "Committed in an ACID transaction"
                : "Worker picking up the event"
          }
          className="sm:pl-6"
        />
      </ol>
    </div>
  );
}

function Stage({
  state,
  label,
  detail,
  className,
}: {
  state: "done" | "active" | "blocked";
  label: string;
  detail: string;
  className: string;
}) {
  return (
    <li className={className}>
      <div className="h-1 bg-fx-neutral-300">
        {state === "done" && <div className="h-full bg-fx-accent" />}
        {state === "active" && (
          // Deliberately slower than the entrance animations and linear rather
          // than eased: it reads as a process running, not as a thing arriving.
          // Written out rather than composed from `animate-fx-bar` plus
          // overrides, which would depend on how Tailwind orders the two.
          <div
            className="h-full origin-left bg-fx-accent"
            style={{ animation: "fx-bar 2.6s linear 0.2s both" }}
          />
        )}
      </div>

      <p className="mt-3 font-heading text-sm font-extrabold">{label}</p>
      <p className="fx-muted mt-1 text-xs">{detail}</p>
    </li>
  );
}
