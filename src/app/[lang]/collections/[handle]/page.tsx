import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/home/Sections";
import { ProductGrid } from "@/components/product/ProductGrid";
import { isLocale, localizePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { shopifySafe } from "@/lib/shopify/client";
import { getCollectionProducts, getProducts } from "@/lib/shopify/queries";
import type { ProductSummary } from "@/lib/shopify/types";

const humanize = (slug: string) =>
  slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

/**
 * Collection listing. Handles three cases:
 *  - `/collections/all` → every product
 *  - an existing Shopify collection (optionally narrowed by `?device=` tag)
 *  - a menu slug with no collection yet → empty state (catalogue is still being built)
 */
async function loadListing(handle: string, device: string | undefined, lang: "en" | "ar") {
  if (handle === "all") {
    const res = await shopifySafe(() => getProducts({ locale: lang, first: 48 }));
    return { title: null as string | null, description: "", products: res.data?.products ?? ([] as ProductSummary[]), error: res.error };
  }

  const res = await shopifySafe(() => getCollectionProducts({ handle, locale: lang, first: 48, tag: device }));
  if (res.error) return { title: null, description: "", products: [], error: res.error };
  if (res.data) {
    return { title: res.data.collection.title, description: res.data.collection.description, products: res.data.products, error: null };
  }
  return { title: null, description: "", products: [], error: null };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/collections/[handle]">): Promise<Metadata> {
  const { lang, handle } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: handle === "all" ? dict.collection.all : humanize(handle),
    alternates: { canonical: localizePath(lang, `/collections/${handle}`) },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/[lang]/collections/[handle]">) {
  const { lang, handle } = await params;
  if (!isLocale(lang)) notFound();
  const query = await searchParams;
  const device = typeof query.device === "string" ? query.device : undefined;
  const brand = typeof query.brand === "string" ? query.brand : undefined;

  const dict = await getDictionary(lang);
  const listing = await loadListing(handle, device, lang);

  const heading =
    listing.title ??
    (handle === "all" ? dict.collection.all : humanize(device ? device : brand ? `${brand}` : handle));
  const subheading = device || brand ? humanize(handle) : null;

  return (
    <div className="container-x pb-10 pt-8 sm:pt-12">
      <header className="mb-10 rounded-[2rem] bg-gradient-to-br from-brand-50 via-white to-teal-soft px-6 py-10 sm:px-12 sm:py-14">
        {subheading && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{subheading}</p>}
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{heading}</h1>
        {listing.description && <p className="mt-3 max-w-2xl text-ink-soft">{listing.description}</p>}
        {!listing.error && listing.products.length > 0 && (
          <p className="mt-4 text-sm font-semibold text-muted">
            {dict.collection.products.replace("{count}", String(listing.products.length))}
          </p>
        )}
      </header>

      {listing.error ? (
        <ErrorState message={dict.collection.loadError} retryLabel={dict.common.retry} retryHref={localizePath(lang, `/collections/${handle}`)} />
      ) : listing.products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-surface px-6 py-20 text-center">
          <p className="font-display text-2xl font-bold text-ink">{dict.collection.empty}</p>
          <p className="mx-auto mt-2 max-w-md text-muted">{dict.collection.emptyText}</p>
          <Link href={localizePath(lang, "/collections/all")} className="btn btn-primary mt-7">
            {dict.collection.all}
          </Link>
        </div>
      ) : (
        <ProductGrid products={listing.products} columns="compact" />
      )}
    </div>
  );
}
