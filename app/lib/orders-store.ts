"use client";

import { useCallback, useSyncExternalStore } from "react";

import { demoOrders } from "@/Data/orders";
import type { Order, OrderLine } from "@/types/order";
import { createLocalStore, useIsClient } from "./local-store";

/**
 * Client-side order history, persisted to localStorage.
 *
 * ⚠️ THIS IS A UI PROTOTYPE, NOT THE REAL FLOW. ⚠️
 *
 * The real lifecycle from the proposal is:
 *   checkout → Redis DECR → enqueue → 202 Accepted + correlation ID
 *           → queue worker writes Postgres → SSE pushes CONFIRMED to the client
 *
 * There is no backend yet, so `placeOrder` fabricates the correlation ID
 * locally and `confirmOrder` is driven by a timer on the confirmation page to
 * demonstrate the PENDING_PERSISTENCE → CONFIRMED transition the UI must handle.
 * In Phase 3 the timer is deleted and CONFIRMED arrives over SSE instead —
 * nothing else about the components needs to change.
 */

/* Rendered on the server: an empty history, since storage isn't readable there. */
const EMPTY: Order[] = [];

function parseOrders(raw: string | null): Order[] {
  // First visit — seed the demo history so /orders isn't empty on arrival.
  if (!raw) return demoOrders;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return demoOrders;

    return parsed.filter(
      (entry): entry is Order =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as Order).id === "string" &&
        Array.isArray((entry as Order).lines),
    );
  } catch {
    return demoOrders;
  }
}

const ordersStore = createLocalStore<Order[]>({
  key: "flashx.orders.v1",
  parse: parseOrders,
  serverValue: EMPTY,
});

export function useOrders() {
  const orders = useSyncExternalStore(
    ordersStore.subscribe,
    ordersStore.getSnapshot,
    ordersStore.getServerSnapshot,
  );

  const hydrated = useIsClient();

  const placeOrder = useCallback((lines: OrderLine[]) => {
    const order: Order = {
      // crypto.randomUUID stands in for the UUID the backend would mint.
      id: crypto.randomUUID(),
      status: "PENDING_PERSISTENCE",
      placedAt: new Date().toISOString(),
      lines,
      totalAmount: lines.reduce(
        (total, line) => total + line.unitPrice * line.quantity,
        0,
      ),
      idempotencyKey: crypto.randomUUID(),
    };

    ordersStore.set([order, ...ordersStore.getSnapshot()]);
    return order;
  }, []);

  const confirmOrder = useCallback((id: string) => {
    ordersStore.set(
      ordersStore.getSnapshot().map((order) =>
        // Only PENDING advances; a FAILED order must not be flipped to CONFIRMED.
        order.id === id && order.status === "PENDING_PERSISTENCE"
          ? { ...order, status: "CONFIRMED" }
          : order,
      ),
    );
  }, []);

  return {
    orders,
    hydrated,
    placeOrder,
    confirmOrder,
    getOrder: (id: string) => orders.find((order) => order.id === id),
  };
}
