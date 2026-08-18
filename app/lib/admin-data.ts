import "server-only";

import { adminFetch } from "@/app/lib/admin-api";
import type {
  AdminFlashSale,
  AdminMetrics,
  AdminOrder,
  AdminProduct,
  AdminUser,
  OrderStatus,
  PageResponse,
  Reconciliation,
  SaleStatus,
} from "@/app/lib/admin-types";

/**
 * Read queries for the admin console.
 *
 * Every endpoint path in the app appears exactly once, here. Pages import
 * functions rather than strings, so a route that moves on the backend is one
 * edit rather than a search across a dozen components.
 *
 * These return `ApiResult` instead of throwing. A failed panel should render an
 * inline error and leave the rest of the page working — a dashboard that goes
 * blank because RabbitMQ is down is less useful than one that says so.
 */

// ----------------------------------------------------------------- products

export const listProducts = (params: {
  page?: number;
  size?: number;
  search?: string;
}) =>
  adminFetch<PageResponse<AdminProduct>>("/api/v1/admin/products", {
    query: params,
  });

export const getProduct = (id: string | number) =>
  adminFetch<AdminProduct>(`/api/v1/admin/products/${id}`);

export const listCategories = () =>
  adminFetch<string[]>("/api/v1/admin/products/categories");

// -------------------------------------------------------------- flash sales

export const listFlashSales = (status?: SaleStatus) =>
  adminFetch<AdminFlashSale[]>("/api/v1/admin/flash-sales", {
    query: { status },
  });

export const getFlashSale = (id: string | number) =>
  adminFetch<AdminFlashSale>(`/api/v1/admin/flash-sales/${id}`);

// ------------------------------------------------------------------- orders

export const listOrders = (params: {
  page?: number;
  size?: number;
  status?: OrderStatus;
  flashSaleId?: number;
  search?: string;
}) =>
  adminFetch<PageResponse<AdminOrder>>("/api/v1/admin/orders", {
    query: params,
  });

/**
 * The oversell check for one sale.
 *
 * `allocatedStock` is passed in by the caller because it lives in
 * catalog-service's schema and order-service deliberately cannot read another
 * service's tables. The console therefore reads the sale first, then hands the
 * allocation across — the service boundary made visible.
 */
export const reconcile = (flashSaleId: number, allocatedStock: number) =>
  adminFetch<Reconciliation>(
    `/api/v1/admin/orders/reconciliation/${flashSaleId}`,
    { query: { allocatedStock } },
  );

// ------------------------------------------------------------------ metrics

export const getMetrics = () =>
  adminFetch<AdminMetrics>("/api/v1/admin/metrics");

// -------------------------------------------------------------------- users

export const listUsers = (params: {
  page?: number;
  size?: number;
  search?: string;
}) =>
  adminFetch<PageResponse<AdminUser>>("/api/v1/admin/users", { query: params });
