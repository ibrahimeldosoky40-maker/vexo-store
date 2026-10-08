"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/components/providers/I18nProvider";
import type { MenuItem } from "@/lib/shopify/types";

const MAX_DEVICES_PER_BRAND = 7;

/**
 * Desktop mega panel for one top-level category:
 *   Level 1 (category) = the nav trigger
 *   Level 2 (brand)    = column headings
 *   Level 3 (device)   = links under each brand
 */
export function MegaPanel({ item, onNavigate }: { item: MenuItem; onNavigate: () => void }) {
  const { href, dict, t } = useI18n();
  const brands = item.children;

  return (
    <div className="container-x py-8">
      <div className="grid gap-8 xl:grid-cols-[1fr_17rem]">
        <div
          className={clsx(
            "grid gap-x-8 gap-y-8",
            brands.length >= 3 ? "grid-cols-3" : brands.length === 2 ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {brands.map((brand) => (
            <div key={brand.id}>
              <Link
                href={href(brand.path)}
                onClick={onNavigate}
                className="group mb-3 inline-flex items-center gap-1.5 font-display text-[15px] font-bold text-ink"
              >
                <span className="h-5 w-1 rounded-full bg-gradient-to-b from-teal to-brand-500" />
                {brand.title}
                <ChevronRight
                  size={15}
                  className="text-muted transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                />
              </Link>
              <ul className="space-y-0.5">
                {brand.children.slice(0, MAX_DEVICES_PER_BRAND).map((device) => (
                  <li key={device.id}>
                    <Link
                      href={href(device.path)}
                      onClick={onNavigate}
                      className="block rounded-lg px-2.5 py-1.5 text-sm text-ink-soft transition-all hover:bg-brand-50 hover:text-brand-700 hover:ps-4"
                    >
                      {device.title}
                    </Link>
                  </li>
                ))}
                {brand.children.length > MAX_DEVICES_PER_BRAND && (
                  <li>
                    <Link
                      href={href(brand.path)}
                      onClick={onNavigate}
                      className="block px-2.5 py-1.5 text-sm font-semibold text-brand-600 hover:underline"
                    >
                      {t(dict.nav.viewAll, { name: brand.title })}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <Link
          href={href(item.path)}
          onClick={onNavigate}
          className="group relative hidden overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-teal p-7 text-white xl:flex xl:flex-col xl:justify-end"
        >
          <span className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-amber/40 blur-2xl transition-transform duration-700 group-hover:scale-125" />
          <span className="pointer-events-none absolute -bottom-12 -start-8 h-36 w-36 rounded-full bg-coral/40 blur-2xl transition-transform duration-700 group-hover:scale-125" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{dict.nav.browse}</p>
          <p className="relative mt-1 font-display text-2xl font-bold leading-tight">{item.title}</p>
          <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold">
            {t(dict.nav.viewAll, { name: item.title })}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
          </span>
        </Link>
      </div>
    </div>
  );
}
