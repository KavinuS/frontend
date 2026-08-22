"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  addItem as addItemTo,
  cartStore,
  limitFor as limitForIn,
  removeItem as removeItemFrom,
  setQuantity as setQuantityIn,
  toLines,
  type AddResult,
  type Catalogue,
  type CartItem,
  type CartLine,
} from "./cart-store";
import { useIsClient } from "./local-store";

/**
 * Cart context.
 *
 * The provider subscribes to the localStorage-backed store exactly once and
 * hands the derived lines and totals down through context. Consumers therefore
 * share one subscription and one `toLines` pass, instead of every card, badge,
 * and summary recomputing the same joins against the catalogue.
 *
 * The store underneath stays a `useSyncExternalStore` source rather than
 * `useState` + `useEffect`: reading localStorage in an effect is a cascading
 * render (React 19's `set-state-in-effect` rule rejects it) and would drop the
 * cross-tab sync. Context is the distribution mechanism; the store is the
 * source of truth.
 *
 * The catalogue arrives as a prop from the shop layout, which fetches it on the
 * server. Only the cart itself (skus and quantities) lives in the browser; the
 * prices and stock it is joined against are never client-authored.
 */

export type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  savings: number;
  /** False on the server and during hydration — show a skeleton, not "empty". */
  hydrated: boolean;
  /*
   * Every one of these takes a FLASH SALE id, not a SKU. A SKU names a product,
   * and a product can be on sale more than once; a reservation goes against one
   * specific Redis counter, so the counter is what the cart addresses.
   */
  /** Returns what actually happened so callers can report it. */
  addItem: (flashSaleId: number, quantity?: number) => AddResult;
  setQuantity: (flashSaleId: number, quantity: number) => void;
  removeItem: (flashSaleId: number) => void;
  clear: () => void;
  /** Live ceiling for a sale. Exposed so a detail page can size its stepper. */
  limitFor: (flashSaleId: number) => number;
  /** Quantity already held for a sale, for the same reason. */
  quantityOf: (flashSaleId: number) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  catalogue,
  children,
}: {
  /** Live sales from the server. Empty when the backend is unreachable. */
  catalogue: Catalogue;
  children: React.ReactNode;
}) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );

  const hydrated = useIsClient();

  /*
   * Every mutation reads the store's current snapshot rather than closing over
   * `items`. Two clicks in the same tick would otherwise both start from the
   * stale render value and the second would clobber the first.
   */
  const addItem = useCallback(
    (flashSaleId: number, quantity = 1): AddResult => {
    const { items: next, result } = addItemTo(
      catalogue,
      cartStore.getSnapshot(),
      flashSaleId,
      quantity,
    );

    // Skip the write when nothing changed, so no needless re-render or
    // localStorage round-trip on a rejected add.
    if (result.ok) cartStore.set(next);

    return result;
    },
    [catalogue],
  );

  const setQuantity = useCallback(
    (flashSaleId: number, quantity: number) => {
      cartStore.set(
        setQuantityIn(catalogue, cartStore.getSnapshot(), flashSaleId, quantity),
      );
    },
    [catalogue],
  );

  const removeItem = useCallback((flashSaleId: number) => {
    cartStore.set(removeItemFrom(cartStore.getSnapshot(), flashSaleId));
  }, []);

  const clear = useCallback(() => cartStore.set([]), []);

  const limitFor = useCallback(
    (flashSaleId: number) => limitForIn(catalogue, flashSaleId),
    [catalogue],
  );

  const quantityOf = useCallback(
    (flashSaleId: number) =>
      items.find((item) => item.flashSaleId === flashSaleId)?.quantity ?? 0,
    [items],
  );

  const value = useMemo<CartContextValue>(() => {
    const lines = toLines(catalogue, items);

    return {
      items,
      lines,
      hydrated,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      subtotal: lines.reduce((total, line) => total + line.lineTotal, 0),
      savings: lines.reduce(
        (total, line) =>
          total + (line.originalPrice - line.unitPrice) * line.quantity,
        0,
      ),
      addItem,
      setQuantity,
      removeItem,
      clear,
      limitFor,
      quantityOf,
    };
  }, [
    catalogue,
    items,
    hydrated,
    addItem,
    setQuantity,
    removeItem,
    clear,
    limitFor,
    quantityOf,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside a <CartProvider>. The shop layout provides one — " +
        "a page outside app/(shop) needs its own.",
    );
  }

  return context;
}

export { MAX_PER_ITEM } from "./cart-store";
export type { CartItem, CartLine, AddResult, Catalogue } from "./cart-store";
