"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  addToCartAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
  type CartResult,
} from "@/app/actions/cart";
import { useI18n } from "./I18nProvider";
import type { Cart } from "@/lib/shopify/types";

interface CartContextValue {
  cart: Cart | null;
  quantity: number;
  isOpen: boolean;
  /** True while a cart mutation is in flight. */
  pending: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  /** Adds lines and slides the drawer open on success. Resolves true on success. */
  addLines: (lines: { merchandiseId: string; quantity: number }[]) => Promise<boolean>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { lang, dict } = useI18n();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Hydrate the cart from the cookie on first load.
  useEffect(() => {
    let alive = true;
    getCartAction(lang).then((res) => {
      if (alive && res.cart) setCart(res.cart);
    });
    return () => {
      alive = false;
    };
  }, [lang]);

  const apply = useCallback(
    (res: CartResult, keepOnError = true) => {
      if (res.error) {
        setError(dict.cart.error);
        if (!keepOnError) setCart(null);
        return false;
      }
      setError(null);
      setCart(res.cart);
      return true;
    },
    [dict.cart.error],
  );

  const run = useCallback(
    (fn: () => Promise<CartResult>) =>
      new Promise<boolean>((resolve) => {
        startTransition(async () => {
          try {
            resolve(apply(await fn()));
          } catch {
            setError(dict.cart.error);
            resolve(false);
          }
        });
      }),
    [apply, dict.cart.error],
  );

  const addLines = useCallback(
    async (lines: { merchandiseId: string; quantity: number }[]) => {
      const ok = await run(() => addToCartAction(lines, lang));
      if (ok) setIsOpen(true);
      return ok;
    },
    [run, lang],
  );

  const updateLine = useCallback(
    async (lineId: string, quantity: number) => {
      await run(() => updateCartLineAction(lineId, quantity, lang));
    },
    [run, lang],
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      await run(() => removeCartLineAction(lineId, lang));
    },
    [run, lang],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      quantity: cart?.totalQuantity ?? 0,
      isOpen,
      pending,
      error,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addLines,
      updateLine,
      removeLine,
    }),
    [cart, isOpen, pending, error, addLines, updateLine, removeLine],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
