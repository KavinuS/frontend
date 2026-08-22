import "server-only";

import { request, withAuth, type ApiResult } from "@/app/lib/http";
import { getSessionToken } from "@/app/lib/session";
import type { Order } from "@/types/order";

/**
 * The signed-in customer's order history.
 *
 * Scoped by the JWT subject on the backend, so there is no user id to pass and
 * no way for a caller here to ask for somebody else's orders. A missing order
 * comes back as 404 whether it belongs to another user or does not exist —
 * ambiguous on purpose, since distinguishing the two would leak existence.
 */

const unauthenticated = {
  ok: false as const,
  status: 401,
  message: "Sign in to see your orders.",
};

export async function listMyOrders(): Promise<ApiResult<Order[]>> {
  const token = await getSessionToken();
  if (!token) return unauthenticated;

  return request<Order[]>({ url: "/api/v1/orders", ...withAuth(token) });
}

export async function getMyOrder(id: string): Promise<ApiResult<Order>> {
  const token = await getSessionToken();
  if (!token) return unauthenticated;

  return request<Order>({
    url: `/api/v1/orders/${encodeURIComponent(id)}`,
    ...withAuth(token),
  });
}
