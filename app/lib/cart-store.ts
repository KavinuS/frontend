import type { Product } from "@/types/product";
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
 *
 * ## Why lines are keyed by flash sale id, not SKU
 *
 * They used to be keyed by SKU, and it was wrong. A SKU identifies a *product*,
 * and a product can be put on sale many times — that is the entire purpose of
 * being able to schedule sales. With two sales live for one product,
 * `find(p => p.sku === sku)` returned whichever the API happened to list first,
 * so the cart could quietly hold a reservation against a closed sale and
 * checkout would fail with SALE_NOT_OPEN on an item the page had shown as
 * available.
 *
 * A reservation goes against one specific Redis counter. The cart therefore
 * stores the id of that counter, and the SKU is carried alongside for display
 * and for building links.
 *
 * ## Why the catalogue is a parameter
 *
 * It comes from `GET /api/v1/flash-sales`, fetched per request on the server
 * and passed in. Threading it through rather than reaching for a module-level
 * cache keeps these functions pure — the same items and the same catalogue
 * always produce the same result, which is what makes the arithmetic testable.
 */

/** Per-customer cap. Must not exceed the backend cap in reserve_stock.lua. */
export const MAX_PER_ITEM = 5;

/** The live sale board, as returned by the catalogue endpoint. */
export type Catalogue = Product[];

/**
 * What is persisted: a flash sale id and a quantity, nothing else.
 *
 * Prices, names, and stock are joined from the catalogue on render, so a cart
 * left open overnight can never serve a stale price.
 */
export type CartItem = {
  flashSaleId: number;
  quantity: number;
};

/** A cart line joined against the catalogue, ready to render. */
export type CartLine = {
  /** The Redis counter this line will reserve against. */
  flashSaleId: number;
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
  /** True once the sale is no longer open — ended, exhausted, or not yet begun. */
  closed: boolean;
  /** Most this line may hold right now: the lower of the cap and the stock. */
  maxQuantity: number;
  atMax: boolean;
};

/**
 * Why an add did not fully succeed. Returned to the caller so the button can
 * say something truthful instead of always flashing "Added".
 */
export type AddFailureReason =
  /** No such sale in the catalogue at all. */
  | "UNKNOWN_SALE"
  /** Stock is zero — nothing to reserve. */
  | "SOLD_OUT"
  /** The sale is not open, so a reservation would be refused. */
  | "CLOSED"
  /** Already holding the maximum allowed. */
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

const findSale = (catalogue: Catalogue, flashSaleId: number) =>
  catalogue.find((sale) => sale.id === flashSaleId);

/**
 * A sale can only be reserved against while it is ACTIVE.
 *
 * The window is deliberately NOT checked here. `reserve_stock.lua` validates it
 * server-side against Redis time, and duplicating that with the browser's clock
 * would let a skewed machine hide a sale that is genuinely open. Status is the
 * signal the catalogue gives us; the backend has the last word either way.
 */
export const isOpen = (sale: Product) => sale.status === "ACTIVE";

/**
 * The most of a sale a cart may hold: the per-customer cap, or the remaining
 * stock when that is lower. This is the single place the ceiling is decided —
 * every mutation below routes through it.
 */
export function limitFor(catalogue: Catalogue, flashSaleId: number): number {
  const sale = findSale(catalogue, flashSaleId);
  if (!sale) return 0;
  return Math.max(0, Math.min(MAX_PER_ITEM, sale.remainingStock));
}

const quantityOf = (items: CartItem[], flashSaleId: number) =>
  items.find((item) => item.flashSaleId === flashSaleId)?.quantity ?? 0;

/**
 * Validates the SHAPE of stored data only.
 *
 * Catalogue rules are deliberately not applied here. The store is created at
 * module load, long before any catalogue has been fetched, and stock moves
 * every few seconds during a sale — clamping at parse time would bake in
 * whatever happened to be true when the tab was opened. `toLines` applies the
 * live ceiling instead, on every render.
 *
 * Storage is user-writable, so every field is untrusted.
 */
