"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { request, withAuth } from "@/app/lib/http";
import { getSessionToken } from "@/app/lib/session";

/**
 * The hot path: reserve stock for everything in the cart.
 *
 * ## Why this is a loop
 *
 * `POST /api/v1/flash-sale/checkout` reserves ONE sale at a time — that is the
 * shape the Lua script and the per-user cap are built around, and the shape the
 * k6 load script exercises. The cart is multi-line, so a basket of three
 * products is three reservations.
 *
 * They are issued sequentially rather than with `Promise.all`. Under a flash
 * sale the interesting failure is partial: two lines succeed and the third is
 * sold out. Sequential means the caller learns exactly which line failed and
 * the successful ones are already real orders, rather than three racing
 * requests whose interleaving is unpredictable.
 *
 * There is no distributed transaction here and there should not be. Rolling
 * back a successful Redis reservation because a *different* sale sold out would
 * mean returning stock that a queued order already depends on.
 */

export type CheckoutLineInput = {
  flashSaleId: number;
  quantity: number;
  /** Carried only so a failure can name the product the customer recognises. */
  name: string;
};

type CheckoutAccepted = { orderId: string; status: string };

export type CheckoutOutcome = {
  /** Orders the backend accepted, in submission order. */
  placed: {
    orderId: string;
    flashSaleId: number;
    name: string;
    quantity: number;
  }[];
  /** Lines that were refused, with the reason to show the customer. */
  rejected: {
    flashSaleId: number;
    name: string;
    message: string;
    code?: string;
  }[];
};

export async function placeOrder(
  lines: CheckoutLineInput[],
): Promise<CheckoutOutcome | { error: string }> {
  const token = await getSessionToken();

  // Checkout takes the buyer identity from the JWT subject, never from the
  // request body, so there is genuinely nothing to send without a session.
  if (!token) {
    return { error: "Your session has expired. Sign in again to check out." };
  }

  if (lines.length === 0) {
    return { error: "There is nothing in your cart to reserve." };
  }

  const outcome: CheckoutOutcome = { placed: [], rejected: [] };

  for (const line of lines) {
    const result = await request<CheckoutAccepted>({
      method: "POST",
      url: "/api/v1/flash-sale/checkout",
      data: {
        flashSaleId: line.flashSaleId,
        quantity: line.quantity,
        /*
         * Generated per line, per attempt, on the server.
         *
         * This is the key the UNIQUE index dedupes on. Generating it here means
         * a double-clicked button sends two DIFFERENT keys and creates two
         * orders — which is why the submit button disables itself while the
         * action is in flight. The key's real job is protecting against a
         * retried request whose response was lost, where the same key must be
         * replayed. A per-attempt key cannot do that, and doing it properly
         * needs the key minted before the first attempt and reused across
         * retries; see the roadmap.
         */
        idempotencyKey: crypto.randomUUID(),
      },
      ...withAuth(token),
    });

    if (result.ok) {
      outcome.placed.push({
        orderId: result.data.orderId,
        flashSaleId: line.flashSaleId,
        name: line.name,
        quantity: line.quantity,
      });
    } else {
      outcome.rejected.push({
        flashSaleId: line.flashSaleId,
        name: line.name,
        message: result.message,
        code: result.code,
      });
    }
  }

  // The sale board now shows different stock, and the orders page has new rows.
  revalidatePath("/sales");
  revalidatePath("/orders");
  revalidatePath("/");

  return outcome;
}

/**
 * Convenience for the single-product "Reserve now" button on a sale page,
 * which bypasses the cart entirely.
 */
export async function reserveNow(
  flashSaleId: number,
  quantity: number,
  name: string,
) {
  const outcome = await placeOrder([{ flashSaleId, quantity, name }]);

  if ("error" in outcome) return outcome;

  if (outcome.placed.length === 0) {
    return { error: outcome.rejected[0]?.message ?? "That reservation failed." };
  }

  // Outside any try/catch — redirect() signals by throwing.
  redirect(`/orders/${outcome.placed[0].orderId}?placed=1`);
}
