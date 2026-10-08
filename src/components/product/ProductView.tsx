"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, RotateCcw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { FrequentlyBoughtTogether } from "./FrequentlyBoughtTogether";
import { PriceTag } from "./Price";
import { ProductGallery } from "./ProductGallery";
import { VariantSelectors, findVariant, initialSelection, type OptionSelection } from "./VariantSelectors";
import { getSaleInfo, formatMoney } from "@/lib/shopify/pricing";
import type { Product, ProductSummary } from "@/lib/shopify/types";

const PERK_ICONS = [Truck, RotateCcw, ShieldCheck];

export function ProductView({ product, crossSell }: { product: Product; crossSell: ProductSummary[] }) {
  const { dict, lang } = useI18n();
  const { addLines, pending } = useCart();

  const [selection, setSelection] = useState<OptionSelection>(() => initialSelection(product));
  const [justAdded, setJustAdded] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(true);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const variant = findVariant(product.variants, selection) ?? product.variants[0];
  const price = variant?.price ?? product.price;
  const compareAt = variant ? variant.compareAtPrice : product.compareAtPrice;
  const available = variant?.availableForSale ?? product.availableForSale;
  const sale = getSaleInfo(price, compareAt);

  // Show the sticky mobile bar only once the main CTA scrolls out of view.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  async function addToCart() {
    if (!variant || !available || pending) return;
    const ok = await addLines([{ merchandiseId: variant.id, quantity: 1 }]);
    if (ok) {
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 2000);
    }
  }

  const ctaLabel = !available
    ? dict.product.soldOut
    : pending
      ? dict.product.adding
      : dict.product.addToCart;

  const CtaIcon = pending ? Loader2 : justAdded ? Check : ShoppingBag;

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery
          images={product.allImages.length ? product.allImages : product.images}
          title={product.title}
          price={price}
          compareAtPrice={compareAt}
          focusUrl={variant?.image?.url}
        />

        <div className="lg:py-4">
          {product.vendor && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{product.vendor}</p>
          )}
          <h1 className="font-display mt-2 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <PriceTag price={price} compareAtPrice={compareAt} size="lg" />
            {sale.onSale && (
              <span className="rounded-full bg-sale-soft px-3 py-1 text-sm font-bold text-sale">
                − {formatMoney(sale.savings, price.currencyCode, lang)}
              </span>
            )}
          </div>

          <div className="mt-8">
            <VariantSelectors
              product={product}
              selection={selection}
              onChange={(name, value) => setSelection((s) => ({ ...s, [name]: value }))}
            />
          </div>

          <button
            ref={ctaRef}
            type="button"
            onClick={addToCart}
            disabled={!available || pending}
            className={clsx("btn btn-primary mt-9 w-full py-[1.15rem] text-base", justAdded && "!bg-success")}
          >
            <CtaIcon size={19} className={clsx(pending && "animate-spin")} />
            {justAdded ? "✓" : ctaLabel}
          </button>

          <ul className="mt-6 grid grid-cols-3 gap-2 text-center">
            {dict.product.perks.map((perk, i) => {
              const Icon = PERK_ICONS[i] ?? Truck;
              return (
                <li key={perk} className="flex flex-col items-center gap-2 rounded-2xl bg-surface px-2 py-3.5">
                  <Icon size={20} className="text-brand-600" />
                  <span className="text-xs font-semibold leading-tight text-ink-soft">{perk}</span>
                </li>
              );
            })}
          </ul>

          {product.descriptionHtml && (
            <div className="mt-10 border-t border-line pt-8">
              <h2 className="mb-3 font-display text-lg font-bold text-ink">{dict.product.description}</h2>
              <div className="prose-vexo" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-20">
        <FrequentlyBoughtTogether
          current={{
            title: product.title,
            image: variant?.image ?? product.featuredImage,
            price,
            compareAtPrice: compareAt,
            variantId: variant?.id ?? null,
            available,
          }}
          items={crossSell}
        />
      </div>

      {/* Sticky Add-to-Cart (mobile) */}
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_32px_-12px_rgb(13_27_61/0.25)] backdrop-blur transition-transform duration-300 lg:hidden",
          ctaVisible ? "translate-y-full" : "translate-y-0",
        )}
        aria-hidden={ctaVisible}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted">{product.title}</p>
            <PriceTag price={price} compareAtPrice={compareAt} size="md" />
          </div>
          <button
            type="button"
            onClick={addToCart}
            disabled={!available || pending}
            tabIndex={ctaVisible ? -1 : 0}
            className="btn btn-primary shrink-0 px-7 py-3.5"
          >
            <CtaIcon size={18} className={clsx(pending && "animate-spin")} />
            {justAdded ? "✓" : ctaLabel}
          </button>
        </div>
      </div>
    </>
  );
}
