"use client";

import Link from "next/link";
import { useState } from "react";

import { formatDateTime, formatPrice, shortId } from "@/app/lib/format";
import { useOrders } from "@/app/lib/orders-store";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Section";
import type { Order, OrderStatus } from "@/types/order";

const filters: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING_PERSISTENCE", label: "Processing" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "FAILED", label: "Failed" },
];

export default function OrdersView() {
  const { orders, hydrated } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

  if (!hydrated) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    );
  }

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
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((option) => {
          const count =
            option.value === "ALL"
              ? orders.length
              : orders.filter((order) => order.status === option.value).length;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === option.value
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {option.label}
              <span
                className={
                  filter === option.value
                    ? "ml-2 text-slate-300"
                    : "ml-2 text-slate-400"
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-slate-600">
          No orders with that status.
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const itemCount = order.lines.reduce((total, line) => total + line.quantity, 0);

  return (
    <li>
      <Link
        href={`/orders/${order.id}`}
        className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <span className="font-mono text-sm text-slate-500">
              #{shortId(order.id)}
            </span>
          </div>

          <span className="text-sm text-slate-500">
            {formatDateTime(order.placedAt)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex -space-x-2" aria-hidden="true">
              {order.lines.slice(0, 3).map((line) => (
                <span
                  key={line.sku}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white bg-linear-to-br from-slate-100 to-slate-200 text-lg"
                >
                  {line.emoji}
                </span>
              ))}
            </div>

            <p className="min-w-0 truncate text-sm text-slate-600">
              {order.lines[0]?.name}
              {order.lines.length > 1 &&
                ` +${order.lines.length - 1} more`}
              <span className="text-slate-400">
                {" "}
                · {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </p>
          </div>

          <span className="shrink-0 text-lg font-bold text-slate-900">
            {formatPrice(order.totalAmount)}
          </span>
        </div>

        {order.status === "FAILED" && order.failureReason && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {order.failureReason}
          </p>
        )}
      </Link>
    </li>
  );
}
