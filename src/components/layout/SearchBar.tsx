"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/components/providers/I18nProvider";
import { PriceTag } from "@/components/product/Price";
import type { ProductSummary } from "@/lib/shopify/types";

type Status = "idle" | "loading" | "done" | "error";

export function SearchBar({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const { lang, dict, href, t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const abort = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.clearTimeout(timer.current);
      abort.current?.abort();
    };
  }, []);

  function onChange(value: string) {
    setQuery(value);
    setOpen(true);
    window.clearTimeout(timer.current);
    abort.current?.abort();

    if (value.trim().length < 2) {
      setStatus("idle");
      setResults([]);
      return;
    }
    setStatus("loading");
    timer.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abort.current = controller;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}&lang=${lang}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { products: ProductSummary[] };
        setResults(data.products);
        setStatus("done");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setStatus("error");
      }
    }, 250);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setOpen(false);
    router.push(href(`/search?q=${encodeURIComponent(query.trim())}`));
  }

  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className={clsx("relative", className)}>
      <form onSubmit={submit} role="search" className="relative">
        <Search size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={dict.nav.searchPlaceholder}
          aria-label={dict.nav.search}
          autoComplete="off"
          className="h-11 w-full rounded-full bg-surface ps-11 pe-10 text-sm font-medium text-ink outline-none ring-1 ring-transparent transition-all placeholder:text-muted focus:bg-white focus:ring-brand-500 [&::-webkit-search-cancel-button]:hidden"
        />
        {status === "loading" ? (
          <Loader2 size={16} className="absolute end-4 top-1/2 -translate-y-1/2 animate-spin text-muted" />
        ) : (
          query && (
            <button
              type="button"
              aria-label={dict.nav.close}
              onClick={() => onChange("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-surface-2 hover:text-ink"
            >
              <X size={15} />
            </button>
          )
        )}
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] animate-pop-in overflow-y-auto rounded-3xl bg-white p-2 shadow-lift ring-1 ring-line">
          {status === "loading" && results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted">{dict.nav.searching}</p>
          )}
          {status === "error" && <p className="px-4 py-6 text-center text-sm text-sale">{dict.common.error}</p>}
          {status === "done" && results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted">{t(dict.nav.noResults, { query })}</p>
          )}
          {results.map((p) => (
            <Link
              key={p.id}
              href={href(`/products/${p.handle}`)}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-surface"
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {p.featuredImage && (
                  <Image src={p.featuredImage.url} alt={p.featuredImage.altText ?? p.title} fill sizes="56px" className="object-cover" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{p.title}</span>
                <PriceTag price={p.price} compareAtPrice={p.compareAtPrice} size="sm" />
              </span>
            </Link>
          ))}
          {status === "done" && results.length > 0 && (
            <Link
              href={href(`/search?q=${encodeURIComponent(query.trim())}`)}
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-2xl bg-surface px-4 py-3 text-center text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
            >
              {dict.nav.viewAllResults}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
