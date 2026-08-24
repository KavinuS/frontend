"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { formatDateTime, formatPrice, shortId } from "@/app/lib/format";
import { LiveDot, OrderStatusBadge } from "@/components/ui/Badge";
import { EmptyState, Rule } from "@/components/ui/Section";
import type { Order, OrderStatus } from "@/types/order";

const filters: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING_PERSISTENCE", label: "Processing" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "FAILED", label: "Failed" },
];

/** Five columns, shared by every row so they line up down the page. */
const ROW_GRID =
  "grid gap-6 md:grid-cols-[150px_minmax(0,1fr)_180px_140px_120px] items-center";

/**
 * Presentational. The orders arrive from the server, already scoped to the
 * signed-in user by the JWT subject — there is no client-side history any more,
 * so no hydration gap and no skeleton.
 *
 * Still a Client Component: the status filter below is local state, and pushing
 * it into the URL would make every filter click a server round trip for a list
 * that is already in memory.
 *
 * Rows are ruled, not carded. An order is a record in a ledger; boxing each one
 * would break the columns that make the ledger readable.
 */
export default function OrdersView({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const groupName = useId();

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="No orders yet"
        description="Once you reserve something in a flash sale, it shows up here with its live status."
        actionLabel="Shop flash sales"
        actionHref="/sales"
      />
    );
  }

  const visible =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.status === filter);

  return (
    <div>
      <div className="fx-seg">
        {filters.map((option) => (
          <label key={option.value} className="fx-seg-opt">
            <input
              type="radio"
              name={groupName}
              checked={filter === option.value}
              onChange={() => setFilter(option.value)}
            />
            {option.label}{" "}
            {option.value === "ALL"
              ? orders.length
              : orders.filter((order) => order.status === option.value).length}
          </label>
        ))}
      </div>

      <Rule animate className="mt-6" />

      {visible.length === 0 ? (
        <p className="fx-muted border-b-2 border-fx-divider py-12 text-center">
          No orders with that status.
        </p>
      ) : (
        <ul>
          {visible.map((order, index) => (
            <OrderRow key={order.id} order={order} last={index === visible.length - 1} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderRow({ order, last }: { order: Order; last: boolean }) {
  const itemCount = order.lines.reduce((total, line) => total + line.quantity, 0);
  const processing = order.status === "PENDING_PERSISTENCE";

  return (
    <li className={last ? "border-b-2 border-fx-divider" : "border-b border-fx-divider"}>
      <Link href={`/orders/${order.id}`} className={`${ROW_GRID} py-6`}>
        <span className="flex items-center gap-2.5">
          {/* The live square is only on the row still moving. A confirmed order
              needs no attention; a processing one is the reason you opened
              this page. */}
          {processing && <LiveDot />}
          <OrderStatusBadge status={order.status} />
        </span>

        <span className="min-w-0 font-heading text-lg font-extrabold text-fx-ink">
          {order.lines[0]?.name ?? "Order"}{" "}
          <span className="fx-muted text-sm font-normal">
            {order.lines.length > 1 && `+${order.lines.length - 1} more · `}
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
        </span>

        <span className="fx-mono fx-muted text-[13px]">
          #{shortId(order.id)}
        </span>

        <span className="fx-muted text-[13px]">
          {formatDateTime(order.placedAt)}
        </span>

        <span className="font-heading text-xl font-extrabold md:text-right">
          {formatPrice(order.totalAmount)}
        </span>
      </Link>

      {order.status === "FAILED" && order.failureReason && (
        <p className="mb-6 bg-fx-accent-100 px-4 py-3 text-[13px] text-fx-accent-800">
          {order.failureReason}
        </p>
      )}
    </li>
  );
}
