import { shopifyFetch } from "./client";
import { CART_FIELDS } from "./fragments";
import { reshapeCart } from "./reshape";
import type { Locale } from "@/lib/i18n/config";
import type { Cart } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;

/**
 * Cart operations. Carts are never cached. These are *write* operations
 * (they create/modify a Storefront cart) — wire them to the UI only via
 * server actions, e.g. `src/app/actions/cart.ts`.
 */
const LANG = "$language: LanguageCode";
const CTX = "@inContext(language: $language)";

function unwrap(payload: Raw, key: string): Cart {
  const result = payload[key];
  const userErrors: { message: string }[] = result?.userErrors ?? [];
  if (userErrors.length) throw new Error(userErrors.map((e) => e.message).join("; "));
  if (!result?.cart) throw new Error("Cart not found or expired");
  return reshapeCart(result.cart);
}

export async function getCart(cartId: string, locale?: Locale): Promise<Cart | null> {
  const data = await shopifyFetch<Raw>({
    locale,
    revalidate: false,
    variables: { cartId },
    query: /* GraphQL */ `
      ${CART_FIELDS}
      query Cart(${LANG}, $cartId: ID!) ${CTX} {
        cart(id: $cartId) { ...CartFields }
      }
    `,
  });
  return data.cart ? reshapeCart(data.cart) : null;
}

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[] = [],
  locale?: Locale,
): Promise<Cart> {
  const data = await shopifyFetch<Raw>({
    locale,
    revalidate: false,
    variables: { lines },
    query: /* GraphQL */ `
      ${CART_FIELDS}
      mutation CartCreate(${LANG}, $lines: [CartLineInput!]) ${CTX} {
        cartCreate(input: { lines: $lines }) {
          cart { ...CartFields }
          userErrors { message }
        }
      }
    `,
  });
  return unwrap(data, "cartCreate");
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
  locale?: Locale,
): Promise<Cart> {
  const data = await shopifyFetch<Raw>({
    locale,
    revalidate: false,
    variables: { cartId, lines },
    query: /* GraphQL */ `
      ${CART_FIELDS}
      mutation CartLinesAdd(${LANG}, $cartId: ID!, $lines: [CartLineInput!]!) ${CTX} {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart { ...CartFields }
          userErrors { message }
        }
      }
    `,
  });
  return unwrap(data, "cartLinesAdd");
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
  locale?: Locale,
): Promise<Cart> {
  const data = await shopifyFetch<Raw>({
    locale,
    revalidate: false,
    variables: { cartId, lines },
    query: /* GraphQL */ `
      ${CART_FIELDS}
      mutation CartLinesUpdate(${LANG}, $cartId: ID!, $lines: [CartLineUpdateInput!]!) ${CTX} {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart { ...CartFields }
          userErrors { message }
        }
      }
    `,
  });
  return unwrap(data, "cartLinesUpdate");
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
  locale?: Locale,
): Promise<Cart> {
  const data = await shopifyFetch<Raw>({
    locale,
    revalidate: false,
    variables: { cartId, lineIds },
    query: /* GraphQL */ `
      ${CART_FIELDS}
      mutation CartLinesRemove(${LANG}, $cartId: ID!, $lineIds: [ID!]!) ${CTX} {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart { ...CartFields }
          userErrors { message }
        }
      }
    `,
  });
  return unwrap(data, "cartLinesRemove");
}
