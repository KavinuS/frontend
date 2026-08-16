import { products } from "@/Data/product";
import { createLocalStore } from "./local-store";

/**
 * Cart storage and the pure rules that govern it.
 *
 * This layer is deliberately React-free — see `cart-context.tsx` for the
 * provider and the `useCart` hook. Keeping the rules as pure functions means
 * the quantity/stock logic can be reasoned about (and tested) without mounting
 * a component.
 *
 * The cart is frontend-only. A flash sale reserves stock atomically in Redis at
 * *checkout*, not when an item is added, so nothing here is authoritative: the
 * caps below are UX guard rails and the backend re-checks stock when the order
 * is actually placed.
 */

/** Per-customer cap, the kind a flash sale would realistically enforce. */
export const MAX_PER_ITEM = 5;

/** Only sku and quantity are persisted — price and name are read from the
 *  catalogue on render, so a price change is never served from stale storage. */
export type CartItem = {
  sku: string;
  quantity: number;
};

/** A cart line joined against the catalogue, ready to render. */
export type CartLine = {
  sku: string;
  name: string;
  emoji: string;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  lineTotal: number;
  /** Remaining stock, so the cart can flag a line that has since sold out. */
  remainingStock: number;
  soldOut: boolean;
  /** Most this line may hold right now: the lower of the cap and the stock. */
  maxQuantity: number;
  atMax: boolean;
};

/**
 * Why an add didn't fully succeed. Returned to the caller so the button can say
 * something truthful instead of always flashing "Added ✓".
 */
export type AddFailureReason =
  /** SKU isn't in the catalogue at all. */
  | "UNKNOWN_SKU"
  /** Stock is zero — nothing to reserve. */
  | "SOLD_OUT"
  /** Already holding the maximum allowed for this product. */
  | "AT_LIMIT";

export type AddResult =
  | {
      ok: true;
      /** How many were actually added — may be fewer than requested. */
      added: number;
      /** Resulting quantity for this line. */
      quantity: number;
      /** True when the request was trimmed to fit the cap or the stock. */
      clamped: boolean;
      limit: number;
    }
  | {
      ok: false;
      reason: AddFailureReason;
      /** Current quantity in the cart, unchanged. */
      quantity: number;
      limit: number;
    };

/* Shared empty array: a fresh [] each call would break snapshot identity. */
const EMPTY: CartItem[] = [];

const findProduct = (sku: string) =>
  products.find((product) => product.sku === sku);

/**
 * The most of `sku` a cart may hold: the per-customer cap, or the remaining
 * stock when that is lower. This is the single place the ceiling is decided —
 * every mutation below routes through it.
 */
export function limitFor(sku: string): number {
  const product = findProduct(sku);
  if (!product) return 0;
  return Math.max(0, Math.min(MAX_PER_ITEM, product.remainingStock));
}

const quantityOf = (items: CartItem[], sku: string) =>
  items.find((item) => item.sku === sku)?.quantity ?? 0;

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return EMPTY;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;

    // Storage is user-writable, so every field is untrusted. Drop entries that
    // no longer match a product, and clamp to what the catalogue allows today —
    // stock may have fallen since the cart was written.
    const items = parsed.flatMap((entry): CartItem[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const { sku, quantity } = entry as Partial<CartItem>;

      if (typeof sku !== "string") return [];
      if (typeof quantity !== "number" || !Number.isFinite(quantity)) return [];

      const product = findProduct(sku);
      if (!product) return [];

      // Sold-out lines are kept, not dropped: the cart shows them explicitly
      // and blocks checkout, which beats silently emptying someone's cart.
      const ceiling = product.remainingStock <= 0 ? 1 : limitFor(sku);
      const clamped = Math.min(ceiling, Math.max(1, Math.floor(quantity)));

      return [{ sku, quantity: clamped }];
    });

    return items.length > 0 ? items : EMPTY;
  } catch {
    return EMPTY;
  }
}

export const cartStore = createLocalStore<CartItem[]>({
  key: "flashx.cart.v1",
  parse: parseCart,
  serverValue: EMPTY,
});

/* ------------------------------------------------------------------ *
 * Pure transitions. Each takes the current items and returns the next.
 * ------------------------------------------------------------------ */

export function addItem(
  items: CartItem[],
  sku: string,
  quantity = 1,
): { items: CartItem[]; result: AddResult } {
  const product = findProduct(sku);
  const current = quantityOf(items, sku);

  if (!product) {
    return {
      items,
      result: { ok: false, reason: "UNKNOWN_SKU", quantity: current, limit: 0 },
    };
  }

  if (product.remainingStock <= 0) {
    return {
      items,
      result: { ok: false, reason: "SOLD_OUT", quantity: current, limit: 0 },
    };
  }

  const limit = limitFor(sku);

  if (current >= limit) {
    return {
      items,
      result: { ok: false, reason: "AT_LIMIT", quantity: current, limit },
    };
  }

  const requested = Math.max(1, Math.floor(quantity));
  const next = Math.min(limit, current + requested);
  const added = next - current;

  return {
    items:
      current === 0
        ? [...items, { sku, quantity: next }]
        : items.map((item) =>
            item.sku === sku ? { ...item, quantity: next } : item,
          ),
    result: {
      ok: true,
      added,
      quantity: next,
      // Flags "you asked for 3, you got 2" so the UI can say so.
      clamped: added < requested,
      limit,
    },
  };
}

export function setQuantity(
  items: CartItem[],
  sku: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) return items.filter((item) => item.sku !== sku);

  // Sold-out lines can't be raised above the 1 they're pinned at.
  const ceiling = Math.max(1, limitFor(sku));
  const next = Math.min(ceiling, Math.floor(quantity));

  return items.map((item) =>
    item.sku === sku ? { ...item, quantity: next } : item,
  );
}

export const removeItem = (items: CartItem[], sku: string) =>
  items.filter((item) => item.sku !== sku);

/** Joins stored items against the catalogue into renderable lines. */
export function toLines(items: CartItem[]): CartLine[] {
  return items.flatMap((item): CartLine[] => {
    const product = findProduct(item.sku);
    if (!product) return []; // Pulled from the catalogue since it was added.

    const soldOut = product.remainingStock <= 0;
    const maxQuantity = soldOut ? item.quantity : limitFor(product.sku);

    return [
      {
        sku: product.sku,
        name: product.name,
        emoji: product.emoji,
        quantity: item.quantity,
        unitPrice: product.salePrice,
        originalPrice: product.originalPrice,
        lineTotal: product.salePrice * item.quantity,
        remainingStock: product.remainingStock,
        soldOut,
        maxQuantity,
        atMax: item.quantity >= maxQuantity,
      },
    ];
  });
}
