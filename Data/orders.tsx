import type { Order } from "@/types/order";

/**
 * Demo order history, seeded on first visit so /orders and the dashboard have
 * something to show. Replaced by `GET /api/v1/orders` in Phase 1.
 *
 * Fixed IDs and timestamps on purpose: generating them at import time would
 * produce different values on the server and in the browser.
 */
export const demoOrders: Order[] = [
  {
    id: "9f8c1d2e-4b6a-4c30-9f11-2a7d5e0b8c44",
    status: "CONFIRMED",
    placedAt: "2026-08-14T09:24:00.000Z",
    lines: [
      {
        sku: "FX-AUDIO-001",
        name: "Wireless Headphones",
        emoji: "🎧",
        quantity: 1,
        unitPrice: 79,
      },
    ],
    totalAmount: 79,
    idempotencyKey: "idem_5f2a91c4-7e18-4d63-b0aa-3c9e1f7d2b06",
  },
  {
    id: "3c5b7a91-8d24-4e77-a6f2-1b0c9d4e6a58",
    status: "CONFIRMED",
    placedAt: "2026-08-11T17:03:00.000Z",
    lines: [
      {
        sku: "FX-INPUT-002",
        name: "Gaming Keyboard",
        emoji: "⌨️",
        quantity: 2,
        unitPrice: 59,
      },
      {
        sku: "FX-AUDIO-004",
        name: "Studio Microphone",
        emoji: "🎙️",
        quantity: 1,
        unitPrice: 99,
      },
    ],
    totalAmount: 217,
    idempotencyKey: "idem_c81d3f60-2a95-4b17-8e42-6f0b5a3c9d71",
  },
  {
    // Kept in the seed data so the FAILED branch of the UI is exercised without
    // having to break something to see it.
    id: "b71e4d08-6f39-4a52-8c1b-0d9a2e5f7c36",
    status: "FAILED",
    placedAt: "2026-08-09T12:47:00.000Z",
    lines: [
      {
        sku: "FX-DISPLAY-003",
        name: "4K Monitor",
        emoji: "🖥️",
        quantity: 1,
        unitPrice: 399,
      },
    ],
    totalAmount: 399,
    idempotencyKey: "idem_a03f8b25-9d71-4c68-b5e0-2f7a6c1d840e",
    failureReason:
      "Stock was exhausted before the order reached the persistence worker.",
  },
];
