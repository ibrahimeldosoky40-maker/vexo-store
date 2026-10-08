"use client";

import { Check } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Product, ProductOption, ProductVariant } from "@/lib/shopify/types";

export type OptionSelection = Record<string, string>;

const COLOR_OPTION = /colou?r/i;
const DEVICE_OPTION = /device|model|compat|phone|watch|fit|laptop|size/i;

/** Maps common colour words to CSS when Shopify has no swatch configured. */
const NAMED_COLORS: Record<string, string> = {
  black: "#111827", white: "#f8fafc", red: "#e11d48", blue: "#2563eb", navy: "#0d1b3d",
  green: "#16a34a", teal: "#2bbfc4", mint: "#86e0c0", pink: "#f472b6", purple: "#9333ea",
  lavender: "#c4b5fd", yellow: "#fbbf24", amber: "#fbb034", orange: "#f97316", coral: "#f2735a",
  gray: "#9ca3af", grey: "#9ca3af", silver: "#cbd5e1", gold: "#d4a017", brown: "#92400e",
  beige: "#e7d8c3", clear: "#e6f1f5", transparent: "#e6f1f5", titanium: "#a8a29e",
};

function swatchStyle(option: ProductOption, value: string): React.CSSProperties | null {
  const v = option.values.find((x) => x.name === value);
  if (v?.swatchImage) return { backgroundImage: `url(${v.swatchImage})`, backgroundSize: "cover" };
  if (v?.swatchColor) return { background: v.swatchColor };
  const named = NAMED_COLORS[value.trim().toLowerCase()];
  return named ? { background: named } : null;
}

/** Is there a purchasable variant when `name=value` is combined with the rest of the selection? */
function isAvailable(variants: ProductVariant[], selection: OptionSelection, name: string, value: string) {
  return variants.some(
    (v) =>
      v.availableForSale &&
      v.selectedOptions.every((o) => (o.name === name ? o.value === value : (selection[o.name] ?? o.value) === o.value)),
  );
}

export function findVariant(variants: ProductVariant[], selection: OptionSelection) {
  return variants.find((v) => v.selectedOptions.every((o) => selection[o.name] === o.value));
}

export function initialSelection(product: Product): OptionSelection {
  const start = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  return Object.fromEntries((start?.selectedOptions ?? []).map((o) => [o.name, o.value]));
}

/**
 * Visual variant selectors: colour swatches and device-compatibility pills.
 * Unavailable combinations are struck through but remain selectable so the
 * customer can see the sold-out state.
 */
export function VariantSelectors({
  product,
  selection,
  onChange,
}: {
  product: Product;
  selection: OptionSelection;
  onChange: (name: string, value: string) => void;
}) {
  const { dict, t } = useI18n();

  const options = product.options.filter(
    (o) => !(o.values.length === 1 && o.values[0].name === "Default Title"),
  );
  if (options.length === 0) return null;

  return (
    <div className="space-y-7">
      {options.map((option) => {
        const isColor = COLOR_OPTION.test(option.name);
        const isDevice = DEVICE_OPTION.test(option.name);
        const label = isColor ? dict.product.color : isDevice ? dict.product.compatibility : option.name;
        const selected = selection[option.name];

        return (
          <fieldset key={option.id}>
            <legend className="mb-3 flex items-baseline gap-2 text-sm font-bold text-ink">
              {label}
              {selected && (
                <span className="text-sm font-medium text-muted">{t(dict.product.selectedOption, { value: selected })}</span>
              )}
            </legend>

            <div className="flex flex-wrap gap-2.5">
              {option.values.map((value) => {
                const active = selected === value.name;
                const available = isAvailable(product.variants, selection, option.name, value.name);
                const swatch = isColor ? swatchStyle(option, value.name) : null;

                if (swatch) {
                  return (
                    <button
                      key={value.name}
                      type="button"
                      title={value.name}
                      aria-label={value.name}
                      aria-pressed={active}
                      onClick={() => onChange(option.name, value.name)}
                      className={clsx(
                        "relative h-11 w-11 rounded-full ring-offset-2 transition-all hover:scale-110",
                        active ? "ring-2 ring-brand-500" : "ring-1 ring-line",
                        !available && "opacity-40",
                      )}
                      style={swatch}
                    >
                      {active && (
                        <Check size={18} strokeWidth={3} className="absolute inset-0 m-auto text-white mix-blend-difference" />
                      )}
                      {!available && <span className="absolute inset-0 m-auto h-[2px] w-[130%] -translate-x-[11%] rotate-45 bg-ink/60" />}
                    </button>
                  );
                }

                return (
                  <button
                    key={value.name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange(option.name, value.name)}
                    className={clsx(
                      "relative inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 text-sm font-semibold transition-all",
                      active
                        ? "bg-ink text-white shadow-[0_10px_22px_-10px_rgb(13_27_61/0.8)]"
                        : "bg-white text-ink ring-1 ring-line hover:ring-ink",
                      !available && !active && "text-muted line-through opacity-60",
                    )}
                  >
                    {active && <Check size={15} strokeWidth={3} />}
                    {value.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
