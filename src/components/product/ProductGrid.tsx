"use client";

import clsx from "clsx";
import { Smartphone, X } from "lucide-react";
import { useDevice } from "@/components/providers/DeviceProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import type { ProductSummary } from "@/lib/shopify/types";

/**
 * Product grid wired to the global "Select Your Device" filter.
 * If a device is chosen and nothing matches, we say so and fall back to the
 * full list instead of showing an empty page.
 */
export function ProductGrid({
  products,
  className,
  priorityCount = 4,
  columns = "default",
}: {
  products: ProductSummary[];
  className?: string;
  priorityCount?: number;
  columns?: "default" | "compact";
}) {
  const { device, matches, selectDevice, openModal } = useDevice();
  const { dict, t } = useI18n();

  const filtered = device ? products.filter(matches) : products;
  const noMatch = !!device && filtered.length === 0 && products.length > 0;
  const visible = noMatch ? products : filtered;

  return (
    <div>
      {device && (
        <div
          className={clsx(
            "mb-6 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm",
            noMatch ? "bg-amber-soft text-ink" : "bg-brand-50 text-brand-700",
          )}
        >
          <Smartphone size={18} className="shrink-0" />
          <span className="font-medium">
            {noMatch
              ? t(dict.deviceSelector.noMatch, { device: device.label })
              : t(dict.deviceSelector.showingFor, { device: device.label })}
          </span>
          <button type="button" onClick={openModal} className="ms-auto font-semibold underline-offset-4 hover:underline">
            {dict.deviceSelector.change}
          </button>
          <button
            type="button"
            onClick={() => selectDevice(null)}
            aria-label={dict.deviceSelector.clear}
            className="rounded-full p-1 hover:bg-white/60"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div
        className={clsx(
          "grid gap-x-4 gap-y-10 sm:gap-x-6",
          columns === "compact"
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
          className,
        )}
      >
        {visible.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < priorityCount} />
        ))}
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
