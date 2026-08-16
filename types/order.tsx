/**
 * Mirrors the `orders.status` column in the proposal's schema.
 *
 * PENDING_PERSISTENCE is the interesting one: Redis has already reserved the
 * stock and the queue has accepted the job, but the Postgres row does not exist
 * yet. The UI has to show that honestly instead of claiming the order is done.
 */
export type OrderStatus = "PENDING_PERSISTENCE" | "CONFIRMED" | "FAILED";

export type OrderLine = {
  sku: string;
  name: string;
  emoji: string;
  quantity: number;
  /** Unit price at reservation time — not read back from the product. */
  unitPrice: number;
};

export type Order = {
  /** UUID from the checkout response; the user's correlation ID. */
  id: string;
  status: OrderStatus;
  /** ISO timestamp. */
  placedAt: string;
  lines: OrderLine[];
  totalAmount: number;
  /** Echoed back so the orders page can show the dedupe key that was sent. */
  idempotencyKey: string;
  /** Set only when status is FAILED. */
  failureReason?: string;
};
