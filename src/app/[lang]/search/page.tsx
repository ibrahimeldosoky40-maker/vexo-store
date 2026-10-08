import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/home/Sections";
import { ProductGrid } from "@/components/product/ProductGrid";
import { isLocale, localizePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { shopifySafe } from "@/lib/shopify/client";
import { getProducts } from "@/lib/shopify/queries";

export const metadata: Metadata = { robots: { index: false } };

export default async function SearchPage({ params, searchParams }: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { q } = await searchParams;
  const term = (typeof q === "string" ? q : "").trim().slice(0, 80);
  const dict = await getDictionary(lang);

  // Escape quotes so user input can't break out of the Shopify search expression.
  const safe = term.replace(/["\\]/g, " ");
  const result = term
    ? await shopifySafe(() =>
        getProducts({ locale: lang, first: 48, sortKey: "RELEVANCE", query: `title:*${safe}* OR tag:"${safe}" OR product_type:"${safe}" OR vendor:"${safe}"` }),
      )
    : null;

  return (
    <div className="container-x pb-10 pt-8 sm:pt-12">
      <h1 className="font-display mb-10 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {term ? dict.collection.searchResults.replace("{query}", term) : dict.nav.search}
      </h1>

      {result?.error ? (
        <ErrorState message={dict.common.error} retryLabel={dict.common.retry} retryHref={localizePath(lang, `/search?q=${encodeURIComponent(term)}`)} />
      ) : !result || result.data.products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-surface px-6 py-20 text-center">
          <p className="font-display text-2xl font-bold text-ink">
            {term ? dict.nav.noResults.replace("{query}", term) : dict.nav.searchPlaceholder}
          </p>
          <Link href={localizePath(lang, "/collections/all")} className="btn btn-primary mt-7">
            {dict.collection.all}
          </Link>
        </div>
      ) : (
        <ProductGrid products={result.data.products} columns="compact" />
      )}
    </div>
  );
}
