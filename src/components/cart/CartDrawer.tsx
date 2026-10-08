"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Lock, Minus, PackageCheck, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import clsx from "clsx";
import { Drawer } from "@/components/ui/Overlays";
import { useCart } from "@/components/providers/CartProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { PriceTag } from "@/components/product/Price";
import { siteConfig } from "@/lib/config";
import { formatMoney, getFreeShippingProgress } from "@/lib/shopify/pricing";
import type { CartLine } from "@/lib/shopify/types";

export function CartButton() {
  const { quantity, openCart } = useCart();
  const { dict } = useI18n();
  return (
    <button type="button" onClick={openCart} className="icon-btn" aria-label={`${dict.nav.cart} (${quantity})`}>
      <ShoppingBag size={21} strokeWidth={1.9} />
      {quantity > 0 && (
        <span
          key={quantity}
          className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] animate-pop-in items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white ring-2 ring-white"
        >
          {quantity}
        </span>
      )}
    </button>
  );
}

/** Dynamic free-shipping progress (threshold: NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD). */
export function FreeShippingBar({ subtotal, currency }: { subtotal: number; currency: string }) {
  const { dict, t, lang } = useI18n();
  const { percent, remaining, unlocked } = getFreeShippingProgress(subtotal, siteConfig.freeShippingThreshold);

  return (
    <div className={clsx("rounded-2xl p-4 transition-colors", unlocked ? "bg-teal-soft" : "bg-surface")}>
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        {unlocked ? <PackageCheck size={18} className="text-teal" /> : <Truck size={18} className="text-brand-600" />}
        {unlocked
          ? dict.cart.freeShippingUnlocked
          : t(dict.cart.freeShippingAway, { amount: formatMoney(remaining, currency, lang) })}
      </p>
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-white shadow-inner"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-teal via-brand-500 to-coral transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        >
          <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(100deg,transparent_30%,rgb(255_255_255/0.5)_50%,transparent_70%)] bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
}

function CartLineItem({ line }: { line: CartLine }) {
  const { href } = useI18n();
  const { updateLine, removeLine, closeCart, pending, } = useCart();
  const { dict } = useI18n();
  const options = line.variant.selectedOptions.filter((o) => o.value !== "Default Title");

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={href(`/products/${line.product.handle}`)}
        onClick={closeCart}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface"
      >
        {line.variant.image && (
          <Image
            src={line.variant.image.url}
            alt={line.variant.image.altText ?? line.product.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={href(`/products/${line.product.handle}`)}
            onClick={closeCart}
            className="line-clamp-2 text-sm font-semibold leading-snug text-ink hover:text-brand-600"
          >
            {line.product.title}
          </Link>
          <button
            type="button"
            onClick={() => removeLine(line.id)}
            disabled={pending}
            aria-label={dict.cart.remove}
            className="-me-1.5 -mt-1 rounded-full p-1.5 text-muted transition-colors hover:bg-sale-soft hover:text-sale disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
        {options.length > 0 && (
          <p className="mt-0.5 truncate text-xs text-muted">{options.map((o) => o.value).join(" · ")}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="inline-flex items-center rounded-full bg-surface p-1">
            <button
              type="button"
              aria-label={dict.cart.decrease}
              disabled={pending}
              onClick={() => updateLine(line.id, line.quantity - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white disabled:opacity-50"
            >
              <Minus size={14} />
            </button>
            <span className="w-7 text-center text-sm font-bold tabular-nums">{line.quantity}</span>
            <button
              type="button"
              aria-label={dict.cart.increase}
              disabled={pending}
              onClick={() => updateLine(line.id, line.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white disabled:opacity-50"
            >
              <Plus size={14} />
            </button>
          </div>
          <PriceTag
            price={line.cost.perUnit}
            compareAtPrice={line.cost.compareAtPerUnit}
            size="sm"
            className="justify-end"
          />
        </div>
      </div>
    </li>
  );
}

/** Slide-out cart. "Add to cart" opens this — there is no separate cart page. */
export function CartDrawer() {
  const { cart, isOpen, closeCart, pending, error } = useCart();
  const { dict, href, lang } = useI18n();
  const [redirecting, setRedirecting] = useState(false);
  const lines = cart?.lines ?? [];
  const currency = cart?.subtotal.currencyCode ?? "USD";

  function checkout() {
    if (!cart) return;
    setRedirecting(true);
    // Native Shopify checkout (secure, hosted by Shopify).
    window.location.assign(cart.checkoutUrl);
  }

  return (
    <Drawer open={isOpen} onClose={closeCart} side="end" label={dict.cart.title} closeLabel={dict.nav.close} bare className="w-[min(96vw,28rem)]">
      <header className="flex items-center justify-between border-b border-line px-6 py-5">
        <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-ink">
          {dict.cart.title}
          {cart && cart.totalQuantity > 0 && (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-bold text-brand-600">{cart.totalQuantity}</span>
          )}
        </h2>
        <button type="button" onClick={closeCart} aria-label={dict.nav.close} className="icon-btn">
          <span className="text-2xl leading-none">×</span>
        </button>
      </header>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-50 to-teal-soft text-brand-600">
            <ShoppingBag size={38} strokeWidth={1.5} />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-ink">{dict.cart.empty}</p>
            <p className="mt-1 text-sm text-muted">{dict.cart.emptyText}</p>
          </div>
          <Link href={href("/collections/all")} onClick={closeCart} className="btn btn-primary mt-2">
            {dict.cart.continueShopping}
          </Link>
        </div>
      ) : (
        <>
          <div className="px-6 pt-5">
            <FreeShippingBar subtotal={parseFloat(cart!.subtotal.amount)} currency={currency} />
          </div>

          <ul className={clsx("flex-1 divide-y divide-line overflow-y-auto px-6 transition-opacity", pending && "opacity-60")}>
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </ul>

          <footer className="space-y-3 border-t border-line bg-white px-6 pb-6 pt-5 shadow-[0_-12px_24px_-16px_rgb(13_27_61/0.2)]">
            {error && <p className="rounded-xl bg-sale-soft px-3 py-2 text-sm font-medium text-sale">{error}</p>}
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-ink-soft">{dict.cart.subtotal}</span>
              <span className="font-display text-2xl font-bold tabular-nums text-ink">
                {formatMoney(cart!.subtotal, currency, lang)}
              </span>
            </div>
            <p className="text-xs text-muted">{dict.cart.taxNote}</p>
            <button type="button" onClick={checkout} disabled={pending || redirecting} className="btn btn-primary w-full py-4 text-base">
              {redirecting ? <Loader2 size={18} className="animate-spin" /> : <Lock size={17} />}
              {redirecting ? dict.cart.redirecting : dict.cart.checkout}
            </button>
          </footer>
        </>
      )}
    </Drawer>
  );
}
