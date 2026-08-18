/**
 * TypeScript mirrors of the backend's admin DTOs.
 *
 * Each type names the Java record it shadows. When one side changes the other
 * has to follow — there is no code generation here, so the comment is the only
 * link between them.
 *
 * Numeric money fields arrive as JSON numbers because the Java side uses
 * BigDecimal and Jackson serialises it unquoted. That is fine at these
 * magnitudes; it would not be for a real ledger, where the wire format should
 * be a string to avoid double rounding.
 */

/** `AdminDtos.PageResponse<T>` — the same shape in all three services. */
export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

// ------------------------------------------------------------------ catalog

/** `AdminDtos.ProductView` */
export type AdminProduct = {
  id: number;
  sku: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  emoji: string;
  basePrice: number;
  totalInventory: number;
  highlights: string[];
  createdAt: string;
  /** SCHEDULED + ACTIVE sales. Non-zero means the product cannot be deleted. */
  activeSaleCount: number;
};

export const SALE_STATUSES = [
  "SCHEDULED",
  "ACTIVE",
  "ENDED",
  "EXHAUSTED",
] as const;

export type SaleStatus = (typeof SALE_STATUSES)[number];

/** `AdminDtos.FlashSaleAdminView` */
export type AdminFlashSale = {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  emoji: string;
  originalPrice: number;
  discountPrice: number;
  allocatedStock: number;
  /** The Postgres projection. Trails reality while a sale is running. */
  remainingStock: number;
  /** The live Redis counter, or null when the sale was never pre-warmed. */
  liveStock: number | null;
  soldUnits: number | null;
  status: SaleStatus;
  startTime: string;
  endTime: string;
  preWarmed: boolean;
};

/**
 * Which statuses a sale may legally move to, mirroring the switch in
 * `AdminSaleService.changeStatus`.
 *
 * Duplicated here only to decide which buttons to render. The server refuses
 * illegal transitions regardless, so this table being stale shows up as a
 * button that returns ILLEGAL_TRANSITION — never as an illegal transition that
 * succeeds.
 */
export const LEGAL_TRANSITIONS: Record<SaleStatus, SaleStatus[]> = {
  SCHEDULED: ["ACTIVE", "ENDED"],
  ACTIVE: ["ENDED", "EXHAUSTED"],
  ENDED: [],
  EXHAUSTED: [],
};

// ------------------------------------------------------------------- orders

export const ORDER_STATUSES = [
  "PENDING_PERSISTENCE",
  "CONFIRMED",
  "FAILED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** `AdminOrderController.AdminOrderView` */
export type AdminOrder = {
  id: string;
  userId: string;
  flashSaleId: number;
  sku: string;
  productName: string;
  emoji: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  idempotencyKey: string;
  failureReason: string | null;
  createdAt: string;
};

/**
 * `AdminOrderController.Reconciliation` — the zero-oversell proof.
 *
 * `allocatedStock = confirmedUnits + liveStock` must hold exactly. Nulls are
 * meaningful: once a sale is closed its Redis counter is torn down, so the
 * check becomes not-applicable rather than failed.
 */
export type Reconciliation = {
  flashSaleId: number;
  allocatedStock: number;
  confirmedUnits: number;
  confirmedOrders: number;
  liveStock: number | null;
  /** Reserved in Redis but not yet written to Postgres. Settles to 0. */
  inFlightUnits: number | null;
  oversold: boolean;
  balanced: boolean;
};

/** `OrderStats` */
export type OrderStats = {
  total: number;
  confirmed: number;
  pending: number;
  failed: number;
  revenue: number;
};

/** `AdminMetricsController.MetricsView` */
export type AdminMetrics = {
  orders: OrderStats;
  /** null means the broker could not be reached — not an empty queue. */
  queueDepth: number | null;
  /** Anything above zero needs a human: stock returned, customer got nothing. */
  deadLetterDepth: number | null;
  consumers: number | null;
  recentOrders: AdminOrder[];
};

// -------------------------------------------------------------------- users

export type UserRole = "CUSTOMER" | "ADMIN";

/** `AdminUserController.UserView` */
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider: "LOCAL" | "GOOGLE";
  createdAt: string;
};
