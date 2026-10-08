"use server";

import { cookies } from "next/headers";
import {
  addCartLines,
  createCart,
  getCart,
  removeCartLines,
  updateCartLines,
} from "@/lib/shopify/cart";
import { isLocale, type Locale } from "@/lib/i18n/config";
import type { Cart } from "@/lib/shopify/types";

const CART_COOKIE = "vexo_cart_id";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export type CartResult = { cart: Cart | null; error?: string };

const toLocale = (lang: string): Locale => (isLocale(lang) ? lang : "en");

async function readCartId(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE)?.value;
}

async function writeCartId(id: string) {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

async function clearCartId() {
  (await cookies()).delete(CART_COOKIE);
}

function fail(err: unknown): CartResult {
  return { cart: null, error: err instanceof Error ? err.message : "Cart error" };
}

/** Loads the visitor's cart (null if none / expired). */
export async function getCartAction(lang: string): Promise<CartResult> {
  try {
    const id = await readCartId();
    if (!id) return { cart: null };
    const cart = await getCart(id, toLocale(lang));
    if (!cart) await clearCartId();
    return { cart };
  } catch (err) {
    return fail(err);
  }
}

/** Adds one or more variants. Creates the cart on first use. */
export async function addToCartAction(
  lines: { merchandiseId: string; quantity: number }[],
  lang: string,
): Promise<CartResult> {
  try {
    const locale = toLocale(lang);
    const id = await readCartId();

    if (id) {
      try {
        return { cart: await addCartLines(id, lines, locale) };
      } catch {
        // Cart expired/invalid → fall through and start a fresh one.
      }
    }
    const cart = await createCart(lines, locale);
    await writeCartId(cart.id);
    return { cart };
  } catch (err) {
    return fail(err);
  }
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number,
  lang: string,
): Promise<CartResult> {
  try {
    const id = await readCartId();
    if (!id) return { cart: null, error: "No cart" };
    const locale = toLocale(lang);
    const cart =
      quantity <= 0
        ? await removeCartLines(id, [lineId], locale)
        : await updateCartLines(id, [{ id: lineId, quantity }], locale);
    return { cart };
  } catch (err) {
    return fail(err);
  }
}

export async function removeCartLineAction(lineId: string, lang: string): Promise<CartResult> {
  try {
    const id = await readCartId();
    if (!id) return { cart: null, error: "No cart" };
    return { cart: await removeCartLines(id, [lineId], toLocale(lang)) };
  } catch (err) {
    return fail(err);
  }
}
