import "server-only";

import { connection } from "next/server";

import { request, type ApiResult } from "@/app/lib/http";
import type { Product } from "@/types/product";

/**
 * The public storefront catalogue.
 *
 * `FlashSaleView` on the backend was built field-for-field against the
 * `Product` type, so these need no mapping layer. If that ever drifts, the
 * compiler will not catch it — the JSON is untyped at the boundary — so the two
 * must be changed together.
 *
 * ## Why none of this is cached
 *
 * `remainingStock` and `status` are the whole point of the page and both move
 * during a sale. A cache measured in seconds would show stock that has already
 * gone, which is worse than a slower page: it invites a customer to click
 * Reserve on something that sold out. The counter customers actually buy
 * against lives in Redis and is only consulted at checkout, so what is rendered
 * here is indicative — but it should at least be indicative of *now*.
 *
 * These pages are therefore dynamic. That is a deliberate trade of static
 * delivery for correctness, not an oversight.
 *
 * ## Why `connection()` is here and not on the pages
 *
 * Next.js only knows a render is request-dependent when it sees a Request-time
 * API or its own patched `fetch`. axios is neither, so without this the build
 * happily PRERENDERS these pages and bakes in whatever stock existed at build
 * time — a sale would advertise 128 units forever. Verified: before adding
 * this, `next build` marked `/` and `/sales` as static.
 *
 * `connection()` lives in the data functions rather than in each page for the
 * reason the Next.js docs give for synchronous database drivers: every caller
 * is then excluded from prerendering automatically, and a new page cannot
 * forget to opt out.
 */

/** Note the id: this is the FLASH SALE id, which is what checkout posts back. */
export async function listFlashSales(): Promise<ApiResult<Product[]>> {
  await connection();
  return request<Product[]>({ url: "/api/v1/flash-sales" });
}

export async function getFlashSaleBySku(
  sku: string,
): Promise<ApiResult<Product>> {
  await connection();
  return request<Product>({
    url: `/api/v1/flash-sales/${encodeURIComponent(sku)}`,
  });
}

export async function listCategories(): Promise<ApiResult<string[]>> {
  await connection();
  return request<string[]>({ url: "/api/v1/flash-sales/categories" });
}

/**
 * Sales open for business right now.
 *
 * Filtered here rather than by a query parameter because the endpoint returns
 * the full board in one call and the storefront needs both slices on the home
 * page — two round trips to split a list we already hold would be worse.
 */
export const liveOnly = (sales: Product[]) =>
  sales.filter((sale) => sale.status === "ACTIVE");

export const upcomingOnly = (sales: Product[]) =>
  sales.filter((sale) => sale.status === "SCHEDULED");
