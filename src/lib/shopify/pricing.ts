import type { Money } from "./types";

export interface SaleInfo {
  onSale: boolean;
  /** Whole-number percentage, e.g. 20 for "-20% OFF". */
  percentOff: number;
  /** Absolute savings in store currency. */
  savings: number;
  badge: string | null;
}

const NO_SALE: SaleInfo = { onSale: false, percentOff: 0, savings: 0, badge: null };

/**
 * Single source of truth for discount logic (grid, PDP, cart).
 * Shopify returns "0.0" when no compare-at price exists, so anything not
 * strictly greater than the current price is treated as "not on sale".
 */
export function getSaleInfo(
  price: Money | null | undefined,
  compareAtPrice: Money | null | undefined,
): SaleInfo {
  if (!price || !compareAtPrice) return NO_SALE;
  const current = parseFloat(price.amount);
  const original = parseFloat(compareAtPrice.amount);
  if (!Number.isFinite(current) || !Number.isFinite(original)) return NO_SALE;
  if (original <= 0 || original <= current) return NO_SALE;

  const percentOff = Math.round(((original - current) / original) * 100);
  // A sub-0.5% discount would round to 0 — don't show a meaningless badge.
  if (percentOff < 1) return NO_SALE;

  return {
    onSale: true,
    percentOff,
    savings: original - current,
    badge: `-${percentOff}% OFF`,
  };
}

/** Normalise Shopify's "0.0" compare-at placeholder to null. */
export function normaliseCompareAt(
  price: Money,
  compareAt: Money | null | undefined,
): Money | null {
  return getSaleInfo(price, compareAt).onSale ? (compareAt as Money) : null;
}

export function formatMoney(money: Money | number, currencyCode = "USD", locale = "en"): string {
  const amount = typeof money === "number" ? money : parseFloat(money.amount);
  const currency = typeof money === "number" ? currencyCode : money.currencyCode;
  const intlLocale = locale === "ar" ? "ar-EG-u-nu-latn" : "en-US";
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
    // Whole-dollar prices render as "$100", others as "$12.99"
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export interface FreeShippingProgress {
  /** 0–100 */
  percent: number;
  remaining: number;
  unlocked: boolean;
}

export function getFreeShippingProgress(subtotal: number, threshold: number): FreeShippingProgress {
  if (threshold <= 0) return { percent: 100, remaining: 0, unlocked: true };
  const remaining = Math.max(threshold - subtotal, 0);
  return {
    percent: Math.min((subtotal / threshold) * 100, 100),
    remaining,
    unlocked: remaining === 0,
  };
}
