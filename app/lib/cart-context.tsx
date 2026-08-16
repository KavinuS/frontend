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
  removeItem as removeItemFrom,
  setQuantity as setQuantityIn,
  toLines,
  type AddResult,
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
 */

export type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  savings: number;
  /** False on the server and during hydration — show a skeleton, not "empty". */
  hydrated: boolean;
  /** Returns what actually happened so callers can report it. */
  addItem: (sku: string, quantity?: number) => AddResult;
  setQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
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
  const addItem = useCallback((sku: string, quantity = 1): AddResult => {
    const { items: next, result } = addItemTo(
      cartStore.getSnapshot(),
      sku,
      quantity,
    );

    // Skip the write when nothing changed, so no needless re-render or
    // localStorage round-trip on a rejected add.
    if (result.ok) cartStore.set(next);

    return result;
  }, []);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    cartStore.set(setQuantityIn(cartStore.getSnapshot(), sku, quantity));
  }, []);

  const removeItem = useCallback((sku: string) => {
    cartStore.set(removeItemFrom(cartStore.getSnapshot(), sku));
  }, []);

  const clear = useCallback(() => cartStore.set([]), []);

  const value = useMemo<CartContextValue>(() => {
    const lines = toLines(items);

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
    };
  }, [items, hydrated, addItem, setQuantity, removeItem, clear]);

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
export type { CartItem, CartLine, AddResult } from "./cart-store";