function parseCart(raw: string | null): CartItem[] {
  if (!raw) return EMPTY;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;

    const items = parsed.flatMap((entry): CartItem[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const { flashSaleId, quantity } = entry as Partial<CartItem>;

      if (typeof flashSaleId !== "number" || !Number.isInteger(flashSaleId)) {
        return [];
      }
      if (typeof quantity !== "number" || !Number.isFinite(quantity)) return [];

      return [{ flashSaleId, quantity: Math.max(1, Math.floor(quantity)) }];
    });

    return items.length > 0 ? items : EMPTY;
  } catch {
    return EMPTY;
  }
}

export const cartStore = createLocalStore<CartItem[]>({
  // v2: entries changed from { sku } to { flashSaleId }. A new key rather than a
  // migration, because a v1 line cannot be resolved to a sale without guessing —
  // which is the bug this change exists to remove. An old cart is dropped
  // cleanly instead of being silently misread.
  key: "flashx.cart.v2",
  parse: parseCart,
  serverValue: EMPTY,
});

/* ------------------------------------------------------------------ *
 * Pure transitions. Each takes the current items and returns the next.
 * ------------------------------------------------------------------ */

export function addItem(
  catalogue: Catalogue,
  items: CartItem[],
  flashSaleId: number,
  quantity = 1,
): { items: CartItem[]; result: AddResult } {
  const sale = findSale(catalogue, flashSaleId);
  const current = quantityOf(items, flashSaleId);

  if (!sale) {
    return {
      items,
      result: { ok: false, reason: "UNKNOWN_SALE", quantity: current, limit: 0 },
    };
  }

  if (!isOpen(sale)) {
    return {
      items,
      result: { ok: false, reason: "CLOSED", quantity: current, limit: 0 },
    };
  }

  if (sale.remainingStock <= 0) {
    return {
      items,
      result: { ok: false, reason: "SOLD_OUT", quantity: current, limit: 0 },
    };
  }

  const limit = limitFor(catalogue, flashSaleId);

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
        ? [...items, { flashSaleId, quantity: next }]
        : items.map((item) =>
            item.flashSaleId === flashSaleId
              ? { ...item, quantity: next }
              : item,
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
  catalogue: Catalogue,
  items: CartItem[],
  flashSaleId: number,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) {
    return items.filter((item) => item.flashSaleId !== flashSaleId);
  }

  // A sold-out or closed line cannot be raised above the 1 it is pinned at.
  const ceiling = Math.max(1, limitFor(catalogue, flashSaleId));
  const next = Math.min(ceiling, Math.floor(quantity));

  return items.map((item) =>
    item.flashSaleId === flashSaleId ? { ...item, quantity: next } : item,
  );
}

export const removeItem = (items: CartItem[], flashSaleId: number) =>
  items.filter((item) => item.flashSaleId !== flashSaleId);

/** Joins stored items against the live catalogue into renderable lines. */
export function toLines(catalogue: Catalogue, items: CartItem[]): CartLine[] {
  return items.flatMap((item): CartLine[] => {
    const sale = findSale(catalogue, item.flashSaleId);

    // Gone from the catalogue entirely — the sale was deleted. Dropping the
    // line is right: there is no longer a counter to reserve against.
    if (!sale) return [];

    const closed = !isOpen(sale);
    const soldOut = sale.remainingStock <= 0;

    // A closed or sold-out line keeps its stored quantity so the cart can show
    // what the customer had and explain why it cannot be bought, rather than
    // silently emptying itself.
    const maxQuantity =
      closed || soldOut ? item.quantity : limitFor(catalogue, item.flashSaleId);

    // Clamped here rather than at parse time: stock falls during a sale, and
    // this is the only place that sees the current figure.
    const quantity = Math.min(item.quantity, Math.max(1, maxQuantity));

    return [
      {
        flashSaleId: sale.id,
        sku: sale.sku,
        name: sale.name,
        emoji: sale.emoji,
        quantity,
        unitPrice: sale.salePrice,
        originalPrice: sale.originalPrice,
        lineTotal: sale.salePrice * quantity,
        remainingStock: sale.remainingStock,
        soldOut,
        closed,
        maxQuantity,
        atMax: quantity >= maxQuantity,
      },
    ];
  });
}
