"use client";

import clsx from "clsx";
import { useI18n } from "@/components/providers/I18nProvider";
import { formatMoney, getSaleInfo } from "@/lib/shopify/pricing";
import type { Money } from "@/lib/shopify/types";

/**
 * Discount presentation (spec §6). Every price in the storefront goes through
 * these two components so the rules stay consistent in the grid, PDP and cart:
 *  - compareAtPrice > price → strikethrough muted original + bold red current price
 *  - "-X% OFF" badge overlaid on the top corner of the product image
 */
export function SaleBadge({
  price,
  compareAtPrice,
  className,
}: {
  price: Money;
  compareAtPrice: Money | null;
  className?: string;
}) {
  const { dict, t } = useI18n();
  const sale = getSaleInfo(price, compareAtPrice);
  if (!sale.onSale) return null;

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full bg-sale px-3 py-1.5 text-xs font-extrabold tracking-wide text-white",
        "shadow-[0_8px_20px_-6px_rgb(225_29_72/0.6)]",
        className,
      )}
      aria-label={`${dict.product.sale}: ${t(dict.product.off, { percent: sale.percentOff })}`}
    >
      {t(dict.product.off, { percent: sale.percentOff })}
    </span>
  );
}

export function PriceTag({
  price,
  compareAtPrice,
  size = "md",
  className,
}: {
  price: Money;
  compareAtPrice: Money | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { lang } = useI18n();
  const sale = getSaleInfo(price, compareAtPrice);

  const current = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-3xl",
  }[size];
  const original = { sm: "text-xs", md: "text-sm", lg: "text-lg" }[size];

  return (
    <div className={clsx("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span
        className={clsx(
          "font-bold tabular-nums",
          current,
          sale.onSale ? "text-sale" : "text-ink",
        )}
      >
        {formatMoney(price, price.currencyCode, lang)}
      </span>
      {sale.onSale && compareAtPrice && (
        <del className={clsx("font-medium tabular-nums text-muted/80", original)}>
          {formatMoney(compareAtPrice, compareAtPrice.currencyCode, lang)}
        </del>
      )}
    </div>
  );
}
