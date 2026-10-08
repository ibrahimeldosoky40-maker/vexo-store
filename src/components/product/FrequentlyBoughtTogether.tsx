"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, Plus, ShoppingBag, Smartphone } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { PriceTag } from "./Price";
import { formatMoney, getSaleInfo } from "@/lib/shopify/pricing";
import type { Money, ProductSummary, ShopifyImage } from "@/lib/shopify/types";

interface Bundle {
  key: string;
  title: string;
  handle: string | null;
  image: ShopifyImage | null;
  price: Money;
  compareAtPrice: Money | null;
  variantId: string | null;
  available: boolean;
}

/** Cross-sell: complementary items that can be added to the cart in one click. */
export function FrequentlyBoughtTogether({
  current,
  items,
}: {
  current: {
    title: string;
    image: ShopifyImage | null;
    price: Money;
    compareAtPrice: Money | null;
    variantId: string | null;
    available: boolean;
  };
  items: ProductSummary[];
}) {
  const { dict, href, t, lang } = useI18n();
  const { addLines, pending } = useCart();

  const bundle = useMemo<Bundle[]>(
    () => [
      {
        key: "current",
        title: current.title,
        handle: null,
        image: current.image,
        price: current.price,
        compareAtPrice: current.compareAtPrice,
        variantId: current.variantId,
        available: current.available,
      },
      ...items
        .filter((p) => p.defaultVariantId && p.availableForSale)
        .slice(0, 3)
        .map((p) => ({
          key: p.id,
          title: p.title,
          handle: p.handle,
          image: p.featuredImage,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          variantId: p.defaultVariantId,
          available: p.availableForSale,
        })),
    ],
    [current, items],
  );

  const [unchecked, setUnchecked] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);

  if (bundle.length < 2) return null;

  const chosen = bundle.filter((b) => !unchecked.has(b.key) && b.variantId && b.available);
  const currency = bundle[0].price.currencyCode;
  const total = chosen.reduce((sum, b) => sum + parseFloat(b.price.amount), 0);
  const original = chosen.reduce(
    (sum, b) => sum + parseFloat((getSaleInfo(b.price, b.compareAtPrice).onSale ? b.compareAtPrice! : b.price).amount),
    0,
  );

  const toggle = (key: string) =>
    setUnchecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  async function addAll() {
    const ok = await addLines(chosen.map((b) => ({ merchandiseId: b.variantId!, quantity: 1 })));
    if (ok) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2200);
    }
  }

  return (
    <section className="rounded-[2rem] bg-surface p-6 sm:p-10" aria-labelledby="fbt-title">
      <h2 id="fbt-title" className="font-display text-2xl font-bold text-ink sm:text-3xl">
        {dict.product.frequentlyBoughtTogether}
      </h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-center">
        <div>
          {/* Visual strip: image + image + image */}
          <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
            {bundle.map((b, i) => (
              <li key={b.key} className="flex items-center gap-2 sm:gap-3">
                {i > 0 && <Plus size={22} className="text-muted" />}
                <div
                  className={clsx(
                    "relative h-24 w-24 overflow-hidden rounded-2xl bg-white shadow-soft transition-all sm:h-32 sm:w-32",
                    unchecked.has(b.key) && "opacity-35 grayscale",
                  )}
                >
                  {b.image ? (
                    <Image src={b.image.url} alt={b.image.altText ?? b.title} fill sizes="128px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted/40"><Smartphone size={32} /></div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Checklist */}
          <ul className="mt-7 space-y-2.5">
            {bundle.map((b, i) => {
              const checked = !unchecked.has(b.key);
              return (
                <li key={b.key}>
                  <label
                    className={clsx(
                      "flex cursor-pointer items-center gap-3.5 rounded-2xl bg-white px-4 py-3 ring-1 transition-all",
                      checked ? "ring-brand-500/40" : "ring-line",
                      i === 0 && "cursor-default",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={i === 0}
                      onChange={() => toggle(b.key)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className={clsx(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                        checked ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white",
                      )}
                    >
                      {checked && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
                      {i === 0 && <span className="me-1.5 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{dict.product.thisItem}</span>}
                      {b.handle ? (
                        <Link href={href(`/products/${b.handle}`)} className="hover:text-brand-600">{b.title}</Link>
                      ) : (
                        b.title
                      )}
                    </span>
                    <PriceTag price={b.price} compareAtPrice={b.compareAtPrice} size="sm" className="shrink-0 justify-end" />
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-muted">{dict.product.total}</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold tabular-nums text-ink">{formatMoney(total, currency, lang)}</span>
            {original > total + 0.001 && (
              <del className="text-base font-medium tabular-nums text-muted/80">{formatMoney(original, currency, lang)}</del>
            )}
          </div>
          <button
            type="button"
            onClick={addAll}
            disabled={chosen.length === 0 || pending}
            className="btn btn-primary mt-5 w-full py-4"
          >
            {pending ? <Loader2 size={18} className="animate-spin" /> : added ? <Check size={18} /> : <ShoppingBag size={18} />}
            {t(dict.product.addSelected, { count: chosen.length })}
          </button>
        </div>
      </div>
    </section>
  );
}
