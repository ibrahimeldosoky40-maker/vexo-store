"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Smartphone, ZoomIn } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/components/providers/I18nProvider";
import { SaleBadge } from "./Price";
import type { Money, ShopifyImage } from "@/lib/shopify/types";

/**
 * Interactive gallery: zoom-on-hover (pointer follows cursor) with thumbnails.
 * The sale badge overlays the top corner of the main image.
 */
export function ProductGallery({
  images,
  title,
  price,
  compareAtPrice,
  focusUrl,
}: {
  images: ShopifyImage[];
  title: string;
  price: Money;
  compareAtPrice: Money | null;
  /** When the selected variant has its own image, jump to it. */
  focusUrl?: string | null;
}) {
  const { dict } = useI18n();
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusUrl) return;
    const i = images.findIndex((img) => img.url === focusUrl);
    // Sync gallery to the chosen variant image (external prop → local selection)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (i >= 0) setIndex(i);
  }, [focusUrl, images]);

  const current = images[index] ?? images[0] ?? null;

  function onMove(e: React.PointerEvent) {
    if (e.pointerType === "touch") return;
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {images.length > 1 && (
        <ul className="no-scrollbar flex gap-3 overflow-x-auto lg:max-h-[640px] lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-y-auto" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${title} — ${i + 1}`}
                aria-current={i === index}
                className={clsx(
                  "relative block h-20 w-20 overflow-hidden rounded-2xl bg-surface ring-2 transition-all",
                  i === index ? "ring-brand-500" : "ring-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={frame}
        onPointerMove={onMove}
        onPointerLeave={() => setZoom(null)}
        className={clsx(
          "relative aspect-square w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-surface to-surface-2 shadow-soft",
          zoom ? "cursor-zoom-in" : "cursor-default",
        )}
      >
        {current ? (
          <Image
            key={current.url}
            src={current.url}
            alt={current.altText ?? title}
            fill
            priority
            sizes="(min-width:1024px) 50vw, 100vw"
            className="animate-fade-in object-cover transition-transform duration-200 ease-out will-change-transform"
            style={{
              transform: zoom ? "scale(2.1)" : "scale(1)",
              transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "center",
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted/40">
            <Smartphone size={72} strokeWidth={1} />
            <span className="sr-only">{dict.product.noImage}</span>
          </div>
        )}

        <SaleBadge price={price} compareAtPrice={compareAtPrice} className="absolute start-5 top-5 z-10 px-4 py-2 text-sm" />

        <span
          className={clsx(
            "pointer-events-none absolute bottom-4 end-4 hidden items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-ink-soft shadow backdrop-blur transition-opacity lg:flex",
            zoom && "opacity-0",
          )}
        >
          <ZoomIn size={14} /> {dict.product.zoomHint}
        </span>
      </div>
    </div>
  );
}
