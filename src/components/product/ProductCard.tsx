"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Smartphone } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { PriceTag, SaleBadge } from "./Price";
import type { ProductSummary } from "@/lib/shopify/types";

interface ProductCardProps {
  product: ProductSummary;
  /** Eager-load the image (above the fold). */
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width:1280px) 22vw, (min-width:768px) 30vw, 46vw",
  className,
}: ProductCardProps) {
  const { href, dict } = useI18n();
  const primary = product.featuredImage ?? product.images[0] ?? null;
  // Second image powers the hover swap; fall back to nothing (no swap) if absent.
  const secondary = product.images.find((img) => img.url !== primary?.url) ?? null;

  return (
    <article
      className={clsx(
        "group relative flex flex-col rounded-3xl bg-white transition-all duration-300 hover:-translate-y-1.5",
        className,
      )}
    >
      <Link
        href={href(`/products/${product.handle}`)}
        className="relative block aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-surface to-surface-2 shadow-soft transition-shadow duration-300 group-hover:shadow-lift"
        aria-label={product.title}
      >
        {primary ? (
          <Image
            src={primary.url}
            alt={primary.altText ?? product.title}
            fill
            sizes={sizes}
            priority={priority}
            className={clsx(
              "object-cover transition-all duration-700 ease-out",
              secondary ? "group-hover:opacity-0" : "group-hover:scale-105",
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted/40">
            <Smartphone size={48} strokeWidth={1.25} />
          </div>
        )}
        {secondary && (
          <Image
            src={secondary.url}
            alt={secondary.altText ?? product.title}
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
          />
        )}

        <SaleBadge
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          className="absolute start-3 top-3 z-10"
        />

        {!product.availableForSale && (
          <span className="absolute end-3 top-3 z-10 rounded-full bg-ink/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            {dict.product.soldOut}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 px-1.5 pb-1 pt-4">
        {product.vendor && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {product.vendor}
          </p>
        )}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug text-ink">
          <Link href={href(`/products/${product.handle}`)} className="hover:text-brand-600">
            {product.title}
          </Link>
        </h3>
        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton aspect-[4/5] rounded-3xl" />
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-4 w-4/5" />
      <div className="skeleton h-4 w-1/4" />
    </div>
  );
}
